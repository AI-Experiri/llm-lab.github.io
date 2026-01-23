<script>
	let { sample } = $props();

	function formatJson(obj) {
		const json = JSON.stringify(obj, null, 2);
		return json
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"([^"]+)":/g, '<span class="text-purple-400">"$1"</span>:')
			.replace(/: "([^"]*)"/g, ': <span class="text-green-400">"$1"</span>')
			.replace(/: (\d+\.?\d*)/g, ': <span class="text-yellow-400">$1</span>')
			.replace(/: (true|false)/g, ': <span class="text-blue-400">$1</span>')
			.replace(/: (null)/g, ': <span class="text-red-400">$1</span>');
	}
</script>

<div class="space-y-2">
	<div class="flex items-center gap-2">
		<span
			class="rounded bg-yellow-600 px-2 py-0.5 font-mono font-bold text-[var(--text-tiny)] text-yellow-100"
			>JSON</span
		>
		<span class="text-[var(--color-muted)] text-[var(--text-tiny)]">Raw data format</span>
	</div>
	<div
		class="overflow-hidden rounded-lg border border-[var(--color-secondary)] bg-[var(--color-bg)]"
	>
		<!-- eslint-disable svelte/no-at-html-tags -->
		<pre class="max-h-96 overflow-x-auto overflow-y-auto p-4 text-[var(--text-small)]"><code
				class="text-[var(--color-text)]">{@html formatJson(sample)}</code
			></pre>
	</div>
</div>
