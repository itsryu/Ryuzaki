class Bytes<T extends number> {
    private static units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    private index: number;
    private bytes: string;
    private unit: string;

    public constructor(public x: T) {
        this.index = this.#index;
        this.bytes = this.#bytes;
        this.unit = this.#unit;
    }

    get #index() {
        if (!this.x) return 0;
        return Math.floor(Math.log(this.x) / Math.log(1000));
    }

    get #bytes() {
        if (!this.x) return '0.00';

        while (!this.#unit) this.index--;

        return (this.x / Math.pow(1024, this.index)).toFixed(2);
    }

    get #unit() {
        return Bytes.units[this.index];
    }

    public toArray(): [bytes: number, unit: string] {
        return [Number(this.bytes), this.unit];
    }

    public toString() {
        return `${this.bytes} ${this.unit}`;
    }

    public toJSON() {
        return {
            bytes: Number(this.bytes),
            unit: this.unit
        };
    }

    *[Symbol.iterator]() {
        yield* this.toArray();
    }
}

export { Bytes };