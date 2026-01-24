<script>
	import anime from 'animejs';
	import { AdaptiveBPE } from '../lib/adaptiveBpe.js';
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
	import Controls from './common/Controls.svelte';
	import PreTokens from './common/PreTokens.svelte';
	import TokenDisplay from './common/TokenDisplay.svelte';
	import AlgorithmSteps from './common/AlgorithmSteps.svelte';
	import VocabularyPanel from './common/VocabularyPanel.svelte';
	import ExtraInfo from './common/ExtraInfo.svelte';

	const defaultText = `low low low low low
lower lower widest widest widest
newest newest newest newest newest newest`;
	const defaultDomainVocab = 'low, lower, widest, newest';

	let inputText = $state(defaultText);
	let domainVocabInput = $state(defaultDomainVocab);
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
	let substringMatches = $state({});

	let initialTokenCount = $state(0);
	let currentTokenCount = $state(0);
	let compressionRate = $state(0);
	let showDetails = $state(false);
	let currentMerge = $state(null);

	const algorithmDetails = {
		description: [
			'Adaptive BPE enhances standard BPE by incorporating domain-specific knowledge. It pre-tokenizes text by identifying and protecting domain-specific terms (like medical terminology) from being split incorrectly.',
			'This approach maintains semantic coherence for specialized vocabulary while still learning general patterns through the standard BPE merge process. Each domain term is matched as a substring and preserved as a single unit during pre-tokenization.'
		],
		pseudocode: `domain_vocab = parse_domain_terms(input)
pre_tokens = pretokenize_with_domain(corpus, domain_vocab)
vocab = all unique characters + domain_terms

for i in 1..num_merges:
  pairs = count_adjacent_pairs(pre_tokens)
  best = argmax(pairs, key=frequency)
  new_token = merge(best.left, best.right)
  vocab.add(new_token)
  pre_tokens = replace_all(pre_tokens, best, new_token)
return vocab`
	};

	/** @type {AdaptiveBPE | null} */
	let adaptiveBpe = $state(null);

	let canStart = $derived(!playback.isAnimating);

	function parseDomainVocab(input) {
		return input
			.split(',')
			.map((s) => s.trim())
			.filter((s) => s.length > 0);
	}

	function handleStart() {
		const text = inputText.trim();
		if (!text) {
			phaseMessage = 'Please enter some text to tokenize.';
			return;
		}

		const domainVocab = parseDomainVocab(domainVocabInput);
		adaptiveBpe = new AdaptiveBPE(text, numMerges, domainVocab);
		_phase = 'init';
		phaseMessage = 'Pre-tokenizing with domain matching...';
		playback.setStep(0);
		pairCounts = [];
		playback.setTotalSteps(adaptiveBpe.merges.length);
		substringMatches = adaptiveBpe.getSubstringMatches();

		preTokensDisplay = Object.entries(adaptiveBpe.preTokenCounts).map(([pt, count], idx) => {
			const matches = substringMatches[pt] || [];
			return { id: idx, text: pt, count, hasDomainMatch: matches.length > 0 };
		});

		initialTokenCount = adaptiveBpe.getInitialTokenCount();
		currentTokenCount = initialTokenCount;
		compressionRate = 0;
		vocabulary = adaptiveBpe.getVocabAtStep(0);
		updateTokensDisplay(true);

		setTimeout(() => {
			_phase = 'idle';
			phaseMessage = `Ready! ${playback.totalSteps} merges (${domainVocab.length} domain terms). Click "Step" or "Play".`;
		}, animationSpeed);
	}

	function updateTokensDisplay(animate = false) {
		if (!adaptiveBpe) return;
		const ptTrained = adaptiveBpe.getTokensAtStep(playback.currentStep);
		const allTokens = [];
		let idx = 0;

		for (const [pt, tokens] of Object.entries(ptTrained)) {
			const matches = substringMatches[pt] || [];
			for (const token of tokens) {
				const isDomain = matches.some((m) => m.term === token);
				allTokens.push({
					id: idx++,
					text: token,
					highlight: false,
					merging: false,
					isNew: false,
					isDomain,
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
		if (!adaptiveBpe) return;
		currentTokenCount = adaptiveBpe.getTokenCount(playback.currentStep);
		compressionRate =
			initialTokenCount > 0 ? Math.round((1 - currentTokenCount / initialTokenCount) * 100) : 0;
	}

	async function handleStep() {
		if (!adaptiveBpe || playback.currentStep >= playback.totalSteps || playback.isAnimating) return;
		playback.startAnimating();
		const merge = adaptiveBpe.merges[playback.currentStep];

		_phase = 'counting';
		phaseMessage = `Round ${merge.step}: Counting pairs...`;

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
		for (const [pt, tokens] of Object.entries(merge.ptTrainedBefore)) {
			const matches = substringMatches[pt] || [];
			for (let i = 0; i < tokens.length; i++) {
				const isPartOfPair =
					(i < tokens.length - 1 && tokens[i] === merge.token1 && tokens[i + 1] === merge.token2) ||
					(i > 0 && tokens[i - 1] === merge.token1 && tokens[i] === merge.token2);
				const isDomain = matches.some((m) => m.term === tokens[i]);
				allTokens.push({
					id: idx++,
					text: tokens[i],
					highlight: isPartOfPair,
					isDomain,
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
		vocabulary = adaptiveBpe.getVocabAtStep(playback.currentStep);
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
		if (!adaptiveBpe || playback.isAnimating || playback.isPlaying) return;
		anime.remove('.token');
		tokensDisplay = [];
		playback.reset();
		currentMerge = null;
		_phase = 'idle';
		phaseMessage = `Reset. ${playback.totalSteps} merge operations ready.`;
		pairCounts = [];
		vocabulary = adaptiveBpe.getVocabAtStep(0);
		setTimeout(() => updateTokensDisplay(), 0);
		updateStats();
	}

	function handleBack() {
		if (!adaptiveBpe || playback.isAnimating || playback.isPlaying || playback.currentStep <= 0)
			return;
		anime.remove('.token');
		playback.decrementStep();
		_phase = 'idle';
		phaseMessage = `Step ${playback.currentStep}/${playback.totalSteps}`;
		pairCounts = [];
		vocabulary = adaptiveBpe.getVocabAtStep(playback.currentStep);
		updateTokensDisplay();
		updateStats();
	}
</script>

<div class="space-y-4">
	<!-- Algorithm Info -->
	<AlgorithmInfo algorithm="adaptive" bind:expanded={showDetails} />

	{#if showDetails}
		<!-- Details View: Description + Pseudocode -->
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<!-- Left: Description -->
			<div class="rounded-xl bg-white/10 p-4 backdrop-blur">
				<h3 class="mb-3 flex items-center gap-2 font-semibold text-[var(--text-body)] text-white">
					<span class="h-2 w-2 rounded-full bg-cyan-400"></span>
					How Adaptive BPE Works
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
			<!-- Text Input Card (with domain terms) -->
			<div class="rounded-xl bg-white/10 p-4 backdrop-blur lg:col-span-5">
				<div class="flex gap-2">
					<div class="flex flex-1 flex-col">
						<textarea
							bind:value={inputText}
							disabled={playback.isAnimating || playback.isPlaying}
							placeholder="Enter text to tokenize..."
							maxlength="1000"
							class="min-h-24 flex-1 resize-none rounded-lg bg-slate-800/50 px-3 py-2 text-[var(--text-small)] text-white disabled:opacity-50"
							rows="3"
						></textarea>
						<div class="mt-1 text-right text-[var(--text-tiny)] text-slate-400">
							{inputText.length}/1000
						</div>
					</div>
					<div class="flex w-28 flex-col">
						<textarea
							bind:value={domainVocabInput}
							disabled={playback.isAnimating || playback.isPlaying}
							placeholder="domain terms..."
							maxlength="200"
							class="flex-1 resize-none rounded-lg border border-cyan-500/40 bg-cyan-500/20 px-2 py-2 text-[var(--text-tiny)] text-cyan-200 disabled:opacity-50"
						></textarea>
						<div class="mt-1 text-right text-[var(--text-tiny)] text-cyan-400">
							{domainVocabInput.length}/200
						</div>
					</div>
				</div>
			</div>

			<Controls
				statusMessage={phaseMessage}
				gradientFrom="from-cyan-600/80"
				gradientTo="to-teal-600/80"
				startColor="bg-cyan-600 hover:bg-cyan-500"
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
					<label for="adaptive-merges" class="text-[var(--text-small)] text-slate-300"
						>Merges:</label
					>
					<input
						id="adaptive-merges"
						type="number"
						bind:value={numMerges}
						min="1"
						max="50"
						class="w-16 rounded bg-slate-700 px-2 py-1.5 text-center text-white"
					/>
				</div>
			</Controls>
		</div>

		<!-- Domain Token Legend -->
		<ExtraInfo
			label="Tokens:"
			items={[
				{ bgColor: 'bg-cyan-500', textColor: 'text-cyan-300', text: 'Domain Term' },
				{ bgColor: 'bg-slate-600', textColor: 'text-slate-300', text: 'Regular' }
			]}
		/>

		<!-- Main Grid: 6-3-3 -->
		<div class="grid grid-cols-1 gap-4 lg:grid-cols-12">
			<!-- Left: Pre-tokens + Tokens (6 cols) -->
			<div class="space-y-4 lg:col-span-6">
				<PreTokens preTokens={preTokensDisplay}>
					{#each preTokensDisplay as pt (pt.id)}
						<span
							class="{pt.hasDomainMatch
								? 'bg-cyan-500/30 text-cyan-200 ring-1 ring-cyan-400'
								: 'bg-pink-500/20 text-pink-300'} rounded-lg px-2 py-1 font-mono text-[var(--text-small)]"
						>
							{toDisplay(pt.text)}<span class="ml-1 opacity-60">×{pt.count}</span>
						</span>
					{/each}
				</PreTokens>

				<TokenDisplay
					tokens={tokensDisplay}
					currentStep={playback.currentStep}
					totalSteps={playback.totalSteps}
					{currentTokenCount}
					{compressionRate}
					accentColor="bg-cyan-400"
					progressColor="bg-cyan-500"
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
                {token.isDomain
									? 'bg-cyan-400 text-cyan-900 shadow-lg ring-1 shadow-cyan-400/50 ring-cyan-500'
									: ''}
                {token.isNew
									? 'new bg-emerald-400 text-emerald-900 shadow-lg shadow-emerald-400/50'
									: ''}
                {!token.highlight &&
								!token.isDomain &&
								!token.isNew &&
								token.text === currentMerge?.newToken
									? 'bg-yellow-400 font-bold text-yellow-900 shadow-lg shadow-yellow-400/50'
									: ''}
                {!token.highlight &&
								!token.isDomain &&
								!token.isNew &&
								token.text !== currentMerge?.newToken
									? 'bg-slate-700 text-slate-200'
									: ''}"
								style="opacity: {token.opacity}; transform: scale({token.scale})"
								title={token.isDomain ? 'Domain vocabulary match' : ''}
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
                  {item.isDomain && item.token !== currentMerge?.newToken
									? 'ring-1 ring-cyan-400/50'
									: ''}"
							>
								<span
									class="font-mono {item.token === currentMerge?.newToken
										? ''
										: item.isDomain
											? 'text-cyan-300'
											: item.isBase
												? 'text-slate-400'
												: 'text-purple-300'}">{toDisplay(item.token)}</span
								>
								{#if item.isDomain}
									<span
										class="{item.token === currentMerge?.newToken
											? 'text-yellow-700'
											: 'text-cyan-400'} text-[10px]">domain</span
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
