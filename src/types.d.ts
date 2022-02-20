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
	gamesWon: number;
	winPercentage: number;
};

type ToastModal = {
	m:string, 
	speed:number, 
	row:number, 
	modalDelay:number, 
	toastDelay:number, 
	gameResult:string, 
	winstatus:number
}
type Guesses = {
	"1": number;
	"2": number;
	"3": number;
	"4": number;
	"5": number;
	"6": number;
	"fail": number;
};