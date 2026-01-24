<!-- ABOUTME: Displays current tokens with progress bar and stats.
     ABOUTME: Used by all visualizers to show tokenization progress. -->
<script>
	import { toDisplay } from '../../lib/utils.js';
	import ProgressBar from './ProgressBar.svelte';

	let {
		tokens = [],
		currentStep = 0,
		totalSteps = 0,
		currentTokenCount = 0,
		compressionRate = 0,
		accentColor = 'bg-purple-400',
		progressColor = 'bg-purple-500',
		emptyMessage = 'Click "Start" to tokenize your text',
		currentMergedToken = null,
		children
	} = $props();
</script>

<div class="rounded-xl bg-white/10 p-4 backdrop-blur">
	<div class="mb-3 flex items-center justify-between">
		<h3 class="flex items-center gap-2 font-semibold text-[var(--text-body)] text-white">
			<span class="h-2 w-2 {accentColor} rounded-full"></span>
			Current Tokens
		</h3>
		<div class="flex items-center gap-3 text-[var(--text-small)]">
			<span class="text-slate-400"
				>Count: <span class="font-bold text-white">{currentTokenCount}</span></span
			>
			<span class="font-bold text-emerald-400">-{compressionRate}%</span>
		</div>
	</div>

	<ProgressBar {currentStep} {totalSteps} color={progressColor} />

	<div
		class="flex max-h-[300px] min-h-[120px] flex-wrap content-start gap-1.5 overflow-y-auto md:max-h-[350px] md:min-h-[200px] lg:max-h-[400px] lg:min-h-[250px]"
	>
		{#if tokens.length === 0}
			<p class="w-full py-8 text-center text-slate-400">{emptyMessage}</p>
		{:else if children}
			{@render children()}
		{:else}
			{#each tokens as token (token.id)}
				{#if token.isSeparator}
					<span class="px-1 font-bold text-slate-600">│</span>
				{:else}
					<span
						class="token rounded-lg px-2 py-1 font-mono font-medium text-[var(--text-small)] transition-all duration-200
              {token.highlight
							? 'highlight bg-yellow-400 text-yellow-900 shadow-lg shadow-yellow-400/50'
							: ''}
              {token.merging ? 'merging bg-red-400 text-red-900' : ''}
              {token.isNew
							? 'new bg-emerald-400 text-emerald-900 shadow-lg shadow-emerald-400/50'
							: ''}
              {!token.highlight &&
						!token.merging &&
						!token.isNew &&
						token.text === currentMergedToken
							? 'bg-yellow-400 font-bold text-yellow-900 shadow-lg shadow-yellow-400/50'
							: ''}
              {!token.highlight &&
						!token.merging &&
						!token.isNew &&
						token.text !== currentMergedToken
							? 'bg-slate-700 text-slate-200'
							: ''}"
						style="opacity: {token.opacity}; transform: scale({token.scale})"
						>{toDisplay(token.text)}</span
					>
				{/if}
			{/each}
		{/if}
	</div>
</div>
