<script lang="ts">
  import { onMount } from "svelte";
  import { onDestroy } from 'svelte'
  import { 
    createDefaultSettings, 
    words, 
    createGuessRows,
    createBoardState,
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

  let showOverlay:boolean;
  let showModal:boolean;
  let guessRows = createGuessRows()
  
  let shake:boolean
  let message:string
  let jumpy:boolean
  let stop = false

  let pos = 0
  const maxLetter = 5
  const maxRow = 6
  let root: HTMLElement;

  evaluations.set((JSON.parse(localStorage.getItem("evaluations"))) || [null, null, null, null, null, null])
	boardState.set((JSON.parse(localStorage.getItem("boardState")) as BoardState) || createBoardState())
	settings.set((JSON.parse(localStorage.getItem("settings")) as Settings) || createDefaultSettings())
  const unsubscribe = settings.subscribe((s) => localStorage.setItem("settings", JSON.stringify(s)))
  const unsubscribBoard = boardState.subscribe((b) => localStorage.setItem("boardState", JSON.stringify(b)))
  const unsubsEval = evaluations.subscribe((s) => localStorage.setItem("evaluations", JSON.stringify(s)))

  onMount(() => {
		root = document.documentElement;
	});

	$: {
		if (root) {
      let row:number = JSON.parse(localStorage.getItem("rowIndex"))
     
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
	
	onDestroy(unsubscribe)
  onDestroy(unsubscribBoard)
  onDestroy(unsubsEval)

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

  // let titleShare = Katlo {#} {jumlahTebakan}/{jumlah Row}

  const correct = '🟩'
  const present = '🟨'
  const absent = '⬜'

  console.log(correct,absent,present)

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
      setTimeout(() => jumpy = true, 2200)
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
    if($currentRow > maximumAttempt) return

    $currentRow = $currentRow + 1
    pos = 0
  }

</script>


<Header on:click={() => showOverlay = true} />

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
<Modal {showModal} on:click={() => showModal = false}>
  <div slot="head">
    <h3 class="modal-title">Statistik</h3>
    <section class="statistic">
        <article class="statistic__block">
            <h4>1</h4>
            <p>x Main</p>
        </article>
        <article class="statistic__block">
            <h4>100</h4>
            <p>% Menang</p>
        </article>
        <article class="statistic__block">
            <h4>1</h4>
            <p>Streak</p>
        </article>
        <article class="statistic__block">
            <h4>1</h4>
            <p>Max Streak</p>
        </article>
    </section>
  </div>
  <div slot="body">
    <h3 class="modal-title">Sebaran Jawaban</h3>
      <div class="graph-container">
        <ul>
            <li>
                <div class="graph-number">1</div>
                <div class="graph-track">
                    <div class="graph-bar" style="width:7%;">0</div>
                </div>
            </li>
            <li>
                <div class="graph-number">2</div>
                <div class="graph-track">
                    <div class="graph-bar" style="width:7%;">0</div>
                </div>
            </li>
            <li>
                <div class="graph-number">3</div>
                <div class="graph-track">
                    <div class="graph-bar graph-bar--highlight" style="width:100%;justify-content:flex-end;padding-right:8px">0</div>
                </div>
            </li>
            <li>
                <div class="graph-number">4</div>
                <div class="graph-track">
                    <div class="graph-bar" style="width:7%;">0</div>
                </div>
            </li>
            <li>
                <div class="graph-number">5</div>
                <div class="graph-track">
                    <div class="graph-bar" style="width:7%;">0</div>
                </div>
            </li>
            <li>
                <div class="graph-number">6</div>
                <div class="graph-track">
                    <div class="graph-bar" style="width:7%;">0</div>
                </div>
            </li>
        </ul>
    </div>
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

.statistic {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  width: 80%;
  margin: 0 auto;
}
.statistic__block p {
  font-size: 12px;
  text-align: center;
}
.modal-title {
  font-weight: 700;
  font-size: 16px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  text-align: center;
  margin-bottom: 16px;
}
h4 {
  font-size: 36px;
  font-weight: 400;
  text-align: center;
  letter-spacing: 0.05em;
  font-variant-numeric: proportional-nums;
}

.graph-container {
  width: 80%;
  margin: 0 auto;
}
.graph-container li {
    display: flex;
    font-size: 14px;
    line-height: 20px;
    margin-bottom: 6px;
}
.graph-track {
    width: 100%;
}
.graph-bar {
    font-weight: bold;
    color: var(--tile-text-color);
    background-color: var(--color-absent);
    position: relative;
    background-color: var(--color-absent);
    display: flex;
    justify-content: center;
    margin-left: 4px;
}
.graph-bar--highlight {
    background-color: var(--color-correct);
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
