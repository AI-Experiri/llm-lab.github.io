<!-- ABOUTME: LLM Data Lab page using shared layout components -->
<!-- ABOUTME: Overview + topic tabs structure matching llm-eval -->

<script>
	import { PageLayout, PageHeader, TabBar, Footer } from '$lib/layout';
	import HomePage from '$lib/llm-data/components/HomePage.svelte';
	import TimelinePage from '$lib/llm-data/components/TimelinePage.svelte';
	import ProcessingPage from '$lib/llm-data/components/ProcessingPage.svelte';
	import DatasetsPage from '$lib/llm-data/components/DatasetsPage.svelte';
	import SampleDataPage from '$lib/llm-data/components/SampleDataPage.svelte';

	const tabs = [
		{ id: 'overview', label: 'Overview' },
		{ id: 'timeline', label: 'Timeline' },
		{ id: 'processing', label: 'Processing' },
		{ id: 'datasets', label: 'Datasets' },
		{ id: 'samples', label: 'Samples' }
	];

	let activeTab = $state('overview');

	function handleTabChange(tabId) {
		activeTab = tabId;
	}
</script>

<PageLayout>
	<PageHeader title="LLM Data Lab">
		<TabBar {tabs} {activeTab} onchange={handleTabChange} />
	</PageHeader>

	<div class="flex-1">
		{#if activeTab === 'overview'}
			<HomePage />
		{:else if activeTab === 'timeline'}
			<TimelinePage />
		{:else if activeTab === 'processing'}
			<ProcessingPage />
		{:else if activeTab === 'datasets'}
			<DatasetsPage />
		{:else if activeTab === 'samples'}
			<SampleDataPage />
		{/if}
	</div>

	<Footer />
</PageLayout>
