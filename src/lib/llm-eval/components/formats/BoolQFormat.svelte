<!--
  REAL DATA from HuggingFace API (google/boolq - validation split):
  {
    "question": "does ethanol take more energy make that produces",
    "answer": false,
    "passage": "All biomass goes through at least some of these steps: it needs to be grown, collected, dried, fermented, distilled, and burned. All of these steps require resources and an infrastructure. The total amount of energy input into the process compared to the energy released by burning the resulting ethanol fuel is known as the energy balance (or ``energy returned on energy invested''). Figures compiled in a 2007 report by National Geographic Magazine point to modest results for corn ethanol produced in the US: one unit of fossil-fuel energy is required to create 1.3 energy units from the resulting ethanol. The energy balance for sugarcane ethanol produced in Brazil is more favorable, with one unit of fossil-fuel energy required to create 8 from the ethanol. Energy balance estimates are not easily produced, thus numerous such reports have been generated that are contradictory. For instance, a separate survey reports that production of ethanol from sugarcane, which requires a tropical climate to grow productively, returns from 8 to 9 units of energy for each unit expended, as compared to corn, which only returns about 1.34 units of fuel energy for each unit of energy expended. A 2006 University of California Berkeley study, after analyzing six separate studies, concluded that producing ethanol from corn uses much less petroleum than producing gasoline."
  }
-->
<script>
	let { sample, showAnswer = true } = $props();

	const passage = $derived(sample.passage || '');
	const question = $derived(sample.question || '');
	const answer = $derived(sample.answer);
</script>

<div class="space-y-3">
	<!-- Passage -->
	<div class="rounded-lg border-l-4 border-blue-500 bg-[var(--color-bg)] p-3">
		<p class="mb-1 text-[var(--text-tiny)] text-blue-400">Passage</p>
		<p class="leading-relaxed text-[var(--color-text)] text-[var(--text-small)]">{passage}</p>
	</div>

	<!-- Question -->
	<div class="rounded-lg border-l-4 border-cyan-500 bg-[var(--color-bg)] p-3">
		<p class="mb-1 text-[var(--text-tiny)] text-cyan-400">Question</p>
		<p class="font-medium text-[var(--color-text)] text-[var(--text-body)]">{question}</p>
	</div>

	<!-- Answer -->
	{#if showAnswer}
		<div class="flex items-center gap-3">
			<span class="text-[var(--color-muted)] text-[var(--text-small)]">Answer:</span>
			<span
				class="rounded-full px-4 py-1.5 font-medium text-[var(--text-body)]
        {answer
					? 'border border-green-700/50 bg-green-900/40 text-green-300'
					: 'border border-red-700/50 bg-red-900/40 text-red-300'}"
			>
				{answer ? 'Yes' : 'No'}
			</span>
		</div>
	{/if}
</div>
