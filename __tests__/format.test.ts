import Dayjs from 'dayjs';
import { Util } from '../src/utils';
import { Languages } from '../src/types/clientTypes';

describe('formatDuration', () => {
    const dayjs: typeof Dayjs = jest.requireActual('dayjs');
    dayjs.extend(jest.requireActual('dayjs/plugin/duration'));

    it('should format duration correctly in English', () => {
        const milliseconds = (1000 * 60 * 60 * 24 * 365);
        const language: Languages = 'en-US';
        const format = ['year'];
        const result = Util.formatDuration(milliseconds, language, format);
        expect(result).toBe('1 year');
    });

    it('should format duration correctly in Portuguese', () => {
        const milliseconds = (1000 * 60 * 60 * 24 * 365);
        const language: Languages = 'pt-BR';
        const format = ['ano'];
        const result = Util.formatDuration(milliseconds, language, format);
        expect(result).toBe('1 ano');
    });

    it('should format multiple components correctly in English', () => {
        const milliseconds = (1000 * 60 * 60 * 24 * 365) + (1000 * 60 * 60 * 24 * 60);
        const language: Languages = 'en-US';
        const format = ['year', 'month'];
        const result = Util.formatDuration(milliseconds, language, format);
        expect(result).toBe('1 year and 1 month');
    });

    it('should format multiple components correctly in Portuguese', () => {
        const milliseconds = (1000 * 60 * 60 * 24 * 365) + (1000 * 60 * 60 * 24 * 60);
        const language: Languages = 'pt-BR';
        const format = ['ano', 'mês'];
        const result = Util.formatDuration(milliseconds, language, format);
        expect(result).toBe('1 ano e 1 mês');
    });

    it('should handle zero values correctly', () => {
        const milliseconds = 0;
        const language: Languages = 'en-US';
        const format = ['year', 'month', 'day', 'hour', 'minute', 'second'];
        const result = Util.formatDuration(milliseconds, language, format);
        expect(result).toBe('');
    });

    it('should format partial components correctly in English', () => {
        const milliseconds = (1000 * 60 * 60 * 24); 
        const language: Languages = 'en-US';
        const format = ['day'];
        const result = Util.formatDuration(milliseconds, language, format);
        expect(result).toBe('1 day');
    });

    it('should format partial components correctly in Portuguese', () => {
        const milliseconds = (1000 * 60 * 60 * 24);
        const language: Languages = 'pt-BR';
        const format = ['dia'];
        const result = Util.formatDuration(milliseconds, language, format);
        expect(result).toBe('1 dia');
    });

    it('should format all components correctly in English', () => {
        const milliseconds = (1000 * 60 * 60 * 24) + (1000 * 60 * 60) + (1000 * 60) + 1000;
        const language: Languages = 'en-US';
        const result = Util.formatDuration(milliseconds, language);
        expect(result).toBe('1 day, 1 hour, 1 minute and 1 second');
    });
});