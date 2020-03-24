import { subscribe } from 'promist';
import {
  Enclosure,
  ReporterResource,
  MachineResource,
  MachineSubject
} from '~/sources';

const mocks = {
  next: jest.spyOn(Enclosure.prototype as any, 'next'),
  report: jest.spyOn(ReporterResource.prototype as any, 'report'),
  engage: jest.spyOn(MachineResource.prototype as any, 'engage')
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
