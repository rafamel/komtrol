import { subscribe } from 'promist';
import {
  SuperReporter,
  ReporterSubject,
  ReporterMachineSubject,
  ReporterSourceSubject,
  ResourceSubject
} from '~/super';

const mocks = {
  report: jest.spyOn(SuperReporter.prototype as any, 'report')
};

test(`methods call super`, () => {
  const subjects = [
    new ReporterSubject(),
    new ReporterMachineSubject(),
    new ReporterSourceSubject(null),
    new ResourceSubject(null)
  ];

  for (const subject of subjects) {
    Object.values(mocks).map((mock) => mock.mockClear());

    expect(mocks.report).not.toHaveBeenCalled();

    const err = Error('foo');
    subject.report(err);
    expect(mocks.report).toHaveBeenLastCalledWith(err);
  }
});

test(`error$ emits on report`, async () => {
  const subjects = [
    new ReporterSubject(),
    new ReporterMachineSubject(),
    new ReporterSourceSubject(null),
    new ResourceSubject(null)
  ];

  for (const subject of subjects) {
    const err = Error(`foo`);
    const errors: Error[] = [];
    const promise = subscribe(subject.error$);
    const subscription = subject.error$.subscribe((err) => errors.push(err));

    subject.report(err);
    await expect(promise).resolves.toBe(err);

    subject.report(Error());
    subject.report(Error());
    subscription.unsubscribe();
    expect(errors).toHaveLength(3);
  }
});
