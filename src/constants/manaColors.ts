/**
 * Centralized MTG Mana Color Constants
 *
 * This file contains all mana color styling definitions used across the application.
 * Import from here to ensure consistency and avoid duplication.
 */

/** Available MTG mana colors as a const tuple for type inference */
export const MANA_COLORS = ['W', 'U', 'B', 'R', 'G'] as const;

/** Type representing a single mana color */
export type ManaColor = typeof MANA_COLORS[number];

/** Style configuration for a single mana color */
export interface ManaColorStyle {
  /** Background color (hex) */
  bg: string;
  /** Text color (hex) */
  text: string;
  /** Border color (hex) */
  border: string;
  /** Full color name */
  name: string;
}

/**
 * Complete style definitions for all MTG mana colors.
 * Includes background, text, border colors and full name.
 */
export const MANA_COLOR_STYLES: Record<ManaColor, ManaColorStyle> = {
  W: { bg: "#FFF8DC", text: "#2C3E50", border: "#D4AF37", name: "White" },
  U: { bg: "#4A90E2", text: "#FFFFFF", border: "#2E5090", name: "Blue" },
  B: { bg: "#2C2C2C", text: "#FFFFFF", border: "#1a1a1a", name: "Black" },
  R: { bg: "#E74C3C", text: "#FFFFFF", border: "#C0392B", name: "Red" },
  G: { bg: "#27AE60", text: "#FFFFFF", border: "#1E8449", name: "Green" },
};

/** Mapping of mana color codes to their full names */
export const COLOR_NAMES: Record<ManaColor, string> = {
  W: "White",
  U: "Blue",
  B: "Black",
  R: "Red",
  G: "Green",
};

/**
 * Helper function to get mana color style with fallback
 * @param color - The mana color code
 * @returns The style for the color, or undefined if not found
 */
export function getManaColorStyle(color: string): ManaColorStyle | undefined {
  return MANA_COLOR_STYLES[color as ManaColor];
}

/**
 * Default/fallback colors for unknown mana colors
 */
export const DEFAULT_MANA_STYLE: ManaColorStyle = {
  bg: "#95A5A6",
  text: "#2C3E50",
  border: "#7F8C8D",
  name: "Colorless",
};
