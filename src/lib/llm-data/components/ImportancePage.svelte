<script>
	// Historical timeline data
	const timeline = [
		{
			year: '2018',
			model: 'BERT',
			data: 'BooksCorpus + Wikipedia',
			tokens: '3.3B',
			icon: '📚',
			link: 'https://arxiv.org/abs/1810.04805'
		},
		{
			year: '2019',
			model: 'GPT-2',
			data: 'WebText (Reddit links)',
			tokens: '~8B',
			icon: '🔗',
			link: 'https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf'
		},
		{
			year: '2020',
			model: 'GPT-3',
			data: 'Common Crawl + Books + Wikipedia',
			tokens: '400B',
			icon: '🌐',
			link: 'https://arxiv.org/abs/2005.14165'
		},
		{
			year: '2020',
			model: 'The Pile',
			data: '22 curated domains',
			tokens: '825B',
			icon: '📦',
			link: 'https://arxiv.org/abs/2101.00027'
		},
		{
			year: '2023',
			model: 'LLaMA',
			data: 'CCNet + C4 + GitHub + Books3',
			tokens: '1.2T',
			icon: '🦙',
			link: 'https://arxiv.org/abs/2302.13971'
		},
		{
			year: '2024',
			model: 'OLMo',
			data: 'Dolma (DCLM + Stack + Reddit)',
			tokens: '3T',
			icon: '🔬',
			link: 'https://arxiv.org/abs/2402.00838'
		},
		{
			year: '2024',
			model: 'LLaMA 3',
			data: 'Proprietary mix',
			tokens: '15T',
			icon: '🚀',
			link: 'https://arxiv.org/abs/2407.21783'
		}
	];

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
	<div
		class="rounded-2xl border border-[var(--color-primary)]/30 bg-gradient-to-br from-[var(--color-primary)]/20 to-pink-600/20 p-8"
	>
		<div class="flex items-start gap-4">
			<div class="text-5xl">📊</div>
			<div>
				<h2 class="mb-3 text-2xl font-bold text-[var(--color-text)] md:text-3xl">
					Data is the Most Important Component
				</h2>
				<p class="max-w-3xl text-lg leading-relaxed text-[var(--color-muted)]">
					While companies disclose their architectures and training procedures in detail,
					<span class="font-semibold text-[var(--color-primary)]"
						>they rarely reveal their data</span
					>. LLaMA 3's paper simply states: "We create our dataset from a variety of data sources."
					This secrecy stems from competitive dynamics and legal concerns.
				</p>
				<div class="mt-4 flex flex-wrap gap-3">
					<span
						class="rounded-full bg-[var(--color-secondary)] px-3 py-1 text-sm text-[var(--color-accent)]"
					>
						Competitive Advantage
					</span>
					<span
						class="rounded-full bg-[var(--color-secondary)] px-3 py-1 text-sm text-[var(--color-accent)]"
					>
						Legal Protection
					</span>
					<span
						class="rounded-full bg-[var(--color-secondary)] px-3 py-1 text-sm text-[var(--color-accent)]"
					>
						Parallelizable Work
					</span>
				</div>
			</div>
		</div>
	</div>

	<!-- Training Stages -->
	<div class="rounded-xl bg-[var(--color-secondary)] p-6">
		<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-primary)]">
			<span>🔄</span> Training Stages
		</h2>
		<p class="mb-6 text-[var(--color-muted)]">
			Models progress through stages: large amounts of low-quality data early, smaller amounts of
			high-quality data later.
		</p>
		<div class="grid gap-4 md:grid-cols-3">
			{#each trainingStages as stage (stage.name)}
				<div
					class="rounded-lg border border-[var(--color-muted)]/20 bg-[var(--color-bg)] p-5 transition-colors hover:border-[var(--color-primary)]/50"
				>
					<div class="mb-3 flex items-center gap-3">
						<span class="text-3xl">{stage.icon}</span>
						<div>
							<h3 class="font-bold text-[var(--color-text)]">{stage.name}</h3>
							<span class="text-sm text-[var(--color-accent)]">{stage.tokens}</span>
						</div>
					</div>
					<p class="mb-3 text-sm text-[var(--color-muted)]">{stage.description}</p>
					<div class="flex flex-wrap gap-1">
						{#each stage.sources as source, i (i)}
							<span
								class="rounded bg-[var(--color-secondary)] px-2 py-0.5 text-xs text-[var(--color-text)]/70"
							>
								{source}
							</span>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Copyright & Legal -->
	<div class="rounded-xl bg-[var(--color-secondary)] p-6">
		<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-primary)]">
			<span>⚖️</span> Copyright & Legal Considerations
		</h2>
		<p class="mb-6 text-[var(--color-muted)]">
			Copyright law (since 1976 in the US) applies to "original works of authorship fixed in a
			tangible medium." Registration is not required - most web content is automatically
			copyrighted.
		</p>
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each copyrightPoints as point (point.title)}
				<div class="rounded-lg border border-[var(--color-muted)]/20 bg-[var(--color-bg)] p-4">
					<div class="flex items-start gap-3">
						<span class="text-2xl">{point.icon}</span>
						<div>
							<h4 class="mb-1 text-sm font-semibold text-[var(--color-text)]">{point.title}</h4>
							<p class="text-xs text-[var(--color-muted)]">{point.desc}</p>
						</div>
					</div>
				</div>
			{/each}
		</div>
		<div class="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
			<p class="text-sm text-amber-200">
				<span class="font-semibold">Fair Use factors:</span> Purpose (educational vs commercial), nature
				of work (factual vs fictional), amount used, and effect on market. Training ML models may be considered
				"transformative use," but this is actively being litigated.
			</p>
		</div>
	</div>

	<!-- Scaling & Token Counts -->
	<div class="rounded-xl bg-[var(--color-secondary)] p-6">
		<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-primary)]">
			<span>📈</span> Data Scaling Insights
		</h2>
		<div class="grid items-start gap-6 md:grid-cols-2">
			<div class="flex h-full flex-col">
				<h3 class="mb-2 font-semibold text-[var(--color-text)]">Chinchilla Scaling Laws</h3>
				<p class="mb-3 min-h-[2.5rem] text-sm text-[var(--color-muted)]">
					Optimal training: balance model size with tokens. Train on ~20N tokens for N parameters.
				</p>
				<div class="flex-1 rounded-lg bg-[var(--color-bg)] p-3">
					<div class="space-y-2 text-xs">
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
				</div>
			</div>
			<div class="flex h-full flex-col">
				<h3 class="mb-2 font-semibold text-[var(--color-text)]">Why Filter Aggressively?</h3>
				<p class="mb-3 min-h-[2.5rem] text-sm text-[var(--color-muted)]">
					Common Crawl has 240T+ raw tokens, but quality matters more than quantity.
				</p>
				<div class="flex-1 rounded-lg bg-[var(--color-bg)] p-3">
					<div class="space-y-2 text-xs text-[var(--color-muted)]">
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
				</div>
			</div>
		</div>
	</div>

	<!-- Historical Timeline -->
	<div class="rounded-xl bg-[var(--color-secondary)] p-6">
		<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-primary)]">
			<span>📅</span> Historical Evolution of Training Data
		</h2>
		<div class="relative">
			<!-- Timeline line -->
			<div
				class="absolute top-0 bottom-0 left-6 w-0.5 bg-gradient-to-b from-[var(--color-primary)] to-pink-600"
			></div>

			<div class="space-y-4">
				{#each timeline as item (item.model)}
					<div class="relative flex items-center gap-4 pl-14">
						<!-- Timeline dot -->
						<div
							class="absolute left-4 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[var(--color-primary)] bg-[var(--color-bg)]"
						>
							<div class="h-2 w-2 rounded-full bg-[var(--color-primary)]"></div>
						</div>

						<a
							href={item.link}
							target="_blank"
							rel="noopener noreferrer external"
							class="group flex-1 rounded-lg border border-[var(--color-muted)]/20 bg-[var(--color-bg)] p-4 transition-colors hover:border-[var(--color-primary)]/40"
						>
							<div class="grid grid-cols-[auto_1fr_auto_auto] items-center gap-4">
								<!-- Year -->
								<span class="font-mono text-sm text-[var(--color-accent)]">{item.year}</span>
								<!-- Model -->
								<div class="flex items-center gap-2">
									<span class="text-xl">{item.icon}</span>
									<span
										class="font-bold text-[var(--color-text)] transition-colors group-hover:text-[var(--color-primary)]"
										>{item.model}</span
									>
									<span class="hidden text-xs text-[var(--color-muted)] sm:inline"
										>— {item.data}</span
									>
								</div>
								<!-- Tokens -->
								<span
									class="rounded bg-[var(--color-primary)]/20 px-2 py-0.5 font-mono text-sm text-[var(--color-primary)]"
								>
									{item.tokens}
								</span>
								<!-- Link arrow -->
								<span
									class="text-[var(--color-muted)] transition-colors group-hover:text-[var(--color-primary)]"
									>↗</span
								>
							</div>
						</a>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- Key Takeaways -->
	<div
		class="rounded-xl border border-[var(--color-primary)]/20 bg-gradient-to-br from-[var(--color-primary)]/10 to-pink-600/10 p-6"
	>
		<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-text)]">
			<span>💡</span> Key Takeaways
		</h2>
		<div class="grid gap-4 sm:grid-cols-2">
			<div class="flex items-start gap-3">
				<div
					class="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)]/20 text-sm font-bold text-[var(--color-primary)]"
				>
					1
				</div>
				<p class="text-sm text-[var(--color-muted)]">
					<span class="font-semibold text-[var(--color-text)]">Data doesn't fall from the sky.</span
					>
					Live services must be scraped, dumped, and heavily processed.
				</p>
			</div>
			<div class="flex items-start gap-3">
				<div
					class="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)]/20 text-sm font-bold text-[var(--color-primary)]"
				>
					2
				</div>
				<p class="text-sm text-[var(--color-muted)]">
					<span class="font-semibold text-[var(--color-text)]">Data differentiates models.</span>
					Architectures are standardized; data curation is the competitive edge.
				</p>
			</div>
			<div class="flex items-start gap-3">
				<div
					class="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)]/20 text-sm font-bold text-[var(--color-primary)]"
				>
					3
				</div>
				<p class="text-sm text-[var(--color-muted)]">
					<span class="font-semibold text-[var(--color-text)]">Quality over quantity.</span>
					Aggressive filtering (keeping ~1-5%) produces better models than using everything.
				</p>
			</div>
			<div class="flex items-start gap-3">
				<div
					class="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)]/20 text-sm font-bold text-[var(--color-primary)]"
				>
					4
				</div>
				<p class="text-sm text-[var(--color-muted)]">
					<span class="font-semibold text-[var(--color-text)]">The field is messy.</span>
					No formal principles - lots of heuristics, which means opportunities for improvement.
				</p>
			</div>
		</div>
	</div>
</div>
