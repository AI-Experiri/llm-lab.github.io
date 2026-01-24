<!-- ABOUTME: Numbered steps component for showing step-by-step processes -->
<!-- ABOUTME: All styling controlled here - pages only pass steps array -->

<script>
	/**
	 * @typedef {Object} Step
	 * @property {number} step - Step number
	 * @property {string} action - Step title/action
	 * @property {string} detail - Step description
	 */

	/** @type {{ steps: Step[], class?: string }} */
	let { steps = [], class: className = '' } = $props();
</script>

<div class="space-y-4 {className}">
	{#each steps as step, i (i)}
		<div class="flex items-start gap-4">
			<div
				class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/20 font-bold text-[color:var(--color-primary)]"
			>
				{step.step}
			</div>
			<div class="flex-1 rounded-lg border border-[var(--color-muted)]/20 bg-[var(--color-bg)] p-3">
				<h3 class="mb-1 font-bold text-[color:var(--color-primary)]">{step.action}</h3>
				<p class="text-[var(--color-muted)] text-[var(--text-small)]">{step.detail}</p>
			</div>
		</div>
	{/each}
</div>
