<script>
	import anime from 'animejs';
	import { ScaffoldBPE } from '../lib/scaffoldBpe.js';
	import { toDisplay, sleep } from '../lib/utils.js';
	import {
		PAIR_STAGGER_DELAY,
		DOM_SETTLE_DELAY,
		PHASE_TRANSITION_RATIO,
		ANIMATION_DURATION_RATIO,
		SCALE_ANIMATION_RATIO,
		TOKEN_STAGGER_DELAY
	} from '../lib/animationConstants.js';
	import { usePlayback } from '../lib/usePlayback.svelte.js';
	import AlgorithmInfo from './common/AlgorithmInfo.svelte';
	import InputPanel from './common/InputPanel.svelte';
	import Controls from './common/Controls.svelte';
	import PreTokens from './common/PreTokens.svelte';
	import TokenDisplay from './common/TokenDisplay.svelte';
	import AlgorithmSteps from './common/AlgorithmSteps.svelte';
	import VocabularyPanel from './common/VocabularyPanel.svelte';
	import ExtraInfo from './common/ExtraInfo.svelte';

	const defaultText = `low low low low low
lower lower widest widest widest
newest newest newest newest newest newest`;

	let inputText = $state(defaultText);
	let numMerges = $state(10);
	let showDemolished = $state(true);
	let animationSpeed = 600;

	// Tracks animation state machine: 'idle' | 'init' | 'counting' | 'selecting' | 'merging'
	// Kept for debugging and potential future conditional rendering
	let _phase = $state('idle');
	let phaseMessage = $state('Enter text and click "Start" to begin');

	const playback = usePlayback();

	let preTokensDisplay = $state([]);
	let tokensDisplay = $state([]);
	let pairCounts = $state([]);
	let vocabulary = $state([]);
	let scaffoldInfo = $state(null);

	let initialTokenCount = $state(0);
	let currentTokenCount = $state(0);
	let compressionRate = $state(0);
	let showDetails = $state(false);
	let currentMerge = $state(null);

	const algorithmDetails = {
		description: [
			'Scaffold-BPE identifies "scaffold" tokens - intermediate tokens created during BPE that are rarely used in the final tokenization. These waste vocabulary space.',
			'After each merge, it checks if the remaining frequency of constituent tokens is less than the next merge frequency. If so, the token is marked as scaffold and can be demolished to free vocabulary space.'
		],
		pseudocode: `vocab = run_standard_bpe(corpus, num_merges)
for each token t in vocab:
  remaining_freq = count(t) - times_used_in_merges(t)
  if remaining_freq < next_merge_freq:
    mark_as_scaffold(t)
for each scaffold token:
  demolish(t)  // remove from vocab
return cleaned_vocab`
	};

	/** @type {ScaffoldBPE | null} */
	let scaffoldBpe = $state(null);

	let canStart = $derived(!playback.isAnimating);

	function handleStart() {
		const text = inputText.trim();
		if (!text) {
			phaseMessage = 'Please enter some text to tokenize.';
			return;
		}

		scaffoldBpe = new ScaffoldBPE(text, numMerges);
		_phase = 'init';
		phaseMessage = 'Pre-tokenizing text...';
		playback.setStep(0);
		pairCounts = [];
		scaffoldInfo = null;
		playback.setTotalSteps(scaffoldBpe.merges.length);

		preTokensDisplay = Object.entries(scaffoldBpe.preTokenCounts).map(([pt, count], idx) => ({
			id: idx,
			text: pt,
			count
		}));

		initialTokenCount = scaffoldBpe.getInitialTokenCount();
		currentTokenCount = initialTokenCount;
		compressionRate = 0;
		vocabulary = scaffoldBpe.getVocabAtStep(0);
		updateTokensDisplay(true);

		setTimeout(() => {
			_phase = 'idle';
			phaseMessage = `Ready! ${playback.totalSteps} merge operations. Click "Step" or "Play".`;
		}, animationSpeed);
	}

	function updateTokensDisplay(animate = false) {
		if (!scaffoldBpe) return;
		const { ptTrained, scaffolds } = scaffoldBpe.getTokensAtStep(
			playback.currentStep,
			showDemolished
		);
		const allTokens = [];
		let idx = 0;

		for (const [, tokens] of Object.entries(ptTrained)) {
			for (const token of tokens) {
				allTokens.push({
					id: idx++,
					text: token,
					highlight: false,
					merging: false,
					isNew: false,
					isScaffold: scaffolds.has(token),
					opacity: animate ? 0 : 1,
					scale: animate ? 0.5 : 1
				});
			}
			allTokens.push({
				id: idx++,
				text: '│',
				isSeparator: true,
				opacity: animate ? 0 : 1,
				scale: animate ? 0.5 : 1
			});
		}
		if (allTokens.length > 0 && allTokens[allTokens.length - 1].isSeparator) allTokens.pop();
		tokensDisplay = allTokens;

		if (animate) {
			setTimeout(() => {
				anime({
					targets: '.token',
					opacity: [0, 1],
					scale: [0.5, 1],
					delay: anime.stagger(TOKEN_STAGGER_DELAY),
					duration: animationSpeed * SCALE_ANIMATION_RATIO,
					easing: 'easeOutBack'
				});
			}, DOM_SETTLE_DELAY);
		}
	}

	function updateStats() {
		if (!scaffoldBpe) return;
		currentTokenCount = scaffoldBpe.getTokenCount(playback.currentStep, showDemolished);
		compressionRate =
			initialTokenCount > 0 ? Math.round((1 - currentTokenCount / initialTokenCount) * 100) : 0;
	}

	async function handleStep() {
		if (!scaffoldBpe || playback.currentStep >= playback.totalSteps || playback.isAnimating) return;
		playback.startAnimating();
		const merge = scaffoldBpe.merges[playback.currentStep];

		_phase = 'counting';
		phaseMessage = `Round ${merge.step}: Counting byte pairs...`;

		const sorted = Object.entries(merge.pairFreqs)
			.map(([pair, count]) => {
				const [t1, t2] = pair.split('|');
				return { pair, display: `${toDisplay(t1)} + ${toDisplay(t2)}`, count, isMax: false };
			})
			.sort((a, b) => b.count - a.count)
			.slice(0, 10);

		pairCounts = [];
		for (let i = 0; i < sorted.length; i++) {
			await sleep(PAIR_STAGGER_DELAY);
			pairCounts = [...pairCounts, sorted[i]];
		}
		await sleep(animationSpeed * PHASE_TRANSITION_RATIO);

		_phase = 'selecting';
		phaseMessage = `Best pair: "${toDisplay(merge.token1)} + ${toDisplay(merge.token2)}" (${merge.count}×)`;
		currentMerge = merge;
		const selectedPair = `${merge.token1}|${merge.token2}`;
		pairCounts = pairCounts.map((p) => ({ ...p, isMax: p.pair === selectedPair }));

		if (merge.scaffoldsMarked && merge.scaffoldsMarked.length > 0) {
			scaffoldInfo = merge.scaffoldsMarked[0];
		} else {
			scaffoldInfo = null;
		}

		const { scaffolds } = scaffoldBpe.getTokensAtStep(playback.currentStep, false);
		const allTokens = [];
		let idx = 0;
		for (const [, tokens] of Object.entries(merge.ptTrainedBefore)) {
			for (let i = 0; i < tokens.length; i++) {
				const isPartOfPair =
					(i < tokens.length - 1 && tokens[i] === merge.token1 && tokens[i + 1] === merge.token2) ||
					(i > 0 && tokens[i - 1] === merge.token1 && tokens[i] === merge.token2);
				allTokens.push({
					id: idx++,
					text: tokens[i],
					highlight: isPartOfPair,
					isScaffold: scaffolds.has(tokens[i]),
					opacity: 1,
					scale: 1
				});
			}
			allTokens.push({ id: idx++, text: '│', isSeparator: true, opacity: 1, scale: 1 });
		}
		if (allTokens.length > 0 && allTokens[allTokens.length - 1].isSeparator) allTokens.pop();
		tokensDisplay = allTokens;

		await sleep(DOM_SETTLE_DELAY);
		anime({
			targets: '.token.highlight',
			scale: [1, 1.15],
			duration: animationSpeed * SCALE_ANIMATION_RATIO,
			easing: 'easeOutBack'
		});
		await sleep(animationSpeed * ANIMATION_DURATION_RATIO);

		_phase = 'merging';
		phaseMessage = `Merging → "${toDisplay(merge.newToken)}"`;
		anime({
			targets: '.token.highlight',
			scale: 0,
			opacity: 0,
			duration: animationSpeed * SCALE_ANIMATION_RATIO,
			easing: 'easeInBack'
		});
		await sleep(animationSpeed * ANIMATION_DURATION_RATIO);

		anime.remove('.token');
		tokensDisplay = [];
		playback.incrementStep();
		vocabulary = scaffoldBpe.getVocabAtStep(playback.currentStep);
		setTimeout(() => updateTokensDisplay(), 0);
		updateStats();

		_phase = 'idle';
		phaseMessage =
			playback.currentStep >= playback.totalSteps
				? 'All merges complete!'
				: `Step ${playback.currentStep}/${playback.totalSteps} complete.`;
		playback.stopAnimating();
	}

	async function handlePlay() {
		await playback.handlePlay(handleStep);
	}

	function handleReset() {
		if (!scaffoldBpe || playback.isAnimating || playback.isPlaying) return;
		anime.remove('.token');
		tokensDisplay = [];
		playback.reset();
		currentMerge = null;
		_phase = 'idle';
		phaseMessage = `Reset. ${playback.totalSteps} merge operations ready.`;
		pairCounts = [];
		scaffoldInfo = null;
		vocabulary = scaffoldBpe.getVocabAtStep(0);
		setTimeout(() => updateTokensDisplay(), 0);
		updateStats();
	}

	function handleBack() {
		if (!scaffoldBpe || playback.isAnimating || playback.isPlaying || playback.currentStep <= 0)
			return;
		anime.remove('.token');
		playback.decrementStep();
		_phase = 'idle';
		phaseMessage = `Step ${playback.currentStep}/${playback.totalSteps}`;
		pairCounts = [];
		scaffoldInfo = null;
		vocabulary = scaffoldBpe.getVocabAtStep(playback.currentStep);
		updateTokensDisplay();
		updateStats();
	}

	function toggleDemolish() {
		showDemolished = !showDemolished;
		updateTokensDisplay();
		updateStats();
	}
</script>

<div class="space-y-4">
	<!-- Algorithm Info -->
	<AlgorithmInfo algorithm="scaffold" bind:expanded={showDetails} />

	{#if showDetails}
		<!-- Details View: Description + Pseudocode -->
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<!-- Left: Description -->
			<div class="rounded-xl bg-white/10 p-4 backdrop-blur">
				<h3 class="mb-3 flex items-center gap-2 font-semibold text-[var(--text-body)] text-white">
					<span class="h-2 w-2 rounded-full bg-orange-400"></span>
					How Scaffold-BPE Works
				</h3>
				<div class="space-y-3 leading-relaxed text-[var(--text-small)] text-slate-300">
					{#each algorithmDetails.description as para, i (i)}
						<p>{para}</p>
					{/each}
				</div>
			</div>

			<!-- Right: Pseudocode -->
			<div class="rounded-xl bg-white/10 p-4 backdrop-blur">
				<h3 class="mb-3 flex items-center gap-2 font-semibold text-[var(--text-body)] text-white">
					<span class="h-2 w-2 rounded-full bg-amber-400"></span>
					Pseudocode
				</h3>
				<pre
					class="overflow-x-auto rounded-lg bg-slate-800/50 p-3 font-mono text-[var(--text-small)] text-slate-300">{algorithmDetails.pseudocode}</pre>
			</div>
		</div>
	{:else}
		<!-- Input + Controls Row -->
		<div class="grid grid-cols-1 gap-4 lg:grid-cols-12">
			<InputPanel bind:value={inputText} disabled={playback.isAnimating || playback.isPlaying} />

			<Controls
				statusMessage={phaseMessage}
				gradientFrom="from-orange-600/80"
				gradientTo="to-amber-600/80"
				startColor="bg-orange-600 hover:bg-orange-500"
				{canStart}
				canBack={playback.canBack}
				canStep={playback.canStep}
				canPlay={playback.canPlay}
				canReset={playback.canReset}
				isPlaying={playback.isPlaying}
				onStart={handleStart}
				onBack={handleBack}
				onStep={handleStep}
				onPlay={handlePlay}
				onReset={handleReset}
			>
				<button
					onclick={toggleDemolish}
					class="rounded-lg px-3 py-1.5 font-medium text-[var(--text-small)] {showDemolished
						? 'bg-orange-600 text-white'
						: 'bg-orange-600/30 text-orange-300'}"
				>
					{showDemolished ? 'Demolish ON' : 'Demolish OFF'}
				</button>
				<div class="flex items-center gap-2">
					<label for="scaffold-merges" class="text-[var(--text-small)] text-slate-300"
						>Merges:</label
					>
					<input
						id="scaffold-merges"
						type="number"
						bind:value={numMerges}
						min="1"
						max="50"
						class="w-16 rounded bg-slate-700 px-2 py-1.5 text-center text-white"
					/>
				</div>
			</Controls>
		</div>

		<!-- Selection Info -->
		<ExtraInfo>
			<span class="font-medium text-orange-400">Selection:</span>
			<span class="text-slate-300">highest frequency → longest pair → lexicographic order</span>
			{#if currentMerge}
				<span class="text-orange-300"
					>→ "{toDisplay(currentMerge.token1)}+{toDisplay(currentMerge.token2)}" ({currentMerge.count}×)</span
				>
			{/if}
			{#if scaffoldInfo && currentMerge}
				<span class="ml-2 font-bold text-yellow-400">⚠ Scaffold:</span>
				<span class="text-yellow-300"
					>"{toDisplay(scaffoldInfo.token)}" {scaffoldInfo.remainingFreq}× &lt; "{toDisplay(
						currentMerge.token1
					)}"+"{toDisplay(currentMerge.token2)}" {currentMerge.count}× → demolish "{toDisplay(
						scaffoldInfo.token
					)}"</span
				>
			{/if}
		</ExtraInfo>

		<!-- Main Grid: 6-3-3 -->
		<div class="grid grid-cols-1 gap-4 lg:grid-cols-12">
			<!-- Left: Pre-tokens + Tokens (6 cols) -->
			<div class="space-y-4 lg:col-span-6">
				<PreTokens preTokens={preTokensDisplay} />

				<TokenDisplay
					tokens={tokensDisplay}
					currentStep={playback.currentStep}
					totalSteps={playback.totalSteps}
					{currentTokenCount}
					{compressionRate}
					accentColor="bg-orange-400"
					progressColor="bg-orange-500"
				>
					{#each tokensDisplay as token (token.id)}
						{#if token.isSeparator}
							<span class="px-1 font-bold text-slate-600">│</span>
						{:else}
							<span
								class="token rounded-lg px-2 py-1 font-mono font-medium text-[var(--text-small)] transition-all duration-200
                {token.highlight
									? 'highlight bg-yellow-400 text-yellow-900 shadow-lg shadow-yellow-400/50'
									: ''}
                {token.isScaffold ? 'bg-orange-400 text-orange-900 ring-1 ring-orange-300' : ''}
                {token.isNew
									? 'new bg-emerald-400 text-emerald-900 shadow-lg shadow-emerald-400/50'
									: ''}
                {!token.highlight &&
								!token.isScaffold &&
								!token.isNew &&
								token.text === currentMerge?.newToken
									? 'bg-yellow-400 font-bold text-yellow-900 shadow-lg shadow-yellow-400/50'
									: ''}
                {!token.highlight &&
								!token.isScaffold &&
								!token.isNew &&
								token.text !== currentMerge?.newToken
									? 'bg-slate-700 text-slate-200'
									: ''}"
								style="opacity: {token.opacity}; transform: scale({token.scale})"
								title={token.isScaffold ? 'Scaffold token (will be demolished)' : ''}
								>{toDisplay(token.text)}</span
							>
						{/if}
					{/each}
				</TokenDisplay>
			</div>

			<!-- Right: Pair Frequencies + Vocabulary (always together) -->
			<div class="grid grid-cols-2 gap-4 lg:col-span-6">
				<AlgorithmSteps pairs={pairCounts} />

				<VocabularyPanel {vocabulary}>
					{#if vocabulary.length === 0}
						<p class="py-4 text-center text-[var(--text-small)] text-slate-500">
							Vocabulary appears here...
						</p>
					{:else}
						{#each [...vocabulary].reverse() as item (item.token)}
							<div
								class="flex items-center justify-between rounded-lg px-2 py-1.5 text-[var(--text-small)] transition-all
                  {item.token === currentMerge?.newToken
									? 'bg-yellow-400 font-bold text-yellow-900 shadow-lg'
									: 'bg-slate-800/50'}
                  {item.isScaffold && item.token !== currentMerge?.newToken
									? 'ring-1 ring-orange-400/50'
									: ''}
                  {item.isScaffold && showDemolished ? 'opacity-50' : ''}"
							>
								<span
									class="font-mono {item.token === currentMerge?.newToken
										? ''
										: item.isScaffold
											? 'text-orange-300'
											: item.isBase
												? 'text-slate-400'
												: 'text-orange-300'}
                    {item.isScaffold && showDemolished ? 'line-through' : ''}"
									>{toDisplay(item.token)}</span
								>
								{#if item.isScaffold}
									<span
										class="{item.token === currentMerge?.newToken
											? 'text-yellow-700'
											: 'text-orange-400'} text-[var(--text-tiny)]"
										>{showDemolished ? 'removed' : 'scaffold'}</span
									>
								{:else if item.from}
									<span
										class="{item.token === currentMerge?.newToken
											? 'text-yellow-700'
											: 'text-slate-500'} ml-2 truncate text-[var(--text-tiny)]">{item.from}</span
									>
								{/if}
							</div>
						{/each}
					{/if}
				</VocabularyPanel>
			</div>
		</div>
	{/if}
</div>
