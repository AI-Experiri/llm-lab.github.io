<script>
	let { sample, showRaw = false } = $props();

	const instruction = $derived(sample?.instruction || '');
	const input = $derived(sample?.input || '');
	const output = $derived(sample?.output || '');
</script>

{#if showRaw}
	<pre class="max-h-96 overflow-auto rounded-lg bg-[var(--color-secondary)] p-4 text-sm">
		{JSON.stringify(sample, null, 2)}
	</pre>
{:else}
	<div class="space-y-3">
		<!-- Dataset badge -->
		<div class="flex items-center gap-2">
			<span
				class="rounded-full border border-amber-700/50 bg-amber-900/40 px-2 py-0.5 text-[var(--text-tiny)] text-amber-300"
			>
				Alpaca
			</span>
			<span class="text-[var(--color-muted)] text-[var(--text-tiny)]">
				Instruction-following data
			</span>
		</div>

		<!-- Instruction -->
		<div class="rounded-lg border-l-4 border-indigo-500 bg-[var(--color-bg)] p-3">
			<p class="mb-1 text-[var(--text-tiny)] text-indigo-400">Instruction</p>
			<p class="whitespace-pre-wrap text-[var(--color-text)] text-[var(--text-small)]">
				{instruction}
			</p>
		</div>

		<!-- Input (if present) -->
		{#if input}
			<div class="rounded-lg border-l-4 border-blue-500 bg-[var(--color-bg)] p-3">
				<p class="mb-1 text-[var(--text-tiny)] text-blue-400">Input</p>
				<p class="whitespace-pre-wrap text-[var(--color-text)] text-[var(--text-small)]">
					{input}
				</p>
			</div>
		{/if}

		<!-- Output -->
		{#if output}
			<details class="group" open>
				<summary
					class="flex cursor-pointer items-center gap-2 text-[var(--color-primary)] text-[var(--text-small)] transition-colors hover:text-pink-400"
				>
					<span class="transition-transform group-open:rotate-90">+</span>
					Expected Output
				</summary>
				<div class="mt-2 rounded-lg border border-green-700/30 bg-green-900/20 p-3">
					<p
						class="max-h-64 overflow-y-auto whitespace-pre-wrap text-[var(--text-small)] text-green-300"
					>
						{output}
					</p>
				</div>
			</details>
		{/if}
	</div>
{/if}
