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
	}
}

export function createBoardState(): BoardState {
	return {
		boardState: ['', '', '', '', '', ''],
	}
}

export const gameStatus:string = 'IN_PROGRESS'

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

export function createDefaultStats(): Stats {
	const stats = {
		played: 0,
		lastGame: 0,
		guesses: {
			fail: 0,
			1: 0,
			2: 0,
			3: 0,
			4: 0,
			5: 0,
			6: 0,
		}
	};
	return {
		...stats,
		streak: 0,
		maxStreak: 0,
		winPercentage: 0,
		gamesWon: 0

	};
};