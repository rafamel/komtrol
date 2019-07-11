export default mapTo;

function mapTo<K extends string>(
  key: K
): <A, B>(a: A, b: B) => A & { [P in K]: B };
function mapTo<A, B, K extends string>(
  key: K
): (a: A, b: B) => A & { [P in K]: B };

function mapTo(key: null): <A, B>(a: A, b: B) => A & B;
function mapTo<A, B>(key: null): (a: A, b: B) => A & B;

function mapTo<K extends string>(
  key: K | null
): <A, B>(a: A, b: B) => A & (B | { [P in K]: B });
function mapTo<A, B, K extends string>(
  key: K | null
): (a: A, b: B) => A & (B | { [P in K]: B });

function mapTo<K extends string>(
  key: K | null
): <A, B>(a: A, b: B) => A & (B | { [P in K]: B }) {
  return key === null
    ? <A, B>(a: A, b: B) => ({ ...a, ...b })
    : <A, B>(a: A, b: B) => ({ ...a, [key]: b } as A & { [P in K]: B });
}
