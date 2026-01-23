<script>
	let { sample, showRaw = false } = $props();

	const content = $derived(sample?.content || '');
	const repoName = $derived(sample?.repo_name || '');
	const path = $derived(sample?.path || '');
	const license = $derived(sample?.license || '');

	function getLanguageFromPath(p) {
		if (!p) return 'code';
		const ext = p.split('.').pop()?.toLowerCase();
		const langMap = {
			py: 'Python',
			js: 'JavaScript',
			ts: 'TypeScript',
			java: 'Java',
			cpp: 'C++',
			c: 'C',
			go: 'Go',
			rs: 'Rust',
			rb: 'Ruby',
			php: 'PHP',
			sh: 'Shell',
			sql: 'SQL',
			html: 'HTML',
			css: 'CSS',
			json: 'JSON',
			yaml: 'YAML',
			yml: 'YAML',
			md: 'Markdown'
		};
		return langMap[ext] || ext?.toUpperCase() || 'Code';
	}

	function getLicenseColor(lic) {
		const l = (lic || '').toLowerCase();
		if (l.includes('mit')) return 'green';
		if (l.includes('apache')) return 'blue';
		if (l.includes('gpl')) return 'yellow';
		if (l.includes('bsd')) return 'cyan';
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
				class="rounded-full border border-green-700/50 bg-green-900/40 px-2 py-0.5 text-[var(--text-tiny)] text-green-300"
			>
				CodeParrot
			</span>
			{#if path}
				<span
					class="rounded-full border border-purple-700/50 bg-purple-900/40 px-2 py-0.5 text-[var(--text-tiny)] text-purple-300"
				>
					{getLanguageFromPath(path)}
				</span>
			{/if}
			{#if license}
				{@const color = getLicenseColor(license)}
				<span
					class="bg-{color}-900/40 text-{color}-300 rounded-full border px-2 py-0.5 text-[var(--text-tiny)] border-{color}-700/50"
				>
					{license}
				</span>
			{/if}
		</div>

		<!-- Repository info -->
		{#if repoName || path}
			<div class="flex flex-wrap items-center gap-3 text-[var(--text-tiny)]">
				{#if repoName}
					<div class="flex items-center gap-1">
						<svg class="h-3 w-3 text-[var(--color-muted)]" fill="currentColor" viewBox="0 0 16 16">
							<path
								d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8z"
							/>
						</svg>
						<span class="text-[var(--color-muted)]">{repoName}</span>
					</div>
				{/if}
				{#if path}
					<div class="flex items-center gap-1">
						<svg class="h-3 w-3 text-[var(--color-muted)]" fill="currentColor" viewBox="0 0 16 16">
							<path
								d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0113.25 16h-9.5A1.75 1.75 0 012 14.25V1.75z"
							/>
						</svg>
						<span class="font-mono text-[var(--color-muted)]">{path}</span>
					</div>
				{/if}
			</div>
		{/if}

		<!-- Code content -->
		<div
			class="overflow-hidden rounded-lg border border-[var(--color-secondary)] bg-[var(--color-bg)]"
		>
			<div
				class="flex items-center justify-between border-b border-[var(--color-secondary)] bg-green-900/20 px-3 py-1.5"
			>
				<span class="font-mono text-[var(--text-tiny)] text-green-400">
					{path || 'source code'}
				</span>
			</div>
			<div class="max-h-96 overflow-auto">
				<pre
					class="overflow-x-auto p-3 font-mono text-[var(--text-small)] text-green-300">{content}</pre>
			</div>
		</div>
	</div>
{/if}
