<!-- ABOUTME: Hero/intro section with gradient border and background -->
<!-- ABOUTME: Used for page introductions and key topic headers -->

<script>
	let {
		children,
		title = '',
		subtitle = '',
		icon = '',
		accentColor = 'pink',
		customGradient = '',
		class: className = ''
	} = $props();

	const gradients = {
		pink: 'from-[var(--color-primary)]/20 to-pink-600/20',
		emerald: 'from-[var(--color-primary)]/20 to-emerald-600/20',
		cyan: 'from-cyan-600/20 to-[var(--color-primary)]/20',
		amber: 'from-amber-600/20 to-[var(--color-primary)]/20'
	};

	let gradient = $derived(customGradient || gradients[accentColor] || gradients.pink);
</script>

<section
	class="rounded-lg border border-[var(--color-primary)]/30 bg-gradient-to-br p-4 {gradient} {className}"
>
	<div class="flex items-start gap-4">
		{#if icon}
			<div class="text-5xl">{icon}</div>
		{/if}
		<div class="flex-1">
			{#if title}
				<h2 class="mb-2 font-bold text-[var(--color-text)] text-[var(--text-h2)]">
					{title}
				</h2>
			{/if}
			{#if subtitle}
				<p class="text-[var(--color-muted)] text-[var(--text-tiny)] italic">
					{subtitle}
				</p>
			{/if}
			{@render children()}
		</div>
	</div>
</section>
