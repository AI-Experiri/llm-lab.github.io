<!-- ABOUTME: Historical timeline of scaling laws research -->
<!-- ABOUTME: Shows evolution from early learning curves to modern scaling strategies -->

<script>
	import { HeroSection, Timeline } from '$lib/shared';

	const timelineEvents = [
		{
			year: '1993',
			title: 'Bell Labs Learning Curves',
			description:
				'Early scaling law research showing test error could be predicted without full training. Demonstrated predictable learning curves.',
			badge: 'Vapnik, Cortes'
		},
		{
			year: '2001',
			title: 'NLP Scaling Studies',
			description:
				'Demonstrated NLP systems scale predictably with data. Showed language models follow consistent improvement patterns.',
			badge: 'Bengio, Brill'
		},
		{
			year: '2012',
			title: 'Power Law Forms Established',
			description:
				'Power law functional forms established as predictable across neural network architectures and tasks.',
			badge: 'Various'
		},
		{
			year: '2017',
			title: 'Deep Learning Scaling',
			description:
				'Large-scale neural network scaling laws showing three regions: best guess, power law, and asymptotic.',
			badge: 'Hestness et al.',
			link: 'https://arxiv.org/abs/1712.00409'
		},
		{
			year: '2020',
			title: 'Kaplan Scaling Laws',
			description:
				'Foundational paper on scaling laws for neural language models. Established relationships between loss, compute, data, and parameters.',
			badge: 'OpenAI',
			link: 'https://arxiv.org/abs/2001.08361'
		},
		{
			year: '2022',
			title: 'Chinchilla',
			description:
				'Training compute-optimal large language models. Showed previous models were undertrained, proposed ~20 tokens per parameter ratio.',
			badge: 'DeepMind',
			link: 'https://arxiv.org/abs/2203.15556'
		},
		{
			year: '2022',
			title: 'muP (Tensor Programs V)',
			description:
				'Maximum Update Parametrization enabling zero-shot hyperparameter transfer from small to large models.',
			badge: 'Microsoft',
			link: 'https://arxiv.org/abs/2203.03466'
		},
		{
			year: '2023',
			title: 'Cerebras-GPT',
			description:
				'First family of models trained following Chinchilla scaling laws. Demonstrated practical application of compute-optimal training.',
			badge: 'Cerebras',
			link: 'https://arxiv.org/abs/2304.03208'
		},
		{
			year: '2024',
			title: 'MiniCPM & DeepSeek',
			description:
				'Modern scaling law applications with learning rate scheduling innovations and optimal batch size strategies.',
			badge: 'Various',
			link: 'https://arxiv.org/abs/2404.06395'
		}
	];
</script>

<div class="space-y-4">
	<HeroSection title="Scaling Laws Timeline">
		<p class="mt-2 leading-relaxed text-[var(--color-muted)] text-[var(--text-small)]">
			The evolution of neural network scaling laws from early learning curve research to modern
			compute-optimal training strategies. Each milestone brought new insights for training larger
			and more efficient models.
		</p>
	</HeroSection>

	<Timeline events={timelineEvents} />
</div>
