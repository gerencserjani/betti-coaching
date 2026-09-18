# [1.23.0](https://github.com/gerencserjani/betti-coaching/compare/v1.22.2...v1.23.0) (2026-09-18)

### Bug Fixes

- hide cancel/reschedule actions once past the notice window ([48ba03c](https://github.com/gerencserjani/betti-coaching/commit/48ba03c626d5b9b7ef9d32ef35716700633a5cdd))
- scroll to the booking section on manage links, not just rely on the hash ([925e954](https://github.com/gerencserjani/betti-coaching/commit/925e9540a18f248350f129fe1e5919815bc9e9f4)), closes [#idopontfoglalas](https://github.com/gerencserjani/betti-coaching/issues/idopontfoglalas)
- scroll to the manage content itself, not the section's heading ([1cae373](https://github.com/gerencserjani/betti-coaching/commit/1cae3738eea167ac118639c84f69477438235a3e))

### Features

- pre-select mode and current date for booking manage links ([c8b9642](https://github.com/gerencserjani/betti-coaching/commit/c8b9642e73d0aa7c9b705fc442ac5417b58554c4))
- show a confirmation screen and return home after rescheduling ([1f7625f](https://github.com/gerencserjani/betti-coaching/commit/1f7625f167981a6a88dca919cd2de0ac3695f019))

## [1.22.2](https://github.com/gerencserjani/betti-coaching/compare/v1.22.1...v1.22.2) (2026-09-17)

### Performance Improvements

- lazy-load booking flow and prevent image CLS (refs [#25](https://github.com/gerencserjani/betti-coaching/issues/25)) ([ee1cfb8](https://github.com/gerencserjani/betti-coaching/commit/ee1cfb8897d8fa245b46297751b4e70583b53869))

## [1.22.1](https://github.com/gerencserjani/betti-coaching/compare/v1.22.0...v1.22.1) (2026-09-17)

### Bug Fixes

- add SPA rewrite so Vercel serves deep links like /admin/login ([0356150](https://github.com/gerencserjani/betti-coaching/commit/0356150be0aabde373c955a770b5673ea856f5f7))

# [1.22.0](https://github.com/gerencserjani/betti-coaching/compare/v1.21.1...v1.22.0) (2026-09-17)

### Bug Fixes

- add .npmrc with legacy-peer-deps so CI/Vercel installs cleanly ([fc49a71](https://github.com/gerencserjani/betti-coaching/commit/fc49a71572e2430d168d8cad969e560aa387c874))
- cap the service list height and fix long-title overflow ([9bab174](https://github.com/gerencserjani/betti-coaching/commit/9bab17461ca4e691ab00aa172ee62721142c9998))
- close audit findings across admin, booking, and API client ([9e4a6c3](https://github.com/gerencserjani/betti-coaching/commit/9e4a6c3b538474ebf4d98f5d62290a4fa3d311aa))
- enlarge admin sidebar logo so it renders legibly ([8d55a92](https://github.com/gerencserjani/betti-coaching/commit/8d55a9259307265f2294f55f9d532940253926b2))
- match browser autofill background to the site's own card color ([d8ada14](https://github.com/gerencserjani/betti-coaching/commit/d8ada14f14facefd4c1ea1cd631dd454ca6bdbfd))
- redirect bare /admin instead of rendering a blank page ([5030201](https://github.com/gerencserjani/betti-coaching/commit/50302016f174f965e44c570c48e40538de7f8ba2))
- refresh the slots cache after booking, cancelling, or rescheduling ([1085f0a](https://github.com/gerencserjani/betti-coaching/commit/1085f0a4260a270623236fab3572142931c57c72))
- replace free-text timezone field with a validated dropdown ([39955f2](https://github.com/gerencserjani/betti-coaching/commit/39955f23348b2ae7c4b715b9bc4b6cce793f7da7))
- switch service picker to a single-column list ([bf48ad5](https://github.com/gerencserjani/betti-coaching/commit/bf48ad56c729a523693e1c1387c62c21cd9bbd71))

### Features

- add editing for weekly availability and date overrides ([75deec3](https://github.com/gerencserjani/betti-coaching/commit/75deec39d96a499d105d6f4e04a9fd562b0cdff8))
- add Google Places autocomplete to the business address field ([90edd58](https://github.com/gerencserjani/betti-coaching/commit/90edd5816f2e5cb8e5647748bc2c367df662e4fe))
- add permanent delete for event types in the admin UI ([08f05c2](https://github.com/gerencserjani/betti-coaching/commit/08f05c2362966fe68478b330378d6a9b38690e9b))
- build booking calendar frontend and admin dashboard ([aed09e6](https://github.com/gerencserjani/betti-coaching/commit/aed09e68bfabb0d6a8130488527ab0a87209968f)), closes [#58](https://github.com/gerencserjani/betti-coaching/issues/58)
- handle backend outage gracefully in the booking flow ([6c28702](https://github.com/gerencserjani/betti-coaching/commit/6c287025a3859c6abaa0419377f13eb93165c2db))
- wire up real service price and display order ([277bf4b](https://github.com/gerencserjani/betti-coaching/commit/277bf4b8073cb0d36ff63d2278f34a96bf083508))

### Reverts

- remove derived price display from the booking UI ([f772f21](https://github.com/gerencserjani/betti-coaching/commit/f772f213d774b62cbaa9330e5bd4e5014c6d2edf))

## [1.21.1](https://github.com/gerencserjani/betti-coaching/compare/v1.21.0...v1.21.1) (2026-09-16)

### Bug Fixes

- clean up Contact section and add booking placeholder section ([8c244e9](https://github.com/gerencserjani/betti-coaching/commit/8c244e94d068fbf7fc761460e34b683f8036b62d))

# [1.21.0](https://github.com/gerencserjani/betti-coaching/compare/v1.20.1...v1.21.0) (2026-09-16)

### Features

- SEO basics -- meta tags, OG/Twitter cards, hreflang, sitemap (refs [#24](https://github.com/gerencserjani/betti-coaching/issues/24)) ([cf003c8](https://github.com/gerencserjani/betti-coaching/commit/cf003c8177f27d940fabe4a2ba4a87b386d0fb58))

## [1.20.1](https://github.com/gerencserjani/betti-coaching/compare/v1.20.0...v1.20.1) (2026-09-16)

### Bug Fixes

- accessibility pass -- landmarks, ARIA states, contrast, headings (refs [#23](https://github.com/gerencserjani/betti-coaching/issues/23)) ([be0998b](https://github.com/gerencserjani/betti-coaching/commit/be0998b755fe661ba7e181ff8af117c27b96b05e)), closes [#7c5959](https://github.com/gerencserjani/betti-coaching/issues/7c5959) [#9e5a69](https://github.com/gerencserjani/betti-coaching/issues/9e5a69)

# [1.20.0](https://github.com/gerencserjani/betti-coaching/compare/v1.19.0...v1.20.0) (2026-09-16)

### Features

- extract SVG icons into reusable typed components (refs [#22](https://github.com/gerencserjani/betti-coaching/issues/22)) ([b5acdb0](https://github.com/gerencserjani/betti-coaching/commit/b5acdb05843745b1cbe9ac903a665f3fcdc3b2a3))

# [1.19.0](https://github.com/gerencserjani/betti-coaching/compare/v1.18.2...v1.19.0) (2026-09-15)

### Features

- add final hero/community art and real favicon, drop base64 (refs [#21](https://github.com/gerencserjani/betti-coaching/issues/21)) ([e044cb9](https://github.com/gerencserjani/betti-coaching/commit/e044cb9ba7dddeb02df5caffd6685c4a9067bd15))
- use the real brand logo mark in the header (refs [#21](https://github.com/gerencserjani/betti-coaching/issues/21)) ([9122429](https://github.com/gerencserjani/betti-coaching/commit/9122429432807eb99ba131a973f218d2fba9f0c5))

## [1.18.2](https://github.com/gerencserjani/betti-coaching/compare/v1.18.1...v1.18.2) (2026-09-15)

### Bug Fixes

- centralize site name into shared content file (refs [#20](https://github.com/gerencserjani/betti-coaching/issues/20)) ([4e34031](https://github.com/gerencserjani/betti-coaching/commit/4e3403135e0f1070596203b474349136f230bc4d))

## [1.18.1](https://github.com/gerencserjani/betti-coaching/compare/v1.18.0...v1.18.1) (2026-09-15)

### Bug Fixes

- switch header desktop nav to xl breakpoint to prevent overflow (refs [#16](https://github.com/gerencserjani/betti-coaching/issues/16)) ([493de13](https://github.com/gerencserjani/betti-coaching/commit/493de134bcdf026e831af815a1e7981202c55a12))

# [1.18.0](https://github.com/gerencserjani/betti-coaching/compare/v1.17.1...v1.18.0) (2026-09-15)

### Features

- add footer component with dynamic copyright year (refs [#15](https://github.com/gerencserjani/betti-coaching/issues/15)) ([9d3e3a5](https://github.com/gerencserjani/betti-coaching/commit/9d3e3a59fd5a7e08131ecfff6f530b7fef8a391a))

## [1.17.1](https://github.com/gerencserjani/betti-coaching/compare/v1.17.0...v1.17.1) (2026-09-15)

### Bug Fixes

- enable smooth scrolling for anchor navigation ([07e9f64](https://github.com/gerencserjani/betti-coaching/commit/07e9f64b9fb7ef6c1fa5e9bc0ef998e21001e536)), closes [#anchor](https://github.com/gerencserjani/betti-coaching/issues/anchor)

# [1.17.0](https://github.com/gerencserjani/betti-coaching/compare/v1.16.0...v1.17.0) (2026-09-15)

### Features

- build Contact section component ([b0fdae7](https://github.com/gerencserjani/betti-coaching/commit/b0fdae7aaecb13f266554e11f4978e5f55c6a19e)), closes [#14](https://github.com/gerencserjani/betti-coaching/issues/14)

# [1.16.0](https://github.com/gerencserjani/betti-coaching/compare/v1.15.2...v1.16.0) (2026-09-15)

### Features

- build Pricing section component ([aace299](https://github.com/gerencserjani/betti-coaching/commit/aace299599d8b17f37c74ae8cfa73ba800bc5c88)), closes [#17](https://github.com/gerencserjani/betti-coaching/issues/17) [#13](https://github.com/gerencserjani/betti-coaching/issues/13)

## [1.15.2](https://github.com/gerencserjani/betti-coaching/compare/v1.15.1...v1.15.2) (2026-09-15)

### Bug Fixes

- replace scroll-spy IntersectionObserver with position-based check ([37415f4](https://github.com/gerencserjani/betti-coaching/commit/37415f4ec08b3cfe5556086770c2ad36813bd1e5))

## [1.15.1](https://github.com/gerencserjani/betti-coaching/compare/v1.15.0...v1.15.1) (2026-09-15)

### Bug Fixes

- localize the document title ([ce8b641](https://github.com/gerencserjani/betti-coaching/commit/ce8b641cf774b8ea2d2fbb16f808ed2a35d08dd6))

# [1.15.0](https://github.com/gerencserjani/betti-coaching/compare/v1.14.0...v1.15.0) (2026-09-15)

### Features

- build Community section component ([a7c95ce](https://github.com/gerencserjani/betti-coaching/commit/a7c95ce7e70db9c93343b49997c57897f74938a5)), closes [#kapcsolat](https://github.com/gerencserjani/betti-coaching/issues/kapcsolat) [#12](https://github.com/gerencserjani/betti-coaching/issues/12)

# [1.14.0](https://github.com/gerencserjani/betti-coaching/compare/v1.13.0...v1.14.0) (2026-09-15)

### Features

- build Services section component ([df0ad97](https://github.com/gerencserjani/betti-coaching/commit/df0ad9728dd741e82c57c141c4345b453fae5ba8)), closes [#11](https://github.com/gerencserjani/betti-coaching/issues/11)

# [1.13.0](https://github.com/gerencserjani/betti-coaching/compare/v1.12.1...v1.13.0) (2026-09-15)

### Features

- build Quote block component ([149b700](https://github.com/gerencserjani/betti-coaching/commit/149b700b53795634b6131a4b88503ab1dfac6067)), closes [#8](https://github.com/gerencserjani/betti-coaching/issues/8) [#10](https://github.com/gerencserjani/betti-coaching/issues/10)

## [1.12.1](https://github.com/gerencserjani/betti-coaching/compare/v1.12.0...v1.12.1) (2026-09-15)

### Bug Fixes

- apply background/text color and remaining base styles to body ([98f7ee9](https://github.com/gerencserjani/betti-coaching/commit/98f7ee9f66f3f943211815cabc13e26258a817e0)), closes [#9](https://github.com/gerencserjani/betti-coaching/issues/9) [2/#3](https://github.com/gerencserjani/betti-coaching/issues/3)

# [1.12.0](https://github.com/gerencserjani/betti-coaching/compare/v1.11.0...v1.12.0) (2026-09-15)

### Features

- build Hero section component ([95c03a5](https://github.com/gerencserjani/betti-coaching/commit/95c03a5c44f2f65367ccc9da7c9bfd68901d40a1)), closes [#5](https://github.com/gerencserjani/betti-coaching/issues/5) [#21](https://github.com/gerencserjani/betti-coaching/issues/21) [#9](https://github.com/gerencserjani/betti-coaching/issues/9)

# [1.11.0](https://github.com/gerencserjani/betti-coaching/compare/v1.10.0...v1.11.0) (2026-09-15)

### Features

- add scroll-spy to highlight the active nav link ([12061f3](https://github.com/gerencserjani/betti-coaching/commit/12061f33a8f49b82ebbe6ff84d3910695e702978)), closes [#7](https://github.com/gerencserjani/betti-coaching/issues/7)

# [1.10.0](https://github.com/gerencserjani/betti-coaching/compare/v1.9.0...v1.10.0) (2026-09-15)

### Features

- add scroll-reveal-on-scroll animation hook ([dcd36ee](https://github.com/gerencserjani/betti-coaching/commit/dcd36ee0c5be7d06a9e03841fe7f42edcc01399f)), closes [#8](https://github.com/gerencserjani/betti-coaching/issues/8)

# [1.9.0](https://github.com/gerencserjani/betti-coaching/compare/v1.8.0...v1.9.0) (2026-09-15)

### Features

- build Header/Nav component ([bc192c4](https://github.com/gerencserjani/betti-coaching/commit/bc192c4add96b8c5172c3ed9f2985800cff89f15)), closes [#7](https://github.com/gerencserjani/betti-coaching/issues/7) [#6](https://github.com/gerencserjani/betti-coaching/issues/6)

# [1.8.0](https://github.com/gerencserjani/betti-coaching/compare/v1.7.0...v1.8.0) (2026-09-15)

### Features

- set up i18n infrastructure (HU/EN) with language switcher ([3d15100](https://github.com/gerencserjani/betti-coaching/commit/3d151005ad37191fa80ac9be67e7f20a5f536d19)), closes [#6](https://github.com/gerencserjani/betti-coaching/issues/6) [#28](https://github.com/gerencserjani/betti-coaching/issues/28)

# [1.7.0](https://github.com/gerencserjani/betti-coaching/compare/v1.6.0...v1.7.0) (2026-09-15)

### Features

- add layout primitives and custom Tailwind breakpoints ([3d12762](https://github.com/gerencserjani/betti-coaching/commit/3d12762fda41261322e28ab2da4a2ff8d4104a70)), closes [#5](https://github.com/gerencserjani/betti-coaching/issues/5)

# [1.6.0](https://github.com/gerencserjani/betti-coaching/compare/v1.5.0...v1.6.0) (2026-09-15)

### Features

- implement light/dark theme system with toggle and persistence ([5ed4c30](https://github.com/gerencserjani/betti-coaching/commit/5ed4c30449a2bfb387549a1b62c9aca49fd2dd0e)), closes [#4](https://github.com/gerencserjani/betti-coaching/issues/4)

# [1.5.0](https://github.com/gerencserjani/betti-coaching/compare/v1.4.0...v1.5.0) (2026-09-15)

### Features

- add Google Fonts (Fraunces & Work Sans) and base typography ([d6fdd9b](https://github.com/gerencserjani/betti-coaching/commit/d6fdd9b11d60dc4c68a410dcbebfd364768b9ee1)), closes [#3](https://github.com/gerencserjani/betti-coaching/issues/3)

# [1.4.0](https://github.com/gerencserjani/betti-coaching/compare/v1.3.0...v1.4.0) (2026-09-15)

### Features

- add Tailwind design tokens for light & dark theme ([7757f30](https://github.com/gerencserjani/betti-coaching/commit/7757f30f89f65e650eaf96dc99aadc539caade63)), closes [#2](https://github.com/gerencserjani/betti-coaching/issues/2)

# [1.3.0](https://github.com/gerencserjani/betti-coaching/compare/v1.2.0...v1.3.0) (2026-09-15)

### Features

- **claude:** sync issue status on the project board from start/end-issue ([a976fd9](https://github.com/gerencserjani/betti-coaching/commit/a976fd910a6b1b546bef1bfd2bf90336beab0f25))

# [1.2.0](https://github.com/gerencserjani/betti-coaching/compare/v1.1.0...v1.2.0) (2026-09-15)

### Features

- **claude:** add test-issue skill and wire it into end-issue ([6000f5f](https://github.com/gerencserjani/betti-coaching/commit/6000f5fba5255c5fb6e612c1e407c13f1e8592ed))

# [1.1.0](https://github.com/gerencserjani/betti-coaching/compare/v1.0.1...v1.1.0) (2026-09-14)

### Features

- **claude:** add /start-issue and /end-issue slash commands ([57d9123](https://github.com/gerencserjani/betti-coaching/commit/57d91236696d4905b8e970b45c9455c04c7c015b))

## [1.0.1](https://github.com/gerencserjani/betti-coaching/compare/v1.0.0...v1.0.1) (2026-09-14)

### Bug Fixes

- add npm plugin to bump package.json version on release ([261ce39](https://github.com/gerencserjani/betti-coaching/commit/261ce3920205d30cebe37842862f3d7fa477d0a9))

# 1.0.0 (2026-09-14)

### Bug Fixes

- bump node version to 22 for semantic-release compatibility ([bbde1c2](https://github.com/gerencserjani/betti-coaching/commit/bbde1c27915ef3830147dc80632cd5d198eb2ef1))
