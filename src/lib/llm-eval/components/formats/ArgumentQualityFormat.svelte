<!--
  REAL DATA from HuggingFace API (ibm-research/argument_quality_ranking_30k - argument_quality_ranking - test split)
  {
    "argument": "6 million people died so to deny the holocaust should be a crime against their memory",
    "topic": "Holocaust denial should be a criminal offence",
    "set": "test",
    "WA": 0.738336771,
    "MACE-P": 0.483101984,
    "stance_WA": 1,
    "stance_WA_conf": 1.0
  }
  WA = Weighted Average quality score (0-1, higher is better)
  stance_WA: 1 = PRO, -1 = CON
-->
<script>
	let { sample, showAnswer = false } = $props();

	const argument = $derived(sample.argument || '');
	const topic = $derived(sample.topic || '');
	const qualityScore = $derived(sample.WA || sample['WA'] || 0);
	const maceP = $derived(sample['MACE-P'] || 0);
	const stance = $derived(sample.stance_WA || sample['stance_WA'] || 0);
	const stanceConf = $derived(sample.stance_WA_conf || sample['stance_WA_conf'] || 0);

	const stanceLabel = $derived(stance === 1 ? 'PRO' : stance === -1 ? 'CON' : 'NEUTRAL');
	const stanceColor = $derived(stance === 1 ? 'green' : stance === -1 ? 'red' : 'gray');

	// Quality score as percentage
	const qualityPercent = $derived(Math.round(qualityScore * 100));

	// Quality level based on score
	const qualityLevel = $derived(() => {
		if (qualityScore >= 0.7) return { text: 'High Quality', color: 'green' };
		if (qualityScore >= 0.4) return { text: 'Medium Quality', color: 'yellow' };
		return { text: 'Low Quality', color: 'red' };
	});
</script>

<div class="space-y-3">
	<div class="rounded-lg border-l-4 border-purple-500 bg-[var(--color-bg)] p-3">
		<p class="mb-1 text-[var(--text-tiny)] text-purple-400">Debate Topic</p>
		<p class="font-medium text-[var(--color-text)] text-[var(--text-body)]">{topic}</p>
	</div>

	<div class="rounded-lg border-l-4 border-blue-500 bg-[var(--color-bg)] p-3">
		<p class="mb-1 text-[var(--text-tiny)] text-blue-400">Argument</p>
		<p class="text-[var(--color-text)] text-[var(--text-body)]">{argument}</p>
	</div>

	{#if showAnswer}
		<div class="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-3">
			<p class="mb-2 text-[var(--color-muted)] text-[var(--text-tiny)]">Evaluation</p>

			<div class="grid grid-cols-2 gap-3">
				<!-- Stance -->
				<div class="bg-{stanceColor}-900/20 rounded border p-2 border-{stanceColor}-700/50">
					<p class="text-[var(--text-tiny)] text-{stanceColor}-400">Stance</p>
					<p class="text-[var(--text-body)] text-{stanceColor}-300 font-bold">{stanceLabel}</p>
					{#if stanceConf}
						<p class="text-[var(--color-muted)] text-[var(--text-tiny)]">
							Confidence: {Math.round(stanceConf * 100)}%
						</p>
					{/if}
				</div>

				<!-- Quality Score -->
				<div
					class="bg-{qualityLevel().color}-900/20 rounded border p-2 border-{qualityLevel()
						.color}-700/50"
				>
					<p class="text-[var(--text-tiny)] text-{qualityLevel().color}-400">Quality Score</p>
					<p class="text-[var(--text-body)] text-{qualityLevel().color}-300 font-bold">
						{qualityPercent}%
					</p>
					<p class="text-[var(--color-muted)] text-[var(--text-tiny)]">{qualityLevel().text}</p>
				</div>
			</div>

			{#if maceP}
				<p class="mt-2 text-[var(--color-muted)] text-[var(--text-tiny)]">
					MACE-P Score: {maceP.toFixed(3)}
				</p>
			{/if}
		</div>
	{/if}
</div>
