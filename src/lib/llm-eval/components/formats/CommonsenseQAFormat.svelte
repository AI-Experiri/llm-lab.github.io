<!--
  REAL DATA from HuggingFace API (tau/commonsense_qa - default - validation split)
  {
    "id": "1afa02df02c908a558b4036e80242fac",
    "question": "A revolving door is convenient for two direction travel, but it also serves as a security measure at a what?",
    "question_concept": "revolving door",
    "choices": {
      "label": ["A", "B", "C", "D", "E"],
      "text": ["bank", "library", "department store", "mall", "new york"]
    },
    "answerKey": "A"
  }
-->
<script>
	let { sample, showAnswer = false } = $props();

	const question = $derived(sample.question || '');
	const concept = $derived(sample.question_concept || '');
	const choices = $derived(() => {
		if (!sample.choices) return [];
		return sample.choices.text.map((text, i) => ({
			label: sample.choices.label?.[i] || String.fromCharCode(65 + i),
			text
		}));
	});

	function isCorrect(choice) {
		if (!showAnswer) return false;
		return choice.label === sample.answerKey;
	}
</script>

<div class="space-y-3">
	{#if sample.id}
		<div class="text-[var(--color-muted)] text-[var(--text-tiny)]">ID: {sample.id}</div>
	{/if}

	{#if concept}
		<div
			class="inline-block rounded border border-blue-700/50 bg-blue-900/30 px-2 py-0.5 text-[var(--text-tiny)] text-blue-300"
		>
			Concept: {concept}
		</div>
	{/if}

	<div class="rounded-lg border-l-4 border-[var(--color-primary)] bg-[var(--color-bg)] p-3">
		<p class="mb-1 text-[var(--color-primary)] text-[var(--text-tiny)]">Question</p>
		<p class="text-[var(--color-text)] text-[var(--text-body)]">{question}</p>
	</div>

	{#if choices().length > 0}
		<div class="space-y-2">
			<p class="text-[var(--color-muted)] text-[var(--text-tiny)]">Options ({choices().length})</p>
			<ul class="space-y-1.5">
				{#each choices() as choice (choice.label)}
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
