<!-- ABOUTME: Uniform tab navigation with pink active state -->
<!-- ABOUTME: Used across all lab pages for consistent navigation -->

<script>
	let { tabs, activeTab, onchange } = $props();
</script>

<div class="flex flex-wrap gap-1.5">
	{#each tabs as tab (tab.id)}
		<button
			onclick={() => onchange(tab.id)}
			class="cursor-pointer rounded-lg px-3 py-1.5 font-medium text-[var(--text-body)] transition-all
			{activeTab === tab.id
				? 'bg-[var(--color-primary)] text-white shadow-lg'
				: 'bg-white/10 text-gray-300 hover:bg-white/20'}"
		>
			{tab.label}
		</button>
	{/each}
</div>
