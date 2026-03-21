export * from "../../core-v2/src/shared/utils.ts";

export type ColorConfig =
	| string
	| {
			color: string;
			shade: number;
			variables?: Record<string, string | number>;
		};

export interface ColorSchema {
	[key: string]: ColorConfig;
}

export const VARIABLES_TO_SHADES = {
	base: 500,
	"base-hover": 600,
	"background-color": 100,
	"background-color-hover": 200,
	active: 700,
	disable: 200,
	border: 300,
} as const;

export type NormalizedColorSchema<TSchema extends ColorSchema> = {
	themes: {
		light: {
			variants: {
				[K in keyof TSchema & string]: Record<
					string,
					readonly [string, string]
				>;
			};
			variables: Record<string, string | number>;
		};
		dark?: {
			variants: {
				[K in keyof TSchema & string]: Record<
					string,
					readonly [string, string]
				>;
			};
			variables: Record<string, string | number>;
		};
	};
};

export function formatColorForCssVariable(color: string): string {
	const normalized = color.trim();

	if (normalized.startsWith("#")) {
		return toRgb(normalized);
	}

	if (normalized.startsWith("rgb(")) {
		return normalized.slice(4, -1).replace(/\s*,\s*/g, " ");
	}

	if (normalized.startsWith("rgba(")) {
		const [r, g, b] = normalized
			.slice(5, -1)
			.split(",")
			.map((part) => part.trim());

		return `${r} ${g} ${b}`;
	}

	return normalized;
}

export function toRgb(hexColor: string): string {
	const hex = hexColor.trim().replace(/^#/, "");

	if (hex.length === 3) {
		const [r, g, b] = hex.split("").map((ch) => parseInt(ch + ch, 16));
		return `${r} ${g} ${b}`;
	}

	if (hex.length === 6) {
		const r = parseInt(hex.slice(0, 2), 16);
		const g = parseInt(hex.slice(2, 4), 16);
		const b = parseInt(hex.slice(4, 6), 16);
		return `${r} ${g} ${b}`;
	}

	return hexColor;
}
