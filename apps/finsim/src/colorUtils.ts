/**
 * Color generation utilities for chart series
 * Generates unique, vibrant colors that don't clash
 */

/**
 * Generate a unique color using golden ratio distribution
 * This ensures colors are well-distributed around the color wheel
 */
export function generateUniqueColor(index: number, saturation: number = 75, lightness: number = 55): string {
    const goldenRatio = 0.618033988749895;
    const hue = ((index * goldenRatio) % 1) * 360;

    return `hsl(${Math.floor(hue)}, ${saturation}%, ${lightness}%)`;
}

/**
 * Generate a palette of unique colors
 * Uses golden ratio for optimal distribution
 */
export function generateColorPalette(count: number): string[] {
    return Array.from({ length: count }, (_, i) => generateUniqueColor(i));
}

/**
 * Convert HSL to hex format for storage
 */
export function hslToHex(h: number, s: number, l: number): string {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color)
            .toString(16)
            .padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

/**
 * Parse HSL string to hex
 */
export function hslStringToHex(hsl: string): string {
    const match = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (!match) return '#3B82F6'; // Default blue

    const [, h, s, l] = match.map(Number);
    return hslToHex(h, s, l);
}

/**
 * Get a color with guaranteed distinctness from existing colors
 */
export function getDistinctColor(existingColors: string[], index: number): string {
    // If no existing colors, start fresh
    if (existingColors.length === 0) {
        return generateUniqueColor(index);
    }

    // Try different starting points until we find a distinct color
    let attempts = 0;
    let color = generateUniqueColor(index);

    while (attempts < 100) {
        const isDistinct = existingColors.every(existing => {
            return !areColorsSimilar(color, existing);
        });

        if (isDistinct) return color;

        attempts++;
        color = generateUniqueColor(index + attempts);
    }

    return color;
}

/**
 * Check if two colors are too similar
 */
function areColorsSimilar(color1: string, color2: string): boolean {
    const hue1 = extractHue(color1);
    const hue2 = extractHue(color2);

    // Colors are similar if hues are within 30 degrees
    const diff = Math.abs(hue1 - hue2);
    return diff < 30 || diff > 330;
}

/**
 * Extract hue from HSL string
 */
function extractHue(hsl: string): number {
    const match = hsl.match(/hsl\((\d+)/);
    return match ? Number(match[1]) : 0;
}
