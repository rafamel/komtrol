import { subscribe } from 'promist';
import {
  SuperMachine,
  MachineSubject,
  ReporterMachineSubject,
  ResourceSubject,
  MachineSourceSubject
} from '~/super';

const mocks = {
  enable: jest.spyOn(SuperMachine.prototype as any, 'enable'),
  disable: jest.spyOn(SuperMachine.prototype as any, 'disable')
};

test(`methods call super`, () => {
  const subjects = [
    new MachineSubject(),
    new ReporterMachineSubject(),
    new MachineSourceSubject(null),
    new ResourceSubject(null)
  ];

  for (const subject of subjects) {
    Object.values(mocks).map((mock) => mock.mockClear());

    expect(mocks.enable).not.toHaveBeenCalled();
    expect(mocks.disable).not.toHaveBeenCalled();

    subject.enable();
    expect(mocks.enable).toHaveBeenLastCalledWith();

    subject.disable();
    expect(mocks.disable).toHaveBeenLastCalledWith();
  }
});

test(`enable and disable call constructor parameters once`, () => {
  const [a, b] = [jest.fn(), jest.fn()];
  const subjects = [
    new MachineSubject(a, b),
    new ReporterMachineSubject(a, b),
    new MachineSourceSubject(null, null, a, b),
    new ResourceSubject(null, null, a, b)
  ];

  for (const subject of subjects) {
    [a, b].map((mock) => mock.mockClear());

    expect(a).not.toHaveBeenCalled();
    expect(b).not.toHaveBeenCalled();

    subject.enable();
    expect(a).toHaveBeenCalledTimes(1);
    subject.enable();
    expect(a).toHaveBeenCalledTimes(1);

    subject.disable();
    expect(b).toHaveBeenCalledTimes(1);
    subject.disable();
    expect(b).toHaveBeenCalledTimes(1);
  }
});

test(`a subscription returned by enable is unsubscribed on disable`, () => {
  const subscription: any = { unsubscribe: jest.fn() };
  const subjects = [
    new MachineSubject(() => subscription),
    new ReporterMachineSubject(() => subscription),
    new MachineSourceSubject(null, null, () => subscription),
    new ResourceSubject(null, null, () => subscription)
  ];

  for (const subject of subjects) {
    subscription.unsubscribe.mockClear();

    subject.enable();
    expect(subscription.unsubscribe).not.toHaveBeenCalled();
    subject.disable();
    expect(subscription.unsubscribe).toHaveBeenCalledTimes(1);
    subject.disable();
    expect(subscription.unsubscribe).toHaveBeenCalledTimes(1);

    subject.enable();
    subject.disable();
    expect(subscription.unsubscribe).toHaveBeenCalledTimes(2);
  }
});

test(`a subscription array returned by enable is unsubscribed on disable`, () => {
  const subscriptions: any[] = [
    { unsubscribe: jest.fn() },
    { unsubscribe: jest.fn() },
    { unsubscribe: jest.fn() }
  ];
  const subjects = [
    new MachineSubject(() => subscriptions),
    new ReporterMachineSubject(() => subscriptions),
    new MachineSourceSubject(null, null, () => subscriptions),
    new ResourceSubject(null, null, () => subscriptions)
  ];

  for (const subject of subjects) {
    subscriptions.map(({ unsubscribe }) => unsubscribe.mockClear());

    subject.enable();
    expect(subscriptions[0].unsubscribe).not.toHaveBeenCalled();
    expect(subscriptions[1].unsubscribe).not.toHaveBeenCalled();
    expect(subscriptions[2].unsubscribe).not.toHaveBeenCalled();

    subject.disable();
    expect(subscriptions[0].unsubscribe).toHaveBeenCalledTimes(1);
    expect(subscriptions[1].unsubscribe).toHaveBeenCalledTimes(1);
    expect(subscriptions[2].unsubscribe).toHaveBeenCalledTimes(1);

    subject.disable();
    expect(subscriptions[0].unsubscribe).toHaveBeenCalledTimes(1);
    expect(subscriptions[1].unsubscribe).toHaveBeenCalledTimes(1);
    expect(subscriptions[2].unsubscribe).toHaveBeenCalledTimes(1);

    subject.enable();
    subject.disable();
    expect(subscriptions[0].unsubscribe).toHaveBeenCalledTimes(2);
    expect(subscriptions[1].unsubscribe).toHaveBeenCalledTimes(2);
    expect(subscriptions[2].unsubscribe).toHaveBeenCalledTimes(2);
  }
});

test(`active is false`, () => {
  const subjects = [
    new MachineSubject(),
    new ReporterMachineSubject(),
    new MachineSourceSubject(null),
    new ResourceSubject(null)
  ];

  for (const subject of subjects) {
    expect(subject.active).toBe(false);
  }
});

test(`active$ emits first value (false) synchronously`, () => {
  const subjects = [
    new MachineSubject(),
    new ReporterMachineSubject(),
    new MachineSourceSubject(null),
    new ResourceSubject(null)
  ];

  for (const subject of subjects) {
    let value: boolean | null = null;
    const subscription = subject.active$.subscribe((val) => (value = val));
    subscription.unsubscribe();
    expect(value).toBe(false);
  }
});

test(`enable/disable set active/active$`, async () => {
  const subjects = [
    new MachineSubject(),
    new ReporterMachineSubject(),
    new MachineSourceSubject(null),
    new ResourceSubject(null)
  ];

  for (const subject of subjects) {
    subject.enable();
    expect(subject.active).toBe(true);
    await expect(subscribe(subject.active$)).resolves.toBe(true);

    subject.disable();
    expect(subject.active).toBe(false);
    await expect(subscribe(subject.active$)).resolves.toBe(false);
  }
});

test(`active$ is a stream with unique sequential values`, () => {
  const subjects = [
    new MachineSubject(),
    new ReporterMachineSubject(),
    new MachineSourceSubject(null),
    new ResourceSubject(null)
  ];

  for (const subject of subjects) {
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
  }
});
