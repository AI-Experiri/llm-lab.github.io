<!-- ABOUTME: Full page wrapper providing consistent structure across all pages -->
<!-- ABOUTME: Handles min-height, flex layout, max-width container, and padding -->

<script>
	let { children } = $props();
</script>

<main class="flex min-h-screen flex-col bg-[var(--color-bg)] px-6 py-4 md:px-10 lg:px-16">
	<div class="mx-auto flex w-full max-w-7xl flex-1 flex-col">
		{@render children()}
	</div>
</main>
