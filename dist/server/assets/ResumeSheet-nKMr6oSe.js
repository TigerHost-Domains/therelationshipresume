import { jsxs, jsx } from "react/jsx-runtime";
import { BadgeCheck, MapPin, Mail, Heart, X } from "lucide-react";
import { q as SEXES, P as PROVIDER_LABELS } from "./mfa-DWEh_Kis.js";
import { A as ACCENTS } from "./resume-CLkl9H33.js";
function Section({ title, children }) {
  return /* @__PURE__ */ jsxs("section", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxs("h3", { className: "label flex items-center gap-3 text-[var(--accent)]", children: [
      title,
      /* @__PURE__ */ jsx("span", { className: "h-px flex-1 bg-[var(--accent)]/25" })
    ] }),
    children
  ] });
}
function Bullets({ items, marker }) {
  return /* @__PURE__ */ jsx("ul", { className: "space-y-1.5", children: items.map((item, i) => /* @__PURE__ */ jsxs("li", { className: "flex gap-2.5 text-[0.95rem] leading-snug", children: [
    /* @__PURE__ */ jsx("span", { className: "mt-[0.2rem] shrink-0 text-[var(--accent)]", children: marker }),
    /* @__PURE__ */ jsx("span", { children: item })
  ] }, i)) });
}
function Placeholder({ children }) {
  return /* @__PURE__ */ jsx("p", { className: "text-sm italic text-ink-soft/60", children });
}
function ResumeSheet({
  resume,
  compact = false
}) {
  const accent = ACCENTS[resume.accent]?.color ?? ACCENTS.rose.color;
  const meta = [resume.age && `${resume.age} years`, resume.sex && SEXES[resume.sex], resume.location].filter(Boolean);
  return /* @__PURE__ */ jsxs(
    "article",
    {
      style: { "--accent": accent },
      className: `sheet @container relative overflow-hidden rounded-sm ${compact ? "p-7 sm:p-9" : "p-8 sm:p-12 lg:p-14 xl:p-16"}`,
      children: [
        /* @__PURE__ */ jsx("div", { className: "absolute inset-x-0 top-0 h-1.5 bg-[var(--accent)]" }),
        /* @__PURE__ */ jsxs("header", { className: "border-b border-ink/10 pb-7", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
            /* @__PURE__ */ jsx("p", { className: "label text-ink-soft", children: "Relationship Resume" }),
            resume.verifiedVia ? /* @__PURE__ */ jsxs(
              "p",
              {
                className: "label inline-flex items-center gap-1 text-[var(--accent)]",
                title: "Name from their sign-in account; age and sex sworn under our truthful identity policy.",
                children: [
                  /* @__PURE__ */ jsx(BadgeCheck, { className: "size-3.5" }),
                  " ID Checked · ",
                  PROVIDER_LABELS[resume.verifiedVia]
                ]
              }
            ) : null
          ] }),
          /* @__PURE__ */ jsx(
            "h1",
            {
              className: `mt-3 font-display font-semibold leading-[0.95] tracking-tight ${compact ? "text-4xl @3xl:text-5xl" : "text-5xl sm:text-6xl xl:text-7xl"}`,
              children: resume.name || /* @__PURE__ */ jsx("span", { className: "text-ink/25", children: "Your Name" })
            }
          ),
          resume.headline ? /* @__PURE__ */ jsx("p", { className: "mt-3 max-w-[40rem] font-display text-lg italic leading-snug text-ink-soft sm:text-xl", children: resume.headline }) : null,
          meta.length > 0 || resume.contact ? /* @__PURE__ */ jsxs("div", { className: "mt-5 flex flex-wrap gap-x-5 gap-y-2 font-mono text-xs text-ink-soft", children: [
            meta.length > 0 ? /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsx(MapPin, { className: "size-3.5 text-[var(--accent)]" }),
              meta.join(" · ")
            ] }) : null,
            resume.contact ? /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 break-all", children: [
              /* @__PURE__ */ jsx(Mail, { className: "size-3.5 text-[var(--accent)]" }),
              resume.contact
            ] }) : null
          ] }) : null
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-10 pt-8 @2xl:grid-cols-[1.55fr_1fr] @4xl:gap-14", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-9", children: [
            /* @__PURE__ */ jsx(Section, { title: "Objective", children: resume.objective ? /* @__PURE__ */ jsx("p", { className: "max-w-[38rem] font-display text-[1.1rem] leading-[1.65]", children: resume.objective }) : /* @__PURE__ */ jsx(Placeholder, { children: "What are you hoping to find?" }) }),
            resume.lookingFor ? /* @__PURE__ */ jsx(Section, { title: "Ideal Candidate", children: /* @__PURE__ */ jsx("p", { className: "max-w-[38rem] leading-relaxed text-ink/85", children: resume.lookingFor }) }) : null,
            /* @__PURE__ */ jsx(Section, { title: "Relevant Experience", children: resume.experience.length > 0 ? /* @__PURE__ */ jsx("div", { className: "space-y-6", children: resume.experience.map((job, i) => /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-baseline justify-between gap-x-4", children: [
                /* @__PURE__ */ jsx("h4", { className: "font-display text-lg font-semibold", children: job.role }),
                job.years ? /* @__PURE__ */ jsx("span", { className: "font-mono text-xs tabular-nums text-ink-soft", children: job.years }) : null
              ] }),
              job.place ? /* @__PURE__ */ jsx("p", { className: "text-sm italic text-ink-soft", children: job.place }) : null,
              job.description ? /* @__PURE__ */ jsx("p", { className: "mt-1.5 text-[0.95rem] leading-relaxed text-ink/85", children: job.description }) : null
            ] }, i)) }) : /* @__PURE__ */ jsx(Placeholder, { children: "Past relationships, life lessons, the dog you raised…" }) }),
            resume.references.length > 0 ? /* @__PURE__ */ jsx(Section, { title: "References", children: /* @__PURE__ */ jsx("div", { className: "grid gap-x-6 gap-y-5 @lg:grid-cols-2", children: resume.references.map((ref, i) => /* @__PURE__ */ jsxs("figure", { className: "border-l-2 border-[var(--accent)]/40 pl-4", children: [
              /* @__PURE__ */ jsxs("blockquote", { className: "font-display text-[0.98rem] italic leading-snug", children: [
                "“",
                ref.quote,
                "”"
              ] }),
              /* @__PURE__ */ jsxs("figcaption", { className: "mt-2 text-sm", children: [
                /* @__PURE__ */ jsx("span", { className: "font-medium", children: ref.name }),
                ref.relation ? /* @__PURE__ */ jsxs("span", { className: "text-ink-soft", children: [
                  " — ",
                  ref.relation
                ] }) : null
              ] })
            ] }, i)) }) }) : null
          ] }),
          /* @__PURE__ */ jsxs("aside", { className: "space-y-8 @2xl:border-l @2xl:border-ink/10 @2xl:pl-8 @4xl:pl-12", children: [
            /* @__PURE__ */ jsx(Section, { title: "Core Qualities", children: resume.qualities.length > 0 ? /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1.5", children: resume.qualities.map((q, i) => /* @__PURE__ */ jsx(
              "span",
              {
                className: "rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/[0.06] px-3 py-1 text-sm",
                children: q
              },
              i
            )) }) : /* @__PURE__ */ jsx(Placeholder, { children: "Kind, curious, punctual…" }) }),
            /* @__PURE__ */ jsx(Section, { title: "Likes", children: resume.likes.length > 0 ? /* @__PURE__ */ jsx(Bullets, { items: resume.likes, marker: /* @__PURE__ */ jsx(Heart, { className: "size-3.5 fill-current" }) }) : /* @__PURE__ */ jsx(Placeholder, { children: "The things that light you up." }) }),
            /* @__PURE__ */ jsx(Section, { title: "Dislikes", children: resume.dislikes.length > 0 ? /* @__PURE__ */ jsx(Bullets, { items: resume.dislikes, marker: /* @__PURE__ */ jsx("span", { className: "font-mono text-xs", children: "—" }) }) : /* @__PURE__ */ jsx(Placeholder, { children: "Pet peeves welcome." }) }),
            resume.dealbreakers.length > 0 ? /* @__PURE__ */ jsx(Section, { title: "Dealbreakers", children: /* @__PURE__ */ jsx(Bullets, { items: resume.dealbreakers, marker: /* @__PURE__ */ jsx(X, { className: "size-3.5", strokeWidth: 3 }) }) }) : null,
            resume.loveLanguages.length > 0 ? /* @__PURE__ */ jsx(Section, { title: "Love Languages", children: /* @__PURE__ */ jsx("ol", { className: "space-y-1", children: resume.loveLanguages.map((l, i) => /* @__PURE__ */ jsxs("li", { className: "flex items-baseline gap-3", children: [
              /* @__PURE__ */ jsxs("span", { className: "font-mono text-xs text-[var(--accent)]", children: [
                "0",
                i + 1
              ] }),
              /* @__PURE__ */ jsx("span", { className: "font-display text-[1.02rem]", children: l })
            ] }, i)) }) }) : null
          ] })
        ] })
      ]
    }
  );
}
export {
  ResumeSheet as R
};
