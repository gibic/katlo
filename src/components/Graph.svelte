<script lang="ts">
	export let guesses = 0;
	export let distribution: Guesses;
	
	$: max = Math.max(...Object.values(distribution));
</script>
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
                        class:graph-bar--highlight={parseInt(guess[0]) === guesses}
                        style="width: {(guess[1] / max) * 100}%;">
                        {guess[1]}
                    </div>
                </div>
            </li>
            {/if}
        {/each}
      </ul>
  </div>
</div>
<style>
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
    width:100% !important;
    justify-content:flex-end !important;
    padding-right:8px;
}
</style>