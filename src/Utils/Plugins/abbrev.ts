function abbrev(num: number): string {
    if (!isNaN(num)) {
        if (num < 1000) {
            return num.toString();
        } else {
            const decPlaces = 100;
            const abbrev = ['K', 'M', 'B', 'T'];
            const sizes = [1000, 1000000, 1000000000, 1000000000000];

            for (let i = 0; i < abbrev.length; i++) {
                if (num < sizes[i]) {
                    num = Math.round((num / sizes[i - 1]) * decPlaces) / decPlaces;
                    if (num === 1000 && i < abbrev.length - 1) {
                        num = 1;
                        i++;
                    }
                    return num + abbrev[i - 1];
                }
            }

            return num.toString();
        }
    } else {
        return '0';
    }
}

function convertAbbrev(string: string | number): number {
    if (string) {
        const [numberStr, unit] = `${string}`.match(/^(\d*\.?\d+)([a-zA-Z]*)$/) ?? [`${string}`, ''];
        const zeros: Record<string, number> = { K: 1e3, k: 1e3, M: 1e6, m: 1e6 };
        const multiplier = zeros[unit] ?? 1;

        return Number(numberStr) * multiplier;
    } else {
        return 0;
    }
}

export { abbrev, convertAbbrev };