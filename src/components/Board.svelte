<script lang="ts">

    export let data:string[][];
    export let row
    export let word
    export let emit = false

</script>
{#each data as guessRow, index }
    <div class="row" data-guess={`row-${index}`}>
        {#each guessRow as tile, idx }
            <div data-position={`row-${index}-tile-${idx}`} class:correct={index < row && emit && word[idx] === tile.toLowerCase()} 
            class="tile"
            class:missed={index < row && emit && word.includes(tile.toLowerCase())}
            class:wrong={index < row && emit && !word.includes(tile.toLowerCase())}
            >
                {tile}
            </div>
        {/each}
    </div>
{/each}

<style>
.row {
  display: grid;
  grid-template-columns: repeat(5, 4em);
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

.correct {
    background-color: var(--color-correct) !important;
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
</style>