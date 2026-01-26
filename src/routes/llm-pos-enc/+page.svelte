<!-- ABOUTME: LLM Positional Encoding Lab page using shared layout components -->
<!-- ABOUTME: Visualizers for various positional encoding schemes from Sinusoidal to DroPE -->

<script>
	import { PageLayout, PageHeader, TabBar, Footer } from '$lib/layout';
	import HomePage from '$lib/llm-pos-enc/components/HomePage.svelte';
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
		{ id: 'overview', label: 'Overview' },
		{ id: 'sinusoidal', label: 'Sinusoidal' },
		{ id: 'relative-pe', label: 'Relative-PE' },
		{ id: 'transformer-xl', label: 'Transformer-XL' },
		{ id: 't5', label: 'T5' },
		{ id: 'rope', label: 'RoPE' },
		{ id: 'alibi', label: 'ALiBi' },
		{ id: 'nope', label: 'NoPE' },
		{ id: 'yarn-ntk', label: 'YaRN+NTK' },
		{ id: 'drope', label: 'DroPE' }
	];

	let activeTab = $state('overview');

	function handleTabChange(tabId) {
		activeTab = tabId;
	}
</script>

<PageLayout>
	<PageHeader title="Positional Encoding Lab">
		<TabBar {tabs} {activeTab} onchange={handleTabChange} />
	</PageHeader>

	<div class="flex-1">
		{#if activeTab === 'overview'}
			<HomePage />
		{/if}
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
	</div>

	<Footer />
</PageLayout>
