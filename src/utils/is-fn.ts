export default function isNoParamsFn<T>(
  value: T | (() => T)
): value is () => T {
  return typeof value === 'function';
}
