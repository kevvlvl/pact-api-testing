export class Health {

    message: string;

    constructor(message: string) {
        this.message = message;
    }

    toString() {
        return `Health state: ${this.message}`
    }
}