import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { u as useIdentity } from "./router-BxDATaWB.js";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
function Monogram({ className = "" }) {
  return /* @__PURE__ */ jsx(
    "span",
    {
      className: cn(
        "inline-grid size-8 place-items-center rounded-full border border-rose/40 font-display text-[0.95rem] italic text-rose",
        className
      ),
      "aria-hidden": true,
      children: "R♥"
    }
  );
}
function SiteHeader({ tone = "light" }) {
  const { user, ready, logout } = useIdentity();
  const navLink = tone === "dark" ? "whitespace-nowrap px-2 py-2 text-sm text-smoke transition hover:text-cream sm:px-3" : "whitespace-nowrap px-2 py-2 text-sm text-ink-soft hover:text-ink sm:px-3";
  return /* @__PURE__ */ jsxs("header", { className: "no-print relative z-10 mx-auto flex max-w-site items-center justify-between gap-3 px-4 py-5 sm:px-6 lg:px-10 lg:py-7", children: [
    /* @__PURE__ */ jsxs(Link, { to: "/", className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx(Monogram, { className: tone === "dark" ? "border-gold/50 text-gold-bright" : "" }),
      /* @__PURE__ */ jsxs("span", { className: "font-display text-base leading-tight tracking-tight sm:text-lg", children: [
        "The Relationship ",
        /* @__PURE__ */ jsx("em", { className: tone === "dark" ? "text-gold-bright" : "text-rose", children: "Resume" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("nav", { className: "flex items-center gap-1 sm:gap-2", children: [
      /* @__PURE__ */ jsx(Link, { to: "/", hash: "example", className: `hidden sm:inline ${navLink}`, children: "See an Example" }),
      ready && (user ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Link, { to: "/account", className: navLink, children: "Account" }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => void logout(),
            className: `hidden sm:inline ${navLink}`,
            title: user.email,
            children: "Sign Out"
          }
        )
      ] }) : /* @__PURE__ */ jsx(Link, { to: "/login", className: navLink, children: "Sign In" })),
      /* @__PURE__ */ jsx(Link, { to: "/create", className: "btn-primary whitespace-nowrap px-4 sm:px-5", children: "Write Yours" })
    ] })
  ] });
}
function SiteFooter({ tone = "light" }) {
  return /* @__PURE__ */ jsx(
    "footer",
    {
      className: `no-print relative z-10 mx-auto max-w-site border-t px-6 py-8 text-sm lg:px-10 ${tone === "dark" ? "border-ember text-smoke" : "mt-24 border-rule text-ink-soft"}`,
      children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col justify-between gap-2 sm:flex-row", children: [
        /* @__PURE__ */ jsx("span", { className: "font-display italic", children: "References available upon request." }),
        /* @__PURE__ */ jsx("span", { className: "label", children: "The Relationship Resume · Est. 2026" })
      ] })
    }
  );
}
export {
  SiteHeader as S,
  SiteFooter as a,
  cn as c
};
