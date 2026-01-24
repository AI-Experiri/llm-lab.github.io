<!-- ABOUTME: Numbered step list for sequential explanations -->
<!-- ABOUTME: Consistent formatting for 1. 2. 3. style lists -->

<script>
	/**
	 * @typedef {Object} Step
	 * @property {string} [title] - Optional step title (bold)
	 * @property {string} content - Step content/description
	 */

	/** @type {{ steps: Step[] }} */
	let { steps } = $props();
</script>

<div class="space-y-3">
	{#each steps as step, i (i)}
		<div class="flex gap-3">
			<span class="font-bold text-[var(--color-primary)]">{i + 1}.</span>
			<div class="text-[var(--color-muted)] text-[var(--text-small)]">
				{#if step.title}
					<strong class="text-[var(--color-text)]">{step.title}:</strong>
				{/if}
				{step.content}
			</div>
		</div>
	{/each}
</div>
