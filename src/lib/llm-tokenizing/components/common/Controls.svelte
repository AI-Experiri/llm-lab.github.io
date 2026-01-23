<!-- ABOUTME: Reusable controls card for tokenizer visualizers.
     ABOUTME: Contains slots for custom controls, standard buttons, and status bar. -->
<script>
	let {
		statusMessage = '',
		gradientFrom = 'from-purple-600/80',
		gradientTo = 'to-blue-600/80',
		canStart = true,
		canBack = false,
		canStep = false,
		canPlay = false,
		canReset = false,
		isPlaying = false,
		startColor = 'bg-purple-600 hover:bg-purple-500',
		onStart = () => {},
		onBack = () => {},
		onStep = () => {},
		onPlay = () => {},
		onReset = () => {},
		children
	} = $props();
</script>

<div class="rounded-xl bg-white/10 p-4 backdrop-blur lg:col-span-7">
	<div class="flex h-full flex-col justify-center gap-3">
		<!-- Controls Row -->
		<div class="flex flex-wrap items-center justify-center gap-2">
			<!-- Custom controls slot -->
			{@render children?.()}

			<!-- Standard buttons -->
			<div class="flex flex-wrap justify-center gap-2">
				<button
					onclick={onStart}
					disabled={!canStart}
					class="px-4 py-1.5 {startColor} rounded-lg text-sm font-medium text-white disabled:opacity-50"
					>Start</button
				>
				<button
					onclick={onBack}
					disabled={!canBack}
					class="rounded-lg bg-slate-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-500 disabled:opacity-50"
					>←</button
				>
				<button
					onclick={onStep}
					disabled={!canStep}
					class="rounded-lg bg-slate-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-500 disabled:opacity-50"
					>→</button
				>
				<button
					onclick={onPlay}
					disabled={!canPlay}
					class="rounded-lg bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
					>{isPlaying ? 'Pause' : 'Play'}</button
				>
				<button
					onclick={onReset}
					disabled={!canReset}
					class="rounded-lg bg-slate-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-slate-500 disabled:opacity-50"
					>Reset</button
				>
			</div>
		</div>

		<!-- Status Bar -->
		<div
			class="bg-gradient-to-r {gradientFrom} {gradientTo} flex items-center justify-center rounded-lg px-3 py-2"
		>
			<p class="text-center text-sm font-medium text-white">{statusMessage}</p>
		</div>
	</div>
</div>
