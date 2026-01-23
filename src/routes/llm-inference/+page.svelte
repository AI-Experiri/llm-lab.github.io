<script>
	import { resolve } from '$app/paths';
	import Tabs from '$lib/llm-inference/components/Tabs.svelte';
	import FoundationPage from '$lib/llm-inference/components/FoundationPage.svelte';
	import ChallengesPage from '$lib/llm-inference/components/ChallengesPage.svelte';
	import ArchitecturePage from '$lib/llm-inference/components/ArchitecturePage.svelte';
	import OptimizationPage from '$lib/llm-inference/components/OptimizationPage.svelte';
	import SystemsPage from '$lib/llm-inference/components/SystemsPage.svelte';

	const tabs = [
		{ id: 'foundation', label: 'Foundation' },
		{ id: 'challenges', label: 'Challenges' },
		{ id: 'architecture', label: 'Architecture' },
		{ id: 'optimization', label: 'Optimization' },
		{ id: 'systems', label: 'Systems' }
	];

	let activeTab = $state('foundation');

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
			<h1 class="font-bold text-[var(--color-primary)] text-[var(--text-h1)]">LLM Inference Lab</h1>
			<Tabs {tabs} {activeTab} onchange={handleTabChange} />
		</div>

		<div class="flex-1">
			{#if activeTab === 'foundation'}
				<FoundationPage />
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

		{#if activeTab === 'foundation'}
			<section class="mt-6 rounded-lg bg-[var(--color-surface)] p-4">
				<h3 class="mb-3 font-semibold text-[var(--color-primary)] text-[var(--text-body)]">
					References
				</h3>
				<ul class="space-y-2 text-[var(--text-tiny)]">
					<li class="flex items-start gap-2">
						<span class="text-[var(--color-primary)]">1.</span>
						<span class="text-[var(--color-muted)]">
							<a
								href="https://www.youtube.com/watch?v=ZxWJ1rAHoV0&list=PLoROMvodv4rOY23Y0BoGoBGgQ1zmU_MT_&index=11"
								target="_blank"
								rel="noopener noreferrer external"
								class="text-[var(--color-primary)] underline transition-colors hover:text-pink-400"
							>
								Stanford CS336: Language Modeling from Scratch | Spring 2025 | Lecture 10: Inference
							</a>
						</span>
					</li>
					<li class="flex items-start gap-2">
						<span class="text-[var(--color-primary)]">2.</span>
						<span class="text-[var(--color-muted)]">
							<a
								href="https://arxiv.org/abs/2309.06180"
								target="_blank"
								rel="noopener noreferrer external"
								class="text-[var(--color-primary)] underline transition-colors hover:text-pink-400"
							>
								Efficient Memory Management for Large Language Model Serving with PagedAttention
								(vLLM)
							</a>
						</span>
					</li>
					<li class="flex items-start gap-2">
						<span class="text-[var(--color-primary)]">3.</span>
						<span class="text-[var(--color-muted)]">
							<a
								href="https://arxiv.org/abs/2205.14135"
								target="_blank"
								rel="noopener noreferrer external"
								class="text-[var(--color-primary)] underline transition-colors hover:text-pink-400"
							>
								FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness
							</a>
						</span>
					</li>
					<li class="flex items-start gap-2">
						<span class="text-[var(--color-primary)]">4.</span>
						<span class="text-[var(--color-muted)]">
							<a
								href="https://arxiv.org/abs/2302.01318"
								target="_blank"
								rel="noopener noreferrer external"
								class="text-[var(--color-primary)] underline transition-colors hover:text-pink-400"
							>
								Fast Inference from Transformers via Speculative Decoding
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
