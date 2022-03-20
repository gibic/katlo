<script lang="ts">
import { gameStatus } from "../store";

import { onDestroy, createEventDispatcher } from "svelte";
import { fade,fly } from 'svelte/transition';
export let showModal = false
export let stats = undefined

const dispatch = createEventDispatcher()

const HOUR = 3600000;
const MINUTE = 60000;
const SECOND = 1000;
let distance = 1000;

const tomorrow = new Date(+new Date().setHours(0, 0, 0, 0) + 86400000);
const t = tomorrow.getTime()

const x = setInterval(function() {
    const now = new Date().getTime();
    distance = t - now; 
    if(distance < 1000) showModal = false
    if (distance < 0) {
        clearInterval(x) 
    }
}, 1000);


onDestroy(function() {
     clearInterval(x);
});
</script>
{#if showModal}
<div class="overlay" class:visible={showModal} in:fade out:fly="{{ y: 30, duration: 500 }}">
    <div class="wrapper" class:visible={showModal}>
        <header class="modal-header">
            <slot name="head"></slot>
            <button on:click>
                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                    <path fill="var(--color-tone-1)" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
                </svg>
            </button>
        </header>
        <section class="modal-body">
            <slot name="body"></slot>
        </section>
        <section class="modal-footer">
            <slot name="footer">
            {#if stats.played > 0 && $gameStatus !== 'IN_PROGRESS'}
            <div class="footer-left">
                <h5>Kata Berikutnya</h5>
                <div class="clock">
                    {`${Math.floor(distance / HOUR)}`.padStart(2, "0")}:{`${Math.floor((distance % HOUR) / MINUTE)}`.padStart(2, "0")}:{`${Math.floor((distance % MINUTE) / SECOND)}`.padStart(2, "0")}
                </div>
                </div>
                <div class="footer-right">
                <button on:click={() => dispatch('tweet')} class="tweet">
                    <h6 class="modal-footer-title">Tweet</h6>
                    <svg width="24" height="24" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg"><title>twitter-logo</title><g fill="none" fill-rule="evenodd"><path d="M170.2264 442.7654c162.2648 0 251.0168-140.0367 251.0168-261.4758 0-3.9775 0-7.9371-.258-11.8788 17.2659-13.009 32.1701-29.1167 44.0148-47.5687-16.1013 7.4318-33.1817 12.3057-50.6712 14.4587 18.4168-11.4849 32.2005-29.5486 38.786-50.8295-17.3177 10.7044-36.2637 18.2483-56.0204 22.3062-27.3466-30.29-70.8-37.7036-105.9942-18.0837-35.194 19.62-53.3763 61.3941-44.351 101.8979-70.9346-3.7043-137.0242-38.6047-181.8212-96.0154-23.4157 41.9903-11.4554 95.7083 27.3136 122.6754-14.0397-.4335-27.7732-4.3786-40.0416-11.5025v1.1646c.0115 43.7452 29.6141 81.4229 70.778 90.085-12.9882 3.6897-26.6156 4.229-39.8352 1.5766 11.5575 37.4355 44.6783 63.0807 82.4224 63.8192-31.2398 25.5748-69.831 39.4584-109.564 39.4166A172.495 172.495 0 0 1 35 401.4854c40.345 26.9696 87.2885 41.275 135.2264 41.2083" fill="#ffffff"/><path d="M35 35h430v430H35z"/></g></svg>
                </button>
                <button on:click={() => dispatch('share')}>
                    <h6 class="modal-footer-title">Bagikan</h6>
                    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                        <path fill="var(--white)" d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92zM18 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM6 13c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm12 7.02c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"></path>
                    </svg>
                </button>
            </div>
            {/if}
            </slot>
        </section>
    </div>
</div>
{/if}
<style>
    .overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: var(--opacity-50);
        z-index: 3000;
    }
    .wrapper {
        border-radius: 8px;
        border: 1px solid var(--color-tone-6);
        background-color: var(--modal-content-bg);
        color: var(--color-tone-1);
        box-shadow: 0 4px 23px 0 rgb(0 0 0 / 20%);
        width: 90%;
        max-height: 90%;
        overflow-y: auto;
        max-width: 500px;
        padding: 16px;
        box-sizing: border-box;
        opacity: 0;
    }
    .visible {
        transition: all 1000ms ease-in;
        opacity: 1;
    }
    .modal-header {
        text-align: center;
        margin-bottom: 32px;
        position: relative;
    }
    .modal-header button {
        position: absolute;
        right:0;
        top: 0;
        background-color: transparent;
        border: none;
        cursor: pointer;
    }
    
.modal-footer {
    margin: 24px 0;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
}
h6.modal-footer-title {
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  text-align: center;
  margin-bottom: 0;
}
.clock {
    font-size: 32px;
    font-weight: 400;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    letter-spacing: 0.05em;
}
.footer-right {
    width: 100%;
}
.footer-right button {
    background-color: var(--key-bg-correct);
    color: var(--key-evaluated-text-color);
    font-family: inherit;
    font-weight: bold;
    border-radius: 4px;
    cursor: pointer;
    border: none;
    user-select: none;
    display: flex;
    justify-content: center;
    align-items: center;
    text-transform: uppercase;
    -webkit-tap-highlight-color: rgba(0,0,0,0.3);
    width: 80%;
    font-size: 20px;
    height: 52px;
    margin-bottom: .5rem;
}
.footer-right button.tweet {
    background-color: #1DA1F2;
}
.footer-left {
    text-align: center;
}
.footer-left h5 {
    font-weight: 700;
    text-transform: uppercase;
    font-size: 14px;
    letter-spacing: .1ch;
}
</style>