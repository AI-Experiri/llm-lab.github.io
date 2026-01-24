<script>
	import anime from 'animejs';
	import { WordPiece } from '../lib/wordpiece.js';
	import { toDisplay, sleep } from '../lib/utils.js';
	import { usePlayback } from '../lib/usePlayback.svelte.js';
	import {
		PAIR_STAGGER_DELAY,
		DOM_SETTLE_DELAY,
		PHASE_TRANSITION_RATIO,
		ANIMATION_DURATION_RATIO,
		SCALE_ANIMATION_RATIO,
		TOKEN_STAGGER_DELAY
	} from '../lib/animationConstants.js';
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
	let pairScores = $state([]);
	let vocabulary = $state([]);

	let initialTokenCount = $state(0);
	let currentTokenCount = $state(0);
	let compressionRate = $state(0);
	let showDetails = $state(false);
	let currentMerge = $state(null);

	const algorithmDetails = {
		description: [
			'WordPiece improves on BPE by using a likelihood-based scoring function instead of raw frequency. This prevents common characters from dominating the merge decisions.',
			'The score normalizes pair frequency by dividing by individual token frequencies, favoring pairs that appear together more often than expected by chance. Used in BERT and related models.'
		],
		pseudocode: `vocab = all unique characters
for i in 1..num_merges:
  pairs = count_adjacent_pairs(corpus)
  for each pair (a,b):
    score[a,b] = count(a,b) / (count(a) × count(b))
  best = argmax(pairs, key=score)
  new_token = merge(best.left, best.right)
  vocab.add(new_token)
return vocab`
	};

	/** @type {WordPiece | null} */
	let wordpiece = $state(null);

	let canStart = $derived(!playback.isAnimating);

	function handleStart() {
		const text = inputText.trim();
		if (!text) {
			phaseMessage = 'Please enter some text to tokenize.';
			return;
		}

		wordpiece = new WordPiece(text, numMerges);
		_phase = 'init';
		phaseMessage = 'Pre-tokenizing text...';
		playback.setStep(0);
		pairScores = [];
		playback.setTotalSteps(wordpiece.merges.length);

		preTokensDisplay = Object.entries(wordpiece.preTokenCounts).map(([pt, count], idx) => ({
			id: idx,
			text: pt,
			count
		}));

		initialTokenCount = wordpiece.getInitialTokenCount();
		currentTokenCount = initialTokenCount;
		compressionRate = 0;
		vocabulary = wordpiece.getVocabAtStep(0);
		updateTokensDisplay(true);

		setTimeout(() => {
			_phase = 'idle';
			phaseMessage = `Ready! ${playback.totalSteps} merge operations. Click "Step" or "Play".`;
		}, animationSpeed);
	}

	function updateTokensDisplay(animate = false) {
		if (!wordpiece) return;
		const ptTrained = wordpiece.getTokensAtStep(playback.currentStep);
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
		if (!wordpiece) return;
		currentTokenCount = wordpiece.getTokenCount(playback.currentStep);
		compressionRate =
			initialTokenCount > 0 ? Math.round((1 - currentTokenCount / initialTokenCount) * 100) : 0;
	}

	async function handleStep() {
		if (!wordpiece || playback.currentStep >= playback.totalSteps || playback.isAnimating) return;
		playback.startAnimating();
		const merge = wordpiece.merges[playback.currentStep];

		_phase = 'counting';
		phaseMessage = `Round ${merge.step}: Computing normalized scores...`;

		const sorted = Object.entries(merge.pairScores)
			.map(([pair, score]) => {
				const [t1, t2] = pair.split('|');
				const freq = merge.pairFreqs[pair];
				return { pair, display: `${toDisplay(t1)} + ${toDisplay(t2)}`, score, freq, isMax: false };
			})
			.sort((a, b) => b.score - a.score)
			.slice(0, 10);

		pairScores = [];
		for (let i = 0; i < sorted.length; i++) {
			await sleep(PAIR_STAGGER_DELAY);
			pairScores = [...pairScores, sorted[i]];
		}
		await sleep(animationSpeed * PHASE_TRANSITION_RATIO);

		_phase = 'selecting';
		phaseMessage = `Selected: "${toDisplay(merge.token1)} + ${toDisplay(merge.token2)}" (score: ${merge.score.toFixed(4)})`;
		currentMerge = merge;
		const selectedPair = `${merge.token1}|${merge.token2}`;
		pairScores = pairScores.map((p) => ({ ...p, isMax: p.pair === selectedPair }));

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
		phaseMessage = `Merging: "${toDisplay(merge.token1)}" + "${toDisplay(merge.token2)}" → "${toDisplay(merge.newToken)}"`;
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
		vocabulary = wordpiece.getVocabAtStep(playback.currentStep);
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
		if (!wordpiece || playback.isAnimating || playback.isPlaying) return;
		anime.remove('.token');
		tokensDisplay = [];
		playback.reset();
		currentMerge = null;
		_phase = 'idle';
		phaseMessage = `Reset. ${playback.totalSteps} merge operations ready.`;
		pairScores = [];
		vocabulary = wordpiece.getVocabAtStep(0);
		setTimeout(() => updateTokensDisplay(), 0);
		updateStats();
	}

	function handleBack() {
		if (!wordpiece || playback.isAnimating || playback.isPlaying || playback.currentStep <= 0)
			return;
		anime.remove('.token');
		playback.decrementStep();
		_phase = 'idle';
		phaseMessage = `Step ${playback.currentStep}/${playback.totalSteps}`;
		pairScores = [];
		vocabulary = wordpiece.getVocabAtStep(playback.currentStep);
		updateTokensDisplay();
		updateStats();
	}
</script>

<div class="space-y-4">
	<!-- Algorithm Info -->
	<AlgorithmInfo algorithm="wordpiece" bind:expanded={showDetails} />

	{#if showDetails}
		<!-- Details View: Description + Pseudocode -->
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<!-- Left: Description -->
			<div class="rounded-xl bg-white/10 p-4 backdrop-blur">
				<h3 class="mb-3 flex items-center gap-2 font-semibold text-[var(--text-body)] text-white">
					<span class="h-2 w-2 rounded-full bg-green-400"></span>
					How WordPiece Works
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
					<span class="h-2 w-2 rounded-full bg-emerald-400"></span>
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
				gradientFrom="from-green-600/80"
				gradientTo="to-emerald-600/80"
				startColor="bg-green-600 hover:bg-green-500"
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
					<label for="wp-merges" class="text-[var(--text-small)] text-slate-300">Merges:</label>
					<input
						id="wp-merges"
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
			<span class="font-medium text-blue-400">Selection:</span>
			<span class="text-slate-300">score = freq(pair) / (freq(a) × freq(b)) → highest wins</span>
			{#if currentMerge}
				{@const freqA = currentMerge.tokenCounts[currentMerge.token1] || 1}
				{@const freqB = currentMerge.tokenCounts[currentMerge.token2] || 1}
				<span class="text-blue-300"
					>→ {currentMerge.count}/({freqA}×{freqB}) = {currentMerge.score.toFixed(4)} "{toDisplay(
						currentMerge.token1
					)}+{toDisplay(currentMerge.token2)}"</span
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
					accentColor="bg-green-400"
					progressColor="bg-green-500"
					currentMergedToken={currentMerge?.newToken}
				/>
			</div>

			<!-- Right: Pair Scores + Vocabulary (always together) -->
			<div class="grid grid-cols-2 gap-4 lg:col-span-6">
				<AlgorithmSteps
					title="Pair Scores"
					emptyMessage="Scores appear here during each step..."
					highlightColor="bg-green-400 text-green-900"
					highlightBadge="bg-green-600 text-green-100"
				>
					{#if pairScores.length === 0}
						<p class="py-4 text-center text-[var(--text-small)] text-slate-500">
							Scores appear here during each step...
						</p>
					{:else}
						{#each pairScores as item (item.pair)}
							<div
								class="rounded-lg px-3 py-2 font-mono text-[var(--text-small)] transition-all
              {item.isMax
									? 'bg-green-400 font-bold text-green-900 shadow-lg'
									: 'bg-slate-700/70 text-slate-300'}"
							>
								<div class="flex items-center justify-between">
									<span>{item.display}</span>
									<span
										class="rounded px-1.5 py-0.5 text-[var(--text-tiny)] {item.isMax
											? 'bg-green-600 text-green-100'
											: 'bg-slate-600'}">{item.score.toFixed(3)}</span
									>
								</div>
							</div>
						{/each}
					{/if}
				</AlgorithmSteps>

				<VocabularyPanel {vocabulary} mergedColor="text-green-300">
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
									: 'bg-slate-800/50'}"
							>
								<span
									class="font-mono {item.token === currentMerge?.newToken
										? ''
										: item.isBase
											? 'text-slate-400'
											: 'text-green-300'}">{toDisplay(item.token)}</span
								>
								{#if item.score}
									<span
										class="{item.token === currentMerge?.newToken
											? 'text-yellow-700'
											: 'text-green-400'} text-[var(--text-tiny)]">{item.score.toFixed(3)}</span
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
