<script>
	import { resolve } from '$app/paths';
	import Tabs from '$lib/llm-pos-enc/components/Tabs.svelte';
	import KeepAlive from '$lib/llm-pos-enc/components/KeepAlive.svelte';
	import Sinusoidal from '$lib/llm-pos-enc/components/Sinusoidal.svelte';
	import RelativePE from '$lib/llm-pos-enc/components/RelativePE.svelte';
	import TransformerXL from '$lib/llm-pos-enc/components/TransformerXL.svelte';
	import T5 from '$lib/llm-pos-enc/components/T5.svelte';
	import RoPE from '$lib/llm-pos-enc/components/RoPE.svelte';
	import ALiBi from '$lib/llm-pos-enc/components/ALiBi.svelte';
	import NoPE from '$lib/llm-pos-enc/components/NoPE.svelte';
	import YarnNtk from '$lib/llm-pos-enc/components/YarnNtk.svelte';
	import DroPE from '$lib/llm-pos-enc/components/DroPE.svelte';

	const tabs = [
		{
			id: 'sinusoidal',
			label: 'Sinusoidal',
			description: 'Absolute sinusoidal encoding (Vaswani et al., 2017)',
			color: 'bg-purple-600'
		},
		{
			id: 'relative-pe',
			label: 'Relative-PE',
			description: 'First relative PE in attention (Shaw et al., 2018)',
			color: 'bg-blue-600'
		},
		{
			id: 'transformer-xl',
			label: 'Transformer-XL',
			description: 'Relative PE with segment recurrence (Dai et al., 2019)',
			color: 'bg-green-600'
		},
		{
			id: 't5',
			label: 'T5',
			description: 'Bucketed relative PE, shared across layers (Raffel et al., 2020)',
			color: 'bg-yellow-600'
		},
		{
			id: 'rope',
			label: 'RoPE',
			description: 'Rotary Position Embedding (Su et al., 2021)',
			color: 'bg-orange-600'
		},
		{
			id: 'alibi',
			label: 'ALiBi',
			description: 'Attention with Linear Biases (Press et al., 2022)',
			color: 'bg-cyan-600'
		},
		{
			id: 'nope',
			label: 'NoPE',
			description: 'No Positional Encoding (Kazemnejad et al., 2023)',
			color: 'bg-pink-600'
		},
		{
			id: 'yarn-ntk',
			label: 'YaRN+NTK',
			description: 'RoPE scaling methods (PI, NTK, YaRN - 2023)',
			color: 'bg-amber-600'
		},
		{
			id: 'drope',
			label: 'DroPE',
			description: 'Dropping PE for context extension (Sakana AI, 2024)',
			color: 'bg-emerald-600'
		}
	];

	let activeTab = $state('sinusoidal');

	function handleTabChange(tabId) {
		activeTab = tabId;
	}
</script>

<main class="flex min-h-screen flex-col bg-[#1a1a2e] px-6 py-4 md:px-10 lg:px-16">
	<div class="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col">
		<div class="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
			<a
				href={resolve('/')}
				class="text-[var(--color-muted)] text-[var(--text-small)] transition-colors hover:text-[var(--color-primary)]"
			>
				← Home
			</a>
			<h1 class="font-bold whitespace-nowrap text-[#e94560] text-[var(--text-h1)]">
				Positional Encoding
			</h1>
			<Tabs {tabs} {activeTab} onchange={handleTabChange} />
		</div>

		<KeepAlive show={activeTab === 'sinusoidal'}>
			<Sinusoidal />
		</KeepAlive>
		<KeepAlive show={activeTab === 'relative-pe'}>
			<RelativePE />
		</KeepAlive>
		<KeepAlive show={activeTab === 'transformer-xl'}>
			<TransformerXL />
		</KeepAlive>
		<KeepAlive show={activeTab === 't5'}>
			<T5 />
		</KeepAlive>
		<KeepAlive show={activeTab === 'rope'}>
			<RoPE />
		</KeepAlive>
		<KeepAlive show={activeTab === 'alibi'}>
			<ALiBi />
		</KeepAlive>
		<KeepAlive show={activeTab === 'nope'}>
			<NoPE />
		</KeepAlive>
		<KeepAlive show={activeTab === 'yarn-ntk'}>
			<YarnNtk />
		</KeepAlive>
		<KeepAlive show={activeTab === 'drope'}>
			<DroPE />
		</KeepAlive>

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
