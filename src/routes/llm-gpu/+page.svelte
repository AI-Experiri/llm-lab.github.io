<!-- ABOUTME: LLM GPU Lab page using shared layout components -->
<!-- ABOUTME: Overview + Timeline + topic tabs structure for GPU computing -->

<script>
	import { PageLayout, PageHeader, TabBar, Footer } from '$lib/layout';
	import HomePage from '$lib/llm-gpu/components/HomePage.svelte';
	import AccountingPage from '$lib/llm-gpu/components/AccountingPage.svelte';
	import TimelinePage from '$lib/llm-gpu/components/TimelinePage.svelte';
	import ArchitecturePage from '$lib/llm-gpu/components/ArchitecturePage.svelte';
	import MemoryPage from '$lib/llm-gpu/components/MemoryPage.svelte';
	import IntensityPage from '$lib/llm-gpu/components/IntensityPage.svelte';
	import OptimizationPage from '$lib/llm-gpu/components/OptimizationPage.svelte';
	import FlashAttentionPage from '$lib/llm-gpu/components/FlashAttentionPage.svelte';

	const tabs = [
		{ id: 'overview', label: 'Overview' },
		{ id: 'timeline', label: 'Timeline' },
		{ id: 'accounting', label: 'Accounting' },
		{ id: 'architecture', label: 'Architecture' },
		{ id: 'intensity', label: 'Intensity' },
		{ id: 'memory', label: 'Memory' },
		{ id: 'optimization', label: 'Optimization' },
		{ id: 'flashattention', label: 'FlashAttention' }
	];

	let activeTab = $state('overview');

	function handleTabChange(tabId) {
		activeTab = tabId;
	}
</script>

<PageLayout>
	<PageHeader title="GPU Lab">
		<TabBar {tabs} {activeTab} onchange={handleTabChange} />
	</PageHeader>

	<div class="flex-1">
		{#if activeTab === 'overview'}
			<HomePage />
		{:else if activeTab === 'accounting'}
			<AccountingPage />
		{:else if activeTab === 'timeline'}
			<TimelinePage />
		{:else if activeTab === 'architecture'}
			<ArchitecturePage />
		{:else if activeTab === 'memory'}
			<MemoryPage />
		{:else if activeTab === 'intensity'}
			<IntensityPage />
		{:else if activeTab === 'optimization'}
			<OptimizationPage />
		{:else if activeTab === 'flashattention'}
			<FlashAttentionPage />
		{/if}
	</div>

	<Footer />
</PageLayout>
