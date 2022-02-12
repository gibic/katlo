import { writable } from "svelte/store";

type Settings = {
	dark: boolean,
};


export function createDefaultSettings(): Settings {
	return {
		dark: true,
	};
}

export const settings = writable(createDefaultSettings());