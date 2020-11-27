import { TestScheduler } from 'rxjs/testing'
import { createStore, Store } from "../src";
import { DuplicateIdError, IdNotFoundError, MissingIdError } from "../src/errors";

type Todo = {
    id: string
    label: string
    done: boolean
}

describe('reactive store', () => {
    let store: Store<{ todos: Todo }>
    let scheduler: TestScheduler

    beforeEach(() => {
        scheduler = new TestScheduler((actual, expected) => expect(expected).toEqual(actual))
        store = createStore<{ todos: Todo }>('todos')
        store.todos.create({ id: 'a', label: 'Lorem', done: false })
    })

    describe('create', () => {
        it('should create store', () => {
            expect(store).toBeDefined()
            expect(store.todos).toBeDefined()
        })

        it('should create a todo', () => {
            const todo = { id: '1', label: 'Ipsum', done: false }
            const created = store.todos.create(todo)
            expect(created).toEqual(todo)
        })

        it('should not create item missing id', () => {
            expect(() => {
                // @ts-ignore
                store.todos.create({ label: 'Task', done: true })
            }).toThrow(MissingIdError)
        })

        it('should not create item of wrong id type', () => {
            expect(() => {
                // @ts-ignore
                store.todos.create({ id: 123, label: 'Task', done: true })
            }).toThrow(MissingIdError)
        })

        it('should not create item with duplicate id', () => {
            expect(() => {
                store.todos.create({ id: 'a', label: 'Task', done: true })
            }).toThrow(DuplicateIdError)
        })

        it('should create observed item', () => {
            const item$ = store.todos.get$('1')
            scheduler.run(({ expectObservable }) => {
                expectObservable(item$).toBe('a', { a: null })
            })
            const todo = { id: '1', label: 'Ipsum', done: false }
            const created = store.todos.create(todo)
            expect(created).toEqual(todo)
            scheduler.run(({ expectObservable }) => {
                expectObservable(item$).toBe('a', { a: todo })
            })
        })

        it('should create item and update ids', () => {
            const ids$ = store.todos.getAllIds$()
            scheduler.run(({ expectObservable }) => {
                expectObservable(ids$).toBe('a', { a: ['a'] })
            })
            const todo = { id: '1', label: 'Ipsum', done: false }
            store.todos.create(todo)
            scheduler.run(({ expectObservable }) => {
                expectObservable(ids$).toBe('a', { a: ['a', '1'] })
            })
        })
    })

    describe('update', () => {
        it('should update item', () => {
            const item$ = store.todos.get$('a')
            const updated = store.todos.update('a', { label: 'Ipsum', done: true })
            expect(updated).toEqual({ id: 'a', label: 'Ipsum', done: true })
            scheduler.run(({ expectObservable }) => {
                expectObservable(item$).toBe('a', { a: { id: 'a', label: 'Ipsum', done: true } })
            })
        })
    })

    describe('patch', () => {
        it('should patch item', () => {
            const item$ = store.todos.get$('a')
            const patched = store.todos.patch('a', { done: true })
            expect(patched).toEqual({ id: 'a', label: 'Lorem', done: true })
            scheduler.run(({ expectObservable }) => {
                expectObservable(item$).toBe('a', { a: { id: 'a', label: 'Lorem', done: true } })
            })
        })
    })

    describe('remove', () => {
        it('should delete item', () => {
            const ids$ = store.todos.getAllIds$()
            scheduler.run(({ expectObservable }) => {
                expectObservable(ids$).toBe('a', { a: ['a'] })
            })
            store.todos.remove('a')
            scheduler.run(({ expectObservable }) => {
                expectObservable(ids$).toBe('a', { a: [] })
            })
        })

        it('should not delete missing id', () => {
            expect(() => {
                store.todos.remove('123')
            }).toThrow(IdNotFoundError)
        })
    })

    describe('get$', () => {
        it('should get item', () => {
            const item$ = store.todos.get$('a')
            scheduler.run(({ expectObservable }) => {
                expectObservable(item$).toBe('a', { a: { id: 'a', label: 'Lorem', done: false } })
            })
        })

        it('should get missing item', () => {
            const item$ = store.todos.get$('123')
            scheduler.run(({ expectObservable }) => {
                expectObservable(item$).toBe('a', { a: null })
            })
        })
    })
    
    describe('getAll', () => {

        beforeEach(() => {
            store.todos.create({ id: '1', label: 'Ipsum', done: false })
        })

        it('should get items', () => {
            const items = store.todos.getAll()
            expect(items).toEqual([ { id: 'a', label: 'Lorem', done: false }, { id: '1', label: 'Ipsum', done: false } ])
        })

        it('should get items$', () => {
            const items$ = store.todos.getAll$()
            scheduler.run(({ expectObservable }) => {
                expectObservable(items$).toBe('a', { a: [ { id: 'a', label: 'Lorem', done: false }, { id: '1', label: 'Ipsum', done: false } ] })
            })
        })
    })
})
