<script lang="ts">
	import Switch from "./Switch.svelte";

	export let value: any;
	export let type;
	const types = {
		switch: Switch,
	};
</script>

<div class="setting">
	<div>
		<div class="title"><slot name="title" /></div>
		<div class="desc"><slot name="desc" /></div>
	</div>
	<svelte:component this={types[type]} bind:value />
</div>

<style>
	.setting {
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 1px solid var(--color-tone-4);
		padding: 16px 0;
	}
	.title {
		font-size: 18px;
		font-weight: 500;
	}
	.desc {
		font-size: 16px;
		color: var(--fg-secondary);
	}
	@media only screen and (min-device-width: 320px) and (max-device-width: 480px) {
		.setting {
			padding: 16px;
		}
	}

</style>