<!-- ABOUTME: Wrapper for lazy mount + keep alive behavior -->
<!-- ABOUTME: Mounts children on first show, then keeps in DOM but hidden -->

<script>
	let { show = false, children } = $props();

	let hasBeenShown = $state(false);

	$effect(() => {
		if (show && !hasBeenShown) {
			hasBeenShown = true;
		}
	});
</script>

{#if hasBeenShown}
	<div class:hidden={!show} inert={!show ? true : undefined}>
		{@render children()}
	</div>
{/if}

<style>
	.hidden {
		display: none !important;
	}
</style>
