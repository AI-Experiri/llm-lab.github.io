<script>
	import { resolve } from '$app/paths';
	import Tabs from '$lib/llm-tokenizing/components/Tabs.svelte';
	import BPEVisualizer from '$lib/llm-tokenizing/components/BPEVisualizer.svelte';
	import ScaffoldBPEVisualizer from '$lib/llm-tokenizing/components/ScaffoldBPEVisualizer.svelte';
	import WordPieceVisualizer from '$lib/llm-tokenizing/components/WordPieceVisualizer.svelte';
	import AdaptiveBPEVisualizer from '$lib/llm-tokenizing/components/AdaptiveBPEVisualizer.svelte';
	import BoundlessBPEVisualizer from '$lib/llm-tokenizing/components/BoundlessBPEVisualizer.svelte';
	import MorphBPEVisualizer from '$lib/llm-tokenizing/components/MorphBPEVisualizer.svelte';
	import AGBPEVisualizer from '$lib/llm-tokenizing/components/AGBPEVisualizer.svelte';

	const tabs = [
		{ id: 'bpe', label: 'Standard BPE', description: 'GPT-2/GPT-4 style', color: 'bg-purple-600' },
		{ id: 'wordpiece', label: 'WordPiece', description: 'BERT style', color: 'bg-green-600' },
		{
			id: 'scaffold',
			label: 'Scaffold-BPE',
			description: 'with demolition',
			color: 'bg-orange-600'
		},
		{ id: 'adaptive', label: 'AdaptBPE', description: 'domain adaptation', color: 'bg-cyan-600' },
		{
			id: 'boundless',
			label: 'BoundlessBPE',
			description: 'cross-boundary',
			color: 'bg-fuchsia-600'
		},
		{ id: 'morph', label: 'MorphBPE', description: 'morpheme-aware', color: 'bg-teal-600' },
		{ id: 'agbpe', label: 'AG-BPE', description: 'attention-guided', color: 'bg-indigo-600' }
	];

	let activeTab = $state('bpe');

	function handleTabChange(tabId) {
		activeTab = tabId;
	}
</script>

<main
	class="flex min-h-screen flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-6 py-4 md:px-10 lg:px-16"
>
	<div class="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col">
		<div class="mb-2 flex items-center gap-4">
			<a href={resolve('/')} class="text-sm text-slate-400 transition-colors hover:text-purple-400">
				← Home
			</a>
			<h1 class="text-lg font-bold whitespace-nowrap text-white">Tokenizer</h1>
			<Tabs {tabs} {activeTab} onchange={handleTabChange} />
		</div>

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

		<footer class="mt-auto flex items-center justify-between pt-4 text-xs text-slate-500">
			<div class="flex flex-col gap-1">
				<a
					href="https://ohgodmodels.xyz"
					target="_blank"
					rel="noopener noreferrer external"
					class="transition-colors hover:text-slate-300">OHGOD Models Philosophy</a
				>
				<a
					href="https://debugarguments.app"
					target="_blank"
					rel="noopener noreferrer external"
					class="transition-colors hover:text-slate-300">Debug Arguments App</a
				>
			</div>
			<div class="flex flex-col gap-1">
				<a
					href="https://bicepjai.com"
					target="_blank"
					rel="noopener noreferrer external"
					class="transition-colors hover:text-slate-300">Created by bicepjai</a
				>
				<span>Created with claude</span>
			</div>
		</footer>
	</div>
</main>
