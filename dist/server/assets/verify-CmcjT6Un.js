import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { useRouter, Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { I as IdentityOnFile } from "./IdentityOnFile-DxyKlxlR.js";
import { S as SiteHeader, a as SiteFooter } from "./SiteHeader-I_Xv8yCg.js";
import { f as Route, u as useIdentity, h as submitIdentity } from "./router-BxDATaWB.js";
import { P as PROVIDER_LABELS, j as MIN_AGE_RESUME, M as MIN_AGE_SOCIAL_MATCH, q as SEXES, o as IDENTITY_POLICY_VERSION, i as identityInputSchema } from "./mfa-DWEh_Kis.js";
import "clsx";
import "tailwind-merge";
import "@netlify/identity";
import "../server.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "seroval";
import "@tanstack/history";
import "@tanstack/react-router/ssr/server";
import "zod";
import "./identity-DwbvUTDg.js";
import "./resume-CLkl9H33.js";
import "node:crypto";
import "drizzle-orm";
import "otpauth";
import "drizzle-orm/netlify-db";
import "drizzle-orm/pg-core";
function VerifyPage() {
  const identity = Route.useLoaderData();
  const search = Route.useSearch();
  const router = useRouter();
  const {
    logout
  } = useIdentity();
  const [legalName, setLegalName] = useState(identity.legalName ?? "");
  const [birthDate, setBirthDate] = useState("");
  const [sex, setSex] = useState("");
  const [attest, setAttest] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const provider = PROVIDER_LABELS[identity.provider] ?? "your sign-in account";
  const nameLocked = identity.nameSource === "provider" && !!identity.legalName;
  const next = search.redirect ?? "/create";
  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    const parsed = identityInputSchema.safeParse({
      legalName: nameLocked ? void 0 : legalName,
      birthDate,
      sex: sex || void 0,
      attest
    });
    if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? "Please check your entries.");
    setPending(true);
    try {
      await submitIdentity({
        data: parsed.data
      });
      await router.invalidate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }
  if (identity.status === "refused") {
    return /* @__PURE__ */ jsxs(Shell, { eyebrow: "Application on Hold", title: "Come Back When You’re 18.", children: [
      /* @__PURE__ */ jsxs("p", { className: "mt-3 text-ink-soft", children: [
        "Relationship Resumes are for adults, ",
        MIN_AGE_RESUME,
        " and over. We haven’t kept your date of birth or any other details — just a note that this account can’t apply."
      ] }),
      /* @__PURE__ */ jsx("button", { type: "button", className: "btn-ghost mt-8", onClick: () => void logout().then(() => window.location.assign("/")), children: "Sign Out" })
    ] });
  }
  if (identity.status === "verified") {
    return /* @__PURE__ */ jsxs(Shell, { eyebrow: "Background Check Complete", title: "You’re on File.", children: [
      /* @__PURE__ */ jsx(IdentityOnFile, { identity }),
      /* @__PURE__ */ jsx("a", { href: next, className: "btn-primary mt-8", children: "Continue" })
    ] });
  }
  return /* @__PURE__ */ jsxs(Shell, { eyebrow: "Background Check", title: "Who’s Applying?", children: [
    /* @__PURE__ */ jsx("p", { className: "mt-3 text-ink-soft", children: "Name, age and sex appear on every resume and keep the community safe, so we take them once and lock them. What you say you are is who you are." }),
    /* @__PURE__ */ jsxs("form", { onSubmit, className: "sheet mt-8 space-y-5 rounded-lg p-6", children: [
      /* @__PURE__ */ jsxs("label", { className: "block", children: [
        /* @__PURE__ */ jsx("span", { className: "label text-ink-soft", children: "Full Legal Name" }),
        nameLocked ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs("span", { className: "field mt-1.5 flex items-center gap-2 bg-blush/30", children: [
            /* @__PURE__ */ jsx(Lock, { className: "size-3.5 text-ink-soft" }),
            " ",
            identity.legalName
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "mt-1 block text-xs text-ink-soft", children: [
            "From your ",
            provider,
            " account. If it’s wrong, fix it with ",
            provider,
            " before you continue."
          ] })
        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("input", { className: "field mt-1.5", value: legalName, maxLength: 80, autoComplete: "name", required: true, onChange: (e) => setLegalName(e.target.value) }),
          /* @__PURE__ */ jsxs("span", { className: "mt-1 block text-xs text-ink-soft", children: [
            "Your ",
            provider,
            " account didn’t share a name, so enter it as it appears on your ID."
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("label", { className: "block", children: [
        /* @__PURE__ */ jsx("span", { className: "label text-ink-soft", children: "Date of Birth" }),
        /* @__PURE__ */ jsx("input", { className: "field mt-1.5", type: "date", required: true, autoComplete: "bday", max: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), value: birthDate, onChange: (e) => setBirthDate(e.target.value) }),
        /* @__PURE__ */ jsxs("span", { className: "mt-1 block text-xs text-ink-soft", children: [
          "Only your age is shown. ",
          MIN_AGE_RESUME,
          "+ to publish a resume; ",
          MIN_AGE_SOCIAL_MATCH,
          "+ to send it to The Social Match Game."
        ] })
      ] }),
      /* @__PURE__ */ jsxs("fieldset", { children: [
        /* @__PURE__ */ jsx("legend", { className: "label text-ink-soft", children: "Sex" }),
        /* @__PURE__ */ jsx("div", { className: "mt-2 flex flex-wrap gap-2", children: Object.keys(SEXES).map((key) => /* @__PURE__ */ jsxs("label", { className: `cursor-pointer rounded-full border px-4 py-1.5 text-sm transition ${sex === key ? "border-rose bg-rose text-white" : "border-ink/15 hover:border-rose/60"}`, children: [
          /* @__PURE__ */ jsx("input", { type: "radio", name: "sex", value: key, className: "sr-only", checked: sex === key, onChange: () => setSex(key) }),
          SEXES[key]
        ] }, key)) })
      ] }),
      /* @__PURE__ */ jsxs("label", { className: "flex gap-3 rounded-md border border-rule bg-paper/60 p-4 text-sm", children: [
        /* @__PURE__ */ jsx("input", { type: "checkbox", className: "mt-0.5", checked: attest, onChange: (e) => setAttest(e.target.checked) }),
        /* @__PURE__ */ jsxs("span", { children: [
          "I confirm this is my real name, date of birth and sex, that I’m at least ",
          MIN_AGE_RESUME,
          ", and that giving false details may get my resumes removed and my account closed. I understand they can’t be changed later except by contacting The Relationship Resume.",
          /* @__PURE__ */ jsxs("span", { className: "mt-1 block font-mono text-[0.7rem] text-ink-soft", children: [
            "Truthful Identity Policy · v",
            IDENTITY_POLICY_VERSION
          ] })
        ] })
      ] }),
      error ? /* @__PURE__ */ jsx("p", { className: "text-sm text-rose", role: "alert", children: error }) : null,
      /* @__PURE__ */ jsx("button", { type: "submit", className: "btn-primary w-full", disabled: pending, children: pending ? "Filing Your Paperwork…" : "Swear Me In" })
    ] })
  ] });
}
function Shell({
  eyebrow,
  title,
  children
}) {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(SiteHeader, {}),
    /* @__PURE__ */ jsxs("main", { className: "mx-auto max-w-lg px-6 py-16", children: [
      /* @__PURE__ */ jsx("p", { className: "label text-rose", children: eyebrow }),
      /* @__PURE__ */ jsx("h1", { className: "mt-3 font-display text-4xl font-medium tracking-tight", children: title }),
      children,
      /* @__PURE__ */ jsx("p", { className: "mt-8 text-sm text-ink-soft", children: /* @__PURE__ */ jsx(Link, { to: "/", className: "underline hover:text-ink", children: "Back to the Homepage" }) })
    ] }),
    /* @__PURE__ */ jsx(SiteFooter, {})
  ] });
}
export {
  VerifyPage as component
};
