<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { correctState, missedState, wrongState } from "../store";
  const dispatch = createEventDispatcher()
  const keys: string[] = [
      'Q',
      'W',
      'E',
      'R',
      'T',
      'Y',
      'U',
      'I',
      'O',
      'P',
      'A',
      'S',
      'D',
      'F',
      'G',
      'H',
      'J',
      'K',
      'L',
      'ENTER',
      'Z',
      'X',
      'C',
      'V',
      'B',
      'N',
      'M',
  ]
</script>

<svelte:window on:keydown|preventDefault={(e) => dispatch('keyDown', e.key)}/>

<div class="row">
    {#each keys as key }
        <button 
            on:click={() => dispatch('keyPressed', key)}
            class:correct={$correctState.includes(key.toLowerCase())}
            class:missed={$missedState.includes(key.toLowerCase())}
            class:wrong={$wrongState.includes(key.toLowerCase())}
        >
            {key}
        </button>
    {/each}
    <button on:click={() => dispatch('delKey')}>
        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
            <path fill="var(--color-tone-1)" d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H7.07L2.4 12l4.66-7H22v14zm-11.59-2L14 13.41 17.59 17 19 15.59 15.41 12 19 8.41 17.59 7 14 10.59 10.41 7 9 8.41 12.59 12 9 15.59z"></path>
        </svg>
    </button>
</div>
<style>
.row {
    display: grid;
    gap: .5em;
    grid-template-columns:repeat(20, 1.1em);
    grid-auto-rows: 3.2em;
    justify-content: center;
    max-width: var(--game-max-width);
}

button {
    font-size: .80rem;
    grid-column: span 2;
    cursor: pointer;
    user-select: none;
    background-color: var(--key-bg);
    color: var(--key-text-color);
    border: none;
    padding: 0;
    font-weight: bold;
    border-radius: .25em;
}

button:nth-child(11) {
    grid-column: 2 / 4;
}

button:nth-child(20),
button:nth-child(28) {
    grid-column: span 3;
}

.correct {
    background-color: var(--color-correct) !important;
    color: var(--tile-text-color);
}
.missed {
    background-color: var(--yellow);
    color: var(--tile-text-color);
    border-color: var(--yellow);
}
.wrong {
    background-color: var(--color-absent);
    color: var(--tile-text-color);
    border-color: var(--color-absent);
}

@media screen and (max-width:767px) {
    .row {
        gap: .5em;
        grid-template-columns: repeat(20, .65em);
        grid-auto-rows: 3em;
    }
}
</style>