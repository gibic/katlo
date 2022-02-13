<script lang="ts">
  import { createDefaultSettings, settings } from "../store";
  import Header from "./Header.svelte";
  import Overlay from "./Overlay.svelte";
  import Keys from "./components/Keys.svelte"
  import Board from "./components/Board.svelte"

  let showOverlay:boolean;

  const word = 'robin'

  const guessRows:string[][] = [
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', '']
  ]

  let n = 0
  let row = 0
  const maxLetter = 5
  const maxRow = 6

  const handdleArray = (e) => {
    if(e.detail.toLowerCase() == 'enter') {
      submitAnswer() 
      return
    }
    updateArray(e.detail)
  }

  const delKey = () => {
    if (n < 1) return
    n--
    guessRows[row][n] = ''
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
        submitAnswer() 
        return
      }
  }

  const submitAnswer = () => {
    if(guessRows[row].includes('')) {
      console.log('kureng')
      return
    }
    const guess = guessRows[row].join('').toLowerCase()
    checkAnswer(guess)
  }

  const checkAnswer = (guess:string) => {
    if(word.toLowerCase() === guess) console.log('bener')
    else nextRow()
  }

  const updateArray = (e) => {
    let max = n
    max++

    let lastLetter = guessRows[row][maxLetter]

    if(max > maxLetter && lastLetter !== '') return

      guessRows[row][n] = e
      n++
  }

  const nextRow = () => {
    let maximumAttempt = maxRow - 2
    if(row > maximumAttempt) return
    row = row + 1
    n = 0
  }


	settings.set(
		(JSON.parse(localStorage.getItem("settings")) as Settings) || createDefaultSettings()
	);
	settings.subscribe((s) => localStorage.setItem("settings", JSON.stringify(s)));
</script>


<Header on:click={() => showOverlay = true} />

<main id="game">
  <section class="message-container"></section>
  <section class="game-container">
    <Board data={guessRows} />
  </section>
  <section class="game-keyboard">
    <Keys on:keyPressed={handdleArray} on:keyDown={handdlekeyDown} on:delKey={delKey} />
  </section>
</main>

<Overlay {showOverlay} on:click={() => showOverlay = false} />

<style>
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
    font-family: Arial, sans-serif;
    font-size: 16px;
    --header-height: 50px;
    --keyboard-height: 200px;
    --game-max-width: 500px;
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
:global(#app) {
  height: 100vh;
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
}
.game-container {
    display: grid;
    grid-template-rows: repeat(6, 4em);
    gap: .25em;
}
</style>
