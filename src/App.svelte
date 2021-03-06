<script lang="ts">
import { onMount } from "svelte";
import { onDestroy } from 'svelte'
import definitions from "./definition";
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
  absent,
  gameState
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

    
    const last = JSON.parse(localStorage.getItem('lastPlayedTs'))
    if(last < today.setHours(0,0,0)) resetGame()
  }
}

let distance = 1000;
const tomorrow = new Date(+new Date().setHours(0, 0, 0, 0) + 86400000);
const t = tomorrow.getTime()

const x = setInterval(function() {
  const now = new Date().getTime();
  distance = t - now; 
  if (distance < 0) {
      if(stats.played > 0) {
        $visible = true
        message = 'Waktu habis'
        setTimeout(() => {
          $visible = false
          showModal = false
        }, 1000)
      }
      resetGame()
      clearInterval(x)
  }
}, 1000);
	
onDestroy(() => {
  unsubscribe
  unsubscribBoard
  unsubsEval
  unsubStatus
  clearInterval(x)
})

let today = new Date()
function resetGame(){
  $visible = false
  winModal = false
  today = new Date()
  $gameStatus = "IN_PROGRESS"
  $evaluations = new Array(6).fill(null)
  $boardState = createBoardState()
  guessRows = createGuessRows()
  $tileState = gameState()
  $correctState = []
  $wrongState = []
  $missedState = []
  $currentRow = 0
  localStorage.setItem("rowIndex", JSON.stringify($currentRow))
  localStorage.setItem("gameStatus", JSON.stringify($gameStatus))
  localStorage.setItem("evaluations", JSON.stringify($evaluations))
}

$: IN_PROGRESS = $gameStatus === "IN_PROGRESS"
const dt = "2022-2-14 00:00:00"
const gameBeginning = new Date(dt.replace(/-/g, "/"));
const dateIndex = (beginning, date) => Math.round((date.setHours(0, 0, 0, 0) - beginning) / 864e5)
const katlo = (date:Date) => words.words[dateIndex(gameBeginning, date) % words.words.length];


const statusOnLoad = JSON.parse(localStorage.getItem("gameStatus"))
if($visible === false && (statusOnLoad === "WIN" || statusOnLoad === "FAIL")) {
  setTimeout(() => {
    showModal = true
    winModal = true
  }, 1500)
}

let welcomeModal = false

let countTitle:string
$: if ($gameStatus === 'WIN') {
  countTitle = ($currentRow).toString()
} else countTitle = 'x'
$: titleShare = `Katlo ${Math.floor(dateIndex(gameBeginning, today))} ${countTitle}/6`
$: tileShare = $evaluations.filter(i => i !== null)
$: for(let k = 0;k < tileShare.length;k++){
  tileShare[k] = tileShare[k].join('')
  .replace(/correct/g, correct)
  .replace(/missed/g, present)
  .replace(/wrong/g, absent)
}
$: tileToShare = tileShare.toString().replace(/\s]/g,"").replace(/[,]/g,"\n")
const urlToShare = 'https://katlo.vercel.app'
const hashtag = 'BosoJowo'

const tweet = () => {
    const encodeURI = tileToShare.replace(/\n/g, "%0A");
    const shareToTwitter = `https://twitter.com/intent/tweet?text=${titleShare} %23${hashtag}%0A%0A${encodeURI}%0A%0A${urlToShare}`;
    window.open(shareToTwitter, "_blank");
}
const share = () => {
  navigator.clipboard.writeText(titleShare + ' #' + hashtag + '\n\n' + tileToShare + '\n\n' + urlToShare).then(
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
  if(e.detail.toLowerCase() === 'enter') {
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
    message = 'Kata tersebut belum ada di kamus kami'
    delay = 1500
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
  localStorage.setItem("lastPlayedTs", JSON.stringify(new Date().getTime()) )
  
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
    toastModal.m = apreciation[$currentRow][Math.floor(Math.random() * apreciation[$currentRow].length)].toString()
    toastModal.speed = 2000
    toastModal.row = $currentRow + 1
    toastModal.modalDelay = 5000
    toastModal.toastDelay = 3500
    toastModal.gameResult = "WIN"
    toastModal.winstatus = 1
    updateStatus(toastModal)
  }

  if($currentRow === 5 && katlo(today) !== guess) {
    toastModal.m = `Kata hari ini adalah: ${katlo(today).toUpperCase()}`
    toastModal.speed = 4000
    toastModal.row = $currentRow + 1
    toastModal.modalDelay = 6000
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
  definitionWord = false
}
const handleOverlay = () => {
  showOverlay = true
  definitionWord = false
}
let handleWinModal = () => {
  winModal = true
  showModal = true
  definitionWord = false
}
let handleWelcomeModal = () => {
  winModal = false
  showModal = true
  welcomeModal = true
  definitionWord = false
}

let definitionWord = false
const showDefinition = () => {
  definitionWord = true
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
<Modal {showModal} {stats} on:click={modalClose} on:share={share} on:tweet={tweet}>
  <div slot="head">
    {#if !definitionWord}
      <Statistik {winModal} />
      {#if !IN_PROGRESS}
      <div class="definition">
        <p><small>Kata hari ini</small><br>{katlo(today)}</p>
        <button on:click="{() => showDefinition()}">[ Lihat arti kata ini ]</button>
      </div>
      {/if}
      {:else}
      <button class="back" on:click={() => definitionWord = false}>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-chevron-left" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
        </svg>
      </button>
      <br><br>
      <div class="definition">
        <p><small>Kata hari ini</small><br>{katlo(today)}</p>
      </div>
      <div class="definition word">
        <p>{definitions[katlo(today)]}
        <br><br>
        <span class="text-regular">(Makna kata didapat dari Kamus Bausastra Jawa, karangan W.J.S Poerwadarminta, terbitan tahun 1939)</span>
        </p>
      </div>
    {/if}
  </div>
  <div slot="body">
    {#if !definitionWord}
    <Graph {winModal} {stats} distribution={stats.guesses} />
    {/if}
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

.definition {
  width: 97%;
  margin: 1.5rem auto;
  display: flex;
  gap: .5rem;
  align-items: flex-end;
  transition: all cubic-bezier(0.075, 0.82, 0.165, 1) 100ms;
}
.definition p {
  font-weight: 700;
  font-size: 24px;
  text-transform: capitalize;
}

.definition p small {
  font-weight: 500;
  font-size: 12px;
  letter-spacing: .1ch;
}

.definition.word > p {
  font-weight: 400;
  font-size: 12px;
  text-align: left;
}

.definition button {
  background-color: transparent;
  border: none;
  color: var(--green);
  padding: .2rem 1rem;
  cursor: pointer;
}

button.back {
  background-color: transparent;
  border: none;
  position: absolute;
  top: 5px;
  left: 5px;
  cursor: pointer;
  color: var(--color-tone-1);
}

button.back svg,
button.back path {
  fill: var(--color-tone-1);
}
.text-regular {
  text-transform: none;
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
