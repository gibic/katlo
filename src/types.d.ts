type Settings = {
	dark: boolean,
};

type BoardState = {
	boardState: ['', '', '', '', '', ''],
};

type Stats = {
	played: number;
	streak: number;
	maxStreak: number;
	lastGame: number;
	guesses: Guesses;
};

type Guesses = {
	"1": number;
	"2": number;
	"3": number;
	"4": number;
	"5": number;
	"6": number;
	"fail": number;
};