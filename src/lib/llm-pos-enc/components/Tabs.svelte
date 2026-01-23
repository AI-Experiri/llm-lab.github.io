<script>
	// ABOUTME: Tab navigation for PE methods
	// ABOUTME: Simple inline pill-style tabs

	let { tabs = [], activeTab = '', onchange = () => {} } = $props();

	function selectTab(tabId) {
		onchange(tabId);
	}
</script>

<div class="flex flex-wrap gap-1.5">
	{#each tabs as tab (tab.id)}
		<button
			onclick={() => selectTab(tab.id)}
			title={tab.description}
			class="rounded-lg px-3 py-1.5 font-medium text-[var(--text-body)] transition-all
        {activeTab === tab.id
				? `${tab.color} text-white shadow-lg`
				: 'bg-white/10 text-gray-300 hover:bg-white/20'}"
		>
			{tab.label}
		</button>
	{/each}
</div>
