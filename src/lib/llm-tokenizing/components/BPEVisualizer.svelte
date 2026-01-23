<script>
	import anime from 'animejs';
	import { BPE } from '../lib/bpe.js';
	import { toDisplay } from '../lib/utils.js';
	import { usePlayback } from '../lib/usePlayback.svelte.js';
	import {
		PAIR_STAGGER_DELAY,
		DOM_SETTLE_DELAY,
		PHASE_TRANSITION_RATIO,
		ANIMATION_DURATION_RATIO,
		SCALE_ANIMATION_RATIO,
		TOKEN_STAGGER_DELAY
	} from '../lib/animationConstants.js';
	import { sleep } from '../lib/utils.js';
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
	let animationSpeed = 600;

	// Playback state managed by composable
	const playback = usePlayback();

	// Tracks animation state machine: 'idle' | 'init' | 'counting' | 'selecting' | 'merging'
	// Kept for debugging and potential future conditional rendering
	let _phase = $state('idle');
	let phaseMessage = $state('Enter text and click "Start" to begin');

	let preTokensDisplay = $state([]);
	let tokensDisplay = $state([]);
	let pairCounts = $state([]);
	let vocabulary = $state([]);

	let initialTokenCount = $state(0);
	let currentTokenCount = $state(0);
	let compressionRate = $state(0);
	let showDetails = $state(false);
	let currentMerge = $state(null);

	const algorithmDetails = {
		description: [
			'Byte Pair Encoding (BPE) builds a vocabulary by starting with individual characters and iteratively merging the most frequent adjacent pairs. This creates a balance between character-level and word-level tokenization.',
			'The algorithm learns common subwords like prefixes, suffixes, and roots naturally from the data. It handles rare words by breaking them into known subword units, eliminating out-of-vocabulary issues.'
		],
		pseudocode: `vocab = all unique characters
for i in 1..num_merges:
  pairs = count_adjacent_pairs(corpus)
  best = argmax(pairs, key=frequency)
  new_token = merge(best.left, best.right)
  vocab.add(new_token)
  corpus = replace_all(corpus, best, new_token)
return vocab`
	};

	/** @type {BPE | null} */
	let bpe = $state(null);

	let canStart = $derived(!playback.isAnimating);

	function handleStart() {
		const text = inputText.trim();
		if (!text) {
			phaseMessage = 'Please enter some text to tokenize.';
			return;
		}

		bpe = new BPE(text, numMerges);
		_phase = 'init';
		phaseMessage = 'Pre-tokenizing text...';
		playback.setStep(0);
		currentMerge = null;
		pairCounts = [];
		playback.setTotalSteps(bpe.merges.length);

		preTokensDisplay = Object.entries(bpe.preTokenCounts).map(([pt, count], idx) => ({
			id: idx,
			text: pt,
			count
		}));

		initialTokenCount = bpe.getInitialTokenCount();
		currentTokenCount = initialTokenCount;
		compressionRate = 0;
		vocabulary = bpe.getVocabAtStep(0);
		updateTokensDisplay(true);

		setTimeout(() => {
			_phase = 'idle';
			if (playback.totalSteps === 0) {
				phaseMessage = 'No merges possible. Try different text with repeated character pairs.';
			} else {
				phaseMessage = `Ready! ${playback.totalSteps} merge operations. Click "Step" or "Play".`;
			}
		}, animationSpeed);
	}

	function updateTokensDisplay(animate = false) {
		if (!bpe) return;
		const ptTrained = bpe.getTokensAtStep(playback.currentStep);
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
					duration: animationSpeed * ANIMATION_DURATION_RATIO,
					easing: 'easeOutBack'
				});
			}, DOM_SETTLE_DELAY);
		}
	}

	function updateStats() {
		if (!bpe) return;
		currentTokenCount = bpe.getTokenCount(playback.currentStep);
		compressionRate =
			initialTokenCount > 0 ? Math.round((1 - currentTokenCount / initialTokenCount) * 100) : 0;
	}

	async function handleStep() {
		if (!bpe || playback.currentStep >= playback.totalSteps || playback.isAnimating) return;
		playback.startAnimating();

		// Clear any lingering animations from previous step
		anime.remove('.token');

		const merge = bpe.merges[playback.currentStep];

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
		vocabulary = bpe.getVocabAtStep(playback.currentStep);
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
		if (!bpe || playback.isAnimating || playback.isPlaying) return;
		anime.remove('.token');
		tokensDisplay = [];
		playback.reset();
		currentMerge = null;
		_phase = 'idle';
		phaseMessage = `Reset. ${playback.totalSteps} merge operations ready.`;
		pairCounts = [];
		vocabulary = bpe.getVocabAtStep(0);
		setTimeout(() => updateTokensDisplay(), 0);
		updateStats();
	}

	function handleBack() {
		if (!bpe || playback.isAnimating || playback.isPlaying || playback.currentStep <= 0) return;

		// Clear any lingering animations
		anime.remove('.token');

		playback.decrementStep();
		currentMerge = playback.currentStep > 0 ? bpe.merges[playback.currentStep - 1] : null;
		_phase = 'idle';
		phaseMessage = `Step ${playback.currentStep}/${playback.totalSteps}`;
		pairCounts = [];
		vocabulary = bpe.getVocabAtStep(playback.currentStep);
		updateTokensDisplay();
		updateStats();
	}
</script>

<div class="space-y-4">
	<!-- Algorithm Info -->
	<AlgorithmInfo algorithm="bpe" bind:expanded={showDetails} />

	{#if showDetails}
		<!-- Details View: Description + Pseudocode -->
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<!-- Left: Description -->
			<div class="rounded-xl bg-white/10 p-4 backdrop-blur">
				<h3 class="mb-3 flex items-center gap-2 text-base font-semibold text-white">
					<span class="h-2 w-2 rounded-full bg-purple-400"></span>
					How BPE Works
				</h3>
				<div class="space-y-3 text-sm leading-relaxed text-slate-300">
					{#each algorithmDetails.description as para, i (i)}
						<p>{para}</p>
					{/each}
				</div>
			</div>

			<!-- Right: Pseudocode -->
			<div class="rounded-xl bg-white/10 p-4 backdrop-blur">
				<h3 class="mb-3 flex items-center gap-2 text-base font-semibold text-white">
					<span class="h-2 w-2 rounded-full bg-blue-400"></span>
					Pseudocode
				</h3>
				<pre
					class="overflow-x-auto rounded-lg bg-slate-800/50 p-3 font-mono text-sm text-slate-300">{algorithmDetails.pseudocode}</pre>
			</div>
		</div>
	{:else}
		<!-- Input + Controls Row -->
		<div class="grid grid-cols-1 gap-4 lg:grid-cols-12">
			<InputPanel bind:value={inputText} disabled={playback.isAnimating || playback.isPlaying} />

			<Controls
				statusMessage={phaseMessage}
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
				<div class="flex items-center gap-2">
					<label for="num-merges" class="text-sm text-slate-300">Merges:</label>
					<input
						id="num-merges"
						type="number"
						bind:value={numMerges}
						min="1"
						max="50"
						disabled={playback.isAnimating || playback.isPlaying}
						class="w-16 rounded bg-slate-700 px-2 py-1.5 text-center text-white disabled:opacity-50"
					/>
				</div>
			</Controls>
		</div>

		<!-- Selection Info -->
		<ExtraInfo>
			<span class="font-medium text-purple-400">Selection:</span>
			<span class="text-slate-300">highest frequency → longest pair → lexicographic order</span>
			{#if currentMerge}
				<span class="text-purple-300"
					>→ "{toDisplay(currentMerge.token1)}+{toDisplay(currentMerge.token2)}" ({currentMerge.count}×)</span
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
					currentMergedToken={currentMerge?.newToken}
				/>
			</div>

			<!-- Right: Pair Frequencies + Vocabulary (always together) -->
			<div class="grid grid-cols-2 gap-4 lg:col-span-6">
				<AlgorithmSteps pairs={pairCounts} />
				<VocabularyPanel {vocabulary} currentToken={currentMerge?.newToken} />
			</div>
		</div>
	{/if}
</div>
