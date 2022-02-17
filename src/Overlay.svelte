<script lang="ts">
import { fly } from 'svelte/transition';
import { onMount } from "svelte";
import { settings } from "./store";
import Setting from './components/Setting.svelte'

export let showOverlay:boolean

let root: HTMLElement;
	onMount(() => {
		root = document.documentElement;
	});
	$: {
		if (root) {
			$settings.dark ? root.classList.add("dark") : root.classList.remove("dark");
			localStorage.setItem("settings", JSON.stringify($settings));
		}
	}

</script>

{#if showOverlay}
<section class="overlay" transition:fly="{{ y: 30, duration: 500 }}">
    <div class="content">
        <header>
            <h2>Settings</h2>
        </header>
		<Setting type="switch" bind:value={$settings.dark}>
			<span slot="title">Dark Theme</span>
		</Setting>
        <button on:click>
            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                <path fill="var(--color-tone-1)" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
              </svg>
        </button>
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
    margin-bottom: 2rem;
}

@media only screen and (min-device-width: 320px) and (max-device-width: 480px) {
.content {
    max-width: 100%;
    padding: 0;
}
}
</style>