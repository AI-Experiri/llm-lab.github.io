<script>
	import { resolve } from '$app/paths';
	import Tabs from '$lib/llm-scaling/components/Tabs.svelte';
	import HomePage from '$lib/llm-scaling/components/HomePage.svelte';
	import FoundationsPage from '$lib/llm-scaling/components/FoundationsPage.svelte';
	import HestnessPage from '$lib/llm-scaling/components/HestnessPage.svelte';
	import KaplanPage from '$lib/llm-scaling/components/KaplanPage.svelte';
	import ChinchillaPage from '$lib/llm-scaling/components/ChinchillaPage.svelte';
	import MuPPage from '$lib/llm-scaling/components/MuPPage.svelte';
	import CaseStudiesPage from '$lib/llm-scaling/components/CaseStudiesPage.svelte';

	const tabs = [
		{ id: 'home', label: 'Home' },
		{ id: 'foundations', label: 'Foundations' },
		{ id: 'hestness', label: 'Hestness 2017' },
		{ id: 'kaplan', label: 'Kaplan 2020' },
		{ id: 'chinchilla', label: 'Chinchilla' },
		{ id: 'mup', label: 'muP' },
		{ id: 'casestudies', label: 'Case Studies' }
	];

	let activeTab = $state('home');

	function handleTabChange(tabId) {
		activeTab = tabId;
	}
</script>

<main class="flex min-h-screen flex-col bg-[var(--color-bg)] px-6 py-4 md:px-10 lg:px-16">
	<div class="mx-auto flex w-full max-w-7xl flex-1 flex-col">
		<div class="mb-4 flex flex-wrap items-center gap-4">
			<a
				href={resolve('/')}
				class="text-[var(--color-muted)] text-[var(--text-small)] transition-colors hover:text-[var(--color-primary)]"
			>
				← Home
			</a>
			<h1 class="font-bold text-[var(--color-primary)] text-[var(--text-h1)]">Scaling Laws</h1>
			<Tabs {tabs} {activeTab} onchange={handleTabChange} />
		</div>

		<div class="flex-1">
			{#if activeTab === 'home'}
				<HomePage />
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

		<footer
			class="mt-auto flex items-center justify-between pt-6 text-[var(--text-small)] text-gray-500"
		>
			<p>Based on Stanford CS336 Lectures 9 & 11</p>
			<div class="flex gap-4">
				<a
					href="https://web.stanford.edu/class/cs336/"
					target="_blank"
					rel="noopener noreferrer external"
					class="hover:text-[var(--color-primary)]"
				>
					Course Website
				</a>
			</div>
		</footer>
	</div>
</main>
