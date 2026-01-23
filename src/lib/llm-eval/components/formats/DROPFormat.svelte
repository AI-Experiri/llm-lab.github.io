<!--
  REAL DATA from HuggingFace API (ucinlp/drop - validation split):
  {
    "section_id": "nfl_1184",
    "query_id": "f37e81fa-ef7b-4583-b671-762fc433faa9",
    "passage": " Hoping to rebound from their loss to the Patriots, the Raiders stayed at home for a Week 16 duel with the Houston Texans.  Oakland would get the early lead in the first quarter as quarterback JaMarcus Russell completed a 20-yard touchdown pass to rookie wide receiver Chaz Schilens.  The Texans would respond with fullback Vonta Leach getting a 1-yard touchdown run, yet the Raiders would answer with kicker Sebastian Janikowski getting a 33-yard and a 30-yard field goal.  Houston would tie the game in the second quarter with kicker Kris Brown getting a 53-yard and a 24-yard field goal. Oakland would take the lead in the third quarter with wide receiver Johnnie Lee Higgins catching a 29-yard touchdown pass from Russell, followed up by an 80-yard punt return for a touchdown.  The Texans tried to rally in the fourth quarter as Brown nailed a 40-yard field goal, yet the Raiders' defense would shut down any possible attempt.",
    "question": "Who scored the first touchdown of the game?",
    "answers_spans": {
      "spans": ["Chaz Schilens", "JaMarcus Russell"],
      "types": ["span", "span"]
    }
  }
-->
<script>
	let { sample, showAnswer = true } = $props();

	const passage = $derived(sample.passage || '');
	const question = $derived(sample.question || '');
	const answers = $derived(sample.answers_spans?.spans || []);
	const answerTypes = $derived(sample.answers_spans?.types || []);
</script>

<div class="space-y-3">
	<!-- Passage -->
	<div class="rounded-lg border-l-4 border-blue-500 bg-[var(--color-bg)] p-3">
		<p class="mb-1 text-[var(--text-tiny)] text-blue-400">Passage</p>
		<p
			class="max-h-48 overflow-y-auto leading-relaxed text-[var(--color-text)] text-[var(--text-small)]"
		>
			{passage}
		</p>
	</div>

	<!-- Question -->
	<div class="rounded-lg border-l-4 border-cyan-500 bg-[var(--color-bg)] p-3">
		<p class="mb-1 text-[var(--text-tiny)] text-cyan-400">Question</p>
		<p class="font-medium text-[var(--color-text)] text-[var(--text-body)]">{question}</p>
	</div>

	<!-- Answers -->
	{#if showAnswer && answers.length > 0}
		<div class="rounded-lg border border-green-700/30 bg-green-900/20 p-3">
			<p class="mb-2 text-[var(--text-tiny)] text-green-400">
				Accepted Answers ({answers.length})
			</p>
			<div class="flex flex-wrap gap-2">
				{#each answers as answer, i (i)}
					<span
						class="inline-flex items-center gap-1 rounded-full border border-green-700/50 bg-green-900/40 px-3 py-1 text-[var(--text-small)] text-green-300"
					>
						{answer}
						{#if answerTypes[i]}
							<span class="text-[var(--text-tiny)] text-green-500">({answerTypes[i]})</span>
						{/if}
					</span>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Metadata -->
	{#if sample.section_id}
		<p class="text-[var(--color-muted)] text-[var(--text-tiny)]">
			Section: <span class="font-mono text-[var(--color-text)]">{sample.section_id}</span>
		</p>
	{/if}
</div>
