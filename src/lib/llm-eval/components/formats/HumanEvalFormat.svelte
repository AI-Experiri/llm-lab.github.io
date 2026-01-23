<!--
  REAL DATA from HuggingFace API (openai/openai_humaneval - openai_humaneval - test split)
  {
    "task_id": "HumanEval/0",
    "prompt": "from typing import List\n\n\ndef has_close_elements(numbers: List[float], threshold: float) -> bool:\n    \"\"\" Check if in given list of numbers, are any two numbers closer to each other than\n    given threshold.\n    >>> has_close_elements([1.0, 2.0, 3.0], 0.5)\n    False\n    >>> has_close_elements([1.0, 2.8, 3.0, 4.0, 5.0, 2.0], 0.3)\n    True\n    \"\"\"\n",
    "canonical_solution": "    for idx, elem in enumerate(numbers):...",
    "test": "...",
    "entry_point": "has_close_elements"
  }
-->
<script>
	let { sample, showAnswer = false } = $props();

	const taskId = $derived(sample.task_id || '');
	const prompt = $derived(sample.prompt || '');
	const canonicalSolution = $derived(sample.canonical_solution || '');
	const test = $derived(sample.test || '');
	const entryPoint = $derived(sample.entry_point || '');
</script>

<div class="space-y-3">
	<div class="flex flex-wrap items-center gap-2">
		{#if taskId}
			<span
				class="rounded-full border border-green-700/50 bg-green-900/40 px-2 py-0.5 font-mono text-[var(--text-tiny)] text-green-300"
			>
				{taskId}
			</span>
		{/if}
		{#if entryPoint}
			<span
				class="rounded-full border border-blue-700/50 bg-blue-900/40 px-2 py-0.5 font-mono text-[var(--text-tiny)] text-blue-300"
			>
				{entryPoint}
			</span>
		{/if}
	</div>

	<div class="rounded-lg border-l-4 border-green-500 bg-[var(--color-bg)] p-3">
		<p class="mb-2 text-[var(--text-tiny)] text-green-400">Prompt</p>
		<pre
			class="overflow-x-auto rounded bg-[var(--color-secondary)] p-2 font-mono whitespace-pre-wrap text-[var(--color-text)] text-[var(--text-small)]">{prompt}</pre>
	</div>

	{#if showAnswer}
		{#if canonicalSolution}
			<div class="rounded-lg border border-green-700/50 bg-green-900/20 p-3">
				<p class="mb-2 text-[var(--text-tiny)] text-green-400">Canonical Solution</p>
				<pre
					class="overflow-x-auto rounded bg-[var(--color-secondary)] p-2 font-mono whitespace-pre-wrap text-[var(--text-small)] text-green-300">{canonicalSolution}</pre>
			</div>
		{/if}
		{#if test}
			<div class="rounded-lg border border-blue-700/50 bg-blue-900/20 p-3">
				<p class="mb-2 text-[var(--text-tiny)] text-blue-400">Test Cases</p>
				<pre
					class="max-h-48 overflow-x-auto overflow-y-auto rounded bg-[var(--color-secondary)] p-2 font-mono whitespace-pre-wrap text-[var(--text-small)] text-blue-300">{test}</pre>
			</div>
		{/if}
	{/if}
</div>
