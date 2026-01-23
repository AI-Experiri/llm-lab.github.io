<!--
  REAL DATA from HuggingFace API (EleutherAI/hendrycks_math - algebra - test split)
  {
    "problem": "How many vertical asymptotes does the graph of $y=\\frac{2}{x^2+x-6}$ have?",
    "level": "Level 3",
    "type": "Algebra",
    "solution": "The denominator of the rational function factors into $x^2+x-6=(x-2)(x+3)$. Since the numerator is always nonzero, there is a vertical asymptote whenever the denominator is $0$, which occurs for $x = 2$ and $x = -3$.  Therefore, the graph has $\\boxed{2}$ vertical asymptotes."
  }
-->
<script>
	let { sample, showAnswer = false } = $props();

	const problem = $derived(sample.problem || '');
	const level = $derived(sample.level || '');
	const type = $derived(sample.type || '');
	const solution = $derived(sample.solution || '');

	// Extract boxed answer
	const boxedAnswer = $derived(() => {
		const match = solution.match(/\\boxed\{([^}]+)\}/);
		return match ? match[1] : '';
	});
</script>

<div class="space-y-3">
	<div class="flex flex-wrap items-center gap-2">
		{#if type}
			<span
				class="rounded-full border border-blue-700/50 bg-blue-900/40 px-2 py-0.5 text-[var(--text-tiny)] text-blue-300"
			>
				{type}
			</span>
		{/if}
		{#if level}
			<span
				class="rounded-full border border-yellow-700/50 bg-yellow-900/40 px-2 py-0.5 text-[var(--text-tiny)] text-yellow-300"
			>
				{level}
			</span>
		{/if}
	</div>

	<div class="rounded-lg border-l-4 border-[var(--color-primary)] bg-[var(--color-bg)] p-3">
		<p class="mb-1 text-[var(--color-primary)] text-[var(--text-tiny)]">Problem</p>
		<p class="text-[var(--color-text)] text-[var(--text-body)]">{problem}</p>
	</div>

	{#if showAnswer && solution}
		<div class="rounded-lg border border-green-700/50 bg-green-900/20 p-3">
			<p class="mb-2 text-[var(--text-tiny)] text-green-400">Solution</p>
			<p
				class="leading-relaxed whitespace-pre-wrap text-[var(--color-text)] text-[var(--text-small)]"
			>
				{solution}
			</p>
			{#if boxedAnswer()}
				<div class="mt-3 border-t border-green-700/30 pt-3">
					<span class="text-[var(--text-tiny)] text-green-400">Answer: </span>
					<span
						class="rounded bg-green-600 px-2 py-1 font-medium text-[var(--text-small)] text-white"
					>
						{boxedAnswer()}
					</span>
				</div>
			{/if}
		</div>
	{/if}
</div>
