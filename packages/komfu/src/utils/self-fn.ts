export default function isSelfFn<A, T>(
  value: T | ((self: A) => T)
): value is (self: A) => T {
  return typeof value === 'function';
}
