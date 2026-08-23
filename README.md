# The Parallaxer

A philosophy, politics, and economics publication.

A parallax is the apparent shift in an object when you view it from a different position. Nothing about the object changes; what changes is where you stand. This site treats that as a method: every article is read through one, two, or all three lenses, and its colour is the mix of those lenses.

Stage 1 is complete. Stage 2 is scaffolded: the schema, authentication, access guards, and query layer exist, but nothing is connected to a live database yet. The public site still renders from the typed sample array.

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

## Covers

Every article has a cover. Uploaded images take precedence; when there is none, `src/components/CoverArt.tsx` draws one deterministically from the slug, in tints of the article's own lens colour. Stock photography was rejected deliberately: it is generic, needs licensing, and carries none of the colour information the rest of the site runs on. A generated cover states the article's region before a word is read, and the same slug always produces the same picture.

## The masthead

`src/lib/editorial.ts` is the source of truth. A title is a rank plus a beat, and the seven beats are the seven regions of the map.

- **Founding Editor**, no beat.
- **Senior [beat] Editor**, one per beat, appointed by the publication.
- **Junior [beat] Editor**, applied for.
- **Guest Article**, for contributors who have not joined the masthead.

A contributor's first two accepted pieces run as guest articles. After the second they may apply for a junior editorship. `MIN_ARTICLES_FOR_JUNIOR` sets that threshold in one place, and the terms page and submission page both read it, so changing the number changes the site and the contract together.

Rank is separate from permission. `role` (reader, editor, admin) decides what an account may do; the title is the position printed under a byline. A guest contributor has reader permissions, a byline, and a profile.

## Stage 2: database and accounts

Scaffolded but not yet connected. Nothing on the public site reads from the database.

- `prisma/schema.prisma` covers users, sessions, articles, revisions, comments, and likes. The four auth tables are Better Auth's required shape and their fields must not be renamed.
- `src/lib/auth.ts` configures email/password and Google. Google only appears when credentials exist, so the site runs without them.
- `src/lib/auth-guards.ts` holds every access check. Guards re-read the session server side on each call and never trust a client-supplied role.
- `src/proxy.ts` bounces signed-out visitors away from `/studio` and `/admin`. It only checks that a session cookie exists and is **not** the access check; the guards are.
- `src/lib/queries/` mirrors the Stage 1 function names, so migrating a page is a change of import.

To bring it up:

```bash
cp .env.example .env
```

Fill in `DATABASE_URL` from Neon and generate `BETTER_AUTH_SECRET`, then:

```bash
npx prisma migrate dev --name init
```

The first account created with the `ADMIN_EMAIL` address becomes admin and founding editor. Everyone else signs up as a reader.

Still to build in Stage 2: switching the public pages from `src/content/` to `src/lib/queries/`.

Accounts are email and password only. Google sign-in is written but held behind `ENABLE_GOOGLE` in `src/lib/auth.ts`, so it cannot appear before it is wanted. Signing up requires confirming the address; a nickname is chosen at sign-up and is fixed afterwards.

## Stage 3: the editorial studio

Also scaffolded, also unrun against a live database.

- `/studio` lists what you may work on and shows how full each region of the map is.
- `/studio/write/[id]` is the writing surface: Tiptap with a deliberately narrow feature set, autosaving on a debounce, with the lens selector previewing the colour the article will take.
- `/studio/preview/[id]` renders a draft through the real article template rather than an approximation.
- `/admin` sets roles and masthead titles.

Two rules worth keeping. Every server action re-checks the session and ownership, because a server action is a public endpoint regardless of which page renders the form that calls it. And article bodies are rebuilt from scratch by `src/lib/tiptap-doc.ts` before being stored, rather than trusted: an unrecognised node is dropped, and a link whose href is not plainly http, mailto, or an internal path loses its link.

## Stage 4: the reader layer

Comments, likes, and profiles. Also unrun against a live database.

- Threads are one level deep. A reply to a reply attaches to the top of the thread rather than being refused, so nobody hits a wall mid-conversation.
- Authors may edit their own comment for 15 minutes. The window is the point: without it somebody could soften a remark after five people had replied, and the thread would stop making sense.
- `editedAt` is stamped only by the author. `updatedAt` also moves when a moderator acts, and using it would mark moderated comments as edited by the person who wrote them.
- Reports are one row per person per comment, so reporting repeatedly cannot push something up the queue. Reported comments sort first.
- Suspensions are bans, not deletions: a suspended writer keeps their published articles and their bylines. One editor cannot suspend another; only an admin can.
- Any article can have its thread closed without hiding what is already there.
- Commenting needs a confirmed email address. That is the cheapest spam control there is: one click for a reader, a working inbox per account for a script.
- Rate limiting runs at two levels. Per account it is a `count` against the comments table, indexed on author and date. Per network address it is a salted one-way hash in a disposable counter, because per-account limits cannot see one machine registering fifty accounts. The address itself is never stored, and the privacy policy says so.
- Deletes are soft. A hard delete would take the replies with it and leave the thread unreadable.
- `/studio/moderation` lists hidden comments beside visible ones, because the common mistake is hiding the wrong one and the fix has to be one click away.
- Editor profiles carry a portrait and a personal lens map showing only that writer's work.
- Profile editing lives at `/account/profile`, not `/studio/profile` as originally planned. Guest contributors have a byline and a profile but only reader permissions, so the studio is closed to them; putting it under `/account` means everybody with a profile can maintain one.

Comments and likes load from `/api/articles/[slug]/engagement` after the article renders, rather than server-side. Same reason as the view beacon: like state and moderator controls are per reader, and rendering them on the server would make every article page dynamic for the sake of a section below the fold. Article pages stay `SSG`.

Portraits live in `public/editors`, named after the profile slug; see the README there. An editor without one gets a placeholder built from their initials and their beat colour.

## The data seam

`src/lib/data.ts` is the only place the site asks where articles come from. When `DATABASE_URL` is set the Prisma queries run; otherwise the Stage 1 sample content stands in. Every function is async either way, so no page changes when the database arrives, and the project still clones and runs with no database at all.

Delete the sample branch once the archive is real.

## Stage 5: growth

- **SEO.** `robots.ts` and a `sitemap.ts` generated from the archive, canonical URLs on every page, and Organization, WebSite, Article, and Person JSON-LD built from the same records the page renders, so the two cannot drift.
- **Share images.** Generated per article by `opengraph-image.tsx` on the article's own lens colour, with the headline in Newsreader and the pixel motif along the foot. Typographic rather than photographic, because the publication has no photography and a stock image would say nothing true about the piece. Every square in the ramp stays lighter than the ground; one at full strength is the background colour and vanishes.
- **Feeds.** RSS and Atom for the whole archive, plus one RSS feed per lens including its overlaps. Hand-written, because a feed is a few hundred bytes of well-specified XML and a library would be larger than the code. Standfirsts only: a feed that reprints the article gives nobody a reason to arrive.
- **Search.** Postgres full text search over headlines, standfirsts, kickers, and bylines, ranked by relevance then recency. `plainto_tsquery` treats input as words, so a stray colon cannot error or inject. Against sample content it falls back to a substring match. The form is a plain GET, so a search is a shareable URL and needs no JavaScript.
- **Newsletter.** Sending the weekly digest is `POST /api/newsletter/send`, protected by `CRON_SECRET` and meant for a scheduler. Add `?dry=1` to compose an issue and read it back without sending. Each issue covers everything published since the last one went out, so a missed week folds into the next rather than being lost; a quiet week sends nothing at all. Every copy is individually addressed so it can carry its own unsubscribe link and no subscriber ever sees another's address, and each carries `List-Unsubscribe`, which is what keeps people using their mail client's unsubscribe button instead of the spam button. Plain text, no HTML, because an HTML email is where tracking pixels live. Double opt-in: a row exists on submit, but nothing is sent until the address is confirmed from the inbox. That stops anybody being subscribed by a stranger and protects the sending domain's reputation, which decides whether the weekly email arrives at all. One-click unsubscribe, no sign-in.
- **Reading experience.** A progress bar driven entirely by CSS `animation-timeline: scroll()`, so it costs no JavaScript, guarded by `@supports` so unsupporting browsers get nothing rather than a bar stuck at full width. Related articles by shared lens region, and more from the same writer.
- **Analytics.** Vercel Analytics and Speed Insights, both aggregate and cookieless, which is what lets the privacy policy keep saying we run no analytics identifying anyone individually.

One note on the performance budget. The plan asks for no client JavaScript on the article route beyond the like button and comments island, and also for a subscribe form after the article body. Those conflict. The article route now carries three small islands: the view beacon, the newsletter form, and the engagement section. Reading progress adds none.

## Measuring what readers do

Views are counted from the browser by `ViewBeacon`, not during the server render. That is the whole reason the article pages are still static: incrementing a counter while rendering would make every one of them dynamic.

`ArticleViewDay` stores an article id, a date, and a count. No IP address, no user agent, no user id. That keeps the promise made in the privacy policy, and it means a year of traffic is a handful of tiny rows rather than a log to manage. Comment and like totals come from the same database, so the studio shows reach and engagement without a third-party analytics account.

## Before this goes live

- Have the terms and privacy pages reviewed by someone qualified. They are written by a non-lawyer.
- Both need a postal address before Stage 6 adds advertising, because Irish e-commerce rules require one of a commercial service.
- Replace or delete every placeholder editor in `src/content/authors.ts`.
- Point the domain at the deployment and set `BETTER_AUTH_URL` to it.

## Layout of the source

```
src/
  app/                     routes, including /sign-in and the auth handler
  components/
    map/                   venn-geometry.ts, VennMap.tsx, VennMapCanvas.tsx
    ArticleBody.tsx        renders Tiptap JSON
    ArticleCard.tsx        lead / secondary / river variants
    CoverArt.tsx           generated covers
    FrontPage.tsx          the newspaper grid
  content/                 sample articles and authors, deleted once Stage 2 lands
  lib/
    lenses.ts              the colour system
    editorial.ts           the masthead taxonomy
    content.ts             content types and authoring helpers
    auth.ts, auth-guards.ts, db.ts
    queries/               database reads
  styles/tokens.css        design tokens
prisma/schema.prisma
```

## What comes next

Stage 3 adds the Tiptap editing studio. Stage 4 adds comments, likes, and full editor profiles. Stage 5 is SEO, feeds, and the newsletter. Stage 6 is monetisation, which is also when the legal pages need revisiting.

## Seeding

An empty database makes the map, the lens pages and search look broken rather than new. To fill one with the Stage 1 sample archive:

```bash
npm run seed
```

Ten articles across all seven regions, with map squares handed out in publication order exactly as the studio would have. It refuses to run against a database that already holds articles, so it cannot quietly duplicate a real archive; `--force` overrides that.

Everything it writes is placeholder, including four invented editors on `@example.invalid` addresses that can never receive mail. Remove them before the site is public.

## Deploying

`src/generated` is gitignored, because generated code does not belong in version control. Prisma 7 with a custom output path does **not** generate on install by itself, so a fresh checkout has no client until something runs `prisma generate`. Both `postinstall` and `build` run it:

```bash
npm run build
```

Remove either one and a clean deploy fails with `Can't resolve '@/generated/prisma/client'`.

The build also applies migrations, but only when `DATABASE_URL` is set. Running without a database is a legitimate state, so `scripts/migrate.mjs` skips out quietly rather than failing the build. It uses `migrate deploy`, which applies existing migrations and never generates, prompts, or resets, which is what should be pointed at a production database. If migrations fail the deploy stops, rather than starting the app against a database whose shape does not match the code.

Environment variables a deployment needs:

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | For real content | Without it the site serves the sample archive and the newsletter refuses politely. |
| `BETTER_AUTH_SECRET` | Yes in production | The app throws on first request without it rather than signing with a known key. |
| `BETTER_AUTH_URL` | Yes in production | Must be the deployed origin. Left unset it defaults to localhost and sign-in breaks. |
| `ADMIN_EMAIL` | Once | The first account created with this address becomes admin and founding editor. |
| `RESEND_API_KEY`, `MAIL_FROM` | For email | Without them verification and newsletter mail is written to the server log instead of sent. |

`@vercel/analytics` and `@vercel/speed-insights` only report on Vercel. On any other host they load and do nothing, so drop them if the site is not going there.

## Known advisory

`npm audit` reports a high-severity issue in `deepmerge-ts`, reached through the Prisma CLI's config loader. It is a build-time dependency, is not shipped to the browser or the server bundle, and is only fed our own `prisma.config.ts`. The offered fix downgrades Prisma to 6, a major version back, so it has been left alone deliberately.
