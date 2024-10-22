class Abbrev<T extends number | string> {
    static units = ['K', 'M', 'B', 'T'];
    index: number;
    bytes: string;
    unit: string;
    value: number;

    constructor(public x: T) {
        this.value = typeof x === 'string' ? parseFloat(x) : x;
        this.index = this.#calculateIndex();
        this.bytes = this.#calculateBytes();
        this.unit = this.#calculateUnit();
    }

    static parse(value: string): number {
        const unit = value.slice(-1).toLocaleUpperCase();
        const number = parseFloat(value.slice(0, -1));
        const unitIndex = Abbrev.units.indexOf(unit);

        if (unitIndex === -1) {
            return parseFloat(value);
        }

        return number * Math.pow(1000, unitIndex + 1);
    }

    #calculateIndex() {
        return this.value < 1000 ? -1 : Math.floor(Math.log(this.value) / Math.log(1000)) - 1;
    }

    #calculateBytes() {
        if (this.index === -1) {
            return this.value.toFixed(2);
        }
        const value = (this.value / Math.pow(1000, this.index + 1));
        return value.toFixed(2);
    }

    #calculateUnit() {
        if (this.index === -1) {
            return '';
        }
        return Abbrev.units[this.index] ?? '';
    }

    toArray(): [bytes: number, unit: string] {
        return [Number(this.bytes), this.unit];
    }

    toString() {
        return this.unit ? `${this.bytes}${this.unit}` : this.bytes;
    }

    toJSON() {
        return {
            bytes: Number(this.bytes),
            unit: this.unit
        };
    }

    *[Symbol.iterator]() {
        yield* this.toArray();
    }
}

export { Abbrev };
