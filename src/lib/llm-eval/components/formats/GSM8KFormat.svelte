<!--
  REAL DATA from HuggingFace API (openai/gsm8k - main - test split)
  {
    "question": "Janet's ducks lay 16 eggs per day. She eats three for breakfast every morning and bakes muffins for her friends every day with four. She sells the remainder at the farmers' market daily for $2 per fresh duck egg. How much in dollars does she make every day at the farmers' market?",
    "answer": "Janet sells 16 - 3 - 4 = <<16-3-4=9>>9 duck eggs a day.\nShe makes 9 * 2 = $<<9*2=18>>18 every day at the farmer's market.\n#### 18"
  }
-->
<script>
	let { sample, showAnswer = false } = $props();

	const question = $derived(sample.question || '');
	const answer = $derived(sample.answer || '');

	// Extract final answer from #### format
	const finalAnswer = $derived(() => {
		const match = answer.match(/####\s*(.+?)$/m);
		return match ? match[1].trim() : '';
	});

	// Format reasoning steps (convert <<...>> to highlighted calculations)
	const formattedAnswer = $derived(() => {
		return answer
			.replace(/####.+$/m, '')
			.replace(
				/<<([^>]+)>>/g,
				'<span class="bg-blue-900/40 text-blue-300 px-1 rounded text-[var(--text-tiny)] font-mono">$1</span>'
			)
			.trim();
	});
</script>

<div class="space-y-3">
	<div class="rounded-lg border-l-4 border-yellow-500 bg-[var(--color-bg)] p-3">
		<p class="mb-1 text-[var(--text-tiny)] text-yellow-400">Problem</p>
		<p class="text-[var(--color-text)] text-[var(--text-body)]">{question}</p>
	</div>

	{#if showAnswer && answer}
		<div class="rounded-lg border border-green-700/50 bg-green-900/20 p-3">
			<p class="mb-2 text-[var(--text-tiny)] text-green-400">Solution</p>
			<div
				class="leading-relaxed whitespace-pre-wrap text-[var(--color-text)] text-[var(--text-small)]"
			>
				<!-- eslint-disable svelte/no-at-html-tags -->
				{@html formattedAnswer()}
			</div>
			{#if finalAnswer()}
				<div class="mt-3 border-t border-green-700/30 pt-3">
					<span class="text-[var(--text-tiny)] text-green-400">Final Answer: </span>
					<span
						class="rounded bg-green-600 px-2 py-1 font-medium text-[var(--text-small)] text-white"
					>
						{finalAnswer()}
					</span>
				</div>
			{/if}
		</div>
	{/if}
</div>
