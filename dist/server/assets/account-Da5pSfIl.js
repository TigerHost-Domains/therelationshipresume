import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useRouter, Link } from "@tanstack/react-router";
import { ShieldCheck, FileText, Check, Copy, PenLine, Plus } from "lucide-react";
import { I as IdentityOnFile } from "./IdentityOnFile-DxyKlxlR.js";
import { S as SiteHeader, a as SiteFooter } from "./SiteHeader-I_Xv8yCg.js";
import { S as SocialMatchButton } from "./SocialMatchConnect-CKdLxpjv.js";
import { R as Route, u as useIdentity, s as startMfaSetup, d as disableMfa, c as confirmMfaSetup } from "./router-BxDATaWB.js";
import { M as MIN_AGE_SOCIAL_MATCH } from "./mfa-DWEh_Kis.js";
import { A as ACCENTS } from "./resume-CLkl9H33.js";
import "clsx";
import "tailwind-merge";
import "./identity-DwbvUTDg.js";
import "../server.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "seroval";
import "@tanstack/history";
import "@tanstack/react-router/ssr/server";
import "@netlify/identity";
import "./social-match-C-j9rk_j.js";
import "zod";
import "node:crypto";
import "drizzle-orm";
import "otpauth";
import "drizzle-orm/netlify-db";
import "drizzle-orm/pg-core";
function AccountPage() {
  const {
    user
  } = Route.useRouteContext();
  const {
    status,
    myResumes,
    identity
  } = Route.useLoaderData();
  const router = useRouter();
  const {
    logout
  } = useIdentity();
  const [setup, setSetup] = useState(null);
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function run(action) {
    setPending(true);
    setError("");
    try {
      await action();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }
  const begin = () => run(async () => setSetup(await startMfaSetup()));
  const submit = (e) => {
    e.preventDefault();
    void run(async () => {
      if (status.enabled) await disableMfa({
        data: {
          code
        }
      });
      else await confirmMfaSetup({
        data: {
          code
        }
      });
      setSetup(null);
      setCode("");
      await router.invalidate();
    });
  };
  const codeField = /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "mt-5 flex flex-wrap items-end gap-3", children: [
    /* @__PURE__ */ jsxs("label", { className: "block", children: [
      /* @__PURE__ */ jsx("span", { className: "label text-ink-soft", children: "6-Digit Code" }),
      /* @__PURE__ */ jsx("input", { className: "field mt-1.5 w-44 text-center font-mono text-lg tracking-[0.4em]", inputMode: "numeric", autoComplete: "one-time-code", pattern: "[0-9 ]{6,7}", maxLength: 7, required: true, value: code, onChange: (e) => setCode(e.target.value) })
    ] }),
    /* @__PURE__ */ jsx("button", { type: "submit", className: status.enabled ? "btn-ghost" : "btn-primary", disabled: pending, children: pending ? "One Moment…" : status.enabled ? "Turn Off Two-Factor" : "Confirm and Turn On" })
  ] });
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(SiteHeader, {}),
    /* @__PURE__ */ jsxs("main", { className: "mx-auto max-w-3xl px-6 py-16 lg:py-20", children: [
      /* @__PURE__ */ jsx("p", { className: "label text-rose", children: "Personnel File" }),
      /* @__PURE__ */ jsx("h1", { className: "mt-3 font-display text-4xl font-medium tracking-tight", children: "Your Account" }),
      /* @__PURE__ */ jsxs("p", { className: "mt-3 text-ink-soft", children: [
        "Signed in as ",
        /* @__PURE__ */ jsx("strong", { className: "text-ink", children: user.email }),
        ".",
        " ",
        /* @__PURE__ */ jsx("button", { type: "button", className: "underline hover:text-ink", onClick: () => void logout().then(() => window.location.assign("/")), children: "Sign Out" })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "mt-10", children: [
        /* @__PURE__ */ jsx("h2", { className: "font-display text-2xl", children: "Identity on File" }),
        identity.status === "verified" ? /* @__PURE__ */ jsx(IdentityOnFile, { identity }) : identity.status === "refused" ? /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-ink-soft", children: "This account reported an age under 18, so it can't publish resumes. No other details were kept." }) : /* @__PURE__ */ jsxs("div", { className: "sheet mt-4 rounded-lg p-6 text-sm", children: [
          /* @__PURE__ */ jsx("p", { className: "text-ink-soft", children: "Not yet. Publishing and editing need a one-time identity check: your name from your sign-in account, plus your sworn date of birth and sex." }),
          /* @__PURE__ */ jsx(Link, { to: "/verify", search: {
            redirect: "/account"
          }, className: "btn-primary mt-4", children: "Complete Your Identity Check" })
        ] })
      ] }),
      /* @__PURE__ */ jsx(MyResumes, { resumes: myResumes, canSendToSocialMatch: identity.canSendToSocialMatch }),
      /* @__PURE__ */ jsxs("section", { className: "sheet mt-10 rounded-lg p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsx(ShieldCheck, { className: `mt-1 size-5 shrink-0 ${status.enabled ? "text-rose" : "text-ink-soft"}` }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h2", { className: "font-display text-2xl", children: "Two-Factor Authentication" }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-ink-soft", children: status.enabled ? "On. Publishing and editing ask for a code from your authenticator app once per browser, every 12 hours." : "Off. Add a code from an authenticator app (Google Authenticator, 1Password, Authy…) as a second reference check before anyone can publish or edit as you." })
          ] })
        ] }),
        status.enabled ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("p", { className: "mt-5 text-sm text-ink-soft", children: "To turn it off, enter a current code." }),
          codeField
        ] }) : setup ? /* @__PURE__ */ jsxs("div", { className: "mt-6 grid gap-6 sm:grid-cols-[auto_1fr]", children: [
          /* @__PURE__ */ jsx("img", { src: setup.qr, alt: "QR code for your authenticator app", className: "size-44 rounded-md border border-rule bg-white p-1" }),
          /* @__PURE__ */ jsxs("div", { className: "text-sm", children: [
            /* @__PURE__ */ jsx("p", { children: "1. Scan this code with your authenticator app." }),
            /* @__PURE__ */ jsx("p", { className: "mt-2 text-ink-soft", children: "Can't scan? Enter this key instead:" }),
            /* @__PURE__ */ jsx("code", { className: "mt-1 block break-all rounded bg-blush/50 px-2 py-1 font-mono text-xs", children: setup.secret }),
            /* @__PURE__ */ jsx("p", { className: "mt-4", children: "2. Enter the 6-digit code it shows." }),
            codeField
          ] })
        ] }) : /* @__PURE__ */ jsx("button", { type: "button", className: "btn-primary mt-6", onClick: () => void begin(), disabled: pending, children: "Set Up Authenticator App" }),
        error ? /* @__PURE__ */ jsx("p", { className: "mt-4 text-sm text-rose", role: "alert", children: error }) : null
      ] })
    ] }),
    /* @__PURE__ */ jsx(SiteFooter, {})
  ] });
}
function MyResumes({
  resumes,
  canSendToSocialMatch
}) {
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(null);
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);
  const copy = async (slug) => {
    await navigator.clipboard.writeText(`${window.location.origin}/r/${slug}`);
    setCopied(slug);
    setTimeout(() => setCopied(null), 1800);
  };
  return /* @__PURE__ */ jsxs("section", { className: "sheet mt-10 rounded-lg p-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
      /* @__PURE__ */ jsx(FileText, { className: "mt-1 size-5 shrink-0 text-rose" }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "font-display text-2xl", children: "Your Resumes" }),
        /* @__PURE__ */ jsxs("p", { className: "mt-1 text-sm text-ink-soft", children: [
          resumes.length ? "Every resume on file under your name, plus any you’ve been asked to co-edit. Share the link with anyone worth interviewing." : "No applications on file yet. Write one and its link will be kept here.",
          resumes.length ? canSendToSocialMatch ? " You can also pin your own to your Social Match Game profile." : ` From ${MIN_AGE_SOCIAL_MATCH}, you can also pin your own to a Social Match Game profile.` : null
        ] })
      ] })
    ] }),
    resumes.length ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("ul", { className: "mt-6 divide-y divide-rule border-y border-rule", children: resumes.map((r) => {
        const path = `/r/${r.slug}`;
        return /* @__PURE__ */ jsxs("li", { className: "flex flex-wrap items-center gap-x-4 gap-y-2 py-4", children: [
          /* @__PURE__ */ jsx("span", { className: "size-2.5 shrink-0 rounded-full", style: {
            backgroundColor: ACCENTS[r.accent]?.color
          }, "aria-hidden": true }),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsx(Link, { to: "/r/$slug", params: {
              slug: r.slug
            }, className: "font-display text-lg hover:underline", children: r.name }),
            r.role === "co-editor" ? /* @__PURE__ */ jsx("span", { className: "label ml-2 text-ink-soft", children: "Co-Editor" }) : null,
            r.headline ? /* @__PURE__ */ jsx("p", { className: "truncate text-sm text-ink-soft", children: r.headline }) : null,
            /* @__PURE__ */ jsxs("p", { className: "mt-0.5 break-all font-mono text-xs text-ink-soft", children: [
              origin,
              path
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-3 text-sm", children: [
            /* @__PURE__ */ jsxs("button", { type: "button", className: "inline-flex items-center gap-1 text-ink-soft hover:text-ink", onClick: () => void copy(r.slug), children: [
              copied === r.slug ? /* @__PURE__ */ jsx(Check, { className: "size-3.5" }) : /* @__PURE__ */ jsx(Copy, { className: "size-3.5" }),
              copied === r.slug ? "Copied" : "Copy Link"
            ] }),
            /* @__PURE__ */ jsxs(Link, { to: "/r/$slug/edit", params: {
              slug: r.slug
            }, className: "inline-flex items-center gap-1 text-ink-soft hover:text-ink", children: [
              /* @__PURE__ */ jsx(PenLine, { className: "size-3.5" }),
              "Edit"
            ] }),
            canSendToSocialMatch && r.role === "owner" ? /* @__PURE__ */ jsx(SocialMatchButton, { slug: r.slug, compact: true, returnTo: "/account" }) : null
          ] })
        ] }, r.slug);
      }) }),
      /* @__PURE__ */ jsxs(Link, { to: "/create", className: "btn-ghost mt-6", children: [
        /* @__PURE__ */ jsx(Plus, { className: "size-4" }),
        " Write Another Resume"
      ] })
    ] }) : /* @__PURE__ */ jsx(Link, { to: "/create", className: "btn-primary mt-6 inline-block", children: "Write Your Resume" })
  ] });
}
export {
  AccountPage as component
};
