import { wait, subscribe } from 'promist';
import {
  Enclosure,
  ReporterResource,
  MachineResource,
  MachineQueueResource,
  MachineSubject,
  MachineQueueSubject
} from '~/sources';

const mocks = {
  next: jest.spyOn(Enclosure.prototype as any, 'next'),
  report: jest.spyOn(ReporterResource.prototype as any, 'report'),
  engage: jest.spyOn(MachineResource.prototype as any, 'engage'),
  enqueue: jest.spyOn(MachineQueueResource.prototype as any, 'enqueue')
};

describe(`Machine`, () => {
  test(`methods call super`, () => {
    Object.values(mocks).map((mock) => mock.mockClear());
    const subject = new MachineSubject(null, null);

    expect(mocks.next).toHaveBeenCalledTimes(0);
    expect(mocks.report).toHaveBeenCalledTimes(0);
    expect(mocks.engage).toHaveBeenCalledTimes(0);

    subject.next(null, true);
    expect(mocks.next).toHaveBeenLastCalledWith(null, true);

    const err = Error('foo');
    subject.report(err);
    expect(mocks.report).toHaveBeenLastCalledWith(err);

    subject.engage(true);
    expect(mocks.engage).toHaveBeenLastCalledWith(true);
  });
  test(`busy is false`, () => {
    const subject = new MachineSubject(null, null);
    expect(subject.busy).toBe(false);
  });
  test(`busy$ emits first value (false) synchronously`, () => {
    const subject = new MachineSubject(null, null);
    let value: boolean | null = null;
    const subscription = subject.busy$.subscribe((val) => (value = val));
    subscription.unsubscribe();
    expect(value).toBe(false);
  });
  test(`engage sets busy/busy$`, async () => {
    const subject = new MachineSubject(null, null);

    subject.engage(true);
    expect(subject.busy).toBe(true);
    await expect(subscribe(subject.busy$)).resolves.toBe(true);

    subject.engage(false);
    expect(subject.busy).toBe(false);
    await expect(subscribe(subject.busy$)).resolves.toBe(false);
  });
  test(`engage throws on non boolean values`, () => {
    const subject = new MachineSubject(null, null);

    expect(() =>
      subject.engage(undefined as any)
    ).toThrowErrorMatchingInlineSnapshot(`"Value must be a boolean"`);
    expect(() => subject.engage(null as any)).toThrowError();
  });
  test(`busy$ is a stream with unique sequential values`, () => {
    const subject = new MachineSubject(null, null);
    const values: boolean[] = [];
    const subscription = subject.busy$.subscribe((value) => values.push(value));
    subject.engage(true);
    subject.engage(false);
    subject.engage(false);
    subject.engage(true);
    subject.engage(true);
    subject.engage(false);
    subscription.unsubscribe();

    expect(values).toEqual([false, true, false, true, false]);
  });
});

describe(`MachineQueue`, () => {
  test(`methods call super`, () => {
    Object.values(mocks).map((mock) => mock.mockClear());
    const subject = new MachineQueueSubject(null, null);

    expect(mocks.next).toHaveBeenCalledTimes(0);
    expect(mocks.report).toHaveBeenCalledTimes(0);
    expect(mocks.engage).toHaveBeenCalledTimes(0);
    expect(mocks.enqueue).toHaveBeenCalledTimes(0);

    subject.next(null, true);
    expect(mocks.next).toHaveBeenLastCalledWith(null, true);

    const err = Error('foo');
    subject.report(err);
    expect(mocks.report).toHaveBeenLastCalledWith(err);

    subject.engage(true);
    expect(mocks.engage).toHaveBeenLastCalledWith(true);

    const fn = () => null;
    subject.enqueue(fn);
    expect(mocks.enqueue).toHaveBeenLastCalledWith(fn);
  });
  test(`enqueue resolves for sync function`, async () => {
    const subject = new MachineQueueSubject(null, null);
    await expect(subject.enqueue(() => 'foo')).resolves.toBe('foo');
  });
  test(`enqueue resolves for async function`, async () => {
    const subject = new MachineQueueSubject(null, null);
    await expect(subject.enqueue(async () => 'foo')).resolves.toBe('foo');
  });
  test(`enqueue rejects for sync function`, async () => {
    const subject = new MachineQueueSubject(null, null);
    const err = new Error(`foo`);
    await expect(
      subject.enqueue(() => {
        throw err;
      })
    ).rejects.toBe(err);
  });
  test(`enqueue rejects for async function`, async () => {
    const subject = new MachineQueueSubject(null, null);
    const err = new Error(`foo`);
    await expect(subject.enqueue(async () => Promise.reject(err))).rejects.toBe(
      err
    );
  });
  test(`enqueue reports on rejection`, async () => {
    const subject = new MachineQueueSubject(null, null);
    const err = new Error(`foo`);
    const errors = subscribe(subject.error$);
    await subject.enqueue(() => Promise.reject(err)).catch(() => null);
    await expect(errors).resolves.toBe(err);
  });
  test(`enqueue engages/unengages`, async () => {
    const subject = new MachineQueueSubject(null, null);
    const start = Date.now();
    const promise = subject.enqueue(() =>
      wait(200).then(() => Date.now() - start)
    );
    await wait(50);
    expect(subject.busy).toBe(true);
    await expect(promise).resolves.toBeGreaterThanOrEqual(200);
    await expect(promise).resolves.toBeLessThan(250);
    expect(subject.busy).toBe(false);
  });
  test(`enqueue doesn't unengage when a manual engage is in place`, async () => {
    const subject = new MachineQueueSubject(null, null);
    subject.engage(true);
    await expect(subject.enqueue(() => 'foo')).resolves.toBe('foo');
    expect(subject.busy).toBe(true);
    subject.engage(false);
    expect(subject.busy).toBe(false);
  });
  test(`enqueue runs tasks sequentially`, async () => {
    const subject = new MachineQueueSubject(null, null);

    let done = false;
    const start = Date.now();
    const a = subject.enqueue(async () => {
      await wait(100);
      done = true;
      return subject.busy;
    });
    const b = subject.enqueue(async () => {
      const value = done;
      await wait(100);
      return value && subject.busy;
    });
    const c = subject.enqueue(() => Date.now() - start);

    expect(subject.busy).toBe(true);
    await expect(a).resolves.toBe(true);
    await expect(b).resolves.toBe(true);
    await expect(c).resolves.toBeGreaterThanOrEqual(200);
    await expect(c).resolves.toBeLessThan(250);
    expect(subject.busy).toBe(false);
  });
  test(`enqueue runs second batch of tasks`, async () => {
    const subject = new MachineQueueSubject(null, null);

    subject.enqueue(() => wait(50));
    subject.enqueue(() => wait(50));
    expect(subject.busy).toBe(true);
    await wait(125);
    expect(subject.busy).toBe(false);

    await expect(subject.enqueue(() => subject.busy)).resolves.toBe(true);
    await expect(
      subject.enqueue(() => wait(50).then(() => subject.busy))
    ).resolves.toBe(true);
    await expect(
      subject.enqueue(() => wait(50).then(() => subject.busy))
    ).resolves.toBe(true);
    expect(subject.busy).toBe(false);
  });
});
