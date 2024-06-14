export class Collections<T> {
    private collection: T[] = [];

    length(): number {
        return this.collection.length;
    }

    log(): void {
        console.log(this.collection);
    }

    push(value: T): number {
        return this.collection.push(value);
    }

    pushAll(...values: T[]): number {
        return this.collection.push(...values);
    }

    pop(): T | undefined {
        return this.collection.pop();
    }

    shift(): T | undefined {
        return this.collection.shift();
    }

    unshift(value: T): number {
        return this.collection.unshift(value);
    }

    unshiftAll(...values: T[]): number {
        return this.collection.unshift(...values);
    }

    remove(index: number): T[] {
        return this.collection.splice(index, 1);
    }

    add(index: number, value: T): void {
        this.collection.splice(index, 0, value);
    }

    replace(index: number, value: T): T[] {
        return this.collection.splice(index, 1, value);
    }

    clear(): void {
        this.collection.length = 0;
    }

    isEmpty(): boolean {
        return this.collection.length === 0;
    }

    viewFirst(): T | undefined {
        return this.collection[0];
    }

    viewLast(): T | undefined {
        return this.collection[this.collection.length - 1];
    }

    paginate(page_number: number, page_size: number): T[] {
        return this.collection.slice((page_number - 1) * page_size, page_number * page_size);
    }
}
