<!--
  REAL DATA from HuggingFace API (FudanSELab/ClassEval - default - test split)
  {
    "task_id": "ClassEval_0",
    "skeleton": "class AccessGatewayFilter:...",
    "test": "...",
    "solution_code": "...",
    "import_statement": ["import logging", "import datetime"],
    "class_description": "...",
    "methods_info": [...],
    "class_name": "AccessGatewayFilter",
    "test_classes": [...],
    "class_constructor": "...",
    "fields": []
  }
-->
<script>
	let { sample, showAnswer = false } = $props();

	const className = $derived(sample.class_name || '');
	const description = $derived(sample.class_description || '');
	const skeleton = $derived(sample.skeleton || '');
	const solutionCode = $derived(sample.solution_code || '');
	const imports = $derived(sample.import_statement || []);
	const methodsInfo = $derived(sample.methods_info || []);
</script>

<div class="space-y-3">
	<div class="flex flex-wrap items-center gap-2">
		{#if sample.task_id}
			<span class="text-[var(--color-muted)] text-[var(--text-tiny)]">Task: {sample.task_id}</span>
		{/if}
		{#if className}
			<span
				class="rounded border border-blue-700/50 bg-blue-900/30 px-2 py-0.5 font-mono text-[var(--text-tiny)] text-blue-300"
			>
				{className}
			</span>
		{/if}
	</div>

	{#if description}
		<div class="rounded-lg border-l-4 border-[var(--color-primary)] bg-[var(--color-bg)] p-3">
			<p class="mb-1 text-[var(--color-primary)] text-[var(--text-tiny)]">Description</p>
			<p class="text-[var(--color-text)] text-[var(--text-small)]">{description}</p>
		</div>
	{/if}

	{#if imports.length > 0}
		<div class="rounded-lg border border-[var(--color-secondary)] bg-[var(--color-bg)] p-2">
			<p class="mb-1 text-[var(--text-tiny)] text-yellow-400">Imports</p>
			<pre class="font-mono text-[var(--color-text)] text-[var(--text-tiny)]">{imports.join(
					'\n'
				)}</pre>
		</div>
	{/if}

	{#if skeleton}
		<div class="rounded-lg border border-[var(--color-secondary)] bg-[var(--color-bg)] p-3">
			<p class="mb-2 text-[var(--text-tiny)] text-purple-400">Skeleton</p>
			<pre
				class="max-h-64 overflow-x-auto overflow-y-auto font-mono whitespace-pre-wrap text-[var(--color-text)] text-[var(--text-tiny)]">{skeleton}</pre>
		</div>
	{/if}

	{#if methodsInfo.length > 0}
		<div class="rounded-lg border border-[var(--color-secondary)] bg-[var(--color-bg)] p-3">
			<p class="mb-2 text-[var(--text-tiny)] text-cyan-400">Methods ({methodsInfo.length})</p>
			<ul class="space-y-1">
				{#each methodsInfo as method (method.method_name)}
					<li class="text-[var(--color-text)] text-[var(--text-tiny)]">
						<span class="font-mono text-cyan-300">{method.method_name}</span>
						{#if method.method_description}
							<span class="text-[var(--color-muted)]">
								- {method.method_description.slice(0, 100)}...</span
							>
						{/if}
					</li>
				{/each}
			</ul>
		</div>
	{/if}

	{#if showAnswer && solutionCode}
		<div class="rounded-lg border border-green-700/50 bg-green-900/20 p-3">
			<p class="mb-2 text-[var(--text-tiny)] text-green-400">Solution</p>
			<pre
				class="max-h-80 overflow-x-auto overflow-y-auto font-mono whitespace-pre-wrap text-[var(--text-tiny)] text-green-200">{solutionCode}</pre>
		</div>
	{/if}
</div>
