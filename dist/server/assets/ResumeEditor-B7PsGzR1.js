import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { PenLine, Eye, BadgeCheck, Lock, Trash2, Plus, Sparkles, X } from "lucide-react";
import { R as ResumeSheet } from "./ResumeSheet-nKMr6oSe.js";
import { h as displayName, P as PROVIDER_LABELS, N as NAME_STYLES, q as SEXES } from "./mfa-DWEh_Kis.js";
import { L as LIMITS, a as LOVE_LANGUAGES, A as ACCENTS, s as sampleResume, r as resumeInputSchema } from "./resume-CLkl9H33.js";
function Step({ n, title, hint, children }) {
  return /* @__PURE__ */ jsxs("fieldset", { className: "space-y-4 border-t border-rule pt-7 first:border-t-0 first:pt-0", children: [
    /* @__PURE__ */ jsxs("legend", { className: "contents", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-baseline gap-3", children: [
        /* @__PURE__ */ jsx("span", { className: "font-mono text-xs text-rose", children: n }),
        /* @__PURE__ */ jsx("h2", { className: "font-display text-2xl font-medium tracking-tight xl:text-[1.75rem]", children: title })
      ] }),
      hint ? /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-ink-soft", children: hint }) : null
    ] }),
    children
  ] });
}
function Field({ label, children, note }) {
  return /* @__PURE__ */ jsxs("label", { className: "block space-y-1.5", children: [
    /* @__PURE__ */ jsxs("span", { className: "flex items-baseline justify-between", children: [
      /* @__PURE__ */ jsx("span", { className: "label text-ink-soft", children: label }),
      note ? /* @__PURE__ */ jsx("span", { className: "text-xs text-ink-soft/70", children: note }) : null
    ] }),
    children
  ] });
}
function Count({ value, max }) {
  return /* @__PURE__ */ jsxs("p", { className: "-mt-2 text-right text-xs text-ink-soft/70", children: [
    value.length,
    "/",
    max
  ] });
}
function TagInput({
  label,
  values,
  onChange,
  placeholder,
  suggestions = [],
  max = LIMITS.listItems
}) {
  const [draft, setDraft] = useState("");
  const add = (value) => {
    const v = value.trim().slice(0, LIMITS.listItem);
    if (!v || values.length >= max || values.some((x) => x.toLowerCase() === v.toLowerCase())) return;
    onChange([...values, v]);
  };
  const onKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add(draft);
      setDraft("");
    } else if (e.key === "Backspace" && !draft && values.length) {
      onChange(values.slice(0, -1));
    }
  };
  const open = suggestions.filter((s) => !values.includes(s)).slice(0, 5);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-baseline justify-between", children: [
      /* @__PURE__ */ jsx("span", { className: "label text-ink-soft", children: label }),
      /* @__PURE__ */ jsxs("span", { className: "text-xs text-ink-soft/70", children: [
        draft ? `${draft.length}/${LIMITS.listItem} · ` : "",
        values.length,
        "/",
        max,
        " Items"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "field flex min-h-11 flex-wrap items-center gap-1.5 py-1.5", children: [
      values.map((v, i) => /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-blush px-2.5 py-0.5 text-sm text-rose-deep", children: [
        v,
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            "aria-label": `Remove ${v}`,
            onClick: () => onChange(values.filter((_, j) => j !== i)),
            className: "rounded-full p-0.5 hover:bg-rose/15",
            children: /* @__PURE__ */ jsx(X, { className: "size-3" })
          }
        )
      ] }, v)),
      /* @__PURE__ */ jsx(
        "input",
        {
          value: draft,
          onChange: (e) => setDraft(e.target.value),
          onKeyDown,
          onBlur: () => {
            add(draft);
            setDraft("");
          },
          maxLength: LIMITS.listItem,
          placeholder: values.length ? "Add another…" : placeholder,
          disabled: values.length >= max,
          className: "min-w-[8rem] flex-1 bg-transparent py-1 text-[0.95rem] outline-none placeholder:text-ink-soft/50"
        }
      )
    ] }),
    open.length > 0 ? /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1.5", children: open.map((s) => /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        onClick: () => add(s),
        className: "rounded-full border border-dashed border-ink/20 px-2.5 py-0.5 text-xs text-ink-soft hover:border-rose hover:text-rose",
        children: [
          "+ ",
          s
        ]
      },
      s
    )) }) : null
  ] });
}
const SUGGESTIONS = {
  qualities: ["Great listener", "Patient", "Funny", "Ambitious", "Affectionate", "Honest", "Adventurous", "Calm in a crisis"],
  likes: ["Live music", "Cooking together", "Hiking", "Road trips", "Museums", "Cozy nights in", "Travel", "Coffee shops"],
  dislikes: ["Bad tippers", "Loud chewing", "Small talk", "Being rushed", "Reality TV", "Mornings"],
  dealbreakers: ["Dishonesty", "Rude to others", "Doesn't want kids", "Wants kids", "Smoking", "No sense of humor"]
};
function ResumeEditor({
  initial,
  submitLabel,
  onSubmit,
  onChange,
  identity,
  identityNote,
  disabled
}) {
  const [resume, setResume] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [mobileView, setMobileView] = useState("edit");
  const effective = {
    ...resume,
    name: identity ? displayName(identity.legalName, resume.nameStyle) : "",
    age: identity ? String(identity.age) : ""
  };
  useEffect(() => {
    onChange?.(effective);
  }, [resume, identity]);
  const set = (key, value) => setResume((r) => ({ ...r, [key]: value }));
  const toggleLanguage = (lang) => set(
    "loveLanguages",
    resume.loveLanguages.includes(lang) ? resume.loveLanguages.filter((l) => l !== lang) : [...resume.loveLanguages, lang]
  );
  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    const cleaned = {
      ...effective,
      experience: resume.experience.filter((x) => x.role.trim()),
      references: resume.references.filter((x) => x.name.trim() && x.quote.trim())
    };
    const parsed = resumeInputSchema.safeParse(cleaned);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check your entries.");
      return;
    }
    setSaving(true);
    try {
      await onSubmit(parsed.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setSaving(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-studio px-4 sm:px-6 lg:px-10", children: [
    /* @__PURE__ */ jsx("div", { className: "no-print sticky top-0 z-10 -mx-4 mb-6 flex gap-2 bg-paper/90 px-4 py-3 backdrop-blur lg:hidden", children: ["edit", "preview"].map((v) => /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        onClick: () => setMobileView(v),
        className: `btn flex-1 ${mobileView === v ? "bg-ink text-paper" : "border border-ink/15"}`,
        children: [
          v === "edit" ? /* @__PURE__ */ jsx(PenLine, { className: "size-4" }) : /* @__PURE__ */ jsx(Eye, { className: "size-4" }),
          v === "edit" ? "Write" : "Preview"
        ]
      },
      v
    )) }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] xl:gap-14 2xl:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] 2xl:gap-20", children: [
      /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: `space-y-8 pb-16 xl:space-y-10 ${mobileView === "preview" ? "hidden lg:block" : ""}`, children: [
        /* @__PURE__ */ jsxs(Step, { n: "01", title: "The Basics", hint: "How you'd introduce yourself at the top of the page.", children: [
          identity ? /* @__PURE__ */ jsxs("div", { className: "space-y-3 rounded-lg border border-rule bg-sheet/60 p-4", children: [
            /* @__PURE__ */ jsxs("p", { className: "flex items-center gap-2 text-sm text-ink-soft", children: [
              /* @__PURE__ */ jsx(BadgeCheck, { className: "size-4 text-rose" }),
              "Identity on file · name from ",
              PROVIDER_LABELS[identity.provider],
              ", age and sex as sworn. Locked."
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx("span", { className: "label text-ink-soft", children: "Show My Name As" }),
              /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: NAME_STYLES.map((style) => /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => set("nameStyle", style),
                  className: `rounded-full border px-3.5 py-1.5 text-sm transition ${resume.nameStyle === style ? "border-rose bg-rose text-white" : "border-ink/15 hover:border-rose/60"}`,
                  children: displayName(identity.legalName, style)
                },
                style
              )) })
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "flex flex-wrap gap-x-5 gap-y-1 font-mono text-xs text-ink-soft", children: [
              /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1", children: [
                /* @__PURE__ */ jsx(Lock, { className: "size-3" }),
                " ",
                identity.age,
                " years"
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1", children: [
                /* @__PURE__ */ jsx(Lock, { className: "size-3" }),
                " ",
                SEXES[identity.sex]
              ] })
            ] })
          ] }) : /* @__PURE__ */ jsx("div", { className: "rounded-lg border border-dashed border-rose/40 bg-blush/30 p-4 text-sm text-ink-soft", children: identityNote ?? "Your name, age and sex are filled in from your verified identity — no typing, no fibbing." }),
          /* @__PURE__ */ jsx(Field, { label: "Location", note: `${resume.location.length}/${LIMITS.location}`, children: /* @__PURE__ */ jsx("input", { className: "field", value: resume.location, maxLength: LIMITS.location, onChange: (e) => set("location", e.target.value), placeholder: "City, State" }) }),
          /* @__PURE__ */ jsx(Field, { label: "Headline", note: `${resume.headline.length}/${LIMITS.headline}`, children: /* @__PURE__ */ jsx("input", { className: "field", value: resume.headline, maxLength: LIMITS.headline, onChange: (e) => set("headline", e.target.value), placeholder: "Weekend hiker, weeknight cook, lifelong romantic" }) }),
          /* @__PURE__ */ jsx(Field, { label: "How to Reach You", note: `Shown Publicly · ${resume.contact.length}/${LIMITS.contact}`, children: /* @__PURE__ */ jsx("input", { className: "field", value: resume.contact, maxLength: LIMITS.contact, onChange: (e) => set("contact", e.target.value), placeholder: "Email, Instagram handle, or dating-app username" }) })
        ] }),
        /* @__PURE__ */ jsxs(Step, { n: "02", title: "Objective", hint: "The one-paragraph pitch. What are you looking for in love?", children: [
          /* @__PURE__ */ jsx(Field, { label: "Objective", note: `${resume.objective.length}/${LIMITS.paragraph}`, children: /* @__PURE__ */ jsx("textarea", { className: "field min-h-28", value: resume.objective, maxLength: LIMITS.paragraph, onChange: (e) => set("objective", e.target.value), placeholder: "To find a partner who…" }) }),
          /* @__PURE__ */ jsx(Field, { label: "Ideal Candidate", note: `${resume.lookingFor.length}/${LIMITS.paragraph}`, children: /* @__PURE__ */ jsx("textarea", { className: "field min-h-28", value: resume.lookingFor, maxLength: LIMITS.paragraph, onChange: (e) => set("lookingFor", e.target.value), placeholder: "Describe the person you'd love to meet." }) })
        ] }),
        /* @__PURE__ */ jsxs(Step, { n: "03", title: "Qualities & Preferences", hint: "Press Enter after each one, or tap a suggestion.", children: [
          /* @__PURE__ */ jsx(TagInput, { label: "Core Qualities", values: resume.qualities, onChange: (v) => set("qualities", v), placeholder: "What makes you a great partner?", suggestions: SUGGESTIONS.qualities }),
          /* @__PURE__ */ jsx(TagInput, { label: "Likes", values: resume.likes, onChange: (v) => set("likes", v), placeholder: "Things you love", suggestions: SUGGESTIONS.likes }),
          /* @__PURE__ */ jsx(TagInput, { label: "Dislikes", values: resume.dislikes, onChange: (v) => set("dislikes", v), placeholder: "Pet peeves", suggestions: SUGGESTIONS.dislikes }),
          /* @__PURE__ */ jsx(TagInput, { label: "Dealbreakers", values: resume.dealbreakers, onChange: (v) => set("dealbreakers", v), placeholder: "Non-negotiables", suggestions: SUGGESTIONS.dealbreakers }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("span", { className: "label text-ink-soft", children: "Love Languages · Tap in Order of Importance" }),
            /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: LOVE_LANGUAGES.map((lang) => {
              const idx = resume.loveLanguages.indexOf(lang);
              return /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => toggleLanguage(lang),
                  className: `inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm transition ${idx >= 0 ? "border-rose bg-rose text-white" : "border-ink/15 hover:border-rose/60"}`,
                  children: [
                    idx >= 0 ? /* @__PURE__ */ jsx("span", { className: "font-mono text-xs opacity-80", children: idx + 1 }) : null,
                    lang
                  ]
                },
                lang
              );
            }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Step, { n: "04", title: "Relevant Experience", hint: "Past relationships, lessons learned, or anything that proves you're ready.", children: [
          resume.experience.map((job, i) => /* @__PURE__ */ jsxs("div", { className: "relative space-y-3 rounded-lg border border-rule bg-sheet/60 p-4", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                "aria-label": "Remove experience",
                onClick: () => set("experience", resume.experience.filter((_, j) => j !== i)),
                className: "absolute top-3 right-3 rounded-full p-1.5 text-ink-soft hover:bg-blush hover:text-rose",
                children: /* @__PURE__ */ jsx(Trash2, { className: "size-4" })
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "grid gap-3 pr-8 sm:grid-cols-[1fr_9rem]", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  className: "field",
                  placeholder: "Role (e.g. Long-term Partner)",
                  value: job.role,
                  maxLength: 80,
                  onChange: (e) => set("experience", resume.experience.map((x, j) => j === i ? { ...x, role: e.target.value } : x))
                }
              ),
              /* @__PURE__ */ jsx(
                "input",
                {
                  className: "field",
                  placeholder: "2019 – 2023",
                  value: job.years,
                  maxLength: 30,
                  onChange: (e) => set("experience", resume.experience.map((x, j) => j === i ? { ...x, years: e.target.value } : x))
                }
              )
            ] }),
            /* @__PURE__ */ jsx(
              "input",
              {
                className: "field",
                placeholder: "Where / with whom",
                value: job.place,
                maxLength: 80,
                onChange: (e) => set("experience", resume.experience.map((x, j) => j === i ? { ...x, place: e.target.value } : x))
              }
            ),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                className: "field min-h-20",
                placeholder: "What you learned or brought to the table",
                value: job.description,
                maxLength: LIMITS.blurb,
                onChange: (e) => set("experience", resume.experience.map((x, j) => j === i ? { ...x, description: e.target.value } : x))
              }
            ),
            /* @__PURE__ */ jsx(Count, { value: job.description, max: LIMITS.blurb })
          ] }, i)),
          resume.experience.length < 6 ? /* @__PURE__ */ jsxs("button", { type: "button", className: "btn-ghost", onClick: () => set("experience", [...resume.experience, { role: "", place: "", years: "", description: "" }]), children: [
            /* @__PURE__ */ jsx(Plus, { className: "size-4" }),
            " Add Experience"
          ] }) : null
        ] }),
        /* @__PURE__ */ jsxs(Step, { n: "05", title: "References", hint: "Quotes from friends, family, or an ex who'd vouch for you.", children: [
          resume.references.map((ref, i) => /* @__PURE__ */ jsxs("div", { className: "relative space-y-3 rounded-lg border border-rule bg-sheet/60 p-4", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                "aria-label": "Remove reference",
                onClick: () => set("references", resume.references.filter((_, j) => j !== i)),
                className: "absolute top-3 right-3 rounded-full p-1.5 text-ink-soft hover:bg-blush hover:text-rose",
                children: /* @__PURE__ */ jsx(Trash2, { className: "size-4" })
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "grid gap-3 pr-8 sm:grid-cols-2", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  className: "field",
                  placeholder: "Name",
                  value: ref.name,
                  maxLength: 60,
                  onChange: (e) => set("references", resume.references.map((x, j) => j === i ? { ...x, name: e.target.value } : x))
                }
              ),
              /* @__PURE__ */ jsx(
                "input",
                {
                  className: "field",
                  placeholder: "Relationship (e.g. College roommate)",
                  value: ref.relation,
                  maxLength: 60,
                  onChange: (e) => set("references", resume.references.map((x, j) => j === i ? { ...x, relation: e.target.value } : x))
                }
              )
            ] }),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                className: "field min-h-20",
                placeholder: "What would they say about you?",
                value: ref.quote,
                maxLength: LIMITS.blurb,
                onChange: (e) => set("references", resume.references.map((x, j) => j === i ? { ...x, quote: e.target.value } : x))
              }
            ),
            /* @__PURE__ */ jsx(Count, { value: ref.quote, max: LIMITS.blurb })
          ] }, i)),
          resume.references.length < 4 ? /* @__PURE__ */ jsxs("button", { type: "button", className: "btn-ghost", onClick: () => set("references", [...resume.references, { name: "", relation: "", quote: "" }]), children: [
            /* @__PURE__ */ jsx(Plus, { className: "size-4" }),
            " Add Reference"
          ] }) : null
        ] }),
        /* @__PURE__ */ jsx(Step, { n: "06", title: "Finishing Touch", hint: "Pick the ink for your page.", children: /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-3", children: Object.entries(ACCENTS).map(([key, { label, color }]) => /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: () => set("accent", key),
            className: `flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${resume.accent === key ? "border-ink bg-sheet" : "border-ink/15 hover:border-ink/40"}`,
            children: [
              /* @__PURE__ */ jsx("span", { className: "size-4 rounded-full", style: { background: color } }),
              label
            ]
          },
          key
        )) }) }),
        /* @__PURE__ */ jsxs("div", { className: "sticky bottom-0 -mx-4 flex flex-col gap-3 border-t border-rule bg-paper/95 px-4 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between", children: [
          error ? /* @__PURE__ */ jsx("p", { className: "text-sm text-rose", role: "alert", children: error }) : /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => setResume({ ...sampleResume, nameStyle: resume.nameStyle }), className: "inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-rose", children: [
            /* @__PURE__ */ jsx(Sparkles, { className: "size-4" }),
            " Fill with an Example"
          ] }),
          /* @__PURE__ */ jsx("button", { type: "submit", className: "btn-primary", disabled: saving || disabled, children: saving ? "Saving…" : submitLabel })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: `${mobileView === "edit" ? "hidden lg:block" : ""}`, children: /* @__PURE__ */ jsxs("div", { className: "lg:sticky lg:top-6", children: [
        /* @__PURE__ */ jsx("p", { className: "label no-print mb-3 hidden text-ink-soft lg:block", children: "Live Preview" }),
        /* @__PURE__ */ jsx("div", { className: "lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto lg:rounded-sm", children: /* @__PURE__ */ jsx(
          ResumeSheet,
          {
            resume: { ...effective, sex: identity?.sex ?? null, verifiedVia: identity?.provider ?? null },
            compact: true
          }
        ) })
      ] }) })
    ] })
  ] });
}
export {
  ResumeEditor as R
};
