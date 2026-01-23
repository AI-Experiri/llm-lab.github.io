<!-- ABOUTME: Visualizes RoPE (Rotary Position Embedding) from Su et al., 2021 -->
<!-- ABOUTME: Shows evolution from additive PE to multiplicative rotation encoding -->

<script>
	import { Section } from './layouts';
	import Rope_AttnDiagram from './Rope_AttnDiagram.svelte';

	// Separate state for each demo to avoid "haunted UI" effect
	let positionSingle = $state(0); // Single position rotation demo
	let positionM = $state(0); // Relative position demo - position m
	let positionN = $state(5); // Relative position demo - position n
	let distanceDemo = $state(5); // Fast vs slow pair demo
	let comparisonPos = $state(0); // Sinusoidal vs RoPE comparison demo

	// Base token embedding for comparison demo (normalized to unit circle for clarity)
	const BASE_EMBEDDING = { x: 0.8, y: 0.6 }; // A point on the 2D plane
	const BASE_MAGNITUDE = Math.sqrt(BASE_EMBEDDING.x ** 2 + BASE_EMBEDDING.y ** 2);

	// Compute sinusoidal PE for position (simplified 2D version)
	function getSinusoidalPE(pos) {
		// Using two different frequencies like the original paper
		const freq1 = 1.0; // Fast dimension
		const freq2 = 0.1; // Slow dimension
		return {
			x: Math.sin(pos * freq1),
			y: Math.cos(pos * freq2)
		};
	}

	// Compute E + PE (additive sinusoidal)
	function getAdditivePE(pos) {
		const pe = getSinusoidalPE(pos);
		return {
			x: BASE_EMBEDDING.x + pe.x * 0.4, // Scale PE for visualization
			y: BASE_EMBEDDING.y + pe.y * 0.4
		};
	}

	// Compute rotated vector (RoPE style)
	function getRotatedVector(pos) {
		const theta = pos * 0.3; // Rotation angle proportional to position
		const cos = Math.cos(theta);
		const sin = Math.sin(theta);
		return {
			x: BASE_EMBEDDING.x * cos - BASE_EMBEDDING.y * sin,
			y: BASE_EMBEDDING.x * sin + BASE_EMBEDDING.y * cos
		};
	}

	// Derived values for comparison visualization
	let additiveVector = $derived.by(() => getAdditivePE(comparisonPos));
	let additiveMagnitude = $derived.by(() =>
		Math.sqrt(additiveVector.x ** 2 + additiveVector.y ** 2)
	);
	let additiveAngle = $derived.by(
		() => (Math.atan2(additiveVector.y, additiveVector.x) * 180) / Math.PI
	);

	let rotatedVector = $derived.by(() => getRotatedVector(comparisonPos));
	let rotatedMagnitude = $derived.by(() => Math.sqrt(rotatedVector.x ** 2 + rotatedVector.y ** 2));
	let rotatedAngle = $derived.by(
		() => (Math.atan2(rotatedVector.y, rotatedVector.x) * 180) / Math.PI
	);

	// Track the path of vectors over positions for trail effect
	let additiveTrail = $derived.by(() => {
		const trail = [];
		for (let p = 0; p <= 10; p++) {
			trail.push(getAdditivePE(p));
		}
		return trail;
	});

	let rotatedTrail = $derived.by(() => {
		const trail = [];
		for (let p = 0; p <= 10; p++) {
			trail.push(getRotatedVector(p));
		}
		return trail;
	});

	// Helper to compute rotation angle for visualization
	function getRotationAngle(pos, dimPair) {
		// θ_i = 1 / 10000^(2i/d) - simplified for visualization
		const visualIndex = dimPair / 10;
		const freq = 1 / Math.pow(4, visualIndex);
		return pos * freq * 0.4;
	}

	// For the fast vs slow demo - using realistic angles
	const FAST_THETA = 60; // degrees per position
	const SLOW_THETA = 0.06; // degrees per position

	function getFastAngle(dist) {
		return (dist * FAST_THETA) % 360;
	}

	function getSlowAngle(dist) {
		return dist * SLOW_THETA;
	}

	function hasWrapped(dist, theta) {
		return dist * theta >= 360;
	}

	// Derived values for fast/slow pair demo (replaces {#if true} blocks)
	// Using $derived.by() for function form per Svelte 5 docs
	let fastAngle = $derived.by(() => getFastAngle(distanceDemo));
	let fastRad = $derived.by(() => (fastAngle * Math.PI) / 180);
	let fastWrapped = $derived.by(() => hasWrapped(distanceDemo, FAST_THETA));
	let fastWrapCount = $derived.by(() => Math.floor((distanceDemo * FAST_THETA) / 360));

	let slowAngle = $derived.by(() => getSlowAngle(distanceDemo));
	let slowRad = $derived.by(() => (slowAngle * Math.PI) / 180);
	let slowWrapped = $derived.by(() => hasWrapped(distanceDemo, SLOW_THETA));

	// Decay visualization: using actual RoPE frequency formula
	// θᵢ = 10000^(-2i/d) from the paper
	let decayMaxDist = $state(1000);
	const DECAY_DIM = 64; // Typical embedding dimension for visualization
	const DECAY_BASE = 10000;

	let decayPoints = $derived.by(() => {
		const points = [];
		const numPairs = DECAY_DIM / 2;
		const step = Math.max(1, Math.floor(decayMaxDist / 200)); // Keep ~200 points for smooth curve

		// Precompute thetas using RoPE formula: θᵢ = base^(-2i/d)
		const thetas = [];
		for (let i = 0; i < numPairs; i++) {
			thetas.push(Math.pow(DECAY_BASE, (-2 * i) / DECAY_DIM));
		}

		for (let dist = 0; dist <= decayMaxDist; dist += step) {
			let sumCos = 0;
			for (let i = 0; i < numPairs; i++) {
				sumCos += Math.cos(dist * thetas[i]);
			}
			// Normalize by number of pairs
			points.push({ dist, score: sumCos / numPairs });
		}
		return points;
	});

	let decayScale = $derived(270 / decayMaxDist);

	// Helper for minimal angular difference (for arc rendering)
	// Always draws the shorter arc between two angles
	function getMinimalArcPath(angle1, angle2, radius, cx, cy) {
		const TWO_PI = 2 * Math.PI;
		const a1 = ((angle1 % TWO_PI) + TWO_PI) % TWO_PI;
		const a2 = ((angle2 % TWO_PI) + TWO_PI) % TWO_PI;

		// Clamp to [-π, π] so we always get the minimal arc
		let diff = a2 - a1;
		if (Math.abs(diff) > Math.PI) {
			diff = diff > 0 ? diff - TWO_PI : diff + TWO_PI;
		}

		const endAngle = a1 + diff;
		const sweep = diff >= 0 ? 1 : 0;

		const x1 = cx + radius * Math.sin(a1);
		const y1 = cy - radius * Math.cos(a1);
		const x2 = cx + radius * Math.sin(endAngle);
		const y2 = cy - radius * Math.cos(endAngle);

		// largeArc always 0 since diff is clamped to [-π, π]
		return `M ${x1} ${y1} A ${radius} ${radius} 0 0 ${sweep} ${x2} ${y2}`;
	}

	// Static angle helpers for "Same Distance = Same Angle" visualization
	const staticAngles = {
		pos2: 2 * 0.3,
		pos5: 5 * 0.3,
		pos10: 10 * 0.3,
		pos13: 13 * 0.3,
		pos100: 100 * 0.3,
		pos103: 103 * 0.3
	};

	// Static rotation example values (precomputed)
	const rotationExample = (() => {
		const origX = 3,
			origY = 4;
		const angle = (30 * Math.PI) / 180;
		return {
			origX,
			origY,
			angle,
			rotX: origX * Math.cos(angle) - origY * Math.sin(angle),
			rotY: origX * Math.sin(angle) + origY * Math.cos(angle)
		};
	})();
</script>

<div class="space-y-4">
	<!-- Header -->
	<Section>
		<div class="mb-2 flex items-center gap-4">
			<h2 class="font-bold text-[#e94560] text-[var(--text-h1)]">
				RoPE: Rotary Position Embedding
			</h2>
			<a
				href="https://arxiv.org/abs/2104.09864"
				target="_blank"
				class="text-[var(--text-small)] text-gray-400 hover:text-white"
			>
				Su et al., 2021 ↗
			</a>
		</div>

		<!-- Core Summary -->
		<div class="mb-3 rounded bg-[#0f3460] p-3">
			<p class="text-[var(--text-body)] text-gray-300">
				<strong class="text-white">Core idea:</strong> Instead of <em>adding</em> position to
				embeddings,
				<strong class="text-orange-400">rotate</strong> the Q and K vectors by an angle proportional
				to their position. When computing Q·K<sup>T</sup>, the rotations combine so the
				<strong class="text-emerald-400">positional contribution to attention</strong>
				depends only on <strong class="text-emerald-400">relative distance (m−n)</strong>, not
				absolute positions. Position becomes
				<strong class="text-cyan-400">intrinsic to the attention computation</strong>.
			</p>
			<p class="mt-2 text-[var(--text-tiny)] text-gray-500 italic">
				Note: The full attention score still depends on token content (the Q/K vectors themselves).
				RoPE ensures the positional effect is relative — not that position is the only factor.
			</p>
		</div>

		<p class="text-[var(--text-small)] text-gray-400">
			Multiplicative position encoding applied inside attention. Powers LLaMA, Mistral, GPT-NeoX,
			and most modern LLMs.
		</p>
	</Section>

	<!-- 1. The Problem: Why Additive PE Isn't Ideal -->
	<Section>
		<h3 class="mb-2 font-semibold text-[#e94560] text-[var(--text-h2)]">
			1. The Problem: Why Additive PE Isn't Ideal
		</h3>
		<p class="mb-3 text-[var(--text-body)] text-gray-300">
			Previous approaches had structural limitations that RoPE addresses:
		</p>

		<div class="grid gap-4 md:grid-cols-2">
			<div class="rounded bg-[#0f3460] p-3">
				<p class="mb-2 font-semibold text-[var(--text-small)] text-red-400">
					Problem 1: Position can wash out
				</p>
				<p class="text-[var(--text-small)] text-gray-300">
					When PE is <em>added</em> to embeddings (X = E + PE), deep layers and layer normalization can
					dilute the position signal. By the final layers, position info may be weak.
				</p>
			</div>

			<div class="rounded bg-[#0f3460] p-3">
				<p class="mb-2 font-semibold text-[var(--text-small)] text-red-400">
					Problem 2: Relative position is indirect
				</p>
				<p class="text-[var(--text-small)] text-gray-300">
					Sinusoidal PE encodes "I am at position 5" — the model must <em>learn</em> that positions 5
					and 7 are "2 apart." This relationship isn't explicit in the encoding.
				</p>
			</div>

			<div class="rounded bg-[#0f3460] p-3">
				<p class="mb-2 font-semibold text-[var(--text-small)] text-red-400">
					Problem 3: Bias is bolted on
				</p>
				<p class="text-[var(--text-small)] text-gray-300">
					Relative PE methods (Shaw, T5) add position <em>after</em> the Q·K dot product. Position affects
					scores but isn't part of the similarity computation itself.
				</p>
			</div>

			<div class="rounded bg-[#0f3460] p-3">
				<p class="mb-2 font-semibold text-[var(--text-small)] text-red-400">
					Problem 4: Extra parameters or lookup
				</p>
				<p class="text-[var(--text-small)] text-gray-300">
					Learned relative PE requires storing position embeddings or bias tables. T5 needs 32
					learned biases per head; Transformer-XL needs position vectors.
				</p>
			</div>
		</div>

		<div class="mt-3 rounded border border-amber-500/30 bg-[#1a1a2e] p-3">
			<p class="text-[var(--text-small)] text-gray-300">
				<strong class="text-amber-400">The question:</strong> Can we make position
				<em>intrinsic</em> to the attention computation itself, so relative distance falls out naturally
				from the math?
			</p>
		</div>
	</Section>

	<!-- 2. The Intuition: Energy Neutrality -->
	<Section>
		<h3 class="mb-2 font-semibold text-[#e94560] text-[var(--text-h2)]">
			2. The Intuition: Energy Neutrality
		</h3>

		<p class="mb-3 text-[var(--text-body)] text-gray-300">
			When you <em>add</em> position to an embedding (X = E + PE), you're changing the vector's
			<strong class="text-white">magnitude</strong>
			— making the token "louder" or "quieter" in the attention computation.
		</p>

		<div class="mb-4 grid gap-3 text-[var(--text-small)] md:grid-cols-2">
			<div class="rounded border border-red-500/30 bg-[#0f3460] p-3">
				<p class="mb-1 font-semibold text-red-400">Additive PE: Changes energy</p>
				<p class="text-gray-400">||E + PE|| ≠ ||E||</p>
				<p class="mt-1 text-gray-500">Position signal can amplify or dampen tokens unpredictably</p>
			</div>
			<div class="rounded border border-emerald-500/30 bg-[#0f3460] p-3">
				<p class="mb-1 font-semibold text-emerald-400">RoPE: Preserves energy</p>
				<p class="text-gray-400">||R(x)|| = ||x||</p>
				<p class="mt-1 text-gray-500">Rotation only changes <em>direction</em>, never magnitude</p>
			</div>
		</div>

		<div class="mb-4 rounded border border-emerald-500/30 bg-[#1a1a2e] p-3">
			<p class="text-[var(--text-small)] text-gray-300">
				<strong class="text-emerald-400">RoPE is energy-neutral.</strong> Rotating a vector doesn't
				make the token "louder" or "quieter" — it only changes its <em>direction</em>. This explains
				why RoPE is more stable in very deep networks: the position signal can't get "washed out" or
				over-amplified because it was never added in the first place.
			</p>
		</div>

		<!-- Interactive Comparison: Additive vs Rotation -->
		<div class="mb-4 rounded bg-[#0f3460] p-4">
			<p class="mb-3 font-semibold text-[var(--text-body)] text-white">
				See It: Additive vs Rotation
				<a
					href="https://www.youtube.com/watch?v=GQPOtyITy54&t=353s"
					target="_blank"
					rel="noopener noreferrer"
					class="ml-2 font-normal text-[var(--text-small)] text-emerald-400 hover:text-emerald-300"
					>[Reference Video]</a
				>
			</p>
			<p class="mb-4 text-[var(--text-small)] text-gray-400">
				Watch how a token embedding vector changes as position increases. Same base embedding,
				different encoding methods:
			</p>

			<!-- Position slider -->
			<div class="mb-4 flex items-center justify-center gap-3">
				<span class="text-[var(--text-small)] text-gray-400">Position:</span>
				<input
					type="range"
					bind:value={comparisonPos}
					min="0"
					max="10"
					class="w-48 accent-emerald-500"
				/>
				<span class="w-8 font-mono text-[var(--text-body)] text-white">{comparisonPos}</span>
			</div>

			<div class="grid gap-4 md:grid-cols-2">
				<!-- Sinusoidal (Additive) Side -->
				<div class="rounded bg-[#1a1a2e] p-4">
					<p class="mb-2 text-center font-semibold text-[var(--text-small)] text-red-400">
						Sinusoidal (Additive): X = E + PE
					</p>
					<div class="mb-3 flex justify-center">
						<svg viewBox="-1.8 -1.8 3.6 3.6" class="h-72 w-72">
							<!-- Grid -->
							<line x1="-1.5" y1="0" x2="1.5" y2="0" stroke="#333" stroke-width="0.02" />
							<line x1="0" y1="-1.5" x2="0" y2="1.5" stroke="#333" stroke-width="0.02" />

							<!-- Unit circle for reference -->
							<circle
								cx="0"
								cy="0"
								r="1"
								fill="none"
								stroke="#333"
								stroke-width="0.02"
								stroke-dasharray="0.05"
							/>

							<!-- Trail showing all positions (faded dots) -->
							{#each additiveTrail as point, i (i)}
								<circle
									cx={point.x}
									cy={-point.y}
									r="0.06"
									fill={i === comparisonPos ? '#ef4444' : '#ef444440'}
								/>
								{#if i > 0}
									<line
										x1={additiveTrail[i - 1].x}
										y1={-additiveTrail[i - 1].y}
										x2={point.x}
										y2={-point.y}
										stroke="#ef444430"
										stroke-width="0.02"
									/>
								{/if}
							{/each}

							<!-- Original embedding (gray, for reference) -->
							<line
								x1="0"
								y1="0"
								x2={BASE_EMBEDDING.x}
								y2={-BASE_EMBEDDING.y}
								stroke="#666"
								stroke-width="0.03"
								stroke-dasharray="0.05"
							/>
							<circle cx={BASE_EMBEDDING.x} cy={-BASE_EMBEDDING.y} r="0.05" fill="#666" />

							<!-- Current vector after adding PE -->
							<line
								x1="0"
								y1="0"
								x2={additiveVector.x}
								y2={-additiveVector.y}
								stroke="#ef4444"
								stroke-width="0.05"
								stroke-linecap="round"
							/>
							<circle cx={additiveVector.x} cy={-additiveVector.y} r="0.08" fill="#ef4444" />

							<!-- Origin -->
							<circle cx="0" cy="0" r="0.04" fill="#888" />
						</svg>
					</div>

					<!-- Stats -->
					<div class="space-y-1 font-mono text-[var(--text-tiny)]">
						<div class="flex justify-between">
							<span class="text-gray-500">Magnitude:</span>
							<span
								class={Math.abs(additiveMagnitude - BASE_MAGNITUDE) > 0.1
									? 'text-red-400'
									: 'text-gray-400'}
							>
								{additiveMagnitude.toFixed(2)}
								<span class="text-gray-600">(was {BASE_MAGNITUDE.toFixed(2)})</span>
							</span>
						</div>
						<div class="flex justify-between">
							<span class="text-gray-500">Angle:</span>
							<span class="text-red-400">{additiveAngle.toFixed(1)}°</span>
						</div>
						<div class="flex justify-between">
							<span class="text-gray-500">Δ Magnitude:</span>
							<span class="text-red-400"
								>{(((additiveMagnitude - BASE_MAGNITUDE) / BASE_MAGNITUDE) * 100).toFixed(1)}%</span
							>
						</div>
					</div>

					<p class="mt-2 text-center text-[var(--text-tiny)] text-red-400">
						Chaotic! Both magnitude and angle change unpredictably.
					</p>
				</div>

				<!-- RoPE (Rotation) Side -->
				<div class="rounded bg-[#1a1a2e] p-4">
					<p class="mb-2 text-center font-semibold text-[var(--text-small)] text-emerald-400">
						RoPE (Rotation): X' = R<sub>θ</sub> × E
					</p>
					<div class="mb-3 flex justify-center">
						<svg viewBox="-1.8 -1.8 3.6 3.6" class="h-72 w-72">
							<!-- Grid -->
							<line x1="-1.5" y1="0" x2="1.5" y2="0" stroke="#333" stroke-width="0.02" />
							<line x1="0" y1="-1.5" x2="0" y2="1.5" stroke="#333" stroke-width="0.02" />

							<!-- Circle showing rotation path (the vector traces this circle) -->
							<circle
								cx="0"
								cy="0"
								r={BASE_MAGNITUDE}
								fill="none"
								stroke="#22c55e30"
								stroke-width="0.03"
							/>

							<!-- Trail showing all positions (forms a perfect arc) -->
							{#each rotatedTrail as point, i (i)}
								<circle
									cx={point.x}
									cy={-point.y}
									r="0.06"
									fill={i === comparisonPos ? '#22c55e' : '#22c55e40'}
								/>
							{/each}

							<!-- Original embedding (gray, for reference) -->
							<line
								x1="0"
								y1="0"
								x2={BASE_EMBEDDING.x}
								y2={-BASE_EMBEDDING.y}
								stroke="#666"
								stroke-width="0.03"
								stroke-dasharray="0.05"
							/>
							<circle cx={BASE_EMBEDDING.x} cy={-BASE_EMBEDDING.y} r="0.05" fill="#666" />

							<!-- Current rotated vector -->
							<line
								x1="0"
								y1="0"
								x2={rotatedVector.x}
								y2={-rotatedVector.y}
								stroke="#22c55e"
								stroke-width="0.05"
								stroke-linecap="round"
							/>
							<circle cx={rotatedVector.x} cy={-rotatedVector.y} r="0.08" fill="#22c55e" />

							<!-- Origin -->
							<circle cx="0" cy="0" r="0.04" fill="#888" />
						</svg>
					</div>

					<!-- Stats -->
					<div class="space-y-1 font-mono text-[var(--text-tiny)]">
						<div class="flex justify-between">
							<span class="text-gray-500">Magnitude:</span>
							<span class="text-emerald-400">
								{rotatedMagnitude.toFixed(2)}
								<span class="text-gray-600">(was {BASE_MAGNITUDE.toFixed(2)})</span>
							</span>
						</div>
						<div class="flex justify-between">
							<span class="text-gray-500">Angle:</span>
							<span class="text-emerald-400">{rotatedAngle.toFixed(1)}°</span>
						</div>
						<div class="flex justify-between">
							<span class="text-gray-500">Δ Magnitude:</span>
							<span class="text-emerald-400"
								>{(((rotatedMagnitude - BASE_MAGNITUDE) / BASE_MAGNITUDE) * 100).toFixed(1)}%</span
							>
						</div>
					</div>

					<p class="mt-2 text-center text-[var(--text-tiny)] text-emerald-400">
						Smooth arc! Only angle changes, magnitude preserved.
					</p>
				</div>
			</div>

			<!-- Summary comparison -->
			<div class="mt-4 grid gap-4 text-[var(--text-small)] md:grid-cols-2">
				<div class="rounded border border-red-500/30 bg-[#1a1a2e] p-2">
					<p class="font-semibold text-red-400">✗ Additive Problems:</p>
					<ul class="mt-1 space-y-0.5 text-[var(--text-tiny)] text-gray-400">
						<li>• ||E + PE|| varies with position</li>
						<li>• Angle jumps unpredictably</li>
						<li>• Pattern hard to learn</li>
					</ul>
				</div>
				<div class="rounded border border-emerald-500/30 bg-[#1a1a2e] p-2">
					<p class="font-semibold text-emerald-400">✓ Rotation Benefits:</p>
					<ul class="mt-1 space-y-0.5 text-[var(--text-tiny)] text-gray-400">
						<li>• ||R(E)|| = ||E|| always</li>
						<li>• Angle = position × θ (predictable)</li>
						<li>• Smooth, learnable pattern</li>
					</ul>
				</div>
			</div>

			<p class="mt-3 text-center text-[var(--text-small)] text-gray-500 italic">
				<span class="text-gray-400">Gray dashed line:</span> original embedding &nbsp;|&nbsp;
				<span class="text-gray-400">Colored dots:</span> positions 0-10 &nbsp;|&nbsp;
				<span class="text-gray-400">Solid line:</span> current position
			</p>
		</div>
	</Section>

	<!-- 3. The Intuition: The Searchlight -->
	<Section>
		<h3 class="mb-2 font-semibold text-[#e94560] text-[var(--text-h2)]">
			3. The Intuition: The Searchlight
		</h3>

		<!-- The Searchlight Analogy -->
		<div class="mb-4 rounded border border-yellow-500/40 bg-[#1a1a2e] p-4">
			<p class="mb-3 text-[var(--text-body)] text-gray-300">
				Imagine each Query vector as a <strong class="text-yellow-400">searchlight</strong> pointing
				in some direction. Each Key vector is an object in the dark. The dot product measures
				<em>alignment</em> — how directly the searchlight shines on each object.
			</p>
			<div class="grid gap-3 text-[var(--text-small)] md:grid-cols-2">
				<div class="rounded bg-[#0f3460] p-3">
					<p class="mb-1 font-semibold text-emerald-400">Perfect alignment (same direction)</p>
					<p class="text-gray-400">
						Searchlight points straight at the object → <strong class="text-white"
							>maximum brightness</strong
						> (high attention score)
					</p>
				</div>
				<div class="rounded bg-[#0f3460] p-3">
					<p class="mb-1 font-semibold text-red-400">Perpendicular (90° apart)</p>
					<p class="text-gray-400">
						Searchlight misses the object entirely → <strong class="text-white"
							>zero brightness</strong
						> (no attention)
					</p>
				</div>
			</div>
			<p class="mt-3 text-[var(--text-body)] text-gray-300">
				<strong class="text-yellow-400">RoPE twists the searchlights.</strong> Two tokens at the same
				position haven't been twisted relative to each other — their searchlights align perfectly. As
				tokens move apart in the sequence, they twist away from each other, and the "light" dims. This
				is why attention naturally decays with distance: the further apart, the more the twist, the less
				the alignment.
			</p>
		</div>

		<!-- Concrete example: "The cat sat on the mat" -->
		<div class="mb-4 rounded bg-[#0f3460] p-4">
			<p class="mb-3 font-semibold text-[var(--text-small)] text-emerald-400">
				Concrete Example: "The cat sat on the mat"
			</p>

			<div class="space-y-4">
				<!-- Sentence 1 -->
				<div class="rounded bg-[#1a1a2e] p-3">
					<p class="mb-2 text-[var(--text-small)] text-gray-400">
						Sentence: <span class="font-mono text-white">"The cat sat on the mat"</span>
					</p>
					<div class="mb-2 flex flex-wrap gap-2 text-[var(--text-small)]">
						<span class="rounded bg-blue-900/50 px-2 py-1 text-blue-300"
							>The <span class="text-blue-400">pos:0</span></span
						>
						<span class="rounded bg-gray-700 px-2 py-1"
							>cat <span class="text-gray-500">pos:1</span></span
						>
						<span class="rounded bg-gray-700 px-2 py-1"
							>sat <span class="text-gray-500">pos:2</span></span
						>
						<span class="rounded bg-gray-700 px-2 py-1"
							>on <span class="text-gray-500">pos:3</span></span
						>
						<span class="rounded bg-gray-700 px-2 py-1"
							>the <span class="text-gray-500">pos:4</span></span
						>
						<span class="rounded bg-orange-900 px-2 py-1 text-orange-300"
							>mat <span class="text-orange-400">pos:5</span></span
						>
					</div>
					<p class="text-[var(--text-small)] text-gray-300">
						Attention between <span class="text-orange-400">"mat"</span> (pos 5) and
						<span class="text-blue-400">"The"</span>
						(pos 0): rotate by <span class="text-emerald-400">5θ − 0θ = 5θ</span>
					</p>
				</div>

				<!-- Sentence 2 -->
				<div class="rounded bg-[#1a1a2e] p-3">
					<p class="mb-2 text-[var(--text-small)] text-gray-400">
						Add tokens at start: <span class="font-mono text-white"
							>"Look, the cat sat on the mat"</span
						>
					</p>
					<div class="mb-2 flex flex-wrap gap-2 text-[var(--text-small)]">
						<span class="rounded bg-purple-900/50 px-2 py-1 text-purple-300"
							>Look <span class="text-purple-400">pos:0</span></span
						>
						<span class="rounded bg-purple-900/50 px-2 py-1 text-purple-300"
							>, <span class="text-purple-400">pos:1</span></span
						>
						<span class="rounded bg-blue-900/50 px-2 py-1 text-blue-300"
							>the <span class="text-blue-400">pos:2</span></span
						>
						<span class="rounded bg-gray-700 px-2 py-1"
							>cat <span class="text-gray-500">pos:3</span></span
						>
						<span class="rounded bg-gray-700 px-2 py-1"
							>sat <span class="text-gray-500">pos:4</span></span
						>
						<span class="rounded bg-gray-700 px-2 py-1"
							>on <span class="text-gray-500">pos:5</span></span
						>
						<span class="rounded bg-gray-700 px-2 py-1"
							>the <span class="text-gray-500">pos:6</span></span
						>
						<span class="rounded bg-orange-900 px-2 py-1 text-orange-300"
							>mat <span class="text-orange-400">pos:7</span></span
						>
					</div>
					<p class="text-[var(--text-small)] text-gray-300">
						Attention between <span class="text-orange-400">"mat"</span> (pos 7) and
						<span class="text-blue-400">"the"</span>
						(pos 2): rotate by <span class="text-emerald-400">7θ − 2θ = 5θ</span> —
						<strong class="text-white">same!</strong>
					</p>
				</div>
			</div>

			<p class="mt-3 text-center text-[var(--text-small)] text-emerald-400">
				<span class="text-cyan-400">[Guarantee]</span> The <em>positional component</em> of the dot product
				between "mat" and "the" is the same in both sentences — same relative distance (5) means same
				rotation angle.
			</p>
			<p class="mt-1 text-center text-[var(--text-tiny)] text-gray-500 italic">
				The full score also depends on content, so "mat" at pos 5 vs pos 7 may not score identically
				if earlier layers produced different representations.
			</p>
		</div>

		<!-- Why this matters -->
		<div class="mb-4 rounded bg-[#0f3460] p-4">
			<p class="mb-3 font-semibold text-[var(--text-small)] text-emerald-400">Why This Matters</p>
			<div class="grid gap-4 md:grid-cols-2">
				<div class="space-y-2 text-[var(--text-small)] text-gray-300">
					<p><strong class="text-white">With absolute PE (sinusoidal):</strong></p>
					<p class="text-gray-400">• "mat" at position 5 gets encoding PE(5)</p>
					<p class="text-gray-400">• "mat" at position 7 gets encoding PE(7)</p>
					<p class="text-red-400">
						• Model must <em>learn</em> that these relate the same way to nearby tokens
					</p>
				</div>
				<div class="space-y-2 text-[var(--text-small)] text-gray-300">
					<p><strong class="text-white">With RoPE:</strong></p>
					<p class="text-gray-400">• "mat" 5 positions from "the" → angle 5θ</p>
					<p class="text-gray-400">• "mat" still 5 positions from "the" → angle 5θ</p>
					<p class="text-emerald-400">
						• Same angle = same positional factor (model doesn't relearn "distance = 5")
					</p>
				</div>
			</div>
		</div>

		<!-- Visual: Same Distance = Same Angle -->
		<div class="mb-4 rounded bg-[#0f3460] p-4">
			<p class="mb-3 font-semibold text-[var(--text-small)] text-emerald-400">
				See It: Same Distance = Same Angle
			</p>
			<div class="flex flex-wrap items-center justify-center gap-6">
				<!-- Position 2 and 5 -->
				<div class="text-center">
					<p class="mb-2 text-[var(--text-small)] text-gray-400">Positions 2 & 5</p>
					<svg viewBox="0 0 80 80" class="h-20 w-20">
						<circle cx="40" cy="40" r="32" fill="none" stroke="#333" stroke-width="1.5" />
						<line
							x1="40"
							y1="40"
							x2={40 + 26 * Math.sin(staticAngles.pos2)}
							y2={40 - 26 * Math.cos(staticAngles.pos2)}
							stroke="#60a5fa"
							stroke-width="2.5"
							stroke-linecap="round"
						/>
						<line
							x1="40"
							y1="40"
							x2={40 + 26 * Math.sin(staticAngles.pos5)}
							y2={40 - 26 * Math.cos(staticAngles.pos5)}
							stroke="#f97316"
							stroke-width="2.5"
							stroke-linecap="round"
						/>
						<path
							d="M {40 + 14 * Math.sin(staticAngles.pos2)} {40 -
								14 * Math.cos(staticAngles.pos2)} A 14 14 0 0 1 {40 +
								14 * Math.sin(staticAngles.pos5)} {40 - 14 * Math.cos(staticAngles.pos5)}"
							fill="none"
							stroke="#22c55e"
							stroke-width="2.5"
						/>
					</svg>
					<p class="mt-1 text-[var(--text-small)] text-emerald-400">distance = 3</p>
				</div>

				<span class="text-2xl text-emerald-400">=</span>

				<!-- Position 10 and 13 -->
				<div class="text-center">
					<p class="mb-2 text-[var(--text-small)] text-gray-400">Positions 10 & 13</p>
					<svg viewBox="0 0 80 80" class="h-20 w-20">
						<circle cx="40" cy="40" r="32" fill="none" stroke="#333" stroke-width="1.5" />
						<line
							x1="40"
							y1="40"
							x2={40 + 26 * Math.sin(staticAngles.pos10)}
							y2={40 - 26 * Math.cos(staticAngles.pos10)}
							stroke="#60a5fa"
							stroke-width="2.5"
							stroke-linecap="round"
						/>
						<line
							x1="40"
							y1="40"
							x2={40 + 26 * Math.sin(staticAngles.pos13)}
							y2={40 - 26 * Math.cos(staticAngles.pos13)}
							stroke="#f97316"
							stroke-width="2.5"
							stroke-linecap="round"
						/>
						<path
							d="M {40 + 14 * Math.sin(staticAngles.pos10)} {40 -
								14 * Math.cos(staticAngles.pos10)} A 14 14 0 0 1 {40 +
								14 * Math.sin(staticAngles.pos13)} {40 - 14 * Math.cos(staticAngles.pos13)}"
							fill="none"
							stroke="#22c55e"
							stroke-width="2.5"
						/>
					</svg>
					<p class="mt-1 text-[var(--text-small)] text-emerald-400">distance = 3</p>
				</div>

				<span class="text-2xl text-emerald-400">=</span>

				<!-- Position 100 and 103 -->
				<div class="text-center">
					<p class="mb-2 text-[var(--text-small)] text-gray-400">Positions 100 & 103</p>
					<svg viewBox="0 0 80 80" class="h-20 w-20">
						<circle cx="40" cy="40" r="32" fill="none" stroke="#333" stroke-width="1.5" />
						<line
							x1="40"
							y1="40"
							x2={40 + 26 * Math.sin(staticAngles.pos100)}
							y2={40 - 26 * Math.cos(staticAngles.pos100)}
							stroke="#60a5fa"
							stroke-width="2.5"
							stroke-linecap="round"
						/>
						<line
							x1="40"
							y1="40"
							x2={40 + 26 * Math.sin(staticAngles.pos103)}
							y2={40 - 26 * Math.cos(staticAngles.pos103)}
							stroke="#f97316"
							stroke-width="2.5"
							stroke-linecap="round"
						/>
						<path
							d="M {40 + 14 * Math.sin(staticAngles.pos100)} {40 -
								14 * Math.cos(staticAngles.pos100)} A 14 14 0 0 1 {40 +
								14 * Math.sin(staticAngles.pos103)} {40 - 14 * Math.cos(staticAngles.pos103)}"
							fill="none"
							stroke="#22c55e"
							stroke-width="2.5"
						/>
					</svg>
					<p class="mt-1 text-[var(--text-small)] text-emerald-400">distance = 3</p>
				</div>
			</div>
			<p class="mt-3 text-center text-[var(--text-small)] text-gray-500">
				<span class="text-blue-400">―</span> Q vector &nbsp;
				<span class="text-orange-400">―</span> K vector &nbsp;
				<span class="text-emerald-400">―</span> angle between them (same for all!)
			</p>
		</div>

		<!-- Why Only Q and K? (Not V) -->
		<div class="mb-4 rounded bg-[#0f3460] p-4">
			<p class="mb-3 font-semibold text-[var(--text-small)] text-emerald-400">
				Why Only Q and K? (Not V)
			</p>
			<p class="mb-3 text-[var(--text-small)] text-gray-300">
				RoPE rotates Q and K <em>only</em> — V stays unchanged. Why?
			</p>
			<div class="grid gap-4 md:grid-cols-2">
				<div class="rounded border border-blue-500/30 bg-[#1a1a2e] p-3">
					<p class="mb-2 font-semibold text-[var(--text-small)] text-blue-400">
						Q · K<sup>T</sup> = "Who pays attention to whom?"
					</p>
					<p class="text-[var(--text-small)] text-gray-300">
						The dot product between Q and K determines which tokens should attend to which.
						<strong class="text-white">This is where position matters most</strong> — information routing.
					</p>
					<p class="mt-2 text-[var(--text-small)] text-emerald-400">→ RoPE rotates Q and K</p>
				</div>
				<div class="rounded border border-gray-500/30 bg-[#1a1a2e] p-3">
					<p class="mb-2 font-semibold text-[var(--text-small)] text-gray-400">
						A · V = "What information to retrieve?"
					</p>
					<p class="text-[var(--text-small)] text-gray-300">
						Once attention weights are computed, V is just the information being retrieved — a
						weighted combination of token values.
					</p>
					<p class="mt-2 text-[var(--text-small)] text-gray-500">→ V stays unchanged</p>
				</div>
			</div>
			<div class="mt-3 rounded border border-orange-500/30 bg-[#1a1a2e] p-3">
				<p class="text-[var(--text-small)] text-gray-300">
					Q·K decides <em>which</em> tokens talk to each other (position-dependent). V is
					<em>what</em> they say (content, not position). RoPE only needs to affect routing, not content.
				</p>
			</div>
		</div>

		<!-- Content vs Position: The Radio Signal Story -->
		<div class="rounded border border-yellow-500/40 bg-[#1a1a2e] p-4">
			<p class="mb-2 font-semibold text-[var(--text-body)] text-white">
				<span class="text-yellow-400">[Intuition]</span> The Radio Signal
			</p>
			<p class="mb-3 text-[var(--text-body)] text-gray-300">
				"If we rotate the vector, don't we mess up the word's meaning?" This is the most common
				concern about RoPE. The answer lies in how information is encoded:
			</p>
			<div class="mb-3 rounded bg-[#0f3460] p-3">
				<p class="mb-2 font-semibold text-[var(--text-small)] text-cyan-400">
					Think of it like a radio signal:
				</p>
				<div class="grid gap-3 text-[var(--text-small)] md:grid-cols-2">
					<div class="rounded bg-[#1a1a2e] p-2">
						<p class="font-semibold text-orange-400">Carrier Wave = Position</p>
						<p class="text-gray-400">The rotation (phase) of the vector — where the word is</p>
					</div>
					<div class="rounded bg-[#1a1a2e] p-2">
						<p class="font-semibold text-blue-400">Modulation = Content</p>
						<p class="text-gray-400">The magnitude and internal relationships — what the word is</p>
					</div>
				</div>
			</div>
			<p class="mb-2 text-[var(--text-small)] text-gray-300">
				The model learns to "tune" to both signals simultaneously. The linear projection layers (W<sub
					>Q</sub
				>, W<sub>K</sub>) learn to organize information so that:
			</p>
			<ul class="ml-4 list-disc space-y-1 text-[var(--text-small)] text-gray-400">
				<li>
					<strong class="text-white">Semantic meaning</strong> is encoded in the vector's magnitude and
					dimension ratios
				</li>
				<li>
					<strong class="text-white">Position</strong> is encoded in the rotation angle (phase)
				</li>
			</ul>
			<p class="mt-3 text-[var(--text-small)] text-gray-500 italic">
				Just like a radio receiver can separate the carrier from the message, attention heads learn
				to read both the "where" (rotation) and the "what" (everything else) from the same rotated
				vector.
			</p>
		</div>
	</Section>

	<!-- 4. How RoPE Rotates: Pairs of Dimensions -->
	<Section>
		<h3 class="mb-2 font-semibold text-[#e94560] text-[var(--text-h2)]">
			4. How RoPE Rotates: Pairs of Dimensions
		</h3>
		<p class="mb-3 text-[var(--text-body)] text-gray-300">
			We can't rotate a single number. But we <em>can</em> rotate pairs of numbers in 2D. That's what
			RoPE does.
		</p>

		<!-- Why Pairs? The Geometry of Rotation -->
		<div class="mb-4 rounded border border-yellow-500/40 bg-[#1a1a2e] p-3">
			<p class="mb-2 font-semibold text-[var(--text-small)] text-white">
				<span class="text-yellow-400">[Intuition]</span> Why Pairs? The Geometry of Rotation
			</p>
			<p class="mb-2 text-[var(--text-small)] text-gray-300">
				You can't rotate a single number — there's nowhere to rotate <em>to</em>. In 1D, you only
				have forward and backward. But in 2D, you have a full circle of directions.
			</p>
			<div class="mb-2 grid gap-2 text-[var(--text-small)] md:grid-cols-3">
				<div class="rounded border border-red-500/30 bg-[#0f3460] p-2 text-center">
					<p class="font-semibold text-red-400">1D: No rotation</p>
					<p class="text-gray-500">Only +/- direction</p>
					<p class="text-[var(--text-tiny)] text-gray-600">Can't encode position</p>
				</div>
				<div class="rounded border border-emerald-500/30 bg-[#0f3460] p-2 text-center">
					<p class="font-semibold text-emerald-400">2D: Minimal rotation</p>
					<p class="text-gray-500">Full circle of angles</p>
					<p class="text-[var(--text-tiny)] text-gray-600">Exactly 1 parameter (θ)</p>
				</div>
				<div class="rounded border border-gray-500/30 bg-[#0f3460] p-2 text-center">
					<p class="font-semibold text-gray-400">3D+: Over-parameterized</p>
					<p class="text-gray-500">3D needs 3 angles</p>
					<p class="text-[var(--text-tiny)] text-gray-600">Extra complexity, no benefit</p>
				</div>
			</div>
			<p class="text-[var(--text-small)] text-gray-400">
				<strong class="text-yellow-400">2D is the "Goldilocks zone"</strong> — the smallest number of
				dimensions needed to define a rotation around a fixed point. Using pairs is the most compressed
				way to encode relative position mathematically. Anything smaller can't rotate; anything larger
				adds complexity without adding more positional information.
			</p>
		</div>

		<!-- Why 2D pairs instead of full d-dimensional rotation? -->
		<div class="mb-4 rounded border border-orange-500/30 bg-[#1a1a2e] p-3">
			<p class="mb-2 font-semibold text-[var(--text-small)] text-orange-400">
				Why 2D pairs instead of full d-dimensional rotation?
			</p>
			<div class="mb-3 grid gap-3 text-[var(--text-small)] text-gray-300 md:grid-cols-2">
				<div>
					<p class="font-semibold text-white">Efficient: O(d) vs O(d²)</p>
					<p class="text-gray-400">
						2D = just 2 cos + 2 sin per pair. Full d×d matrix = millions of operations.
					</p>
				</div>
				<div>
					<p class="font-semibold text-white">No parameters to learn</p>
					<p class="text-gray-400">
						2D rotation needs 1 angle. d-dim rotation needs d(d-1)/2 parameters (~8M for d=4096).
					</p>
				</div>
				<div>
					<p class="font-semibold text-white">Independence = multi-scale</p>
					<p class="text-gray-400">
						Separate pairs = independent channels at different frequencies. Full rotation mixes
						everything.
					</p>
				</div>
				<div>
					<p class="font-semibold text-white">Interpretable</p>
					<p class="text-gray-400">
						We know exactly how much each pair rotates. Higher-dim rotations are opaque.
					</p>
				</div>
			</div>
			<p class="text-center text-[var(--text-tiny)] text-gray-500">
				The "limitation" of 2D is actually the strength: independent pairs give you multi-scale
				position encoding for free.
			</p>
		</div>

		<!-- Split into pairs -->
		<div class="mb-4 rounded bg-[#0f3460] p-4">
			<p class="mb-3 font-semibold text-[var(--text-small)] text-emerald-400">
				Step 1: Split Each Token's Vector into Pairs
			</p>
			<p class="mb-3 text-[var(--text-small)] text-gray-300">
				Both <span class="text-blue-400">"The" (pos 0)</span> and
				<span class="text-orange-400">"mat" (pos 5)</span> have 8-dim vectors → 4 pairs each:
			</p>

			<div class="mb-4 grid gap-4 md:grid-cols-2">
				<!-- "The" token -->
				<div class="rounded bg-[#1a1a2e] p-3">
					<p class="mb-2 font-semibold text-[var(--text-small)] text-blue-400">
						"The" (position 0) — K vector
					</p>
					<div class="flex flex-wrap gap-1">
						<span class="rounded bg-blue-900/30 px-2 py-1 text-[var(--text-tiny)] text-blue-300"
							>[k₀,k₁]</span
						>
						<span class="rounded bg-blue-900/30 px-2 py-1 text-[var(--text-tiny)] text-blue-300"
							>[k₂,k₃]</span
						>
						<span class="rounded bg-blue-900/30 px-2 py-1 text-[var(--text-tiny)] text-blue-300"
							>[k₄,k₅]</span
						>
						<span class="rounded bg-blue-900/30 px-2 py-1 text-[var(--text-tiny)] text-blue-300"
							>[k₆,k₇]</span
						>
					</div>
					<p class="mt-2 text-[var(--text-tiny)] text-gray-500">
						Each pair rotated by 0 × θ = 0 (no rotation)
					</p>
				</div>

				<!-- "mat" token -->
				<div class="rounded bg-[#1a1a2e] p-3">
					<p class="mb-2 font-semibold text-[var(--text-small)] text-orange-400">
						"mat" (position 5) — Q vector
					</p>
					<div class="flex flex-wrap gap-1">
						<span class="rounded bg-orange-900/30 px-2 py-1 text-[var(--text-tiny)] text-orange-300"
							>[q₀,q₁]</span
						>
						<span class="rounded bg-orange-900/30 px-2 py-1 text-[var(--text-tiny)] text-orange-300"
							>[q₂,q₃]</span
						>
						<span class="rounded bg-orange-900/30 px-2 py-1 text-[var(--text-tiny)] text-orange-300"
							>[q₄,q₅]</span
						>
						<span class="rounded bg-orange-900/30 px-2 py-1 text-[var(--text-tiny)] text-orange-300"
							>[q₆,q₇]</span
						>
					</div>
					<p class="mt-2 text-[var(--text-tiny)] text-gray-500">Each pair rotated by 5 × θ</p>
				</div>
			</div>

			<!-- How pairs interact -->
			<p class="mb-2 font-semibold text-[var(--text-small)] text-emerald-400">
				How Pairs Interact (Q · K)
			</p>
			<p class="mb-3 text-[var(--text-small)] text-gray-300">
				Attention compares <em>corresponding</em> pairs. Each pair contributes to the final score:
			</p>
			<div class="space-y-2 font-mono text-[var(--text-small)]">
				<div class="flex items-center gap-2 rounded bg-[#1a1a2e] p-2">
					<span class="text-orange-400">[q₀,q₁]</span>
					<span class="text-gray-500">rotated 5×θ₀</span>
					<span class="text-gray-400">·</span>
					<span class="text-blue-400">[k₀,k₁]</span>
					<span class="text-gray-500">rotated 0×θ₀</span>
					<span class="text-gray-400">=</span>
					<span class="text-emerald-400">angle diff 5×θ₀</span>
				</div>
				<div class="flex items-center gap-2 rounded bg-[#1a1a2e] p-2">
					<span class="text-orange-400">[q₂,q₃]</span>
					<span class="text-gray-500">rotated 5×θ₁</span>
					<span class="text-gray-400">·</span>
					<span class="text-blue-400">[k₂,k₃]</span>
					<span class="text-gray-500">rotated 0×θ₁</span>
					<span class="text-gray-400">=</span>
					<span class="text-emerald-400">angle diff 5×θ₁</span>
				</div>
				<div class="flex items-center gap-2 rounded bg-[#1a1a2e] p-2 opacity-60">
					<span class="text-gray-400">... pair 2 and pair 3 similarly ...</span>
				</div>
			</div>
			<!-- Why different scales in the same token -->
			<div class="mt-3 rounded bg-[#1a1a2e] p-3">
				<p class="mb-2 font-semibold text-[var(--text-small)] text-cyan-400">
					Why different scales in the same token?
				</p>

				<!-- Key insight: dot product is SUM of pair contributions -->
				<div class="mb-3 rounded bg-[#0f3460] p-3">
					<p class="mb-2 font-semibold text-[var(--text-small)] text-white">
						The attention score is a SUM of pair contributions:
					</p>
					<div class="mb-2 rounded bg-[#1a1a2e] p-2 text-center font-mono text-[var(--text-small)]">
						<p class="text-gray-300">
							score = <span class="text-blue-400">(pair 0)</span> +
							<span class="text-green-400">(pair 1)</span>
							+ <span class="text-yellow-400">(pair 2)</span> +
							<span class="text-orange-400">(pair 3)</span>
						</p>
					</div>
					<p class="text-[var(--text-small)] text-gray-400">
						Each pair contributes independently. The model learns <strong class="text-white"
							>which pairs to trust</strong
						> for different decisions.
					</p>
				</div>

				<!-- Concrete example with actual angles -->
				<p class="mb-2 font-semibold text-[var(--text-small)] text-emerald-400">
					Concrete example with actual angles:
				</p>
				<p class="mb-2 text-[var(--text-small)] text-gray-400">
					Let's say <span class="text-blue-400">θ₀ = 60°</span> (fast) and
					<span class="text-orange-400">θ₃ = 0.06°</span> (slow):
				</p>

				<div class="mb-3 overflow-x-auto">
					<table class="w-full text-[var(--text-small)]">
						<thead>
							<tr class="border-b border-gray-700">
								<th class="px-2 py-1 text-left text-gray-400">Distance</th>
								<th class="px-2 py-1 text-left text-blue-400">Pair 0 angle (fast, θ=60°)</th>
								<th class="px-2 py-1 text-left text-orange-400">Pair 3 angle (slow, θ=0.06°)</th>
							</tr>
						</thead>
						<tbody class="font-mono text-gray-300">
							<tr class="border-b border-gray-800">
								<td class="px-2 py-1">1</td>
								<td class="px-2 py-1 text-blue-300">60°</td>
								<td class="px-2 py-1 text-orange-300">0.06°</td>
							</tr>
							<tr class="border-b border-gray-800">
								<td class="px-2 py-1">2</td>
								<td class="px-2 py-1 text-blue-300">120°</td>
								<td class="px-2 py-1 text-orange-300">0.12°</td>
							</tr>
							<tr class="border-b border-gray-800">
								<td class="px-2 py-1">1000</td>
								<td class="px-2 py-1 text-blue-300"
									>60000° → <span class="text-red-400">240°</span> (wrapped)</td
								>
								<td class="px-2 py-1 text-orange-300">60°</td>
							</tr>
							<tr class="border-b border-gray-800">
								<td class="px-2 py-1">1001</td>
								<td class="px-2 py-1 text-blue-300"
									>60060° → <span class="text-red-400">300°</span> (wrapped)</td
								>
								<td class="px-2 py-1 text-orange-300">60.06°</td>
							</tr>
						</tbody>
					</table>
				</div>

				<!-- Analysis for nearby tokens -->
				<div class="mb-3 grid gap-3 text-[var(--text-small)] md:grid-cols-2">
					<div class="rounded bg-[#0f3460] p-2">
						<p class="mb-1 font-semibold text-emerald-400">For nearby tokens (1 vs 2):</p>
						<p class="text-blue-300">
							Pair 0: 60° vs 120° — <strong class="text-white">big difference!</strong>
						</p>
						<p class="text-orange-300">Pair 3: 0.06° vs 0.12° — basically identical</p>
						<p class="mt-1 text-gray-400">
							→ Model uses <span class="text-blue-400">fast pair</span> to distinguish
						</p>
					</div>
					<div class="rounded bg-[#0f3460] p-2">
						<p class="mb-1 font-semibold text-emerald-400">For far tokens (1000 vs 1001):</p>
						<p class="text-blue-300">
							Pair 0: 240° vs 300° — <span class="text-red-400">wrapped, noisy</span>
						</p>
						<p class="text-orange-300">
							Pair 3: 60° vs 60.06° — <strong class="text-white">still distinguishable!</strong>
						</p>
						<p class="mt-1 text-gray-400">
							→ Model uses <span class="text-orange-400">slow pair</span> to distinguish
						</p>
					</div>
				</div>

				<!-- Analogy -->
				<div class="mb-3 rounded bg-[#0f3460] p-2">
					<p class="mb-1 font-semibold text-[var(--text-small)] text-cyan-400">
						<span class="text-purple-400">[Intuition]</span> Multi-resolution sensors
					</p>
					<p class="text-[var(--text-small)] text-gray-400">
						Fast pairs = high-resolution sensor (precise nearby, but "overflows" at distance). Slow
						pairs = wide-range sensor (less precise nearby, but works at any distance).
						<strong class="text-white"
							>The model learns which pairs to weight for each comparison.</strong
						>
					</p>
				</div>

				<!-- Clock Hand Analogy -->
				<div class="mb-3 rounded border border-yellow-500/40 bg-[#1a1a2e] p-3">
					<p class="mb-2 font-semibold text-[var(--text-small)] text-white">
						<span class="text-yellow-400">[Intuition]</span> The Clock with Many Hands
					</p>
					<p class="mb-2 text-[var(--text-small)] text-gray-300">
						Picture RoPE as a clock with dozens of hands, all starting at 12 o'clock:
					</p>
					<div class="mb-2 grid grid-cols-3 gap-2 text-[var(--text-small)]">
						<div class="rounded bg-[#0f3460] p-2 text-center">
							<p class="font-semibold text-blue-400">First pairs</p>
							<p class="text-gray-400">The <strong class="text-white">seconds hand</strong></p>
							<p class="text-[var(--text-tiny)] text-gray-500">
								Spins fast, tracks precise local timing
							</p>
						</div>
						<div class="rounded bg-[#0f3460] p-2 text-center">
							<p class="font-semibold text-green-400">Middle pairs</p>
							<p class="text-gray-400">The <strong class="text-white">minute hand</strong></p>
							<p class="text-[var(--text-tiny)] text-gray-500">
								Moderate pace, paragraph-scale patterns
							</p>
						</div>
						<div class="rounded bg-[#0f3460] p-2 text-center">
							<p class="font-semibold text-orange-400">Last pairs</p>
							<p class="text-gray-400">The <strong class="text-white">century hand</strong></p>
							<p class="text-[var(--text-tiny)] text-gray-500">
								Barely moves, tracks themes across a book
							</p>
						</div>
					</div>
					<p class="text-[var(--text-small)] text-gray-400">
						The model doesn't just get <em>one</em> position signal — it receives a
						<strong class="text-white">timestamp</strong>
						composed of many different scales of time simultaneously. Each attention head can learn to
						"read" whichever hands are most useful for its task.
					</p>
				</div>

				<!-- Interactive visualization: Fast vs Slow pair -->
				<div class="mb-3 rounded bg-[#0f3460] p-3">
					<p class="mb-3 font-semibold text-[var(--text-small)] text-emerald-400">
						Try it: Watch fast pair wrap while slow pair stays steady
					</p>

					<div class="mb-4 flex items-center justify-center gap-3">
						<span class="text-[var(--text-small)] text-gray-400">Distance:</span>
						<input
							type="range"
							bind:value={distanceDemo}
							min="1"
							max="2000"
							class="w-40 accent-emerald-500"
							aria-label="Distance between tokens"
						/>
						<span class="w-16 font-mono text-[var(--text-body)] text-white">{distanceDemo}</span>
					</div>

					<div class="grid gap-4 md:grid-cols-2">
						<!-- Fast pair visualization (uses $derived values from script) -->
						<div class="rounded bg-[#1a1a2e] p-3 text-center">
							<p class="mb-2 font-semibold text-[var(--text-small)] text-blue-400">
								Fast Pair (θ = 60°/pos)
							</p>
							<svg viewBox="0 0 100 100" class="mx-auto h-24 w-24">
								<circle cx="50" cy="50" r="40" fill="none" stroke="#333" stroke-width="2" />
								<!-- Reference line at 0° -->
								<line
									x1="50"
									y1="50"
									x2="50"
									y2="12"
									stroke="#555"
									stroke-width="1"
									stroke-dasharray="3"
								/>
								<!-- Rotated vector -->
								<line
									x1="50"
									y1="50"
									x2={50 + 35 * Math.sin(fastRad)}
									y2={50 - 35 * Math.cos(fastRad)}
									stroke={fastWrapped ? '#ef4444' : '#60a5fa'}
									stroke-width="3"
									stroke-linecap="round"
								/>
								<circle
									cx={50 + 35 * Math.sin(fastRad)}
									cy={50 - 35 * Math.cos(fastRad)}
									r="4"
									fill={fastWrapped ? '#ef4444' : '#60a5fa'}
								/>
								<circle cx="50" cy="50" r="3" fill="#60a5fa" />
							</svg>
							<p class="mt-2 font-mono text-[var(--text-small)]">
								<span class={fastWrapped ? 'text-red-400' : 'text-blue-300'}
									>{fastAngle.toFixed(0)}°</span
								>
								{#if fastWrapped}
									<span class="text-[var(--text-tiny)] text-red-400">
										(wrapped {fastWrapCount}×)</span
									>
								{/if}
							</p>
							<p class="mt-1 text-[var(--text-tiny)] text-gray-500">
								{fastWrapped ? 'Lost track of actual distance!' : 'Clear angle difference'}
							</p>
						</div>

						<!-- Slow pair visualization (uses $derived values from script) -->
						<div class="rounded bg-[#1a1a2e] p-3 text-center">
							<p class="mb-2 font-semibold text-[var(--text-small)] text-orange-400">
								Slow Pair (θ = 0.06°/pos)
							</p>
							<svg viewBox="0 0 100 100" class="mx-auto h-24 w-24">
								<circle cx="50" cy="50" r="40" fill="none" stroke="#333" stroke-width="2" />
								<!-- Reference line at 0° -->
								<line
									x1="50"
									y1="50"
									x2="50"
									y2="12"
									stroke="#555"
									stroke-width="1"
									stroke-dasharray="3"
								/>
								<!-- Rotated vector -->
								<line
									x1="50"
									y1="50"
									x2={50 + 35 * Math.sin(slowRad)}
									y2={50 - 35 * Math.cos(slowRad)}
									stroke={slowWrapped ? '#ef4444' : '#f97316'}
									stroke-width="3"
									stroke-linecap="round"
								/>
								<circle
									cx={50 + 35 * Math.sin(slowRad)}
									cy={50 - 35 * Math.cos(slowRad)}
									r="4"
									fill={slowWrapped ? '#ef4444' : '#f97316'}
								/>
								<circle cx="50" cy="50" r="3" fill="#f97316" />
							</svg>
							<p class="mt-2 font-mono text-[var(--text-small)]">
								<span class={slowWrapped ? 'text-red-400' : 'text-orange-300'}
									>{slowAngle.toFixed(2)}°</span
								>
							</p>
							<p class="mt-1 text-[var(--text-tiny)] text-gray-500">
								{slowWrapped ? 'Finally wrapped!' : 'Never wraps at this distance'}
							</p>
						</div>
					</div>

					<!-- Dynamic insight based on distance -->
					<div class="mt-3 text-center">
						{#if distanceDemo <= 6}
							<p class="text-[var(--text-small)] text-blue-400">
								At distance {distanceDemo}: <strong class="text-white">Fast pair is useful</strong> —
								clear angle differences between nearby positions.
							</p>
						{:else if distanceDemo < 100}
							<p class="text-[var(--text-small)] text-yellow-400">
								At distance {distanceDemo}: Fast pair has wrapped {Math.floor(
									(distanceDemo * FAST_THETA) / 360
								)}× — getting noisy. Slow pair still clear.
							</p>
						{:else}
							<p class="text-[var(--text-small)] text-orange-400">
								At distance {distanceDemo}: Fast pair is <span class="text-red-400">aliased</span>
								(wrapped {Math.floor((distanceDemo * FAST_THETA) / 360)}×).
								<strong class="text-white">Slow pair disambiguates.</strong>
							</p>
						{/if}
					</div>
				</div>

				<p class="text-center font-semibold text-[var(--text-small)] text-emerald-400">
					One vector, multiple "sensors" — each pair helps with a different distance range.
				</p>

				<!-- Clarification: Does dimension count limit positions? -->
				<div class="mt-3 rounded bg-[#0f3460] p-2">
					<p class="mb-1 font-semibold text-[var(--text-tiny)] text-cyan-400">
						Does more pairs mean longer context support?
					</p>
					<p class="text-[var(--text-tiny)] text-gray-400">
						<strong class="text-white">No.</strong> "mat" attends to ALL positions regardless of
						pair count. More pairs = <em>richer</em> positional signal (more "sensors"), not more
						positions. The actual context limit comes from the
						<strong class="text-orange-400">base</strong> — if positions get too large, even slow pairs
						wrap around. That's why models like LLaMA 3 use higher bases (e.g., base=500,000 vs 10,000
						default) for long context.
					</p>
				</div>
			</div>
		</div>

		<!-- Rotate each pair -->
		<div class="mb-4 rounded bg-[#0f3460] p-4">
			<p class="mb-3 font-semibold text-[var(--text-small)] text-emerald-400">
				Step 2: Rotate Each Pair — Position Becomes the Angle
			</p>
			<p class="mb-3 text-[var(--text-small)] text-gray-300">
				The rotation angle = <strong class="text-white">position × base frequency</strong>. So "mat"
				at position 5 rotates 5× as much as position 1:
			</p>
			<div class="mb-3 grid grid-cols-2 gap-2 md:grid-cols-4">
				<div class="rounded bg-[#1a1a2e] p-2 text-center">
					<p class="text-[var(--text-small)] text-blue-400">pair 0</p>
					<p class="text-[var(--text-small)] text-white">
						<span class="text-orange-400">5</span> × θ₀ = 5θ₀
					</p>
					<p class="text-[var(--text-tiny)] text-gray-500">fast rotation</p>
				</div>
				<div class="rounded bg-[#1a1a2e] p-2 text-center">
					<p class="text-[var(--text-small)] text-green-400">pair 1</p>
					<p class="text-[var(--text-small)] text-white">
						<span class="text-orange-400">5</span> × θ₁ = 5θ₁
					</p>
					<p class="text-[var(--text-tiny)] text-gray-500">medium</p>
				</div>
				<div class="rounded bg-[#1a1a2e] p-2 text-center">
					<p class="text-[var(--text-small)] text-yellow-400">pair 2</p>
					<p class="text-[var(--text-small)] text-white">
						<span class="text-orange-400">5</span> × θ₂ = 5θ₂
					</p>
					<p class="text-[var(--text-tiny)] text-gray-500">slow</p>
				</div>
				<div class="rounded bg-[#1a1a2e] p-2 text-center">
					<p class="text-[var(--text-small)] text-orange-400">pair 3</p>
					<p class="text-[var(--text-small)] text-white">
						<span class="text-orange-400">5</span> × θ₃ = 5θ₃
					</p>
					<p class="text-[var(--text-tiny)] text-gray-500">very slow</p>
				</div>
			</div>
			<div class="mt-3 rounded bg-[#1a1a2e] p-3">
				<p class="mb-1 font-semibold text-[var(--text-small)] text-emerald-400">
					What this accomplishes:
				</p>
				<p class="text-[var(--text-small)] text-gray-300">
					Each position induces a rotation (wrapping mod 2π); across many frequency pairs, the
					combined pattern gives a <strong class="text-white">rich position signal</strong>. When Q
					(position 5) and K (position 0) are compared, the angle between them is
					<span class="text-emerald-400">(5−0)×θ = 5θ</span> — encoding their distance directly into the
					attention score.
				</p>
			</div>

			<div class="mt-3 rounded bg-[#1a1a2e] p-3">
				<p class="mb-2 font-semibold text-[var(--text-small)] text-cyan-400">
					Why different θ for each pair?
				</p>
				<p class="text-[var(--text-small)] text-gray-300">
					Different pairs "see" the same distance at different scales — early pairs (high θ) are
					sensitive to small differences; later pairs (low θ) stay stable at long distances. See the
					interactive demo above for details.
				</p>
			</div>
		</div>

		<!-- The rotation formula -->
		<div class="mb-4 rounded bg-[#0f3460] p-4">
			<p class="mb-3 font-semibold text-[var(--text-small)] text-emerald-400">
				Step 3: The 2D Rotation Formula
			</p>

			<!-- What we're rotating -->
			<p class="mb-3 text-[var(--text-small)] text-gray-300">
				Take one pair from the vector, e.g., <span class="text-blue-400">[q₀, q₁]</span> from "mat"
				at position 5. We want to rotate this 2D point by angle
				<span class="text-orange-400">α = 5 × θ₀</span>.
			</p>

			<!-- The matrix form -->
			<div class="mb-3 rounded bg-[#1a1a2e] p-3">
				<p class="mb-2 text-[var(--text-small)] text-gray-400">
					The rotation matrix R<sub>α</sub>:
				</p>
				<div class="flex items-center justify-center gap-2 font-mono text-[var(--text-body)]">
					<span class="text-gray-300">[q₀', q₁'] = </span>
					<div class="rounded border border-gray-600 p-2">
						<div class="grid grid-cols-2 gap-x-3 text-[var(--text-small)]">
							<span class="text-emerald-400">cos(α)</span>
							<span class="text-orange-400">−sin(α)</span>
							<span class="text-orange-400">sin(α)</span>
							<span class="text-emerald-400">cos(α)</span>
						</div>
					</div>
					<span class="text-gray-300">×</span>
					<div class="rounded border border-gray-600 p-2">
						<div class="text-[var(--text-small)]">
							<p class="text-blue-400">q₀</p>
							<p class="text-blue-400">q₁</p>
						</div>
					</div>
				</div>
			</div>

			<!-- Expanded formula -->
			<div class="mb-3 rounded bg-[#1a1a2e] p-3">
				<p class="mb-2 text-[var(--text-small)] text-gray-400">Which expands to:</p>
				<div class="space-y-1 text-center font-mono text-[var(--text-small)]">
					<p>
						<span class="text-blue-400">q₀'</span> = <span class="text-blue-400">q₀</span> ×
						<span class="text-emerald-400">cos(α)</span>
						− <span class="text-blue-400">q₁</span> × <span class="text-orange-400">sin(α)</span>
					</p>
					<p>
						<span class="text-blue-400">q₁'</span> = <span class="text-blue-400">q₀</span> ×
						<span class="text-orange-400">sin(α)</span>
						+ <span class="text-blue-400">q₁</span> × <span class="text-emerald-400">cos(α)</span>
					</p>
				</div>
			</div>

			<!-- Concrete example -->
			<div class="mb-3 rounded bg-[#1a1a2e] p-3">
				<p class="mb-2 text-[var(--text-small)] text-gray-400">
					Concrete example: rotate [3, 4] by 30°
				</p>
				<div class="grid gap-3 text-[var(--text-small)] md:grid-cols-2">
					<div>
						<p class="font-mono text-gray-300">cos(30°) ≈ 0.866</p>
						<p class="font-mono text-gray-300">sin(30°) = 0.5</p>
					</div>
					<div>
						<p class="font-mono">
							<span class="text-blue-400">q₀'</span> = 3×0.866 − 4×0.5 =
							<span class="text-white">0.6</span>
						</p>
						<p class="font-mono">
							<span class="text-blue-400">q₁'</span> = 3×0.5 + 4×0.866 =
							<span class="text-white">4.96</span>
						</p>
					</div>
				</div>
				<p class="mt-2 text-center text-[var(--text-tiny)] text-gray-500">
					The point [3, 4] rotated 30° counterclockwise becomes [0.6, 4.96]
				</p>
			</div>

			<!-- Visual -->
			<div class="mb-3 flex justify-center">
				<svg viewBox="-1 -1 8 8" class="h-32 w-32">
					<!-- Grid -->
					<line x1="0" y1="0" x2="6" y2="0" stroke="#333" stroke-width="0.05" />
					<line x1="0" y1="0" x2="0" y2="6" stroke="#333" stroke-width="0.05" />
					<!-- Original vector -->
					<line
						x1="0"
						y1="0"
						x2={rotationExample.origX}
						y2={rotationExample.origY}
						stroke="#60a5fa"
						stroke-width="0.15"
						stroke-linecap="round"
					/>
					<circle cx={rotationExample.origX} cy={rotationExample.origY} r="0.2" fill="#60a5fa" />
					<text
						x={rotationExample.origX + 0.3}
						y={rotationExample.origY}
						font-size="0.5"
						fill="#60a5fa">[3,4]</text
					>
					<!-- Rotated vector -->
					<line
						x1="0"
						y1="0"
						x2={rotationExample.rotX}
						y2={rotationExample.rotY}
						stroke="#f97316"
						stroke-width="0.15"
						stroke-linecap="round"
					/>
					<circle cx={rotationExample.rotX} cy={rotationExample.rotY} r="0.2" fill="#f97316" />
					<text
						x={rotationExample.rotX - 1.2}
						y={rotationExample.rotY + 0.5}
						font-size="0.5"
						fill="#f97316">[0.6, 5]</text
					>
					<!-- Arc showing rotation -->
					<path
						d="M {rotationExample.origX * 0.4} {rotationExample.origY *
							0.4} A 2 2 0 0 1 {rotationExample.rotX * 0.4} {rotationExample.rotY * 0.4}"
						fill="none"
						stroke="#22c55e"
						stroke-width="0.08"
					/>
					<text x="1.5" y="2.5" font-size="0.4" fill="#22c55e">30°</text>
				</svg>
			</div>

			<!-- Connection to RoPE -->
			<div class="rounded bg-[#0f3460] p-2">
				<p class="mb-1 font-semibold text-[var(--text-small)] text-cyan-400">In RoPE:</p>
				<p class="text-[var(--text-small)] text-gray-400">
					The angle = <span class="text-orange-400">position × θ</span>. So for "mat" at position 5
					with θ₀ = 60°, the angle is <span class="text-white">5 × 60° = 300°</span>. This rotation
					is applied to pair [q₀, q₁]. Other pairs use different θ values.
				</p>
			</div>

			<!-- The math -->
			<div class="mt-4 rounded border border-emerald-500/50 bg-[#1a1a2e] p-4">
				<p class="mb-2 font-semibold text-[var(--text-body)] text-white">
					<span class="text-cyan-400">[Guarantee]</span> The Math (One Line)
				</p>
				<div class="mb-3 rounded bg-[#0f3460] p-3 text-center font-mono">
					<p class="text-[var(--text-body)]">
						<span class="text-blue-400">R<sub>m</sub></span> ·
						<span class="text-orange-400">R<sub>n</sub></span><sup>T</sup> =
						<span class="text-emerald-400">R<sub>m−n</sub></span>
					</p>
				</div>
				<p class="text-[var(--text-small)] text-gray-300">
					The transpose of a rotation matrix is its inverse (rotating backwards). So rotating by m
					then "unrotating" by n leaves just the <em>difference</em> (m−n).
				</p>
				<p class="mt-2 text-[var(--text-small)] text-gray-500 italic">
					This is mathematically guaranteed for any rotation matrices. The positional effect on q<sub
						>m</sub
					><sup>T</sup>k<sub>n</sub>
					becomes a function of (m−n) only.
				</p>
			</div>
		</div>

		<!-- Complex Number Form (Alternative View) -->
		<div class="mb-4 rounded bg-[#0f3460] p-4">
			<p class="mb-3 font-semibold text-[var(--text-small)] text-purple-400">
				Alternative View: Complex Numbers
			</p>
			<p class="mb-3 text-[var(--text-small)] text-gray-300">
				<span class="text-cyan-400">[Intuition]</span> Many find RoPE clearest when viewing each pair
				as a complex number. 2D rotation becomes simple multiplication:
			</p>

			<div class="mb-3 rounded bg-[#1a1a2e] p-3">
				<div class="space-y-2 text-center font-mono text-[var(--text-small)]">
					<p class="text-gray-400">
						Treat pair as complex: <span class="text-blue-400"
							>z<sub>i</sub> = x<sub>2i</sub> + i·x<sub>2i+1</sub></span
						>
					</p>
					<p class="text-gray-400">
						Rotate via: <span class="text-emerald-400"
							>z'<sub>i</sub> = z<sub>i</sub> · e<sup>i·m·θ<sub>i</sub></sup></span
						>
					</p>
				</div>
			</div>

			<p class="text-[var(--text-small)] text-gray-400">
				This is exactly equivalent to the matrix form — Euler's formula gives us e<sup>iθ</sup> =
				cos(θ) + i·sin(θ). The "relative phase" property feels natural: multiplying e<sup>imθ</sup>
				· e<sup>−inθ</sup> = e<sup>i(m−n)θ</sup>.
			</p>
			<p class="mt-3 text-[var(--text-tiny)] text-gray-500 italic">
				To understand complex numbers more, watch
				<a
					href="https://www.youtube.com/watch?v=f8CXG7dS-D0"
					target="_blank"
					class="text-cyan-400 hover:text-cyan-300">"The most beautiful equation in math"</a
				>
				from Welch Labs.
			</p>
		</div>

		<!-- Implementation: rotate_half trick -->
		<div class="mb-4 rounded bg-[#0f3460] p-4">
			<p class="mb-3 font-semibold text-[var(--text-small)] text-amber-400">
				Implementation Detail: The rotate_half Trick
			</p>
			<p class="mb-3 text-[var(--text-small)] text-gray-300">
				Real implementations avoid explicit matrix multiplication. The common pattern:
			</p>

			<div class="rounded bg-[#1a1a2e] p-3 font-mono text-[11px]">
				<p class="text-gray-500"># Pseudocode (PyTorch-style)</p>
				<p class="mt-1 text-gray-300">def rotate_half(x):</p>
				<p class="ml-4 text-gray-400">
					x1, x2 = x[..., ::2], x[..., 1::2] <span class="text-gray-500"># split even/odd</span>
				</p>
				<p class="ml-4 text-gray-400">
					return torch.cat([-x2, x1], dim=-1) <span class="text-gray-500"># swap & sign-flip</span>
				</p>
				<p class="mt-2 text-gray-300">def apply_rope(x, cos, sin):</p>
				<p class="ml-4 text-gray-400">return x * cos + rotate_half(x) * sin</p>
			</div>

			<p class="mt-3 text-[var(--text-small)] text-gray-500 italic">
				This is O(d) element-wise ops — no matrix multiplication needed. The cos/sin are precomputed
				for all positions.
			</p>
		</div>

		<!-- Partial RoPE -->
		<div class="rounded border border-gray-500/30 bg-[#1a1a2e] p-3">
			<p class="mb-2 font-semibold text-[var(--text-small)] text-gray-400">Variant: Partial RoPE</p>
			<p class="text-[var(--text-small)] text-gray-400">
				Some models apply RoPE to only a fraction of head dimensions (e.g., first 25% or 50% of d<sub
					>head</sub
				>), leaving the rest as "semantic-only" dimensions. This trades some positional signal for
				more content-only comparison capacity. Common in models optimizing for specific tradeoffs.
			</p>
		</div>
	</Section>

	<!-- 5. The Frequency Formula and What θ Controls -->
	<Section>
		<h3 class="mb-2 font-semibold text-[#e94560] text-[var(--text-h2)]">
			5. The Frequency Formula and What θ Controls
		</h3>
		<p class="mb-3 text-[var(--text-body)] text-gray-300">
			RoPE uses the same frequency formula as sinusoidal PE, but applies it as rotation:
		</p>

		<div class="mb-4 rounded bg-[#0f3460] p-3">
			<div class="text-center font-mono text-[var(--text-body)] text-gray-300">
				<p>
					θ<sub>i</sub> = base<sup class="text-[#e94560]">−2i/d</sup>
					<span class="text-[var(--text-small)] text-gray-500"
						>(angular rate per position for pair i)</span
					>
				</p>
				<p class="mt-1 text-[var(--text-small)]">
					rotation angle = m × θ<sub>i</sub>
					<span class="text-gray-500">(for token at position m)</span>
				</p>
				<p class="mt-2 text-[var(--text-small)] text-gray-500">
					Default base = 10,000 (same as sinusoidal)
				</p>
			</div>
			<p class="mt-2 text-center text-[var(--text-tiny)] text-gray-500 italic">
				Note: θ is the angular <em>rate</em> (per position), and m×θ is the actual rotation angle. We
				show degrees for intuition, but implementations use radians.
			</p>
		</div>

		<!-- What high and low frequency do -->
		<div class="mb-4 rounded bg-[#0f3460] p-4">
			<p class="mb-3 font-semibold text-[var(--text-small)] text-emerald-400">
				Different Dimensions = Different "Clock Speeds"
			</p>
			<div class="grid gap-4 md:grid-cols-2">
				<div class="rounded bg-[#1a1a2e] p-3">
					<p class="mb-2 font-semibold text-[var(--text-small)] text-emerald-400">
						Early dimensions (i ≈ 0): Fast rotation
					</p>
					<p class="mb-2 text-[var(--text-small)] text-gray-300">
						θ ≈ 1 → rotates ~57° per position
					</p>
					<p class="text-[var(--text-small)] text-gray-400">
						<strong class="text-white">Creates local attention patterns:</strong> "diagonal heads" that
						attend to previous token, or heads with specific positional patterns. Highly sensitive to
						nearby positions.
					</p>
				</div>
				<div class="rounded bg-[#1a1a2e] p-3">
					<p class="mb-2 font-semibold text-[var(--text-small)] text-amber-400">
						Later dimensions (i ≈ d/2): Slow rotation
					</p>
					<p class="mb-2 text-[var(--text-small)] text-gray-300">
						θ ≈ 0.0001 → barely rotates per position
					</p>
					<p class="text-[var(--text-small)] text-gray-400">
						<strong class="text-white">Maintains semantic attention:</strong> allows model to attend to
						semantically related tokens regardless of distance. Less sensitive to exact position.
					</p>
				</div>
			</div>
		</div>

		<!-- The base parameter -->
		<div class="mb-4 rounded bg-[#0f3460] p-4">
			<p class="mb-3 font-semibold text-[var(--text-small)] text-emerald-400">
				The Base Parameter (base = 10,000 by default)
			</p>
			<p class="mb-3 text-[var(--text-small)] text-gray-300">
				The base controls how fast <em>all</em> dimensions rotate. Think of it as the "speed setting":
			</p>
			<div class="grid gap-4 md:grid-cols-2">
				<div class="rounded border border-red-500/30 bg-[#1a1a2e] p-3">
					<p class="mb-2 font-semibold text-[var(--text-small)] text-red-400">
						Smaller base (e.g., 10)
					</p>
					<p class="text-[var(--text-small)] text-gray-300">
						<strong>Faster rotation</strong> → vectors cycle quickly
					</p>
					<p class="mt-2 text-[var(--text-small)] text-gray-500">
						Problem: At position 1000, vectors have cycled many times. Tokens far apart may have
						similar rotations → model can't distinguish them.
					</p>
					<p class="mt-2 text-[var(--text-small)] text-amber-400">Good for: short sequences</p>
				</div>
				<div class="rounded border border-emerald-500/30 bg-[#1a1a2e] p-3">
					<p class="mb-2 font-semibold text-[var(--text-small)] text-emerald-400">
						Larger base (e.g., 500,000)
					</p>
					<p class="text-[var(--text-small)] text-gray-300">
						<strong>Slower rotation</strong> → vectors change gradually
					</p>
					<p class="mt-2 text-[var(--text-small)] text-gray-500">
						Even at position 100,000, vectors haven't cycled. Combined rotation pattern is rich →
						model can distinguish positions within range.
					</p>
					<p class="mt-2 text-[var(--text-small)] text-emerald-400">
						Good for: long contexts (e.g., LLaMA 3 variants use ~500,000)
					</p>
				</div>
			</div>
		</div>

		<div class="rounded border border-purple-500/30 bg-[#1a1a2e] p-3">
			<p class="mb-2 font-semibold text-[var(--text-small)] text-purple-400">
				Why Multi-Scale Frequencies Matter
			</p>
			<p class="text-[var(--text-small)] text-gray-300">
				The model needs <em>both</em>: fast-rotating dimensions to distinguish nearby tokens (is
				this the previous word or the one before?), and slow-rotating dimensions to maintain
				semantic attention across long distances (this paragraph relates to that one 1000 tokens
				ago).
			</p>
		</div>
	</Section>

	<!-- 6. Visualizing the Rotation -->
	<Section>
		<h3 class="mb-2 font-semibold text-[#e94560] text-[var(--text-h2)]">
			6. Visualizing the Rotation
		</h3>
		<p class="mb-3 text-[var(--text-body)] text-gray-300">
			Watch how vectors rotate as position changes. Each dimension pair rotates at a different
			speed:
		</p>

		<!-- Single position rotation demo -->
		<div class="mb-4 rounded bg-[#0f3460] p-4">
			<div class="mb-3 flex items-center justify-center gap-2">
				<span class="text-[var(--text-small)] text-gray-400">Position m:</span>
				<input
					type="range"
					bind:value={positionSingle}
					min="0"
					max="20"
					class="w-32 accent-orange-500"
					aria-label="Single position value"
				/>
				<span class="w-6 font-mono text-[var(--text-body)] text-white">{positionSingle}</span>
			</div>

			<div class="flex flex-wrap items-center justify-center gap-2">
				{#each [0, 2, 4, 6, 8] as dimPair (dimPair)}
					{@const angle = getRotationAngle(positionSingle, dimPair)}
					{@const handX = 30 + Math.sin(angle) * 22}
					{@const handY = 30 - Math.cos(angle) * 22}
					<div class="text-center">
						<svg viewBox="0 0 60 60" class="h-16 w-16">
							<circle cx="30" cy="30" r="26" fill="none" stroke="#333" stroke-width="1.5" />
							<line x1="6" y1="30" x2="54" y2="30" stroke="#2a2a4a" stroke-width="1" />
							<line x1="30" y1="6" x2="30" y2="54" stroke="#2a2a4a" stroke-width="1" />
							<!-- Original direction (ghosted) -->
							<line
								x1="30"
								y1="30"
								x2="30"
								y2="8"
								stroke="#6b7280"
								stroke-width="1"
								stroke-dasharray="2"
								opacity="0.4"
							/>
							<!-- Rotated vector -->
							<line
								x1="30"
								y1="30"
								x2={handX}
								y2={handY}
								stroke="#f97316"
								stroke-width="2.5"
								stroke-linecap="round"
							/>
							<circle cx={handX} cy={handY} r="3" fill="#f97316" />
							<circle cx="30" cy="30" r="2" fill="#f97316" />
						</svg>
						<p class="text-[var(--text-small)] text-orange-400">dim {dimPair},{dimPair + 1}</p>
						<p class="text-[var(--text-tiny)] text-gray-500">
							{dimPair === 0 ? 'fast' : dimPair === 8 ? 'slow' : ''}
						</p>
					</div>
				{/each}
			</div>
			<p class="mt-2 text-center text-[var(--text-small)] text-gray-500">
				Lower dimensions rotate faster (capture local position)
			</p>
		</div>

		<!-- Two positions: showing relative angle -->
		<div class="rounded bg-[#0f3460] p-4">
			<p class="mb-3 text-center text-[var(--text-body)] text-white">
				Relative Position: The Angle Between Two Tokens
			</p>

			<div class="mb-3 flex items-center justify-center gap-4">
				<div class="flex items-center gap-2">
					<span class="text-[var(--text-small)] text-blue-400">Position m:</span>
					<input
						type="range"
						bind:value={positionM}
						min="0"
						max="20"
						class="w-20 accent-blue-500"
						aria-label="Position m for relative demo"
					/>
					<span class="w-4 font-mono text-[var(--text-body)] text-blue-400">{positionM}</span>
				</div>
				<div class="flex items-center gap-2">
					<span class="text-[var(--text-small)] text-orange-400">Position n:</span>
					<input
						type="range"
						bind:value={positionN}
						min="0"
						max="20"
						class="w-20 accent-orange-500"
						aria-label="Position n for relative demo"
					/>
					<span class="w-4 font-mono text-[var(--text-body)] text-orange-400">{positionN}</span>
				</div>
				<div class="rounded bg-[#1a1a2e] px-2 py-1">
					<span class="font-mono text-[var(--text-small)] text-emerald-400"
						>m−n = {positionM - positionN}</span
					>
				</div>
			</div>

			<div class="flex items-center justify-center gap-2">
				{#each [0, 4, 8] as dimPair (dimPair)}
					{@const angleM = getRotationAngle(positionM, dimPair)}
					{@const angleN = getRotationAngle(positionN, dimPair)}
					{@const handMX = 40 + Math.sin(angleM) * 30}
					{@const handMY = 40 - Math.cos(angleM) * 30}
					{@const handNX = 40 + Math.sin(angleN) * 30}
					{@const handNY = 40 - Math.cos(angleN) * 30}
					{@const arcPath = getMinimalArcPath(angleM, angleN, 18, 40, 40)}
					<div class="text-center">
						<svg viewBox="0 0 80 80" class="h-24 w-24">
							<circle cx="40" cy="40" r="34" fill="none" stroke="#333" stroke-width="1.5" />
							<line x1="6" y1="40" x2="74" y2="40" stroke="#2a2a4a" stroke-width="1" />
							<line x1="40" y1="6" x2="40" y2="74" stroke="#2a2a4a" stroke-width="1" />
							<!-- Q vector (position m) -->
							<line
								x1="40"
								y1="40"
								x2={handMX}
								y2={handMY}
								stroke="#60a5fa"
								stroke-width="2.5"
								stroke-linecap="round"
							/>
							<circle cx={handMX} cy={handMY} r="3" fill="#60a5fa" />
							<!-- K vector (position n) -->
							<line
								x1="40"
								y1="40"
								x2={handNX}
								y2={handNY}
								stroke="#f97316"
								stroke-width="2.5"
								stroke-linecap="round"
							/>
							<circle cx={handNX} cy={handNY} r="3" fill="#f97316" />
							<!-- Angle arc between them (minimal angular distance) -->
							{#if Math.abs(angleM - angleN) > 0.01}
								<path d={arcPath} fill="none" stroke="#22c55e" stroke-width="2.5" />
							{/if}
							<circle cx="40" cy="40" r="2" fill="#22c55e" />
						</svg>
						<p class="text-[var(--text-small)] text-gray-400">dim {dimPair},{dimPair + 1}</p>
					</div>
				{/each}
			</div>

			<div class="mt-2 flex justify-center gap-4 text-[var(--text-small)]">
				<span class="text-blue-400">― R<sub>m</sub>(q)</span>
				<span class="text-orange-400">― R<sub>n</sub>(k)</span>
				<span class="text-emerald-400">― angle ∝ (m−n)</span>
			</div>

			<p class="mt-2 text-center text-[var(--text-small)] text-gray-500">
				The green arc (angle between vectors) depends only on the <em>difference</em> m−n
			</p>
		</div>

		<!-- Decay Visualization -->
		<div class="mt-4 rounded border border-purple-500/40 bg-[#1a1a2e] p-4">
			<p class="mb-2 font-semibold text-[var(--text-body)] text-white">The Natural Decay</p>
			<p class="mb-3 text-[var(--text-body)] text-gray-300">
				RoPE has a mathematically proven property: the positional contribution to attention decays
				with distance. This follows directly from the rotation mechanics and the choice of frequency
				formula.
			</p>

			<!-- Decay graph -->
			<div class="mb-3 rounded bg-[#0f3460] p-3">
				<p class="mb-2 text-center font-semibold text-[var(--text-small)] text-emerald-400">
					Long-term Decay of RoPE
				</p>
				<p class="mb-2 text-center text-[var(--text-tiny)] text-gray-500">
					Average positional alignment decays with distance — nearby tokens naturally attend more to
					each other
				</p>

				<!-- Slider control -->
				<div class="mb-3 flex items-center justify-center gap-3">
					<span class="text-[var(--text-tiny)] text-gray-400">Max distance:</span>
					<input
						type="range"
						min="100"
						max="10000"
						step="100"
						bind:value={decayMaxDist}
						class="w-48 accent-emerald-500"
					/>
					<span class="w-16 font-mono text-[var(--text-tiny)] text-emerald-400">{decayMaxDist}</span
					>
				</div>

				<div class="flex justify-center">
					<svg viewBox="0 0 320 150" class="w-full max-w-md">
						<!-- Axes -->
						<line x1="40" y1="10" x2="40" y2="110" stroke="#555" stroke-width="1" />
						<line x1="40" y1="110" x2="310" y2="110" stroke="#555" stroke-width="1" />

						<!-- Y-axis labels -->
						<text x="35" y="15" font-size="8" fill="#888" text-anchor="end">1.0</text>
						<text x="35" y="60" font-size="8" fill="#888" text-anchor="end">0.5</text>
						<text x="35" y="110" font-size="8" fill="#888" text-anchor="end">0</text>
						<text
							x="12"
							y="60"
							font-size="7"
							fill="#888"
							text-anchor="middle"
							transform="rotate(-90, 12, 60)">Alignment</text
						>

						<!-- X-axis labels -->
						<text x="40" y="125" font-size="8" fill="#888" text-anchor="middle">0</text>
						<text x="175" y="125" font-size="8" fill="#888" text-anchor="middle"
							>{Math.round(decayMaxDist / 2)}</text
						>
						<text x="310" y="125" font-size="8" fill="#888" text-anchor="middle"
							>{decayMaxDist}</text
						>
						<text x="175" y="140" font-size="8" fill="#888" text-anchor="middle"
							>Relative Distance (m - n)</text
						>

						<!-- Zero line -->
						<line
							x1="40"
							y1="110"
							x2="310"
							y2="110"
							stroke="#444"
							stroke-width="1"
							stroke-dasharray="3"
						/>

						<!-- Decay curve -->
						<path
							d="M {decayPoints
								.map((p) => `${40 + p.dist * decayScale} ${110 - (p.score + 0.2) * 80}`)
								.join(' L ')}"
							fill="none"
							stroke="#22c55e"
							stroke-width="2"
						/>

						<!-- Highlight start point -->
						<circle cx="40" cy={110 - (decayPoints[0].score + 0.2) * 80} r="4" fill="#22c55e" />
					</svg>
				</div>
			</div>

			<div class="grid gap-3 text-[var(--text-small)] md:grid-cols-2">
				<div class="rounded bg-[#0f3460] p-2">
					<p class="mb-1 font-semibold text-emerald-400">Why it decays:</p>
					<p class="text-gray-400">
						As distance increases, the fast-rotating pairs become decorrelated (their cos values
						oscillate around zero). Only slow pairs maintain alignment, but they contribute less
						per-distance change.
					</p>
				</div>
				<div class="rounded bg-[#0f3460] p-2">
					<p class="mb-1 font-semibold text-blue-400">Why this matters:</p>
					<p class="text-gray-400">
						The model naturally focuses on local context without being told to. Nearby tokens get
						more attention "for free" — no explicit positional penalty needed.
					</p>
				</div>
			</div>

			<p class="mt-3 text-center text-[var(--text-small)] text-gray-500 italic">
				This decay is content-independent — the actual attention also depends on semantic
				similarity. But RoPE provides a baseline "locality bias" that helps the model attend to
				relevant nearby tokens.
			</p>
		</div>
	</Section>

	<!-- 7. RoPE Attention Flow -->
	<Section>
		<h3 class="mb-2 font-semibold text-[#e94560] text-[var(--text-h2)]">7. RoPE Attention Flow</h3>
		<p class="mb-3 text-[var(--text-small)] text-gray-400">
			How rotation is applied to Q and K vectors before computing attention scores.
		</p>
		<Rope_AttnDiagram />
	</Section>

	<!-- Summary -->
	<Section title="Summary">
		<div class="mb-4 rounded bg-[#1a1a2e] p-4">
			<p class="mb-3 font-semibold text-[var(--text-small)] text-amber-400">Key Takeaways</p>
			<ul class="space-y-2 text-[var(--text-small)] text-gray-300">
				<li class="flex gap-2">
					<span class="text-amber-400">1.</span>
					<span>RoPE encodes position through rotation — Q·K depends only on relative distance</span
					>
				</li>
				<li class="flex gap-2">
					<span class="text-amber-400">2.</span>
					<span>Rotation preserves magnitude (energy neutral) — semantic meaning stays intact</span>
				</li>
				<li class="flex gap-2">
					<span class="text-amber-400">3.</span>
					<span
						>2D pairs are the "Goldilocks zone" — enough structure for rotation, minimal coupling</span
					>
				</li>
				<li class="flex gap-2">
					<span class="text-amber-400">4.</span>
					<span>Only Q and K are rotated — V carries content unchanged</span>
				</li>
				<li class="flex gap-2">
					<span class="text-amber-400">5.</span>
					<span>Multi-frequency design encodes both local and global position patterns</span>
				</li>
				<li class="flex gap-2">
					<span class="text-amber-400">6.</span>
					<span
						>Efficient — just element-wise multiply by precomputed sin/cos, no extra matrix ops</span
					>
				</li>
				<li class="flex gap-2">
					<span class="text-amber-400">7.</span>
					<span>Proven at scale — LLaMA, Mistral, GPT-NeoX, PaLM, Falcon all use RoPE</span>
				</li>
			</ul>
		</div>

		<div class="rounded bg-[#0f3460] p-4">
			<p class="mb-3 font-semibold text-[var(--text-small)] text-emerald-400">
				Why RoPE Dominates Modern LLMs
			</p>
			<div class="space-y-2 text-[var(--text-small)] text-gray-300">
				<p>
					<strong class="text-white">Elegant theory:</strong> Relative position falls out naturally from
					rotation composition. No position lookup tables or bias matrices.
				</p>
				<p>
					<strong class="text-white">Efficient implementation:</strong> Just element-wise multiply by
					precomputed sin/cos. No matrix multiplication for position encoding.
				</p>
				<p>
					<strong class="text-white">Length extrapolation:</strong> With NTK-aware scaling and YaRN, RoPE
					extends well beyond training context length.
				</p>
				<p>
					<strong class="text-white">Proven at scale:</strong> LLaMA, LLaMA 2, Mistral, GPT-NeoX, PaLM,
					Falcon — the most capable open models all use RoPE.
				</p>
			</div>
		</div>

		<div class="mt-4 rounded border border-emerald-500/50 bg-[#1a1a2e] p-3">
			<p class="mb-1 font-semibold text-[var(--text-small)] text-emerald-400">The Bottom Line</p>
			<p class="text-[var(--text-small)] text-gray-300">
				RoPE represents a fundamental insight: position encoding should be <em>intrinsic</em> to attention,
				not bolted on before or after. By rotating Q and K, position becomes part of how tokens relate
				to each other, not just where they are.
			</p>
		</div>
	</Section>

	<!-- What happened next -->
	<section
		class="mb-4 rounded-lg border-2 border-cyan-400 bg-gradient-to-br from-cyan-600/30 via-blue-700/20 to-purple-800/20 p-4 shadow-lg shadow-cyan-500/20"
	>
		<h3 class="mb-2 font-semibold text-[var(--text-h2)] text-cyan-300">💡 What happened next</h3>

		<p class="mb-4 text-[var(--text-small)] text-gray-300">
			RoPE became dominant, but its complexity led researchers to ask a provocative question...
		</p>

		<div class="mb-4 space-y-3 text-[var(--text-small)]">
			<div class="flex gap-2">
				<span class="text-cyan-400">?</span>
				<div>
					<p class="text-gray-300">
						<strong class="text-white">Do we actually need rotation matrices?</strong>
					</p>
					<p class="text-gray-500">
						RoPE is elegant, but is the math overkill for what position does?
					</p>
				</div>
			</div>
			<div class="flex gap-2">
				<span class="text-cyan-400">?</span>
				<div>
					<p class="text-gray-300">
						<strong class="text-white">What if "closer = attend more" is all we need?</strong>
					</p>
					<p class="text-gray-500">Maybe a simple distance penalty is enough for most tasks?</p>
				</div>
			</div>
			<div class="flex gap-2">
				<span class="text-cyan-400">?</span>
				<div>
					<p class="text-gray-300">
						<strong class="text-white"
							>Can we get length extrapolation without scaling tricks?</strong
						>
					</p>
					<p class="text-gray-500">
						RoPE needs NTK/YaRN to extend — could a simpler method generalize naturally?
					</p>
				</div>
			</div>
		</div>

		<!-- Teaser for ALiBi -->
		<div class="rounded border border-[#e94560]/50 bg-[#e94560]/20 p-3">
			<p class="text-[var(--text-small)] text-gray-300">
				<strong class="text-[#e94560]">ALiBi (2022)</strong> challenged the complexity:
				<strong class="text-white">just subtract a linear distance penalty</strong> from attention
				scores. No rotation, no learned parameters — just
				<code class="rounded bg-gray-800 px-1">score -= m × distance</code>.
			</p>
			<p class="mt-2 text-[var(--text-small)] text-gray-500">
				→ See the <strong class="text-cyan-400">ALiBi</strong> tab
			</p>
		</div>
	</section>
</div>
