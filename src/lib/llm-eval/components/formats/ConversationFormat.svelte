<!--
  NOTE: lmsys/mt_bench_human_judgments dataset requires authentication on HuggingFace API
  Expected format based on dataset documentation:
  {
    "question_id": 81,
    "model_a": "alpaca-13b",
    "model_b": "gpt-3.5-turbo",
    "winner": "model_b",
    "judge": "author_2",
    "conversation_a": [
      {"content": "Compose an engaging travel blog post about a recent trip to Hawaii...", "role": "user"},
      {"content": "I recently had the pleasure of visiting Hawaii...", "role": "assistant"}
    ],
    "turn": 1
  }
-->
<script>
	let { sample } = $props();

	// MT-Bench format
	const turns = $derived(sample.prompt || sample.turns || []);
	const category = $derived(sample.category || sample.cluster || '');

	// WildChat / LMSYS format
	const conversation = $derived(sample.conversation || []);
	const model = $derived(sample.model || '');
</script>

<div class="space-y-3">
	<!-- Category/Model info -->
	{#if category || model}
		<div class="flex flex-wrap items-center gap-2">
			{#if category}
				<span
					class="rounded-full border border-pink-700/50 bg-pink-900/40 px-2 py-0.5 text-[var(--text-tiny)] text-pink-300"
				>
					{category}
				</span>
			{/if}
			{#if model}
				<span
					class="rounded-full border border-blue-700/50 bg-blue-900/40 px-2 py-0.5 text-[var(--text-tiny)] text-blue-300"
				>
					{model}
				</span>
			{/if}
		</div>
	{/if}

	<!-- MT-Bench style turns (array of strings) -->
	{#if Array.isArray(turns) && turns.length > 0 && typeof turns[0] === 'string'}
		<div class="space-y-2">
			{#each turns as turn, i (i)}
				<div
					class="rounded-lg border-l-4 bg-[var(--color-bg)] p-3 {i % 2 === 0
						? 'border-blue-500'
						: 'border-green-500'}"
				>
					<p
						class="text-[var(--text-tiny)] {i % 2 === 0 ? 'text-blue-400' : 'text-green-400'} mb-1"
					>
						Turn {i + 1}
					</p>
					<p class="text-[var(--color-text)] text-[var(--text-body)]">{turn}</p>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Conversation style (array of {role, content} objects) -->
	{#if Array.isArray(conversation) && conversation.length > 0}
		<div class="max-h-96 space-y-2 overflow-y-auto">
			{#each conversation as msg (msg)}
				{@const isUser = msg.role === 'user' || msg.role === 'human'}
				<div class="flex {isUser ? 'justify-end' : 'justify-start'}">
					<div
						class="max-w-[85%] rounded-lg p-3 {isUser
							? 'border border-blue-700/50 bg-blue-900/30'
							: 'border border-[var(--color-secondary)] bg-[var(--color-bg)]'}"
					>
						<p
							class="text-[var(--text-tiny)] {isUser
								? 'text-blue-400'
								: 'text-green-400'} mb-1 capitalize"
						>
							{msg.role || 'assistant'}
						</p>
						<p class="whitespace-pre-wrap text-[var(--color-text)] text-[var(--text-small)]">
							{msg.content}
						</p>
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Fallback for empty -->
	{#if (!turns || turns.length === 0) && (!conversation || conversation.length === 0)}
		<p class="text-[var(--color-muted)] text-[var(--text-small)]">No conversation data available</p>
	{/if}
</div>
