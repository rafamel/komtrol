import { subscribe } from 'promist';
import { SourceEnclosure, SourceSubject, ResourceSubject } from '~/super';

const state = { foo: 'foo', bar: 'bar' };

const mocks = {
  next: jest.spyOn(SourceEnclosure.prototype as any, 'next')
};

describe(`preconditions`, () => {
  test(`methods call super`, () => {
    const subjects = [new SourceSubject(null), new ResourceSubject(null)];

    for (const subject of subjects) {
      Object.values(mocks).map((mock) => mock.mockClear());

      expect(mocks.next).not.toHaveBeenCalled();
      subject.next(null, true);
      expect(mocks.next).toHaveBeenLastCalledWith(null, true);
    }
  });
});

describe(`state, state$`, () => {
  test(`are set by constructor when falsy`, async () => {
    const subjects = [new SourceSubject(null), new ResourceSubject(null)];

    for (const subject of subjects) {
      expect(subject.state).toBe(null);
      await expect(subscribe(subject.state$)).resolves.toBe(null);
    }
  });
  test(`are set by constructor when truthy`, async () => {
    const subjects = [new SourceSubject(state), new ResourceSubject(state)];

    for (const subject of subjects) {
      expect(subject.state).toEqual(state);
      await expect(subscribe(subject.state$)).resolves.toEqual(state);
    }
  });
  test(`comply with shallow and deep equality rules`, async () => {
    const arr = ['foo', 'bar'];
    const a = [new SourceSubject(arr), new ResourceSubject(arr)];
    for (const subject of a) {
      expect(subject.state).toBe(arr);
      await expect(subscribe(subject.state$)).resolves.toBe(subject.state);
    }

    const b = [new SourceSubject(state), new ResourceSubject(state)];
    for (const subject of b) {
      expect(subject.state).toEqual(state);
      expect(subject.state).not.toBe(state);
      await expect(subscribe(subject.state$)).resolves.toBe(subject.state);
    }
  });
  test(`state$ emits first value synchronously`, () => {
    const subjects = [
      new SourceSubject(state),
      new ResourceSubject(state),

      new SourceSubject(state),
      new ResourceSubject(state)
    ];

    for (const subject of subjects) {
      let value = null;
      subject.state$.subscribe((x) => (value = x)).unsubscribe();
      expect(value).toEqual(state);
    }
  });
});

describe(`next`, () => {
  test(`sets state`, async () => {
    const subjects = [new SourceSubject(true), new ResourceSubject(true)];

    for (const subject of subjects) {
      subject.next(false);
      expect(subject.state).toBe(false);
      await expect(subscribe(subject.state$)).resolves.toBe(false);
    }
  });
  test(`complies with shallow and deep equality rules`, async () => {
    const arr = ['foo', 'bar'];
    const a = [new SourceSubject(['baz']), new ResourceSubject(['baz'])];
    for (const subject of a) {
      subject.next(arr);
      expect(subject.state).toBe(arr);
      await expect(subscribe(subject.state$)).resolves.toBe(subject.state);
    }

    const b = [
      new SourceSubject({ ...state, foo: 'none' }),
      new ResourceSubject({ ...state, foo: 'none' })
    ];
    for (const subject of b) {
      subject.next(state);
      expect(subject.state).toEqual(state);
      expect(subject.state).not.toBe(state);
      await expect(subscribe(subject.state$)).resolves.toBe(subject.state);
    }

    const c = [new SourceSubject(state), new ResourceSubject(state)];
    for (const subject of c) {
      subject.next({});
      expect(subject.state).toEqual(state);
      await expect(subscribe(subject.state$)).resolves.toBe(subject.state);
    }
  });
  test(`sets and merges state for objects`, async () => {
    const subjects = [new SourceSubject(state), new ResourceSubject(state)];

    for (const subject of subjects) {
      subject.next({ bar: 'merge' });
      expect(subject.state).toEqual({ ...state, bar: 'merge' });
      await expect(subscribe(subject.state$)).resolves.toEqual({
        ...state,
        bar: 'merge'
      });
    }
  });
  test(`emits for equal values wo/ compare`, () => {
    const subjects = [new SourceSubject(true), new ResourceSubject(true)];

    for (const subject of subjects) {
      let count = 0;
      const subscription = subject.state$.subscribe(() => count++);

      subject.next(true);
      subject.next(true, false);
      subscription.unsubscribe();

      expect(count).toBe(3);
    }
  });
  test(`emits for equal object inner values wo/ compare`, () => {
    const a = [
      new SourceSubject({ ...state }),
      new ResourceSubject({ ...state })
    ];
    for (const subject of a) {
      let count = 0;
      const subscription = subject.state$.subscribe(() => count++);

      subject.next({ foo: state.foo });
      subject.next({ ...state }, false);
      subscription.unsubscribe();

      expect(count).toBe(3);
    }

    const b = [
      new SourceSubject({ ...state }),
      new ResourceSubject({ ...state })
    ];
    for (const subject of b) {
      let count = 0;
      const subscription = subject.state$.subscribe(() => count++);

      subject.next({});
      subject.next({}, false);
      subscription.unsubscribe();

      expect(count).toBe(3);
    }
  });
  test(`emits for equal array inner values wo/ compare`, () => {
    const value = ['foo', 'bar'];

    const a = [new SourceSubject([...value]), new ResourceSubject([...value])];
    for (const subject of a) {
      let count = 0;
      const subscription = subject.state$.subscribe(() => count++);

      subject.next([...value]);
      subject.next([...value], false);
      subscription.unsubscribe();

      expect(count).toBe(3);
    }

    const b = [new SourceSubject(['baz']), new ResourceSubject(['baz'])];
    for (const subject of b) {
      let count = 0;
      const subscription = subject.state$.subscribe(() => count++);

      subject.next(['baz']);
      subject.next(['baz'], false);
      subscription.unsubscribe();

      expect(count).toBe(3);
    }
  });
  test(`doesn't emit for equal values w/ compare`, () => {
    const subjects = [new SourceSubject(true), new ResourceSubject(true)];

    for (const subject of subjects) {
      let count = 0;
      const subscription = subject.state$.subscribe(() => count++);

      subject.next(true, true);
      subject.next(true, true);
      subscription.unsubscribe();

      expect(count).toBe(1);
    }
  });
  test(`doesn't emit for equal object inner values w/ compare`, () => {
    const a = [
      new SourceSubject({ ...state }),
      new ResourceSubject({ ...state })
    ];
    for (const subject of a) {
      let count = 0;
      const subscription = subject.state$.subscribe(() => count++);

      subject.next({ foo: state.foo }, true);
      subject.next({ ...state }, true);
      subscription.unsubscribe();

      expect(count).toBe(1);
    }

    const b = [
      new SourceSubject({ ...state }),
      new ResourceSubject({ ...state })
    ];
    for (const subject of b) {
      let count = 0;
      const subscription = subject.state$.subscribe(() => count++);

      subject.next({}, true);
      subject.next({}, true);
      subscription.unsubscribe();

      expect(count).toBe(1);
    }
  });
  test(`doesn't emit for equal array inner values w/ compare`, () => {
    const value = ['foo', 'bar'];

    const a = [new SourceSubject([...value]), new ResourceSubject([...value])];
    for (const subject of a) {
      let count = 0;
      const subscription = subject.state$.subscribe(() => count++);

      subject.next([...value], true);
      subject.next([...value], true);
      subscription.unsubscribe();

      expect(count).toBe(1);
    }

    const b = [new SourceSubject(['baz']), new ResourceSubject(['baz'])];
    for (const subject of b) {
      let count = 0;
      const subscription = subject.state$.subscribe(() => count++);

      subject.next(['baz'], true);
      subject.next(['baz'], true);
      subscription.unsubscribe();

      expect(count).toBe(1);
    }
  });
});
