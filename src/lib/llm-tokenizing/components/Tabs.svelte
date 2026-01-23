<script>
	let { tabs = [], activeTab = '', onchange = () => {} } = $props();

	function selectTab(tabId) {
		onchange(tabId);
	}
</script>

<div class="flex flex-wrap gap-1.5">
	{#each tabs as tab (tab.id)}
		<button
			onclick={() => selectTab(tab.id)}
			title="{tab.description} - {tab.paperTitle}"
			class="rounded-lg px-3 py-1.5 text-sm font-medium transition-all
        {activeTab === tab.id
				? `${tab.color} text-white shadow-lg`
				: 'bg-white/10 text-slate-300 hover:bg-white/20'}"
		>
			{tab.label}
		</button>
	{/each}
</div>
