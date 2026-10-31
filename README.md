# planet (WIP)

## License

The code is licensed under the [MIT License](LICENSE).

Fonts keep their own licenses:

- `packages/markdown/src/assets/fonts/maple-mono-nf-icons.woff2` is a subset
  of [Maple Mono](https://github.com/subframe7536/maple-font) NF, licensed
  under the [SIL Open Font License 1.1](packages/markdown/src/assets/fonts/OFL.txt).
- The site's text face is [Noto Sans CJK](https://github.com/notofonts/noto-cjk)
  (Noto Sans SC, TC, HK, JP and KR), licensed under the SIL Open Font License
  1.1. It is not part of this repository: `packages/theme/scripts/build-fonts.mjs`
  downloads the fonts from [google/fonts](https://github.com/google/fonts) at
  build time and subsets them into web fonts.
- Maple Mono CN is installed from npm and is not part of this repository; it
  is used under its own license.

Images are © Alisa, all rights reserved — the MIT License does not cover
them. This includes the avatar, logo and favicons in `apps/web/public`.
Third-party brand icons in `apps/web/public/icons` belong to their
respective owners.
