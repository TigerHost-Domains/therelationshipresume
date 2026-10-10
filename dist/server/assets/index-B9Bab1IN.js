import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { S as SiteHeader } from "./SiteHeader-I_Xv8yCg.js";
import "./router-BxDATaWB.js";
import "react";
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
import "./mfa-DWEh_Kis.js";
import "node:crypto";
import "drizzle-orm";
import "otpauth";
import "drizzle-orm/netlify-db";
import "drizzle-orm/pg-core";
import "./resume-CLkl9H33.js";
import "clsx";
import "tailwind-merge";
function NotFound() {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(SiteHeader, {}),
    /* @__PURE__ */ jsxs("main", { className: "mx-auto max-w-xl px-6 py-24 text-center", children: [
      /* @__PURE__ */ jsx("p", { className: "label text-rose", children: "Position Filled?" }),
      /* @__PURE__ */ jsx("h1", { className: "mt-3 font-display text-4xl", children: "We Couldn't Find That Resume." }),
      /* @__PURE__ */ jsx("p", { className: "mt-3 text-ink-soft", children: "The link may be mistyped, or the page may have been removed." }),
      /* @__PURE__ */ jsx(Link, { to: "/create", className: "btn-primary mt-8", children: "Write Your Own" })
    ] })
  ] });
}
export {
  NotFound as notFoundComponent
};
