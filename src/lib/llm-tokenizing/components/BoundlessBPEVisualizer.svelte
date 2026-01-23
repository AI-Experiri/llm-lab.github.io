<script>
	import anime from 'animejs';
	import { BoundlessBPE } from '../lib/boundlessBpe.js';
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
	let numMerges = $state(15);
	let animationSpeed = 600;

	// Tracks animation state machine: 'idle' | 'init' | 'counting' | 'selecting' | 'merging'
	// Kept for debugging and potential future conditional rendering
	let _phase = $state('idle');
	let phaseMessage = $state('Enter text and click "Start" to begin');

	const playback = usePlayback();

	let preTokensDisplay = $state([]);
	let preTokenSequence = $state([]);
	let tokensDisplay = $state([]);
	let pairCounts = $state([]);
	let supermergeDisplay = $state([]);
	let vocabulary = $state([]);

	let initialTokenCount = $state(0);
	let currentTokenCount = $state(0);
	let compressionRate = $state(0);
	let supermergeCount = $state(0);
	let showDetails = $state(false);
	let currentMerge = $state(null);

	const algorithmDetails = {
		description: [
			'Boundless BPE extends traditional BPE by allowing merges across word boundaries (supermerges). While standard BPE only merges adjacent tokens within a pre-tokenized unit, Boundless BPE can identify and merge recurring patterns that span multiple words.',
			'This enables better compression for common multi-word phrases and idioms. The algorithm alternates between standard pair merges and supermerges, which combine entire pre-tokenized units when they frequently appear together in sequence.'
		],
		pseudocode: `pre_tokens = pretokenize(corpus)
vocab = all unique characters
superwords = {}

for i in 1..num_merges:
  pairs = count_adjacent_pairs(pre_tokens)
  supermerges = count_adjacent_pretoken_sequences(corpus)

  if max(supermerges) > threshold:
    best = argmax(supermerges, key=frequency)
    new_token = supermerge(best.pt1, best.pt2)
    superwords.add(new_token)
  else:
    best = argmax(pairs, key=frequency)
    new_token = merge(best.left, best.right)

  vocab.add(new_token)
  corpus = replace_all(corpus, best, new_token)
return vocab`
	};

	/** @type {BoundlessBPE | null} */
	let boundlessBpe = $state(null);

	let canStart = $derived(!playback.isAnimating);

	function handleStart() {
		const text = inputText.trim();
		if (!text) {
			phaseMessage = 'Please enter some text to tokenize.';
			return;
		}

		boundlessBpe = new BoundlessBPE(text, numMerges);
		_phase = 'init';
		phaseMessage = 'Pre-tokenizing...';
		playback.setStep(0);
		pairCounts = [];
		supermergeDisplay = [];
		playback.setTotalSteps(boundlessBpe.merges.length);
		supermergeCount = boundlessBpe.merges.filter((m) => m.isSupermerge).length;

		preTokensDisplay = Object.entries(boundlessBpe.originalPreTokenCounts).map(
			([pt, count], idx) => ({
				id: idx,
				text: pt,
				count
			})
		);

		// Store sequence for display (limit to first 20 for UI)
		preTokenSequence = boundlessBpe.originalSequence.slice(0, 20);

		initialTokenCount = boundlessBpe.getInitialTokenCount();
		currentTokenCount = initialTokenCount;
		compressionRate = 0;
		vocabulary = boundlessBpe.getVocabAtStep(0);
		updateTokensDisplay(true);

		setTimeout(() => {
			_phase = 'idle';
			phaseMessage = `Ready! ${playback.totalSteps} operations (${supermergeCount} supermerges). Click "Step" or "Play".`;
		}, animationSpeed);
	}

	function updateTokensDisplay(animate = false) {
		if (!boundlessBpe) return;
		const { ptTrained, sequence } = boundlessBpe.getTokensAtStep(playback.currentStep);
		const allTokens = [];
		let idx = 0;

		const seenPts = new Set(); // eslint-disable-line svelte/prefer-svelte-reactivity
		for (const pt of sequence) {
			if (seenPts.has(pt)) continue;
			seenPts.add(pt);
			const tokens = ptTrained[pt];
			if (!tokens) continue;
			const isSuperword = boundlessBpe.superwords.has(pt);

			for (const token of tokens) {
				allTokens.push({
					id: idx++,
					text: token,
					highlight: false,
					merging: false,
					isNew: false,
					isSuperword,
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
		if (!boundlessBpe) return;
		currentTokenCount = boundlessBpe.getTokenCount(playback.currentStep);
		compressionRate =
			initialTokenCount > 0 ? Math.round((1 - currentTokenCount / initialTokenCount) * 100) : 0;
	}

	async function handleStep() {
		if (!boundlessBpe || playback.currentStep >= playback.totalSteps || playback.isAnimating)
			return;
		playback.startAnimating();
		const merge = boundlessBpe.merges[playback.currentStep];

		_phase = 'counting';
		phaseMessage = merge.isSupermerge
			? `Round ${merge.step}: Checking supermerge...`
			: `Round ${merge.step}: Counting pairs...`;

		const sorted = Object.entries(merge.pairFreqs)
			.map(([pair, count]) => {
				const [t1, t2] = pair.split('|');
				return { pair, display: `${toDisplay(t1)} + ${toDisplay(t2)}`, count, isMax: false };
			})
			.sort((a, b) => b.count - a.count)
			.slice(0, 10);

		const superSorted = Object.entries(merge.supermergeFreqs || {})
			.map(([superword, count]) => ({
				pair: superword,
				display: `⊕${toDisplay(superword)}`,
				count,
				isMax: false
			}))
			.sort((a, b) => b.count - a.count)
			.slice(0, 4);

		pairCounts = [];
		supermergeDisplay = [];
		for (let i = 0; i < sorted.length; i++) {
			await sleep(PAIR_STAGGER_DELAY);
			pairCounts = [...pairCounts, sorted[i]];
		}
		for (let i = 0; i < superSorted.length; i++) {
			await sleep(PAIR_STAGGER_DELAY);
			supermergeDisplay = [...supermergeDisplay, superSorted[i]];
		}
		await sleep(animationSpeed * PHASE_TRANSITION_RATIO);

		_phase = 'selecting';
		currentMerge = merge;
		if (merge.isSupermerge) {
			phaseMessage = `SUPERMERGE: "${toDisplay(merge.pt1)}" ⊕ "${toDisplay(merge.pt2)}" (${merge.count}×)`;
			supermergeDisplay = supermergeDisplay.map((s) => ({
				...s,
				isMax: s.pair === merge.superword
			}));
		} else {
			phaseMessage = `Best pair: "${toDisplay(merge.token1)} + ${toDisplay(merge.token2)}" (${merge.count}×)`;
			const selectedPair = `${merge.token1}|${merge.token2}`;
			pairCounts = pairCounts.map((p) => ({ ...p, isMax: p.pair === selectedPair }));
		}

		const allTokens = [];
		let idx = 0;
		for (const [pt, tokens] of Object.entries(merge.ptTrainedBefore)) {
			for (let i = 0; i < tokens.length; i++) {
				const isPartOfPair =
					!merge.isSupermerge &&
					((i < tokens.length - 1 &&
						tokens[i] === merge.token1 &&
						tokens[i + 1] === merge.token2) ||
						(i > 0 && tokens[i - 1] === merge.token1 && tokens[i] === merge.token2));
				const isSupermergeToken =
					merge.isSupermerge && tokens.length === 1 && (pt === merge.pt1 || pt === merge.pt2);
				allTokens.push({
					id: idx++,
					text: tokens[i],
					highlight: isPartOfPair || isSupermergeToken,
					isSupermerge: isSupermergeToken,
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
		phaseMessage = merge.isSupermerge
			? `Supermerging → "${toDisplay(merge.newToken)}"`
			: `Merging → "${toDisplay(merge.newToken)}"`;
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
		vocabulary = boundlessBpe.getVocabAtStep(playback.currentStep);
		setTimeout(() => updateTokensDisplay(), 0);
		updateStats();

		_phase = 'idle';
		phaseMessage =
			playback.currentStep >= playback.totalSteps
				? 'All operations complete!'
				: `Step ${playback.currentStep}/${playback.totalSteps} complete.`;
		playback.stopAnimating();
	}

	async function handlePlay() {
		await playback.handlePlay(handleStep);
	}

	function handleReset() {
		if (!boundlessBpe || playback.isAnimating || playback.isPlaying) return;
		anime.remove('.token');
		tokensDisplay = [];
		playback.reset();
		currentMerge = null;
		_phase = 'idle';
		phaseMessage = `Reset. ${playback.totalSteps} operations ready.`;
		pairCounts = [];
		supermergeDisplay = [];
		vocabulary = boundlessBpe.getVocabAtStep(0);
		setTimeout(() => updateTokensDisplay(), 0);
		updateStats();
	}

	function handleBack() {
		if (!boundlessBpe || playback.isAnimating || playback.isPlaying || playback.currentStep <= 0)
			return;
		anime.remove('.token');
		playback.decrementStep();
		_phase = 'idle';
		phaseMessage = `Step ${playback.currentStep}/${playback.totalSteps}`;
		pairCounts = [];
		supermergeDisplay = [];
		vocabulary = boundlessBpe.getVocabAtStep(playback.currentStep);
		updateTokensDisplay();
		updateStats();
	}
</script>

<div class="space-y-4">
	<!-- Algorithm Info -->
	<AlgorithmInfo algorithm="boundless" bind:expanded={showDetails} />

	{#if showDetails}
		<!-- Details View: Description + Pseudocode -->
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<!-- Left: Description -->
			<div class="rounded-xl bg-white/10 p-4 backdrop-blur">
				<h3 class="mb-3 flex items-center gap-2 text-base font-semibold text-white">
					<span class="h-2 w-2 rounded-full bg-fuchsia-400"></span>
					How Boundless BPE Works
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
				gradientFrom="from-fuchsia-600/80"
				gradientTo="to-violet-600/80"
				startColor="bg-fuchsia-600 hover:bg-fuchsia-500"
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
					<label for="boundless-merges" class="text-sm text-slate-300">Merges:</label>
					<input
						id="boundless-merges"
						type="number"
						bind:value={numMerges}
						min="1"
						max="50"
						class="w-16 rounded bg-slate-700 px-2 py-1.5 text-center text-white"
					/>
				</div>
			</Controls>
		</div>

		<!-- Boundary Legend -->
		<ExtraInfo>
			<span class="font-medium text-fuchsia-400">Boundaries:</span>
			<span class="flex items-center gap-1.5">
				<span class="h-3 w-3 rounded bg-slate-600"></span>
				<span class="text-slate-300">Regular merge (within │)</span>
			</span>
			<span class="flex items-center gap-1.5">
				<span class="h-3 w-3 rounded bg-fuchsia-500"></span>
				<span class="text-fuchsia-300">⊕ Supermerge (across │)</span>
			</span>
			<span class="text-slate-400">|</span>
			<span class="text-slate-300"
				>BPE uses pretoken counts, Boundless needs sequence to count adjacencies</span
			>
		</ExtraInfo>

		<!-- Main Grid: 6-3-3 -->
		<div class="grid grid-cols-1 gap-4 lg:grid-cols-12">
			<!-- Left: Pre-tokens + Sequence + Tokens (6 cols) -->
			<div class="space-y-4 lg:col-span-6">
				<PreTokens preTokens={preTokensDisplay} />

				<!-- Sequence Card (Boundless BPE specific) -->
				{#if preTokenSequence.length > 0}
					<div class="rounded-xl bg-white/10 p-4 backdrop-blur">
						<h3 class="mb-3 flex items-center gap-2 text-base font-semibold text-white">
							<span class="h-2 w-2 rounded-full bg-fuchsia-400"></span>
							Sequence
							<span class="text-sm font-normal text-slate-400"
								>(first {preTokenSequence.length}{boundlessBpe &&
								boundlessBpe.originalSequence.length > 20
									? ` of ${boundlessBpe.originalSequence.length}`
									: ''})</span
							>
						</h3>
						<div class="flex flex-wrap gap-1.5">
							{#each preTokenSequence as pt, i (i)}
								{@const isPartOfSupermerge =
									currentMerge?.isSupermerge &&
									((pt === currentMerge.pt1 && preTokenSequence[i + 1] === currentMerge.pt2) ||
										(pt === currentMerge.pt2 && preTokenSequence[i - 1] === currentMerge.pt1))}
								<span
									class="rounded-lg px-2 py-1 font-mono text-sm transition-all
                    {isPartOfSupermerge
										? 'bg-yellow-400 font-bold text-yellow-900 shadow-lg shadow-yellow-400/50'
										: 'bg-fuchsia-500/20 text-fuchsia-300'}"
								>
									{toDisplay(pt)}
								</span>
							{/each}
							{#if boundlessBpe && boundlessBpe.originalSequence.length > 20}
								<span class="self-center text-sm text-slate-500">...</span>
							{/if}
						</div>
					</div>
				{/if}

				<TokenDisplay
					tokens={tokensDisplay}
					currentStep={playback.currentStep}
					totalSteps={playback.totalSteps}
					{currentTokenCount}
					{compressionRate}
					accentColor="bg-fuchsia-400"
					progressColor="bg-fuchsia-500"
				>
					{#each tokensDisplay as token (token.id)}
						{#if token.isSeparator}
							<span class="px-1 font-bold text-slate-600">│</span>
						{:else}
							<span
								class="token rounded-lg px-2 py-1 font-mono text-sm font-medium transition-all duration-200
                {token.highlight
									? 'highlight bg-yellow-400 text-yellow-900 shadow-lg shadow-yellow-400/50'
									: ''}
                {token.isSuperword
									? 'bg-fuchsia-400 text-fuchsia-900 shadow-lg ring-1 shadow-fuchsia-400/50 ring-fuchsia-500'
									: ''}
                {token.isSupermerge ? 'bg-fuchsia-500 text-fuchsia-950' : ''}
                {token.isNew
									? 'new bg-emerald-400 text-emerald-900 shadow-lg shadow-emerald-400/50'
									: ''}
                {!token.highlight &&
								!token.isSuperword &&
								!token.isSupermerge &&
								!token.isNew &&
								token.text === (currentMerge?.newToken || currentMerge?.superword)
									? 'bg-yellow-400 font-bold text-yellow-900 shadow-lg shadow-yellow-400/50'
									: ''}
                {!token.highlight &&
								!token.isSuperword &&
								!token.isSupermerge &&
								!token.isNew &&
								token.text !== (currentMerge?.newToken || currentMerge?.superword)
									? 'bg-slate-700 text-slate-200'
									: ''}"
								style="opacity: {token.opacity}; transform: scale({token.scale})"
								title={token.isSuperword ? 'Superword (cross-boundary)' : ''}
								>{toDisplay(token.text)}</span
							>
						{/if}
					{/each}
				</TokenDisplay>
			</div>

			<!-- Right: Pair Frequencies + Vocabulary (always together) -->
			<div class="grid grid-cols-2 gap-4 lg:col-span-6">
				<AlgorithmSteps pairs={pairCounts}>
					{#if pairCounts.length === 0 && supermergeDisplay.length === 0}
						<p class="py-4 text-center text-sm text-slate-500">
							Pair counts appear here during each step...
						</p>
					{:else}
						{#each pairCounts as pair (pair.pair)}
							<div
								class="rounded-lg px-3 py-2 font-mono text-sm transition-all
              {pair.isMax
									? 'bg-yellow-400 font-bold text-yellow-900 shadow-lg'
									: 'bg-slate-700/70 text-slate-300'}"
							>
								<div class="flex items-center justify-between">
									<span>{pair.display}</span>
									<span
										class="rounded px-1.5 py-0.5 text-xs {pair.isMax
											? 'bg-yellow-600 text-yellow-100'
											: 'bg-slate-600'}">{pair.count}×</span
									>
								</div>
							</div>
						{/each}
						{#each supermergeDisplay as item (item.pair)}
							<div
								class="rounded-lg px-3 py-2 font-mono text-sm transition-all
              {item.isMax
									? 'bg-fuchsia-400 font-bold text-fuchsia-900 shadow-lg'
									: 'bg-fuchsia-700/50 text-fuchsia-300'}"
							>
								<div class="flex items-center justify-between">
									<span>{item.display}</span>
									<span
										class="rounded px-1.5 py-0.5 text-xs {item.isMax
											? 'bg-fuchsia-600 text-fuchsia-100'
											: 'bg-fuchsia-800'}">{item.count}×</span
									>
								</div>
							</div>
						{/each}
					{/if}
				</AlgorithmSteps>

				<VocabularyPanel {vocabulary}>
					{#if vocabulary.length === 0}
						<p class="py-4 text-center text-sm text-slate-500">Vocabulary appears here...</p>
					{:else}
						{@const currentToken = currentMerge?.newToken || currentMerge?.superword}
						{#each [...vocabulary].reverse() as item (item.token)}
							<div
								class="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm transition-all
                  {item.token === currentToken
									? 'bg-yellow-400 font-bold text-yellow-900 shadow-lg'
									: 'bg-slate-800/50'}
                  {item.isSupermerge && item.token !== currentToken
									? 'ring-1 ring-fuchsia-400/50'
									: ''}"
							>
								<span
									class="font-mono {item.token === currentToken
										? ''
										: item.isSupermerge
											? 'text-fuchsia-300'
											: item.isBase
												? 'text-slate-400'
												: 'text-purple-300'}">{toDisplay(item.token)}</span
								>
								{#if item.isSupermerge}
									<span
										class="{item.token === currentToken
											? 'text-yellow-700'
											: 'text-fuchsia-400'} text-[10px]">super</span
									>
								{:else if item.from}
									<span
										class="{item.token === currentToken
											? 'text-yellow-700'
											: 'text-slate-500'} ml-2 truncate text-xs">{item.from}</span
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
