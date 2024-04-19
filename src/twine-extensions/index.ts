import {mode} from './codemirror-mode';
import {commands} from './codemirror-commands';
import {toolbar} from './codemirror-toolbar';
import {parsePassageText as parseReferences} from './parse-references';
import variablesExtension from './parse-variables';

// The ___format module is bound to `this` in
// vite.extensions.config.js.

import hydratedFormat from '___format';

hydratedFormat.editorExtensions = {
	twine: {
		'^2.4.0-beta2': {
			codeMirror: {commands, mode, toolbar},
			references: {parsePassageText: parseReferences},
			variables: variablesExtension,
		},
	},
};
