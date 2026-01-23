<script>
	import { resolve } from '$app/paths';
	import Tabs from '$lib/llm-data/components/Tabs.svelte';
	import ImportancePage from '$lib/llm-data/components/ImportancePage.svelte';
	import ProcessingPage from '$lib/llm-data/components/ProcessingPage.svelte';
	import DatasetsPage from '$lib/llm-data/components/DatasetsPage.svelte';
	import SampleDataPage from '$lib/llm-data/components/SampleDataPage.svelte';

	const tabs = [
		{ id: 'importance', label: 'Home' },
		{ id: 'processing', label: 'Processing' },
		{ id: 'datasets', label: 'Datasets' },
		{ id: 'samples', label: 'Samples' }
	];

	let activeTab = $state('importance');

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
			<h1 class="font-bold text-[var(--color-primary)] text-[var(--text-h1)]">LLM Data Lab</h1>
			<Tabs {tabs} {activeTab} onchange={handleTabChange} />
		</div>

		<div class="flex-1">
			{#if activeTab === 'importance'}
				<ImportancePage />
			{:else if activeTab === 'processing'}
				<ProcessingPage />
			{:else if activeTab === 'datasets'}
				<DatasetsPage />
			{:else if activeTab === 'samples'}
				<SampleDataPage />
			{/if}
		</div>

		{#if activeTab === 'importance'}
			<section class="mt-6 rounded-lg bg-[var(--color-surface)] p-4">
				<h3 class="mb-3 font-semibold text-[var(--color-primary)] text-[var(--text-body)]">
					References
				</h3>
				<ul class="space-y-2 text-[var(--text-tiny)]">
					<li class="flex items-start gap-2">
						<span class="text-[var(--color-primary)]">1.</span>
						<span class="text-[var(--color-muted)]">
							<a
								href="https://www.youtube.com/watch?v=jPLmS0tho-Y&list=PLoROMvodv4rOY23Y0BoGoBGgQ1zmU_MT_&index=14"
								target="_blank"
								rel="noopener noreferrer external"
								class="text-[var(--color-primary)] underline transition-colors hover:text-pink-400"
							>
								Stanford CS336: Language Modeling from Scratch | Spring 2025 | Lecture 13: Data I
							</a>
						</span>
					</li>
					<li class="flex items-start gap-2">
						<span class="text-[var(--color-primary)]">2.</span>
						<span class="text-[var(--color-muted)]">
							<a
								href="https://www.youtube.com/watch?v=CGKFX7l7EJ8&list=PLoROMvodv4rOY23Y0BoGoBGgQ1zmU_MT_&index=15"
								target="_blank"
								rel="noopener noreferrer external"
								class="text-[var(--color-primary)] underline transition-colors hover:text-pink-400"
							>
								Stanford CS336: Language Modeling from Scratch | Spring 2025 | Lecture 14: Data II
							</a>
						</span>
					</li>
					<li class="flex items-start gap-2">
						<span class="text-[var(--color-primary)]">3.</span>
						<span class="text-[var(--color-muted)]">
							Sample data obtained from
							<a
								href="https://huggingface.co/docs/datasets-server"
								target="_blank"
								rel="noopener noreferrer external"
								class="text-[var(--color-primary)] underline transition-colors hover:text-pink-400"
							>
								HuggingFace Datasets Server API
							</a>
						</span>
					</li>
				</ul>
			</section>
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
				<span>Created with claude</span>
			</div>
		</footer>
	</div>
</main>
