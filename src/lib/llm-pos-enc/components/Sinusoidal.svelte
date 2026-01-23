<script>
	// ABOUTME: Scrolling visualizer for sinusoidal positional encoding
	// ABOUTME: Clean sections explaining WHY we use sinusoids

	import { generatePositionalEncodingMatrix } from '../utils/positionalEncoding.js';
	import { Section } from './layouts';
	import Sinusoidal_AttnDiagram from './Sinusoidal_AttnDiagram.svelte';

	let maxPosition = $state(128);
	let dModel = $state(256);
	let clockPosition = $state(0);

	let matrix = $derived(generatePositionalEncodingMatrix(maxPosition, dModel));

	let heatmapCanvas = $state(null);

	$effect(() => {
		if (!heatmapCanvas || !matrix) return;
		const ctx = heatmapCanvas.getContext('2d');
		const imageData = ctx.createImageData(dModel, maxPosition);
		const data = imageData.data;

		for (let pos = 0; pos < maxPosition; pos++) {
			for (let dim = 0; dim < dModel; dim++) {
				const value = matrix[pos][dim];
				const idx = (pos * dModel + dim) * 4;
				const rgb = valueToRGB(value);
				data[idx] = rgb.r;
				data[idx + 1] = rgb.g;
				data[idx + 2] = rgb.b;
				data[idx + 3] = 255;
			}
		}
		ctx.putImageData(imageData, 0, 0);
	});

	function valueToRGB(value) {
		const normalized = (value + 1) / 2;
		if (normalized < 0.5) {
			const intensity = normalized * 2;
			return { r: Math.round(intensity * 255), g: Math.round(intensity * 255), b: 255 };
		} else {
			const intensity = (normalized - 0.5) * 2;
			return { r: 255, g: Math.round((1 - intensity) * 255), b: Math.round((1 - intensity) * 255) };
		}
	}

	function toBinary(n, bits) {
		return n.toString(2).padStart(bits, '0').split('').map(Number);
	}

	function getClockAngle(pos, dimPair) {
		// Map dimPair (0-383) to visual range (0-2) for perceptible differences
		// At pos=100: fastest ≈ 5 rotations, slowest ≈ 100° rotation
		const visualIndex = (dimPair / 383) * 2;
		const freq = 1 / Math.pow(4, visualIndex);
		return pos * freq * 0.3;
	}
</script>

<div class="space-y-4">
	<!-- Header -->
	<Section>
		<div class="mb-2 flex items-center gap-4">
			<h2 class="font-bold text-[#e94560] text-[var(--text-h1)]">Sinusoidal Positional Encoding</h2>
			<a
				href="https://arxiv.org/abs/1706.03762"
				target="_blank"
				rel="noopener noreferrer"
				class="text-[var(--text-small)] text-gray-400 hover:text-white"
			>
				Vaswani et al., 2017 ↗
			</a>
		</div>

		<!-- Core Summary -->
		<div class="mb-3 rounded bg-[#0f3460] p-3">
			<p class="text-[var(--text-body)] text-gray-300">
				<strong class="text-white">Core idea:</strong> Encode each position using
				<strong class="text-emerald-400">multiple frequencies</strong>
				so every position gets a <strong class="text-amber-400">unique vector</strong>. The sin/cos
				structure enables learning <strong class="text-cyan-400">relative position</strong>: for
				each (sin, cos) pair, shifting by k positions is a fixed 2×2 rotation.
			</p>
		</div>

		<p class="text-[var(--text-small)] text-gray-400">
			Fixed vectors added to token embeddings. Defined for any length; extrapolation often works
			better than learned embeddings, but is not guaranteed.
		</p>
	</Section>

	<!-- 1. The Problem -->
	<Section>
		<h3 class="mb-2 font-semibold text-[#e94560] text-[var(--text-h2)]">1. The Problem</h3>
		<p class="mb-3 text-[var(--text-body)] text-gray-300">
			Transformers process all tokens in parallel — they have no inherent sense of order. Without
			position info, self-attention is <strong class="text-amber-400"
				>permutation-equivariant</strong
			>:
		</p>
		<div class="grid gap-3 md:grid-cols-2">
			<div class="rounded bg-[#0f3460] p-3">
				<p class="mb-1 text-[var(--text-small)] text-gray-400">Original</p>
				<p class="font-mono text-[var(--text-body)] text-emerald-400">"The cat sat on the mat"</p>
			</div>
			<div class="rounded bg-[#0f3460] p-3">
				<p class="mb-1 text-[var(--text-small)] text-gray-400">Scrambled</p>
				<p class="font-mono text-[var(--text-body)] text-red-400">"mat the on sat cat The"</p>
			</div>
		</div>
		<p class="mt-2 text-[var(--text-small)] text-gray-500">
			The model can't <em>prefer</em> one ordering over another — if you permute the input, the outputs
			permute the same way.
		</p>

		<div class="mt-3 rounded border border-amber-500/30 bg-[#1a1a2e] p-3">
			<p class="text-[var(--text-small)] text-gray-300">
				<strong class="text-amber-400">The question:</strong> How do we give the model a sense of
				<em>where</em> each token is in the sequence?
			</p>
		</div>
	</Section>

	<!-- 2. The Insight: Binary Counting -->
	<Section>
		<div class="mb-2 flex items-center gap-3">
			<h3 class="font-semibold text-[#e94560] text-[var(--text-h2)]">
				2. The Insight: Binary Counting
			</h3>
			<a
				href="https://kazemnejad.com/blog/transformer_architecture_positional_encoding/"
				target="_blank"
				rel="noopener noreferrer"
				class="text-[var(--text-small)] text-gray-400 hover:text-white"
			>
				Kazemnejad ↗
			</a>
		</div>
		<p class="mb-3 text-[var(--text-body)] text-gray-300">
			Binary numbers uniquely encode each position. Each bit alternates at a different rate:
		</p>

		<div class="grid gap-4 md:grid-cols-[auto_1fr]">
			<!-- Binary Table -->
			<div class="overflow-x-auto rounded bg-[#0f3460] p-2">
				<p class="mb-1 text-center text-[var(--text-small)] text-gray-400">
					Binary: Discrete (0/1)
				</p>
				<table
					class="mx-auto text-center font-mono text-[var(--text-small)]"
					style="border-spacing: 2px;"
				>
					<thead>
						<tr class="text-[9px] text-gray-500">
							<th></th>
							<th class="px-1">slow</th>
							<th class="px-1"></th>
							<th class="px-1"></th>
							<th class="px-1">fast</th>
						</tr>
						<tr class="text-[var(--text-tiny)] text-gray-400">
							<th class="px-1">Pos</th>
							<th class="px-1">B3</th>
							<th class="px-1">B2</th>
							<th class="px-1">B1</th>
							<th class="px-1">B0</th>
						</tr>
					</thead>
					<tbody>
						{#each Array(16) as _, pos (pos)}
							{@const bits = toBinary(pos, 4)}
							<tr>
								<td class="px-1 text-gray-400">{pos}</td>
								{#each bits as bit, i (i)}
									<td class="p-0">
										<span
											class="inline-block h-4 w-4 rounded-sm leading-4 text-[var(--text-tiny)]"
											style="background: {bit === 1 ? '#e94560' : '#1a1a2e'}; color: {bit === 1
												? 'white'
												: '#555'}">{bit}</span
										>
									</td>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<!-- Waves -->
			<div class="rounded bg-[#0f3460] p-4">
				<p class="mb-2 text-center text-[var(--text-small)] text-gray-400">
					Sinusoids: Continuous (smooth)
				</p>
				<svg viewBox="0 0 340 175" class="w-full" preserveAspectRatio="xMidYMid meet">
					<!-- Grid lines -->
					{#each [0, 1, 2, 3] as i (i)}
						<line
							x1="35"
							y1={20 + i * 40}
							x2="300"
							y2={20 + i * 40}
							stroke="#333"
							stroke-width="0.5"
							stroke-dasharray="2"
						/>
					{/each}

					<!-- Dim labels -->
					<text x="5" y="24" font-size="8" fill="#888">dim 0</text>
					<text x="5" y="64" font-size="8" fill="#888">dim 2</text>
					<text x="5" y="104" font-size="8" fill="#888">dim 4</text>
					<text x="5" y="144" font-size="8" fill="#888">dim 6</text>

					<text x="335" y="24" font-size="7" fill="#666" text-anchor="end">fast</text>
					<text x="335" y="144" font-size="7" fill="#666" text-anchor="end">slow</text>

					<!-- Waves at different frequencies -->
					{#each [0, 1, 2, 3] as dimIdx (dimIdx)}
						{@const freq = Math.pow(2, 3 - dimIdx)}
						{@const baseY = 20 + dimIdx * 40}
						<path
							d="M 35 {baseY} {Array.from({ length: 276 }, (_, x) => {
								const pos = x / 17.25;
								const val = Math.sin(pos * freq * 0.5);
								return `L ${35 + x} ${baseY - val * 12}`;
							}).join(' ')}"
							fill="none"
							stroke="#e94560"
							stroke-width="1.5"
						/>
					{/each}

					<!-- Position markers -->
					{#each Array(16) as _, pos (pos)}
						<line
							x1={35 + pos * 17.5}
							y1="155"
							x2={35 + pos * 17.5}
							y2="5"
							stroke="#444"
							stroke-width="0.5"
							stroke-dasharray="1"
						/>
						<text x={35 + pos * 17.5} y="162" font-size="7" fill="#888" text-anchor="middle"
							>{pos}</text
						>
					{/each}
				</svg>
				<p class="mt-1 text-center text-[var(--text-small)] text-gray-500">
					Each position → unique combination of wave values
				</p>
			</div>
		</div>

		<p class="mt-3 text-center text-[var(--text-small)] text-gray-400">
			Same idea: different frequencies create unique patterns. Sinusoids are just the continuous
			version of binary bits.
		</p>
	</Section>

	<!-- 3. The Insight: Clock Hands -->
	<Section>
		<div class="mb-2 flex items-center gap-3">
			<h3 class="font-semibold text-[#e94560] text-[var(--text-h2)]">
				3. The Insight: Clock Hands
			</h3>
			<a
				href="https://kazemnejad.com/blog/transformer_architecture_positional_encoding/#discussion"
				target="_blank"
				rel="noopener noreferrer"
				class="text-[var(--text-small)] text-gray-400 hover:text-white"
			>
				Kazemnejad discussion ↗
			</a>
		</div>
		<p class="mb-3 text-[var(--text-body)] text-gray-300">
			<strong class="text-white"
				>Let's assume 768 dimensions = 384 (sin, cos) pairs = 384 clock hands.</strong
			>
			Each hand points to an angle on the unit circle, rotating at a different speed:
		</p>

		<!-- Why multiple clocks -->
		<div class="mb-3 grid gap-3 text-[var(--text-small)] md:grid-cols-2">
			<div class="rounded bg-[#0f3460] p-3">
				<strong class="text-emerald-400">Fast hands (d0,1 ... d100,101):</strong>
				<p class="mt-1 text-gray-400">
					Spin quickly → distinguish nearby positions (word 5 vs word 6)
				</p>
			</div>
			<div class="rounded bg-[#0f3460] p-3">
				<strong class="text-amber-400">Slow hands (d666,667 ... d766,767):</strong>
				<p class="mt-1 text-gray-400">
					Spin slowly → distinguish distant positions (word 5 vs word 500)
				</p>
			</div>
		</div>

		<!-- Position clocks -->
		<div class="mb-4 rounded bg-[#0f3460] p-4">
			<p class="mb-3 text-center text-[var(--text-body)] text-white">
				Each position encoded as 384 clock hands
			</p>
			<div class="mb-3 flex items-center justify-center gap-2">
				<span class="text-[var(--text-small)] text-gray-400">Position:</span>
				<input
					type="range"
					bind:value={clockPosition}
					min="0"
					max="100"
					class="w-32 accent-[#e94560]"
				/>
				<span class="w-6 font-mono text-[var(--text-body)] text-white">{clockPosition}</span>
			</div>

			<div class="flex flex-wrap items-center justify-center gap-1">
				<!-- First 5 clocks (fast) -->
				{#each [0, 1, 2, 3, 4] as dimPair (dimPair)}
					{@const angle = getClockAngle(clockPosition, dimPair)}
					{@const handX = 30 + Math.sin(angle) * 20}
					{@const handY = 30 - Math.cos(angle) * 20}
					<div class="text-center">
						<svg viewBox="0 0 60 60" class="h-16 w-16">
							<line x1="6" y1="30" x2="54" y2="30" stroke="#2a2a4a" stroke-width="1" />
							<line x1="30" y1="6" x2="30" y2="54" stroke="#2a2a4a" stroke-width="1" />
							<circle cx="30" cy="30" r="26" fill="none" stroke="#333" stroke-width="1.5" />
							<line
								x1={handX}
								y1={handY}
								x2={handX}
								y2="30"
								stroke="#3b82f6"
								stroke-width="1"
								stroke-dasharray="2"
							/>
							<line
								x1={handX}
								y1={handY}
								x2="30"
								y2={handY}
								stroke="#f59e0b"
								stroke-width="1"
								stroke-dasharray="2"
							/>
							<circle cx="30" cy="30" r="2" fill="#10b981" />
							<line
								x1="30"
								y1="30"
								x2={handX}
								y2={handY}
								stroke="#10b981"
								stroke-width="2"
								stroke-linecap="round"
							/>
							<circle cx={handX} cy={handY} r="2" fill="#10b981" />
						</svg>
						<p class="text-[var(--text-small)] text-emerald-400">
							d{dimPair * 2},{dimPair * 2 + 1}
						</p>
					</div>
				{/each}

				<!-- Ellipsis -->
				<div class="px-2 text-center">
					<svg viewBox="0 0 60 60" class="h-16 w-16">
						<circle cx="30" cy="30" r="26" fill="none" stroke="#333" stroke-width="1.5" />
						<text x="30" y="35" text-anchor="middle" fill="#666" font-size="14">...</text>
					</svg>
					<p class="text-[var(--text-small)] text-gray-500">374 more</p>
				</div>

				<!-- Spread out slow clocks to show gradual slowdown -->
				{#each [100, 180, 260, 340, 383] as dimPair (dimPair)}
					{@const angle = getClockAngle(clockPosition, dimPair)}
					{@const handX = 30 + Math.sin(angle) * 20}
					{@const handY = 30 - Math.cos(angle) * 20}
					<div class="text-center">
						<svg viewBox="0 0 60 60" class="h-16 w-16">
							<line x1="6" y1="30" x2="54" y2="30" stroke="#2a2a4a" stroke-width="1" />
							<line x1="30" y1="6" x2="30" y2="54" stroke="#2a2a4a" stroke-width="1" />
							<circle cx="30" cy="30" r="26" fill="none" stroke="#333" stroke-width="1.5" />
							<line
								x1={handX}
								y1={handY}
								x2={handX}
								y2="30"
								stroke="#3b82f6"
								stroke-width="1"
								stroke-dasharray="2"
							/>
							<line
								x1={handX}
								y1={handY}
								x2="30"
								y2={handY}
								stroke="#f59e0b"
								stroke-width="1"
								stroke-dasharray="2"
							/>
							<circle cx="30" cy="30" r="2" fill="#f59e0b" />
							<line
								x1="30"
								y1="30"
								x2={handX}
								y2={handY}
								stroke="#f59e0b"
								stroke-width="2"
								stroke-linecap="round"
							/>
							<circle cx={handX} cy={handY} r="2" fill="#f59e0b" />
						</svg>
						<p class="text-[var(--text-small)] text-amber-400">d{dimPair * 2},{dimPair * 2 + 1}</p>
					</div>
				{/each}
			</div>
			<div class="mt-2 flex justify-center gap-3 text-[var(--text-small)]">
				<span class="text-blue-400">― sin</span>
				<span class="text-amber-400">― cos</span>
				<span class="text-gray-500">|</span>
				<span class="text-emerald-400">fast</span>
				<span class="text-gray-500">→</span>
				<span class="text-amber-400">slow</span>
			</div>
		</div>

		<!-- Why this matters: relative position -->
		<div class="rounded bg-[#0f3460] p-4">
			<p class="mb-3 text-[var(--text-body)] text-white">Why This Enables Relative Attention</p>

			<!-- Step-by-step explanation -->
			<div class="space-y-3 text-[var(--text-body)]">
				<div class="flex gap-2">
					<span class="font-bold text-[#e94560]">1.</span>
					<p class="text-gray-300">
						<strong class="text-white">Goal:</strong> Attention needs patterns like "the verb is usually
						2 words after the subject"
					</p>
				</div>

				<div class="flex gap-2">
					<span class="font-bold text-[#e94560]">2.</span>
					<p class="text-gray-300">
						<strong class="text-white">Problem:</strong> How can the model learn "k words apart" once
						and apply it everywhere?
					</p>
				</div>

				<div class="flex gap-2">
					<span class="font-bold text-[#e94560]">3.</span>
					<div class="text-gray-300">
						<strong class="text-white">Key property:</strong> The rotation from position t → t+k is
						<em>always the same angle</em>, no matter where t is:
					</div>
				</div>
			</div>

			<!-- Visual proof: same offset = same rotation -->
			<div class="mt-3 rounded bg-[#1a1a2e] p-3">
				<div class="flex items-center justify-center gap-4">
					<!-- Example 1: pos 5 → pos 10 -->
					<div class="text-center">
						<p class="mb-1 text-[var(--text-small)] text-gray-500">pos 5 → pos 10</p>
						{#each [0] as _, i (i)}
							{@const angle5 = getClockAngle(5, 0)}
							{@const angle10 = getClockAngle(10, 0)}
							<svg viewBox="0 0 60 60" class="h-16 w-16">
								<circle cx="30" cy="30" r="26" fill="none" stroke="#333" stroke-width="1.5" />
								<line
									x1="30"
									y1="30"
									x2={30 + Math.sin(angle5) * 20}
									y2={30 - Math.cos(angle5) * 20}
									stroke="#3b82f6"
									stroke-width="2"
									stroke-linecap="round"
								/>
								<line
									x1="30"
									y1="30"
									x2={30 + Math.sin(angle10) * 20}
									y2={30 - Math.cos(angle10) * 20}
									stroke="#10b981"
									stroke-width="2"
									stroke-linecap="round"
								/>
								<path
									d="M {30 + Math.sin(angle5) * 12} {30 - Math.cos(angle5) * 12} A 12 12 0 0 1 {30 +
										Math.sin(angle10) * 12} {30 - Math.cos(angle10) * 12}"
									fill="none"
									stroke="#e94560"
									stroke-width="2"
								/>
								<circle cx="30" cy="30" r="2" fill="#e94560" />
							</svg>
						{/each}
					</div>

					<span class="text-2xl text-[#e94560]">=</span>

					<!-- Example 2: pos 50 → pos 55 -->
					<div class="text-center">
						<p class="mb-1 text-[var(--text-small)] text-gray-500">pos 50 → pos 55</p>
						{#each [0] as _, i (i)}
							{@const angle50 = getClockAngle(50, 0)}
							{@const angle55 = getClockAngle(55, 0)}
							<svg viewBox="0 0 60 60" class="h-16 w-16">
								<circle cx="30" cy="30" r="26" fill="none" stroke="#333" stroke-width="1.5" />
								<line
									x1="30"
									y1="30"
									x2={30 + Math.sin(angle50) * 20}
									y2={30 - Math.cos(angle50) * 20}
									stroke="#3b82f6"
									stroke-width="2"
									stroke-linecap="round"
								/>
								<line
									x1="30"
									y1="30"
									x2={30 + Math.sin(angle55) * 20}
									y2={30 - Math.cos(angle55) * 20}
									stroke="#10b981"
									stroke-width="2"
									stroke-linecap="round"
								/>
								<path
									d="M {30 + Math.sin(angle50) * 12} {30 -
										Math.cos(angle50) * 12} A 12 12 0 0 1 {30 + Math.sin(angle55) * 12} {30 -
										Math.cos(angle55) * 12}"
									fill="none"
									stroke="#e94560"
									stroke-width="2"
								/>
								<circle cx="30" cy="30" r="2" fill="#e94560" />
							</svg>
						{/each}
					</div>

					<div class="border-l border-gray-600 pl-2 text-[var(--text-small)] text-gray-400">
						<p><span class="text-blue-400">―</span> start pos</p>
						<p><span class="text-emerald-400">―</span> +5 positions</p>
						<p><span class="text-[#e94560]">―</span> same Δ!</p>
					</div>
				</div>
			</div>

			<!-- Conclusion -->
			<div class="mt-3 flex gap-2">
				<span class="font-bold text-[#e94560] text-[var(--text-body)]">4.</span>
				<div class="text-[var(--text-body)] text-gray-300">
					<p>
						<strong class="text-white">Result:</strong> For each (sin, cos) pair, PE(t+k) = M<sub
							>k</sub
						>
						× PE(t) where M<sub>k</sub> is a 2×2 rotation depending only on k.
					</p>
					<p class="mt-1 text-[var(--text-small)] text-gray-500">
						For the full d-dimensional vector, this becomes a <strong class="text-gray-400"
							>block-diagonal matrix</strong
						> of 2×2 rotations (each pair uses a different angle because each has a different frequency).
					</p>
				</div>
			</div>
		</div>
	</Section>

	<!-- 4. The Insight: Trigonometric Identities -->
	<Section>
		<div class="mb-2 flex items-center gap-3">
			<h3 class="font-semibold text-[#e94560] text-[var(--text-h2)]">
				4. The Insight: Trigonometric Identities
			</h3>
			<a
				href="https://blog.timodenk.com/linear-relationships-in-the-transformers-positional-encoding/"
				target="_blank"
				rel="noopener noreferrer"
				class="text-[var(--text-small)] text-gray-400 hover:text-white"
			>
				Denk ↗
			</a>
		</div>
		<p class="mb-3 text-[var(--text-body)] text-gray-300">
			Why can we represent "k positions ahead" as a fixed rotation? The math behind the clock
			analogy:
		</p>

		<!-- Steps 1-3 in one box -->
		<div class="mb-4 space-y-4 rounded bg-[#0f3460] p-4">
			<div class="flex gap-3">
				<span class="font-bold text-[#e94560]">1.</span>
				<div class="text-gray-300">
					<strong class="text-white">Question:</strong> Given PE(t) = [sin(t), cos(t)], can we compute
					PE(t+k) without knowing t?
				</div>
			</div>

			<div class="flex gap-3">
				<span class="font-bold text-[#e94560]">2.</span>
				<div class="w-full text-gray-300">
					<strong class="text-white">Trig addition formulas</strong> tell us how to expand sin(t+k)
					and cos(t+k):
					<div class="mt-2 rounded bg-[#1a1a2e] p-3">
						<div class="space-y-1 font-mono text-[var(--text-body)]">
							<p>sin(t+k) = sin(t)·cos(k) + cos(t)·sin(k)</p>
							<p>cos(t+k) = cos(t)·cos(k) − sin(t)·sin(k)</p>
						</div>
					</div>
					<p class="mt-2 text-[var(--text-body)] text-gray-400">
						Notice: the right side only uses sin(t), cos(t), sin(k), cos(k) — no "t+k" needed!
					</p>

					<p class="mt-3 text-[var(--text-small)] text-gray-500">
						Rewrite as matrix: PE(t+k) = M<sub>k</sub> × PE(t)
					</p>
					<div class="mt-2 rounded bg-[#1a1a2e] p-3">
						<!-- M_k label row -->
						<div class="mb-1 flex items-center justify-center gap-3 text-gray-300">
							<div class="invisible px-1 font-mono text-[var(--text-small)]">
								<p>sin(t+k)</p>
								<p>cos(t+k)</p>
							</div>
							<span class="invisible font-mono text-[var(--text-h1)]">=</span>
							<p class="font-semibold text-[var(--text-small)] text-amber-400">M<sub>k</sub></p>
							<span class="invisible font-mono text-[var(--text-h1)]">×</span>
							<div class="invisible px-1 font-mono text-[var(--text-small)]">
								<p>sin(t)</p>
								<p>cos(t)</p>
							</div>
						</div>
						<!-- Matrix row -->
						<div class="flex items-center justify-center gap-3 text-gray-300">
							<!-- Result vector -->
							<div class="flex items-center">
								<svg viewBox="0 0 6 40" class="h-10 w-1.5"
									><path
										d="M5 2 Q2 2 2 6 L2 34 Q2 38 5 38"
										fill="none"
										stroke="currentColor"
										stroke-width="1.5"
									/></svg
								>
								<div class="px-1 font-mono text-[var(--text-small)]">
									<p>sin(t+k)</p>
									<p>cos(t+k)</p>
								</div>
								<svg viewBox="0 0 6 40" class="h-10 w-1.5"
									><path
										d="M1 2 Q4 2 4 6 L4 34 Q4 38 1 38"
										fill="none"
										stroke="currentColor"
										stroke-width="1.5"
									/></svg
								>
							</div>

							<span class="font-mono text-[var(--text-h1)]">=</span>

							<!-- Rotation matrix -->
							<div class="flex items-center">
								<svg viewBox="0 0 6 40" class="h-10 w-1.5"
									><path
										d="M5 2 Q2 2 2 6 L2 34 Q2 38 5 38"
										fill="none"
										stroke="currentColor"
										stroke-width="1.5"
									/></svg
								>
								<div class="px-1 text-center font-mono text-[var(--text-small)] text-amber-400">
									<p>cos(k) <span class="px-2">sin(k)</span></p>
									<p>−sin(k) <span class="px-1">cos(k)</span></p>
								</div>
								<svg viewBox="0 0 6 40" class="h-10 w-1.5"
									><path
										d="M1 2 Q4 2 4 6 L4 34 Q4 38 1 38"
										fill="none"
										stroke="currentColor"
										stroke-width="1.5"
									/></svg
								>
							</div>

							<span class="font-mono text-[var(--text-h1)]">×</span>

							<!-- Input vector -->
							<div class="flex items-center">
								<svg viewBox="0 0 6 40" class="h-10 w-1.5"
									><path
										d="M5 2 Q2 2 2 6 L2 34 Q2 38 5 38"
										fill="none"
										stroke="currentColor"
										stroke-width="1.5"
									/></svg
								>
								<div class="px-1 font-mono text-[var(--text-small)]">
									<p>sin(t)</p>
									<p>cos(t)</p>
								</div>
								<svg viewBox="0 0 6 40" class="h-10 w-1.5"
									><path
										d="M1 2 Q4 2 4 6 L4 34 Q4 38 1 38"
										fill="none"
										stroke="currentColor"
										stroke-width="1.5"
									/></svg
								>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="flex gap-3">
				<span class="font-bold text-[#e94560]">3.</span>
				<div class="text-gray-300">
					<strong class="text-white">Key observation:</strong> The matrix M<sub>k</sub> contains
					<strong class="text-amber-400">only k</strong> — not t. Same offset = same matrix from any starting
					position.
				</div>
			</div>
		</div>

		<!-- Step 4: The Key Insight -->
		<div class="rounded border border-[#e94560] bg-[#1a1a2e] p-4">
			<div class="flex gap-3">
				<span class="font-bold text-[#e94560]">4.</span>
				<div class="text-gray-300">
					<strong class="text-white">Key insight:</strong> The matrix M<sub>k</sub> contains
					<strong class="text-amber-400">only k</strong>
					(cos(k), sin(k)) — not t.
					<p class="mt-2 text-gray-400">
						This means: to go from <em>any</em> position t to position t+k, you always multiply by
						the <em>same</em> matrix. "5 positions ahead" is the same linear transformation whether you
						start at position 0 or position 1000.
					</p>
				</div>
			</div>
		</div>
	</Section>

	<!-- 5. The Insight: How Attention Uses PE -->
	<Section>
		<h3 class="mb-2 font-semibold text-[#e94560] text-[var(--text-h2)]">
			5. The Insight: How Attention Uses PE
		</h3>
		<p class="mb-3 text-[var(--text-body)] text-gray-300">
			We don't directly encode relative position. Here's what actually happens:
		</p>

		<!-- Steps 1-3 in one box -->
		<div class="mb-4 space-y-4 rounded bg-[#0f3460] p-4">
			<div class="flex gap-3">
				<span class="font-bold text-[#e94560]">1.</span>
				<div class="text-gray-300">
					<strong class="text-white">What we add:</strong> Each token gets PE(pos) added to its
					embedding — this encodes <em>absolute</em> position
				</div>
			</div>

			<div class="flex gap-3">
				<span class="font-bold text-[#e94560]">2.</span>
				<div class="text-gray-300">
					<strong class="text-white">What the structure enables:</strong> The relationship PE(t) →
					PE(t+k) is always the same transformation M<sub>k</sub>
				</div>
			</div>

			<div class="flex gap-3">
				<span class="font-bold text-[#e94560]">3.</span>
				<div class="text-gray-300">
					<strong class="text-white">Where it's used:</strong> In Q·K attention, both Query and Key
					have PE baked in. The dot product becomes sensitive to position <em>offset</em>
				</div>
			</div>
		</div>

		<!-- Step 4: Key point -->
		<div class="rounded border border-[#e94560] bg-[#1a1a2e] p-4">
			<div class="flex gap-3">
				<span class="font-bold text-[#e94560]">4.</span>
				<div class="text-gray-300">
					<strong class="text-white">Key point:</strong> The model
					<strong class="text-white">learns</strong>
					to exploit this structure during training — it's not automatic. This is why later methods (RoPE,
					ALiBi) encode relative position <em>directly</em> into the attention computation.
				</div>
			</div>
		</div>
	</Section>

	<!-- 6. The Formula - Progressive Breakdown -->
	<Section>
		<h3 class="mb-2 font-semibold text-[#e94560] text-[var(--text-h2)]">
			6. The Formula: pos / 10000<sup>2i/d</sup>
		</h3>

		<!-- Step 1 & 2: Formula and breakdown side by side -->
		<div class="mb-3 grid gap-3 md:grid-cols-2">
			<!-- Step 1: The Formula -->
			<div class="rounded bg-[#0f3460] p-3">
				<p class="mb-2 font-semibold text-[var(--text-small)] text-emerald-400">
					STEP 1: The Formula
				</p>
				<div class="text-center font-mono text-[var(--text-body)] text-gray-300">
					<p>
						angle = <span class="text-amber-400">pos</span> /
						<span class="text-cyan-400">10000</span><sup
							><span class="text-[#e94560]">2i/d</span></sup
						>
					</p>
					<p class="mt-1 text-[var(--text-small)] text-gray-500">
						Then: PE = [sin(angle), cos(angle)]
					</p>
				</div>
			</div>

			<!-- Step 2: Break down each part -->
			<div class="rounded bg-[#0f3460] p-3">
				<p class="mb-2 font-semibold text-[var(--text-small)] text-emerald-400">
					STEP 2: What Each Part Means
				</p>
				<div class="space-y-1 text-[var(--text-small)]">
					<div class="flex items-start gap-2">
						<span class="w-14 font-mono font-bold text-amber-400">pos</span>
						<span class="text-gray-300">= token position (0, 1, 2...)</span>
					</div>
					<div class="flex items-start gap-2">
						<span class="w-14 font-mono font-bold text-[#e94560]">i</span>
						<span class="text-gray-300">= dimension index (0 to d/2 - 1)</span>
					</div>
					<div class="flex items-start gap-2">
						<span class="w-14 font-mono font-bold text-[#e94560]">d</span>
						<span class="text-gray-300">= embedding size (e.g., 512)</span>
					</div>
					<div class="flex items-start gap-2">
						<span class="w-14 font-mono font-bold text-cyan-400">10000</span>
						<span class="text-gray-300">= base for frequency range</span>
					</div>
					<div class="flex items-start gap-2">
						<span class="w-14 font-mono font-bold text-[#e94560]">2i/d</span>
						<span class="text-gray-300">= exponent (0 → 1)</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Step 3: What 2i/d does -->
		<div class="mb-3 rounded bg-[#0f3460] p-3">
			<p class="mb-2 font-semibold text-[var(--text-small)] text-emerald-400">
				STEP 3: What 2i/d Does (The Key!)
			</p>
			<p class="mb-2 text-[var(--text-small)] text-gray-300">
				As dimension i increases, the exponent <span class="text-[#e94560]">2i/d</span> goes from 0 to
				1:
			</p>
			<div class="space-y-1 rounded bg-[#1a1a2e] p-2 font-mono text-[var(--text-small)]">
				<div class="flex justify-between">
					<span class="text-gray-500">i=0:</span>
					<span
						>10000<sup class="text-[#e94560]">0</sup> =
						<span class="text-emerald-400">1</span></span
					>
					<span class="text-gray-400">→ angle = pos × 1</span>
					<span class="text-emerald-400">FAST</span>
				</div>
				<div class="flex justify-between">
					<span class="text-gray-500">i=d/4:</span>
					<span
						>10000<sup class="text-[#e94560]">0.5</sup> =
						<span class="text-amber-400">100</span></span
					>
					<span class="text-gray-400">→ angle = pos / 100</span>
					<span class="text-amber-400">MEDIUM</span>
				</div>
				<div class="flex justify-between">
					<span class="text-gray-500">i=d/2:</span>
					<span
						>10000<sup class="text-[#e94560]">1</sup> =
						<span class="text-[#e94560]">10000</span></span
					>
					<span class="text-gray-400">→ angle = pos / 10000</span>
					<span class="text-[#e94560]">SLOW</span>
				</div>
			</div>
			<p class="mt-2 text-center text-[var(--text-small)] text-gray-500">
				Higher dimension = larger divisor = slower rotation = longer wavelength
			</p>
		</div>

		<!-- Step 4: Wavelength visualization -->
		<div class="mb-3 rounded bg-[#0f3460] p-3">
			<p class="mb-2 font-semibold text-[var(--text-small)] text-emerald-400">
				STEP 4: Resulting Wavelengths
			</p>
			<p class="mb-2 text-[var(--text-small)] text-gray-400">
				Wavelength = how many positions for one complete sin/cos cycle:
			</p>
			<div class="space-y-1">
				{#each [[0, 1, 6, 'emerald'], [64, 10, 63, 'emerald'], [128, 100, 628, 'amber'], [192, 1000, 6283, 'amber'], [255, 10000, 62832, 'red']] as [dim, divisor, wavelength, color] (dim)}
					<div
						class="grid grid-cols-[4rem_4rem_1fr_8rem] items-center gap-2 text-[var(--text-small)]"
					>
						<span class="text-gray-500">dim {dim}:</span>
						<span class="text-right font-mono text-cyan-400">÷{divisor}</span>
						<div class="h-3 overflow-hidden rounded bg-[#1a1a2e]">
							<div
								class="h-full rounded"
								style="width: {Math.min(
									100,
									Math.log10(wavelength + 1) * 25
								)}%; background: {color === 'emerald'
									? '#10b981'
									: color === 'amber'
										? '#f59e0b'
										: '#e94560'};"
							></div>
						</div>
						<span class="text-right text-gray-400">λ ≈ {wavelength.toLocaleString()} pos</span>
					</div>
				{/each}
			</div>
		</div>

		<!-- Step 5: Why this design? -->
		<div class="mb-3 rounded bg-[#0f3460] p-3">
			<p class="mb-2 font-semibold text-[var(--text-small)] text-emerald-400">
				STEP 5: Why This Design?
			</p>
			<div class="grid grid-cols-2 gap-2 text-[var(--text-small)]">
				<div class="rounded bg-[#1a1a2e] p-2">
					<p class="mb-1 font-semibold text-white">Multi-Resolution</p>
					<p class="text-gray-400">Fast dims → nearby positions</p>
					<p class="text-gray-400">Slow dims → distant positions</p>
					<p class="mt-1 text-gray-500">Like mm, cm, m rulers together</p>
				</div>
				<div class="rounded bg-[#1a1a2e] p-2">
					<p class="mb-1 font-semibold text-white">Exponential Spacing</p>
					<p class="text-gray-400">Each dim adds new "scale"</p>
					<p class="text-gray-400">No wasted dimensions</p>
					<p class="mt-1 text-gray-500">Equal info per dimension</p>
				</div>
			</div>
		</div>

		<!-- Step 6: Why 10000? -->
		<div class="mb-3 rounded bg-[#0f3460] p-3">
			<p class="mb-2 font-semibold text-[var(--text-small)] text-emerald-400">
				STEP 6: Why 10000 Specifically?
			</p>
			<div class="space-y-2 text-[var(--text-small)] text-gray-300">
				<p>
					<strong class="text-cyan-400">10000</strong> sets the
					<strong class="text-white">range of wavelengths</strong> (frequency spectrum) across dimensions:
				</p>
				<div class="rounded bg-[#1a1a2e] p-2 text-center font-mono">
					<p>
						Slowest wavelength = 10000 × 2π ≈ <span class="text-amber-400">62,832 positions</span>
					</p>
				</div>
				<p class="text-gray-500">
					This isn't a hard "maximum context" — sinusoids are defined for any position. But
					effective usable context depends on training range and how uniquely the model can resolve
					position offsets.
				</p>
				<p class="text-gray-500">
					Original Transformer trained on ≤512 tokens; 10000 gave ample headroom for the frequency
					spectrum.
				</p>
			</div>
		</div>
	</Section>

	<!-- 7. Visualizing the Positional Encoding -->
	<Section>
		<h3 class="mb-2 font-semibold text-[#e94560] text-[var(--text-h2)]">
			7. Visualizing the Positional Encoding
		</h3>
		<p class="mb-3 text-[var(--text-body)] text-gray-300">
			Each row (position) gets a unique pattern. Similar positions have similar colors.
		</p>

		<div class="rounded bg-[#0f3460] p-4">
			<!-- Color scale legend (top right) -->
			<div class="mb-2 flex justify-end">
				<div class="flex items-center gap-2 text-[var(--text-small)] text-white">
					<span>-1</span>
					<div
						class="h-3 w-20 rounded"
						style="background: linear-gradient(to right, blue, white, red)"
					></div>
					<span>+1</span>
				</div>
			</div>

			<!-- Heatmap with Y-axis -->
			<div class="flex">
				<!-- Y-axis label (Position - vertical) -->
				<div
					class="flex w-8 flex-col items-center justify-between pr-1 text-[var(--text-small)] text-white"
				>
					<span>0</span>
					<span class="writing-mode-vertical">Position</span>
					<span>{maxPosition - 1}</span>
				</div>

				<!-- Heatmap canvas -->
				<div class="flex-1">
					<canvas
						bind:this={heatmapCanvas}
						width={dModel}
						height={maxPosition}
						class="w-full rounded"
						style="aspect-ratio: {dModel}/{maxPosition}; image-rendering: pixelated;"
					></canvas>
				</div>
			</div>

			<!-- X-axis label (bottom) -->
			<div class="mt-1 flex">
				<div class="w-8"></div>
				<div class="flex flex-1 justify-between text-[var(--text-small)] text-white">
					<span>dim 0 (fast)</span>
					<span class="text-center">Dimension →</span>
					<span>dim {dModel - 1} (slow)</span>
				</div>
			</div>

			<!-- Explanation for uniform colors -->
			<p class="mt-3 text-center text-[var(--text-small)] text-gray-500">
				<strong class="text-gray-400">Why are high dimensions uniform?</strong> They cycle so slowly
				that at {maxPosition} positions, they haven't changed much yet.
			</p>
		</div>
	</Section>

	<!-- 8. How PE Combines with Token Embeddings -->
	<Section>
		<h3 class="mb-2 font-semibold text-[#e94560] text-[var(--text-h2)]">
			8. How PE Combines with Token Embeddings
		</h3>
		<p class="mb-3 text-[var(--text-body)] text-gray-300">
			Two main ways to inject position info: <strong class="text-emerald-400">addition</strong> or
			<strong class="text-amber-400">concatenation</strong>. The original paper found sinusoidal
			(added) and learned (added) performed similarly.
		</p>

		<!-- Visual comparison -->
		<div class="mb-4 grid gap-4 md:grid-cols-2">
			<!-- Addition -->
			<div class="rounded bg-[#0f3460] p-4">
				<p class="mb-3 text-center font-semibold text-[var(--text-body)] text-emerald-400">
					Addition (Original Transformer)
				</p>
				<div class="flex flex-col items-center gap-2">
					<!-- Token embedding -->
					<div class="flex items-center gap-2">
						<span class="w-16 text-[var(--text-small)] text-gray-400">Token:</span>
						<div class="flex gap-0.5">
							{#each [0.2, -0.5, 0.8, 0.1, -0.3, 0.6, -0.2, 0.4] as v, i (i)}
								<div
									class="flex h-8 w-5 items-center justify-center rounded-sm text-[8px] text-white"
									style="background: {v > 0
										? `rgba(59, 130, 246, ${Math.abs(v)})`
										: `rgba(239, 68, 68, ${Math.abs(v)})`}"
								>
									{v.toFixed(1)}
								</div>
							{/each}
						</div>
						<span class="text-[var(--text-small)] text-gray-500">d={8}</span>
					</div>

					<!-- Plus sign -->
					<span class="text-xl font-bold text-emerald-400">+</span>

					<!-- PE -->
					<div class="flex items-center gap-2">
						<span class="w-16 text-[var(--text-small)] text-gray-400">PE(pos):</span>
						<div class="flex gap-0.5">
							{#each [0.84, 0.54, 0.91, 0.42, 0.14, 0.99, -0.76, 0.65] as v, i (i)}
								<div
									class="flex h-8 w-5 items-center justify-center rounded-sm text-[8px] text-white"
									style="background: {v > 0
										? `rgba(16, 185, 129, ${Math.abs(v)})`
										: `rgba(239, 68, 68, ${Math.abs(v)})`}"
								>
									{v.toFixed(1)}
								</div>
							{/each}
						</div>
						<span class="text-[var(--text-small)] text-gray-500">d={8}</span>
					</div>

					<!-- Equals sign -->
					<span class="text-xl font-bold text-white">=</span>

					<!-- Result -->
					<div class="flex items-center gap-2">
						<span class="w-16 text-[var(--text-small)] text-gray-400">Output:</span>
						<div class="flex gap-0.5">
							{#each [1.04, 0.04, 1.71, 0.52, -0.16, 1.59, -0.96, 1.05] as v, i (i)}
								<div
									class="flex h-8 w-5 items-center justify-center rounded-sm text-[8px] text-white"
									style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.5), rgba(16, 185, 129, 0.5))"
								>
									{v.toFixed(1)}
								</div>
							{/each}
						</div>
						<span class="font-bold text-[var(--text-small)] text-emerald-400">d={8}</span>
					</div>
				</div>
				<p class="mt-3 text-center text-[var(--text-small)] text-gray-500">
					Same size! No extra parameters.
				</p>
			</div>

			<!-- Concatenation -->
			<div class="rounded bg-[#0f3460] p-4">
				<p class="mb-3 text-center font-semibold text-[var(--text-body)] text-amber-400">
					Concatenation (Alternative)
				</p>
				<div class="flex flex-col items-center gap-2">
					<!-- Token embedding -->
					<div class="flex items-center gap-2">
						<span class="w-16 text-[var(--text-small)] text-gray-400">Token:</span>
						<div class="flex gap-0.5">
							{#each [0.2, -0.5, 0.8, 0.1, -0.3, 0.6, -0.2, 0.4] as v, i (i)}
								<div
									class="flex h-8 w-5 items-center justify-center rounded-sm text-[8px] text-white"
									style="background: {v > 0
										? `rgba(59, 130, 246, ${Math.abs(v)})`
										: `rgba(239, 68, 68, ${Math.abs(v)})`}"
								>
									{v.toFixed(1)}
								</div>
							{/each}
						</div>
						<span class="text-[var(--text-small)] text-gray-500">d={8}</span>
					</div>

					<!-- Concat sign -->
					<span class="text-xl font-bold text-amber-400">||</span>

					<!-- PE -->
					<div class="flex items-center gap-2">
						<span class="w-16 text-[var(--text-small)] text-gray-400">PE(pos):</span>
						<div class="flex gap-0.5">
							{#each [0.84, 0.54, 0.91, 0.42, 0.14, 0.99, -0.76, 0.65] as v, i (i)}
								<div
									class="flex h-8 w-5 items-center justify-center rounded-sm text-[8px] text-white"
									style="background: {v > 0
										? `rgba(16, 185, 129, ${Math.abs(v)})`
										: `rgba(239, 68, 68, ${Math.abs(v)})`}"
								>
									{v.toFixed(1)}
								</div>
							{/each}
						</div>
						<span class="text-[var(--text-small)] text-gray-500">d={8}</span>
					</div>

					<!-- Equals sign -->
					<span class="text-xl font-bold text-white">=</span>

					<!-- Result (concatenated - shown smaller) -->
					<div class="flex items-center gap-2">
						<span class="w-16 text-[var(--text-small)] text-gray-400">Output:</span>
						<div class="flex gap-0.5">
							{#each [0.2, -0.5, 0.8, 0.1] as v, i (i)}
								<div
									class="h-6 w-3 rounded-sm"
									style="background: rgba(59, 130, 246, {Math.abs(v)})"
								></div>
							{/each}
							{#each [-0.3, 0.6, -0.2, 0.4] as v, i (i)}
								<div
									class="h-6 w-3 rounded-sm"
									style="background: {v > 0
										? `rgba(59, 130, 246, ${Math.abs(v)})`
										: `rgba(239, 68, 68, ${Math.abs(v)})`}"
								></div>
							{/each}
							<span class="text-[var(--text-small)] text-gray-600">|</span>
							{#each [0.84, 0.54, 0.91, 0.42] as v, i (i)}
								<div
									class="h-6 w-3 rounded-sm"
									style="background: rgba(16, 185, 129, {Math.abs(v)})"
								></div>
							{/each}
							{#each [0.14, 0.99, -0.76, 0.65] as v, i (i)}
								<div
									class="h-6 w-3 rounded-sm"
									style="background: {v > 0
										? `rgba(16, 185, 129, ${Math.abs(v)})`
										: `rgba(239, 68, 68, ${Math.abs(v)})`}"
								></div>
							{/each}
						</div>
						<span class="font-bold text-[var(--text-small)] text-amber-400">d={16}</span>
					</div>
				</div>
				<p class="mt-3 text-center text-[var(--text-small)] text-gray-500">
					Doubled size! More parameters needed.
				</p>
			</div>
		</div>

		<!-- Why Addition Works -->
		<div class="mb-4 rounded bg-[#0f3460] p-4">
			<p class="mb-3 font-semibold text-[var(--text-body)] text-white">
				Why Addition Works (And Is Preferred)
			</p>
			<div class="space-y-3 text-[var(--text-small)]">
				<div class="flex gap-2">
					<span class="font-bold text-emerald-400">1.</span>
					<div class="text-gray-300">
						<strong class="text-white">High-dimensional spaces are sparse:</strong> In 512+ dimensions,
						random vectors are nearly orthogonal. Token embeddings and PE occupy different "directions"
						— adding them doesn't cause destructive interference.
					</div>
				</div>

				<div class="flex gap-2">
					<span class="font-bold text-emerald-400">2.</span>
					<div class="text-gray-300">
						<strong class="text-white">Bounded PE values:</strong> Sinusoidal PE is always in [-1, +1].
						Token embeddings are typically normalized. The scales are compatible.
					</div>
				</div>

				<div class="flex gap-2">
					<span class="font-bold text-emerald-400">3.</span>
					<div class="text-gray-300">
						<strong class="text-white">Model learns to disentangle:</strong> Through training, attention
						learns to extract both content (from token) and position (from PE) from the combined vector.
					</div>
				</div>

				<div class="flex gap-2">
					<span class="font-bold text-emerald-400">4.</span>
					<div class="text-gray-300">
						<strong class="text-white">Efficiency:</strong> No dimension increase = no extra parameters
						in subsequent layers. A 512-dim model stays 512-dim throughout.
					</div>
				</div>
			</div>
		</div>

		<!-- When to use each -->
		<div class="grid gap-3 md:grid-cols-2">
			<div class="rounded border border-emerald-500/30 bg-[#1a1a2e] p-3">
				<p class="mb-2 font-semibold text-[var(--text-small)] text-emerald-400">
					When Addition is Best
				</p>
				<ul class="space-y-1 text-[var(--text-small)] text-gray-400">
					<li>• High-dimensional embeddings (d ≥ 256)</li>
					<li>• Memory/compute constrained</li>
					<li>• Standard NLP tasks (most use cases)</li>
					<li>• When PE and content can share space</li>
				</ul>
			</div>
			<div class="rounded border border-amber-500/30 bg-[#1a1a2e] p-3">
				<p class="mb-2 font-semibold text-[var(--text-small)] text-amber-400">
					When Concatenation Might Help
				</p>
				<ul class="space-y-1 text-[var(--text-small)] text-gray-400">
					<li>• Low-dimensional embeddings</li>
					<li>• Position is critically important</li>
					<li>• Explicit separation needed</li>
					<li>• Some vision/audio models</li>
				</ul>
			</div>
		</div>

		<!-- What the Paper Actually Found -->
		<div class="mt-4 rounded border border-[#e94560] bg-[#1a1a2e] p-3">
			<p class="mb-2 font-semibold text-[var(--text-body)] text-white">
				What the Paper Actually Found
			</p>
			<blockquote
				class="mb-3 border-l-2 border-[#e94560] pl-3 text-[var(--text-small)] text-gray-400 italic"
			>
				"We also experimented with using learned positional embeddings instead, and found that the
				two versions produced <strong class="text-white">nearly identical results</strong>."
				<span class="mt-1 block text-gray-500"
					>— Vaswani et al., "Attention Is All You Need" (2017)</span
				>
			</blockquote>
			<div class="space-y-2 text-[var(--text-small)] text-gray-300">
				<p>
					<strong class="text-emerald-400">Important caveat:</strong> This comparison was between
					<strong class="text-white">sinusoidal vs learned</strong>, both using
					<strong class="text-white">addition</strong>. Concatenation is a different design
					tradeoff:
				</p>
				<ul class="space-y-1 pl-4 text-gray-400">
					<li>• Concatenation changes downstream parameterization and model capacity</li>
					<li>• Results depend on architecture and regularization choices</li>
					<li>• Not generally "equivalent" to addition</li>
				</ul>
				<p class="mt-2 text-gray-500">
					<strong class="text-gray-400">Why addition works well:</strong> In high-dimensional spaces (d=512+),
					random vectors are nearly orthogonal. Token embeddings and PE occupy different "directions"
					— adding them preserves both signals.
				</p>
			</div>
		</div>
	</Section>

	<!-- 9. How PE is Used in Attention -->
	<Section>
		<h3 class="mb-2 font-semibold text-[#e94560] text-[var(--text-h2)]">
			9. How PE is Used in the Attention Mechanism
		</h3>
		<p class="mb-3 text-[var(--text-body)] text-gray-300">
			Sinusoidal PE is added to the input embeddings <strong class="text-white">before</strong> the attention
			computation. The position-enriched embeddings then flow through Q, K, V projections.
		</p>

		<!-- PE + Token Embeddings → Attention Flow -->
		<Sinusoidal_AttnDiagram />

		<div class="mt-3 rounded bg-[#0f3460] p-3">
			<p class="text-[var(--text-small)] text-gray-400">
				<strong class="text-white">Key insight:</strong> Position information is baked into X before Q,
				K, V are computed. The attention mechanism doesn't explicitly know about positions — it just sees
				enriched embeddings.
			</p>
		</div>
	</Section>

	<!-- What happened next - eureka section -->
	<section
		class="mb-4 rounded-lg border-2 border-cyan-400 bg-gradient-to-br from-cyan-600/30 via-blue-700/20 to-purple-800/20 p-4 shadow-lg shadow-cyan-500/20"
	>
		<h3 class="mb-2 font-semibold text-[var(--text-h2)] text-cyan-300">💡 What happened next</h3>

		<div class="mb-4 rounded bg-[#1a1a2e]/80 p-4">
			<p class="mb-3 text-[var(--text-small)] text-gray-300">
				Sinusoidal PE works, but researchers noticed some interesting challenges:
			</p>
			<div class="space-y-2 text-[var(--text-small)]">
				<div class="flex gap-2">
					<span class="text-cyan-400">?</span>
					<div>
						<p class="text-gray-300">
							<strong class="text-white">Absolute, not relative:</strong> PE encodes "I am at position
							5", not "I am 3 positions after X"
						</p>
						<p class="text-gray-500">Could we encode relative position more directly?</p>
					</div>
				</div>
				<div class="flex gap-2">
					<span class="text-cyan-400">?</span>
					<div>
						<p class="text-gray-300">
							<strong class="text-white">Added, not integrated:</strong> PE is added to embeddings, not
							part of attention
						</p>
						<p class="text-gray-500">
							What if position was built into the attention mechanism itself?
						</p>
					</div>
				</div>
				<div class="flex gap-2">
					<span class="text-cyan-400">?</span>
					<div>
						<p class="text-gray-300">
							<strong class="text-white">Extrapolation uncertain:</strong> Defined for any position, but
							model may not generalize beyond training range
						</p>
						<p class="text-gray-500">How can we handle longer sequences than we trained on?</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Teaser for Relative-PE -->
		<div class="rounded border border-[#e94560]/40 bg-[#e94560]/15 p-4">
			<p class="mb-2 font-semibold text-[#e94560] text-[var(--text-small)]">
				What if we encoded relative position directly?
			</p>
			<p class="text-[var(--text-small)] text-gray-300">
				Instead of adding PE to embeddings and hoping the model learns... what if we <strong
					class="text-white">injected relative position directly into attention</strong
				>?
			</p>
			<p class="mt-2 text-[var(--text-small)] text-gray-400">
				→ See the <strong class="text-[#e94560]">Relative-PE</strong> tab
			</p>
		</div>
	</section>
</div>

<style>
	.writing-mode-vertical {
		writing-mode: vertical-lr;
		transform: rotate(180deg);
	}
</style>
