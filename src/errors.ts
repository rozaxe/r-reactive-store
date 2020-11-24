export class MissingIdError extends Error {
    constructor() {
        super('Item is required to have an ID (of type string) !')
        Object.setPrototypeOf(this, MissingIdError.prototype)
    }
}

export class DuplicateIdError extends Error {
    constructor() {
        super('Duplicate ID found !')
        Object.setPrototypeOf(this, DuplicateIdError.prototype)
    }
}

export class IdNotFoundError extends Error {
    constructor() {
        super('ID was not found !')
        Object.setPrototypeOf(this, IdNotFoundError.prototype)
    }
}
