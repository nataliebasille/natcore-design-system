export type ExtendsNever<T> = [T] extends [never] ? true : false;

// element type of arrays (supports readonly arrays too)
type ArrayElement<T> = T extends readonly (infer E)[] ? E : never;

// true if ANY property in Obj matches Needle directly OR via array element
type HasPropOrArrayElement<Hay, Needle> =
  true extends (
    {
      [K in keyof Hay]-?: ExtendsNever<
        Extract<NonNullable<Hay[K]>, Needle>
      > extends true ?
        ExtendsNever<
          Extract<ArrayElement<NonNullable<Hay[K]>>, Needle>
        > extends true ?
          false // Needle is not found as a property or array element in Hay
        : true
      : true;
    }[keyof Hay]
  ) ?
    true
  : false;

// filter a union U to only the members that satisfy HasPropOrArrayElement
export type SelectWherePropOrArrayElementIs<Hay, Needle> =
  Hay extends unknown ?
    HasPropOrArrayElement<Hay, Needle> extends true ?
      Hay
    : never
  : never;
