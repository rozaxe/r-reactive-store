import { ValueObservable } from "r-value-observable"

export type Collection<T extends { id: string } = any> = {
    create(item: T): T
    update(id: string, values: Omit<T, 'id'>): T
    patch(id: string, values: Partial<Omit<T, 'id'>>): T
    remove(id: string): void

    get(id: string): T | null
    get$(id: string): ValueObservable<T | null>
    getAllIds$(): ValueObservable<string[]>
}

export type Collections<T = { readonly [key: string]: { id: string } }> = {
    readonly [K in keyof T]: { id: string } & T[K]
}

export type Store<T extends Collections> = {
    readonly [K in keyof T]: Collection<T[K]>
}
