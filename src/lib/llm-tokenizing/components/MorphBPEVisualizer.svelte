<script>
	import anime from 'animejs';
	import { MorphBPE } from '../lib/morphBpe.js';
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
	let mode = $state('pretokenize');
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
	let morphemeSegments = $state({});

	let initialTokenCount = $state(0);
	let currentTokenCount = $state(0);
	let compressionRate = $state(0);
	let showDetails = $state(false);
	let currentMerge = $state(null);

	const algorithmDetails = {
		description: [
			'MorphBPE (arXiv:2502.00894) constrains BPE using external morphological data. It does NOT perform morphological analysis itself—it relies on curated linguistic resources like SIGMORPHON datasets or specialized analyzers (e.g., Lemlat for Latin).',
			'Two modes exist: Pre-tokenize mode segments words at morpheme boundaries before BPE runs, blocking cross-boundary merges. Seeding mode initializes the vocabulary with known morphemes (suffixes, prefixes) before standard BPE.',
			'Demo note: This visualization uses simplified English pattern matching as an approximation. Real MorphBPE requires external morphological segmentation data for each target language.'
		],
		pseudocode: `# Real MorphBPE requires external linguistic data!
# e.g., SIGMORPHON 2022, Lemlat, Arabic Treebank

morpheme_data = load_external_segmentation(language)

if mode == "pretokenize":
  corpus = segment_at_morpheme_boundaries(corpus)
  # Merges cannot cross segment boundaries
else:  # seeding mode
  vocab = known_morphemes + characters
  # BPE proceeds normally but prefers morphemes

for i in 1..num_merges:
  pairs = count_pairs(corpus)
  pairs = filter_cross_boundary_merges(pairs)
  best = argmax(pairs, key=frequency)
  vocab.add(merge(best))
return vocab`
	};

	/** @type {MorphBPE | null} */
	let morphbpe = $state(null);

	let canStart = $derived(!playback.isAnimating);

	function getMorphColor(type) {
		switch (type) {
			case 'prefix':
				return 'bg-rose-500/30 text-rose-200 ring-1 ring-rose-400';
			case 'root':
				return 'bg-amber-500/30 text-amber-200 ring-1 ring-amber-400';
			case 'suffix':
				return 'bg-teal-500/30 text-teal-200 ring-1 ring-teal-400';
			default:
				return 'bg-slate-700/50 text-slate-200';
		}
	}

	function handleStart() {
		const text = inputText.trim();
		if (!text) {
			phaseMessage = 'Please enter some text to tokenize.';
			return;
		}

		morphbpe = new MorphBPE(text, numMerges, mode);
		_phase = 'init';
		phaseMessage = 'Analyzing morphemes...';
		playback.setStep(0);
		pairCounts = [];
		playback.setTotalSteps(morphbpe.merges.length);
		morphemeSegments = morphbpe.getMorphemeSegments();

		preTokensDisplay = Object.entries(morphbpe.preTokenCounts).map(([pt, count], idx) => {
			const segments = morphemeSegments[pt] || [];
			return { id: idx, text: pt, count, segments };
		});

		initialTokenCount = morphbpe.getInitialTokenCount();
		currentTokenCount = initialTokenCount;
		compressionRate = 0;
		vocabulary = morphbpe.getVocabAtStep(0);
		updateTokensDisplay(true);

		setTimeout(() => {
			_phase = 'idle';
			const mergeNote =
				playback.totalSteps < numMerges
					? ` (only ${playback.totalSteps} valid, cross-boundary blocked)`
					: '';
			phaseMessage = `Ready! ${playback.totalSteps}/${numMerges} merges${mergeNote} (${mode} mode). Click "Step" or "Play".`;
		}, animationSpeed);
	}

	function updateTokensDisplay(animate = false) {
		if (!morphbpe) return;
		const ptTrained = morphbpe.getTokensAtStep(playback.currentStep);
		const allTokens = [];
		let idx = 0;

		for (const [pt, tokens] of Object.entries(ptTrained)) {
			const segments = morphemeSegments[pt] || [];
			for (const token of tokens) {
				const segment = segments.find((s) => s.text === token);
				allTokens.push({
					id: idx++,
					text: token,
					highlight: false,
					merging: false,
					isNew: false,
					isMorpheme: !!segment,
					morphemeType: segment?.type || null,
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
		if (!morphbpe) return;
		currentTokenCount = morphbpe.getTokenCount(playback.currentStep);
		compressionRate =
			initialTokenCount > 0 ? Math.round((1 - currentTokenCount / initialTokenCount) * 100) : 0;
	}

	async function handleStep() {
		if (!morphbpe || playback.currentStep >= playback.totalSteps || playback.isAnimating) return;
		playback.startAnimating();
		const merge = morphbpe.merges[playback.currentStep];

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
			const segments = morphemeSegments[pt] || [];
			for (let i = 0; i < tokens.length; i++) {
				const isPartOfPair =
					(i < tokens.length - 1 && tokens[i] === merge.token1 && tokens[i + 1] === merge.token2) ||
					(i > 0 && tokens[i - 1] === merge.token1 && tokens[i] === merge.token2);
				const segment = segments.find((s) => s.text === tokens[i]);
				allTokens.push({
					id: idx++,
					text: tokens[i],
					highlight: isPartOfPair,
					isMorpheme: !!segment,
					morphemeType: segment?.type || null,
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
		vocabulary = morphbpe.getVocabAtStep(playback.currentStep);
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
		if (!morphbpe || playback.isAnimating || playback.isPlaying) return;
		anime.remove('.token');
		tokensDisplay = [];
		playback.reset();
		currentMerge = null;
		_phase = 'idle';
		phaseMessage = `Reset. ${playback.totalSteps} merge operations ready.`;
		pairCounts = [];
		vocabulary = morphbpe.getVocabAtStep(0);
		setTimeout(() => updateTokensDisplay(), 0);
		updateStats();
	}

	function handleBack() {
		if (!morphbpe || playback.isAnimating || playback.isPlaying || playback.currentStep <= 0)
			return;
		anime.remove('.token');
		playback.decrementStep();
		_phase = 'idle';
		phaseMessage = `Step ${playback.currentStep}/${playback.totalSteps}`;
		pairCounts = [];
		vocabulary = morphbpe.getVocabAtStep(playback.currentStep);
		updateTokensDisplay();
		updateStats();
	}
</script>

<div class="space-y-4">
	<!-- Algorithm Info -->
	<AlgorithmInfo algorithm="morph" bind:expanded={showDetails} />

	{#if showDetails}
		<!-- Details View: Description + Pseudocode -->
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<!-- Left: Description -->
			<div class="rounded-xl bg-white/10 p-4 backdrop-blur">
				<h3 class="mb-3 flex items-center gap-2 text-base font-semibold text-white">
					<span class="h-2 w-2 rounded-full bg-teal-400"></span>
					How MorphBPE Works
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
				gradientFrom="from-teal-600/80"
				gradientTo="to-rose-600/80"
				startColor="bg-teal-600 hover:bg-teal-500"
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
					<label for="morph-mode" class="text-sm text-teal-400">Mode:</label>
					<select
						id="morph-mode"
						bind:value={mode}
						class="rounded border border-teal-500/30 bg-teal-900/30 px-2 py-1.5 text-sm text-teal-200"
					>
						<option value="pretokenize">Pre-tokenize</option>
						<option value="seeding">Seeding</option>
					</select>
				</div>
				<div class="flex items-center gap-2">
					<label for="morph-merges" class="text-sm text-slate-300">Merges:</label>
					<input
						id="morph-merges"
						type="number"
						bind:value={numMerges}
						min="1"
						max="50"
						class="w-16 rounded bg-slate-700 px-2 py-1.5 text-center text-white"
					/>
				</div>
			</Controls>
		</div>

		<!-- Morpheme Legend + Mode Info -->
		<ExtraInfo>
			<span class="font-medium text-teal-400">Morphemes:</span>
			<span class="flex items-center gap-1.5">
				<span class="h-3 w-3 rounded bg-rose-500/50"></span>
				<span class="text-rose-300">Prefix</span>
			</span>
			<span class="flex items-center gap-1.5">
				<span class="h-3 w-3 rounded bg-amber-500/50"></span>
				<span class="text-amber-300">Root</span>
			</span>
			<span class="flex items-center gap-1.5">
				<span class="h-3 w-3 rounded bg-teal-500/50"></span>
				<span class="text-teal-300">Suffix</span>
			</span>
			<span class="text-slate-400">|</span>
			<span class="text-slate-300">
				{#if mode === 'pretokenize'}
					<span class="font-medium text-teal-300">Pretokenize:</span> external data segments words first,
					merges blocked across morpheme boundaries
				{:else}
					<span class="font-medium text-amber-300">Seeding:</span> known morphemes added to initial vocab,
					standard BPE follows
				{/if}
			</span>
		</ExtraInfo>

		<!-- Main Grid: 6-3-3 -->
		<div class="grid grid-cols-1 gap-4 lg:grid-cols-12">
			<!-- Left: Pre-tokens + Tokens (6 cols) -->
			<div class="space-y-4 lg:col-span-6">
				<PreTokens preTokens={preTokensDisplay}>
					{#each preTokensDisplay as pt (pt.id)}
						<div class="flex items-center gap-1 rounded-lg bg-slate-800/50 px-2 py-1">
							{#if pt.segments && pt.segments.length > 0}
								{#each pt.segments as seg, i (i)}
									<span class="rounded px-1.5 font-mono text-xs {getMorphColor(seg.type)}"
										>{seg.text}</span
									>
									{#if i < pt.segments.length - 1}<span class="text-xs text-slate-600">+</span>{/if}
								{/each}
							{:else}
								<span class="font-mono text-xs text-pink-300">{toDisplay(pt.text)}</span>
							{/if}
							<span class="ml-1 text-xs text-slate-500">×{pt.count}</span>
						</div>
					{/each}
				</PreTokens>

				<TokenDisplay
					tokens={tokensDisplay}
					currentStep={playback.currentStep}
					totalSteps={playback.totalSteps}
					{currentTokenCount}
					{compressionRate}
					accentColor="bg-teal-400"
					progressColor="bg-teal-500"
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
                {token.isNew
									? 'new bg-emerald-400 text-emerald-900 shadow-lg shadow-emerald-400/50'
									: ''}
                {!token.highlight &&
								!token.isNew &&
								token.isMorpheme &&
								token.morphemeType === 'prefix'
									? 'bg-rose-400 text-rose-900 shadow-lg shadow-rose-400/50'
									: ''}
                {!token.highlight &&
								!token.isNew &&
								token.isMorpheme &&
								token.morphemeType === 'root'
									? 'bg-amber-400 text-amber-900 shadow-lg shadow-amber-400/50'
									: ''}
                {!token.highlight &&
								!token.isNew &&
								token.isMorpheme &&
								token.morphemeType === 'suffix'
									? 'bg-teal-400 text-teal-900 shadow-lg shadow-teal-400/50'
									: ''}
                {!token.highlight &&
								!token.isNew &&
								!token.isMorpheme &&
								token.text === currentMerge?.newToken
									? 'bg-yellow-400 font-bold text-yellow-900 shadow-lg shadow-yellow-400/50'
									: ''}
                {!token.highlight &&
								!token.isNew &&
								!token.isMorpheme &&
								token.text !== currentMerge?.newToken
									? 'bg-slate-700 text-slate-200'
									: ''}"
								style="opacity: {token.opacity}; transform: scale({token.scale})"
								>{toDisplay(token.text)}</span
							>
						{/if}
					{/each}
				</TokenDisplay>
			</div>

			<!-- Right: Pair Frequencies + Vocabulary (always together) -->
			<div class="grid grid-cols-2 gap-4 lg:col-span-6">
				<AlgorithmSteps pairs={pairCounts} />

				<VocabularyPanel {vocabulary} currentToken={currentMerge?.newToken}>
					{#if vocabulary.length === 0}
						<p class="py-4 text-center text-sm text-slate-500">Vocabulary appears here...</p>
					{:else}
						{#each [...vocabulary].reverse() as item (item.token)}
							<div
								class="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm transition-all
                {item.token === currentMerge?.newToken
									? 'bg-yellow-400 font-bold text-yellow-900 shadow-lg'
									: item.isSeeded
										? 'bg-rose-500/20 ring-1 ring-rose-400/50'
										: item.isMorpheme
											? 'bg-teal-500/10 ring-1 ring-teal-400/50'
											: 'bg-slate-800/50'}"
							>
								<span
									class="font-mono {item.token === currentMerge?.newToken
										? ''
										: item.isSeeded
											? 'font-medium text-rose-300'
											: item.isMorpheme
												? 'text-teal-300'
												: item.isBase
													? 'text-slate-400'
													: 'text-purple-300'}">{toDisplay(item.token)}</span
								>
								{#if item.isSeeded}
									<span class="text-[10px] font-medium text-rose-400">seeded</span>
								{:else if item.isMorpheme}
									<span class="text-[10px] text-teal-400">morph</span>
								{:else if item.from}
									<span class="ml-2 truncate text-xs text-slate-500">{item.from}</span>
								{/if}
							</div>
						{/each}
					{/if}
				</VocabularyPanel>
			</div>
		</div>
	{/if}
</div>
