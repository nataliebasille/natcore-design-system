# Natcore Core Release Tracks

This repository now treats `@nataliebasille/natcore-design-system` as the single public core package.

## Source of truth

- `packages/core` is the package that gets published.
- `packages/core-v2` remains in the repo as internal source during migration and is marked `private`.

## Publishing behavior

- `2.x` releases should be published from the mainline branch and tagged as `latest`.
- `1.x` maintenance releases should be published from a `release/1.x` branch and tagged as `v1`.

Root scripts:

- `pnpm release:2x` publishes with `latest` tag.
- `pnpm release:1x` publishes with `v1` tag.

## Consumer install guidance

- New projects: `pnpm add @nataliebasille/natcore-design-system@latest`
- Legacy v1 projects: `pnpm add @nataliebasille/natcore-design-system@v1`
- Pinned major (recommended for apps): `@nataliebasille/natcore-design-system@^1` or `@nataliebasille/natcore-design-system@^2`
