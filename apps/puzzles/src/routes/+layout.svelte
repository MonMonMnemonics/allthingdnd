<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.ico';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}

<style>
	@font-face {
		font-family: 'Jacquard 24';
		font-style: normal;
		font-display: swap;
		font-weight: 400;
		src: url($lib/fonts/Jacquard24-Regular.ttf);
	}

	@font-face {
		font-family: 'Kalam';
		font-style: normal;
		font-display: swap;
		font-weight: 700;
		src: url($lib/fonts/Kalam-Bold.ttf);
	}
</style>