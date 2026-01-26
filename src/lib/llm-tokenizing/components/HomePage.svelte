<!-- ABOUTME: Overview page for Tokenizing Lab -->
<!-- ABOUTME: Covers tokenization fundamentals, timeline, and references -->

<script>
	import { HeroSection, Section, Timeline } from '$lib/shared';

	const timelineEvents = [
		{
			year: '2016',
			title: 'Byte Pair Encoding (BPE)',
			description:
				'Sennrich et al. adapt BPE from data compression to neural machine translation, enabling open-vocabulary models.',
			color: 'pink'
		},
		{
			year: '2018',
			title: 'WordPiece & SentencePiece',
			description:
				'Google releases WordPiece (used in BERT) and SentencePiece for language-agnostic subword tokenization.',
			color: 'cyan'
		},
		{
			year: '2019',
			title: 'GPT-2 Tokenizer',
			description:
				'OpenAI introduces byte-level BPE with 50,257 tokens, handling any Unicode text without unknown tokens.',
			color: 'purple'
		},
		{
			year: '2020',
			title: 'Hugging Face Tokenizers',
			description:
				'Fast, Rust-based tokenizer library makes BPE training and inference dramatically faster.',
			color: 'green'
		},
		{
			year: '2023',
			title: 'Tiktoken',
			description:
				'OpenAI releases tiktoken with cl100k_base encoding for GPT-4, optimized for code and multilingual text.',
			color: 'yellow'
		},
		{
			year: '2024',
			title: 'Advanced BPE Variants',
			description:
				'Research explores morphology-aware, adaptive, and boundless tokenization for better compression and generalization.',
			color: 'orange'
		}
	];

	const references = [
		{
			title: 'Stanford CS336: Language Modeling from Scratch',
			url: 'https://stanford-cs336.github.io/spring2025/',
			description: 'Lecture 1: Overview and Tokenization'
		},
		{
			title: 'Neural Machine Translation of Rare Words with Subword Units',
			url: 'https://arxiv.org/abs/1508.07909',
			authors: 'Sennrich et al. (2016)'
		},
		{
			title: 'SentencePiece: A simple and language independent subword tokenizer',
			url: 'https://arxiv.org/abs/1808.06226',
			authors: 'Kudo & Richardson (2018)'
		},
		{
			title: 'Hugging Face Tokenizers Library',
			url: 'https://github.com/huggingface/tokenizers',
			description: 'Fast tokenizer implementations'
		}
	];
</script>

<div class="space-y-6">
	<HeroSection icon="🔤" title="Understanding Tokenization">
		<p class="max-w-3xl leading-relaxed text-[var(--color-muted)] text-[var(--text-body)]">
			Tokenization converts raw text into discrete tokens that language models can process. The
			choice of tokenizer affects vocabulary size, sequence length, and how well the model handles
			rare words and multiple languages.
		</p>
		<div class="mt-4 flex flex-wrap gap-3">
			<span
				class="rounded-full bg-[var(--color-secondary)] px-3 py-1 text-[var(--color-accent)] text-[var(--text-small)]"
			>
				BPE
			</span>
			<span
				class="rounded-full bg-[var(--color-secondary)] px-3 py-1 text-[var(--color-accent)] text-[var(--text-small)]"
			>
				WordPiece
			</span>
			<span
				class="rounded-full bg-[var(--color-secondary)] px-3 py-1 text-[var(--color-accent)] text-[var(--text-small)]"
			>
				Subword Units
			</span>
		</div>
	</HeroSection>

	<!-- Timeline -->
	<Section title="Evolution of Tokenization">
		<Timeline events={timelineEvents} />
	</Section>

	<!-- References -->
	<Section title="References">
		<ul class="space-y-2 text-[var(--text-small)]">
			{#each references as ref, i (ref.title)}
				<li class="flex items-start gap-3">
					<span class="font-medium text-[var(--color-primary)]">{i + 1}.</span>
					<div>
						<a
							href={ref.url}
							target="_blank"
							rel="noopener noreferrer external"
							class="text-[var(--color-accent)] hover:underline"
						>
							{ref.title}
						</a>
						{#if ref.description}
							<span class="text-[var(--color-muted)]"> — {ref.description}</span>
						{/if}
						{#if ref.authors}
							<span class="text-[var(--color-muted)]"> — {ref.authors}</span>
						{/if}
					</div>
				</li>
			{/each}
		</ul>
	</Section>
</div>
