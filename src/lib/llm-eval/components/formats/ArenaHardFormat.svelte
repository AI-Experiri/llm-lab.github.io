<!--
  REAL DATA from HuggingFace API (lmarena-ai/arena-hard-auto-v0.1 - default - train split)
  {
    "question_id": "328c149ed45a41c0b9d6f14659e63599",
    "category": "arena-hard-v0.1",
    "cluster": "ABC Sequence Puzzles & Groups",
    "turns": [
      {"content": "Use ABC notation to write a melody in the style of a folk tune."}
    ]
  }
-->
<script>
	let { sample, showAnswer = false } = $props();

	const questionId = $derived(sample.question_id || '');
	const category = $derived(sample.category || '');
	const cluster = $derived(sample.cluster || '');
	const turns = $derived(sample.turns || []);
</script>

<div class="space-y-3">
	<div class="flex flex-wrap items-center gap-2">
		{#if cluster}
			<span
				class="rounded-full border border-cyan-700/50 bg-cyan-900/40 px-2 py-0.5 text-[var(--text-tiny)] text-cyan-300"
			>
				{cluster}
			</span>
		{/if}
		{#if category}
			<span
				class="rounded-full border border-purple-700/50 bg-purple-900/40 px-2 py-0.5 text-[var(--text-tiny)] text-purple-300"
			>
				{category}
			</span>
		{/if}
	</div>

	{#if questionId}
		<div class="text-[var(--color-muted)] text-[var(--text-tiny)]">ID: {questionId}</div>
	{/if}

	<div class="space-y-2">
		{#each turns as turn, i (i)}
			<div class="rounded-lg border-l-4 border-cyan-500 bg-[var(--color-bg)] p-3">
				<p class="mb-1 text-[var(--text-tiny)] text-cyan-400">Turn {i + 1}</p>
				<p class="text-[var(--color-text)] text-[var(--text-body)]">{turn.content}</p>
			</div>
		{/each}
	</div>

	{#if showAnswer}
		<div class="rounded-lg border border-yellow-700/50 bg-yellow-900/20 p-3">
			<p class="text-[var(--text-tiny)] text-yellow-400">
				Open-ended benchmark - no reference answer provided
			</p>
		</div>
	{/if}
</div>
