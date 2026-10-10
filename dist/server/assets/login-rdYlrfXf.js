import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { getSettings, oauthLogin } from "@netlify/identity";
import { S as SiteHeader, a as SiteFooter } from "./SiteHeader-I_Xv8yCg.js";
import { e as Route, u as useIdentity, v as verifyMfa, n as nextStepAfterSignIn, O as OAUTH_REDIRECT_KEY } from "./router-BxDATaWB.js";
import { k as socialProviderOf } from "./mfa-DWEh_Kis.js";
import "clsx";
import "tailwind-merge";
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
const copy = {
  signin: {
    eyebrow: "Members Only",
    title: "Sign In to Apply.",
    blurb: "One tap with Google or GitHub — the same accounts The Social Match Game uses. New here? Signing in opens your member file. No passwords to forget."
  },
  mfa: {
    eyebrow: "Second Interview",
    title: "Enter Your Authenticator Code.",
    blurb: "Open your authenticator app and type the 6-digit code for The Relationship Resume."
  }
};
const SOCIAL = [{
  id: "google",
  label: "Google",
  icon: /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", className: "size-4", "aria-hidden": true, children: /* @__PURE__ */ jsx("path", { fill: "#EA4335", d: "M12 10.2v3.9h5.5c-.2 1.3-1.6 3.8-5.5 3.8-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.2 14.6 2.2 12 2.2 6.6 2.2 2.2 6.6 2.2 12s4.4 9.8 9.8 9.8c5.7 0 9.4-4 9.4-9.6 0-.6-.1-1.1-.2-1.6H12z" }) })
}, {
  id: "github",
  label: "GitHub",
  icon: /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", className: "size-4", "aria-hidden": true, children: /* @__PURE__ */ jsx("path", { fill: "currentColor", d: "M12 .5a11.5 11.5 0 0 0-3.6 22.4c.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.9 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A11.5 11.5 0 0 0 12 .5z" }) })
}];
function LoginPage() {
  const search = Route.useSearch();
  const {
    user,
    ready,
    logout
  } = useIdentity();
  const [mode, setMode] = useState(search.mode ?? "signin");
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [providers, setProviders] = useState(null);
  useEffect(() => {
    getSettings().then((settings) => setProviders(SOCIAL.map((p) => p.id).filter((id) => settings.providers[id]))).catch(() => setProviders([]));
  }, []);
  const redirect = search.redirect ?? "/";
  const retired = ready && !!user && !socialProviderOf(user);
  const carryOn = async () => {
    const next = await nextStepAfterSignIn(redirect);
    if (!next) return;
    if (next.startsWith("/login?mode=mfa")) {
      setMode("mfa");
      setError("");
    } else {
      window.location.assign(next);
    }
  };
  const social = (provider) => {
    window.sessionStorage.setItem(OAUTH_REDIRECT_KEY, redirect);
    oauthLogin(provider);
  };
  async function onSubmitCode(e) {
    e.preventDefault();
    setPending(true);
    setError("");
    try {
      await verifyMfa({
        data: {
          code
        }
      });
      await carryOn();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }
  const c = copy[mode];
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(SiteHeader, {}),
    /* @__PURE__ */ jsxs("main", { className: "mx-auto max-w-md px-6 py-16", children: [
      /* @__PURE__ */ jsx("p", { className: "label text-rose", children: c.eyebrow }),
      /* @__PURE__ */ jsx("h1", { className: "mt-3 font-display text-4xl font-medium tracking-tight", children: c.title }),
      /* @__PURE__ */ jsx("p", { className: "mt-3 text-ink-soft", children: c.blurb }),
      mode === "mfa" ? /* @__PURE__ */ jsxs("form", { onSubmit: onSubmitCode, className: "sheet mt-8 space-y-4 rounded-lg p-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "block", children: [
          /* @__PURE__ */ jsx("span", { className: "label text-ink-soft", children: "6-Digit Code" }),
          /* @__PURE__ */ jsx("input", { className: "field mt-1.5 text-center font-mono text-lg tracking-[0.4em]", inputMode: "numeric", autoComplete: "one-time-code", pattern: "[0-9 ]{6,7}", maxLength: 7, required: true, autoFocus: true, value: code, onChange: (e) => setCode(e.target.value) })
        ] }),
        error && /* @__PURE__ */ jsx("p", { className: "text-sm text-rose", children: error }),
        /* @__PURE__ */ jsx("button", { type: "submit", className: "btn-primary w-full", disabled: pending, children: pending ? "One Moment…" : "Verify" })
      ] }) : retired ? /* @__PURE__ */ jsxs("div", { className: "sheet mt-8 rounded-lg p-6", children: [
        /* @__PURE__ */ jsxs("p", { children: [
          "Password sign-in has been retired. Sign out, then continue with Google or GitHub using",
          " ",
          /* @__PURE__ */ jsx("strong", { children: user?.email }),
          " to pick up where you left off."
        ] }),
        /* @__PURE__ */ jsx("button", { type: "button", className: "btn-primary mt-5", onClick: () => void logout(), children: "Sign Out" })
      ] }) : ready && user ? /* @__PURE__ */ jsxs("div", { className: "sheet mt-8 rounded-lg p-6", children: [
        /* @__PURE__ */ jsxs("p", { children: [
          "You're signed in as ",
          /* @__PURE__ */ jsx("strong", { children: user.email }),
          "."
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-5 flex flex-wrap gap-3", children: [
          /* @__PURE__ */ jsx("button", { type: "button", className: "btn-primary", onClick: () => void carryOn(), children: "Continue" }),
          /* @__PURE__ */ jsx("button", { type: "button", className: "btn-ghost", onClick: () => void logout(), children: "Sign Out" })
        ] })
      ] }) : /* @__PURE__ */ jsxs("div", { className: "sheet mt-8 space-y-3 rounded-lg p-6", children: [
        providers === null ? /* @__PURE__ */ jsx("p", { className: "text-sm text-ink-soft", children: "Checking the guest list…" }) : providers.length ? SOCIAL.filter((p) => providers.includes(p.id)).map((p) => /* @__PURE__ */ jsxs("button", { type: "button", className: "btn-ghost w-full", onClick: () => social(p.id), children: [
          p.icon,
          " Continue with ",
          p.label
        ] }, p.id)) : /* @__PURE__ */ jsx("p", { className: "text-sm text-ink-soft", children: "Sign-in is closed for a moment while we tidy the lobby. Please try again shortly." }),
        /* @__PURE__ */ jsx("p", { className: "pt-2 text-xs text-ink-soft", children: "Your name comes from the account you choose. After your first sign-in we ask for your date of birth and sex, once, so everyone here is who they say they are." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-wrap justify-between gap-3 text-sm text-ink-soft", children: [
        mode === "mfa" && /* @__PURE__ */ jsx("span", { children: "Lost your phone? Ask the site's admins to reset your two-factor." }),
        /* @__PURE__ */ jsx(Link, { to: "/", className: "underline hover:text-ink", children: "Back to the Homepage" })
      ] })
    ] }),
    /* @__PURE__ */ jsx(SiteFooter, {})
  ] });
}
export {
  LoginPage as component
};
