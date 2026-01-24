<script>
	import anime from 'animejs';
	import { AGBPE } from '../lib/agBpe.js';
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
	let alpha = $state(0.6);
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
			'Attention-Guided BPE (AG-BPE) combines frequency-based and attention-based scoring. Real AG-BPE uses a ContextAnalyzer (3-layer Transformer, 8 heads, 512 dim) operating at character-level—no tokenizer needed. It computes attention between adjacent characters and aggregates scores across the corpus to guide merges.',
			'The mixing parameter α controls the balance: α ≥ 0.9 ≈ Standard BPE (frequency dominates); α ≤ 0.1 ≈ Pure attention (semantic focus); α ≥ 0.6 = Frequency-biased with attention influence; α ≤ 0.4 = Attention-biased with frequency influence; otherwise balanced.',
			'Demo note: We simulate attention with co-occurrence ratio: pairFreq / min(count₁, count₂). High ratio = tokens almost always appear together = strong bond.'
		],
		pseudocode: `pre_tokens = pretokenize(corpus)
vocab = all unique characters
attention_model = load_pretrained_model()

for i in 1..num_merges:
  pairs = count_adjacent_pairs(pre_tokens)
  attention_scores = compute_attention(pairs, attention_model)

  for each pair:
    freq_score = normalize(frequency(pair))
    attn_score = normalize(attention_scores[pair])
    hybrid_score[pair] = α × freq_score + (1-α) × attn_score

  best = argmax(hybrid_score)
  new_token = merge(best.left, best.right)
  vocab.add(new_token)
  pre_tokens = replace_all(pre_tokens, best, new_token)
return vocab`
	};

	/** @type {AGBPE | null} */
	let agbpe = $state(null);

	let canStart = $derived(!playback.isAnimating);

	function handleStart() {
		const text = inputText.trim();
		if (!text) {
			phaseMessage = 'Please enter some text to tokenize.';
			return;
		}

		agbpe = new AGBPE(text, numMerges, alpha);
		_phase = 'init';
		phaseMessage = 'Pre-tokenizing...';
		playback.setStep(0);
		pairScores = [];
		playback.setTotalSteps(agbpe.merges.length);

		preTokensDisplay = Object.entries(agbpe.preTokenCounts).map(([pt, count], idx) => ({
			id: idx,
			text: pt,
			count
		}));

		initialTokenCount = agbpe.getInitialTokenCount();
		currentTokenCount = initialTokenCount;
		compressionRate = 0;
		vocabulary = agbpe.getVocabAtStep(0);
		updateTokensDisplay(true);

		setTimeout(() => {
			_phase = 'idle';
			phaseMessage = `Ready! ${playback.totalSteps} merges (α=${alpha}). Click "Step" or "Play".`;
		}, animationSpeed);
	}

	function updateTokensDisplay(animate = false) {
		if (!agbpe) return;
		const ptTrained = agbpe.getTokensAtStep(playback.currentStep);
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
		if (!agbpe) return;
		currentTokenCount = agbpe.getTokenCount(playback.currentStep);
		compressionRate =
			initialTokenCount > 0 ? Math.round((1 - currentTokenCount / initialTokenCount) * 100) : 0;
	}

	async function handleStep() {
		if (!agbpe || playback.currentStep >= playback.totalSteps || playback.isAnimating) return;
		playback.startAnimating();
		const merge = agbpe.merges[playback.currentStep];

		_phase = 'counting';
		phaseMessage = `Round ${merge.step}: Computing hybrid scores (α=${alpha})...`;

		const sorted = Object.entries(merge.pairScores)
			.map(([pair, hybridScore]) => {
				const [t1, t2] = pair.split('|');
				const freq = merge.pairFreqs[pair] || 0;
				const attScore = merge.attentionScores[pair] || 0;
				return {
					pair,
					display: `${toDisplay(t1)} + ${toDisplay(t2)}`,
					hybridScore,
					freq,
					attScore,
					isMax: false
				};
			})
			.sort((a, b) => b.hybridScore - a.hybridScore)
			.slice(0, 10);

		pairScores = [];
		for (let i = 0; i < sorted.length; i++) {
			await sleep(PAIR_STAGGER_DELAY);
			pairScores = [...pairScores, sorted[i]];
		}
		await sleep(animationSpeed * PHASE_TRANSITION_RATIO);

		_phase = 'selecting';
		phaseMessage = `Best pair: "${toDisplay(merge.token1)} + ${toDisplay(merge.token2)}" (score: ${merge.hybridScore.toFixed(3)})`;
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
		vocabulary = agbpe.getVocabAtStep(playback.currentStep);
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
		if (!agbpe || playback.isAnimating || playback.isPlaying) return;
		anime.remove('.token');
		tokensDisplay = [];
		playback.reset();
		currentMerge = null;
		_phase = 'idle';
		phaseMessage = `Reset. ${playback.totalSteps} merge operations ready.`;
		pairScores = [];
		vocabulary = agbpe.getVocabAtStep(0);
		setTimeout(() => updateTokensDisplay(), 0);
		updateStats();
	}

	function handleBack() {
		if (!agbpe || playback.isAnimating || playback.isPlaying || playback.currentStep <= 0) return;
		anime.remove('.token');
		playback.decrementStep();
		_phase = 'idle';
		phaseMessage = `Step ${playback.currentStep}/${playback.totalSteps}`;
		pairScores = [];
		vocabulary = agbpe.getVocabAtStep(playback.currentStep);
		updateTokensDisplay();
		updateStats();
	}
</script>

<div class="space-y-4">
	<!-- Algorithm Info -->
	<AlgorithmInfo algorithm="agbpe" bind:expanded={showDetails} />

	{#if showDetails}
		<!-- Details View: Description + Pseudocode -->
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<!-- Left: Description -->
			<div class="rounded-xl bg-white/10 p-4 backdrop-blur">
				<h3 class="mb-3 flex items-center gap-2 font-semibold text-[var(--text-body)] text-white">
					<span class="h-2 w-2 rounded-full bg-indigo-400"></span>
					How AG-BPE Works
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
					<span class="h-2 w-2 rounded-full bg-blue-400"></span>
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
				gradientFrom="from-indigo-600/80"
				gradientTo="to-cyan-600/80"
				startColor="bg-indigo-600 hover:bg-indigo-500"
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
					<label for="agbpe-alpha" class="text-[var(--text-small)] text-indigo-400">α:</label>
					<input
						id="agbpe-alpha"
						type="range"
						min="0"
						max="1"
						step="0.1"
						bind:value={alpha}
						class="w-20 accent-indigo-500"
					/>
					<span class="w-8 text-[var(--text-small)] text-indigo-300">{alpha.toFixed(1)}</span>
				</div>
				<div class="flex items-center gap-2">
					<label for="agbpe-merges" class="text-[var(--text-small)] text-slate-300">Merges:</label>
					<input
						id="agbpe-merges"
						type="number"
						bind:value={numMerges}
						min="1"
						max="50"
						class="w-16 rounded bg-slate-700 px-2 py-1.5 text-center text-white"
					/>
				</div>
			</Controls>
		</div>

		<!-- Scoring Info -->
		<ExtraInfo>
			<span class="font-medium text-indigo-400">Hybrid Score:</span>
			<code class="rounded bg-slate-800 px-1.5 py-0.5 text-[var(--text-tiny)] text-cyan-300"
				>{alpha.toFixed(1)}×freq + {(1 - alpha).toFixed(1)}×attn</code
			>
			<span class="text-slate-400">|</span>
			<span class="font-medium text-cyan-400">Attn (simulated):</span>
			<code class="rounded bg-slate-800 px-1.5 py-0.5 text-[var(--text-tiny)] text-cyan-300"
				>pairFreq / min(count₁, count₂)</code
			>
			<span class="text-slate-400">|</span>
			<span class="text-slate-300">
				{#if alpha >= 0.9}
					<span class="text-indigo-300">≈ Standard BPE</span>
				{:else if alpha <= 0.1}
					<span class="text-cyan-300">≈ Pure attention</span>
				{:else if alpha >= 0.6}
					<span class="text-indigo-300">Frequency-biased</span>
				{:else if alpha <= 0.4}
					<span class="text-cyan-300">Attention-biased</span>
				{:else}
					<span class="text-purple-300">Balanced</span>
				{/if}
			</span>
			{#if currentMerge}
				<span class="text-slate-400">|</span>
				<span class="text-indigo-300"
					>"{toDisplay(currentMerge.token1)}+{toDisplay(currentMerge.token2)}" → {currentMerge.hybridScore.toFixed(
						3
					)}</span
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
					accentColor="bg-indigo-400"
					progressColor="bg-indigo-500"
					currentMergedToken={currentMerge?.newToken}
				/>
			</div>

			<!-- Right: Hybrid Scores + Vocabulary (always together) -->
			<div class="grid grid-cols-2 gap-4 lg:col-span-6">
				<AlgorithmSteps title="Hybrid Scores" emptyMessage="Scores appear here during each step...">
					<p class="mb-3 text-[var(--text-tiny)] text-indigo-400">α×freq + (1-α)×attn</p>
					{#if pairScores.length === 0}
						<p class="py-4 text-center text-[var(--text-small)] text-slate-500">
							Scores appear here during each step...
						</p>
					{:else}
						{#each pairScores as item (item.pair)}
							<div
								class="rounded-lg px-3 py-2 font-mono text-[var(--text-tiny)] transition-all
              {item.isMax
									? 'bg-indigo-400 font-bold text-indigo-900 shadow-lg'
									: 'bg-slate-700/70 text-slate-300'}"
							>
								<div class="mb-1 flex items-center justify-between">
									<span class="text-[var(--text-small)]">{item.display}</span>
									<span
										class="rounded px-1.5 py-0.5 text-[var(--text-tiny)] {item.isMax
											? 'bg-indigo-600 text-indigo-100'
											: 'bg-slate-600'}">{item.hybridScore.toFixed(3)}</span
									>
								</div>
								<div class="text-[10px] {item.isMax ? 'text-indigo-700' : 'text-slate-500'}">
									f:{item.freq} a:{item.attScore.toFixed(2)}
								</div>
							</div>
						{/each}
					{/if}
				</AlgorithmSteps>

				<VocabularyPanel
					{vocabulary}
					mergedColor="text-indigo-300"
					currentToken={currentMerge?.newToken}
				>
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
											: 'text-indigo-300'}">{toDisplay(item.token)}</span
								>
								{#if item.hybridScore}
									<span class="text-[10px] text-indigo-400">{item.hybridScore.toFixed(3)}</span>
								{:else if item.from}
									<span class="ml-2 truncate text-[var(--text-tiny)] text-slate-500"
										>{item.from}</span
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
