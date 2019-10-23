import { createResource, resource } from ".";

const TAG = "TAG";

describe("resource()", () => {
  test("produces a default value", () => {
    const expected = {
      data: null,
      error: null,
      loading: false,
    };

    const actual = resource();

    expect(actual).toStrictEqual(expected);
  });

  test("lets one override a field", () => {
    const expected = {
      data: 1,
      error: null,
      loading: false,
    };

    const actual = resource({
      data: 1,
    });

    expect(actual).toStrictEqual(expected);
  });
});

describe("createResource()", () => {
  test("requires a string tag", () => {
    expect(createResource).toThrow();
    expect(() => createResource(123 as any)).toThrow();
    expect(() => createResource(TAG)).not.toThrow();
  });

  test("lets one provide initial state", () => {
    const expected = resource({
      data: 1,
    });

    const { reducer, request } = createResource<number, any>(TAG, {
      initialState: expected,
    });

    const actual = reducer(undefined, {} as ReturnType<typeof request>);

    expect(actual).toStrictEqual(expected);
  });
});

describe("reducer", () => {
  test("returns initial state", () => {
    const { reducer, request } = createResource(TAG);
    const expected = resource();
    const actual = reducer(undefined, {} as ReturnType<typeof request>);

    expect(actual).toStrictEqual(expected);
  });

  test("handles request action", () => {
    const { reducer, request } = createResource<number, any>(TAG);

    const expected = resource({
      data: 1,
      loading: true,
    });

    const actual = reducer(resource({ data: 1 }), request());

    expect(actual).toStrictEqual(expected);
  });

  test("handles success action", () => {
    const { reducer, success } = createResource<number, any>(TAG);

    const expected = resource({
      data: 1,
    });

    const actual = reducer(
      resource({ loading: true }),
      success({
        data: 1,
      })
    );

    expect(actual).toStrictEqual(expected);
  });

  test("handles error action", () => {
    const { reducer, error } = createResource<any, string>(TAG);

    const expected = resource({
      error: "nope",
    });

    const actual = reducer(
      resource({ loading: true }),
      error({
        data: "nope",
      })
    );

    expect(actual).toStrictEqual(expected);
  });

  test("handles reset action", () => {
    const { reducer, reset } = createResource<number, any>(TAG);

    const expected = resource();

    const actual = reducer(resource({ data: 1, loading: true }), reset());

    expect(actual).toStrictEqual(expected);
  });

  test("handles cancel action", () => {
    const { reducer, cancel } = createResource<number, any>(TAG);

    const expected = resource({
      data: 1,
    });

    const actual = reducer(resource({ data: 1, loading: true }), cancel());

    expect(actual).toStrictEqual(expected);
  });

  test("ignores actions tagged differently", () => {
    const { reducer } = createResource<number, any>(TAG);
    const { success } = createResource<number, any>(`${TAG}2`);
    const expected = resource({
      data: 1,
    });

    const actual = reducer(
      expected,
      success({
        data: 2,
      })
    );

    expect(actual).toBe(expected);
  });
});
