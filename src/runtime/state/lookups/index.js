import initBrowser from './browser';
import initEngine from './engine';
import initNow from './now';
import initPassage from './passage';
import initRandom from './random';
import initStoryName from './story-name';
import {setLookup} from '../index';

export default function init() {
	initBrowser(setLookup);
	initEngine(setLookup);
	initNow(setLookup);
	initPassage(setLookup);
	initRandom(setLookup);
	initStoryName(setLookup);
}
