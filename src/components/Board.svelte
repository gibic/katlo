<script lang="ts">
    const guessRows:string[][] = [
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', '']
    ]
</script>

{#each guessRows as guessRow, index }
    <div class="row" data-guess={`guessrow-${index}`}>
        {#each guessRow as tile }
            <div class="tile">{tile}</div>
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
    color: var(--tile-text-color);
    text-transform: uppercase;
    user-select: none;
    border: 2px solid var(--color-tone-4);
}

</style>