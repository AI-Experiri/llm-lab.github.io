<!--
  REAL DATA from HuggingFace API (facebook/anli - plain_text config - test_r1 split):
  {
    "uid": "4aae63a8-fcf7-406c-a2f3-50c31c5934a9",
    "premise": "Ernest Jones is a British jeweller and watchmaker. Established in 1949, its first store was opened in Oxford Street, London. Ernest Jones specialises in diamonds and watches, stocking brands such as Gucci and Emporio Armani. Ernest Jones is part of the Signet Jewelers group.",
    "hypothesis": "The first Ernest Jones store was opened on the continent of Europe.",
    "label": 0,
    "reason": "The first store was opened in London, which is in Europe. It may have been difficult for the system because continents weren't mentioned."
  }
  Labels: 0 = Entailment, 1 = Neutral, 2 = Contradiction
-->
<script>
	let { sample, dataset, showAnswer = true } = $props();

	const fields = $derived(dataset.fields || {});

	// ANLI format
	const premise = $derived(sample[fields.premise] || sample.premise || sample.context || '');
	const hypothesis = $derived(sample[fields.hypothesis] || sample.hypothesis || '');
	const label = $derived(sample[fields.label] ?? sample.label ?? -1);

	// LAMBADA format (text continuation)
	const text = $derived(sample[fields.text] || sample.text || '');

	const labelNames = ['Entailment', 'Neutral', 'Contradiction'];

	function getLabelColor(l) {
		if (l === 0) return 'green'; // entailment
		if (l === 1) return 'yellow'; // neutral
		if (l === 2) return 'red'; // contradiction
		return 'gray';
	}
</script>

<div class="space-y-3">
	{#if premise || hypothesis}
		<!-- NLI Format (ANLI) -->
		<div class="rounded-lg border-l-4 border-blue-500 bg-[var(--color-bg)] p-3">
			<p class="mb-1 text-[var(--text-tiny)] text-blue-400">Premise</p>
			<p class="text-[var(--color-text)] text-[var(--text-body)]">{premise}</p>
		</div>

		<div class="rounded-lg border-l-4 border-purple-500 bg-[var(--color-bg)] p-3">
			<p class="mb-1 text-[var(--text-tiny)] text-purple-400">Hypothesis</p>
			<p class="text-[var(--color-text)] text-[var(--text-body)]">{hypothesis}</p>
		</div>

		{#if showAnswer && label >= 0}
			{@const color = getLabelColor(label)}
			<div class="flex items-center gap-2">
				<span class="text-[var(--color-muted)] text-[var(--text-small)]">Relation:</span>
				<span
					class="bg-{color}-900/40 text-{color}-300 rounded-full border px-3 py-1 text-[var(--text-small)] border-{color}-700/50 font-medium"
				>
					{labelNames[label] || 'Unknown'}
				</span>
			</div>
		{/if}
	{:else if text}
		<!-- LAMBADA Format (text with last word prediction) -->
		<div class="rounded-lg border-l-4 border-cyan-500 bg-[var(--color-bg)] p-3">
			<p class="mb-1 text-[var(--text-tiny)] text-cyan-400">Text (predict the last word)</p>
			<p class="whitespace-pre-wrap text-[var(--color-text)] text-[var(--text-body)]">{text}</p>
		</div>
	{:else}
		<p class="text-[var(--color-muted)] text-[var(--text-small)]">No data available</p>
	{/if}
</div>
