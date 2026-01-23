<script>
	import { untrack } from 'svelte';
	import CollapsibleJSON from './CollapsibleJSON.svelte';

	let { data, key = null, depth = 0, maxDepth = 6 } = $props();

	// Auto-collapse deeper levels, always collapse beyond depth 1
	// Using untrack since we intentionally only want the initial value
	let collapsed = $state(untrack(() => depth > 0));

	function getType(val) {
		if (val === null) return 'null';
		if (Array.isArray(val)) return 'array';
		return typeof val;
	}

	function isExpandable(val) {
		const type = getType(val);
		return (type === 'object' || type === 'array') && val !== null;
	}

	function getPreview(val) {
		const type = getType(val);
		if (type === 'array') return `Array(${val.length})`;
		if (type === 'object') {
			const keys = Object.keys(val);
			return `{${keys.length} keys}`;
		}
		return '';
	}

	function truncateString(str, maxLen = 200) {
		if (str.length <= maxLen) return str;
		return str.slice(0, maxLen) + '...';
	}

	function formatValue(val) {
		const type = getType(val);
		if (type === 'string') return `"${truncateString(val)}"`;
		if (type === 'null') return 'null';
		return String(val);
	}

	function getValueClass(val) {
		const type = getType(val);
		if (type === 'string') return 'text-green-400';
		if (type === 'number') return 'text-yellow-400';
		if (type === 'boolean') return 'text-blue-400';
		if (type === 'null') return 'text-red-400';
		return 'text-[var(--color-text)]';
	}

	const type = $derived(getType(data));
	const expandable = $derived(isExpandable(data));

	// Limit entries for very large arrays/objects
	const maxEntries = 50;
	const entries = $derived(() => {
		if (type === 'array') {
			const arr = data.map((v, i) => [i, v]);
			return arr.length > maxEntries ? arr.slice(0, maxEntries) : arr;
		}
		if (type === 'object') {
			const arr = Object.entries(data);
			return arr.length > maxEntries ? arr.slice(0, maxEntries) : arr;
		}
		return [];
	});

	const totalCount = $derived(
		type === 'array' ? data.length : type === 'object' ? Object.keys(data).length : 0
	);
	const isTruncated = $derived(totalCount > maxEntries);
	const atMaxDepth = $derived(depth >= maxDepth);
</script>

<div
	class="font-mono leading-relaxed text-[var(--text-small)]"
	style="padding-left: {depth > 0 ? '1rem' : '0'}"
>
	{#if key !== null}
		<span class="text-purple-400">"{key}"</span><span class="text-[var(--color-muted)]">: </span>
	{/if}

	{#if expandable}
		{#if atMaxDepth}
			<!-- At max depth, just show preview -->
			<span class="text-[var(--color-muted)]"
				>{type === 'array' ? '[' : '{'}{getPreview(data)}{type === 'array' ? ']' : '}'}</span
			>
		{:else}
			<button
				onclick={() => (collapsed = !collapsed)}
				class="-ml-1 inline-flex cursor-pointer items-center gap-1 rounded px-1 hover:bg-[var(--color-secondary)]"
			>
				<span
					class="text-[10px] text-yellow-400 transition-transform {collapsed ? '' : 'rotate-90'}"
					>▶</span
				>
				<span class="text-[var(--color-muted)]">{type === 'array' ? '[' : '{'}</span>
				{#if collapsed}
					<span class="text-[var(--color-muted)] text-[var(--text-tiny)]">{getPreview(data)}</span>
					<span class="text-[var(--color-muted)]">{type === 'array' ? ']' : '}'}</span>
				{/if}
			</button>

			{#if !collapsed}
				<div>
					{#each entries() as [k, v], i (k)}
						<div class="ml-1 border-l border-[var(--color-secondary)]">
							<CollapsibleJSON
								data={v}
								key={type === 'array' ? null : k}
								depth={depth + 1}
								{maxDepth}
							/>
							{#if i < entries().length - 1}
								<span class="text-[var(--color-muted)]">,</span>
							{/if}
						</div>
					{/each}
					{#if isTruncated}
						<div class="ml-1 border-l border-[var(--color-secondary)] pl-4">
							<span class="text-[var(--color-muted)] italic"
								>... {totalCount - maxEntries} more items</span
							>
						</div>
					{/if}
				</div>
				<span class="text-[var(--color-muted)]">{type === 'array' ? ']' : '}'}</span>
			{/if}
		{/if}
	{:else}
		<span class={getValueClass(data)}>{formatValue(data)}</span>
	{/if}
</div>
