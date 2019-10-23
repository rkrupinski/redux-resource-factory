# redux-resource-factory

[![CircleCI](https://circleci.com/gh/rkrupinski/redux-resource-factory.svg?style=svg)](https://circleci.com/gh/rkrupinski/redux-resource-factory)

Handle resources like a boss 😎.

`redux-resource-factory` provides useful abstraction over [redux](https://redux.js.org/)-managed resources that:

* are (typically) asynchronous
* succeed / fail
* might get cancelled / reset

Usage:

```typescript
import { createStore } from "redux";
import { createResource } from "redux-resource-factory";

const { reducer, request, success } = createResource<User[], string>("USERS");

const store = createStore(reducer);

type AppState = ReturnType<typeof reducer>; // Resource<User[], string>

store.getState(); // { data: null, error: null, loading: false }

store.dispatch(request());

store.getState(); // { data: null, error: null, loading: true }

store.dispatch(success({ data: [] }));

store.getState(); // { data: [], error: null, loading: false }
```

[API](#api) | [Examples](#examples)

## API

### `Resource<T, E>`

Represents a resource of type `T` that can fail with an error of type `E`.

```typescript
type Resource<T, E> = {
  data: T | null;
  error: E | null;
  loading: boolean;
};
```

### `resource(init?)`

Used to create instances of `Resource`.

Arguments:

* `init?: Partial<Resource<T, E>>` - overrides (default values used otherwise)

Returns:

```typescript
Resource<T, E>
```

The default values are:

```typescript
{
  data: null,
  error: null,
  loading: false,
}
```

### `createResource(tag, options?)`

Used to create a reducer for managing the particular resource, along with corresponding action creators.

Arguments:

* `tag: string` - a unique string identifier of a resource (used internally to filter corresponding actions)
* `options?: { initialState?: Resource<T, E> }` - additional options (currently only include specifying initial state)

Returns:

```typescript
{ reducer, ...actionCreators }
```

where `reducer` has the following signature:

```typescript
(
  state: Resource<T, E> | undefined,
  action: ReturnType<typeof actionCreators[keyof typeof actionCreators]>
) => Resource<T, E>;
```

and the `actionCreators` are:

#### `request()`

```diff
{
  data: null,
  error: null,
- loading: false,
+ loading: true,
}
```

#### `success(payload: { data: T })`

```diff
{
- data: null,
+ data: [{...}, {...}],
  error: null,
- loading: true,
+ loading: false,
}
```

#### `error(payload: { data: E })`

```diff
{
  data: null,
- error: null,
+ error: "Unauthorized",
- loading: true,
+ loading: false,
}
```

#### `reset()`

```diff
{
- data: [{...}, {...}],
+ data: null,
  error: null,
  loading: false,
}
```

#### `cancel()`

```diff
{
  data: null,
  error: null,
- loading: true,
+ loading: false,
}
```

## Examples
