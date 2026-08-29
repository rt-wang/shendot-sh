# shen.sh

Static first pass for a personal portfolio/catalog site inspired by an album shelf rather than a conventional resume.

## Editing Content

Most visible content lives in `script.js`:

- `coverMap` points to the square cover assets in `assets/covers/`.
- `categories` controls the genre/filter buttons.
- `workItems` controls the album sleeves, detail backs, tags, and links.

Replace the internal `href` values with the real GitHub, music, video, article, and social URLs when they are ready.

## Articles

For a static HTML version, add article links as `workItems` with `category: "articles"`.

When you want markdown-backed writing, the clean upgrade path is Astro or Eleventy with files under `content/articles/*.md`. That would keep the current design while letting each markdown file become a real article page.

## Video

The card renderer already supports local video if an item has `videoSrc`, for example:

```js
{
  title: "Short Film",
  category: "video",
  cover: "assets/covers/video.jpg",
  videoSrc: "media/videos/short-film.webm"
}
```

Use WebM plus MP4 fallbacks for self-hosting. If the archive grows or bandwidth becomes expensive, move the files to a video service and keep the same card data shape.

## Assets

The current cover images are generated placeholders:

- `assets/covers/developer-work.jpg`
- `assets/covers/music.jpg`
- `assets/covers/video.jpg`
- `assets/covers/articles.jpg`
- `assets/covers/notes.jpg`

Swap them with real album art, repo screenshots, still frames, article art, or social graphics whenever those exist.
