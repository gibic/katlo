import { writable } from "svelte/store";
import { createDefaultSettings } from "./utils";

export const settings = writable(createDefaultSettings());
export const correctState = writable([]);
export const missedState = writable([]);
export const wrongState = writable([]);