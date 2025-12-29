import { describe, it, expect } from 'vitest';
import { formatTime, getThemeIcon, cycleTheme } from './utils';

describe('utils', () => {
    describe('formatTime', () => {
        it('should format valid time correctly', () => {
            expect(formatTime({ hour: 14, minute: 30, second: 0 })).toBe('14:30');
        });
        it('should handle single digit attributes', () => {
            expect(formatTime({ hour: 9, minute: 5, second: 0 })).toBe('09:05');
        });
        it('should return placeholder for undefined', () => {
            expect(formatTime(undefined)).toBe('--:--');
        });
    });

    describe('getThemeIcon', () => {
        it('should return correct icon for themes', () => {
            expect(getThemeIcon('light')).toBe('☀️');
            expect(getThemeIcon('dark')).toBe('🌙');
            expect(getThemeIcon('warm')).toBe('🔥');
            expect(getThemeIcon('tcheles')).toBe('💎');
        });
    });

    describe('cycleTheme', () => {
        it('should cycle to the next theme', () => {
            let currentTheme: "light" | "dark" | "warm" | "tcheles" = 'warm';
            const setTheme = (t: "light" | "dark" | "warm" | "tcheles") => { currentTheme = t };

            cycleTheme('warm', setTheme);
            expect(currentTheme).toBe('dark');

            cycleTheme('dark', setTheme);
            expect(currentTheme).toBe('light');

            cycleTheme('light', setTheme);
            expect(currentTheme).toBe('tcheles');

            cycleTheme('tcheles', setTheme);
            expect(currentTheme).toBe('warm');
        });
    });
});
