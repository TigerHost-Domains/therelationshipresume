import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { R as ResumeEditor } from "./ResumeEditor-B7PsGzR1.js";
import { S as SiteHeader } from "./SiteHeader-I_Xv8yCg.js";
import { r as resumeInputSchema } from "./resume-CLkl9H33.js";
import { l as Route, m as updateResume, o as updateEditors } from "./router-BxDATaWB.js";
import "./ResumeSheet-nKMr6oSe.js";
import "./mfa-DWEh_Kis.js";
import "zod";
import "node:crypto";
import "drizzle-orm";
import "otpauth";
import "drizzle-orm/netlify-db";
import "drizzle-orm/pg-core";
import "../server.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "seroval";
import "@tanstack/history";
import "@tanstack/react-router/ssr/server";
import "clsx";
import "tailwind-merge";
import "@netlify/identity";
import "./identity-DwbvUTDg.js";
function EditPage() {
  const result = Route.useLoaderData();
  const {
    slug
  } = Route.useParams();
  const navigate = useNavigate();
  if (result.status !== "ok") {
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(SiteHeader, {}),
      /* @__PURE__ */ jsxs("main", { className: "mx-auto max-w-xl px-6 py-24 text-center", children: [
        /* @__PURE__ */ jsx("p", { className: "label text-rose", children: result.status === "missing" ? "Position Filled?" : "Access Denied" }),
        /* @__PURE__ */ jsx("h1", { className: "mt-3 font-display text-4xl", children: result.status === "missing" ? "We Couldn't Find That Resume." : "This Resume Isn't Yours to Edit." }),
        /* @__PURE__ */ jsx("p", { className: "mt-3 text-ink-soft", children: result.status === "missing" ? "The link may be mistyped, or the page may have been removed." : "Only its owner and the members they've added as co-editors can make changes. Signed in with a different account?" }),
        /* @__PURE__ */ jsx(Link, { to: "/r/$slug", params: {
          slug
        }, className: "btn-ghost mt-8", children: "View the Resume" })
      ] })
    ] });
  }
  const initial = resumeInputSchema.parse(result.resume);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(SiteHeader, {}),
    /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-studio px-4 pt-6 pb-8 sm:px-6 lg:px-10 lg:pt-8 lg:pb-10", children: [
      /* @__PURE__ */ jsx("p", { className: "label text-rose", children: "Revisions" }),
      /* @__PURE__ */ jsx("h1", { className: "mt-2 font-display text-4xl font-medium tracking-tight sm:text-5xl xl:text-6xl", children: "Update Your Resume" }),
      result.canManage ? /* @__PURE__ */ jsx(CoEditors, { slug, initial: result.editors }) : null
    ] }),
    /* @__PURE__ */ jsx(ResumeEditor, { initial, identity: result.identity, identityNote: "This resume's owner hasn't completed the identity check yet, so its name and age stay as they were.", submitLabel: "Save Changes", onSubmit: async (next) => {
      await updateResume({
        data: {
          slug,
          resume: next
        }
      });
      await navigate({
        to: "/r/$slug",
        params: {
          slug
        }
      });
    } })
  ] });
}
function CoEditors({
  slug,
  initial
}) {
  const [editors, setEditors] = useState(initial);
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function save(next) {
    setPending(true);
    setError("");
    try {
      const res = await updateEditors({
        data: {
          slug,
          emails: next
        }
      });
      setEditors(res.editors);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't update co-editors.");
      return false;
    } finally {
      setPending(false);
    }
  }
  async function add(e) {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (!value || editors.includes(value)) return setEmail("");
    if (await save([...editors, value])) setEmail("");
  }
  return /* @__PURE__ */ jsxs("details", { className: "no-print mt-5 max-w-xl rounded-lg border border-rule bg-sheet/60 p-4", children: [
    /* @__PURE__ */ jsxs("summary", { className: "cursor-pointer text-sm", children: [
      /* @__PURE__ */ jsx("span", { className: "label text-ink-soft", children: "Co-Editors" }),
      " ",
      /* @__PURE__ */ jsxs("span", { className: "text-ink-soft", children: [
        "· ",
        editors.length ? `${editors.length} trusted ${editors.length === 1 ? "friend" : "friends"}` : "just you"
      ] })
    ] }),
    /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm text-ink-soft", children: "Add a member's email to let them edit this resume when they're signed in. Your wingperson, your best friend, your mum. Choose wisely." }),
    /* @__PURE__ */ jsxs("form", { onSubmit: add, className: "mt-3 flex gap-2", children: [
      /* @__PURE__ */ jsx("input", { className: "field", type: "email", required: true, placeholder: "friend@example.com", value: email, onChange: (e) => setEmail(e.target.value) }),
      /* @__PURE__ */ jsx("button", { type: "submit", className: "btn-ghost shrink-0", disabled: pending, children: "Add" })
    ] }),
    error ? /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-rose", children: error }) : null,
    editors.length ? /* @__PURE__ */ jsx("ul", { className: "mt-3 flex flex-wrap gap-2", children: editors.map((e) => /* @__PURE__ */ jsxs("li", { className: "inline-flex items-center gap-1 rounded-full border border-rule bg-sheet py-1 pr-1 pl-3 text-sm", children: [
      e,
      /* @__PURE__ */ jsx("button", { type: "button", "aria-label": `Remove ${e}`, disabled: pending, onClick: () => void save(editors.filter((x) => x !== e)), className: "rounded-full p-1 text-ink-soft hover:bg-blush hover:text-ink", children: /* @__PURE__ */ jsx(X, { className: "size-3.5" }) })
    ] }, e)) }) : null
  ] });
}
export {
  EditPage as component
};
