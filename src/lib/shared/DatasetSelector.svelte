<!-- ABOUTME: Dataset selector with category and dataset dropdowns -->
<!-- ABOUTME: Used in sample data pages for both llm-data and llm-eval -->

<script>
	let {
		categories,
		datasets,
		selectedCategory,
		selectedDataset,
		onCategoryChange,
		onDatasetChange,
		getCategoryCount,
		getDatasetLabel,
		isDatasetInaccessible = () => false
	} = $props();
</script>

<section
	class="rounded-lg border border-[var(--color-secondary)] bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-bg)] p-4"
>
	<div class="flex flex-col gap-4 sm:flex-row">
		<div class="flex-1">
			<label
				for="category-select"
				class="mb-1 block text-[var(--color-muted)] text-[var(--text-tiny)]"
			>
				Category
			</label>
			<select
				id="category-select"
				value={selectedCategory}
				onchange={(e) => onCategoryChange(e.target.value)}
				class="w-full cursor-pointer rounded-lg border border-[var(--color-secondary)] bg-[var(--color-bg)] px-3 py-2 text-[var(--color-text)] text-[var(--text-small)] transition-colors focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none"
			>
				{#each categories as cat (cat.id)}
					{@const count = getCategoryCount ? getCategoryCount(cat.id) : 0}
					<option value={cat.id}>{cat.label || cat.name} ({count})</option>
				{/each}
			</select>
		</div>

		<div class="flex-1">
			<label
				for="dataset-select"
				class="mb-1 block text-[var(--color-muted)] text-[var(--text-tiny)]"
			>
				Dataset ({datasets.length})
			</label>
			<select
				id="dataset-select"
				value={selectedDataset}
				onchange={onDatasetChange}
				class="w-full cursor-pointer rounded-lg border border-[var(--color-secondary)] bg-[var(--color-bg)] px-3 py-2 text-[var(--color-text)] text-[var(--text-small)] transition-colors focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] focus:outline-none"
			>
				<option value="">-- Select --</option>
				{#each datasets as dataset (dataset.id || dataset)}
					{@const inaccessible = isDatasetInaccessible(dataset)}
					{@const label = getDatasetLabel ? getDatasetLabel(dataset) : dataset.name || dataset}
					<option
						value={dataset.id || dataset}
						style={inaccessible ? 'color: #f87171; background-color: #450a0a;' : ''}
					>
						{label}
					</option>
				{/each}
			</select>
		</div>
	</div>
</section>
