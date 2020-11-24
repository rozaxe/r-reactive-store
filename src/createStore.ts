import { CollectionImpl } from "./CollectionImpl";
import { Collections, Store } from "./models";

export function createStore<T extends Collections = { readonly [key: string]: { id: string } }>(...collections: (keyof T)[]): Store<T> {
    // @ts-ignore
    return collections.reduce(
        (acc, key) => {
            // @ts-ignore
            acc[key] = new CollectionImpl<any>()
            return acc
        },
        {}
    )
}