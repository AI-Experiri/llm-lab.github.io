<script>
	import {
		categories,
		hfConfig,
		fetchRandomSample,
		getDatasetsByCategory,
		getDatasetMeta
	} from '$lib/llm-data/data/datasets.js';
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
	<!-- Dataset Selector Section -->
	<section
		class="rounded-lg border border-[#0f3460] bg-gradient-to-br from-[#16213e] to-[#1a1a2e] p-4"
	>
		<div class="flex flex-col gap-4">
			<!-- Category and Dataset Dropdowns -->
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<!-- Category Dropdown -->
				<div>
					<label
						for="category-select"
						class="mb-1 block text-[var(--color-muted)] text-[var(--text-tiny)]"
					>
						Category
					</label>
					<select
						id="category-select"
						value={selectedCategory}
						onchange={(e) => handleCategoryChange(e.target.value)}
						class="w-full cursor-pointer rounded-lg border border-[var(--color-secondary)] bg-[var(--color-bg)] px-3 py-2.5 text-[var(--color-text)] text-[var(--text-small)] transition-colors focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none"
					>
						{#each categories as cat (cat.id)}
							{@const count = getDatasetsByCategory(cat.id).length}
							<option value={cat.id}>
								{cat.name} ({count})
							</option>
						{/each}
					</select>
				</div>

				<!-- Dataset Dropdown -->
				<div>
					<label
						for="dataset-select"
						class="mb-1 block text-[var(--color-muted)] text-[var(--text-tiny)]"
					>
						Dataset ({filteredDatasets.length})
					</label>
					<select
						id="dataset-select"
						value={selectedDataset}
						onchange={handleDatasetChange}
						class="w-full cursor-pointer rounded-lg border border-[var(--color-secondary)] bg-[var(--color-bg)] px-3 py-2.5 text-[var(--color-text)] text-[var(--text-small)] transition-colors focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none"
					>
						{#each filteredDatasets as datasetKey (datasetKey)}
							{@const info = getDatasetInfo(datasetKey)}
							<option
								value={datasetKey}
								style={info.inaccessible ? 'color: #f87171; background-color: #450a0a;' : ''}
							>
								{info.name}{info.inaccessible ? ' (Gated)' : ''}
							</option>
						{/each}
					</select>
				</div>
			</div>

			<!-- Fetch Sample Button -->
			<div class="flex justify-end">
				<button
					type="button"
					onclick={handleFetchSample}
					disabled={loading || !selectedDataset || hfConfig[selectedDataset]?.inaccessible}
					class="flex cursor-pointer items-center gap-2 rounded-lg bg-gradient-to-r from-[var(--color-primary)] to-pink-600 px-4 py-2 font-medium whitespace-nowrap text-[var(--text-small)] text-white shadow-[var(--color-primary)]/20 shadow-lg transition-all hover:from-pink-600 hover:to-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50"
				>
					{#if loading}
						<!-- Loading Spinner -->
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
			</div>
		</div>
	</section>

	<!-- Selected Dataset Info -->
	{#if selectedDataset}
		{@const info = getDatasetInfo(selectedDataset)}
		{@const color = getCategoryColor(info.category)}
		<section
			class="rounded-lg border-l-4 bg-[var(--color-surface)] p-4 border-{color}-500 bg-[var(--color-secondary)]"
		>
			<div class="flex flex-col gap-3 sm:flex-row sm:items-center">
				<div class="min-w-0 flex-1">
					<div class="flex flex-wrap items-center gap-2">
						<h3 class="font-semibold text-[var(--color-text)] text-[var(--text-body)]">
							{info.name}
						</h3>
						<span
							class="bg-{color}-900/40 text-{color}-300 rounded-full border px-2 py-0.5 text-[var(--text-tiny)] border-{color}-700/50"
						>
							{info.category}
						</span>
					</div>
					<div class="mt-1.5 flex flex-wrap items-center gap-2">
						{#if info.size}
							<span
								class="rounded-full border border-cyan-700/50 bg-cyan-900/30 px-2 py-0.5 text-[var(--text-tiny)] text-cyan-300"
							>
								{info.size}
							</span>
						{/if}
						{#if info.lastUpdated}
							<span
								class="rounded-full border border-emerald-700/50 bg-emerald-900/30 px-2 py-0.5 text-[var(--text-tiny)] text-emerald-300"
							>
								Updated {info.lastUpdated}
							</span>
						{/if}
						{#if info.hfId}
							<a
								href="https://huggingface.co/datasets/{info.hfId}"
								target="_blank"
								rel="noopener noreferrer"
								class="rounded-full border border-yellow-700/50 bg-yellow-900/30 px-2 py-0.5 text-[var(--text-tiny)] text-yellow-300 transition-colors hover:bg-yellow-900/50"
							>
								HuggingFace
							</a>
						{/if}
					</div>
				</div>
			</div>
		</section>

		<!-- Inaccessible Dataset Notice -->
		{#if info.inaccessible}
			<section
				class="rounded-lg border border-red-500/50 bg-gradient-to-r from-red-900/30 to-red-950/20 p-4"
			>
				<div class="flex items-start gap-3">
					<div class="text-xl text-red-500">&#9888;</div>
					<div class="flex-1">
						<h4 class="font-medium text-[var(--text-small)] text-red-300">No Public API Access</h4>
						<p class="mt-1 text-[var(--text-tiny)] text-red-200/80">
							{info.reason ||
								'This dataset is gated or requires authentication. Sample data cannot be fetched via the public HuggingFace API.'}
						</p>
						{#if info.hfId}
							<a
								href="https://huggingface.co/datasets/{info.hfId}"
								target="_blank"
								rel="noopener noreferrer"
								class="mt-2 inline-block text-[var(--text-tiny)] text-red-300 underline hover:text-red-200"
							>
								Request access on HuggingFace
							</a>
						{/if}
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
	{#if loading && !sample}
		<section
			class="rounded-lg border border-[var(--color-secondary)] bg-[var(--color-secondary)] p-8 text-center"
		>
			<div class="flex flex-col items-center gap-3">
				<svg
					class="h-8 w-8 animate-spin text-[var(--color-primary)]"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
				>
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
					></circle>
					<path
						class="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
					></path>
				</svg>
				<p class="text-[var(--color-muted)] text-[var(--text-small)]">Fetching sample data...</p>
			</div>
		</section>
	{/if}

	<!-- Sample Display -->
	{#if sample && !loading}
		{@const info = getDatasetInfo(selectedDataset)}
		{@const FormatComponent = getFormatComponent(selectedDataset)}
		<section class="rounded-lg bg-[var(--color-secondary)] p-4">
			<div class="mb-3 flex flex-wrap items-center justify-between gap-2">
				<h3 class="font-semibold text-[var(--color-primary)] text-[var(--text-small)]">
					Sample from {info.name}
				</h3>

				<div class="flex items-center gap-3">
					<ToggleSwitch label="Raw" checked={showRaw} onchange={(v) => (showRaw = v)} />
				</div>
			</div>

			<div
				class="rounded-lg border border-[var(--color-secondary)] bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-bg)] p-4"
			>
				<FormatComponent {sample} {showRaw} />
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
