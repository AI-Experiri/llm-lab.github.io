<script>
	import { tick } from 'svelte';
	import {
		categories,
		datasets,
		getDatasetsByCategory,
		fetchRandomSample,
		getBenchmarkMeta
	} from '../data/datasets.js';

	// Format components - dedicated per-dataset components
	import DefaultJSONFormat from './formats/DefaultJSONFormat.svelte';
	import ToggleSwitch from './ToggleSwitch.svelte';

	// Knowledge
	import MMLUFormat from './formats/MMLUFormat.svelte';
	import MMLUProFormat from './formats/MMLUProFormat.svelte';
	import OpenBookQAFormat from './formats/OpenBookQAFormat.svelte';
	import TriviaQAFormat from './formats/TriviaQAFormat.svelte';
	import NaturalQuestionsFormat from './formats/NaturalQuestionsFormat.svelte';

	// Language & Reasoning
	import ARCFormat from './formats/ARCFormat.svelte';
	import HellaSwagFormat from './formats/HellaSwagFormat.svelte';
	import WinoGrandeFormat from './formats/WinoGrandeFormat.svelte';
	import PIQAFormat from './formats/PIQAFormat.svelte';
	import BoolQFormat from './formats/BoolQFormat.svelte';
	import CommonsenseQAFormat from './formats/CommonsenseQAFormat.svelte';
	import SocialIQAFormat from './formats/SocialIQAFormat.svelte';
	import BigBenchHardFormat from './formats/BigBenchHardFormat.svelte';
	import DROPFormat from './formats/DROPFormat.svelte';
	import ANLIFormat from './formats/ANLIFormat.svelte';
	import LAMBADAFormat from './formats/LAMBADAFormat.svelte';

	// Argumentation & Debate
	import DebateSumFormat from './formats/DebateSumFormat.svelte';
	import ArgumentQualityFormat from './formats/ArgumentQualityFormat.svelte';
	import ClaimStanceFormat from './formats/ClaimStanceFormat.svelte';
	import LogicalFallacyFormat from './formats/LogicalFallacyFormat.svelte';
	import OpenDebateEvidenceFormat from './formats/OpenDebateEvidenceFormat.svelte';
	import PersuasionFormat from './formats/PersuasionFormat.svelte';

	// Math
	import GSM8KFormat from './formats/GSM8KFormat.svelte';
	import HendrycksMathFormat from './formats/HendrycksMathFormat.svelte';
	import AIMEFormat from './formats/AIMEFormat.svelte';
	import TheoremQAFormat from './formats/TheoremQAFormat.svelte';
	import MGSMFormat from './formats/MGSMFormat.svelte';
	import SVAMPFormat from './formats/SVAMPFormat.svelte';

	// Coding
	import HumanEvalFormat from './formats/HumanEvalFormat.svelte';
	import MBPPFormat from './formats/MBPPFormat.svelte';
	import APPSFormat from './formats/APPSFormat.svelte';
	import DS1000Format from './formats/DS1000Format.svelte';
	import ClassEvalFormat from './formats/ClassEvalFormat.svelte';
	import BigCodeBenchFormat from './formats/BigCodeBenchFormat.svelte';

	// Safety
	import TruthfulQAFormat from './formats/TruthfulQAFormat.svelte';
	import ToxiGenFormat from './formats/ToxiGenFormat.svelte';
	import SimpleQAFormat from './formats/SimpleQAFormat.svelte';
	import HaluEvalFormat from './formats/HaluEvalFormat.svelte';
	import RealToxicityFormat from './formats/RealToxicityFormat.svelte';
	import DoNotAnswerFormat from './formats/DoNotAnswerFormat.svelte';

	// Agents & Tools
	import GAIAFormat from './formats/GAIAFormat.svelte';

	// RAG
	import FRAMESFormat from './formats/FRAMESFormat.svelte';
	import RAGTruthFormat from './formats/RAGTruthFormat.svelte';

	// Conversation
	import MTBenchFormat from './formats/MTBenchFormat.svelte';
	import WildChatFormat from './formats/WildChatFormat.svelte';
	import ArenaHardFormat from './formats/ArenaHardFormat.svelte';

	// Instruction Following
	import IFEvalFormat from './formats/IFEvalFormat.svelte';
	import InfoBenchFormat from './formats/InfoBenchFormat.svelte';

	// Multimodal
	import MMMUFormat from './formats/MMMUFormat.svelte';
	import ScienceQAFormat from './formats/ScienceQAFormat.svelte';
	import MMEFormat from './formats/MMEFormat.svelte';

	// Domain-specific
	import MedMCQAFormat from './formats/MedMCQAFormat.svelte';

	// Bias & Ethics
	import BBQFormat from './formats/BBQFormat.svelte';
	import StereoSetFormat from './formats/StereoSetFormat.svelte';
	import EthicsFormat from './formats/EthicsFormat.svelte';

	let selectedCategory = $state('knowledge');
	let selectedDataset = $state(null);
	let samples = $state([]);
	let loading = $state(false);
	let error = $state(null);
	let showRaw = $state(false);
	let showAnswer = $state(false);
	let showMath = $state(false);
	let showCode = $state(false);
	let sampleContainer = $state(null);
	let initialized = $state(false);

	let filteredDatasets = $derived(
		getDatasetsByCategory(selectedCategory).sort((a, b) => a.name.localeCompare(b.name))
	);

	// Set default dataset to MMLU-Pro and load sample on mount
	$effect(() => {
		if (!initialized && filteredDatasets.length > 0) {
			const mmlupro = filteredDatasets.find((d) => d.id === 'mmlu_pro');
			if (mmlupro) {
				selectedDataset = mmlupro;
				initialized = true;
				loadSamples();
			}
		}
	});

	// Typeset MathJax on the sample container
	async function typesetMath() {
		await tick();
		if (window.MathJax?.typesetPromise && sampleContainer) {
			await window.MathJax.typesetPromise([sampleContainer]);
		}
	}

	// Highlight code blocks
	async function highlightCode() {
		await tick();
		if (window.hljs && sampleContainer) {
			sampleContainer.querySelectorAll('pre code, pre').forEach((block) => {
				if (!block.classList.contains('hljs')) {
					window.hljs.highlightElement(block);
				}
			});
		}
	}

	// Apply MathJax only when showMath is enabled
	$effect(() => {
		if (samples.length > 0 && !showRaw && showMath) {
			typesetMath();
		}
	});

	$effect(() => {
		if (showAnswer && showMath) {
			typesetMath();
		}
	});

	// When showMath is toggled
	$effect(() => {
		if (showMath && samples.length > 0 && !showRaw) {
			typesetMath();
		}
	});

	// Apply code highlighting when showCode is enabled
	$effect(() => {
		if (samples.length > 0 && !showRaw && showCode) {
			highlightCode();
		}
	});

	$effect(() => {
		if (showAnswer && showCode) {
			highlightCode();
		}
	});

	const categoryColors = {
		knowledge: 'purple',
		'language & reasoning': 'blue',
		argumentation: 'amber',
		coding: 'green',
		math: 'yellow',
		safety: 'red',
		'agents & tools use': 'cyan',
		'information retrieval & RAG': 'orange',
		'conversation & chatbots': 'pink',
		'instruction-following': 'indigo',
		multimodal: 'fuchsia',
		'domain-specific': 'teal',
		'bias & ethics': 'rose',
		inaccessible: 'red'
	};

	// Map dataset formats to dedicated components (each dataset has its own component)
	const formatComponents = {
		// Knowledge
		mmlu: MMLUFormat,
		mmlu_pro: MMLUProFormat,
		openbookqa: OpenBookQAFormat,
		triviaqa: TriviaQAFormat,
		natural_questions: NaturalQuestionsFormat,

		// Language & Reasoning
		arc: ARCFormat,
		hellaswag: HellaSwagFormat,
		winogrande: WinoGrandeFormat,
		piqa: PIQAFormat,
		boolq: BoolQFormat,
		commonsense_qa: CommonsenseQAFormat,
		social_iqa: SocialIQAFormat,
		bigbench_hard: BigBenchHardFormat,
		drop: DROPFormat,
		anli: ANLIFormat,
		lambada: LAMBADAFormat,

		// Argumentation & Debate
		debatesum: DebateSumFormat,
		argument_quality: ArgumentQualityFormat,
		claim_stance: ClaimStanceFormat,
		logical_fallacy: LogicalFallacyFormat,
		open_debate_evidence: OpenDebateEvidenceFormat,
		persuasion: PersuasionFormat,

		// Math
		gsm8k: GSM8KFormat,
		hendrycks_math: HendrycksMathFormat,
		aime: AIMEFormat,
		theoremqa: TheoremQAFormat,
		mgsm: MGSMFormat,
		svamp: SVAMPFormat,

		// Coding
		humaneval: HumanEvalFormat,
		mbpp: MBPPFormat,
		apps: APPSFormat,
		ds1000: DS1000Format,
		classeval: ClassEvalFormat,
		bigcodebench: BigCodeBenchFormat,

		// Safety
		truthfulqa: TruthfulQAFormat,
		toxigen: ToxiGenFormat,
		simpleqa: SimpleQAFormat,
		halueval: HaluEvalFormat,
		realtoxicity: RealToxicityFormat,
		donotanswer: DoNotAnswerFormat,

		// Agents & Tools (inaccessible but keep mappings)
		gaia: GAIAFormat,
		toolqa: GAIAFormat,
		t_eval: GAIAFormat,

		// RAG
		frames: FRAMESFormat,
		ragtruth: RAGTruthFormat,

		// Conversation
		mt_bench: MTBenchFormat,
		wildchat: WildChatFormat,
		arena_hard: ArenaHardFormat,

		// Instruction Following
		ifeval: IFEvalFormat,
		infobench: InfoBenchFormat,

		// Multimodal
		mmmu: MMMUFormat,
		scienceqa: ScienceQAFormat,
		mme: MMEFormat,

		// Domain-specific
		medmcqa: MedMCQAFormat,

		// Bias & Ethics
		bbq: BBQFormat,
		stereoset: StereoSetFormat,
		ethics: EthicsFormat
	};

	function getFormatComponent(format) {
		return formatComponents[format] || DefaultJSONFormat;
	}

	function getCategoryColor(cat) {
		return categoryColors[cat] || 'gray';
	}

	function handleCategoryChange(e) {
		selectedCategory = e.target.value;
		selectedDataset = null;
		samples = [];
		error = null;
	}

	async function handleDatasetChange(e) {
		const id = e.target.value;
		selectedDataset = filteredDatasets.find((d) => d.id === id) || null;
		samples = [];
		error = null;

		// Auto-load sample when dataset is selected (skip inaccessible)
		if (selectedDataset && !selectedDataset.inaccessible) {
			await loadSamples();
		}
	}

	async function loadSamples() {
		if (!selectedDataset) return;

		// Clear previous data immediately to free memory
		samples = [];
		loading = true;
		error = null;

		// Allow UI to update before fetching
		await new Promise((r) => setTimeout(r, 0));

		try {
			const result = await fetchRandomSample(selectedDataset, 1);
			samples = result;
			// Typeset MathJax after content renders (only if enabled)
			if (showMath) await typesetMath();
		} catch (e) {
			error = e.message || 'Failed to fetch samples';
			samples = [];
		} finally {
			loading = false;
		}
	}
</script>

<div class="space-y-4">
	<!-- Dataset Selector -->
	<section
		class="rounded-lg border border-[#0f3460] bg-gradient-to-br from-[#16213e] to-[#1a1a2e] p-4"
	>
		<div class="flex flex-col gap-3 sm:flex-row">
			<!-- Category Filter -->
			<div class="flex-1">
				<label
					for="category-select"
					class="mb-1 block text-[var(--color-muted)] text-[var(--text-tiny)]"
				>
					Category
				</label>
				<select
					id="category-select"
					value={selectedCategory}
					onchange={handleCategoryChange}
					class="w-full cursor-pointer rounded-lg border border-[var(--color-secondary)] bg-[var(--color-bg)] px-3 py-2 text-[var(--color-text)] text-[var(--text-small)] transition-colors focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none"
				>
					{#each categories as cat (cat.id)}
						{@const count =
							cat.id === 'all' ? datasets.length : getDatasetsByCategory(cat.id).length}
						<option value={cat.id}>{cat.label} ({count})</option>
					{/each}
				</select>
			</div>

			<!-- Dataset Selector -->
			<div class="flex-1">
				<label
					for="dataset-select"
					class="mb-1 block text-[var(--color-muted)] text-[var(--text-tiny)]"
				>
					Dataset ({filteredDatasets.length})
				</label>
				<select
					id="dataset-select"
					value={selectedDataset?.id || ''}
					onchange={handleDatasetChange}
					class="w-full cursor-pointer rounded-lg border border-[var(--color-secondary)] bg-[var(--color-bg)] px-3 py-2 text-[var(--color-text)] text-[var(--text-small)] transition-colors focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none"
				>
					<option value="">-- Select --</option>
					{#each filteredDatasets as dataset (dataset.id)}
						<option
							value={dataset.id}
							style={dataset.inaccessible ? 'color: #f87171; background-color: #450a0a;' : ''}
						>
							{dataset.name}{dataset.inaccessible
								? ` (${dataset.originalCategory || 'No API'})`
								: ''}
						</option>
					{/each}
				</select>
			</div>
		</div>
	</section>

	<!-- Selected Dataset Info -->
	{#if selectedDataset}
		{@const color = getCategoryColor(selectedDataset.category)}
		{@const meta = getBenchmarkMeta(selectedDataset.name)}
		{@const paperField = meta?.['Benchmark paper'] || ''}
		{@const paperUrl = paperField.includes('http')
			? paperField.split('\n').find((s) => s.startsWith('http'))
			: null}
		{@const paperTitle = paperField.split('\n')[0] || 'Paper'}
		<section class="rounded-lg border-l-4 bg-[var(--color-surface)] p-4 border-{color}-500">
			<div class="flex flex-col gap-3 sm:flex-row sm:items-center">
				<div class="min-w-0 flex-1">
					<div class="flex flex-wrap items-center gap-2">
						<h3 class="font-semibold text-[var(--color-text)] text-[var(--text-body)]">
							{selectedDataset.name}
						</h3>
						<span
							class="bg-{color}-900/40 text-{color}-300 rounded-full border px-2 py-0.5 text-[var(--text-tiny)] border-{color}-700/50"
						>
							{selectedDataset.category}
						</span>
						{#if meta?.['Initial publication year']}
							<span
								class="rounded-full border border-gray-700 bg-gray-800 px-2 py-0.5 text-[var(--text-tiny)] text-gray-300"
							>
								{meta['Initial publication year']}
							</span>
						{/if}
					</div>
					<div class="mt-1.5 flex flex-wrap items-center gap-2">
						{#if paperUrl}
							<a
								href={paperUrl}
								target="_blank"
								rel="noopener noreferrer external"
								class="rounded-full border border-red-700/50 bg-red-900/30 px-2 py-0.5 text-[var(--text-tiny)] text-red-300 transition-colors hover:bg-red-900/50"
								title={paperTitle}
							>
								Paper
							</a>
						{/if}
						{#if meta?.['Code repository']?.startsWith('http')}
							<a
								href={meta['Code repository']}
								target="_blank"
								rel="noopener noreferrer external"
								class="rounded-full border border-green-700/50 bg-green-900/30 px-2 py-0.5 text-[var(--text-tiny)] text-green-300 transition-colors hover:bg-green-900/50"
							>
								Code
							</a>
						{/if}
						<a
							href="https://huggingface.co/datasets/{selectedDataset.hf_id}"
							target="_blank"
							rel="noopener noreferrer"
							class="rounded-full border border-yellow-700/50 bg-yellow-900/30 px-2 py-0.5 text-[var(--text-tiny)] text-yellow-300 transition-colors hover:bg-yellow-900/50"
						>
							HF
						</a>
						{#if meta?.License}
							<span class="text-[var(--color-muted)] text-[var(--text-tiny)]">{meta.License}</span>
						{/if}
					</div>
					<p class="mt-1 truncate text-[var(--color-muted)] text-[var(--text-tiny)]">
						{meta?.Description || selectedDataset.description}
					</p>
				</div>
				{#if !selectedDataset.inaccessible}
					<button
						onclick={loadSamples}
						disabled={loading}
						class="flex cursor-pointer items-center gap-2 rounded-lg bg-gradient-to-r from-[var(--color-primary)] to-pink-600 px-4 py-2 font-medium whitespace-nowrap text-[var(--text-small)] text-white shadow-[var(--color-primary)]/20 shadow-lg transition-all hover:from-pink-600 hover:to-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50"
					>
						{#if loading}
							<svg
								class="h-4 w-4 animate-spin"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="4"
								></circle>
								<path
									class="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
							Loading...
						{:else}
							Resample
						{/if}
					</button>
				{/if}
			</div>
		</section>

		<!-- Inaccessible Dataset Notice -->
		{#if selectedDataset.inaccessible}
			<section
				class="rounded-lg border border-red-500/50 bg-gradient-to-r from-red-900/30 to-red-950/20 p-4"
			>
				<div class="flex items-start gap-3">
					<div class="text-xl text-red-500">&#9888;</div>
					<div class="flex-1">
						<h4 class="font-medium text-[var(--text-small)] text-red-300">No Public API Access</h4>
						<p class="mt-1 text-[var(--text-tiny)] text-red-200/80">
							{selectedDataset.reason ||
								'This dataset is gated or requires authentication. Sample data cannot be fetched via the public HuggingFace API.'}
						</p>
						<a
							href="https://huggingface.co/datasets/{selectedDataset.hf_id}"
							target="_blank"
							rel="noopener noreferrer"
							class="mt-2 inline-block text-[var(--text-tiny)] text-red-300 underline hover:text-red-200"
						>
							Request access on HuggingFace
						</a>
					</div>
				</div>
			</section>
		{/if}
	{/if}

	<!-- Error Display -->
	{#if error}
		<section
			class="rounded-lg border border-red-500/50 bg-gradient-to-r from-red-900/30 to-red-950/20 p-3"
		>
			<div class="flex items-center gap-2 text-[var(--text-small)]">
				<span class="text-red-500">Error:</span>
				<span class="text-red-300">{error}</span>
			</div>
		</section>
	{/if}

	<!-- Loading State -->
	{#if loading && samples.length === 0}
		<section
			class="rounded-lg border border-[var(--color-secondary)] bg-[var(--color-surface)] p-4 text-center"
		>
			<p class="text-[var(--color-muted)] text-[var(--text-small)]">Loading sample...</p>
		</section>
	{/if}

	<!-- Sample Display -->
	{#if samples.length > 0}
		<section class="rounded-lg bg-[var(--color-surface)] p-4" bind:this={sampleContainer}>
			<div class="mb-3 flex flex-wrap items-center justify-between gap-2">
				<h3 class="font-semibold text-[var(--color-primary)] text-[var(--text-small)]">Sample</h3>

				<div class="flex items-center gap-3">
					<ToggleSwitch
						label="Answer"
						checked={showAnswer}
						color="green"
						onchange={(v) => (showAnswer = v)}
					/>
					<ToggleSwitch
						label="MathJax"
						checked={showMath}
						color="purple"
						onchange={(v) => (showMath = v)}
					/>
					<ToggleSwitch
						label="Code"
						checked={showCode}
						color="blue"
						onchange={(v) => (showCode = v)}
					/>
					<ToggleSwitch
						label="Raw"
						checked={showRaw}
						color="yellow"
						onchange={(v) => (showRaw = v)}
					/>
				</div>
			</div>

			<div class="space-y-3">
				{#each samples as sample (sample)}
					<div
						class="rounded-lg border border-[var(--color-secondary)] bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-bg)] p-3"
					>
						{#if showRaw}
							<!-- Raw JSON View -->
							<div class="space-y-2">
								<div class="flex items-center gap-2">
									<span
										class="rounded bg-yellow-600 px-2 py-0.5 font-mono font-bold text-[var(--text-tiny)] text-yellow-100"
										>JSON</span
									>
								</div>
								<pre
									class="max-h-[32rem] overflow-auto rounded-lg border border-[var(--color-secondary)] bg-[var(--color-bg)] p-4 font-mono break-words whitespace-pre-wrap text-[var(--color-text)] text-[var(--text-small)]">{JSON.stringify(
										sample,
										null,
										2
									)}</pre>
							</div>
						{:else}
							<!-- Formatted View using components -->
							{#key `${showMath}-${showCode}`}
								{@const FormatComponent = getFormatComponent(selectedDataset.format)}
								<FormatComponent {sample} dataset={selectedDataset} {showAnswer} />
							{/key}
						{/if}
					</div>
				{/each}
			</div>
		</section>
	{/if}
</div>
