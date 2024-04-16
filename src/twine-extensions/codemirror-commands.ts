import {Editor} from 'codemirror';

function makeInsertTextCommands(commands: Record<string, string>) {
	return Object.keys(commands).reduce(
		(result, commandName) => ({
			...result,
			[commandName]: (editor: Editor) => {
				editor.replaceSelection(commands[commandName]);
				editor.focus();
			}
		}),
		{}
	);
}

function makeWrapTextCommands(
	commands: Record<string, {matcher: RegExp; wrapper: (text: string) => string}>
) {
	return Object.keys(commands).reduce(
		(result, commandName) => ({
			...result,
			[commandName]: (editor: Editor) => {
				const {matcher, wrapper} = commands[commandName];

				editor.replaceSelections(
					editor
						.getSelections()
						.map(selection =>
							matcher.test(selection)
								? selection.replace(matcher, '$1')
								: wrapper(selection)
						),
					'around'
				);
				editor.focus();
			}
		}),
		{}
	);
}

export const commands = {
	...makeWrapTextCommands({
		boldText: {
			matcher: /^(?:__|\*\*)(.+)(?:__|\*\*)$/,
			wrapper: (text: string) => `**${text}**`
		},
		italicText: {
			matcher: /^(?:_|\*)(.+)(?:_|\*)$/,
			wrapper: (text: string) => `*${text}*`
		},
		monospacedText: {
			matcher: /^`(.+)`$/,
			wrapper: (text: string) => '`' + text + '`'
		},
		smallCapsText: {
			matcher: /^~~(.+)~~$/,
			wrapper: (text: string) => `~~${text}~~`
		}
	}),
	...makeInsertTextCommands({
		insertAfter: '[after ${1:1 second}]\n${2:Text}\n\n[continued]',
		insertAppend: '[append]\n',
		insertBlockquote: '<blockquote>${1:Text}</blockquote>\n',
		insertContinue: '[continued]\n',
		insertBulletedList: '- ${1:Item}\n- ${2:Item}\n',
		insertCss: '[CSS]\n${1:Enter your CSS here}\n\n[continued]\n',
		insertCyclingLink:
			"{cycling link for: '${1:variable name}', choices: ['${2:choice}', '${3:choice}']}",
		insertDropdownMenu:
			"{dropdown menu for: '${1:variable name}', choices: ['${2:choice}', '${3:choice}']}",
		insertEmbedAmbientSound: "{ambient sound: '${1:sound name}'}",
		insertEmbedSoundEffect: "{sound effect: '${1:sound name}'}",
		insertEmbedPassage: "{embed passage: '${1:Passage name}'}",
		insertEmbedYouTubeVideo: "{embed YouTube video: '${1:URL}'}",
		insertImageFlickr: "{embed Flickr image: '${1:Flickr embed code}'}",
		insertImageUrl: "{embed image: '${1:URL to image}'}",
		insertImageUnsplash:
			"{embed Unsplash image: '${1:Link to Unsplash image}'}",
		insertForkList: '> ${1:Link}\n> ${2:Link}\n',
		insertIf: '[if ${1:condition}]\n${2:Text}\n\n[continue]\n',
		insertIfElse: '[if ${1:condition}]\n${2:Text}\n\n[else]\n${3:Text}\n\n[continued]\n',
		insertJs:
			"\n[JavaScript]\n${1:write('Hello from JavaScript');}\n\n[continued]\n",
		insertNote: '[note]\n${1:Note to self}\n\n[continued]\n',
		insertNumberedList: '1. ${1:Item}\n2. ${2:Item}\n',
		insertPassageLink: "{link to: '${1:Passage name}', label: '${2:Label text}'}",
		insertRestartLink: "{restart link, label: '${1:Label text}'}",
		insertRevealPassageLink:
			"{reveal link: '${1:Label text}', passage: '${2:Passage name}'}",
		insertRevealTextLink:
			"{restart link: '${1:Label text}', text: '${2:Displayed text}'}",
		insertSectionBreak: '***\n',
		insertTextInput: "{text input for: '${1:variable name}'}",
		insertUnless: '[unless ${1:condition}]\n${2:Text}\n\n[continued]\n'
	})
};
