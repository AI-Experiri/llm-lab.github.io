<script>
	let { label, checked = false, onchange } = $props();
</script>

<label class="flex cursor-pointer items-center gap-3">
	<span class="text-[var(--color-muted)] text-[var(--text-small)]">{label}</span>
	<button
		type="button"
		role="switch"
		aria-checked={checked}
		onclick={() => onchange(!checked)}
		aria-label="Toggle {label}"
		class="relative h-6 w-12 rounded-full transition-colors {checked
			? 'bg-blue-600'
			: 'bg-slate-700'}"
	>
		<span
			class="absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform {checked
				? 'translate-x-6'
				: ''}"
		></span>
	</button>
</label>
