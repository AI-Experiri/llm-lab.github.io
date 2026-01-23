<!--
  REAL DATA from HuggingFace API (facebook/anli - plain_text - test_r3 split)
  {
    "uid": "b0e63408-53af-4b46-b33d-bf5ba302949f",
    "premise": "It is Sunday today, let's take a look at the most popular posts...",
    "hypothesis": "The day of the passage is usually when Christians praise the lord together",
    "label": 0,
    "reason": "Sunday is considered Lord's Day"
  }
  Labels: 0 = entailment, 1 = neutral, 2 = contradiction
-->
<script>
	let { sample, showAnswer = false } = $props();

	const premise = $derived(sample.premise || '');
	const hypothesis = $derived(sample.hypothesis || '');
	const label = $derived(sample.label);
	const reason = $derived(sample.reason || '');
	const uid = $derived(sample.uid || '');

	const labelMap = {
		0: { text: 'Entailment', color: 'green' },
		1: { text: 'Neutral', color: 'yellow' },
		2: { text: 'Contradiction', color: 'red' }
	};

	const labelInfo = $derived(labelMap[label] || { text: 'Unknown', color: 'gray' });
</script>

<div class="space-y-3">
	{#if uid}
		<div class="text-[var(--color-muted)] text-[var(--text-tiny)]">ID: {uid}</div>
	{/if}

	<div class="rounded-lg border-l-4 border-blue-500 bg-[var(--color-bg)] p-3">
		<p class="mb-1 text-[var(--text-tiny)] text-blue-400">Premise</p>
		<p class="text-[var(--color-text)] text-[var(--text-body)]">{premise}</p>
	</div>

	<div class="rounded-lg border-l-4 border-purple-500 bg-[var(--color-bg)] p-3">
		<p class="mb-1 text-[var(--text-tiny)] text-purple-400">Hypothesis</p>
		<p class="text-[var(--color-text)] text-[var(--text-body)]">{hypothesis}</p>
	</div>

	{#if showAnswer}
		<div class="bg-{labelInfo.color}-900/20 rounded-lg border p-3 border-{labelInfo.color}-700/50">
			<div class="mb-1 flex items-center gap-2">
				<p class="text-[var(--text-tiny)] text-{labelInfo.color}-400">Label</p>
				<span
					class="bg-{labelInfo.color}-900/40 text-{labelInfo.color}-300 rounded-full border px-2 py-0.5 text-[var(--text-tiny)] border-{labelInfo.color}-700/50"
				>
					{labelInfo.text}
				</span>
			</div>
			{#if reason}
				<p class="text-[var(--text-small)] text-{labelInfo.color}-300/80 mt-2">
					<span class="font-medium">Reason:</span>
					{reason}
				</p>
			{/if}
		</div>
	{/if}
</div>
