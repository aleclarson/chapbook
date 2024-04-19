import {jaroWinkler} from '@skyra/jaro-winkler';
import builtinVariables from './builtin-variables';
import jsKeywords from './js-keywords';

type TwineVariablesExtension = {
	/** Reserved words cannot be used as variable names. */
	reservedWords?: string[];
	/** Used in variable auto-completion and to find variable references in passage text. */
	validNameRegex?: RegExp;
	/**
	 * Used to identify areas in the passage text where variables might be referenced. Every capture
	 * group is searched for variable references.
	 */
	expressionRegex?: RegExp;
	/**
	 * Suggest variable names for auto-completion. If this is not defined, the default behavior is to
	 * sort the variable names by Jaro-Winkler similarity.
	 */
	suggestVariableName?: (variableNames: string[], query: string) => string[];
	/**
	 * Variable definitions are parsed from all passages, for auto-completion and validation.
	 */
	parseDefinitions?: (text: string) => (string | VariableDefinition)[];
};

type VariableDefinition = {
	name: string;
	position: { line: number; ch: number };
	expression: string;
	local?: boolean;
};

const extension: TwineVariablesExtension = {
	validNameRegex: /\b(?:[a-zA-Z_][a-zA-Z0-9_]*)(?:\.[a-zA-Z_][a-zA-Z0-9_]*)*\b/,
	expressionRegex:
		/(?:\[(?:if|ifalways|ifnever|unless) ([^;]*?)\]|{([^:}]+)}|{(?:cycling link|dropdown menu|text input) for: '([^']+)'|(?:^|\n)(?:[a-zA-Z_][a-zA-Z0-9_]*)(?:\.[a-zA-Z_][a-zA-Z0-9_]*)*:(.*?)\n(?=.*?--(?:\n|$)))/,
	parseDefinitions(text) {
		const variables: (string | VariableDefinition)[] = [];
		const varSectionEnd = text.indexOf('\n--\n');

		for (const name of builtinVariables) {
			variables.push(name);
		}

		if (varSectionEnd === -1) {
			return variables;
		}

		const varSectionText = text.slice(0, varSectionEnd);
		const varRegex =
			/^(?:[a-zA-Z_][a-zA-Z0-9_]*)(?:\.[a-zA-Z_][a-zA-Z0-9_]*)*\b(?=[^\n]*?:)/gm;

		for (let match; (match = varRegex.exec(varSectionText)); ) {
			if (match.index == null) {
				continue;
			}

			const lineStart = varSectionText.lastIndexOf('\n', match.index) + 1;
			const lineEnd = varSectionText.indexOf('\n', lineStart);
			const lineText = varSectionText.slice(
				lineStart,
				lineEnd !== -1 ? lineEnd : undefined
			);

			const name = match[0];
			const offset = match.index - lineStart;
			const nameEndOffset = offset + name.length;
			const expressionOffset = lineText.indexOf(':', nameEndOffset);

			let expression = '';

			if (expressionOffset !== -1) {
				expression = lineText.slice(expressionOffset + 1).trim();
			}

			variables.push({
				name,
				position: {
					line: varSectionText.slice(0, lineStart).split('\n').length,
					ch: offset,
				},
				expression,
				local: name[0] === '_',
			});
		}

		return variables;
	},
	suggestVariableName(names, query) {
		const parts = query?.split('.') ?? [];

		if (parts.length > 0) {
			const prefix = parts.length > 1 ? parts.slice(0, -1).join('.') + '.' : '';
			const lastPart = parts[parts.length - 1];

			if (prefix) {
				names = names.filter((name) => name.startsWith(prefix));
			}

			let rankedVariables = names.map((name) => {
				const nameWithoutPrefix = name.slice(prefix.length);

				let score = jaroWinkler(lastPart, nameWithoutPrefix);

				if (nameWithoutPrefix.includes('.')) {
					// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
					const nameWithoutPeriods = nameWithoutPrefix.match(/\.([^.]*)$/)![1];

					score = Math.max(score, jaroWinkler(lastPart, nameWithoutPeriods));
				}

				return {name, score};
			});

			rankedVariables.sort((a, b) => b.score - a.score);
			console.log({rankedVariables});

			// As a match becomes more certain, we should only show
			// buttons that are more certain.
			rankedVariables =
				rankedVariables[0].score >= 0.8
					? rankedVariables.filter((variable) => variable.score >= 0.8)
					: rankedVariables[0].score >= 0.6
						? rankedVariables.filter((variable) => variable.score >= 0.6)
						: rankedVariables;

			return rankedVariables.map(({name}) => name);
		}

		return names;
	},
	reservedWords: [
		...jsKeywords,
		...Object.keys(globalThis),
		...builtinVariables,
		'browser',
		'engine',
		'now',
		'passage',
		'random',
		'story',
	],
};

export default extension;
