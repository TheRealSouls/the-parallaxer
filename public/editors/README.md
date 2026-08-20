# Editor portraits

Drop portraits here, named after the editor's profile slug:

    public/editors/matas-roda.jpg
    public/editors/j-hale.jpg

Then set `image: "/editors/matas-roda.jpg"` on that editor's record in
`src/content/authors.ts`. From Stage 2 onward the same path goes in the
`image` column on the `User` row instead.

Guidelines:

- Square, at least 600 x 600. They are displayed as squares to match the
  pixel motif, and a non-square image will be cropped to the centre.
- JPEG for photographs, PNG only if the portrait genuinely needs transparency.
- Keep them under about 300 KB. `next/image` resizes on delivery, but the
  original is what sits in the repository.

An editor with no portrait gets a placeholder built from their initials and
their beat colour, so the masthead never has a hole in it.
