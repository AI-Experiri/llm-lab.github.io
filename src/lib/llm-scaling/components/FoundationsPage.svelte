<!-- ABOUTME: Foundations of scaling laws with core concepts -->
<!-- ABOUTME: Uses shared components for consistent styling -->

<script>
	import { HeroSection, Section, ContentBox, KeyTakeaway, Math } from '$lib/shared';

	const scalingConcepts = [
		{
			title: 'Data Scaling',
			formula: 'L(D) = \\left(\\frac{D_c}{D}\\right)^{\\alpha_D}',
			description:
				'Loss decreases as a power law with training data size. More data consistently improves model performance.',
			exponent: '\\alpha_D \\approx 0.095'
		},
		{
			title: 'Model Scaling',
			formula: 'L(N) = \\left(\\frac{N_c}{N}\\right)^{\\alpha_N}',
			description:
				'Loss decreases as a power law with model parameters. Larger models learn more efficiently.',
			exponent: '\\alpha_N \\approx 0.076'
		},
		{
			title: 'Compute Scaling',
			formula: 'L(C) = \\left(\\frac{C_c}{C}\\right)^{\\alpha_C}',
			description:
				'Loss decreases as a power law with compute budget. More FLOPs lead to better performance.',
			exponent: '\\alpha_C \\approx 0.050'
		}
	];

	const threeRegions = [
		{
			name: 'Best Guess Region',
			color: 'red',
			description:
				'Random or near-random performance. Model has not learned meaningful patterns yet.',
			compute: 'Very low compute'
		},
		{
			name: 'Power Law Region',
			color: 'primary',
			description:
				'Predictable scaling where loss decreases as a power law. This is where scaling laws apply.',
			compute: 'Moderate to high compute'
		},
		{
			name: 'Asymptotic Region',
			color: 'green',
			description:
				'Approaching irreducible error (entropy of natural language). Diminishing returns.',
			compute: 'Extreme compute'
		}
	];

	const keyPrinciples = [
		{
			title: 'Universality',
			description:
				'Power law scaling holds across different architectures, tasks, and modalities. The same functional form applies broadly.'
		},
		{
			title: 'Predictability',
			description:
				'Small-scale experiments can predict large-scale behavior. Train cheap, extrapolate to expensive.'
		},
		{
			title: 'Smoothness',
			description:
				'Loss curves are smooth and continuous. No sudden jumps or phase transitions in the scaling regime.'
		},
		{
			title: 'Separability',
			description:
				'Effects of data, model size, and compute can be studied independently (with caveats).'
		}
	];
</script>

<div class="space-y-6">
	<HeroSection icon="📚" title="Foundations of Scaling Laws">
		<p class="max-w-3xl leading-relaxed text-[var(--color-muted)] text-[var(--text-body)]">
			Understanding the mathematical foundations of how neural network performance scales with
			compute, data, and model size. These principles enable principled decisions about resource
			allocation.
		</p>
	</HeroSection>

	<!-- Core Scaling Relationships -->
	<Section title="Core Scaling Relationships">
		<div class="grid gap-4 md:grid-cols-3">
			{#each scalingConcepts as concept (concept.title)}
				<ContentBox variant="dark" class="border border-[var(--color-muted)]/20">
					<h4 class="mb-2 font-semibold text-[var(--color-primary)]">{concept.title}</h4>
					<div
						class="mb-3 rounded bg-[var(--color-bg)] p-2 text-center text-[var(--color-primary)]"
					>
						<Math formula={concept.formula} />
					</div>
					<p class="mb-2 text-[var(--color-muted)] text-[var(--text-small)]">
						{concept.description}
					</p>
					<p class="text-[var(--color-accent)] text-[var(--text-tiny)]">
						<Math formula={concept.exponent} />
					</p>
				</ContentBox>
			{/each}
		</div>
	</Section>

	<!-- Three Regions -->
	<Section title="Three Scaling Regions">
		<p class="mb-4 text-[var(--color-muted)] text-[var(--text-small)]">
			As compute increases, models pass through three distinct performance regions:
		</p>
		<div class="grid gap-4 md:grid-cols-3">
			{#each threeRegions as region (region.name)}
				<ContentBox
					variant="dark"
					class="border-l-4 {region.color === 'red'
						? 'border-red-500'
						: region.color === 'primary'
							? 'border-[var(--color-primary)]'
							: 'border-green-500'}"
				>
					<div class="mb-2 flex items-center gap-2">
						<span
							class="h-3 w-3 rounded-full {region.color === 'red'
								? 'bg-red-500'
								: region.color === 'primary'
									? 'bg-[var(--color-primary)]'
									: 'bg-green-500'}"
						></span>
						<h4 class="font-semibold text-[var(--color-primary)]">{region.name}</h4>
					</div>
					<p class="mb-2 text-[var(--color-muted)] text-[var(--text-small)]">
						{region.description}
					</p>
					<p class="font-mono text-[var(--color-accent)] text-[var(--text-tiny)]">
						{region.compute}
					</p>
				</ContentBox>
			{/each}
		</div>
	</Section>

	<!-- Key Principles -->
	<Section title="Key Principles">
		<div class="grid gap-4 md:grid-cols-2">
			{#each keyPrinciples as principle (principle.title)}
				<ContentBox variant="dark" class="transition-colors hover:border-[var(--color-primary)]/50">
					<h4 class="mb-2 font-semibold text-[var(--color-primary)]">{principle.title}</h4>
					<p class="text-[var(--color-muted)] text-[var(--text-small)]">{principle.description}</p>
				</ContentBox>
			{/each}
		</div>
	</Section>

	<!-- Mathematical Form -->
	<Section title="The General Form">
		<ContentBox variant="dark" class="text-center">
			<p class="mb-4 text-[var(--color-muted)] text-[var(--text-small)]">
				All scaling relationships follow the same power law form:
			</p>
			<div class="rounded-lg bg-[var(--color-bg)] p-6 text-[var(--text-body)]">
				<Math formula="L(x) = L_\\infty + \\left(\\frac{x_c}{x}\\right)^\\alpha" display={true} />
			</div>
			<div class="mt-4 grid gap-4 text-left text-[var(--text-small)] md:grid-cols-3">
				<div>
					<Math formula="L_\\infty" class="text-[var(--color-primary)]" />
					<span class="text-[var(--color-muted)]"> — Irreducible loss (entropy)</span>
				</div>
				<div>
					<Math formula="x_c" class="text-[var(--color-primary)]" />
					<span class="text-[var(--color-muted)]"> — Critical scale constant</span>
				</div>
				<div>
					<Math formula="\\alpha" class="text-[var(--color-primary)]" />
					<span class="text-[var(--color-muted)]"> — Scaling exponent</span>
				</div>
			</div>
		</ContentBox>
	</Section>

	<KeyTakeaway
		items={[
			'Power laws describe how loss decreases with compute, data, and model size',
			'Three regions: best guess → power law → asymptotic (diminishing returns)',
			'Scaling is universal, predictable, smooth, and separable',
			'The same mathematical form applies across architectures and tasks'
		]}
	/>
</div>
