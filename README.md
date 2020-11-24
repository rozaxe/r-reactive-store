# Reactive Store

A simple way to read, create, update and remove item in a reactive and synchronous collection.

## Example

```ts
// Create a store handling a collection of Todo
const store = createStore<{ todos: Todo }>('todos')

// Create a todo
store.todos.create({ id: 'a', label: 'Lorem', done: false })

// Access todo (no reactive)
store.todos.get('a')
// => { id: 'a', label: 'Lorem', done: false }

// Access todo (reactive)
store.todos.get$('a').subscribe(logger)
// => logger: { id: 'a', label: 'Lorem', done: false }

// Update todo
store.todos.update('a', { label: 'Ipsum', done: true })
// => logger: { id: 'a', label: 'Ipsum', done: true }

// Patch todo
store.todos.patch('a', { label: 'Lorem' })
// => logger: { id: 'a', label: 'Lorem', done: true }

// Remove todo
store.todos.remove('a')
// => logger: null

// Access list of todo's id (reactive)
store.todos.getAllIds$().subscribe(loggerBis)
// => loggerBis: []

// Create another todo
store.todos.create({ id: 'b', label: 'Sit amet', done: false })
// => loggerBis: [ 'b' ]
```

## API

```ts
createStore<{ t: T }>(...collections: string[]): Store<{ t: Collection<T> }>
```

```ts
Collection<T>.get(id: string): T | null
```

```ts
Collection<T>.getAllIds(): string[]
```

```ts
Collection<T>.get$(id: string): ValueObservable<T | null>
```

```ts
Collection<T>.getAllIds$(): ValueObservable<string[]>
```

```ts
Collection<T>.create(item: T): T
```

```ts
Collection<T>.update(id: string, value: Omit<T, 'id'>): T
```

```ts
Collection<T>.patch(id: string, value: Partial<Omit<T, 'id'>>): T
```

```ts
Collection<T>.remove(id: string): void
```

## Gotchas

**Item should have a property named `id` of type `string`**. This is mandatory because we use this property as key accessor to the item.

**Data must be immutable**. Like Redux, your items should be handled as "immutable data".

**Data should not be instanciated**. Items should be plain JavaScript object because we use the spread operator to perform update / patch of items.
