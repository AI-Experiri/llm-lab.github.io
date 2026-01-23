<!--
  REAL DATA from HuggingFace API (wandb/RAGTruth-processed - default - test split)
  {
    "id": "24",
    "query": "Summarize the following news within 86 words:",
    "context": "The FBI charged a Philadelphia woman on Thursday...",
    "output": "The FBI has charged a Philadelphia woman, Keonna Thomas...",
    "task_type": "Summary",
    "quality": "good",
    "model": "gpt-4-0613",
    "temperature": 0.699999988079071,
    "hallucination_labels": "[]",
    "hallucination_labels_processed": {
      "evident_conflict": 0,
      "baseless_info": 0
    }
  }
-->
<script>
	let { sample, showAnswer = false } = $props();

	const query = $derived(sample.query || '');
	const context = $derived(sample.context || '');
	const output = $derived(sample.output || '');
	const taskType = $derived(sample.task_type || '');
	const quality = $derived(sample.quality || '');
	const model = $derived(sample.model || '');
	const hallucination = $derived(sample.hallucination_labels_processed || {});

	const hasHallucination = $derived(
		(hallucination.evident_conflict || 0) > 0 || (hallucination.baseless_info || 0) > 0
	);

	function getQualityColor(q) {
		if (q === 'good') return 'bg-green-900/30 text-green-300 border-green-700/50';
		if (q === 'bad') return 'bg-red-900/30 text-red-300 border-red-700/50';
		return 'bg-gray-900/30 text-gray-300 border-gray-700/50';
	}
</script>

<div class="space-y-3">
	<!-- Metadata badges -->
	<div class="flex flex-wrap items-center gap-2">
		{#if taskType}
			<span
				class="rounded border border-blue-700/50 bg-blue-900/30 px-2 py-0.5 text-[var(--text-tiny)] text-blue-300"
			>
				{taskType}
			</span>
		{/if}
		{#if quality}
			<span class="rounded border px-2 py-0.5 text-[var(--text-tiny)] {getQualityColor(quality)}">
				{quality}
			</span>
		{/if}
		{#if model}
			<span
				class="rounded border border-purple-700/50 bg-purple-900/30 px-2 py-0.5 text-[var(--text-tiny)] text-purple-300"
			>
				{model}
			</span>
		{/if}
	</div>

	<!-- Query/Task -->
	<div class="rounded-lg border-l-4 border-cyan-500 bg-[var(--color-bg)] p-3">
		<p class="mb-1 text-[var(--text-tiny)] text-cyan-400">Query</p>
		<p class="text-[var(--color-text)] text-[var(--text-body)]">{query}</p>
	</div>

	<!-- Context/Source -->
	{#if context}
		<details class="group">
			<summary
				class="flex cursor-pointer items-center gap-2 text-[var(--color-muted)] text-[var(--text-small)] hover:text-[var(--color-text)]"
			>
				<span class="transition-transform group-open:rotate-90">+</span>
				Show Context ({context.length} chars)
			</summary>
			<div
				class="mt-2 max-h-48 overflow-y-auto rounded-lg border border-[var(--color-secondary)] bg-[var(--color-bg)] p-3"
			>
				<p class="whitespace-pre-wrap text-[var(--color-text)] text-[var(--text-small)]">
					{context}
				</p>
			</div>
		</details>
	{/if}

	<!-- Model Output -->
	{#if showAnswer && output}
		<div
			class="rounded-lg border-l-4 bg-[var(--color-bg)] p-3 {hasHallucination
				? 'border-red-500'
				: 'border-green-500'}"
		>
			<div class="mb-1 flex items-center gap-2">
				<p class="text-[var(--text-tiny)] {hasHallucination ? 'text-red-400' : 'text-green-400'}">
					Model Output
				</p>
				{#if hasHallucination}
					<span
						class="rounded border border-red-700/50 bg-red-900/50 px-2 py-0.5 text-[var(--text-tiny)] text-red-300"
					>
						Has Hallucination
					</span>
				{:else}
					<span
						class="rounded border border-green-700/50 bg-green-900/50 px-2 py-0.5 text-[var(--text-tiny)] text-green-300"
					>
						No Hallucination
					</span>
				{/if}
			</div>
			<p class="text-[var(--color-text)] text-[var(--text-body)]">{output}</p>
		</div>

		<!-- Hallucination Details -->
		{#if hallucination.evident_conflict !== undefined || hallucination.baseless_info !== undefined}
			<div class="grid grid-cols-2 gap-2">
				<div class="rounded border border-[var(--color-secondary)] bg-[var(--color-bg)] p-2">
					<p class="text-[var(--color-muted)] text-[var(--text-tiny)]">Evident Conflict</p>
					<p
						class="text-[var(--text-small)] {hallucination.evident_conflict > 0
							? 'text-red-400'
							: 'text-green-400'}"
					>
						{hallucination.evident_conflict || 0}
					</p>
				</div>
				<div class="rounded border border-[var(--color-secondary)] bg-[var(--color-bg)] p-2">
					<p class="text-[var(--color-muted)] text-[var(--text-tiny)]">Baseless Info</p>
					<p
						class="text-[var(--text-small)] {hallucination.baseless_info > 0
							? 'text-red-400'
							: 'text-green-400'}"
					>
						{hallucination.baseless_info || 0}
					</p>
				</div>
			</div>
		{/if}
	{/if}
</div>
