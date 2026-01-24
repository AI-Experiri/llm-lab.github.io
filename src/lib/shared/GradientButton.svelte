<!-- ABOUTME: Primary action button with gradient styling -->
<!-- ABOUTME: Used for fetch/resample actions in sample data pages -->

<script>
	let { onclick, disabled = false, loading = false, children } = $props();
</script>

<button
	type="button"
	{onclick}
	{disabled}
	class="flex cursor-pointer items-center gap-2 rounded-lg bg-gradient-to-r from-[var(--color-primary)] to-pink-600 px-4 py-2 font-medium whitespace-nowrap text-[var(--text-small)] text-white shadow-[var(--color-primary)]/20 shadow-lg transition-all hover:from-pink-600 hover:to-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50"
>
	{#if loading}
		<svg
			class="h-4 w-4 animate-spin"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
		>
			<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
			></circle>
			<path
				class="opacity-75"
				fill="currentColor"
				d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
			></path>
		</svg>
	{/if}
	{@render children()}
</button>
