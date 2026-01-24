<!-- ABOUTME: Reusable text input card for tokenizer visualizers.
     ABOUTME: Contains a textarea that fills the card height. -->
<script>
	let {
		value = $bindable(''),
		placeholder = 'Enter text to tokenize...',
		disabled = false
	} = $props();
</script>

<div class="flex flex-col rounded-xl bg-white/10 p-4 backdrop-blur lg:col-span-5">
	<textarea
		bind:value
		{placeholder}
		{disabled}
		maxlength="1000"
		class="min-h-24 w-full flex-1 resize-none rounded-lg bg-slate-800/50 px-3 py-2 text-[var(--text-small)] text-white disabled:opacity-50"
		rows="3"
	></textarea>
	<div class="mt-1 text-right text-[var(--text-tiny)] text-slate-400">{value.length}/1000</div>
</div>
