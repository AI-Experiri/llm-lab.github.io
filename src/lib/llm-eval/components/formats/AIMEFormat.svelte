<!--
  REAL DATA from HuggingFace API (Maxwell-Jia/AIME_2024 - default - train split)
  {
    "ID": "2024-II-4",
    "Problem": "Let $x,y$ and $z$ be positive real numbers that satisfy the following system of equations...",
    "Solution": "Denote $\\log_2(x) = a$, $\\log_2(y) = b$, and $\\log_2(z) = c$...",
    "Answer": 33
  }
-->
<script>
	let { sample, showAnswer = false } = $props();

	const id = $derived(sample.ID || '');
	const problem = $derived(sample.Problem || '');
	const solution = $derived(sample.Solution || '');
	const answer = $derived(sample.Answer);
</script>

<div class="space-y-3">
	{#if id}
		<div class="flex items-center gap-2">
			<span
				class="rounded-full border border-red-700/50 bg-red-900/40 px-2 py-0.5 font-mono text-[var(--text-tiny)] text-red-300"
			>
				AIME {id}
			</span>
		</div>
	{/if}

	<div class="rounded-lg border-l-4 border-red-500 bg-[var(--color-bg)] p-3">
		<p class="mb-1 text-[var(--text-tiny)] text-red-400">Problem</p>
		<p class="whitespace-pre-wrap text-[var(--color-text)] text-[var(--text-body)]">{problem}</p>
	</div>

	{#if showAnswer}
		{#if solution}
			<div class="rounded-lg border border-blue-700/50 bg-blue-900/20 p-3">
				<p class="mb-2 text-[var(--text-tiny)] text-blue-400">Solution</p>
				<p
					class="leading-relaxed whitespace-pre-wrap text-[var(--color-text)] text-[var(--text-small)]"
				>
					{solution}
				</p>
			</div>
		{/if}
		{#if answer !== undefined}
			<div class="rounded-lg border border-green-700/50 bg-green-900/20 p-3">
				<span class="text-[var(--text-tiny)] text-green-400">Final Answer: </span>
				<span class="rounded bg-green-600 px-3 py-1 font-bold text-[var(--text-body)] text-white">
					{answer}
				</span>
			</div>
		{/if}
	{/if}
</div>
