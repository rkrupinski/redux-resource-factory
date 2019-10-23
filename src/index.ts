import * as invariant from "invariant";

export type TaggedAction<T, P> = {
  type: T;
  payload: P;
  tag?: string;
};

export type Complete<T> = {
  readonly [P in keyof T]-?: T[P];
};

export type Resource<T, E> = {
  data: T | null;
  error: E | null;
  loading: boolean;
};

export type ResourceOptions<T, E> = {
  initialState?: Resource<T, E>;
};

export const createAction = <T extends string, P>(
  type: T,
  payload: P,
  tag?: string
): TaggedAction<T, P> => ({ type, payload, tag });

export const resource = <T, E>(
  init: Partial<Resource<T, E>> = {}
): Resource<T, E> => ({
  data: null,
  error: null,
  loading: false,
  ...init,
});

export enum ResourceActionTypes {
  REQUEST = "@@resource/REQUEST",
  SUCCESS = "@@resource/SUCCESS",
  ERROR = "@@resource/ERROR",
  RESET = "@@resource/RESET",
  CANCEL = "@@resource/CANCEL",
}

export const createResource = <T, E>(
  tag: string,
  options?: ResourceOptions<T, E>
) => {
  invariant(
    typeof tag === "string",
    `Tag must be string. Got ${typeof tag} instead.`
  );

  const opts: Complete<ResourceOptions<T, E>> = {
    initialState: resource(),
    ...options,
  };

  const actions = {
    request() {
      return createAction(ResourceActionTypes.REQUEST, null, tag);
    },
    success(payload: { data: T }) {
      return createAction(ResourceActionTypes.SUCCESS, payload, tag);
    },
    error(payload: { data: E }) {
      return createAction(ResourceActionTypes.ERROR, payload, tag);
    },
    reset() {
      return createAction(ResourceActionTypes.RESET, null, tag);
    },
    cancel() {
      return createAction(ResourceActionTypes.CANCEL, null, tag);
    },
  };

  const reducer = (
    state: Resource<T, E> = opts.initialState,
    action: ReturnType<typeof actions[keyof typeof actions]>
  ): Resource<T, E> => {
    if (action.tag !== tag) {
      return state;
    }

    switch (action.type) {
      case ResourceActionTypes.REQUEST:
        return resource({
          data: state.data,
          loading: true,
        });

      case ResourceActionTypes.SUCCESS:
        return resource({
          data: action.payload.data,
        });

      case ResourceActionTypes.ERROR:
        return resource({
          error: action.payload.data,
        });

      case ResourceActionTypes.RESET:
        return resource();

      case ResourceActionTypes.CANCEL:
        return resource({
          data: state.data,
          error: state.error,
        });

      default:
        return state;
    }
  };

  return { reducer, ...actions };
};
