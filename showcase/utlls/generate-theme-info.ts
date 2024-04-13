import { type PluginAPI } from "tailwindcss/types/config";

export type ThemeFactory = (
  theme: PluginAPI["theme"],
) => Readonly<Record<string, any>>;

type RelevantClassKeys<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: Key extends
    | `${string}.${string}`
    | `&.${string}`
    ? ObjectType[Key] extends object
      ? Key | RelevantClassKeys<ObjectType[Key]>
      : Key
    : never;
}[keyof ObjectType & (string | number)];

//eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
type InferThemeClasses<T extends ThemeFactory> = InferClassesFromKey<
  Extract<RelevantClassKeys<ReturnType<T>>, string>
>;

type InferClassesFromKey<K extends string> = K extends `&.${infer C}`
  ? C extends `${infer Head},${infer Rest}`
    ? Head | InferClassesFromKey<Rest>
    : C
  : K extends `.${infer C}` | `> .${infer C}`
  ? C extends `${infer Head},${infer Rest}`
    ? Head | InferClassesFromKey<Rest>
    : C
  : never;

export type ThemeClass = {
  className: string;
  description: string;
  type: "component" | "modifier";
};

export const generateThemeInfo = <T extends ThemeFactory>(
  themeFactory: T,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  descriptions: Partial<Record<InferThemeClasses<T>, string>>,
): ThemeClass[] => {
  const theme = themeFactory((() => "") as PluginAPI["theme"]);

  const themeClasses = new Map<string, ThemeClass>();

  gatherThemeClassKeys(theme);

  return Array.from(themeClasses.values());

  function gatherThemeClassKeys(obj: object) {
    for (const key in obj) {
      const potentialThemeClass = key.split(/[\+,]+/).map((k) => k.trim());

      for (const c of potentialThemeClass) {
        if (
          !themeClasses.has(c) &&
          c.indexOf(".") >= 0 &&
          c.indexOf(":has") < 0
        ) {
          const type = c[0] === "&" ? "modifier" : "component";
          const className = c.slice(
            type === "component" ? c.indexOf(".") + 1 : 2,
          );
          themeClasses.set(className, {
            className,
            // temporarily ignore until we figure out the excessively deep and possibly infinite issue
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            description: descriptions[className as InferThemeClasses<T>] || "",
            type,
          });
        }
      }

      if (typeof (obj as any)[key] === "object") {
        gatherThemeClassKeys((obj as any)[key]);
      }
    }
  }
};
