import { createStore, Store } from "../src";
import { DuplicateIdError, IdNotFoundError, MissingIdError } from "../src/errors";

type Todo = {
    id: string
    label: string
    done: boolean
}

describe('reactive store', () => {
    let store: Store<{ todos: Todo }>

    beforeEach(() => {
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
            const todo = { id: '1', label: 'Ipsum', done: false }
            const created = store.todos.create(todo)
            expect(created).toEqual(todo)
            expect(item$.value).toEqual(todo)
        })

        it('should create item and update ids', () => {
            const ids$ = store.todos.getAllIds$()
            expect(ids$.value).toHaveLength(1)
            const todo = { id: '1', label: 'Ipsum', done: false }
            store.todos.create(todo)
            expect(ids$.value).toHaveLength(2)
        })
    })

    describe('update', () => {
        it('should update item', () => {
            const item$ = store.todos.get$('a')
            const updated = store.todos.update('a', { label: 'Ipsum', done: true })
            expect(updated).toEqual({ id: 'a', label: 'Ipsum', done: true })
            expect(item$.value).toEqual({ id: 'a', label: 'Ipsum', done: true })
        })
    })

    describe('patch', () => {
        it('should patch item', () => {
            const item$ = store.todos.get$('a')
            const patched = store.todos.patch('a', { done: true })
            expect(patched).toEqual({ id: 'a', label: 'Lorem', done: true })
            expect(item$.value).toEqual({ id: 'a', label: 'Lorem', done: true })
        })
    })

    describe('remove', () => {
        it('should delete item', () => {
            const ids$ = store.todos.getAllIds$()
            expect(ids$.value).toHaveLength(1)
            store.todos.remove('a')
            expect(ids$.value).toHaveLength(0)
        })

        it('should not delete missing id', () => {
            expect(() => {
                store.todos.remove('123')
            }).toThrow(IdNotFoundError)
        })
    })

    describe('get$', () => {
        it('should synchronously get item', () => {
            const item = store.todos.get$('a').value
            expect(item).toEqual({ id: 'a', label: 'Lorem', done: false })
        })

        it('should synchronously get missing item', () => {
            const item = store.todos.get$('123').value
            expect(item).toBeNull()
        })
    })
})
