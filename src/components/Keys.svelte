<script lang="ts">
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
<div class="row">
    {#each keys as key }
    <button>{key}</button>
    {/each}
    <button>
        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
            <path fill="var(--color-tone-1)" d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H7.07L2.4 12l4.66-7H22v14zm-11.59-2L14 13.41 17.59 17 19 15.59 15.41 12 19 8.41 17.59 7 14 10.59 10.41 7 9 8.41 12.59 12 9 15.59z"></path>
        </svg>
    </button>
</div>
<style>
    .row {
        display: grid;
        gap: .25em;
        grid-template-columns:repeat(20, minmax(auto, 1.25em));
        grid-auto-rows: 3em;
        justify-content: center;
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
</style>