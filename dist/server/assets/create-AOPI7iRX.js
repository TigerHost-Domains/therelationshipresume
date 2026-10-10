import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { FilePlus2, Trash2 } from "lucide-react";
import { R as ResumeEditor } from "./ResumeEditor-B7PsGzR1.js";
import { S as SiteHeader, c as cn } from "./SiteHeader-I_Xv8yCg.js";
import { e as emptyResume } from "./resume-CLkl9H33.js";
import { u as useIdentity, a as Route, g as getMyIdentity, b as createResume } from "./router-BxDATaWB.js";
import { k as socialProviderOf, j as MIN_AGE_RESUME, I as IDENTITY_REQUIRED } from "./mfa-DWEh_Kis.js";
import { M as MFA_REQUIRED } from "./identity-DwbvUTDg.js";
import "./ResumeSheet-nKMr6oSe.js";
import "clsx";
import "tailwind-merge";
import "zod";
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
import "node:crypto";
import "drizzle-orm";
import "otpauth";
import "drizzle-orm/netlify-db";
import "drizzle-orm/pg-core";
const DRAFT_SLOTS = [1, 2];
const LEGACY_KEY = "relationship-resume:draft";
const keyFor = (slot) => `relationship-resume:draft:${slot}`;
function toResume(value) {
  if (!value || typeof value !== "object") return null;
  const raw = value;
  const resume = { ...emptyResume };
  for (const [key, fallback] of Object.entries(emptyResume)) {
    const v = raw[key];
    if (Array.isArray(fallback) ? Array.isArray(v) : typeof v === typeof fallback) resume[key] = v;
  }
  return resume;
}
function read(slot) {
  try {
    if (slot === 1 && !window.localStorage.getItem(keyFor(1))) {
      const legacy = toResume(JSON.parse(window.localStorage.getItem(LEGACY_KEY) ?? "null"));
      window.localStorage.removeItem(LEGACY_KEY);
      if (legacy) write(1, { resume: legacy, updatedAt: Date.now() });
    }
    const stored = JSON.parse(window.localStorage.getItem(keyFor(slot)) ?? "null");
    const resume = toResume(stored?.resume);
    return resume ? { resume, updatedAt: typeof stored?.updatedAt === "number" ? stored.updatedAt : 0 } : null;
  } catch {
    return null;
  }
}
function write(slot, draft) {
  try {
    window.localStorage.setItem(keyFor(slot), JSON.stringify(draft));
  } catch {
  }
}
function loadDraft(slot) {
  return read(slot)?.resume ?? null;
}
function saveDraft(slot, resume) {
  const json = JSON.stringify(resume);
  if (json === JSON.stringify(emptyResume)) return clearDraft(slot);
  if (JSON.stringify(read(slot)?.resume) === json) return;
  write(slot, { resume, updatedAt: Date.now() });
}
function clearDraft(slot) {
  window.localStorage.removeItem(keyFor(slot));
}
function listDrafts() {
  const summary = (slot) => {
    const draft = read(slot);
    return draft ? { name: (draft.resume.name || draft.resume.headline).trim().slice(0, 40), updatedAt: draft.updatedAt } : null;
  };
  return { 1: summary(1), 2: summary(2) };
}
function savedAgo(ts) {
  const mins = Math.round((Date.now() - ts) / 6e4);
  if (mins < 1) return "saved just now";
  if (mins < 60) return `saved ${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `saved ${hours} hr ago`;
  return `saved ${new Date(ts).toLocaleDateString()}`;
}
function CreatePage() {
  const navigate = useNavigate();
  const {
    user,
    ready
  } = useIdentity();
  const slot = Route.useSearch().draft ?? 1;
  const [loaded, setLoaded] = useState(null);
  const [drafts, setDrafts] = useState({
    1: null,
    2: null
  });
  const [me, setMe] = useState(null);
  const signedIn = ready && !!user && !!socialProviderOf(user);
  useEffect(() => {
    if (!signedIn) return setMe(null);
    getMyIdentity().then(setMe).catch(() => setMe(null));
  }, [signedIn]);
  const identity = me?.status === "verified" && me.legalName && me.age !== null && me.sex ? {
    legalName: me.legalName,
    age: me.age,
    sex: me.sex,
    provider: me.provider
  } : null;
  const underAge = me?.status === "refused" || me?.age != null && me.age < MIN_AGE_RESUME;
  useEffect(() => {
    setLoaded((prev) => ({
      slot,
      resume: loadDraft(slot) ?? emptyResume,
      version: (prev?.version ?? 0) + 1
    }));
    setDrafts(listDrafts());
  }, [slot]);
  const autosave = (resume) => {
    if (loaded?.slot !== slot) return;
    saveDraft(slot, resume);
    setDrafts(listDrafts());
  };
  const discard = (s) => {
    const name = drafts[s]?.name;
    if (!window.confirm(`Discard ${name ? `${name}'s draft` : `draft ${s}`}? This can't be undone.`)) return;
    clearDraft(s);
    setDrafts(listDrafts());
    if (s === slot) setLoaded((prev) => ({
      slot,
      resume: emptyResume,
      version: (prev?.version ?? 0) + 1
    }));
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(SiteHeader, {}),
    /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-studio px-4 pt-6 pb-8 sm:px-6 lg:px-10 lg:pt-8 lg:pb-10", children: [
      /* @__PURE__ */ jsx("p", { className: "label text-rose", children: "New Application" }),
      /* @__PURE__ */ jsxs("h1", { className: "mt-2 font-display text-4xl font-medium tracking-tight sm:text-5xl xl:text-6xl", children: [
        "Write Your ",
        /* @__PURE__ */ jsx("em", { children: "Relationship Resume" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mt-3 max-w-2xl text-lg leading-relaxed text-ink-soft", children: "Fill in as much or as little as you like — your page updates as you type. When you publish, you get a link to share on your dating profile, in your bio, or with a friend who loves to set people up." }),
      ready && !signedIn ? /* @__PURE__ */ jsxs("p", { className: "mt-3 max-w-xl text-sm text-ink-soft", children: [
        "Drafting is open to all; publishing takes a member account so only you can make revisions.",
        " ",
        /* @__PURE__ */ jsx(Link, { to: "/login", search: {
          redirect: `/create?draft=${slot}`
        }, className: "text-rose underline", children: "Sign in" }),
        " ",
        "any time — we'll keep your drafts."
      ] }) : null,
      /* @__PURE__ */ jsxs("div", { className: "no-print mt-6", children: [
        /* @__PURE__ */ jsx("p", { className: "label text-ink-soft", children: "Drafts in Progress · Saved in This Browser, Two at a Time" }),
        /* @__PURE__ */ jsx("div", { className: "mt-2 flex flex-wrap gap-2", children: DRAFT_SLOTS.map((s) => {
          const draft = drafts[s];
          const active = s === slot;
          return /* @__PURE__ */ jsxs("div", { className: cn("flex items-center rounded-md border text-sm", active ? "border-ink bg-sheet" : "border-rule hover:border-ink/40"), children: [
            /* @__PURE__ */ jsxs(Link, { to: "/create", search: {
              draft: s
            }, "aria-current": active ? "page" : void 0, className: "flex items-center gap-2 py-2 pr-2 pl-3", children: [
              draft ? null : /* @__PURE__ */ jsx(FilePlus2, { className: "size-4 text-ink-soft" }),
              /* @__PURE__ */ jsx("span", { className: draft ? "font-medium" : "text-ink-soft", children: draft ? draft.name || "Untitled Draft" : `Start Draft ${s}` }),
              draft ? /* @__PURE__ */ jsx("span", { className: "text-xs text-ink-soft", children: savedAgo(draft.updatedAt) }) : null
            ] }),
            draft ? /* @__PURE__ */ jsx("button", { type: "button", onClick: () => discard(s), className: "mr-1 rounded p-1.5 text-ink-soft hover:bg-blush hover:text-rose", "aria-label": `Discard ${draft.name || `draft ${s}`}`, children: /* @__PURE__ */ jsx(Trash2, { className: "size-3.5" }) }) : null
          ] }, s);
        }) })
      ] })
    ] }),
    /* @__PURE__ */ jsx(ResumeEditor, { initial: loaded?.resume ?? emptyResume, identity, disabled: underAge, identityNote: underAge ? /* @__PURE__ */ jsxs(Fragment, { children: [
      "Relationship Resumes are for members ",
      MIN_AGE_RESUME,
      " and over, so publishing is closed on this account."
    ] }) : signedIn && me?.status === "missing" ? /* @__PURE__ */ jsxs(Fragment, { children: [
      "One quick background check before you publish: your name comes from your sign-in account, and you swear to your date of birth and sex once.",
      " ",
      /* @__PURE__ */ jsx(Link, { to: "/verify", search: {
        redirect: `/create?draft=${slot}`
      }, className: "text-rose underline", children: "Complete Your Identity Check" })
    ] }) : void 0, submitLabel: !signedIn ? "Sign In to Publish" : me?.status === "missing" ? "Verify & Publish" : "Publish My Resume", onChange: autosave, onSubmit: async (resume) => {
      const here = `/create?draft=${slot}`;
      if (!signedIn) {
        saveDraft(slot, resume);
        await navigate({
          to: "/login",
          search: {
            redirect: here
          }
        });
        return;
      }
      let slug;
      try {
        ;
        ({
          slug
        } = await createResume({
          data: resume
        }));
      } catch (err) {
        if (err instanceof Error && err.message === MFA_REQUIRED) {
          saveDraft(slot, resume);
          await navigate({
            to: "/login",
            search: {
              mode: "mfa",
              redirect: here
            }
          });
          return;
        }
        if (err instanceof Error && err.message === IDENTITY_REQUIRED) {
          saveDraft(slot, resume);
          await navigate({
            to: "/verify",
            search: {
              redirect: here
            }
          });
          return;
        }
        throw err;
      }
      clearDraft(slot);
      await navigate({
        to: "/r/$slug",
        params: {
          slug
        },
        search: {
          published: true
        }
      });
    } }, loaded ? `${loaded.slot}-${loaded.version}` : "loading")
  ] });
}
export {
  CreatePage as component
};
