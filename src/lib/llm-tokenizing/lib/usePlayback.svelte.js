// ABOUTME: Svelte 5 composable for shared playback logic across all BPE visualizers.
// ABOUTME: Manages play/pause state, animation coordination, and step progression with race condition safety.

import { sleep } from './utils.js';
import { PLAY_LOOP_PAUSE } from './animationConstants.js';

/**
 * Creates a playback controller for BPE visualizers.
 * Handles play loop with safety guards against race conditions.
 *
 * @returns {object} Playback state and handlers
 */
export function usePlayback() {
	// Reactive state
	let isPlaying = $state(false);
	let isAnimating = $state(false);
	let currentStep = $state(0);
	let totalSteps = $state(0);

	// Non-reactive safety guard - prevents starting new loop while one winds down
	let playLoopActive = false;

	return {
		// Reactive state (read via getters for reactivity)
		get isPlaying() {
			return isPlaying;
		},
		get isAnimating() {
			return isAnimating;
		},
		get currentStep() {
			return currentStep;
		},
		get totalSteps() {
			return totalSteps;
		},

		// Derived state (computed on each access)
		get canBack() {
			return !isAnimating && !isPlaying && currentStep > 0;
		},
		get canStep() {
			return !isAnimating && currentStep < totalSteps && totalSteps > 0;
		},
		get canPlay() {
			return (!isAnimating || isPlaying) && currentStep < totalSteps && totalSteps > 0;
		},
		get canReset() {
			return !isAnimating && !isPlaying && currentStep > 0;
		},

		// State setters for visualizer to call
		startAnimating() {
			isAnimating = true;
		},
		stopAnimating() {
			isAnimating = false;
		},
		setStep(n) {
			currentStep = n;
		},
		setTotalSteps(n) {
			totalSteps = n;
		},
		incrementStep() {
			currentStep++;
		},
		decrementStep() {
			currentStep--;
		},

		/**
		 * Toggle auto-play mode. Calls onStep repeatedly until stopped or complete.
		 * Includes safety guard to prevent race conditions from rapid clicking.
		 *
		 * @param {function(): Promise<void>} onStep - Async function to execute one step
		 */
		async handlePlay(onStep) {
			// Toggle off if already playing
			if (isPlaying) {
				isPlaying = false;
				return;
			}

			// Prevent starting new loop if one is still winding down
			if (playLoopActive) return;

			isPlaying = true;
			playLoopActive = true;

			while (currentStep < totalSteps && isPlaying) {
				await onStep();
				if (isPlaying) await sleep(PLAY_LOOP_PAUSE);
			}

			isPlaying = false;
			playLoopActive = false;
		},

		/**
		 * Reset playback state to initial values.
		 * Call this when visualizer's handleReset is invoked.
		 */
		reset() {
			currentStep = 0;
			isPlaying = false;
			isAnimating = false;
			playLoopActive = false;
		}
	};
}
