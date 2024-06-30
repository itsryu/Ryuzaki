import { Bytes } from '../src/Utils/bytes';

describe('Bytes format', () => {
    it('Should format bytes properly', () => {
        expect(new Bytes(100).toString()).toBe('100.00 B');
        expect(new Bytes(1000).toString()).toBe('0.98 KB');
        expect(new Bytes(1024).toString()).toBe('1.00 KB');
        expect(new Bytes(1024 * 1024).toString()).toBe('1.00 MB');
        expect(new Bytes(1024 * 1024 * 1024).toString()).toBe('1.00 GB');
        expect(new Bytes(1024 * 1024 * 1024 * 1024).toString()).toBe('1.00 TB');
    });
});