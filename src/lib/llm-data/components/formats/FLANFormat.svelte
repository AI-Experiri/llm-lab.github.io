<script>
	let { sample, showRaw = false } = $props();

	const inputs = $derived(sample?.inputs || '');
	const targets = $derived(sample?.targets || '');
	const task = $derived(sample?.task || '');

	function getTaskColor(t) {
		const taskLower = (t || '').toLowerCase();
		if (taskLower.includes('qa') || taskLower.includes('question')) return 'blue';
		if (taskLower.includes('summ')) return 'green';
		if (taskLower.includes('trans')) return 'purple';
		if (taskLower.includes('sentiment') || taskLower.includes('class')) return 'yellow';
		if (taskLower.includes('nli') || taskLower.includes('entail')) return 'cyan';
		if (taskLower.includes('para')) return 'pink';
		return 'gray';
	}
</script>

{#if showRaw}
	<pre class="max-h-96 overflow-auto rounded-lg bg-[var(--color-secondary)] p-4 text-sm">
		{JSON.stringify(sample, null, 2)}
	</pre>
{:else}
	<div class="space-y-3">
		<!-- Metadata badges -->
		<div class="flex flex-wrap items-center gap-2">
			<span
				class="rounded-full border border-amber-700/50 bg-amber-900/40 px-2 py-0.5 text-[var(--text-tiny)] text-amber-300"
			>
				FLAN
			</span>
			{#if task}
				{@const color = getTaskColor(task)}
				<span
					class="bg-{color}-900/40 text-{color}-300 rounded-full border px-2 py-0.5 text-[var(--text-tiny)] border-{color}-700/50"
				>
					{task}
				</span>
			{/if}
		</div>

		<!-- Inputs -->
		<div class="rounded-lg border-l-4 border-indigo-500 bg-[var(--color-bg)] p-3">
			<p class="mb-1 text-[var(--text-tiny)] text-indigo-400">Input</p>
			<div class="max-h-64 overflow-y-auto">
				<p class="whitespace-pre-wrap text-[var(--color-text)] text-[var(--text-small)]">
					{inputs}
				</p>
			</div>
		</div>

		<!-- Targets -->
		{#if targets}
			<details class="group" open>
				<summary
					class="flex cursor-pointer items-center gap-2 text-[var(--color-primary)] text-[var(--text-small)] transition-colors hover:text-pink-400"
				>
					<span class="transition-transform group-open:rotate-90">+</span>
					Target Output
				</summary>
				<div class="mt-2 rounded-lg border border-green-700/30 bg-green-900/20 p-3">
					<p
						class="max-h-48 overflow-y-auto whitespace-pre-wrap text-[var(--text-small)] text-green-300"
					>
						{targets}
					</p>
				</div>
			</details>
		{/if}
	</div>
{/if}
