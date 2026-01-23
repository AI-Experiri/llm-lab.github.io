<!--
  REAL DATA from HuggingFace API (TIGER-Lab/MMLU-Pro - test split):
  {
    "question_id": 70,
    "question": "Typical advertising regulatory bodies suggest, for example that adverts must not: encourage _________, cause unnecessary ________ or _____, and must not cause _______ offence.",
    "options": [
      "Safe practices, Fear, Jealousy, Trivial",
      "Unsafe practices, Distress, Joy, Trivial",
      "Safe practices, Wants, Jealousy, Trivial",
      "Safe practices, Distress, Fear, Trivial",
      "Unsafe practices, Wants, Jealousy, Serious",
      "Safe practices, Distress, Jealousy, Serious",
      "Safe practices, Wants, Fear, Serious",
      "Unsafe practices, Wants, Fear, Trivial",
      "Unsafe practices, Distress, Fear, Serious"
    ],
    "answer": "I",
    "answer_index": 8,
    "cot_content": "",
    "category": "business",
    "src": "ori_mmlu-business_ethics"
  }
-->
<script>
	let { sample, showAnswer = true } = $props();

	const options = $derived(sample.options || []);
	const answerIndex = $derived(sample.answer_index ?? -1);
	const answerLetter = $derived(sample.answer || '');

	function getLabel(index) {
		return String.fromCharCode(65 + index);
	}

	function isCorrect(index) {
		if (!showAnswer) return false;
		// Check answer_index first (numeric)
		if (answerIndex >= 0 && index === answerIndex) return true;
		// Check letter-based answer (A=0, B=1, etc.)
		if (answerLetter && answerLetter.length === 1) {
			const letterIndex = answerLetter.toUpperCase().charCodeAt(0) - 65;
			return index === letterIndex;
		}
		return false;
	}
</script>

<div class="space-y-3">
	<!-- Question -->
	<div class="rounded-lg border-l-4 border-purple-500 bg-[var(--color-bg)] p-3">
		<div class="mb-1 flex items-center gap-2">
			<p class="text-[var(--text-tiny)] text-purple-400">Question</p>
			{#if sample.category}
				<span
					class="rounded-full border border-purple-700/50 bg-purple-900/40 px-2 py-0.5 text-[10px] text-purple-300"
				>
					{sample.category}
				</span>
			{/if}
		</div>
		<p class="text-[var(--color-text)] text-[var(--text-body)]">{sample.question}</p>
	</div>

	<!-- Options (up to 10) -->
	{#if options.length > 0}
		<div class="space-y-2">
			<p class="text-[var(--color-muted)] text-[var(--text-tiny)]">Options ({options.length})</p>
			<div class="grid gap-1.5">
				{#each options as option, i (i)}
					<div
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
							{option}
						</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Chain of Thought (if available) -->
	{#if sample.cot_content && showAnswer}
		<details class="group text-[var(--text-small)]">
			<summary
				class="flex cursor-pointer items-center gap-2 text-[var(--color-primary)] transition-colors hover:text-pink-400"
			>
				<span class="transition-transform group-open:rotate-90">+</span>
				Chain of Thought
			</summary>
			<div
				class="mt-2 rounded-lg border border-blue-900/30 bg-[var(--color-bg)] p-3 whitespace-pre-wrap text-[var(--color-muted)]"
			>
				{sample.cot_content}
			</div>
		</details>
	{/if}

	<!-- Source info -->
	{#if sample.src}
		<p class="text-[var(--color-muted)] text-[var(--text-tiny)]">
			Source: <span class="text-[var(--color-text)]">{sample.src}</span>
		</p>
	{/if}
</div>
