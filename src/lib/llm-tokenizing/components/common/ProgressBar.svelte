<!-- ABOUTME: Reusable progress bar for tokenizer visualizers.
     ABOUTME: Shows current step progress with customizable color. -->
<script>
	let { currentStep = 0, totalSteps = 0, color = 'bg-purple-500' } = $props();

	let progress = $derived(totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0);
</script>

<div class="mb-4 h-1.5 rounded-full bg-slate-700">
	<div
		class="h-full {color} rounded-full transition-all duration-300"
		style="width: {progress}%"
	></div>
</div>
