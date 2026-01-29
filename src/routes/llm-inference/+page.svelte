<!-- ABOUTME: LLM Inference Lab page using shared layout components -->
<!-- ABOUTME: Overview + topic tabs structure for inference optimization -->

<script>
	import { PageLayout, PageHeader, TabBar, Footer } from '$lib/layout';
	import HomePage from '$lib/llm-inference/components/HomePage.svelte';
	import MathPage from '$lib/llm-inference/components/MathPage.svelte';
	import TimelinePage from '$lib/llm-inference/components/TimelinePage.svelte';
	import ChallengesPage from '$lib/llm-inference/components/ChallengesPage.svelte';
	import ArchitecturePage from '$lib/llm-inference/components/ArchitecturePage.svelte';
	import OptimizationPage from '$lib/llm-inference/components/OptimizationPage.svelte';
	import SystemsPage from '$lib/llm-inference/components/SystemsPage.svelte';

	const tabs = [
		{ id: 'overview', label: 'Overview' },
		{ id: 'math', label: 'Math' },
		{ id: 'timeline', label: 'Timeline' },
		{ id: 'challenges', label: 'Challenges' },
		{ id: 'architecture', label: 'Architecture' },
		{ id: 'optimization', label: 'Optimization' },
		{ id: 'systems', label: 'Systems' }
	];

	let activeTab = $state('overview');

	function handleTabChange(tabId) {
		activeTab = tabId;
	}
</script>

<PageLayout>
	<PageHeader title="LLM Inference Lab">
		<TabBar {tabs} {activeTab} onchange={handleTabChange} />
	</PageHeader>

	<div class="flex-1">
		{#if activeTab === 'overview'}
			<HomePage />
		{:else if activeTab === 'math'}
			<MathPage />
		{:else if activeTab === 'timeline'}
			<TimelinePage />
		{:else if activeTab === 'challenges'}
			<ChallengesPage />
		{:else if activeTab === 'architecture'}
			<ArchitecturePage />
		{:else if activeTab === 'optimization'}
			<OptimizationPage />
		{:else if activeTab === 'systems'}
			<SystemsPage />
		{/if}
	</div>

	<Footer />
</PageLayout>
