<!-- ABOUTME: Overview page for Positional Encoding Lab -->
<!-- ABOUTME: Covers positional encoding fundamentals, timeline, and references -->

<script>
	import { HeroSection, Section, Timeline } from '$lib/shared';

	const timelineEvents = [
		{
			year: '2017',
			title: 'Sinusoidal Positional Encoding',
			description:
				'Vaswani et al. introduce fixed sinusoidal encodings in "Attention Is All You Need", enabling transformers to understand token order.',
			color: 'pink'
		},
		{
			year: '2018',
			title: 'Relative Position Representations',
			description:
				'Shaw et al. propose learning relative positions instead of absolute, improving generalization to longer sequences.',
			color: 'cyan'
		},
		{
			year: '2019',
			title: 'Transformer-XL',
			description:
				'Dai et al. introduce segment-level recurrence with relative positional encodings for modeling long-term dependencies.',
			color: 'purple'
		},
		{
			year: '2020',
			title: 'T5 Relative Bias',
			description:
				'Raffel et al. use learned relative position biases, showing simplicity can match complex schemes.',
			color: 'green'
		},
		{
			year: '2021',
			title: 'RoPE & ALiBi',
			description:
				'Su et al. introduce Rotary Position Embedding; Press et al. propose ALiBi for length extrapolation without learned parameters.',
			color: 'yellow'
		},
		{
			year: '2023',
			title: 'YaRN & NTK-aware',
			description:
				'Techniques for extending context length of pretrained models through interpolation and frequency scaling.',
			color: 'orange'
		},
		{
			year: '2024',
			title: 'NoPE & DroPE',
			description:
				'Research explores implicit position encoding and dropout-based approaches for improved generalization.',
			color: 'red'
		}
	];

	const references = [
		{
			title: 'Stanford CS336: Language Modeling from Scratch',
			url: 'https://stanford-cs336.github.io/spring2025/',
			description: 'Lecture 1: Overview and Tokenization'
		},
		{
			title: 'Attention Is All You Need',
			url: 'https://arxiv.org/abs/1706.03762',
			authors: 'Vaswani et al. (2017)'
		},
		{
			title: 'RoFormer: Enhanced Transformer with Rotary Position Embedding',
			url: 'https://arxiv.org/abs/2104.09864',
			authors: 'Su et al. (2021)'
		},
		{
			title: 'Train Short, Test Long: Attention with Linear Biases',
			url: 'https://arxiv.org/abs/2108.12409',
			authors: 'Press et al. (2021)'
		}
	];
</script>

<div class="space-y-6">
	<HeroSection icon="📍" title="Understanding Positional Encoding">
		<p class="max-w-3xl leading-relaxed text-[var(--color-muted)] text-[var(--text-body)]">
			Transformers process tokens in parallel without inherent notion of order. Positional encodings
			inject sequence position information, enabling the model to distinguish "the cat sat on the
			mat" from "the mat sat on the cat".
		</p>
		<div class="mt-4 flex flex-wrap gap-3">
			<span
				class="rounded-full bg-[var(--color-secondary)] px-3 py-1 text-[var(--color-accent)] text-[var(--text-small)]"
			>
				Sinusoidal
			</span>
			<span
				class="rounded-full bg-[var(--color-secondary)] px-3 py-1 text-[var(--color-accent)] text-[var(--text-small)]"
			>
				RoPE
			</span>
			<span
				class="rounded-full bg-[var(--color-secondary)] px-3 py-1 text-[var(--color-accent)] text-[var(--text-small)]"
			>
				ALiBi
			</span>
		</div>
	</HeroSection>

	<!-- Timeline -->
	<Section title="Evolution of Positional Encoding">
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
