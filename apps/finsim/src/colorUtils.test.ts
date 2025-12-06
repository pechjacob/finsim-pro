import { describe, it, expect } from 'vitest';
import {
    generateUniqueColor,
    generateColorPalette,
    hslToHex,
    hslStringToHex,
    getDistinctColor,
} from './colorUtils';

describe('colorUtils', () => {
    describe('generateUniqueColor', () => {
        it('generates HSL color string', () => {
            const color = generateUniqueColor(0);
            expect(color).toMatch(/^hsl\(\d+, \d+%, \d+%\)$/);
        });

        it('generates different colors for different indices', () => {
            const color1 = generateUniqueColor(0);
            const color2 = generateUniqueColor(1);
            const color3 = generateUniqueColor(2);

            expect(color1).not.toBe(color2);
            expect(color2).not.toBe(color3);
            expect(color1).not.toBe(color3);
        });

        it('generates deterministic colors for same index', () => {
            const color1 = generateUniqueColor(5);
            const color2 = generateUniqueColor(5);
            expect(color1).toBe(color2);
        });

        it('respects custom saturation and lightness', () => {
            const color = generateUniqueColor(0, 50, 70);
            expect(color).toContain('50%');
            expect(color).toContain('70%');
        });

        it('distributes hues across spectrum using golden ratio', () => {
            const colors = Array.from({ length: 10 }, (_, i) => generateUniqueColor(i));
            const hues = colors.map(c => {
                const match = c.match(/hsl\((\d+)/);
                return match ? parseInt(match[1]) : 0;
            });

            // Check that hues are well-distributed (no two consecutive hues within 20 degrees)
            for (let i = 0; i < hues.length - 1; i++) {
                const diff = Math.abs(hues[i] - hues[i + 1]);
                expect(diff).toBeGreaterThan(20);
            }
        });
    });

    describe('generateColorPalette', () => {
        it('generates requested number of colors', () => {
            const palette = generateColorPalette(5);
            expect(palette).toHaveLength(5);
        });

        it('generates unique colors in palette', () => {
            const palette = generateColorPalette(10);
            const uniqueColors = new Set(palette);
            expect(uniqueColors.size).toBe(10);
        });

        it('all colors are valid HSL strings', () => {
            const palette = generateColorPalette(3);
            palette.forEach(color => {
                expect(color).toMatch(/^hsl\(\d+, \d+%, \d+%\)$/);
            });
        });
    });

    describe('hslToHex', () => {
        it('converts HSL to hex format', () => {
            const hex = hslToHex(0, 100, 50); // Pure red
            expect(hex).toMatch(/^#[0-9a-f]{6}$/);
        });

        it('converts red correctly', () => {
            const hex = hslToHex(0, 100, 50);
            expect(hex.toLowerCase()).toBe('#ff0000');
        });

        it('converts green correctly', () => {
            const hex = hslToHex(120, 100, 50);
            expect(hex.toLowerCase()).toBe('#00ff00');
        });

        it('converts blue correctly', () => {
            const hex = hslToHex(240, 100, 50);
            expect(hex.toLowerCase()).toBe('#0000ff');
        });

        it('handles grayscale (0% saturation)', () => {
            const hex = hslToHex(0, 0, 50); // 50% gray
            expect(hex.toLowerCase()).toBe('#808080');
        });
    });

    describe('hslStringToHex', () => {
        it('parses and converts HSL string to hex', () => {
            const hex = hslStringToHex('hsl(0, 100%, 50%)');
            expect(hex.toLowerCase()).toBe('#ff0000');
        });

        it('handles different formatting', () => {
            const hex1 = hslStringToHex('hsl(120, 100%, 50%)');
            const hex2 = hslStringToHex('hsl(120,100%,50%)'); // no spaces
            expect(hex1).toBe(hex2);
        });

        it('returns default blue for invalid format', () => {
            const hex = hslStringToHex('invalid');
            expect(hex).toBe('#3B82F6'); // default blue
        });
    });

    describe('getDistinctColor', () => {
        it('returns first color when no existing colors', () => {
            const color = getDistinctColor([], 0);
            expect(color).toBe(generateUniqueColor(0));
        });

        it('returns distinct color from existing colors', () => {
            const existing = ['hsl(0, 75%, 55%)', 'hsl(30, 75%, 55%)'];
            const newColor = getDistinctColor(existing, 1);

            // New color should not be too similar to existing ones
            expect(newColor).toBeTruthy();
            expect(existing).not.toContain(newColor);
        });

        it('generates valid HSL for any index', () => {
            const color = getDistinctColor([], 99);
            expect(color).toMatch(/^hsl\(\d+, \d+%, \d+%\)$/);
        });
    });

    describe('Edge cases', () => {
        it('handles index 0', () => {
            const color = generateUniqueColor(0);
            expect(color).toBeTruthy();
        });

        it('handles large indices', () => {
            const color = generateUniqueColor(1000);
            expect(color).toMatch(/^hsl\(\d+, \d+%, \d+%\)$/);
        });

        it('handles negative indices gracefully', () => {
            const color = generateUniqueColor(-1);
            // Should still generate a valid color
            expect(color).toMatch(/^hsl\(\d+, \d+%, \d+%\)$/);
        });

        it('palette with 0 colors returns empty array', () => {
            const palette = generateColorPalette(0);
            expect(palette).toEqual([]);
        });

        it('palette with 1 color', () => {
            const palette = generateColorPalette(1);
            expect(palette).toHaveLength(1);
            expect(palette[0]).toMatch(/^hsl\(\d+, \d+%, \d+%\)$/);
        });
    });
});
