<script>
	let { sample, showRaw = false } = $props();

	const text = $derived(sample?.text || '');
	const role = $derived(sample?.role || '');
	const lang = $derived(sample?.lang || '');
	const messageId = $derived(sample?.message_id || '');

	function getRoleColor(r) {
		const role = (r || '').toLowerCase();
		if (role === 'prompter' || role === 'user' || role === 'human') return 'blue';
		if (role === 'assistant' || role === 'bot') return 'green';
		return 'gray';
	}

	function isUserRole(r) {
		const role = (r || '').toLowerCase();
		return role === 'prompter' || role === 'user' || role === 'human';
	}

	// Derived values for template
	const isUser = $derived(isUserRole(role));
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
				OASST
			</span>
			{#if role}
				{@const color = getRoleColor(role)}
				<span
					class="bg-{color}-900/40 text-{color}-300 rounded-full border px-2 py-0.5 text-[var(--text-tiny)] border-{color}-700/50 capitalize"
				>
					{role}
				</span>
			{/if}
			{#if lang}
				<span
					class="rounded-full border border-purple-700/50 bg-purple-900/40 px-2 py-0.5 text-[var(--text-tiny)] text-purple-300 uppercase"
				>
					{lang}
				</span>
			{/if}
		</div>

		<!-- Message ID -->
		{#if messageId}
			<div class="text-[var(--color-muted)] text-[var(--text-tiny)]">
				Message ID: <span class="font-mono text-[var(--color-text)]/60">{messageId}</span>
			</div>
		{/if}

		<!-- Message content with chat-style formatting -->
		<div class="flex {isUser ? 'justify-end' : 'justify-start'}">
			<div
				class="max-w-[90%] rounded-lg p-3 {isUser
					? 'border border-blue-700/50 bg-blue-900/30'
					: 'border border-[var(--color-secondary)] bg-[var(--color-bg)]'}"
			>
				<div class="mb-2 flex items-center gap-2">
					{#if isUser}
						<svg class="h-4 w-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
							<path
								fill-rule="evenodd"
								d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
								clip-rule="evenodd"
							/>
						</svg>
						<span class="text-[var(--text-tiny)] text-blue-400 capitalize">{role || 'User'}</span>
					{:else}
						<svg class="h-4 w-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
							<path
								d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z"
							/>
						</svg>
						<span class="text-[var(--text-tiny)] text-green-400 capitalize"
							>{role || 'Assistant'}</span
						>
					{/if}
				</div>
				<div class="max-h-80 overflow-y-auto">
					<p
						class="break-words whitespace-pre-wrap text-[var(--color-text)] text-[var(--text-small)]"
					>
						{text}
					</p>
				</div>
			</div>
		</div>
	</div>
{/if}
