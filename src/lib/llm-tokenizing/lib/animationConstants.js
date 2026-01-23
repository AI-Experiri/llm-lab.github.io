// ABOUTME: Centralized animation timing constants for all visualizers.
// ABOUTME: Prevents magic numbers scattered throughout animation code.

// Delays in milliseconds
export const PAIR_STAGGER_DELAY = 60; // Delay between showing each pair count
export const PLAY_LOOP_PAUSE = 200; // Pause between auto-play steps
export const DOM_SETTLE_DELAY = 50; // Allow DOM to settle before animations

// Animation duration multipliers (applied to animationSpeed)
export const PHASE_TRANSITION_RATIO = 0.3; // Pause after phase transitions
export const ANIMATION_DURATION_RATIO = 0.5; // Standard animation duration
export const SCALE_ANIMATION_RATIO = 0.4; // Scale/highlight animations

// Stagger and easing
export const TOKEN_STAGGER_DELAY = 20; // Stagger between token animations
