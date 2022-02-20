<script lang="ts">
import { fly } from 'svelte/transition';
import { settings } from "./store";
import Setting from './components/Setting.svelte'

export let showOverlay:boolean

</script>

{#if showOverlay}
<section class="overlay" transition:fly="{{ y: 30, duration: 500 }}">
    <div class="content">
        <header>
            <h2>Settings</h2>
            <button on:click>
                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                    <path fill="var(--color-tone-1)" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
                  </svg>
            </button>
        </header>
		<Setting type="switch" bind:value={$settings.dark}>
			<span slot="title">Dark Theme</span>
		</Setting>
        <div class="block">
            <div class="block-left">
                <h4>Komunitas</h4>
                <p>Pertemanan dunia maya</p>
            </div>
            <div class="block-right">
                <a href="https://twitter.com/ginseladipura" target="_blank">Twitter</a>
            </div>
        </div>
        <div class="block">
            <div class="block-left">
                <h4>Feedback</h4>
                <p>Sumbang saran, pertanyaan, dan sebagainya</p>
            </div>
            <div class="block-right">
                <a href="mailto:ginanjar.seladipura@gmail.com" target="_blank">Email</a>
            </div>
        </div>
        <div class="box-bottom">
            <p><small>Adopted from <a href="https://www.nytimes.com/games/wordle/index.html" target="_blank">Wordle</a> | Developed by: <a href="https://twitter.com/ginseladipura" target="_blank">Gin Seladipura</a></small></p>
        </div>
    </div>
</section>
{/if}

<style>
.overlay {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    justify-content: center;
    background-color: var(--color-background);
    z-index: 2000;
    display: flex;
}

.content {
    position: relative;
    color: var(--color-tone-1);
    max-width: 500px;
    width: 100%;
    overflow-y: auto;
    height: 100%;
    display: flex;
    flex-direction: column;    
    margin: 0 auto;
}
header {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
}

button {
    background-color: transparent;
    outline: none;
    border: none;
    top: 10px;
    position: absolute;
    right: 0;
    user-select: none;
    cursor: pointer;
}

h2 {
    font-size: 16px;
    text-transform: uppercase;
    margin: 2rem 0;
}

.box-bottom {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    flex-basis: 100%;
    flex-grow: 1;
    padding: 1rem;
    font-size: 12px;
    color: var(--color-tone-2);
}

a {
color: var(--color-tone-2)
}
.block {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0;
    border-bottom: 1px solid var(--color-tone-4);
}
.block-left p {
    font-size: 12px;
    color: var(--color-tone-2);
    font-weight: 300;
    margin: 5px 0;
}
@media only screen and (min-device-width: 320px) and (max-device-width: 480px) {
.content {
    max-width: 100%;
    padding: 0;
}
.block {
    padding: 16px;
}
}
</style>