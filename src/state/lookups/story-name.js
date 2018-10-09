/*
Returns the story name. This is a computed variable because the story name is
read-only.
*/

import {story} from '../../story';

export default function init(setLookup) {
	setLookup('story.name', () => story.name);
}
