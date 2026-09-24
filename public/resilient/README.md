# public/resilient/ (served)

Static assets for **Resilient Roots**, served at `/resilient/...` on
ssi.ctac.app.

**Source → served rule.** `Resilient Roots/Videos/`, `Resilient Roots/Activities/`,
`Resilient Roots/Design System Assets/` (and the design-system export),
and `Resilient Roots/Measures/` are **source** folders; nothing in them is
served. Claude Code copies what ships into this folder and commits it. An asset
only deploys once it is copied here and committed.

No videos live here: all Resilient Roots video is hosted on Vimeo and embedded
by ID (see `Resilient Roots/Videos/VIDEO_LIBRARY.md`).

Static assets are cached, so an asset swapped in place needs a rename or a
`?v=` bump to show up.

- `logo.jpg` — the tree-of-life mark, resized to 800px from
  `Resilient Roots/Design System Export/assets/logo.jpg`. Raster with a baked-in
  cream background: cream or white surfaces only until Holly supplies a
  transparent version.
