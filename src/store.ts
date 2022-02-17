import { writable } from "svelte/store";
import { createDefaultSettings, gameState } from "./utils";

export const settings = writable(createDefaultSettings());
export const tileState = writable(gameState());
export const correctState = writable([]);
export const missedState = writable([]);
export const wrongState = writable([]);
export const submitted = writable(false);
export const currentRow = writable(0);
export const visible = writable(false);
