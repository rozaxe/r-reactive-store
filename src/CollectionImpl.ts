import { Observable, BehaviorSubject, combineLatest, iif, of } from "rxjs"
import { mergeMap } from 'rxjs/operators'
import { Collection } from "./models"
import { DuplicateIdError, IdNotFoundError, MissingIdError } from "./errors"

export class CollectionImpl<T extends { id: string } = any> implements Collection<T> {

    private items: Record<string, BehaviorSubject<T>> = {}
    private ids$: BehaviorSubject<string[]> = new BehaviorSubject([])

    create = (item: T): T => {
        // Guard against non identifiable item
        if (!item.id || typeof item.id !== 'string') {
            throw new MissingIdError()
        }

        // Guard again ID already registerd
        if (this.items[item.id] && this.items[item.id].value != null) {
            throw new DuplicateIdError()
        }

        // Create observable item
        if (this.items[item.id]) {
            this.items[item.id].next(item)
        } else {
            this.items[item.id] = new BehaviorSubject(item)
        }

        // Update IDs
        this.ids$.next([
            ...this.ids$.value,
            item.id
        ])

        return item
    }

    update = (id: string, values: Omit<T, 'id'>): T => {
        this.assertItemExists(id)

        const updated = { ...values, id } as T

        // Update observable
        this.items[id].next(updated)
        return updated
    }

    patch = (id: string, values: Partial<Omit<T, 'id'>>): T => {
        this.assertItemExists(id)

        // Merge patch
        const updated = {...this.items[id].value, ...values, id } as T

        // Update observable
        this.items[id].next(updated)
        return updated
    }

    remove = (id: string): void => {
        this.assertItemExists(id)

        // Update IDs
        this.ids$.next(this.ids$.value.filter(i => i !== id))

        // Remove observable
        this.items[id].next(null)
    }

    get = (id: string): T | null => {
        // Return synchronous value if exists
        if (this.items[id]) {
            return this.items[id].value
        }

        return null
    }

    get$ = (id: string): Observable<T> => {
        // Register empty subject if not exists
        if (!this.items[id]) {
            this.items[id] = new BehaviorSubject(null)
        }

        return this.items[id]
    }

    getAllIds = (): string[] => {
        return this.ids$.value
    }

    getAllIds$ = (): Observable<string[]> => {
        return this.ids$
    }

    getAll = (): T[] => {
        return this.ids$.value.map(
            id => this.get(id)
        )
    }

    getAll$ = (): Observable<T[]> => {
        return this.ids$.pipe(
            mergeMap((ids: string[]) => iif(
                () => ids.length === 0,
                of([]),
                combineLatest(
                    ids.map(
                        id => this.items[id]
                    )
                )
            ))
        )
    }

    private assertItemExists = (id: string) => {
        // Guard against missing id
        if (!this.items[id]) {
            throw new IdNotFoundError()
        }
    }
}
