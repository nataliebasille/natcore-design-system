# Natcore Core Release Tracks

This repository now treats `@nataliebasille/natcore-design-system` as the single public core package.

## Source of truth

- `packages/core-v2` is the package that gets published as `@nataliebasille/natcore-design-system`.
- The legacy v1 source (`packages/core`) has been removed from the mainline branch; it only lives on the `release/1.x` branch.

## Publishing behavior

- `2.x` releases should be published from the mainline branch and tagged as `latest`.
- `1.x` maintenance releases should be published from a `release/1.x` branch and tagged as `v1`.

## Package contract by release line

The npm package name stays the same, but the public contract of the published `package.json` differs by release line.

### `1.x` contract

- `main`: `./dist/index.cjs`
- `module`: `./dist/index.mjs`
- `exports["."]`: JS entrypoint (`import`/`require`/`default` all point at `index`)
- no `./css` export

Historical v1 shape:

```json
{
	"main": "./dist/index.cjs",
	"module": "./dist/index.mjs",
	"exports": {
		".": {
			"types": "./dist/index.d.ts",
			"import": "./dist/index.mjs",
			"require": "./dist/index.cjs",
			"default": "./dist/index.mjs"
		},
		"./plugin": {
			"types": "./dist/plugin.d.ts",
			"import": "./dist/plugin.mjs",
			"require": "./dist/plugin.cjs",
			"default": "./dist/plugin.mjs"
		},
		"./utils": {
			"types": "./dist/utils.d.ts",
			"import": "./dist/utils.mjs",
			"require": "./dist/utils.cjs",
			"default": "./dist/utils.mjs"
		}
	}
}
```

### `2.x` contract

- `main`: `./dist/natcore.css`
- `module`: `./dist/natcore.css`
- `exports["."]`: stylesheet entrypoint (`style` and `default` point at `natcore.css`)
- `./css` exists and also points at `natcore.css`
- JS remains on explicit subpaths: `./utils`, `./postcss`, and `./vite`

Current v2 shape:

```json
{
	"main": "./dist/natcore.css",
	"module": "./dist/natcore.css",
	"exports": {
		".": {
			"types": "./dist/index.d.ts",
			"style": "./dist/natcore.css",
			"default": "./dist/natcore.css"
		},
		"./css": {
			"style": "./dist/natcore.css",
			"default": "./dist/natcore.css"
		},
		"./utils": {
			"types": "./dist/utils.d.ts",
			"import": "./dist/utils.js",
			"require": "./dist/utils.cjs",
			"default": "./dist/utils.js"
		},
		"./postcss": {
			"types": "./dist/postcss.d.ts",
			"import": "./dist/postcss.js",
			"require": "./dist/postcss.cjs",
			"default": "./dist/postcss.js"
		},
		"./vite": {
			"types": "./dist/vite.d.ts",
			"import": "./dist/vite.js",
			"require": "./dist/vite.cjs",
			"default": "./dist/vite.js"
		}
	}
}
```

Root scripts:

- `pnpm release:2x` publishes with `latest` tag.
- `pnpm release:1x` publishes with `v1` tag.
- `pnpm check:release:2x` validates that `packages/core-v2/package.json` matches the 2.x contract.

## Consumer install guidance

- New projects: `pnpm add @nataliebasille/natcore-design-system@latest`
- Legacy v1 projects: `pnpm add @nataliebasille/natcore-design-system@v1`
- Pinned major (recommended for apps): `@nataliebasille/natcore-design-system@^1` or `@nataliebasille/natcore-design-system@^2`
