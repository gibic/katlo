<script lang="ts">
import { onMount } from "svelte";
import { onDestroy } from 'svelte'
import { 
  createDefaultSettings, 
  words, 
  createGuessRows,
  createBoardState,
  createDefaultStats,
  toastModal,
  apreciation,
  correct,
  present,
  absent
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
    if(stats.played === 0 && row === 0) {
      setTimeout(() => {
        showModal = true
        winModal = false
        welcomeModal = true
      }, 500)
    }
    console.log(date.setHours(0, 0, 0, 0), todayGame.setHours(0, 0, 0, 0))
    if(($gameStatus !== "IN_PROGRESS") && (date.setHours(0, 0, 0, 0) < todayGame.setHours(0, 0, 0, 0))) {
      $gameStatus = "IN_PROGRESS" 
      $evaluations = new Array(6).fill(null)
      $boardState = createBoardState()
      $currentRow = 0
      localStorage.setItem("rowIndex", JSON.stringify($currentRow))
      localStorage.setItem("gameStatus", JSON.stringify($gameStatus))
      localStorage.setItem("evaluations", JSON.stringify($evaluations))
      console.log('new')
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

const todayGame = new Date() 
const date = new Date(localStorage.getItem("lastPlayedTs"))
let welcomeModal = false

const share = () => {
  let countTitle = 'x'
  $gameStatus === 'WIN' ? countTitle = JSON.parse(localStorage.getItem('rowIndex')) : countTitle = 'x'

  let titleShare = `Katlo ${Math.floor(dateIndex(gameBeginning, today))} ${countTitle}/6`

  let tileShare = $evaluations.filter(i => i !== null)
  for(let k = 0;k < tileShare.length;k++){
    tileShare[k] = tileShare[k].join('')
    .replace(/correct/g, correct)
    .replace(/missed/g, present)
    .replace(/wrong/g, absent)
  }
  const tileToShare = tileShare.toString().replace(/\s]/g,"").replace(/[,]/g,"\n")
  const urlToShare = 'https://katlo.vercel.app'

  navigator.clipboard.writeText(titleShare + '\n' + tileToShare + '\n' + urlToShare).then(
      () => {
        $visible = true
        message = 'Berhasil di-copy'
      },
      () => {
        $visible = true
        message = 'Gagal di-copy'
      }
  );
}



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
    toastModal.m = apreciation[$currentRow].toString()
    toastModal.speed = 2000
    toastModal.row = $currentRow + 1
    toastModal.modalDelay = 5000
    toastModal.toastDelay = 3500
    toastModal.gameResult = "WIN"
    toastModal.winstatus = 1
    updateStatus(toastModal)
  }

  if($currentRow === 5 && katlo(today) !== guess) {
    toastModal.m = katlo(today).toUpperCase()
    toastModal.speed = 2000
    toastModal.row = $currentRow + 1
    toastModal.modalDelay = 3000
    toastModal.toastDelay = 2000
    toastModal.gameResult = "FAIL"
    toastModal.winstatus = 0
    updateStatus(toastModal)
  }

  nextRow()
}

const updateStatus = (i:ToastModal) => {
  setTimeout(() => {
      $visible = true 
      delay = i.speed
      message = i.m
  }, i.toastDelay)
    
  stats.played = Number(stats.played) + 1
  stats.gamesWon = Number(stats.gamesWon) + i.winstatus
  stats.guesses[i.row] = stats.guesses[i.row] + i.winstatus

  if(i.winstatus === 0) {
    stats.streak = 0 
    stats.guesses.fail = Number(stats.guesses.fail) + 1
  } else {
    stats.streak = Number(stats.streak) + i.winstatus
  }

  if(stats.streak > stats.maxStreak) {
    stats.maxStreak = Number(stats.streak)
  }

  localStorage.setItem('katlo-stats', JSON.stringify(stats))
  localStorage.setItem("lastPlayedTs", JSON.stringify(new Date().getTime()) )

  setTimeout(() => {
    showModal = true
    winModal = true
  }, i.modalDelay)
  $gameStatus = i.gameResult
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
let handleWelcomeModal = () => {
  winModal = false
  showModal = true
  welcomeModal = true
}
</script>

<Header on:overlay={handleOverlay} on:launchwinModal={handleWinModal} on:launchwelcomeModal={handleWelcomeModal} />

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
<Modal {showModal} {stats} on:click={modalClose} on:share={share}>
  <div slot="head">
    <Statistik {winModal} />
  </div>
  <div slot="body">
    <Graph {winModal} {stats} distribution={stats.guesses} />
  </div>
</Modal>
{#if welcomeModal && !winModal}
<Modal {showModal} on:click={modalClose}>
  <div slot="head">
      <h2 class="how-to-title">Cara Main</h2>
  </div>
  <div slot="body">
      <p>Tebak kata Bahasa Jawa dalam 6 kali percobaan.</p>
      <br>
      <p>Tiap tebakan adalah kata dalam Bahasa Jawa yang terdiri atas 5 huruf. </p>
      <br>
      <p>Sehabis menebak, tiap kotak akan berganti warna untuk memberi petunjuk, huruf mana yang letaknya tepat, meleset, atau keliru.</p>
      <div class="separator"></div>
      <h3><strong>Contoh</strong></h3>
      <div class="holder">
        <div class="tile correct">A</div>
        <div class="tile">B</div>
        <div class="tile">A</div>
        <div class="tile">N</div>
        <div class="tile">G</div>
      </div>
      <p>Huruf <strong>A</strong> ada, dan letaknya tepat.</p>
      <br>
      <div class="holder">
        <div class="tile">M</div>
        <div class="tile">A</div>
        <div class="tile missed">N</div>
        <div class="tile">U</div>
        <div class="tile">K</div>
      </div>
      <p>Huruf <strong>N</strong> ada, tapi letaknya keliru.</p>
      <br>
      <div class="holder">
        <div class="tile">W</div>
        <div class="tile">A</div>
        <div class="tile">J</div>
        <div class="tile">I</div>
        <div class="tile wrong">K</div>
      </div>
      <p>Huruf <strong>K</strong> tidak ada di dalam kata.</p>
      <br><br>
      <p><strong>N.B:</strong> Perbendaharaan kata Bahasa Jawa di <em>game</em> ini masih sangat minim. Silakan <a href="https://twitter.com/ginseladipura" target="_blank">hubungi kami</a> jika kawan-kawan ingin menambahkan kata untuk dipasang di permainan ini.</p>
  </div>
  <div slot="footer">
    <p>&nbsp;</p>
  </div>
</Modal>
{/if}
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
.how-to-title {
  text-transform: uppercase;
  font-weight: 700;
}
p {
  font-size: 14px;
  color: var(--color-tone-1);
  line-height: 1.25;
  letter-spacing: .08rem;
  font-weight: 400;
}
.separator {
  margin: 2rem 0;
  border-bottom: 1px solid var(--color-tone-2);
}
.holder {
  width: 300px;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-auto-rows: 50px;
  gap:3px;
  margin: 1rem 0;
}
.tile {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--color-tone-7);
  border: 2px solid var(--color-tone-3);
  color: var(--color-tone-1);
  font-weight: 700;
}
.correct {
  background-color: var(--color-correct);
  border: none;
}

.missed {
  background-color: var(--yellow);
  border: none;
}

.wrong {
  background-color: var(--color-absent);
  border: none;
}

a {
  color: inherit
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
