<!-- ABOUTME: Reusable data table component with customizable column styling -->
<!-- ABOUTME: All styling controlled here - pages only pass columns and data -->

<script>
	/**
	 * @typedef {Object} Column
	 * @property {string} key - Data key to access from row object
	 * @property {string} header - Column header text
	 * @property {string} [color] - Optional color: 'text', 'muted', 'accent', 'primary', 'amber', 'emerald', 'cyan', 'red'
	 * @property {boolean} [mono] - Use monospace font
	 */

	/**
	 * @type {{
	 *   columns: Column[],
	 *   data: Record<string, any>[],
	 *   keyField?: string,
	 *   class?: string
	 * }}
	 */
	let { columns = [], data = [], keyField = '', class: className = '' } = $props();

	/**
	 * Get color class for a column
	 * @param {string} [color]
	 */
	function getColorClass(color) {
		switch (color) {
			case 'text':
				return 'text-[var(--color-text)]';
			case 'muted':
				return 'text-[var(--color-muted)]';
			case 'accent':
				return 'text-[var(--color-accent)]';
			case 'primary':
				return 'text-[color:var(--color-primary)]';
			case 'amber':
				return 'text-amber-400';
			case 'emerald':
				return 'text-emerald-400';
			case 'cyan':
				return 'text-cyan-400';
			case 'red':
				return 'text-red-400';
			default:
				return 'text-[var(--color-text)]';
		}
	}

	/**
	 * Get the key for a row
	 * @param {Record<string, any>} row
	 * @param {number} index
	 */
	function getRowKey(row, index) {
		if (keyField && row[keyField] !== undefined) {
			return row[keyField];
		}
		return index;
	}
</script>

<div class="overflow-x-auto {className}">
	<table class="w-full text-[var(--text-small)]">
		<thead>
			<tr class="border-b border-[var(--color-muted)]/20 text-left text-[var(--color-muted)]">
				{#each columns as col, i (i)}
					<th class="{i < columns.length - 1 ? 'pr-4' : ''} pb-3">{col.header}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each data as row, rowIndex (getRowKey(row, rowIndex))}
				<tr class="border-b border-[var(--color-muted)]/10">
					{#each columns as col, colIndex (colIndex)}
						<td
							class="py-3 {colIndex < columns.length - 1 ? 'pr-4' : ''} {col.mono
								? 'font-mono'
								: ''} {getColorClass(col.color)}"
						>
							{row[col.key]}
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
