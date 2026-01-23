<!--
  REAL DATA from HuggingFace API (bigcode/bigcodebench - default - v0.1.2 split)
  {
    "task_id": "BigCodeBench/0",
    "complete_prompt": "...",
    "instruct_prompt": "...",
    "canonical_solution": "...",
    "code_prompt": "...",
    "entry_point": "task_func",
    "test": "...",
    "doc_struct": {...},
    "libs": ["random", "itertools"]
  }
-->
<script>
	let { sample, showAnswer = false } = $props();

	const instructPrompt = $derived(sample.instruct_prompt || '');
	const canonicalSolution = $derived(sample.canonical_solution || '');
	const codePrompt = $derived(sample.code_prompt || '');
	const libs = $derived(sample.libs || []);
	const entryPoint = $derived(sample.entry_point || '');
</script>

<div class="space-y-3">
	<div class="flex flex-wrap items-center gap-2">
		{#if sample.task_id}
			<span class="text-[var(--color-muted)] text-[var(--text-tiny)]">Task: {sample.task_id}</span>
		{/if}
		{#if entryPoint}
			<span
				class="rounded border border-blue-700/50 bg-blue-900/30 px-2 py-0.5 font-mono text-[var(--text-tiny)] text-blue-300"
			>
				{entryPoint}
			</span>
		{/if}
	</div>

	{#if libs.length > 0}
		<div class="flex flex-wrap items-center gap-2">
			<span class="text-[var(--color-muted)] text-[var(--text-tiny)]">Libraries:</span>
			{#each libs as lib (lib)}
				<span
					class="rounded border border-purple-700/50 bg-purple-900/30 px-2 py-0.5 font-mono text-[var(--text-tiny)] text-purple-300"
				>
					{lib}
				</span>
			{/each}
		</div>
	{/if}

	<div class="rounded-lg border-l-4 border-[var(--color-primary)] bg-[var(--color-bg)] p-3">
		<p class="mb-1 text-[var(--color-primary)] text-[var(--text-tiny)]">Instructions</p>
		<pre
			class="max-h-64 overflow-y-auto whitespace-pre-wrap text-[var(--color-text)] text-[var(--text-small)]">{instructPrompt}</pre>
	</div>

	{#if codePrompt}
		<div class="rounded-lg border border-[var(--color-secondary)] bg-[var(--color-bg)] p-3">
			<p class="mb-2 text-[var(--text-tiny)] text-yellow-400">Code Template</p>
			<pre
				class="overflow-x-auto font-mono whitespace-pre-wrap text-[var(--color-text)] text-[var(--text-tiny)]">{codePrompt}</pre>
		</div>
	{/if}

	{#if showAnswer && canonicalSolution}
		<div class="rounded-lg border border-green-700/50 bg-green-900/20 p-3">
			<p class="mb-2 text-[var(--text-tiny)] text-green-400">Canonical Solution</p>
			<pre
				class="max-h-64 overflow-x-auto overflow-y-auto font-mono whitespace-pre-wrap text-[var(--text-tiny)] text-green-200">{canonicalSolution}</pre>
		</div>
	{/if}
</div>
