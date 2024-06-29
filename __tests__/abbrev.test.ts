import { Abbrev } from '../src/Utils/abbrev';

describe('Abbrev format', () => {
    it('Should format abbrev properly', () => {
        expect(new Abbrev(100).toString()).toBe('100.00');
        expect(new Abbrev(1000).toString()).toBe('1.00K');
        expect(new Abbrev(1000000).toString()).toBe('1.00M');
        expect(new Abbrev(1000000000).toString()).toBe('1.00B');
        expect(new Abbrev('100').toString()).toBe('100.00');
        expect(new Abbrev('1000').toString()).toBe('1.00K');
        expect(new Abbrev('1000000').toString()).toBe('1.00M');
        expect(new Abbrev('1000000000').toString()).toBe('1.00B');
        expect(Abbrev.parse('1 K')).toBe(1000);
        expect(Abbrev.parse('1 M')).toBe(1000000);
        expect(Abbrev.parse('1 B')).toBe(1000000000);
        expect(Abbrev.parse('1K')).toBe(1000);
        expect(Abbrev.parse('1k')).toBe(1000);
        expect(Abbrev.parse('1000')).toBe(1000);
    });
});