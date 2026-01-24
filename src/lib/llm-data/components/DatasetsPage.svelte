<script>
	import { HeroSection, Section } from '$lib/shared';

	// Tier 1: Raw Data Sources (minimal processing)
	const rawSources = [
		{
			name: 'Common Crawl',
			icon: '🌐',
			desc: 'Established in 2007, performs monthly web crawls. Each crawl contains ~2.7 billion pages.',
			stats: [
				{ label: 'Total crawls', value: '~100+' },
				{ label: 'Raw tokens', value: '240T+' },
				{ label: 'After filtering', value: '3-15T' },
				{ label: 'Filter rate', value: '~1-5%' }
			],
			note: 'Common Crawl is not "the internet" - it deliberately incomplete and respects robots.txt.'
		},
		{
			name: 'Wikipedia',
			icon: '📖',
			desc: 'High-quality encyclopedic content with citations. Used both as training data and as a quality signal for filtering.',
			pros: [
				'No original thought - all content cited',
				'Notability requirement (multiple sources)'
			],
			cons: ['No opinions, recipes, or personal pages', 'Vulnerable to data poisoning attacks']
		},
		{
			name: 'GitHub / The Stack',
			icon: '💻',
			desc: 'Code helps with programming tasks and is believed to improve general reasoning capabilities.',
			pros: ['Clear licensing (MIT, Apache, etc.)', 'The Stack: 3.1TB of permissive code'],
			notes: ['Includes issues, commits, not just code', 'Many duplicates require deduplication']
		},
		{
			name: 'Books',
			icon: '📚',
			desc: 'Long-form content with coherent narratives. Important for long-context understanding.',
			sources: [
				{ name: 'Project Gutenberg (public domain)', count: '~75K books' },
				{ name: 'BooksCorpus (Smashwords, taken down)', count: '~7K books' },
				{ name: 'Books3 (LibGen, copyright issues)', count: '~196K books' },
				{ name: 'Shadow libraries (LibGen)', count: '~4M books', warning: true }
			]
		},
		{
			name: 'Academic Papers',
			icon: '📄',
			desc: 'Scientific literature from arXiv, PubMed Central, and Semantic Scholar. High-quality technical content.',
			sources: [
				{ name: 'arXiv', count: '2M+ papers' },
				{ name: 'PubMed Central', count: '8M+ papers' },
				{ name: 'Semantic Scholar', count: '200M+ papers' }
			],
			note: 'Often used in mid-training for math and science capabilities.'
		},
		{
			name: 'Stack Exchange',
			icon: '💬',
			desc: 'Q&A data with community votes and metadata. Includes Stack Overflow and 170+ other sites.',
			sources: [
				{ name: 'Questions', count: '23M+' },
				{ name: 'Answers', count: '35M+' },
				{ name: 'Sites', count: '170+' }
			],
			note: 'Vote scores provide natural quality signals for filtering.'
		}
	];

	// Tier 2: Filtered Web Datasets (single source + filtering)
	const filteredDatasets = [
		{
			name: 'CCNet',
			year: 2019,
			org: 'Facebook',
			tokens: '~100B',
			desc: 'Common Crawl + language ID + perplexity filtering using KenLM',
			link: 'https://arxiv.org/abs/1911.00359'
		},
		{
			name: 'C4',
			year: 2019,
			org: 'Google',
			tokens: '156B',
			desc: 'Colossal Clean Crawled Corpus - rule-based filtering (bad words, dedup)',
			link: 'https://arxiv.org/abs/1910.10683'
		},
		{
			name: 'OSCAR',
			year: 2019,
			org: 'Inria',
			tokens: '~300B',
			desc: 'Language-classified Common Crawl with 166 languages',
			link: 'https://oscar-project.org/'
		},
		{
			name: 'RefinedWeb',
			year: 2023,
			org: 'Falcon/TII',
			tokens: '5T',
			desc: 'Web-only with aggressive deduplication and Trafilatura extraction',
			link: 'https://arxiv.org/abs/2306.01116'
		},
		{
			name: 'FineWeb',
			year: 2024,
			org: 'HuggingFace',
			tokens: '15T',
			desc: 'All 96 Common Crawl dumps (2013-2024), lightly filtered',
			link: 'https://huggingface.co/datasets/HuggingFaceFW/fineweb'
		},
		{
			name: 'FineWeb-Edu',
			year: 2024,
			org: 'HuggingFace',
			tokens: '1.3T',
			desc: 'FineWeb filtered by educational quality classifier',
			link: 'https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu'
		}
	];

	// Tier 3: Combined/Curated Datasets
	const combinedDatasets = [
		{
			name: 'The Pile',
			year: 2020,
			org: 'EleutherAI',
			tokens: '825B',
			desc: '22 diverse high-quality domains including books, academic, code',
			link: 'https://arxiv.org/abs/2101.00027'
		},
		{
			name: 'RedPajama',
			year: 2023,
			org: 'Together',
			tokens: '1.2T',
			desc: 'Open reproduction of LLaMA training dataset',
			link: 'https://github.com/togethercomputer/RedPajama-Data'
		},
		{
			name: 'Dolma',
			year: 2024,
			org: 'AI2',
			tokens: '3T',
			desc: 'Fully reproducible, 6 sources including CC, Wikipedia, code',
			link: 'https://arxiv.org/abs/2402.00159'
		},
		{
			name: 'DCLM',
			year: 2024,
			org: 'DataComp',
			tokens: '3.8T',
			desc: 'Model-based quality filtering benchmark winner (+4% over FineWeb)',
			link: 'https://arxiv.org/abs/2406.11794'
		},
		{
			name: 'Nemotron-CC',
			year: 2024,
			org: 'NVIDIA',
			tokens: '6.3T',
			desc: 'LLM-scored educational value + synthetic rephrasing',
			link: 'https://arxiv.org/abs/2406.11704'
		}
	];

	// Tier 4: Instruction/Post-training Data
	const instructionDatasets = [
		{
			name: 'FLAN',
			year: 2022,
			org: 'Google',
			size: '1.8K tasks',
			desc: 'Collection of 1,800+ NLP tasks with instructions',
			link: 'https://arxiv.org/abs/2109.01652'
		},
		{
			name: 'Alpaca',
			year: 2023,
			org: 'Stanford',
			size: '52K examples',
			desc: 'GPT-3.5 generated instruction-following data',
			link: 'https://github.com/tatsu-lab/stanford_alpaca'
		},
		{
			name: 'OASST',
			year: 2023,
			org: 'Open Assistant',
			size: '160K messages',
			desc: 'Human-generated multi-turn conversations',
			link: 'https://huggingface.co/datasets/OpenAssistant/oasst1'
		},
		{
			name: 'UltraChat',
			year: 2023,
			org: 'Tsinghua',
			size: '1.5M dialogues',
			desc: 'Large-scale multi-turn dialogue dataset',
			link: 'https://arxiv.org/abs/2305.14233'
		},
		{
			name: 'ShareGPT',
			year: 2023,
			org: 'Community',
			size: '~90K convos',
			desc: 'User-shared ChatGPT conversations (unofficial)',
			link: 'https://huggingface.co/datasets/anon8231489123/ShareGPT_Vicuna_unfiltered'
		}
	];
</script>

<div class="space-y-6">
	<!-- Hero Section -->
	<HeroSection icon="📦" title="LLM Training Datasets">
		<p class="max-w-3xl leading-relaxed text-[var(--color-muted)] text-[var(--text-body)]">
			Explore the datasets used to train large language models, organized from raw sources to
			instruction data. Understanding this pipeline is key to understanding modern AI.
		</p>
		<div class="mt-4 flex flex-wrap gap-2 text-[var(--text-tiny)]">
			<span
				class="rounded-full border border-violet-500/30 bg-violet-500/20 px-3 py-1 text-violet-300"
				>1. Raw Sources</span
			>
			<span class="text-[var(--color-muted)]">→</span>
			<span class="rounded-full border border-cyan-500/30 bg-cyan-500/20 px-3 py-1 text-cyan-300"
				>2. Filtered Web</span
			>
			<span class="text-[var(--color-muted)]">→</span>
			<span
				class="rounded-full border border-emerald-500/30 bg-emerald-500/20 px-3 py-1 text-emerald-300"
				>3. Combined</span
			>
			<span class="text-[var(--color-muted)]">→</span>
			<span class="rounded-full border border-amber-500/30 bg-amber-500/20 px-3 py-1 text-amber-300"
				>4. Instruction</span
			>
		</div>
	</HeroSection>

	<!-- TIER 1: Raw Data Sources -->
	<div class="space-y-4">
		<div class="flex items-center gap-3">
			<span
				class="rounded-full border border-violet-500/30 bg-violet-500/20 px-3 py-1 font-medium text-[var(--text-small)] text-violet-300"
				>Tier 1</span
			>
			<h2 class="font-bold text-[var(--color-text)] text-[var(--text-h2)]">Raw Data Sources</h2>
			<span class="text-[var(--color-muted)] text-[var(--text-small)]"
				>Individual sources with minimal processing</span
			>
		</div>

		<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each rawSources as source (source.name)}
				<div
					class="rounded-xl border border-violet-500/20 bg-[var(--color-secondary)] p-5 transition-colors hover:border-violet-500/40"
				>
					<h3 class="mb-2 flex items-center gap-2 text-lg font-bold text-[var(--color-primary)]">
						<span>{source.icon}</span>
						{source.name}
					</h3>
					<p class="mb-3 text-[var(--color-muted)] text-[var(--text-small)]">{source.desc}</p>

					{#if source.stats}
						<div class="mb-2 rounded-lg bg-[var(--color-bg)] p-3">
							<div class="grid grid-cols-2 gap-2 text-[var(--text-tiny)]">
								{#each source.stats as stat (stat.label)}
									<div>
										<span class="text-[var(--color-muted)]">{stat.label}:</span>
										<span class="font-mono text-[var(--color-text)]"> {stat.value}</span>
									</div>
								{/each}
							</div>
						</div>
					{/if}

					{#if source.pros || source.cons || source.notes}
						<div class="mb-2 rounded-lg bg-[var(--color-bg)] p-3">
							<ul class="space-y-1 text-[var(--color-muted)] text-[var(--text-tiny)]">
								{#if source.pros}
									{#each source.pros as pro, i (i)}
										<li class="flex items-start gap-2">
											<span class="text-[var(--color-accent)]">+</span>
											<span>{pro}</span>
										</li>
									{/each}
								{/if}
								{#if source.cons}
									{#each source.cons as con, i (i)}
										<li class="flex items-start gap-2">
											<span class="text-amber-400">-</span>
											<span>{con}</span>
										</li>
									{/each}
								{/if}
								{#if source.notes}
									{#each source.notes as note, i (i)}
										<li class="flex items-start gap-2">
											<span class="text-amber-400">!</span>
											<span>{note}</span>
										</li>
									{/each}
								{/if}
							</ul>
						</div>
					{/if}

					{#if source.sources}
						<div class="mb-2 rounded-lg bg-[var(--color-bg)] p-3">
							<div class="space-y-1.5 text-[var(--color-muted)] text-[var(--text-tiny)]">
								{#each source.sources as s (s.name)}
									<div class="flex justify-between {s.warning ? 'text-amber-400' : ''}">
										<span>{s.name}</span>
										<span class="font-mono {s.warning ? '' : 'text-[var(--color-text)]'}"
											>{s.count}</span
										>
									</div>
								{/each}
							</div>
						</div>
					{/if}

					{#if source.note}
						<p class="text-[var(--color-muted)] text-[var(--text-tiny)]">
							<span class="text-[var(--color-accent)]">Note:</span>
							{source.note}
						</p>
					{/if}
				</div>
			{/each}
		</div>
	</div>

	<!-- TIER 2: Filtered Web Datasets -->
	<div class="space-y-4">
		<div class="flex items-center gap-3">
			<span
				class="rounded-full border border-cyan-500/30 bg-cyan-500/20 px-3 py-1 font-medium text-[var(--text-small)] text-cyan-300"
				>Tier 2</span
			>
			<h2 class="font-bold text-[var(--color-text)] text-[var(--text-h2)]">
				Filtered Web Datasets
			</h2>
			<span class="text-[var(--color-muted)] text-[var(--text-small)]"
				>Single source + filtering/processing</span
			>
		</div>

		<Section class="border border-cyan-500/20">
			<p class="mb-4 text-[var(--color-muted)] text-[var(--text-small)]">
				These datasets take Common Crawl or similar web sources and apply various filtering
				techniques: language identification, perplexity filtering, deduplication, and quality
				classifiers.
			</p>
			<div class="overflow-x-auto">
				<table class="w-full text-[var(--text-small)]">
					<thead>
						<tr class="border-b border-[var(--color-muted)]/20 text-left text-[var(--color-muted)]">
							<th class="pr-4 pb-3">Dataset</th>
							<th class="pr-4 pb-3">Year</th>
							<th class="pr-4 pb-3">Organization</th>
							<th class="pr-4 pb-3">Size</th>
							<th class="pb-3">Description</th>
						</tr>
					</thead>
					<tbody class="text-[var(--color-text)]">
						{#each filteredDatasets as ds (ds.name)}
							<tr class="border-b border-[var(--color-muted)]/10 hover:bg-[var(--color-bg)]/50">
								<td class="py-3 pr-4">
									<a
										href={ds.link}
										target="_blank"
										rel="noopener noreferrer external"
										class="font-semibold text-cyan-400 transition-colors hover:text-cyan-300"
									>
										{ds.name} ↗
									</a>
								</td>
								<td class="py-3 pr-4 font-mono text-[var(--text-tiny)]">{ds.year}</td>
								<td class="py-3 pr-4">{ds.org}</td>
								<td class="py-3 pr-4 font-mono text-[var(--color-primary)]">{ds.tokens}</td>
								<td class="py-3 text-[var(--color-muted)] text-[var(--text-tiny)]">{ds.desc}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</Section>
	</div>

	<!-- TIER 3: Combined/Curated Datasets -->
	<div class="space-y-4">
		<div class="flex items-center gap-3">
			<span
				class="rounded-full border border-emerald-500/30 bg-emerald-500/20 px-3 py-1 font-medium text-[var(--text-small)] text-emerald-300"
				>Tier 3</span
			>
			<h2 class="font-bold text-[var(--color-text)] text-[var(--text-h2)]">
				Combined & Curated Datasets
			</h2>
			<span class="text-[var(--color-muted)] text-[var(--text-small)]"
				>Multiple sources aggregated with curation</span
			>
		</div>

		<Section class="border border-emerald-500/20">
			<p class="mb-4 text-[var(--color-muted)] text-[var(--text-small)]">
				These datasets combine multiple sources (web, books, code, academic papers) with careful
				curation and mixing ratios. They represent the state-of-the-art for pre-training data.
			</p>
			<div class="overflow-x-auto">
				<table class="w-full text-[var(--text-small)]">
					<thead>
						<tr class="border-b border-[var(--color-muted)]/20 text-left text-[var(--color-muted)]">
							<th class="pr-4 pb-3">Dataset</th>
							<th class="pr-4 pb-3">Year</th>
							<th class="pr-4 pb-3">Organization</th>
							<th class="pr-4 pb-3">Size</th>
							<th class="pb-3">Description</th>
						</tr>
					</thead>
					<tbody class="text-[var(--color-text)]">
						{#each combinedDatasets as ds (ds.name)}
							<tr class="border-b border-[var(--color-muted)]/10 hover:bg-[var(--color-bg)]/50">
								<td class="py-3 pr-4">
									<a
										href={ds.link}
										target="_blank"
										rel="noopener noreferrer external"
										class="font-semibold text-emerald-400 transition-colors hover:text-emerald-300"
									>
										{ds.name} ↗
									</a>
								</td>
								<td class="py-3 pr-4 font-mono text-[var(--text-tiny)]">{ds.year}</td>
								<td class="py-3 pr-4">{ds.org}</td>
								<td class="py-3 pr-4 font-mono text-[var(--color-primary)]">{ds.tokens}</td>
								<td class="py-3 text-[var(--color-muted)] text-[var(--text-tiny)]">{ds.desc}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</Section>
	</div>

	<!-- TIER 4: Instruction/Post-training Data -->
	<div class="space-y-4">
		<div class="flex items-center gap-3">
			<span
				class="rounded-full border border-amber-500/30 bg-amber-500/20 px-3 py-1 font-medium text-[var(--text-small)] text-amber-300"
				>Tier 4</span
			>
			<h2 class="font-bold text-[var(--color-text)] text-[var(--text-h2)]">
				Instruction & Post-training Data
			</h2>
			<span class="text-[var(--color-muted)] text-[var(--text-small)]"
				>Fine-tuning for instruction following</span
			>
		</div>

		<Section class="border border-amber-500/20">
			<p class="mb-4 text-[var(--color-muted)] text-[var(--text-small)]">
				Smaller, high-quality datasets used for supervised fine-tuning (SFT) and RLHF. These teach
				models to follow instructions and engage in helpful conversations.
			</p>
			<div class="overflow-x-auto">
				<table class="w-full text-[var(--text-small)]">
					<thead>
						<tr class="border-b border-[var(--color-muted)]/20 text-left text-[var(--color-muted)]">
							<th class="pr-4 pb-3">Dataset</th>
							<th class="pr-4 pb-3">Year</th>
							<th class="pr-4 pb-3">Organization</th>
							<th class="pr-4 pb-3">Size</th>
							<th class="pb-3">Description</th>
						</tr>
					</thead>
					<tbody class="text-[var(--color-text)]">
						{#each instructionDatasets as ds (ds.name)}
							<tr class="border-b border-[var(--color-muted)]/10 hover:bg-[var(--color-bg)]/50">
								<td class="py-3 pr-4">
									<a
										href={ds.link}
										target="_blank"
										rel="noopener noreferrer external"
										class="font-semibold text-amber-400 transition-colors hover:text-amber-300"
									>
										{ds.name} ↗
									</a>
								</td>
								<td class="py-3 pr-4 font-mono text-[var(--text-tiny)]">{ds.year}</td>
								<td class="py-3 pr-4">{ds.org}</td>
								<td class="py-3 pr-4 font-mono text-[var(--color-primary)]">{ds.size}</td>
								<td class="py-3 text-[var(--color-muted)] text-[var(--text-tiny)]">{ds.desc}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</Section>
	</div>

	<!-- Summary: The Pipeline -->
	<div
		class="rounded-xl border border-[var(--color-primary)]/20 bg-gradient-to-br from-[var(--color-primary)]/10 to-pink-600/10 p-6"
	>
		<h2 class="mb-4 flex items-center gap-2 text-xl font-bold text-[var(--color-text)]">
			<span>🔄</span> The Data Pipeline
		</h2>
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<div class="rounded-lg border border-violet-500/20 bg-violet-500/10 p-4 text-center">
				<div class="mb-2 text-2xl">📥</div>
				<div class="font-semibold text-violet-300">Raw Sources</div>
				<div class="mt-1 text-[var(--color-muted)] text-[var(--text-tiny)]">240T+ raw tokens</div>
			</div>
			<div class="rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-4 text-center">
				<div class="mb-2 text-2xl">🔍</div>
				<div class="font-semibold text-cyan-300">Filter & Clean</div>
				<div class="mt-1 text-[var(--color-muted)] text-[var(--text-tiny)]">Keep ~1-5%</div>
			</div>
			<div class="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-center">
				<div class="mb-2 text-2xl">🎯</div>
				<div class="font-semibold text-emerald-300">Combine & Curate</div>
				<div class="mt-1 text-[var(--color-muted)] text-[var(--text-tiny)]">3-15T tokens</div>
			</div>
			<div class="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 text-center">
				<div class="mb-2 text-2xl">✨</div>
				<div class="font-semibold text-amber-300">Instruct & Align</div>
				<div class="mt-1 text-[var(--color-muted)] text-[var(--text-tiny)]">~1-10B tokens</div>
			</div>
		</div>
	</div>
</div>
