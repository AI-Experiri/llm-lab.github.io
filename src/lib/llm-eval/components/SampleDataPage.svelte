<script>
	import { tick } from 'svelte';
	import {
		HeroSection,
		DatasetSelector,
		DatasetInfoCard,
		ErrorNotice,
		LoadingSpinner,
		GradientButton
	} from '$lib/shared';
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

	function handleCategoryChange(value) {
		selectedCategory = value;
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
	<HeroSection title="Sample Data">
		<p class="mt-2 leading-relaxed text-[var(--color-text)] text-[var(--text-small)]">
			Explore actual evaluation datasets from HuggingFace. See what benchmark questions look like
			and understand the data format for each evaluation type.
		</p>
	</HeroSection>

	<!-- Dataset Selector -->
	<DatasetSelector
		{categories}
		datasets={filteredDatasets}
		{selectedCategory}
		selectedDataset={selectedDataset?.id || ''}
		onCategoryChange={handleCategoryChange}
		onDatasetChange={handleDatasetChange}
		getCategoryCount={(catId) =>
			catId === 'all' ? datasets.length : getDatasetsByCategory(catId).length}
		getDatasetLabel={(d) => d.name + (d.inaccessible ? ` (${d.originalCategory || 'No API'})` : '')}
		isDatasetInaccessible={(d) => d.inaccessible}
	/>

	<!-- Selected Dataset Info -->
	{#if selectedDataset}
		{@const color = getCategoryColor(selectedDataset.category)}
		{@const meta = getBenchmarkMeta(selectedDataset.name)}
		{@const paperField = meta?.['Benchmark paper'] || ''}
		{@const paperUrl = paperField.includes('http')
			? paperField.split('\n').find((s) => s.startsWith('http'))
			: null}
		{@const codeUrl = meta?.['Code repository']?.startsWith('http')
			? meta['Code repository']
			: null}
		<DatasetInfoCard
			name={selectedDataset.name}
			category={selectedDataset.category}
			categoryColor={color}
			description={meta?.Description || selectedDataset.description}
			year={meta?.['Initial publication year'] || ''}
			hfUrl="https://huggingface.co/datasets/{selectedDataset.hf_id}"
			{paperUrl}
			{codeUrl}
			license={meta?.License || ''}
		>
			{#if !selectedDataset.inaccessible}
				<GradientButton onclick={loadSamples} disabled={loading} {loading}>
					{#if loading}Loading...{:else}Resample{/if}
				</GradientButton>
			{/if}
		</DatasetInfoCard>

		<!-- Inaccessible Dataset Notice -->
		{#if selectedDataset.inaccessible}
			<ErrorNotice
				title="No Public API Access"
				message={selectedDataset.reason ||
					'This dataset is gated or requires authentication. Sample data cannot be fetched via the public HuggingFace API.'}
			>
				<a
					href="https://huggingface.co/datasets/{selectedDataset.hf_id}"
					target="_blank"
					rel="noopener noreferrer"
					class="text-[var(--text-tiny)] text-red-300 underline hover:text-red-200"
				>
					Request access on HuggingFace
				</a>
			</ErrorNotice>
		{/if}
	{/if}

	<!-- Error Display -->
	{#if error}
		<ErrorNotice title="Error" message={error} />
	{/if}

	<!-- Loading State -->
	{#if loading && samples.length === 0}
		<LoadingSpinner message="Loading sample..." />
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
