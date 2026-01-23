<!--
  REAL DATA from HuggingFace API (lighteval/siqa - default - validation split)
  {
    "context": "Tracy didn't go home that evening and resisted Riley's attacks.",
    "question": "What does Tracy need to do before this?",
    "answerA": "make a new plan",
    "answerB": "Go home and see Riley",
    "answerC": "Find somewhere to go",
    "label": "3"
  }
-->
<script>
	let { sample, showAnswer = false } = $props();

	const context = $derived(sample.context || '');
	const question = $derived(sample.question || '');
	const choices = $derived(
		[
			{ label: 'A', text: sample.answerA || '' },
			{ label: 'B', text: sample.answerB || '' },
			{ label: 'C', text: sample.answerC || '' }
		].filter((c) => c.text)
	);

	function isCorrect(choice) {
		if (!showAnswer) return false;
		// label is 1-indexed string: "1" = A, "2" = B, "3" = C
		const labelNum = parseInt(sample.label);
		if (isNaN(labelNum)) return false;
		const correctLabel = String.fromCharCode(64 + labelNum);
		return choice.label === correctLabel;
	}
</script>

<div class="space-y-3">
	<div class="rounded-lg border-l-4 border-blue-500 bg-[var(--color-bg)] p-3">
		<p class="mb-1 text-[var(--text-tiny)] text-blue-400">Context</p>
		<p class="text-[var(--color-text)] text-[var(--text-body)]">{context}</p>
	</div>

	<div class="rounded-lg border-l-4 border-[var(--color-primary)] bg-[var(--color-bg)] p-3">
		<p class="mb-1 text-[var(--color-primary)] text-[var(--text-tiny)]">Question</p>
		<p class="text-[var(--color-text)] text-[var(--text-body)]">{question}</p>
	</div>

	{#if choices.length > 0}
		<div class="space-y-2">
			<p class="text-[var(--color-muted)] text-[var(--text-tiny)]">Options ({choices.length})</p>
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
