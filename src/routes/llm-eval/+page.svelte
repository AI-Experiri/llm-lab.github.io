<script>
	import { resolve } from '$app/paths';
	import Tabs from '$lib/llm-eval/components/Tabs.svelte';
	import HomePage from '$lib/llm-eval/components/HomePage.svelte';
	import SampleDataPage from '$lib/llm-eval/components/SampleDataPage.svelte';

	const tabs = [
		{ id: 'home', label: 'Home' },
		{ id: 'sample', label: 'Sample Data' }
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
			<h1 class="font-bold text-[var(--color-primary)] text-[var(--text-h1)]">
				LLM Evaluation Lab
			</h1>
			<Tabs {tabs} {activeTab} onchange={handleTabChange} />
		</div>

		{#if activeTab === 'home'}
			<HomePage />
		{:else if activeTab === 'sample'}
			<SampleDataPage />
		{/if}

		<footer
			class="mt-auto flex items-center justify-between pt-6 text-[var(--text-small)] text-gray-500"
		>
			<div class="flex flex-col gap-1">
				<a
					href="https://ohgodmodels.xyz"
					target="_blank"
					rel="noopener noreferrer external"
					class="transition-colors hover:text-gray-300">OHGOD Models Philosophy</a
				>
				<a
					href="https://debugarguments.app"
					target="_blank"
					rel="noopener noreferrer external"
					class="transition-colors hover:text-gray-300">Debug Arguments App</a
				>
			</div>
			<div class="flex flex-col gap-1 text-right">
				<a
					href="https://bicepjai.com"
					target="_blank"
					rel="noopener noreferrer external"
					class="transition-colors hover:text-gray-300">Created by bicepjai</a
				>
				<span>Created with Claude</span>
			</div>
		</footer>
	</div>
</main>
