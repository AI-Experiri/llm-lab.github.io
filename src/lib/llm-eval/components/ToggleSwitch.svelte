<script>
	let { label, checked = false, color = 'green', onchange } = $props();
</script>

<label class="flex cursor-pointer items-center gap-2">
	<span class="text-[var(--color-muted)] text-[var(--text-tiny)]">{label}</span>
	<button
		onclick={() => onchange(!checked)}
		aria-label="Toggle {label}"
		class="relative h-4 w-8 rounded-full transition-colors {checked
			? `bg-${color}-600`
			: 'bg-[var(--color-secondary)]'}"
	>
		<span
			class="absolute top-0.5 left-0.5 h-3 w-3 rounded-full bg-white transition-transform {checked
				? 'translate-x-4'
				: ''}"
		></span>
	</button>
</label>
