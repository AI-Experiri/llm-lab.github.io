<!--
  REAL DATA from HuggingFace API (codeparrot/apps - all - test split)
  {
    "problem_id": 0,
    "question": "...",
    "solutions": "...",
    "input_output": "...",
    "difficulty": "interview",
    "url": "...",
    "starter_code": "..."
  }
-->
<script>
	let { sample, showAnswer = false } = $props();

	const question = $derived(sample.question || '');
	const difficulty = $derived(sample.difficulty || '');
	const solutions = $derived(sample.solutions || '');
	const starterCode = $derived(sample.starter_code || '');

	const parsedSolutions = $derived(() => {
		try {
			return JSON.parse(solutions);
		} catch {
			return solutions ? [solutions] : [];
		}
	});
</script>

<div class="space-y-3">
	<div class="flex flex-wrap items-center gap-2">
		{#if sample.problem_id !== undefined}
			<span class="text-[var(--color-muted)] text-[var(--text-tiny)]"
				>Problem ID: {sample.problem_id}</span
			>
		{/if}
		{#if difficulty}
			<span
				class="rounded border border-orange-700/50 bg-orange-900/30 px-2 py-0.5 text-[var(--text-tiny)] text-orange-300"
			>
				{difficulty}
			</span>
		{/if}
	</div>

	<div class="rounded-lg border-l-4 border-[var(--color-primary)] bg-[var(--color-bg)] p-3">
		<p class="mb-1 text-[var(--color-primary)] text-[var(--text-tiny)]">Problem</p>
		<p
			class="max-h-64 overflow-y-auto whitespace-pre-wrap text-[var(--color-text)] text-[var(--text-small)]"
		>
			{question}
		</p>
	</div>

	{#if starterCode}
		<div class="rounded-lg border border-[var(--color-secondary)] bg-[var(--color-bg)] p-3">
			<p class="mb-2 text-[var(--text-tiny)] text-blue-400">Starter Code</p>
			<pre
				class="overflow-x-auto font-mono whitespace-pre-wrap text-[var(--color-text)] text-[var(--text-tiny)]">{starterCode}</pre>
		</div>
	{/if}

	{#if showAnswer && parsedSolutions().length > 0}
		<div class="rounded-lg border border-green-700/50 bg-green-900/20 p-3">
			<p class="mb-2 text-[var(--text-tiny)] text-green-400">Solution</p>
			<pre
				class="max-h-64 overflow-x-auto overflow-y-auto font-mono whitespace-pre-wrap text-[var(--text-tiny)] text-green-200">{parsedSolutions()[0]}</pre>
		</div>
	{/if}

	{#if sample.url}
		<a
			href={sample.url}
			target="_blank"
			rel="noopener noreferrer external"
			class="text-[var(--text-tiny)] text-blue-400 hover:underline"
		>
			Original Problem
		</a>
	{/if}
</div>
