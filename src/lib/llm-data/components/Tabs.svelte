<script>
	let { tabs, activeTab, onchange } = $props();
</script>

<div class="flex flex-wrap gap-1.5">
	{#each tabs as tab (tab.id)}
		<button
			onclick={() => onchange(tab.id)}
			class="cursor-pointer rounded-lg px-3 py-1.5 font-medium text-[var(--text-body)] transition-all
        {activeTab === tab.id
				? 'bg-gradient-to-r from-[var(--color-primary)] to-pink-600 text-white shadow-lg'
				: 'bg-white/10 text-gray-300 hover:bg-white/20'}"
		>
			{tab.label}
		</button>
	{/each}
</div>
