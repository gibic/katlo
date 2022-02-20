<script lang="ts">
    import { fade, fly } from 'svelte/transition';
    import { visible } from '../store';
    export let message:string
    export let delay = 800

    $: if($visible) setTimeout(() => $visible = false, delay)
</script>
{#if $visible}
<div class="toast" in:fly="{{ y: 20, duration: 200 }}" out:fade>{message}</div>
{/if}
<style>
.toast {
    display: inline-block;
    position: absolute;
    background-color: var(--color-tone-1);
    color: var(--color-tone-7);
    padding: .5rem 1.5rem;
    border-radius: .5rem;
    top: 100px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 5000;
    font-weight: 700;
}
</style>