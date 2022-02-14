<script lang="ts">
    import { correctState, missedState, wrongState } from "../store";

    export let data:string[][];
    export let row
    export let word
    export let emit = false

    const exactLetter = (s:string, n:number) => {
        let l = s.toLowerCase()
        if (word[n] === l) {
            $correctState = [...$correctState, l];
            return true
        } 
        else if (word.includes(l)) {
            $missedState = [...$missedState, l];
        } 
        else {
            $wrongState = [...$wrongState, l];
        }
    }

    let increment = 0
    $: emit ? increment = .5 : increment
</script>
{#each data as guessRow, index }
    <div class="row" data-guess={`row-${index}`}>
        {#each guessRow as tile, idx }
            <div data-position={`row-${index}-tile-${idx}`} 
                class="tile"
                class:active={ index == row && tile }
                class:correct={emit && index < row && exactLetter(tile, idx)} 
                class:missed={emit && index < row && word.includes(tile.toLowerCase())}
                class:wrong={emit && index < row && !word.includes(tile.toLowerCase())}
                style={emit && index < row && tile ? `transition-delay: ${increment * idx}s;animation-delay: ${increment * idx}s` : `transition-delay: ${increment * 0}s;animation-delay: ${increment * 0}s`}
            >
                {tile}
            </div>
        {/each}
    </div>
{/each}

<style>
.row {
  display: grid;
  grid-template-columns: repeat(5, 2.8em);
  gap: .25em;
}

.tile {
    width: 100%;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    font-size: 2rem;
    line-height: 2rem;
    font-weight: bold;
    vertical-align: middle;
    box-sizing: border-box;
    color: var(--color-tone-1);
    text-transform: uppercase;
    user-select: none;
    border: 2px solid var(--color-tone-4);
    background-color: var(--color-tone-7);
}

.active {
    border: 2px solid var(--color-tone-3);
    animation: bounce 500ms ease-in-out;
    transition: background-color 100ms linear;
    -webkit-transition: background-color 100ms linear;
    -ms-transition: background-color 100ms linear;
}
.correct {
    background-color: var(--color-correct) !important;
    color: var(--tile-text-color);
    border-color: var(--color-correct) !important;
    animation: dance 500ms ease-in-out;
    transition: all 100ms linear;
    -webkit-transition: all 100ms linear;
    -ms-transition: all 100ms linear;
}
.missed {
    background-color: var(--yellow);
    color: var(--tile-text-color);
    border-color: var(--yellow);
    transition: all 100ms linear;
    -webkit-transition: all 100ms linear;
    -ms-transition: all 100ms linear;
    animation: dance 500ms ease-in-out;
}
.wrong {
    background-color: var(--color-absent);
    color: var(--tile-text-color);
    border-color: var(--color-absent);
    transition: all 100ms linear;
    -webkit-transition: all 100ms linear;
    -ms-transition: all 100ms linear;
    animation: dance 500ms ease-in-out;
}

@keyframes bounce {
    0% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.1);
    }
    100% {
        transform: scale(1);
    }
}

@keyframes dance {
    0% {
        transform: rotateX(0deg);
    }
    50% {
        transform: rotateX(90deg);
    }
    100% {
        transform: rotateX(0deg);
    }
}
</style>