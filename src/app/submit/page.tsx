import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Submit an article",
  description:
    "Parallax accepts guest articles that read a subject through more than one of philosophy, politics, and economics.",
};

export default function SubmitPage() {
  return (
    <div className="mx-auto w-full max-w-(--page) px-5 py-10">
      <header className="border-ink mx-auto max-w-(--measure) border-b-2 pb-6 text-center">
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">Write for Parallax</h1>
        <p className="text-ink-muted mt-4 text-xl leading-relaxed">
          We publish guest articles. There is no requirement that you be an academic, and no
          requirement that you have been published before.
        </p>
      </header>

      <div className="mx-auto mt-10 max-w-(--measure)">
        <h2 className="text-2xl">What we are looking for</h2>
        <p className="mt-6">
          One argument, made properly. A Parallax piece takes a subject that is usually handled by a
          single discipline and shows what the other lenses reveal about it. The best submissions
          have a claim you could disagree with, and they defend it.
        </p>

        <ul className="marker:text-ink-faint mt-6 list-disc space-y-2 pl-6">
          <li>Between 900 and 2,000 words for most pieces.</li>
          <li>A clear claim in the first two paragraphs, not the last.</li>
          <li>Sources linked inline wherever a factual claim carries weight.</li>
          <li>Written for an intelligent reader who is not a specialist in your field.</li>
          <li>Original and unpublished, including on personal blogs and newsletters.</li>
        </ul>

        <h2 className="mt-12 text-2xl">What we tend to decline</h2>
        <ul className="marker:text-ink-faint mt-6 list-disc space-y-2 pl-6">
          <li>Summaries of an existing debate with no position of your own.</li>
          <li>Pieces that use one lens and mention the other two in passing.</li>
          <li>Anything written primarily to promote a product, service, or campaign.</li>
        </ul>

        <h2 className="mt-12 text-2xl">How it works</h2>
        <p className="mt-6">
          Submissions go through the form below. An editor reads every submission. If we want to run
          your piece we will come back with edits, and nothing is published without your agreement
          on the final text. You keep copyright in your work and may republish it elsewhere after
          two weeks with an acknowledgement of first publication here.
        </p>
        <p className="mt-6">
          We are a new publication and we do not pay for contributions yet. We are explicit about
          that rather than quiet about it. Contributors get a full profile page with links to their
          own work.
        </p>

        <div className="border-rule mt-10 border-t border-b py-8 text-center">
          <a
            href={site.submissionFormUrl}
            rel="noopener"
            className="label bg-ink text-paper inline-block px-6 py-3 underline-offset-4 hover:underline"
          >
            Open the submission form
          </a>
          <p className="label text-ink-faint mt-4">Expect a reply within two weeks</p>
        </div>
      </div>
    </div>
  );
}
