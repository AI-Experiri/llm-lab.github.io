<!--
  REAL DATA from HuggingFace API (openai/gsm8k - main config - test split):
  {
    "question": "Janet's ducks lay 16 eggs per day. She eats three for breakfast every morning and bakes muffins for her friends every day with four. She sells the remainder at the farmers' market daily for $2 per fresh duck egg. How much in dollars does she make every day at the farmers' market?",
    "answer": "Janet sells 16 - 3 - 4 = <<16-3-4=9>>9 duck eggs a day.\nShe makes 9 * 2 = $<<9*2=18>>18 every day at the farmer's market.\n#### 18"
  }
-->
<script>
	let { sample, dataset, showAnswer = true } = $props();

	const fields = $derived(dataset.fields || {});
	const question = $derived(
		sample[fields.question] || sample.question || sample.problem || sample.Problem || ''
	);
	const answer = $derived(
		sample[fields.answer] || sample.answer || sample.solution || sample.Answer || ''
	);
</script>

<div class="space-y-3">
	<!-- Question/Problem -->
	<div class="rounded-lg border-l-4 border-yellow-500 bg-[var(--color-bg)] p-3">
		<p class="mb-1 text-[var(--text-tiny)] text-yellow-400">Problem</p>
		<p class="text-[var(--color-text)] text-[var(--text-body)]">{question}</p>
	</div>

	<!-- Answer/Solution -->
	{#if showAnswer && answer}
		<details class="group" open>
			<summary
				class="flex cursor-pointer items-center gap-2 text-[var(--color-primary)] text-[var(--text-small)] transition-colors hover:text-pink-400"
			>
				<span class="transition-transform group-open:rotate-90">+</span>
				Show Solution
			</summary>
			<div class="mt-2 rounded-lg border border-green-700/30 bg-green-900/20 p-3">
				<div class="overflow-x-auto text-[var(--text-small)] text-green-300">{answer}</div>
			</div>
		</details>
	{/if}
</div>
