<script>
	const timeline = [
		{
			year: '1993',
			title: 'Bell Labs Paper',
			authors: 'Vapnik, Cortes',
			description:
				'Early scaling law research showing test error could be predicted without full training. Demonstrated predictable learning curves.',
			link: null
		},
		{
			year: '2001',
			title: 'NLP Scaling Studies',
			authors: 'Bengio, Brill',
			description:
				'Demonstrated NLP systems scale predictably with data. Showed language models follow consistent improvement patterns.',
			link: null
		},
		{
			year: '2012',
			title: 'Power Law Forms',
			authors: 'Various',
			description:
				'Power law functional forms established as predictable across neural network architectures and tasks.',
			link: null
		},
		{
			year: '2017',
			title: 'Deep Learning Scaling',
			authors: 'Hestness et al.',
			description:
				'Large-scale neural network scaling laws showing three regions: best guess, power law, and asymptotic.',
			link: 'https://arxiv.org/abs/1712.00409'
		},
		{
			year: '2020',
			title: 'Kaplan Scaling Laws',
			authors: 'Kaplan et al. (OpenAI)',
			description:
				'Foundational paper on scaling laws for neural language models. Established relationships between loss, compute, data, and parameters.',
			link: 'https://arxiv.org/abs/2001.08361'
		},
		{
			year: '2022',
			title: 'Chinchilla',
			authors: 'Hoffmann et al. (DeepMind)',
			description:
				'Training compute-optimal large language models. Showed previous models were undertrained, proposed ~20 tokens per parameter ratio.',
			link: 'https://arxiv.org/abs/2203.15556'
		},
		{
			year: '2022',
			title: 'muP (Tensor Programs V)',
			authors: 'Yang et al. (Microsoft)',
			description:
				'Maximum Update Parametrization enabling zero-shot hyperparameter transfer from small to large models.',
			link: 'https://arxiv.org/abs/2203.03466'
		}
	];
</script>

<div class="space-y-8">
	<!-- Section Header -->
	<section
		class="rounded-2xl border border-[var(--color-primary)]/30 bg-gradient-to-br from-[var(--color-primary)]/20 to-pink-600/20 p-8"
	>
		<div class="flex items-start gap-4">
			<div class="text-4xl">📚</div>
			<div>
				<h2 class="mb-2 font-bold text-[var(--color-text)] text-[var(--text-h2)]">
					Foundations of Scaling Laws
				</h2>
				<p class="text-lg text-[var(--color-muted)]">
					The historical development of neural network scaling laws, from early learning curve
					research to modern compute-optimal training strategies.
				</p>
			</div>
		</div>
	</section>

	<!-- Historical Timeline -->
	<section class="rounded-xl border border-[var(--color-muted)]/20 bg-[var(--color-secondary)] p-6">
		<h3 class="mb-6 text-xl font-semibold text-[var(--color-text)]">Historical Timeline</h3>
		<div class="relative">
			<!-- Timeline line -->
			<div class="absolute top-0 bottom-0 left-[5.5rem] w-0.5 bg-[var(--color-muted)]/30"></div>

			<div class="space-y-6">
				{#each timeline as event (event.year + event.title)}
					<div class="flex gap-4">
						<div class="w-20 flex-shrink-0 text-right">
							<span class="font-bold text-[var(--color-accent)]">{event.year}</span>
						</div>
						<div class="relative">
							<div
								class="absolute top-2 left-0 h-3 w-3 -translate-x-1/2 rounded-full bg-[var(--color-primary)]"
							></div>
							<div
								class="ml-6 rounded-lg border border-[var(--color-muted)]/20 bg-[var(--color-bg)] p-4"
							>
								<h4 class="font-semibold text-[var(--color-text)]">{event.title}</h4>
								<p class="mb-2 text-sm text-[var(--color-muted)]">{event.authors}</p>
								<p class="text-sm text-[var(--color-muted)]">{event.description}</p>
								{#if event.link}
									<a
										href={event.link}
										target="_blank"
										rel="noopener noreferrer external"
										class="mt-2 inline-block text-sm text-[var(--color-accent)] hover:underline"
									>
										Read Paper
									</a>
								{/if}
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</section>
</div>
