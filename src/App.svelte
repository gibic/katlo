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
  visible 
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
let stop = false
let winModal = false
let pos = 0
const maxLetter = 5
const maxRow = 6
let guesses = 0;
let root: HTMLElement;

// let titleShare = Katlo {#} {jumlahTebakan}/{jumlah Row}

const correct = '🟩'
const present = '🟨'
const absent = '⬜'

console.log(correct,absent,present)

evaluations.set((JSON.parse(localStorage.getItem("evaluations"))) || new Array(6).fill(null))
boardState.set((JSON.parse(localStorage.getItem("boardState")) as BoardState) || createBoardState())
settings.set((JSON.parse(localStorage.getItem("settings")) as Settings) || createDefaultSettings())
const unsubscribe = settings.subscribe((s) => localStorage.setItem("settings", JSON.stringify(s)))
const unsubscribBoard = boardState.subscribe((b) => localStorage.setItem("boardState", JSON.stringify(b)))
const unsubsEval = evaluations.subscribe((s) => localStorage.setItem("evaluations", JSON.stringify(s)))

stats = (JSON.parse(localStorage.getItem(`katlo-stats`)) as Stats) || createDefaultStats()

onMount(() => {
  root = document.documentElement;
});

$: {
  if (root) {
    let row:number = JSON.parse(localStorage.getItem("rowIndex"))
    localStorage.setItem('katlo-stats', JSON.stringify(stats))
    localStorage.setItem("settings", JSON.stringify($settings))
    $settings.dark ? root.classList.add("dark") : root.classList.remove("dark")

    if(!row) localStorage.setItem("rowIndex", JSON.stringify($currentRow))

    if( row > 0) {
      const board = JSON.parse(localStorage.getItem("boardState")).filter(i => i !== '')
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
})

const offsetFromDate = new Date('2022, 1, 17')
var milliseconds = offsetFromDate.getTime();
const msOffset = Date.now() - milliseconds
const dayOffset = msOffset / 1000 / 60 / 60 / 24
const word = words.words[Math.floor(dayOffset)]

if($evaluations[0] !== null) {
  const fil = $evaluations.filter(i => i !== null)
  for(let i = 0; i < fil.length; i++) {
    $tileState[i] = $evaluations[i]
  }
}

const handdleArray = (e) => {
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
  const date = new Date().getTime()
  localStorage.setItem("lastPlayedTs", JSON.stringify(date) )
  
  let result = []
  let minusOneStr = word
  let solution = word

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
      const wordmap = word.charAt(index)
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

  if(word === guess) {
    stop = true
    guesses = $currentRow
    setTimeout(() => jumpy = true, 2200)
    setTimeout(() => {
      showModal = true
      winModal = true
    }, 2500)
    localStorage.setItem("gameStatus", JSON.stringify('WIN'))
  }

  nextRow()
}

const updateArray = (e:string) => {
  shake = false
  let max = pos
  max++

  if(stop || $currentRow === maxRow) return
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
    <Toast {message} />
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
    <Graph {winModal} distribution={stats.guesses} guesses={guesses} />
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
