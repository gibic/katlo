<script lang="ts">
    import { tileState, submitted, currentRow } from "../store";

    export let data:string[][];
    export let shake:boolean = false
    export let jumpy:boolean = false

    let increment = 0
    $: $submitted ? increment = .4 : increment
    
    $: if(shake) {
        setTimeout(() => shake = false, 200)
    }
    $: if(jumpy) {
        increment = .35
    }
</script>
{#each data as guessRow, index }
    <div class="row" class:shake={shake && index == $currentRow}>
        {#each guessRow as tile, idx }
            <div class="tile" 
                class:active={index == $currentRow && tile}
                class:missed={$tileState[index][idx] === 'missed'}
                class:correct={$tileState[index][idx] === 'correct'}
                class:wrong={$tileState[index][idx] === 'wrong'}
                class:dance={index === $currentRow - 1}
                class:jump={jumpy && index === $currentRow - 1}
                style={ $submitted && index < $currentRow && tile ? `transition-delay: ${increment * idx}s;animation-delay: ${increment * idx}s` : ''}
            >
                {tile}
            </div>
        {/each}
    </div>
{/each}

<style>
.row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: .25em;
}

.tile {
    width: 100%;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    font-size: 1.5rem;
    line-height: 1.5rem;
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
    animation: bounce 200ms ease-in-out;
    transition: background-color 100ms linear;
    -webkit-transition: background-color 100ms linear;
    -ms-transition: background-color 100ms linear;
}

.missed {
    background-color: var(--yellow) !important;
    color: var(--tile-text-color);
    border-color: var(--yellow) !important;
}

.correct {
    background-color: var(--color-correct) !important;
    color: var(--tile-text-color);
    border-color: var(--color-correct) !important;
}
.wrong {
    background-color: var(--color-absent);
    color: var(--tile-text-color);
    border-color: var(--color-absent);
}

.dance {
    transition: all 100ms linear;
    -webkit-transition: all 100ms linear;
    -ms-transition: all 100ms linear;
    animation: dance 500ms linear;
}

.shake {
    animation: shake 200ms linear;
}
.jump {
    transition: all 100ms linear;
    -webkit-transition: all 100ms linear;
    -ms-transition: all 100ms linear;
    animation: jump 600ms ease-in-out;
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

@keyframes shake {
    0%,
    90% {
        transform: translateX(-5px);
    }

    50% {
        transform: translateX(-5px);
    }
    30%,
    80% {
        transform: translateX(5px);
    }
    100% {
        transform: translateX(0);
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

@keyframes jump {
    20% {
        transform: translateY(-50%);
    }
    40% {
        transform: translateY(5%);
    }
    60% {
        transform: translateY(-25%);
    }
    80% {
        transform: translateY(2.5%);
    }
    100% {
        transform: translateY(0);
    }
}
</style>