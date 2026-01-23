<!--
  REAL DATA from HuggingFace API (allenai/WildChat-1M - default - train split)
  {
    "conversation_hash": "c9ec5b440fbdd2a269333dd241f32f64",
    "model": "gpt-4-0314",
    "timestamp": "2023-04-09T00:02:53Z",
    "conversation": [
      {"content": "...", "role": "user", ...},
      {"content": "...", "role": "assistant", ...}
    ],
    "turn": 1,
    "language": "English",
    "toxic": false,
    "redacted": false,
    "state": "Texas",
    "country": "United States"
  }
-->
<script>
	let { sample } = $props();
	const model = $derived(sample.model || '');
	const timestamp = $derived(sample.timestamp || '');
	const conversation = $derived(sample.conversation || []);
	const turn = $derived(sample.turn);
	const language = $derived(sample.language || '');
	const toxic = $derived(sample.toxic);
	const country = $derived(sample.country || '');
	const state = $derived(sample.state || '');

	function formatTimestamp(ts) {
		if (!ts) return '';
		const date = new Date(ts);
		return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
	}
</script>

<div class="space-y-3">
	<div class="flex flex-wrap items-center gap-2">
		{#if model}
			<span
				class="rounded-full border border-blue-700/50 bg-blue-900/40 px-2 py-0.5 text-[var(--text-tiny)] text-blue-300"
			>
				{model}
			</span>
		{/if}
		{#if language}
			<span
				class="rounded-full border border-purple-700/50 bg-purple-900/40 px-2 py-0.5 text-[var(--text-tiny)] text-purple-300"
			>
				{language}
			</span>
		{/if}
		{#if toxic !== undefined}
			<span
				class="bg-{toxic ? 'red' : 'green'}-900/40 text-{toxic
					? 'red'
					: 'green'}-300 rounded-full border px-2 py-0.5 text-[var(--text-tiny)] border-{toxic
					? 'red'
					: 'green'}-700/50"
			>
				{toxic ? 'Toxic' : 'Non-toxic'}
			</span>
		{/if}
		{#if turn}
			<span class="text-[var(--color-muted)] text-[var(--text-tiny)]">{turn} turn(s)</span>
		{/if}
	</div>

	{#if timestamp || country}
		<div class="text-[var(--color-muted)] text-[var(--text-tiny)]">
			{#if timestamp}{formatTimestamp(timestamp)}{/if}
			{#if timestamp && country}
				•
			{/if}
			{#if country}{state ? `${state}, ` : ''}{country}{/if}
		</div>
	{/if}

	<div class="space-y-2">
		{#each conversation as msg, i (i)}
			{@const isUser = msg.role === 'user'}
			<div
				class="rounded-lg border-l-4 bg-[var(--color-bg)] p-3 {isUser
					? 'border-blue-500'
					: 'border-green-500'}"
			>
				<p class="text-[var(--text-tiny)] {isUser ? 'text-blue-400' : 'text-green-400'} mb-1">
					{isUser ? 'User' : 'Assistant'}
				</p>
				<p class="whitespace-pre-wrap text-[var(--color-text)] text-[var(--text-small)]">
					{msg.content}
				</p>
			</div>
		{/each}
	</div>
</div>
