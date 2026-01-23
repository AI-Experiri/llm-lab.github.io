<!--
  REAL DATA from HuggingFace API (xlangai/DS-1000 - default - test split)
  {
    "prompt": "Problem:\nI have the following DataFrame...",
    "reference_code": "def g(df, List):\n    return df.iloc[List]\n...",
    "metadata": {
      "problem_id": 0,
      "library_problem_id": 0,
      "library": "Pandas",
      "test_case_cnt": 1,
      "perturbation_type": "Origin",
      "perturbation_origin_id": 0
    },
    "code_context": "..."
  }
-->
<script>
	let { sample, showAnswer = false } = $props();

	const prompt = $derived(sample.prompt || '');
	const referenceCode = $derived(sample.reference_code || '');
	const metadata = $derived(sample.metadata || {});
</script>

<div class="space-y-3">
	<div class="flex flex-wrap items-center gap-2">
		{#if metadata.problem_id !== undefined}
			<span class="text-[var(--color-muted)] text-[var(--text-tiny)]"
				>Problem ID: {metadata.problem_id}</span
			>
		{/if}
		{#if metadata.library}
			<span
				class="rounded border border-blue-700/50 bg-blue-900/30 px-2 py-0.5 text-[var(--text-tiny)] text-blue-300"
			>
				{metadata.library}
			</span>
		{/if}
		{#if metadata.perturbation_type}
			<span
				class="rounded border border-purple-700/50 bg-purple-900/30 px-2 py-0.5 text-[var(--text-tiny)] text-purple-300"
			>
				{metadata.perturbation_type}
			</span>
		{/if}
	</div>

	<div class="rounded-lg border-l-4 border-[var(--color-primary)] bg-[var(--color-bg)] p-3">
		<p class="mb-1 text-[var(--color-primary)] text-[var(--text-tiny)]">Problem</p>
		<pre
			class="max-h-80 overflow-y-auto whitespace-pre-wrap text-[var(--color-text)] text-[var(--text-small)]">{prompt}</pre>
	</div>

	{#if showAnswer && referenceCode}
		<div class="rounded-lg border border-green-700/50 bg-green-900/20 p-3">
			<p class="mb-2 text-[var(--text-tiny)] text-green-400">Reference Code</p>
			<pre
				class="overflow-x-auto font-mono whitespace-pre-wrap text-[var(--text-tiny)] text-green-200">{referenceCode}</pre>
		</div>
	{/if}
</div>
