<!-- ABOUTME: Colored category list with gradient backgrounds and left border accents -->
<!-- ABOUTME: All styling controlled here - pages only pass items array with label, description, and color -->

<script>
	/**
	 * @typedef {Object} CategoryItem
	 * @property {string} label - Category label
	 * @property {string} description - Category description
	 * @property {'purple' | 'blue' | 'yellow' | 'green' | 'cyan' | 'orange' | 'red' | 'pink' | 'amber' | 'emerald' | 'indigo' | 'rose'} color - Color theme
	 */

	/** @type {{ items: CategoryItem[], labelWidth?: string, class?: string }} */
	let { items = [], labelWidth = 'w-24', class: className = '' } = $props();

	/**
	 * Get border color class
	 * @param {string} color
	 */
	function getBorderClass(color) {
		const colors = {
			purple: 'border-purple-500',
			blue: 'border-blue-500',
			yellow: 'border-yellow-500',
			green: 'border-green-500',
			cyan: 'border-cyan-500',
			orange: 'border-orange-500',
			red: 'border-red-500',
			pink: 'border-pink-500',
			amber: 'border-amber-500',
			emerald: 'border-emerald-500',
			indigo: 'border-indigo-500',
			rose: 'border-rose-500'
		};
		return colors[color] || 'border-purple-500';
	}

	/**
	 * Get gradient background class
	 * @param {string} color
	 */
	function getGradientClass(color) {
		const colors = {
			purple: 'from-purple-900/40',
			blue: 'from-blue-900/40',
			yellow: 'from-yellow-900/40',
			green: 'from-green-900/40',
			cyan: 'from-cyan-900/40',
			orange: 'from-orange-900/40',
			red: 'from-red-900/40',
			pink: 'from-pink-900/40',
			amber: 'from-amber-900/40',
			emerald: 'from-emerald-900/40',
			indigo: 'from-indigo-900/40',
			rose: 'from-rose-900/40'
		};
		return colors[color] || 'from-purple-900/40';
	}

	/**
	 * Get text color class
	 * @param {string} color
	 */
	function getTextClass(color) {
		const colors = {
			purple: 'text-purple-300',
			blue: 'text-blue-300',
			yellow: 'text-yellow-300',
			green: 'text-green-300',
			cyan: 'text-cyan-300',
			orange: 'text-orange-300',
			red: 'text-red-300',
			pink: 'text-pink-300',
			amber: 'text-amber-300',
			emerald: 'text-emerald-300',
			indigo: 'text-indigo-300',
			rose: 'text-rose-300'
		};
		return colors[color] || 'text-purple-300';
	}
</script>

<div class="space-y-1.5 text-[var(--text-small)] {className}">
	{#each items as item, i (i)}
		<div
			class="flex items-center gap-2 rounded border-l-2 bg-gradient-to-r to-transparent px-2 py-1.5 {getBorderClass(
				item.color
			)} {getGradientClass(item.color)}"
		>
			<span class="{labelWidth} font-medium {getTextClass(item.color)}">{item.label}</span>
			<span class="text-[var(--color-muted)]">{item.description}</span>
		</div>
	{/each}
</div>
