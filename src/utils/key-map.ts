export default keyMap;

function keyMap<K extends string>(
  key: K
): <A, B>(a: A, b: B) => A & { [P in K]: B };
function keyMap(key: null): <A, B>(a: A, b: B) => A & B;
function keyMap<K extends string>(
  key: K | null
): <A, B>(a: A, b: B) => A & (B | { [P in K]: B });

function keyMap<K extends string>(
  key: K | null
): <A, B>(a: A, b: B) => A & (B | { [P in K]: B }) {
  return key === null
    ? <A, B>(a: A, b: B) => ({ ...a, ...b })
    : <A, B>(a: A, b: B) => ({ ...a, [key]: b } as A & { [P in K]: B });
}
