import { subscribe } from 'promist';
import { Enclosure, SuperReporterSource, ReporterSourceSubject } from '~/super';

const mocks = {
  next: jest.spyOn(Enclosure.prototype as any, 'next'),
  report: jest.spyOn(SuperReporterSource.prototype as any, 'report')
};

test(`methods call super`, () => {
  Object.values(mocks).map((mock) => mock.mockClear());
  const subject = new ReporterSourceSubject(null, null);

  expect(mocks.next).toHaveBeenCalledTimes(0);
  expect(mocks.report).toHaveBeenCalledTimes(0);

  subject.next(null, true);
  expect(mocks.next).toHaveBeenLastCalledWith(null, true);

  const err = Error('foo');
  subject.report(err);
  expect(mocks.report).toHaveBeenLastCalledWith(err);
});
test(`error$ emits on report`, async () => {
  const subject = new ReporterSourceSubject(null, null);
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
});
