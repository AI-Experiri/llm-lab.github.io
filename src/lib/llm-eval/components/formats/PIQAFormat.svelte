<!--
  REAL DATA from HuggingFace API (baber/piqa - default - validation split)
  {
    "goal": "How do I ready a guinea pig cage for it's new occupants?",
    "sol1": "Provide the guinea pig with a cage full of a few inches of bedding made of ripped paper strips, you will also need to supply it with a water bottle and a food dish.",
    "sol2": "Provide the guinea pig with a cage full of a few inches of bedding made of ripped jeans material, you will also need to supply it with a water bottle and a food dish.",
    "label": 0
  }
-->
<script>
	let { sample, showAnswer = false } = $props();

	const goal = $derived(sample.goal || '');
	const choices = $derived(
		[
			{ label: 'A', text: sample.sol1 || '' },
			{ label: 'B', text: sample.sol2 || '' }
		].filter((c) => c.text)
	);

	function isCorrect(choice) {
		if (!showAnswer) return false;
		// label is 0-indexed: 0 = A, 1 = B
		const correctLabel = String.fromCharCode(65 + sample.label);
		return choice.label === correctLabel;
	}
</script>

<div class="space-y-3">
	<div class="rounded-lg border-l-4 border-[var(--color-primary)] bg-[var(--color-bg)] p-3">
		<p class="mb-1 text-[var(--color-primary)] text-[var(--text-tiny)]">Goal</p>
		<p class="text-[var(--color-text)] text-[var(--text-body)]">{goal}</p>
	</div>

	{#if choices.length > 0}
		<div class="space-y-2">
			<p class="text-[var(--color-muted)] text-[var(--text-tiny)]">Solutions</p>
			<ul class="space-y-1.5">
				{#each choices as choice (choice.label)}
					<li
						class="flex items-start gap-2 rounded-lg p-2 text-[var(--text-small)] transition-colors
            {isCorrect(choice)
							? 'border border-green-700/50 bg-green-900/30'
							: 'border border-transparent bg-[var(--color-bg)]/50'}"
					>
						<span
							class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full font-medium text-[var(--text-tiny)]
              {isCorrect(choice)
								? 'bg-green-600 text-white'
								: 'bg-[var(--color-secondary)] text-[var(--color-muted)]'}"
						>
							{choice.label}
						</span>
						<span class={isCorrect(choice) ? 'text-green-300' : 'text-[var(--color-text)]'}>
							{choice.text}
						</span>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>
