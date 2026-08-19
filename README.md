# Parallax

A philosophy, politics, and economics publication.

Parallax is the apparent shift in an object when you view it from a different position. Nothing about the object changes; what changes is where you stand. This site treats that as a method: every article is read through one, two, or all three lenses, and its colour is the mix of those lenses.

Stage 1 is complete. The site runs from a typed sample array with no database and no login.

## Running it

```bash
npm run dev
```

Then open http://localhost:3000.

Other scripts:

```bash
npm run build
```

```bash
npm run lint
```

## How it is put together

| Area | Choice |
| --- | --- |
| Framework | Next.js 16, App Router, React 19, TypeScript |
| Styling | Tailwind CSS 4 over a custom token layer |
| Fonts | Newsreader (headlines), Source Serif 4 (body), Archivo Narrow (labels) |
| Content | Tiptap document JSON, currently from a sample array |

Every page is statically generated. The only client-side JavaScript on the front page is the map's caption and keyboard handling.

## The colour system

`src/lib/lenses.ts` is the single source of truth. Everything visual derives from it, and it is the first file to read.

The three lenses behave as subtractive primaries. Philosophy is yellow, politics is red, economics is blue, and the four overlaps are their mixes:

| Region | Colour |
| --- | --- |
| Philosophy | ochre |
| Politics | brick |
| Philosophy + Politics | russet |
| Economics | ink blue |
| Philosophy + Economics | moss |
| Politics + Economics | aubergine |
| All three | umber |

The seven values were generated in OKLCH at near-constant lightness (L\* 40.7 to 50.6) with tightly banded chroma. That is the whole trick: because they share a lightness they read as one family of printer's spot inks rather than as a rainbow, and none of them shouts. Their hues also run monotonically around the colour wheel, so each mixed region genuinely sits between its two parents.

Every fill clears 3:1 against paper, the WCAG bar for graphical objects. Only philosophy sits below 4.5:1, because a yellow cannot be dark enough to pass as small text and still read as yellow. The site works around this by never setting text in a lens colour: colour appears as a square, and the words beside it are always ink.

If you change a hex, re-check the lightness band and the contrast ratio.

## The map

`src/components/map/venn-geometry.ts` and `VennMap.tsx`.

Three equal circles sit on the vertices of an equilateral triangle whose side equals their radius, which is the spacing that guarantees all three pairwise overlaps and the central triple region exist and are big enough to use. A square grid is laid over them and each cell takes the region containing its centre, which is where the pixelated edge comes from.

The radius is calibrated so the union holds 234 cells: deliberately sparse at launch, comfortably full after a year of weekly publishing. Each published article claims one square, filling outward from its region's centre of mass in publication order, so placement is deterministic and an article never moves once placed. Unclaimed squares sit at a 22% tint so the shape stays readable when little has been published.

Behaviour worth preserving:

- The SVG renders on the server and every article is a real anchor, so the map works with JavaScript disabled.
- Hovering or focusing a square writes its headline into a fixed-height caption below. Nothing floats, moves, or fades.
- Without script every square is tabbable. With script, a roving tab index puts the map at one tab stop and the arrow keys walk it.
- Focus is tracked with a native `focusin` listener rather than React's `onFocus`, because Chrome makes an SVG anchor the activeElement without dispatching a focus event for it.

When the archive outgrows the grid the component switches to density mode, where one square stands for several articles. Only the one-to-one mode is implemented.

## Layout rules

- Rules divide content, never cards. No shadows, no four-sided borders, no rounded corners beyond 2px.
- Hierarchy comes from type size and rule weight alone.
- The front page is one lead story, a column of two beside it, then a river. Deliberately not an even row of three.
- No pure white and no pure black anywhere.
- Light only. The site is printed on paper, not lit from behind.

## Before this goes live

- Fill in every bracketed placeholder in `src/app/terms/page.tsx` and `src/app/privacy/page.tsx`, and have both reviewed by someone qualified. Google requires working links to them on the OAuth consent screen in Stage 2.
- Replace `submissionFormUrl` in `src/lib/site.ts` with the real Google Form.
- Replace or delete every placeholder editor in `src/content/authors.ts`.
- Set `url` in `src/lib/site.ts` to the real domain.

## Layout of the source

```
src/
  app/                     routes
  components/
    map/                   venn-geometry.ts, VennMap.tsx, VennMapCanvas.tsx
    ArticleBody.tsx        renders Tiptap JSON
    ArticleCard.tsx        lead / secondary / river variants
    FrontPage.tsx          the newspaper grid
  content/                 sample articles and authors, deleted in Stage 2
  lib/
    lenses.ts              the colour system
    content.ts             content types and authoring helpers
  styles/tokens.css        design tokens
```

`src/content/sample-articles.ts` exports `getPublishedArticles`, `getArticleBySlug`, and `getArticlesByAuthor`. Those three functions are the seam with Stage 2: they move to `src/lib/queries/` with identical signatures, and no component that calls them changes.

## What comes next

Stage 2 adds Neon Postgres, Prisma, and Better Auth with Google sign-in and reader/editor/admin roles. Stage 3 adds the Tiptap editing studio. Stage 4 adds comments, likes, and editor profiles. Stage 5 is SEO, feeds, and the newsletter. Stage 6 is monetisation.
