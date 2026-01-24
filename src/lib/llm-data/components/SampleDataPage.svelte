<script>
	import {
		categories,
		hfConfig,
		fetchRandomSample,
		getDatasetsByCategory,
		getDatasetMeta
	} from '$lib/llm-data/data/datasets.js';
	import {
		DatasetSelector,
		DatasetInfoCard,
		ErrorNotice,
		LoadingSpinner,
		GradientButton
	} from '$lib/shared';
	import ToggleSwitch from './ToggleSwitch.svelte';

	// Format components
	import DefaultFormat from './formats/DefaultFormat.svelte';
	import FineWebFormat from './formats/FineWebFormat.svelte';
	import FineWebEduFormat from './formats/FineWebEduFormat.svelte';
	import PileFormat from './formats/PileFormat.svelte';
	import WikipediaFormat from './formats/WikipediaFormat.svelte';
	import C4Format from './formats/C4Format.svelte';
	import OpenWebTextFormat from './formats/OpenWebTextFormat.svelte';
	import CodeParrotFormat from './formats/CodeParrotFormat.svelte';
	import OASSTFormat from './formats/OASSTFormat.svelte';
	import AlpacaFormat from './formats/AlpacaFormat.svelte';
	import FLANFormat from './formats/FLANFormat.svelte';
	// Raw source formats
	import GutenbergFormat from './formats/GutenbergFormat.svelte';
	import ArxivFormat from './formats/ArxivFormat.svelte';
	import StackExchangeFormat from './formats/StackExchangeFormat.svelte';

	// Format component mapping
	const formatComponents = {
		fineweb: FineWebFormat,
		fineweb_edu: FineWebEduFormat,
		pile: PileFormat,
		wikipedia: WikipediaFormat,
		c4: C4Format,
		openwebtext: OpenWebTextFormat,
		codeparrot: CodeParrotFormat,
		oasst: OASSTFormat,
		alpaca: AlpacaFormat,
		flan: FLANFormat,
		// Raw sources
		gutenberg: GutenbergFormat,
		arxiv: ArxivFormat,
		stackexchange: StackExchangeFormat,
		default: DefaultFormat
	};

	// Get format component for a dataset
	function getFormatComponent(datasetKey) {
		const config = hfConfig[datasetKey];
		const format = config?.format || 'default';
		return formatComponents[format] || formatComponents.default;
	}

	let selectedCategory = $state('pre-training');
	let selectedDataset = $state('fineweb');
	let sample = $state(null);
	let loading = $state(false);
	let error = $state(null);
	let showRaw = $state(false);
	let initialized = $state(false);

	// Derived: filtered datasets based on category
	let filteredDatasets = $derived(getDatasetsByCategory(selectedCategory));

	// Category colors for styling
	const categoryColors = {
		'pre-training': 'purple',
		curated: 'blue',
		code: 'green',
		instruction: 'amber',
		inaccessible: 'red'
	};

	function getCategoryColor(categoryId) {
		return categoryColors[categoryId] || 'gray';
	}

	// Auto-load sample on mount
	$effect(() => {
		if (!initialized && filteredDatasets.length > 0) {
			initialized = true;
			handleFetchSample();
		}
	});

	function handleCategoryChange(categoryId) {
		selectedCategory = categoryId;
		// Select first available dataset in category
		const datasets = getDatasetsByCategory(categoryId);
		if (datasets.length > 0) {
			selectedDataset = datasets[0];
			sample = null;
			error = null;
			// Auto-fetch sample
			const config = hfConfig[selectedDataset];
			if (config && !config.inaccessible) {
				handleFetchSample();
			}
		} else {
			selectedDataset = null;
			sample = null;
		}
	}

	function handleDatasetChange(e) {
		selectedDataset = e.target.value;
		sample = null;
		error = null;

		// Auto-fetch if not inaccessible
		const config = hfConfig[selectedDataset];
		if (config && !config.inaccessible) {
			handleFetchSample();
		}
	}

	async function handleFetchSample() {
		if (!selectedDataset) return;

		const config = hfConfig[selectedDataset];
		if (config?.inaccessible) {
			error = config.reason || 'This dataset is not publicly accessible.';
			return;
		}

		loading = true;
		error = null;
		sample = null;

		try {
			const result = await fetchRandomSample(selectedDataset);
			if (result) {
				sample = result;
			} else {
				error = 'No data returned from API. The dataset may be unavailable.';
			}
		} catch (e) {
			error = e.message || 'Failed to fetch sample';
		} finally {
			loading = false;
		}
	}

	// Get display info for current dataset
	function getDatasetInfo(key) {
		const meta = getDatasetMeta(key);
		const config = hfConfig[key];
		return {
			name: meta?.name || key,
			category: meta?.category || 'unknown',
			size: meta?.size || '',
			lastUpdated: meta?.lastUpdated || '',
			hfId: config?.hf_id || '',
			inaccessible: config?.inaccessible || false,
			reason: config?.reason || ''
		};
	}
</script>

<div class="space-y-4">
	<!-- Dataset Selector -->
	<DatasetSelector
		{categories}
		datasets={filteredDatasets}
		{selectedCategory}
		{selectedDataset}
		onCategoryChange={handleCategoryChange}
		onDatasetChange={handleDatasetChange}
		getCategoryCount={(catId) => getDatasetsByCategory(catId).length}
		getDatasetLabel={(key) => {
			const info = getDatasetInfo(key);
			return info.name + (info.inaccessible ? ' (Gated)' : '');
		}}
		isDatasetInaccessible={(key) => getDatasetInfo(key).inaccessible}
	/>

	<!-- Selected Dataset Info -->
	{#if selectedDataset}
		{@const info = getDatasetInfo(selectedDataset)}
		{@const color = getCategoryColor(info.category)}
		<DatasetInfoCard
			name={info.name}
			category={info.category}
			categoryColor={color}
			size={info.size}
			hfUrl={info.hfId ? `https://huggingface.co/datasets/${info.hfId}` : ''}
		>
			{#if !info.inaccessible}
				<GradientButton onclick={handleFetchSample} disabled={loading} {loading}>
					{#if loading}Loading...{:else}Resample{/if}
				</GradientButton>
			{/if}
		</DatasetInfoCard>

		<!-- Inaccessible Dataset Notice -->
		{#if info.inaccessible}
			<ErrorNotice
				title="No Public API Access"
				message={info.reason ||
					'This dataset is gated or requires authentication. Sample data cannot be fetched via the public HuggingFace API.'}
			>
				{#if info.hfId}
					<a
						href="https://huggingface.co/datasets/{info.hfId}"
						target="_blank"
						rel="noopener noreferrer"
						class="text-[var(--text-tiny)] text-red-300 underline hover:text-red-200"
					>
						Request access on HuggingFace
					</a>
				{/if}
			</ErrorNotice>
		{/if}
	{/if}

	<!-- Error Display -->
	{#if error}
		<ErrorNotice title="Error" message={error} />
	{/if}

	<!-- Loading State -->
	{#if loading && !sample}
		<LoadingSpinner message="Fetching sample data..." />
	{/if}

	<!-- Sample Display -->
	{#if sample && !loading}
		{@const info = getDatasetInfo(selectedDataset)}
		{@const FormatComponent = getFormatComponent(selectedDataset)}
		<section class="rounded-lg bg-[var(--color-surface)] p-4">
			<div class="mb-3 flex flex-wrap items-center justify-between gap-2">
				<h3 class="font-semibold text-[var(--color-primary)] text-[var(--text-small)]">
					Sample from {info.name}
				</h3>

				<div class="flex items-center gap-3">
					<ToggleSwitch
						label="Raw"
						checked={showRaw}
						color="yellow"
						onchange={(v) => (showRaw = v)}
					/>
				</div>
			</div>

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
					<!-- Formatted View -->
					<FormatComponent {sample} />
				{/if}
			</div>
		</section>
	{/if}

	<!-- Empty State (no sample and not loading) -->
	{#if !sample && !loading && !error && selectedDataset && !hfConfig[selectedDataset]?.inaccessible}
		<section
			class="rounded-lg border border-[var(--color-secondary)] bg-[var(--color-secondary)] p-8 text-center"
		>
			<p class="text-[var(--color-muted)] text-[var(--text-body)]">
				Click "Fetch Sample" to load a random sample from the dataset.
			</p>
		</section>
	{/if}
</div>
