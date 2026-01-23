<!--
  REAL DATA from HuggingFace API (pminervini/HaluEval - qa_samples - data split)
  {
    "knowledge": "Arthur's Magazine (1844–1846) was an American literary periodical published in Philadelphia in the 19th century.First for Women is a woman's magazine published by Bauer Media Group in the USA.",
    "question": "Which magazine was started first Arthur's Magazine or First for Women?",
    "answer": "First for Women was started first.",
    "hallucination": "yes"
  }
-->
<script>
	let { sample, showAnswer = false } = $props();

	const knowledge = $derived(sample.knowledge || '');
	const question = $derived(sample.question || '');
	const answer = $derived(sample.answer || '');
	const hallucination = $derived(sample.hallucination || '');
	const isHallucination = $derived(hallucination === 'yes' || hallucination === true);
</script>

<div class="space-y-3">
	<!-- Knowledge/Context -->
	{#if knowledge}
		<div class="rounded-lg border border-[var(--color-secondary)] bg-[var(--color-bg)] p-3">
			<p class="mb-1 text-[var(--color-muted)] text-[var(--text-tiny)]">Knowledge</p>
			<p class="text-[var(--color-text)] text-[var(--text-small)]">{knowledge}</p>
		</div>
	{/if}

	<!-- Question -->
	<div class="rounded-lg border-l-4 border-blue-500 bg-[var(--color-bg)] p-3">
		<p class="mb-1 text-[var(--text-tiny)] text-blue-400">Question</p>
		<p class="text-[var(--color-text)] text-[var(--text-body)]">{question}</p>
	</div>

	<!-- Answer with hallucination label -->
	{#if showAnswer && answer}
		<div
			class="rounded-lg border-l-4 bg-[var(--color-bg)] p-3 {isHallucination
				? 'border-red-500'
				: 'border-green-500'}"
		>
			<div class="mb-1 flex items-center gap-2">
				<p class="text-[var(--text-tiny)] {isHallucination ? 'text-red-400' : 'text-green-400'}">
					Answer
				</p>
				<span
					class="rounded px-2 py-0.5 text-[var(--text-tiny)] {isHallucination
						? 'border border-red-700/50 bg-red-900/50 text-red-300'
						: 'border border-green-700/50 bg-green-900/50 text-green-300'}"
				>
					{isHallucination ? 'Hallucination' : 'Factual'}
				</span>
			</div>
			<p class="text-[var(--color-text)] text-[var(--text-body)]">{answer}</p>
		</div>
	{/if}
</div>
