import { subscribe } from 'promist';
import { Enclosure, SuperMachineSource, MachineSourceSubject } from '~/super';

const mocks = {
  next: jest.spyOn(Enclosure.prototype as any, 'next'),
  enable: jest.spyOn(SuperMachineSource.prototype as any, 'enable'),
  disable: jest.spyOn(SuperMachineSource.prototype as any, 'disable')
};

describe(`Machine`, () => {
  test(`methods call super`, () => {
    Object.values(mocks).map((mock) => mock.mockClear());
    const subject = new MachineSourceSubject(null, null);

    expect(mocks.next).toHaveBeenCalledTimes(0);
    expect(mocks.enable).toHaveBeenCalledTimes(0);
    expect(mocks.disable).toHaveBeenCalledTimes(0);

    subject.next(null, true);
    expect(mocks.next).toHaveBeenLastCalledWith(null, true);

    subject.enable();
    expect(mocks.enable).toHaveBeenLastCalledWith();

    subject.disable();
    expect(mocks.disable).toHaveBeenLastCalledWith();
  });
  test(`active is false`, () => {
    const subject = new MachineSourceSubject(null, null);
    expect(subject.active).toBe(false);
  });
  test(`active$ emits first value (false) synchronously`, () => {
    const subject = new MachineSourceSubject(null, null);
    let value: boolean | null = null;
    const subscription = subject.active$.subscribe((val) => (value = val));
    subscription.unsubscribe();
    expect(value).toBe(false);
  });
  test(`enable/disable set active/active$`, async () => {
    const subject = new MachineSourceSubject(null, null);

    subject.enable();
    expect(subject.active).toBe(true);
    await expect(subscribe(subject.active$)).resolves.toBe(true);

    subject.disable();
    expect(subject.active).toBe(false);
    await expect(subscribe(subject.active$)).resolves.toBe(false);
  });
  test(`active$ is a stream with unique sequential values`, () => {
    const subject = new MachineSourceSubject(null, null);
    const values: boolean[] = [];
    const subscription = subject.active$.subscribe((value) =>
      values.push(value)
    );
    subject.enable();
    subject.disable();
    subject.disable();
    subject.enable();
    subject.enable();
    subject.disable();
    subscription.unsubscribe();

    expect(values).toEqual([false, true, false, true, false]);
  });
});
