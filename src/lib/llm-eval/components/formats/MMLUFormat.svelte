<!--
  REAL DATA from HuggingFace API (cais/mmlu - all - test split)
  {
    "question": "Find the degree for the given field extension Q(sqrt(2), sqrt(3), sqrt(18)) over Q.",
    "subject": "abstract_algebra",
    "choices": ["0", "4", "2", "6"],
    "answer": 1
  }
-->
<script>
	let { sample, showAnswer = false } = $props();

	const question = $derived(sample.question || '');
	const subject = $derived(sample.subject || '');
	const choices = $derived(sample.choices || []);
	const correctIndex = $derived(sample.answer);

	function getLabel(index) {
		return String.fromCharCode(65 + index);
	}

	function isCorrect(index) {
		if (!showAnswer) return false;
		return index === correctIndex;
	}
</script>

<div class="space-y-3">
	{#if subject}
		<div class="flex items-center gap-2">
			<span
				class="rounded-full border border-purple-700/50 bg-purple-900/40 px-2 py-0.5 text-[var(--text-tiny)] text-purple-300"
			>
				{subject.replace(/_/g, ' ')}
			</span>
		</div>
	{/if}

	<div class="rounded-lg border-l-4 border-[var(--color-primary)] bg-[var(--color-bg)] p-3">
		<p class="mb-1 text-[var(--color-primary)] text-[var(--text-tiny)]">Question</p>
		<p class="text-[var(--color-text)] text-[var(--text-body)]">{question}</p>
	</div>

	{#if choices.length > 0}
		<div class="space-y-2">
			<p class="text-[var(--color-muted)] text-[var(--text-tiny)]">Options ({choices.length})</p>
			<ul class="space-y-1.5">
				{#each choices as choice, i (i)}
					<li
						class="flex items-start gap-2 rounded-lg p-2 text-[var(--text-small)] transition-colors
            {isCorrect(i)
							? 'border border-green-700/50 bg-green-900/30'
							: 'border border-transparent bg-[var(--color-bg)]/50'}"
					>
						<span
							class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full font-medium text-[var(--text-tiny)]
              {isCorrect(i)
								? 'bg-green-600 text-white'
								: 'bg-[var(--color-secondary)] text-[var(--color-muted)]'}"
						>
							{getLabel(i)}
						</span>
						<span class={isCorrect(i) ? 'text-green-300' : 'text-[var(--color-text)]'}>
							{choice}
						</span>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>
