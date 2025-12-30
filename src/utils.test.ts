import { describe, it, expect } from 'vitest';
import { formatTime, getThemeIcon, cycleTheme } from './utils';
import { Themes } from './types';

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
            expect(getThemeIcon(Themes.Light)).toBe('☀️');
            expect(getThemeIcon(Themes.Dark)).toBe('🌙');
            expect(getThemeIcon(Themes.Warm)).toBe('🔥');
            expect(getThemeIcon(Themes.Tcheles)).toBe('💎');
        });
    });

    describe('cycleTheme', () => {
        it('should cycle to the next theme', () => {
            let currentTheme: Themes = Themes.Warm;
            const setTheme = (t: Themes) => { currentTheme = t };

            cycleTheme(Themes.Warm, setTheme);
            expect(currentTheme).toBe(Themes.Dark);

            cycleTheme(Themes.Dark, setTheme);
            expect(currentTheme).toBe(Themes.Light);

            cycleTheme(Themes.Light, setTheme);
            expect(currentTheme).toBe(Themes.Tcheles);

            cycleTheme(Themes.Tcheles, setTheme);
            expect(currentTheme).toBe(Themes.Warm);
        });
    });
});
