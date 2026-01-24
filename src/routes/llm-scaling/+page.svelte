<!-- ABOUTME: LLM Scaling Lab page using shared layout components -->
<!-- ABOUTME: Overview + Timeline + topic tabs structure -->

<script>
	import { PageLayout, PageHeader, TabBar, Footer } from '$lib/layout';
	import HomePage from '$lib/llm-scaling/components/HomePage.svelte';
	import TimelinePage from '$lib/llm-scaling/components/TimelinePage.svelte';
	import FoundationsPage from '$lib/llm-scaling/components/FoundationsPage.svelte';
	import HestnessPage from '$lib/llm-scaling/components/HestnessPage.svelte';
	import KaplanPage from '$lib/llm-scaling/components/KaplanPage.svelte';
	import ChinchillaPage from '$lib/llm-scaling/components/ChinchillaPage.svelte';
	import MuPPage from '$lib/llm-scaling/components/MuPPage.svelte';
	import CaseStudiesPage from '$lib/llm-scaling/components/CaseStudiesPage.svelte';

	const tabs = [
		{ id: 'overview', label: 'Overview' },
		{ id: 'timeline', label: 'Timeline' },
		{ id: 'foundations', label: 'Foundations' },
		{ id: 'hestness', label: 'Hestness 2017' },
		{ id: 'kaplan', label: 'Kaplan 2020' },
		{ id: 'chinchilla', label: 'Chinchilla' },
		{ id: 'mup', label: 'muP' },
		{ id: 'casestudies', label: 'Case Studies' }
	];

	let activeTab = $state('overview');

	function handleTabChange(tabId) {
		activeTab = tabId;
	}
</script>

<PageLayout>
	<PageHeader title="Scaling Lab">
		<TabBar {tabs} {activeTab} onchange={handleTabChange} />
	</PageHeader>

	<div class="flex-1">
		{#if activeTab === 'overview'}
			<HomePage />
		{:else if activeTab === 'timeline'}
			<TimelinePage />
		{:else if activeTab === 'foundations'}
			<FoundationsPage />
		{:else if activeTab === 'hestness'}
			<HestnessPage />
		{:else if activeTab === 'kaplan'}
			<KaplanPage />
		{:else if activeTab === 'chinchilla'}
			<ChinchillaPage />
		{:else if activeTab === 'mup'}
			<MuPPage />
		{:else if activeTab === 'casestudies'}
			<CaseStudiesPage />
		{/if}
	</div>

	<Footer />
</PageLayout>
