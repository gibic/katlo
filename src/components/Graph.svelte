<script lang="ts">
	export let distribution: Guesses;
    export let winModal = false
	
	$: max = Math.max(...Object.values(distribution));
</script>
{#if winModal}
<div>
    <h3 class="modal-title">Sebaran Jawaban</h3>
    <div class="graph-container">
      <ul>
        {#each Object.entries(distribution) as guess, i (guess[0])}
            {#if !isNaN(parseInt(guess[0]))}
            <li>
                <div class="graph-number">{guess[0]}</div>
                <div class="graph-track">
                    <div class="graph-bar" 
                        class:graph-bar--highlight={guess[1] === max && guess[1] !== 0 }
                        style="width: {guess[1] > 0 ? (guess[1] / max) * 100 : 5}%;
                        justify-content:{guess[1] > 0 ? 'flex-end' : 'flex-start'};
                        padding:{guess[1] > 0 ? '0 8px 0 0' : '0 0 0 8px'};">
                        {guess[1]}
                    </div>
                </div>
            </li>
            {/if}
        {/each}
      </ul>
  </div>
</div>
{/if}
<style>
.modal-title {
    font-weight: 700;
    font-size: 16px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    text-align: center;
    margin-bottom: 10px;
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
</style>