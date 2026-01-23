<!--
  REAL DATA from HuggingFace API (TIGER-Lab/TheoremQA - default - test split)
  {
    "Question": "How many ways are there to divide a set of 8 elements into 5 non-empty ordered subsets?",
    "Answer": "11760",
    "Answer_type": "integer",
    "Picture": null
  }
-->
<script>
	let { sample, showAnswer = false } = $props();

	const question = $derived(sample.Question || '');
	const answer = $derived(sample.Answer || '');
	const answerType = $derived(sample.Answer_type || '');
</script>

<div class="space-y-3">
	{#if answerType}
		<div
			class="inline-block rounded border border-purple-700/50 bg-purple-900/30 px-2 py-0.5 text-[var(--text-tiny)] text-purple-300"
		>
			Answer type: {answerType}
		</div>
	{/if}

	{#if sample.Picture}
		<div class="rounded-lg border border-[var(--color-secondary)] bg-[var(--color-bg)] p-2">
			<img src={sample.Picture} alt="Problem illustration" class="max-h-64 rounded" />
		</div>
	{/if}

	<div class="rounded-lg border-l-4 border-[var(--color-primary)] bg-[var(--color-bg)] p-3">
		<p class="mb-1 text-[var(--color-primary)] text-[var(--text-tiny)]">Question</p>
		<p class="whitespace-pre-wrap text-[var(--color-text)] text-[var(--text-body)]">{question}</p>
	</div>

	{#if showAnswer && answer}
		<div class="rounded-lg border border-green-700/50 bg-green-900/20 p-3">
			<p class="mb-1 text-[var(--text-tiny)] text-green-400">Answer</p>
			<p class="font-mono text-[var(--text-body)] text-green-200">{answer}</p>
		</div>
	{/if}
</div>
