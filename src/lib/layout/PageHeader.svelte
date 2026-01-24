<!-- ABOUTME: Consistent page header with title, optional subtitle, and tab slot -->
<!-- ABOUTME: Fixed height header that stays consistent across all pages -->

<script>
	import { resolve } from '$app/paths';

	let { title, subtitle = '', icon = '', showHomeLink = true, children } = $props();
</script>

<header class="mb-4 flex h-12 items-center gap-4">
	{#if showHomeLink}
		<a
			href={resolve('/')}
			class="flex items-center gap-1 text-[var(--color-muted)] text-[var(--text-small)] transition-colors hover:text-[var(--color-primary)]"
			aria-label="Go to home page"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="h-8 w-8"
			>
				<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
				<polyline points="9 22 9 12 15 12 15 22" />
			</svg>
		</a>
	{/if}
	{#if icon}
		<span class="text-4xl">{icon}</span>
	{/if}
	<h1 class="font-bold text-[var(--color-primary)] text-[var(--text-h1)]">
		{title}
	</h1>
	{#if subtitle}
		<span class="text-[var(--color-muted)] text-[var(--text-small)]">{subtitle}</span>
	{/if}
	{#if children}
		{@render children()}
	{/if}
</header>
