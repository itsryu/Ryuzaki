import { Bytes } from '../src/Utils/bytes';

describe('Bytes format', () => {
    const testCases = [
        { input: 100, expected: '100.00 B' },
        { input: 1000, expected: '0.98 KB' },
        { input: 1024, expected: '1.00 KB' },
        { input: 1024 * 1024, expected: '1.00 MB' },
        { input: 1024 * 1024 * 1024, expected: '1.00 GB' },
        { input: 1024 * 1024 * 1024 * 1024, expected: '1.00 TB' },
        { input: 0, expected: '0.00 B' },
        { input: 1, expected: '1.00 B' },
        { input: 999, expected: '999.00 B' },
        { input: 1023, expected: '1023.00 B' },
        { input: 1024 * 1024 * 1024 * 1024 * 1024, expected: '1.00 PB' }
    ];

    testCases.forEach(({ input, expected }) => {
        it(`Should format ${input} bytes properly`, () => {
            expect(new Bytes(input).toString()).toBe(expected);
        });
    });
});