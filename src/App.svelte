<script lang="ts">
  import { onDestroy } from 'svelte'
  import { 
    createDefaultSettings, 
    words, 
    createGuessRows 
  } from "./utils"
  import { 
    settings, 
    submitted, 
    currentRow, 
    tileState, 
    correctState, 
    wrongState, 
    missedState, 
    visible 
  } from "./store"
  import Header from "./Header.svelte"
  import Overlay from "./Overlay.svelte"
  import Keys from "./components/Keys.svelte"
  import Board from "./components/Board.svelte"
  import Toast from "./components/Toast.svelte"

  let showOverlay:boolean;
  const guessRows = createGuessRows()
  
  let shake:boolean
  let message:string
  let jumpy:boolean
  let stop = false

  let pos = 0
  const maxLetter = 5
  const maxRow = 6

	settings.set((JSON.parse(localStorage.getItem("settings")) as Settings) || createDefaultSettings())
  const unsubscribe = settings.subscribe((s) => localStorage.setItem("settings", JSON.stringify(s)))
	onDestroy(unsubscribe)

  const offsetFromDate = new Date('2022, 1, 17')
  var milliseconds = offsetFromDate.getTime();
  const msOffset = Date.now() - milliseconds
  const dayOffset = msOffset / 1000 / 60 / 60 / 24
  const word = words.words[Math.floor(dayOffset)]


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
        if( $tileState[$currentRow][i] === 'missed') {
          if(temp.includes(g[i].letter)) {
            $tileState[$currentRow][i] = 'wrong'
          } 
        }
    }
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

<Overlay {showOverlay} on:click={() => showOverlay = false} />

<style>
  :global(html, #app) {
    height: 100%;
    font-family: Arial, sans-serif;
    font-size: 16px;
  }
  :global(:root) {
    --green: #6aaa64;
    --darkendGreen: #538d4e;
    --yellow: #c9b458;
    --darkendYellow: #b59f3b;
    --lightGray: #d8d8d8;
    --gray: #86888a;
    --darkGray: #939598;
    --white: #fff;
    --black: #212121;
    --orange: #f5793a;
    --blue: #85c0f9;
    --header-height: 50px;
    --keyboard-height: 200px;
    --game-max-width: 240px;
    --color-tone-1: #000000;
    --color-tone-2: #787c7e;
    --color-tone-3: #878a8c;
    --color-tone-4: #d3d6da;
    --color-tone-5: #edeff1;
    --color-tone-6: #f6f7f8;
    --color-tone-7: #ffffff;
    --color-nav-hover: #f4f4f4;
    --opacity-50: rgba(255, 255, 255, 0.5);
    --color-present: var(--yellow);
    --color-correct: var(--green);
    --color-absent: var(--color-tone-2);
    --tile-text-color: var(--color-tone-7);
    --key-text-color: var(--color-tone-1);
    --key-evaluated-text-color: var(--color-tone-7);
    --key-bg: var(--color-tone-4);
    --key-bg-present: var(--color-present);
    --key-bg-correct: var(--color-correct);
    --key-bg-absent: var(--color-absent);
    --modal-content-bg: var(--color-tone-7);
    --icon-color: #565758;
}

:global(body) {
  height: 100%;
  background-color: var(--color-background);
  margin: 0;
  padding: 0;
  overflow-y: hidden;
}
:global(.dark) {
  --color-tone-1: #ffffff;
    --color-tone-2: #818384;
    --color-tone-3: #565758;
    --color-tone-4: #3a3a3c;
    --color-tone-5: #272729;
    --color-tone-6: #1a1a1b;
    --color-tone-7: #121213;
    --color-nav-hover: #2f2f31;
    --opacity-50: rgba(0, 0, 0, 0.5);
  --color-present: var(--darkendYellow);
    --color-correct: var(--darkendGreen);
    --color-absent: var(--color-tone-4);
    --tile-text-color: var(--color-tone-1);
    --key-text-color: var(--color-tone-1);
    --key-evaluated-text-color: var(--color-tone-1);
    --key-bg: var(--color-tone-2);
    --key-bg-present: var(--color-present);
    --key-bg-correct: var(--color-correct);
    --key-bg-absent: var(--color-absent);
    --modal-content-bg: var(--color-tone-7);
    --color-background: var(--color-tone-7);
}
:global(:root, .dark) {
    --color-background: var(--color-tone-7);
}
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
