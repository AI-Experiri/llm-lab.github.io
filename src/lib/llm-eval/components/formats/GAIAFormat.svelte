<!--
  NOTE: gaia-benchmark/GAIA dataset requires authentication on HuggingFace API
  Expected format based on dataset documentation:
  {
    "task_id": "0a1234bc-...",
    "Question": "What is the name of the university where the person who invented the programming language Python studied?",
    "Level": 1,
    "Final answer": "University of Amsterdam",
    "file_name": "",
    "Annotator Metadata": {
      "Steps": "1. Search for the inventor of Python\n2. Find where Guido van Rossum studied...",
      "Tools": "Web browser, Wikipedia",
      "How long did this take?": "5 minutes"
    }
  }
-->
<script>
	let { sample, showAnswer = true } = $props();

	const question = $derived(sample.Question || sample.question || '');
	const answer = $derived(sample['Final answer'] || sample.answer || '');
	const level = $derived(sample.Level || sample.level || 0);
	const fileName = $derived(sample.file_name || '');
	const metadata = $derived(sample['Annotator Metadata'] || {});

	function getLevelColor(l) {
		if (l === 1) return 'green';
		if (l === 2) return 'yellow';
		if (l === 3) return 'red';
		return 'gray';
	}
</script>

<div class="space-y-3">
	<!-- Level and file info -->
	<div class="flex flex-wrap items-center gap-2">
		{#if level}
			{@const color = getLevelColor(level)}
			<span
				class="bg-{color}-900/40 text-{color}-300 rounded-full border px-2 py-0.5 text-[var(--text-tiny)] border-{color}-700/50"
			>
				Level {level}
			</span>
		{/if}
		{#if fileName}
			<span
				class="rounded-full border border-purple-700/50 bg-purple-900/40 px-2 py-0.5 text-[var(--text-tiny)] text-purple-300"
			>
				{fileName}
			</span>
		{/if}
	</div>

	<!-- Question -->
	<div class="rounded-lg border-l-4 border-cyan-500 bg-[var(--color-bg)] p-3">
		<p class="mb-1 text-[var(--text-tiny)] text-cyan-400">Question</p>
		<p class="text-[var(--color-text)] text-[var(--text-body)]">{question}</p>
	</div>

	<!-- Answer -->
	{#if showAnswer && answer}
		<div class="rounded-lg border border-green-700/30 bg-green-900/20 p-3">
			<p class="mb-1 text-[var(--text-tiny)] text-green-400">Final Answer</p>
			<p class="font-medium text-[var(--text-body)] text-green-300">{answer}</p>
		</div>
	{/if}

	<!-- Metadata (if available) -->
	{#if showAnswer && metadata && Object.keys(metadata).length > 0}
		<details class="group">
			<summary
				class="flex cursor-pointer items-center gap-2 text-[var(--color-primary)] text-[var(--text-small)] transition-colors hover:text-pink-400"
			>
				<span class="transition-transform group-open:rotate-90">+</span>
				Annotator Metadata
			</summary>
			<div
				class="mt-2 space-y-2 rounded-lg border border-[var(--color-secondary)] bg-[var(--color-bg)] p-3 text-[var(--text-tiny)]"
			>
				{#if metadata.Steps}
					<div>
						<span class="text-[var(--color-primary)]">Steps:</span>
						<p class="mt-1 whitespace-pre-wrap text-[var(--color-muted)]">{metadata.Steps}</p>
					</div>
				{/if}
				{#if metadata.Tools}
					<div>
						<span class="text-[var(--color-primary)]">Tools:</span>
						<span class="text-[var(--color-muted)]"> {metadata.Tools}</span>
					</div>
				{/if}
				{#if metadata['How long did this take?']}
					<div>
						<span class="text-[var(--color-primary)]">Time:</span>
						<span class="text-[var(--color-muted)]"> {metadata['How long did this take?']}</span>
					</div>
				{/if}
			</div>
		</details>
	{/if}
</div>
