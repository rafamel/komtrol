import { subscribe } from 'promist';
import {
  Enclosure,
  SourceSubject,
  ReporterSourceSubject,
  MachineSourceSubject,
  ResourceSubject
} from '~/super';

const state = { foo: 'foo', bar: 'bar' };

const mocks = {
  next: jest.spyOn(Enclosure.prototype as any, 'next')
};

describe(`preconditions`, () => {
  test(`methods call super`, () => {
    const subjects = [
      new SourceSubject(null),
      new ReporterSourceSubject(null),
      new MachineSourceSubject(null),
      new ResourceSubject(null)
    ];

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
    const subjects = [
      new SourceSubject(null),
      new ReporterSourceSubject(null),
      new MachineSourceSubject(null),
      new ResourceSubject(null)
    ];

    for (const subject of subjects) {
      expect(subject.state).toBe(null);
      await expect(subscribe(subject.state$)).resolves.toBe(null);
    }
  });
  test(`are set by constructor when truthy`, async () => {
    const subjects = [
      new SourceSubject(state),
      new ReporterSourceSubject(state),
      new MachineSourceSubject(state),
      new ResourceSubject(state)
    ];

    for (const subject of subjects) {
      expect(subject.state).toEqual(state);
      await expect(subscribe(subject.state$)).resolves.toEqual(state);
    }
  });
  test(`are successfully mapped`, () => {
    const initial = (state: any): any => ({ foo: state.foo, baz: 'baz' });
    const subjects = [
      new SourceSubject(state, initial),
      new ReporterSourceSubject(state, initial),
      new MachineSourceSubject(state, initial),
      new ResourceSubject(state, initial)
    ];

    for (const subject of subjects) {
      let value: any = null;
      const subscription = subject.state$.subscribe((val) => (value = val));
      subscription.unsubscribe();

      expect(subject.state).toEqual({ foo: 'foo', baz: 'baz' });
      expect(value).toEqual({ foo: 'foo', baz: 'baz' });
    }
  });
  test(`comply with shallow and deep equality rules`, async () => {
    const arr = ['foo', 'bar'];
    const a = [
      new SourceSubject(arr),
      new ReporterSourceSubject(arr),
      new MachineSourceSubject(arr),
      new ResourceSubject(arr)
    ];
    for (const subject of a) {
      expect(subject.state).toBe(arr);
      await expect(subscribe(subject.state$)).resolves.toBe(subject.state);
    }

    const b = [
      new SourceSubject(state),
      new ReporterSourceSubject(state),
      new MachineSourceSubject(state),
      new ResourceSubject(state)
    ];
    for (const subject of b) {
      expect(subject.state).toEqual(state);
      expect(subject.state).not.toBe(state);
      await expect(subscribe(subject.state$)).resolves.toBe(subject.state);
    }

    const c = [
      new SourceSubject({ ...state }, () => state),
      new ReporterSourceSubject({ ...state }, () => state),
      new MachineSourceSubject({ ...state }, () => state),
      new ResourceSubject({ ...state }, () => state)
    ];
    for (const subject of c) {
      expect(subject.state).toBe(state);
      await expect(subscribe(subject.state$)).resolves.toBe(subject.state);
    }
  });
  test(`state$ emits first value synchronously`, () => {
    const subjects = [
      new SourceSubject(state),
      new ReporterSourceSubject(state),
      new MachineSourceSubject(state),
      new ResourceSubject(state),

      new SourceSubject(state, () => state),
      new ReporterSourceSubject(state, () => state),
      new MachineSourceSubject(state, () => state),
      new ResourceSubject(state, () => state)
    ];

    for (const subject of subjects) {
      let value = null;
      subject.state$.subscribe((x) => (value = x)).unsubscribe();
      expect(value).toEqual(state);
    }
  });
  test(`access doesn't cause additional map executions`, async () => {
    const fn = jest.fn().mockImplementation((x) => ({ ...x }));

    const subjects = [
      new SourceSubject(state, fn),
      new ReporterSourceSubject(state, fn),
      new MachineSourceSubject(state, fn),
      new ResourceSubject(state, fn)
    ];

    expect(fn).toHaveBeenCalledTimes(4);

    for (const subject of subjects) {
      fn.mockClear();

      expect(subject.state).toEqual(state);
      expect(subject.state).toEqual(state);
      await expect(subscribe(subject.state$)).resolves.toEqual(state);
      await expect(subscribe(subject.state$)).resolves.toEqual(state);
      expect(fn).not.toHaveBeenCalled();
    }
  });
});

describe(`next`, () => {
  test(`sets state`, async () => {
    const subjects = [
      new SourceSubject(true),
      new ReporterSourceSubject(true),
      new MachineSourceSubject(true),
      new ResourceSubject(true)
    ];

    for (const subject of subjects) {
      subject.next(false);
      expect(subject.state).toBe(false);
      await expect(subscribe(subject.state$)).resolves.toBe(false);
    }
  });
  test(`complies with shallow and deep equality rules`, async () => {
    const arr = ['foo', 'bar'];
    const a = [
      new SourceSubject(['baz']),
      new ReporterSourceSubject(['baz']),
      new MachineSourceSubject(['baz']),
      new ResourceSubject(['baz'])
    ];
    for (const subject of a) {
      subject.next(arr);
      expect(subject.state).toBe(arr);
      await expect(subscribe(subject.state$)).resolves.toBe(subject.state);
    }

    const b = [
      new SourceSubject({ ...state, foo: 'none' }),
      new ReporterSourceSubject({ ...state, foo: 'none' }),
      new MachineSourceSubject({ ...state, foo: 'none' }),
      new ResourceSubject({ ...state, foo: 'none' })
    ];
    for (const subject of b) {
      subject.next(state);
      expect(subject.state).toEqual(state);
      expect(subject.state).not.toBe(state);
      await expect(subscribe(subject.state$)).resolves.toBe(subject.state);
    }

    const c = [
      new SourceSubject({ ...state }, () => state),
      new ReporterSourceSubject({ ...state }, () => state),
      new MachineSourceSubject({ ...state }, () => state),
      new ResourceSubject({ ...state }, () => state)
    ];
    for (const subject of c) {
      subject.next({});
      expect(subject.state).toBe(state);
      await expect(subscribe(subject.state$)).resolves.toBe(subject.state);
    }
  });
  test(`sets and merges state for objects`, async () => {
    const subjects = [
      new SourceSubject(state),
      new ReporterSourceSubject(state),
      new MachineSourceSubject(state),
      new ResourceSubject(state)
    ];

    for (const subject of subjects) {
      subject.next({ bar: 'merge' });
      expect(subject.state).toEqual({ ...state, bar: 'merge' });
      await expect(subscribe(subject.state$)).resolves.toEqual({
        ...state,
        bar: 'merge'
      });
    }
  });
  test(`maps state`, async () => {
    const fn = jest.fn().mockImplementation((state) => ({
      ...state,
      foo: state.foo + '-map'
    }));
    const subjects = [
      new SourceSubject(state, fn),
      new ReporterSourceSubject(state, fn),
      new MachineSourceSubject(state, fn),
      new ResourceSubject(state, fn)
    ];
    expect(fn).toHaveBeenCalledTimes(4);

    for (const subject of subjects) {
      fn.mockClear();

      subject.next({ foo: 'update' });
      expect(fn).toHaveBeenLastCalledWith({ ...state, foo: 'update' });
      expect(fn).toHaveBeenCalledTimes(1);

      expect(subject.state).toEqual({ ...state, foo: 'update-map' });
      await expect(subscribe(subject.state$)).resolves.toEqual({
        ...state,
        foo: 'update-map'
      });
      expect(fn).toHaveBeenCalledTimes(1);
    }
  });
  test(`emits for equal values wo/ compare`, () => {
    const subjects = [
      new SourceSubject(true),
      new ReporterSourceSubject(true),
      new MachineSourceSubject(true),
      new ResourceSubject(true)
    ];

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
      new ReporterSourceSubject({ ...state }),
      new MachineSourceSubject({ ...state }),
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
      new SourceSubject({ ...state }, () => ({ ...state })),
      new ReporterSourceSubject({ ...state }, () => ({ ...state })),
      new MachineSourceSubject({ ...state }, () => ({ ...state })),
      new ResourceSubject({ ...state }, () => ({ ...state }))
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

    const a = [
      new SourceSubject([...value]),
      new ReporterSourceSubject([...value]),
      new MachineSourceSubject([...value]),
      new ResourceSubject([...value])
    ];
    for (const subject of a) {
      let count = 0;
      const subscription = subject.state$.subscribe(() => count++);

      subject.next([...value]);
      subject.next([...value], false);
      subscription.unsubscribe();

      expect(count).toBe(3);
    }

    const b = [
      new SourceSubject(['baz'], () => [...value]),
      new ReporterSourceSubject(['baz'], () => [...value]),
      new MachineSourceSubject(['baz'], () => [...value]),
      new ResourceSubject(['baz'], () => [...value])
    ];
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
    const subjects = [
      new SourceSubject(true),
      new ReporterSourceSubject(true),
      new MachineSourceSubject(true),
      new ResourceSubject(true)
    ];

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
      new ReporterSourceSubject({ ...state }),
      new MachineSourceSubject({ ...state }),
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
      new SourceSubject({ ...state }, () => ({ ...state })),
      new ReporterSourceSubject({ ...state }, () => ({ ...state })),
      new MachineSourceSubject({ ...state }, () => ({ ...state })),
      new ResourceSubject({ ...state }, () => ({ ...state }))
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

    const a = [
      new SourceSubject([...value]),
      new ReporterSourceSubject([...value]),
      new MachineSourceSubject([...value]),
      new ResourceSubject([...value])
    ];
    for (const subject of a) {
      let count = 0;
      const subscription = subject.state$.subscribe(() => count++);

      subject.next([...value], true);
      subject.next([...value], true);
      subscription.unsubscribe();

      expect(count).toBe(1);
    }

    const b = [
      new SourceSubject(['baz'], () => [...value]),
      new ReporterSourceSubject(['baz'], () => [...value]),
      new MachineSourceSubject(['baz'], () => [...value]),
      new ResourceSubject(['baz'], () => [...value])
    ];
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
