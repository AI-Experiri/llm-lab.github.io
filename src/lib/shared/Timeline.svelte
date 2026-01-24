<!-- ABOUTME: Vertical timeline for displaying historical evolution -->
<!-- ABOUTME: Matches llm-inference FoundationPage timeline style -->

<script>
	/**
	 * @typedef {Object} TimelineEvent
	 * @property {string} year - Year of the event
	 * @property {string} title - Title/name of the milestone
	 * @property {string} description - Description of the event
	 * @property {string} [badge] - Optional badge text (e.g., token count, impact)
	 * @property {string} [link] - Optional link to paper/resource
	 */

	/** @type {{ events: TimelineEvent[] }} */
	let { events } = $props();
</script>

<div class="relative">
	<!-- Timeline line -->
	<div
		class="absolute top-0 bottom-0 left-6 w-0.5 bg-gradient-to-b from-[var(--color-primary)] to-pink-600"
	></div>

	<div class="space-y-4">
		{#each events as event (event.year + event.title)}
			<div class="relative flex items-center gap-4 pl-14">
				<!-- Timeline dot -->
				<div
					class="absolute left-4 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[var(--color-primary)] bg-[var(--color-bg)]"
				>
					<div class="h-2 w-2 rounded-full bg-[var(--color-primary)]"></div>
				</div>

				{#if event.link}
					<a
						href={event.link}
						target="_blank"
						rel="noopener noreferrer external"
						class="group flex-1 rounded-lg border border-[var(--color-muted)]/20 bg-[var(--color-bg)] p-4 transition-colors hover:border-[var(--color-primary)]/40"
					>
						<div
							class="grid items-center gap-4"
							class:grid-cols-[auto_1fr_auto_auto]={event.badge}
							class:grid-cols-[auto_1fr_auto]={!event.badge}
						>
							<!-- Year -->
							<span class="font-mono text-[var(--color-accent)] text-[var(--text-small)]"
								>{event.year}</span
							>
							<!-- Name and description -->
							<div>
								<span
									class="font-bold text-[var(--color-text)] transition-colors group-hover:text-[var(--color-primary)]"
									>{event.title}</span
								>
								<p class="hidden text-[var(--color-muted)] text-[var(--text-tiny)] sm:block">
									{event.description}
								</p>
							</div>
							<!-- Badge -->
							{#if event.badge}
								<span
									class="rounded bg-[var(--color-primary)]/20 px-2 py-0.5 font-mono text-[var(--color-primary)] text-[var(--text-small)]"
								>
									{event.badge}
								</span>
							{/if}
							<!-- Link arrow -->
							<span
								class="text-[var(--color-muted)] transition-colors group-hover:text-[var(--color-primary)]"
								>↗</span
							>
						</div>
					</a>
				{:else}
					<div
						class="flex-1 rounded-lg border border-[var(--color-muted)]/20 bg-[var(--color-bg)] p-4"
					>
						<div
							class="grid items-center gap-4"
							class:grid-cols-[auto_1fr_auto]={event.badge}
							class:grid-cols-[auto_1fr]={!event.badge}
						>
							<!-- Year -->
							<span class="font-mono text-[var(--color-accent)] text-[var(--text-small)]"
								>{event.year}</span
							>
							<!-- Name and description -->
							<div>
								<span class="font-bold text-[var(--color-text)]">{event.title}</span>
								<p class="hidden text-[var(--color-muted)] text-[var(--text-tiny)] sm:block">
									{event.description}
								</p>
							</div>
							<!-- Badge -->
							{#if event.badge}
								<span
									class="rounded bg-[var(--color-primary)]/20 px-2 py-0.5 font-mono text-[var(--color-primary)] text-[var(--text-small)]"
								>
									{event.badge}
								</span>
							{/if}
						</div>
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>
