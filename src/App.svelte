<script lang="ts">
import { onMount } from "svelte";
import { onDestroy } from 'svelte'
import { 
  createDefaultSettings, 
  words, 
  createGuessRows,
  createBoardState,
  createDefaultStats
} from "./utils"
import { 
  settings, 
  boardState,
  submitted, 
  currentRow, 
  tileState, 
  correctState, 
  wrongState, 
  missedState, 
  evaluations,
  visible,
  gameStatus
} from "./store"
import Header from "./Header.svelte"
import Overlay from "./Overlay.svelte"
import Keys from "./components/Keys.svelte"
import Board from "./components/Board.svelte"
import Toast from "./components/Toast.svelte"
import Modal from "./components/Modal.svelte"
import Graph from "./components/Graph.svelte";
import Statistik from "./components/Statistik.svelte";

let showOverlay:boolean;
let showModal = false
let guessRows = createGuessRows()
let stats: Stats;
let shake:boolean
let message:string
let jumpy:boolean
let winModal = false
let pos = 0
let delay:number
const maxLetter = 5
const maxRow = 6
let root: HTMLElement;

gameStatus.set(JSON.parse(localStorage.getItem("gameStatus")) || "IN_PROGRESS")
evaluations.set((JSON.parse(localStorage.getItem("evaluations"))) || new Array(6).fill(null))
boardState.set((JSON.parse(localStorage.getItem("boardState")) as BoardState) || createBoardState())
settings.set((JSON.parse(localStorage.getItem("settings")) as Settings) || createDefaultSettings())
const unsubscribe = settings.subscribe((s) => localStorage.setItem("settings", JSON.stringify(s)))
const unsubscribBoard = boardState.subscribe((b) => localStorage.setItem("boardState", JSON.stringify(b)))
const unsubsEval = evaluations.subscribe((s) => localStorage.setItem("evaluations", JSON.stringify(s)))
const unsubStatus = gameStatus.subscribe((g) => localStorage.setItem("gameStatus", JSON.stringify(g)))

stats = (JSON.parse(localStorage.getItem(`katlo-stats`)) as Stats) || createDefaultStats()

onMount(() => {
  root = document.documentElement;
});

$: {
  if (root) {
    localStorage.setItem('katlo-stats', JSON.stringify(stats))
    localStorage.setItem("settings", JSON.stringify($settings))
    $settings.dark ? root.classList.add("dark") : root.classList.remove("dark")
    const row = JSON.parse(localStorage.getItem("rowIndex"))
    if(!row) localStorage.setItem("rowIndex", JSON.stringify($currentRow))

    if( row > 0) {
      const board = JSON.parse(localStorage.getItem("boardState")).filter((i:string) => i !== '')
      for(let i = 0; i < board.length; i++){
        guessRows[i] = board[i].split('')
        $currentRow = row
      }
    }
  }
}
	
onDestroy(() => {
  unsubscribe
  unsubscribBoard
  unsubsEval
  unsubStatus
})

const IN_PROGRESS = $gameStatus === "IN_PROGRESS"
const today = new Date()
const gameBeginning = new Date('2022, 2, 14').setHours(0, 0, 0, 0);
const dateIndex = (beginning, date) => Math.round((date.setHours(0, 0, 0, 0) - beginning) / 864e5)
const katlo = (date:Date) => words.words[dateIndex(gameBeginning, date) % words.words.length];

const statusOnLoad = JSON.parse(localStorage.getItem("gameStatus"))
if($visible === false && (statusOnLoad === "WIN" || statusOnLoad === "FAIL")) {
  setTimeout(() => {
    showModal = true
    winModal = true
  }, 1500)
}

const date = new Date(localStorage.getItem("lastPlayedTs"))

function getMidnight(day:Date){
  const date = new Date(day);
  date.setMilliseconds(999);
  date.setSeconds(59);
  date.setMinutes(59);
  date.setHours(23);
  return date;
}

function isNewDay(date){
  const midnightTonight = getMidnight(new Date());
  const midnightTomorrow = new Date(midnightTonight.getTime() + 864e5);

  return date > midnightTonight && date < midnightTomorrow;
}

$: if($gameStatus !== "IN_PROGRESS") {
  isNewDay(date) ? $gameStatus = "IN_PROGRESS" : console.log('Waiting for new word')
}
// let titleShare = `Katlo ${Math.floor(dayOffset)} ${JSON.parse(localStorage.getItem('rowIndex'))}/6`

const correct = '🟩'
const present = '🟨'
const absent = '⬜'

// console.log(titleShare, correct,absent,present, $currentRow)

if($evaluations[0] !== null) {
  const fil = $evaluations.filter(i => i !== null)
  for(let i = 0; i < fil.length; i++) {
    $tileState[i] = $evaluations[i]
  }
}

const handdleArray = (e) => {
  if(!IN_PROGRESS) return
  if(e.detail.toLowerCase() == 'enter') {
    shake = false
    submitAnswer() 
    return
  }
  updateArray(e.detail)
}

const delKey = () => {
  if (pos < 1) return
  pos--
  guessRows[$currentRow][pos] = ''
}

const handdlekeyDown = (e) => {
  if(!IN_PROGRESS) return
  const letter = e.detail
    if(letter.match(/^[a-z]$/)) {
      updateArray(letter)
      return
    }
    if(letter == 'Backspace' || letter == 'Delete') {
      delKey() 
      return
    }
    if(letter === 'Enter') {
      shake = false
      submitAnswer() 
      return
    }
}

const submitAnswer = () => {
  const guess = guessRows[$currentRow].join('').toLowerCase()
  if($currentRow === maxRow) return

  if(guessRows[$currentRow].includes('')) {
    message = 'Jumlah huruf kurang'
    $visible = true
    return
  }
  
  if(!words.valid.includes(guess)) {
    shake = true
    message = 'Word not on list'
    $visible = true
    return
  }

  checkAnswer(guess)
  const toStr = guessRows.map(i => i.join('').toLowerCase())
  localStorage.setItem("boardState", JSON.stringify(toStr))
}

const checkAnswer = (guess:string) => {  
  let result = []
  let minusOneStr = katlo(today)
  let solution = katlo(today)

  for (let i = 0; i < guess.length; i++) {
      let guessLetter = guess.charAt(i);
      let solutionLetter = solution.charAt(i);

      if (guessLetter === solutionLetter) {
        result.push("correct");
        $correctState = [...$correctState, guessLetter]
        if(i < 4) {
              minusOneStr = minusOneStr.slice(0, minusOneStr.indexOf(guessLetter)) + minusOneStr.slice(minusOneStr.indexOf(guessLetter) + 1)
        }
      }
      else if (minusOneStr.indexOf(guessLetter) != -1) {   
        $missedState = [...$missedState, guessLetter] 
        if(i < 4) {
              minusOneStr = minusOneStr.slice(0, minusOneStr.indexOf(guessLetter)) + minusOneStr.slice(minusOneStr.indexOf(guessLetter) + 1)
        }
        result.push("missed");
      }
      else {
        result.push("wrong");
        $wrongState = [...$wrongState, guessLetter]
      }
    }

    $tileState[$currentRow] = [...result]

  let temp = []

  const g = guess.split('').map((letter, index) => {
      const wordmap = katlo(today).charAt(index)
      if(wordmap === letter) temp.push(letter)
      return { letter, wordmap }
  })
  
  for(let i = 0;i < 5; i++) {
      if($tileState[$currentRow][i] === 'missed' && temp.includes(g[i].letter)) {
          $tileState[$currentRow][i] = 'wrong'
      }
  }
  $evaluations[$currentRow] = $tileState[$currentRow]
  $submitted = true

  if(katlo(today) === guess) {
    setTimeout(() => jumpy = true, 2200)
    const m = "Panjenengan pancen 👍"
    const speed = 2000
    const row = $currentRow + 1
    const modalDelay = 5000
    const toastDelay = 3500
    const gameResult = "WIN"
    const winstatus = 1
    updateStatus(m, speed, row, modalDelay, toastDelay, gameResult, winstatus)
  }

  if($currentRow === 5 && katlo(today) !== guess) {
    const m = katlo(today).toUpperCase()
    const speed = 2000
    const row = $currentRow + 1
    const modalDelay = 3000
    const toastDelay = 2000
    const gameResult = "FAIL"
    const winstatus = 0
    updateStatus(m, speed, row, modalDelay, toastDelay, gameResult, winstatus)
  }

  nextRow()
}

const updateStatus = (m:string, s:number, r:number, d:number, t:number, g:string, q:number) => {
  setTimeout(() => {
      $visible = true 
      delay = s
      message = m
  }, t)
    
  stats.played = Number(stats.played) + 1
  stats.gamesWon = Number(stats.gamesWon) + q
  stats.guesses[r] = stats.guesses[r] + q
  localStorage.setItem('katlo-stats', JSON.stringify(stats))
  localStorage.setItem("lastPlayedTs", JSON.stringify(new Date().getTime()) )

  setTimeout(() => {
    showModal = true
    winModal = true
  }, d)
  $gameStatus = g
}

const updateArray = (e:string) => {
  shake = false
  let max = pos
  max++
  if(!IN_PROGRESS) return 
  if($currentRow === maxRow) return
  if(max > maxLetter && guessRows[$currentRow][maxLetter] !== '') return

  guessRows[$currentRow][pos] = e
  pos++
}

const nextRow = () => {
  let maximumAttempt = maxRow - 1
  localStorage.setItem("rowIndex", JSON.stringify($currentRow + 1));
  if($currentRow > maximumAttempt) {
    return
  }

  $currentRow = $currentRow + 1
  pos = 0
}

const modalClose = () => {
  showModal = false
}
const handleOverlay = () => {
  showOverlay = true
}
let handleWinModal = () => {
  winModal = true
  showModal = true
}
</script>

<Header on:overlay={handleOverlay} on:launchwinModal={handleWinModal} />

<main id="game">
  <section class="message-container">
    <Toast {message} {delay} />
  </section>
  <section class="game-container">
    <Board 
      data={guessRows} 
      {shake}
      {jumpy}
    />
  </section>
  <section class="game-keyboard">
    <Keys 
      on:keyPressed={handdleArray} 
      on:keyDown={handdlekeyDown} 
      on:delKey={delKey} 
    />
  </section>
</main>
<Modal {showModal} on:click={modalClose}>
  <div slot="head">
    <Statistik {winModal} />
  </div>
  <div slot="body">
    <Graph {winModal} distribution={stats.guesses} />
  </div>
</Modal>
<Overlay {showOverlay} on:click={() => showOverlay = false} />

<style>
#game {
  width: 100%;
  max-width: var(--game-max-width);
  margin: 0 auto;
  height: calc(100% - var(--header-height));
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}
.game-keyboard {
  text-align: center;
  margin-bottom: 10px;
  padding: 10px;
  max-width: var(--game-max-width);
}
.game-container {
    display: grid;
    grid-template-rows: repeat(6, 1fr);
    gap: .25em;
    min-height: 290px;
    width: 100%;
}

@media screen and (max-width: 767px) {
  #game {
    max-width: 90vw;
  }
  .game-container {
        min-height: 380px;
    }
}
@media screen and (min-width: 1440px) {
  #game {
    max-width: 400px;
  }
  .game-container {
        min-height: 470px;
    }
}
</style>
