import { subscribe } from 'promist';
import { Enclosure, Subject } from '~/sources';

const state = { foo: 'foo', bar: 'bar' };

const mocks = {
  next: jest.spyOn(Enclosure.prototype as any, 'next')
};

describe(`preconditions`, () => {
  test(`methods call super`, () => {
    Object.values(mocks).map((mock) => mock.mockClear());
    const subject = new Subject(null, null);

    expect(mocks.next).toHaveBeenCalledTimes(0);

    subject.next(null, true);
    expect(mocks.next).toHaveBeenLastCalledWith(null, true);
  });
});
describe(`state, state$`, () => {
  test(`are set by constructor`, async () => {
    const a = new Subject(null, null);
    const b = new Subject(state, null);

    expect(a.state).toBe(null);
    expect(b.state).toEqual(state);
    await expect(subscribe(a.state$)).resolves.toBe(null);
    await expect(subscribe(b.state$)).resolves.toEqual(state);
  });
  test(`are successfully mapped`, () => {
    const subject = new Subject(state, (state) => ({
      foo: state.foo,
      baz: 'baz'
    }));

    let value: any = null;
    const subscription = subject.state$.subscribe((val) => (value = val));
    subscription.unsubscribe();

    expect(subject.state).toEqual({ foo: 'foo', baz: 'baz' });
    expect(value).toEqual({ foo: 'foo', baz: 'baz' });
  });
  test(`comply with shallow and deep equality rules`, async () => {
    const arr = ['foo', 'bar'];
    const a = new Subject(arr, null);
    expect(a.state).toBe(arr);
    await expect(subscribe(a.state$)).resolves.toBe(a.state);

    const b = new Subject(state, null);
    expect(b.state).toEqual(state);
    expect(b.state).not.toBe(state);
    await expect(subscribe(b.state$)).resolves.toBe(b.state);

    const c = new Subject({ ...state }, () => state);
    expect(c.state).toBe(state);
    await expect(subscribe(c.state$)).resolves.toBe(c.state);
  });
  test(`state$ emits first value synchronously`, () => {
    const a = new Subject(state, null);
    const b = new Subject(state, () => state);

    let values: any[] = [];
    a.state$.subscribe((value) => values.push(value)).unsubscribe();
    b.state$.subscribe((value) => values.push(value)).unsubscribe();

    expect(values.length).toBe(2);
    expect(values).toEqual([state, state]);
  });
  test(`access doesn't cause additional map executions`, async () => {
    const fn = jest.fn().mockImplementation((x) => ({ ...x }));
    const subject = new Subject(state, fn);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(subject.state).toEqual(state);
    expect(subject.state).toEqual(state);
    await expect(subscribe(subject.state$)).resolves.toEqual(state);
    await expect(subscribe(subject.state$)).resolves.toEqual(state);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
describe(`next`, () => {
  test(`sets state`, async () => {
    const subject = new Subject(true, null);

    subject.next(false);
    expect(subject.state).toBe(false);
    await expect(subscribe(subject.state$)).resolves.toBe(false);
  });
  test(`complies with shallow and deep equality rules`, async () => {
    const arr = ['foo', 'bar'];
    const a = new Subject(['baz'], null);
    a.next(arr);
    expect(a.state).toBe(arr);
    await expect(subscribe(a.state$)).resolves.toBe(a.state);

    const b = new Subject({ ...state, foo: 'none' }, null);
    b.next(state);
    expect(b.state).toEqual(state);
    expect(b.state).not.toBe(state);
    await expect(subscribe(b.state$)).resolves.toBe(b.state);

    const c = new Subject({ ...state }, () => state);
    c.next({});
    expect(c.state).toBe(state);
    await expect(subscribe(c.state$)).resolves.toBe(c.state);
  });
  test(`sets and merges state for objects`, async () => {
    const subject = new Subject(state, null);

    subject.next({ bar: 'merge' });
    expect(subject.state).toEqual({ ...state, bar: 'merge' });
    await expect(subscribe(subject.state$)).resolves.toEqual({
      ...state,
      bar: 'merge'
    });
  });
  test(`maps state`, async () => {
    const fn = jest.fn().mockImplementation((state) => ({
      ...state,
      foo: state.foo + '-map'
    }));
    const subject = new Subject(state, fn);
    expect(fn).toHaveBeenCalledTimes(1);

    subject.next({ foo: 'update' });
    expect(fn).toHaveBeenLastCalledWith({ ...state, foo: 'update' });
    expect(fn).toHaveBeenCalledTimes(2);

    expect(subject.state).toEqual({ ...state, foo: 'update-map' });
    await expect(subscribe(subject.state$)).resolves.toEqual({
      ...state,
      foo: 'update-map'
    });

    expect(fn).toHaveBeenCalledTimes(2);
  });
  test(`emits for equal values wo/ compare`, () => {
    const subject = new Subject(true, null);

    let count = 0;
    const subscription = subject.state$.subscribe(() => count++);

    subject.next(true);
    subject.next(true, false);
    subscription.unsubscribe();

    expect(count).toBe(3);
  });
  test(`emits for equal object inner values wo/ compare`, () => {
    const a = new Subject({ ...state }, null);
    const b = new Subject({ ...state }, () => ({ ...state }));

    const counts = [0, 0];
    const subscriptions = [
      a.state$.subscribe(() => counts[0]++),
      b.state$.subscribe(() => counts[1]++)
    ];

    a.next({ foo: state.foo });
    a.next({ ...state }, false);
    b.next({});
    b.next({}, false);
    subscriptions.map((subscription) => subscription.unsubscribe());

    expect(counts).toEqual([3, 3]);
  });
  test(`emits for equal array inner values wo/ compare`, () => {
    const value = ['foo', 'bar'];
    const a = new Subject([...value], null);
    const b = new Subject(['baz'], () => [...value]);

    const counts = [0, 0];
    const subscriptions = [
      a.state$.subscribe(() => counts[0]++),
      b.state$.subscribe(() => counts[1]++)
    ];

    a.next([...value]);
    a.next([...value], false);
    b.next(['baz']);
    b.next(['baz'], false);
    subscriptions.map((subscription) => subscription.unsubscribe());

    expect(counts).toEqual([3, 3]);
  });
  test(`doesn't emit for equal values w/ compare`, () => {
    const subject = new Subject(true, null);

    let count = 0;
    const subscription = subject.state$.subscribe(() => count++);

    subject.next(true, true);
    subject.next(true, true);
    subscription.unsubscribe();

    expect(count).toBe(1);
  });
  test(`doesn't emit for equal object inner values w/ compare`, () => {
    const a = new Subject({ ...state }, null);
    const b = new Subject({ ...state }, () => ({ ...state }));

    const counts = [0, 0];
    const subscriptions = [
      a.state$.subscribe(() => counts[0]++),
      b.state$.subscribe(() => counts[1]++)
    ];

    a.next({ foo: state.foo }, true);
    a.next({ ...state }, true);
    b.next({}, true);
    b.next({}, true);
    subscriptions.map((subscription) => subscription.unsubscribe());

    expect(counts).toEqual([1, 1]);
  });
  test(`doesn't emit for equal array inner values w/ compare`, () => {
    const value = ['foo', 'bar'];
    const a = new Subject([...value], null);
    const b = new Subject(['baz'], () => [...value]);

    const counts = [0, 0];
    const subscriptions = [
      a.state$.subscribe(() => counts[0]++),
      b.state$.subscribe(() => counts[1]++)
    ];

    a.next([...value], true);
    a.next([...value], true);
    b.next(['baz'], true);
    b.next(['baz'], true);
    subscriptions.map((subscription) => subscription.unsubscribe());

    expect(counts).toEqual([1, 1]);
  });
});
