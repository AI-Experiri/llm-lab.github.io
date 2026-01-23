<!--
  REAL DATA from HuggingFace API (juletxara/mgsm - en - test split)
  {
    "question": "Janet's ducks lay 16 eggs per day. She eats three for breakfast every morning and bakes muffins for her friends every day with four. She sells the remainder at the farmers' market daily for $2 per fresh duck egg. How much in dollars does she make every day at the farmers' market?",
    "answer": null,
    "answer_number": 18,
    "equation_solution": null
  }
-->
<script>
	let { sample, showAnswer = false } = $props();

	const question = $derived(sample.question || '');
	const answerNumber = $derived(sample.answer_number);
	const answer = $derived(sample.answer || '');
	const equationSolution = $derived(sample.equation_solution || '');
</script>

<div class="space-y-3">
	<div class="flex items-center gap-2">
		<span
			class="rounded-full border border-cyan-700/50 bg-cyan-900/40 px-2 py-0.5 text-[var(--text-tiny)] text-cyan-300"
		>
			Multilingual Grade School Math
		</span>
	</div>

	<div class="rounded-lg border-l-4 border-cyan-500 bg-[var(--color-bg)] p-3">
		<p class="mb-1 text-[var(--text-tiny)] text-cyan-400">Problem</p>
		<p class="text-[var(--color-text)] text-[var(--text-body)]">{question}</p>
	</div>

	{#if showAnswer}
		{#if equationSolution}
			<div class="rounded-lg border border-blue-700/50 bg-blue-900/20 p-3">
				<p class="mb-2 text-[var(--text-tiny)] text-blue-400">Solution Steps</p>
				<p class="whitespace-pre-wrap text-[var(--color-text)] text-[var(--text-small)]">
					{equationSolution}
				</p>
			</div>
		{/if}
		{#if answer}
			<div class="rounded-lg border border-blue-700/50 bg-blue-900/20 p-3">
				<p class="mb-2 text-[var(--text-tiny)] text-blue-400">Full Answer</p>
				<p class="whitespace-pre-wrap text-[var(--color-text)] text-[var(--text-small)]">
					{answer}
				</p>
			</div>
		{/if}
		{#if answerNumber !== null && answerNumber !== undefined}
			<div class="rounded-lg border border-green-700/50 bg-green-900/20 p-3">
				<span class="text-[var(--text-tiny)] text-green-400">Final Answer: </span>
				<span class="rounded bg-green-600 px-3 py-1 font-bold text-[var(--text-body)] text-white">
					{answerNumber}
				</span>
			</div>
		{/if}
	{/if}
</div>
