import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Check, Copy, Printer, PenLine } from "lucide-react";
import { R as ResumeSheet } from "./ResumeSheet-nKMr6oSe.js";
import { S as SiteHeader, a as SiteFooter } from "./SiteHeader-I_Xv8yCg.js";
import { S as SocialMatchButton } from "./SocialMatchConnect-CKdLxpjv.js";
import { i as Route, u as useIdentity, j as getEditAccess } from "./router-BxDATaWB.js";
import { M as MIN_AGE_SOCIAL_MATCH } from "./mfa-DWEh_Kis.js";
import "./resume-CLkl9H33.js";
import "zod";
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
import "node:crypto";
import "drizzle-orm";
import "otpauth";
import "drizzle-orm/netlify-db";
import "drizzle-orm/pg-core";
const STORAGE_KEY = "relationship-resume:edit-keys";
function read() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}
function getEditKey(slug) {
  return read()[slug];
}
function useCopy() {
  const [copied, setCopied] = useState(null);
  const copy = async (id, text) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1800);
  };
  return {
    copied,
    copy
  };
}
function ResumePage() {
  const resume = Route.useLoaderData();
  const {
    published
  } = Route.useSearch();
  const {
    slug
  } = Route.useParams();
  const {
    user,
    ready
  } = useIdentity();
  const [canEdit, setCanEdit] = useState(false);
  const [social, setSocial] = useState({
    isOwner: false,
    canSend: false
  });
  const [claimKey, setClaimKey] = useState();
  const [origin, setOrigin] = useState("");
  const {
    copied,
    copy
  } = useCopy();
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);
  useEffect(() => {
    if (!ready) return;
    let live = true;
    const key = getEditKey(slug);
    if (!user) {
      setCanEdit(false);
      setSocial({
        isOwner: false,
        canSend: false
      });
      setClaimKey(key);
      return;
    }
    getEditAccess({
      data: {
        slug
      }
    }).then((access) => {
      if (!live) return;
      setCanEdit(access.canEdit);
      setSocial({
        isOwner: access.isOwner,
        canSend: access.canSendToSocialMatch
      });
      setClaimKey(access.unowned ? key : void 0);
    }).catch(() => {
    });
    return () => {
      live = false;
    };
  }, [ready, user, slug]);
  const shareUrl = `${origin}/r/${slug}`;
  const showEdit = canEdit || !!claimKey;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(SiteHeader, {}),
    /* @__PURE__ */ jsxs("main", { className: "mx-auto max-w-page px-4 sm:px-6", children: [
      published ? /* @__PURE__ */ jsxs("div", { className: "no-print mb-8 rounded-lg border border-rose/25 bg-blush/50 p-5 sm:p-6", children: [
        /* @__PURE__ */ jsx("p", { className: "font-display text-2xl", children: "Your Resume Is Live. 💌" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-ink-soft", children: "Share the public link anywhere. It's tied to your account, so sign in from any device to make revisions or add co-editors." }),
        /* @__PURE__ */ jsx("div", { className: "mt-4 grid gap-3 sm:grid-cols-2", children: [{
          id: "share",
          label: "Public Link",
          value: shareUrl
        }].map((row) => /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("span", { className: "label text-ink-soft", children: row.label }),
          /* @__PURE__ */ jsxs("div", { className: "mt-1 flex items-center gap-2 rounded-md border border-rule bg-sheet py-1.5 pr-1.5 pl-3", children: [
            /* @__PURE__ */ jsx("span", { className: "flex-1 truncate font-mono text-xs", children: row.value }),
            /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => copy(row.id, row.value), className: "inline-flex items-center gap-1 rounded px-2 py-1 text-xs hover:bg-blush", children: [
              copied === row.id ? /* @__PURE__ */ jsx(Check, { className: "size-3.5" }) : /* @__PURE__ */ jsx(Copy, { className: "size-3.5" }),
              copied === row.id ? "Copied" : "Copy"
            ] })
          ] })
        ] }, row.id)) }),
        social.isOwner ? /* @__PURE__ */ jsxs("div", { className: "mt-5 flex flex-wrap items-center gap-3 border-t border-rose/20 pt-4", children: [
          /* @__PURE__ */ jsx("p", { className: "flex-1 text-sm text-ink-soft", children: social.canSend ? "On The Social Match Game? Pin this resume to your profile so matches can read the full application." : `The Social Match Game is open to members ${MIN_AGE_SOCIAL_MATCH} and over — your resume can join you there then.` }),
          social.canSend ? /* @__PURE__ */ jsx(SocialMatchButton, { slug, className: "bg-sheet" }) : null
        ] }) : null
      ] }) : null,
      /* @__PURE__ */ jsxs("div", { className: "no-print mb-4 flex flex-wrap items-center justify-end gap-2", children: [
        /* @__PURE__ */ jsxs("button", { type: "button", className: "btn-ghost", onClick: () => copy("share", shareUrl), children: [
          copied === "share" ? /* @__PURE__ */ jsx(Check, { className: "size-4" }) : /* @__PURE__ */ jsx(Copy, { className: "size-4" }),
          copied === "share" ? "Link Copied" : "Copy Link"
        ] }),
        /* @__PURE__ */ jsxs("button", { type: "button", className: "btn-ghost", onClick: () => window.print(), children: [
          /* @__PURE__ */ jsx(Printer, { className: "size-4" }),
          " Print"
        ] }),
        social.canSend ? /* @__PURE__ */ jsx(SocialMatchButton, { slug }) : null,
        showEdit ? /* @__PURE__ */ jsxs(Link, { to: "/r/$slug/edit", params: {
          slug
        }, search: {
          key: claimKey
        }, className: "btn-ghost", children: [
          /* @__PURE__ */ jsx(PenLine, { className: "size-4" }),
          " Edit"
        ] }) : null
      ] }),
      /* @__PURE__ */ jsx(ResumeSheet, { resume }),
      !showEdit ? /* @__PURE__ */ jsxs("div", { className: "no-print mt-12 text-center", children: [
        /* @__PURE__ */ jsx("p", { className: "font-display text-2xl italic", children: "Looking for Love Too?" }),
        /* @__PURE__ */ jsx(Link, { to: "/create", className: "btn-primary mt-4", children: "Write Your Own Relationship Resume" })
      ] }) : null
    ] }),
    /* @__PURE__ */ jsx(SiteFooter, {})
  ] });
}
export {
  ResumePage as component
};
