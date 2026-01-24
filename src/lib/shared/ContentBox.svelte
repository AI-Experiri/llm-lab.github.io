<!-- ABOUTME: Inner content box with semantic variants for different purposes -->
<!-- ABOUTME: All styling controlled here - pages only pass variant name and title -->

<script>
	let { children, title = '', variant = 'default', class: className = '' } = $props();

	// All design decisions live here
	const variants = {
		default: {
			bg: 'bg-[var(--color-secondary)]',
			border: '',
			titleColor: 'text-[var(--color-primary)]'
		},
		dark: {
			bg: 'bg-[var(--color-bg)]',
			border: 'border border-[var(--color-muted)]/20',
			titleColor: 'text-[var(--color-primary)]'
		},
		warning: {
			bg: 'bg-[var(--color-bg)]',
			border: 'border border-red-500/30',
			titleColor: 'text-red-400'
		},
		success: {
			bg: 'bg-[var(--color-bg)]',
			border: 'border border-green-500/30',
			titleColor: 'text-green-400'
		},
		highlight: {
			bg: 'bg-[var(--color-primary)]/10',
			border: 'border border-[var(--color-primary)]/30',
			titleColor: 'text-[var(--color-primary)]'
		}
	};

	let style = $derived(variants[variant] || variants.default);
</script>

<div class="rounded-lg p-3 {style.bg} {style.border} {className}">
	{#if title}
		<h3 class="mb-3 font-bold {style.titleColor}">{title}</h3>
	{/if}
	{@render children()}
</div>
