<!--
  NOTE: FRAMES and RAGTruth datasets may require authentication on HuggingFace API
  Expected FRAMES format:
  {
    "Prompt": "What year was the first iPhone released?",
    "Answer": "2007",
    "reasoning_types": "temporal, numerical"
  }

  Expected RAGTruth format:
  {
    "question": "What is the capital of France?",
    "response": "The capital of France is Paris.",
    "label": 1
  }
-->
<script>
	let { sample, dataset, showAnswer = true } = $props();

	const fields = $derived(dataset.fields || {});

	// FRAMES format
	const prompt = $derived(
		sample[fields.Prompt] || sample.Prompt || sample.prompt || sample.question || ''
	);
	const answer = $derived(sample[fields.Answer] || sample.Answer || sample.answer || '');
	const reasoningTypes = $derived(sample[fields.reasoning_types] || sample.reasoning_types || '');

	// RAGTruth format
	const response = $derived(sample[fields.response] || sample.response || '');
	const question = $derived(sample[fields.question] || sample.question || prompt);

	// Parse reasoning types if it's a string
	function getReasoningTypes() {
		if (!reasoningTypes) return [];
		if (Array.isArray(reasoningTypes)) return reasoningTypes;
		if (typeof reasoningTypes === 'string') {
			return reasoningTypes
				.split(',')
				.map((t) => t.trim())
				.filter(Boolean);
		}
		return [];
	}

	const types = $derived(getReasoningTypes());

	function getTypeColor(type) {
		const t = type.toLowerCase();
		if (t.includes('numerical')) return 'yellow';
		if (t.includes('temporal')) return 'blue';
		if (t.includes('tabular')) return 'green';
		if (t.includes('multiple')) return 'purple';
		if (t.includes('post')) return 'pink';
		return 'gray';
	}
</script>

<div class="space-y-3">
	<!-- Reasoning Types Tags -->
	{#if types.length > 0}
		<div class="flex flex-wrap items-center gap-2">
			{#each types as type (type)}
				{@const color = getTypeColor(type)}
				<span
					class="bg-{color}-900/40 text-{color}-300 rounded-full border px-2 py-0.5 text-[var(--text-tiny)] border-{color}-700/50"
				>
					{type}
				</span>
			{/each}
		</div>
	{/if}

	<!-- Question/Prompt -->
	<div class="rounded-lg border-l-4 border-cyan-500 bg-[var(--color-bg)] p-3">
		<p class="mb-1 text-[var(--text-tiny)] text-cyan-400">Query</p>
		<p class="text-[var(--color-text)] text-[var(--text-body)]">{question}</p>
	</div>

	<!-- Response (RAGTruth) -->
	{#if response && showAnswer}
		<div class="rounded-lg border-l-4 border-purple-500 bg-[var(--color-bg)] p-3">
			<p class="mb-1 text-[var(--text-tiny)] text-purple-400">Model Response</p>
			<p
				class="max-h-48 overflow-y-auto whitespace-pre-wrap text-[var(--color-text)] text-[var(--text-small)]"
			>
				{response}
			</p>
		</div>
	{/if}

	<!-- Answer -->
	{#if showAnswer && answer}
		<div class="rounded-lg border border-green-700/30 bg-green-900/20 p-3">
			<p class="mb-1 text-[var(--text-tiny)] text-green-400">Ground Truth Answer</p>
			<p class="text-[var(--text-body)] text-green-300">{answer}</p>
		</div>
	{/if}
</div>
