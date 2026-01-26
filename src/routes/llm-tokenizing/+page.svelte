<!-- ABOUTME: LLM Tokenizing Lab page using shared layout components -->
<!-- ABOUTME: Visualizers for BPE, WordPiece, and advanced tokenization algorithms -->

<script>
	import { PageLayout, PageHeader, TabBar, Footer } from '$lib/layout';
	import HomePage from '$lib/llm-tokenizing/components/HomePage.svelte';
	import BPEVisualizer from '$lib/llm-tokenizing/components/BPEVisualizer.svelte';
	import ScaffoldBPEVisualizer from '$lib/llm-tokenizing/components/ScaffoldBPEVisualizer.svelte';
	import WordPieceVisualizer from '$lib/llm-tokenizing/components/WordPieceVisualizer.svelte';
	import AdaptiveBPEVisualizer from '$lib/llm-tokenizing/components/AdaptiveBPEVisualizer.svelte';
	import BoundlessBPEVisualizer from '$lib/llm-tokenizing/components/BoundlessBPEVisualizer.svelte';
	import MorphBPEVisualizer from '$lib/llm-tokenizing/components/MorphBPEVisualizer.svelte';
	import AGBPEVisualizer from '$lib/llm-tokenizing/components/AGBPEVisualizer.svelte';

	const tabs = [
		{ id: 'overview', label: 'Overview' },
		{ id: 'bpe', label: 'Standard BPE' },
		{ id: 'wordpiece', label: 'WordPiece' },
		{ id: 'scaffold', label: 'Scaffold-BPE' },
		{ id: 'adaptive', label: 'AdaptBPE' },
		{ id: 'boundless', label: 'BoundlessBPE' },
		{ id: 'morph', label: 'MorphBPE' },
		{ id: 'agbpe', label: 'AG-BPE' }
	];

	let activeTab = $state('overview');

	function handleTabChange(tabId) {
		activeTab = tabId;
	}
</script>

<PageLayout>
	<PageHeader title="Tokenizing Lab">
		<TabBar {tabs} {activeTab} onchange={handleTabChange} />
	</PageHeader>

	<div class="flex-1">
		{#if activeTab === 'overview'}
			<HomePage />
		{/if}
		<div class:hidden={activeTab !== 'bpe'}>
			<BPEVisualizer />
		</div>
		<div class:hidden={activeTab !== 'wordpiece'}>
			<WordPieceVisualizer />
		</div>
		<div class:hidden={activeTab !== 'scaffold'}>
			<ScaffoldBPEVisualizer />
		</div>
		<div class:hidden={activeTab !== 'adaptive'}>
			<AdaptiveBPEVisualizer />
		</div>
		<div class:hidden={activeTab !== 'boundless'}>
			<BoundlessBPEVisualizer />
		</div>
		<div class:hidden={activeTab !== 'morph'}>
			<MorphBPEVisualizer />
		</div>
		<div class:hidden={activeTab !== 'agbpe'}>
			<AGBPEVisualizer />
		</div>
	</div>

	<Footer />
</PageLayout>
