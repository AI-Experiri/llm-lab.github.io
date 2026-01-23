<!--
  REAL DATA from HuggingFace API (ibm-research/claim_stance - claim_stance - test split)
  {
    "topicId": 1,
    "topicText": "This house believes that the sale of violent video games to minors should be banned",
    "topicTarget": "the sale of violent video games to minors",
    "topicSentiment": -1,
    "claims.claimId": 2973,
    "claims.stance": "PRO",
    "claims.claimCorrectedText": "Exposure to violent video games causes at least a temporary increase in aggression...",
    "claims.claimOriginalText": "exposure to violent video games causes at least a temporary increase in aggression...",
    "claims.Compatible": "yes",
    "claims.claimTarget.text": "Exposure to violent video games",
    "claims.claimSentiment": -1.0,
    "claims.targetsRelation": 1.0
  }
-->
<script>
	let { sample, showAnswer = false } = $props();

	const topicText = $derived(sample.topicText || sample['topicText'] || '');
	const topicTarget = $derived(sample.topicTarget || sample['topicTarget'] || '');
	const claimText = $derived(
		sample['claims.claimCorrectedText'] || sample['claims.claimOriginalText'] || ''
	);
	const stance = $derived(sample['claims.stance'] || '');
	const claimTarget = $derived(sample['claims.claimTarget.text'] || '');
	const compatible = $derived(sample['claims.Compatible'] || '');

	const stanceColor = $derived(stance === 'PRO' ? 'green' : stance === 'CON' ? 'red' : 'gray');
</script>

<div class="space-y-3">
	<div class="rounded-lg border-l-4 border-purple-500 bg-[var(--color-bg)] p-3">
		<p class="mb-1 text-[var(--text-tiny)] text-purple-400">Debate Topic</p>
		<p class="font-medium text-[var(--color-text)] text-[var(--text-body)]">{topicText}</p>
		{#if topicTarget}
			<p class="mt-1 text-[var(--color-muted)] text-[var(--text-tiny)]">
				Target: <span class="text-purple-300">{topicTarget}</span>
			</p>
		{/if}
	</div>

	<div class="rounded-lg border-l-4 border-blue-500 bg-[var(--color-bg)] p-3">
		<p class="mb-1 text-[var(--text-tiny)] text-blue-400">Claim</p>
		<p class="text-[var(--color-text)] text-[var(--text-body)]">{claimText}</p>
		{#if claimTarget}
			<p class="mt-1 text-[var(--color-muted)] text-[var(--text-tiny)]">
				Claim Target: <span class="text-blue-300">{claimTarget}</span>
			</p>
		{/if}
	</div>

	{#if showAnswer}
		<div class="bg-{stanceColor}-900/20 rounded-lg border p-3 border-{stanceColor}-700/50">
			<div class="flex items-center gap-2">
				<p class="text-[var(--text-tiny)] text-{stanceColor}-400">Stance Classification</p>
				<span
					class="bg-{stanceColor}-900/40 text-{stanceColor}-300 rounded-full border px-3 py-1 font-bold text-[var(--text-small)] border-{stanceColor}-700/50"
				>
					{stance}
				</span>
			</div>
			{#if compatible}
				<p class="mt-2 text-[var(--color-muted)] text-[var(--text-tiny)]">
					Compatible with topic: <span class="text-{stanceColor}-300">{compatible}</span>
				</p>
			{/if}
		</div>
	{/if}
</div>
