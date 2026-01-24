<!-- ABOUTME: Historical timeline of LLM training data evolution -->
<!-- ABOUTME: Shows progression from BERT to modern models -->

<script>
	import { HeroSection, Timeline } from '$lib/shared';

	// Historical timeline data - mapped to Timeline component format
	const timelineEvents = [
		{
			year: '2018',
			title: 'BERT',
			description: 'BooksCorpus + Wikipedia for pre-training',
			badge: '3.3B tokens',
			link: 'https://arxiv.org/abs/1810.04805'
		},
		{
			year: '2019',
			title: 'GPT-2',
			description: 'WebText dataset from Reddit links',
			badge: '~8B tokens',
			link: 'https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf'
		},
		{
			year: '2020',
			title: 'GPT-3',
			description: 'Common Crawl + Books + Wikipedia mix',
			badge: '400B tokens',
			link: 'https://arxiv.org/abs/2005.14165'
		},
		{
			year: '2020',
			title: 'The Pile',
			description: '22 curated domains for open research',
			badge: '825B tokens',
			link: 'https://arxiv.org/abs/2101.00027'
		},
		{
			year: '2023',
			title: 'LLaMA',
			description: 'CCNet + C4 + GitHub + Books3',
			badge: '1.2T tokens',
			link: 'https://arxiv.org/abs/2302.13971'
		},
		{
			year: '2024',
			title: 'OLMo',
			description: 'Dolma: fully open and reproducible',
			badge: '3T tokens',
			link: 'https://arxiv.org/abs/2402.00838'
		},
		{
			year: '2024',
			title: 'LLaMA 3',
			description: 'Proprietary mix with aggressive filtering',
			badge: '15T tokens',
			link: 'https://arxiv.org/abs/2407.21783'
		}
	];
</script>

<div class="space-y-4">
	<HeroSection title="Training Data Timeline">
		<p class="mt-2 leading-relaxed text-[var(--color-muted)] text-[var(--text-small)]">
			The evolution of LLM training data from early models to modern systems. Token counts have
			grown from billions to trillions as the field has scaled.
		</p>
	</HeroSection>

	<Timeline events={timelineEvents} />
</div>
