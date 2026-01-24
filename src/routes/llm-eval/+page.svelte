<!-- ABOUTME: LLM Evaluation Lab page using shared layout components -->
<!-- ABOUTME: Foundations + topic tabs structure -->

<script>
	import { PageLayout, PageHeader, TabBar, Footer } from '$lib/layout';
	import FoundationsPage from '$lib/llm-eval/components/FoundationsPage.svelte';
	import HomePage from '$lib/llm-eval/components/HomePage.svelte';
	import SampleDataPage from '$lib/llm-eval/components/SampleDataPage.svelte';

	const tabs = [
		{ id: 'overview', label: 'Overview' },
		{ id: 'timeline', label: 'Timeline' },
		{ id: 'sample', label: 'Sample Data' }
	];

	let activeTab = $state('overview');

	function handleTabChange(tabId) {
		activeTab = tabId;
	}
</script>

<PageLayout>
	<PageHeader title="LLM Evaluation Lab">
		<TabBar {tabs} {activeTab} onchange={handleTabChange} />
	</PageHeader>

	<div class="flex-1">
		{#if activeTab === 'overview'}
			<HomePage />
		{:else if activeTab === 'timeline'}
			<FoundationsPage />
		{:else if activeTab === 'sample'}
			<SampleDataPage />
		{/if}
	</div>

	<Footer />
</PageLayout>
