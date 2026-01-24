<script>
	import { HeroSection, Section, ContentBox, KeyTakeaway } from '$lib/shared';

	// Training stages
	const trainingStages = [
		{
			name: 'Pre-training',
			tokens: '~3-15T tokens',
			description: 'Train on raw data, usually from the web. Large amounts of low-quality data.',
			sources: ['Common Crawl', 'Wikipedia', 'Books', 'Code'],
			icon: '🏗️'
		},
		{
			name: 'Mid-training',
			tokens: '~10-100B tokens',
			description: 'Curate smaller set of high-quality documents targeting specific capabilities.',
			sources: ['Filtered web', 'Math data', 'Long context', 'Synthetic data'],
			icon: '🎯'
		},
		{
			name: 'Post-training',
			tokens: '~1-10B tokens',
			description: 'Fine-tune on instruction-following, chat data, or do RLHF for alignment.',
			sources: ['Instruction data', 'Chat logs', 'Human feedback', 'Safety data'],
			icon: '✨'
		}
	];

	// Copyright considerations
	const copyrightPoints = [
		{
			icon: '📋',
			title: 'Most web content is copyrighted',
			desc: 'Registration not required - created works are automatically protected'
		},
		{
			icon: '⚖️',
			title: 'Fair Use defense',
			desc: 'Transformative use, educational purpose, and market impact are key factors'
		},
		{
			icon: '📄',
			title: 'Licenses matter',
			desc: 'Creative Commons, permissive code licenses (MIT, Apache) enable legal use'
		},
		{
			icon: '🤝',
			title: 'Data licensing deals',
			desc: 'Google-Reddit, OpenAI-Shutterstock - companies pay for access'
		},
		{
			icon: '⚠️',
			title: 'Terms of Service',
			desc: 'Even CC content may violate platform ToS when scraped (e.g., YouTube)'
		}
	];
</script>

<div class="space-y-6">
	<!-- Hero Section -->
	<HeroSection title="Data is the Most Important Component">
		<p class="max-w-3xl leading-relaxed text-[var(--color-muted)] text-[var(--text-body)]">
			While companies disclose their architectures and training procedures in detail,
			<span class="font-semibold text-[var(--color-primary)]">they rarely reveal their data</span>.
			LLaMA 3's paper simply states: "We create our dataset from a variety of data sources." This
			secrecy stems from competitive dynamics and legal concerns.
		</p>
		<div class="mt-4 flex flex-wrap gap-3">
			<span
				class="rounded-full bg-[var(--color-secondary)] px-3 py-1 text-[var(--color-accent)] text-[var(--text-small)]"
			>
				Competitive Advantage
			</span>
			<span
				class="rounded-full bg-[var(--color-secondary)] px-3 py-1 text-[var(--color-accent)] text-[var(--text-small)]"
			>
				Legal Protection
			</span>
			<span
				class="rounded-full bg-[var(--color-secondary)] px-3 py-1 text-[var(--color-accent)] text-[var(--text-small)]"
			>
				Parallelizable Work
			</span>
		</div>
	</HeroSection>

	<!-- Training Stages -->
	<Section title="🔄 Training Stages">
		<p class="mb-6 text-[var(--color-muted)] text-[var(--text-small)]">
			Models progress through stages: large amounts of low-quality data early, smaller amounts of
			high-quality data later.
		</p>
		<div class="grid gap-4 md:grid-cols-3">
			{#each trainingStages as stage (stage.name)}
				<ContentBox variant="dark" class="transition-colors hover:border-[var(--color-primary)]/50">
					<div class="mb-3 flex items-center gap-3">
						<span class="text-3xl">{stage.icon}</span>
						<div>
							<h3 class="font-bold text-[var(--color-primary)]">{stage.name}</h3>
							<span class="text-[var(--color-accent)] text-[var(--text-small)]">{stage.tokens}</span
							>
						</div>
					</div>
					<p class="mb-3 text-[var(--color-muted)] text-[var(--text-small)]">{stage.description}</p>
					<div class="flex flex-wrap gap-1">
						{#each stage.sources as source, i (i)}
							<span
								class="rounded bg-[var(--color-secondary)] px-2 py-0.5 text-[var(--color-text)]/70 text-[var(--text-tiny)]"
							>
								{source}
							</span>
						{/each}
					</div>
				</ContentBox>
			{/each}
		</div>
	</Section>

	<!-- Copyright & Legal -->
	<Section title="⚖️ Copyright & Legal Considerations">
		<p class="mb-6 text-[var(--color-muted)] text-[var(--text-small)]">
			Copyright law (since 1976 in the US) applies to "original works of authorship fixed in a
			tangible medium." Registration is not required - most web content is automatically
			copyrighted.
		</p>
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each copyrightPoints as point (point.title)}
				<ContentBox variant="dark">
					<div class="flex items-start gap-3">
						<span class="text-2xl">{point.icon}</span>
						<div>
							<h4 class="mb-1 font-semibold text-[var(--color-primary)] text-[var(--text-small)]">
								{point.title}
							</h4>
							<p class="text-[var(--color-muted)] text-[var(--text-tiny)]">{point.desc}</p>
						</div>
					</div>
				</ContentBox>
			{/each}
		</div>
		<KeyTakeaway title="Fair Use factors" class="mt-4">
			<p>
				Purpose (educational vs commercial), nature of work (factual vs fictional), amount used, and
				effect on market. Training ML models may be considered "transformative use," but this is
				actively being litigated.
			</p>
		</KeyTakeaway>
	</Section>

	<!-- Scaling & Token Counts -->
	<Section title="📈 Data Scaling Insights">
		<div class="grid items-start gap-6 md:grid-cols-2">
			<div class="flex h-full flex-col">
				<h3 class="mb-2 font-semibold text-[var(--color-text)]">Chinchilla Scaling Laws</h3>
				<p class="mb-3 min-h-[2.5rem] text-[var(--color-muted)] text-[var(--text-small)]">
					Optimal training: balance model size with tokens. Train on ~20N tokens for N parameters.
				</p>
				<ContentBox variant="dark" class="flex-1">
					<div class="space-y-2 text-[var(--text-tiny)]">
						<div class="flex justify-between text-[var(--color-muted)]">
							<span>7B model</span>
							<span class="font-mono text-[var(--color-text)]">~140B tokens optimal</span>
						</div>
						<div class="flex justify-between text-[var(--color-muted)]">
							<span>70B model</span>
							<span class="font-mono text-[var(--color-text)]">~1.4T tokens optimal</span>
						</div>
						<div class="flex justify-between text-[var(--color-muted)]">
							<span>405B model (LLaMA 3)</span>
							<span class="font-mono text-[var(--color-text)]">~15T tokens (overtrained)</span>
						</div>
					</div>
				</ContentBox>
			</div>
			<div class="flex h-full flex-col">
				<h3 class="mb-2 font-semibold text-[var(--color-text)]">Why Filter Aggressively?</h3>
				<p class="mb-3 min-h-[2.5rem] text-[var(--color-muted)] text-[var(--text-small)]">
					Common Crawl has 240T+ raw tokens, but quality matters more than quantity.
				</p>
				<ContentBox variant="dark" class="flex-1">
					<div class="space-y-2 text-[var(--color-muted)] text-[var(--text-tiny)]">
						<div class="flex justify-between">
							<span>DCLM vs FineWeb</span>
							<span class="font-mono text-[var(--color-text)]">+4% with aggressive filtering</span>
						</div>
						<div class="flex justify-between">
							<span>Nemotron approach</span>
							<span class="font-mono text-[var(--color-text)]">LLM-scored "educational value"</span>
						</div>
						<div class="flex justify-between">
							<span>Trafilatura vs WET</span>
							<span class="font-mono text-[var(--color-text)]">+4% better extraction</span>
						</div>
					</div>
				</ContentBox>
			</div>
		</div>
	</Section>

	<KeyTakeaway
		items={[
			"Data doesn't fall from the sky. Live services must be scraped, dumped, and heavily processed.",
			'Data differentiates models. Architectures are standardized; data curation is the competitive edge.',
			'Quality over quantity. Aggressive filtering (keeping ~1-5%) produces better models than using everything.',
			'The field is messy. No formal principles - lots of heuristics, which means opportunities for improvement.'
		]}
	/>
</div>
