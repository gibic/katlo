import wordList from "./words_5";

export const words = {
	...wordList,
	contains: (word: string) => {
		return wordList.words.includes(word) || wordList.valid.includes(word);
	},
};

export function createDefaultSettings(): Settings {
	return {
		dark: true,
	};
}

export function gameState() {
	const s:string[][] = [
        ['', '', '', '', ''],
        ['', '', '', '', ''],
		['', '', '', '', ''],
        ['', '', '', '', ''],
		['', '', '', '', ''],
		['', '', '', '', ''],
  	]
	return s
}

export function createGuessRows() {
	const t:string[][] = [
		['', '', '', '', ''],
		['', '', '', '', ''],
		['', '', '', '', ''],
		['', '', '', '', ''],
		['', '', '', '', ''],
		['', '', '', '', '']
	]

	return t
}
