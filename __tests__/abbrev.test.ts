import { Abbrev } from '../src/Utils/abbrev';

describe('Abbrev format', () => {
    const testCases = [
        { input: 100, expected: '100.00' },
        { input: 1000, expected: '1.00K' },
        { input: 1000000, expected: '1.00M' },
        { input: 1000000000, expected: '1.00B' },
        { input: '100', expected: '100.00' },
        { input: '1000', expected: '1.00K' },
        { input: '1000000', expected: '1.00M' },
        { input: '1000000000', expected: '1.00B' }
    ];

    testCases.forEach(({ input, expected }) => {
        it(`Should format ${input} properly`, () => {
            expect(new Abbrev(input).toString()).toBe(expected);
        });
    });

    const parseTestCases = [
        { input: '1 K', expected: 1000 },
        { input: '1 M', expected: 1000000 },
        { input: '1 B', expected: 1000000000 },
        { input: '1K', expected: 1000 },
        { input: '1k', expected: 1000 },
        { input: '1000', expected: 1000 }
    ];

    parseTestCases.forEach(({ input, expected }) => {
        it(`Should parse ${input} properly`, () => {
            expect(Abbrev.parse(input)).toBe(expected);
        });
    });
});