import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { Heart, ArrowRight, PenLine, Quote, Send, KeyRound, Users, ShieldCheck, ArrowUpRight } from "lucide-react";
import { R as ResumeSheet } from "./ResumeSheet-nKMr6oSe.js";
import { S as SiteHeader, a as SiteFooter } from "./SiteHeader-I_Xv8yCg.js";
import { s as sampleResume } from "./resume-CLkl9H33.js";
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
import "react";
import "@tanstack/react-router/ssr/server";
import "./router-BxDATaWB.js";
import "@netlify/identity";
import "./identity-DwbvUTDg.js";
import "clsx";
import "tailwind-merge";
const COMPANION_URL = "https://socialmatchapp.onrender.com/";
const STEPS = [{
  no: "01",
  tag: "Write",
  icon: PenLine,
  title: "Fill in the Page",
  body: "Qualities, likes, dislikes, dealbreakers and love languages, plus “experience” in the field. It typesets as you type."
}, {
  no: "02",
  tag: "Vouch",
  icon: Quote,
  title: "Collect References",
  body: "Quotes from the people who know you best. Your ex-roommate, your sister, the barista who’s seen it all."
}, {
  no: "03",
  tag: "Send",
  icon: Send,
  title: "Share One Link",
  body: "Drop it in your dating profile, your bio, or hand it to the friend who swears they know someone perfect."
}];
const SECTIONS = ["Objective", "Ideal Candidate", "Core Qualities", "Likes", "Dislikes", "Dealbreakers", "Love Languages", "Relevant Experience", "References"];
const PHOTOS = [{
  src: "/images/black-love/field-embrace.jpg",
  alt: "A Black couple embracing in a sunlit field, the man resting his head on the woman’s arm",
  tag: "Exhibit A · Long-Term Position",
  credit: {
    name: "Ricardo Esquivel",
    url: "https://unsplash.com/photos/O8i3pW1leYs"
  },
  className: "col-span-2 row-span-2 lg:col-span-5 lg:row-span-4"
}, {
  src: "/images/black-love/forehead-kiss.jpg",
  alt: "A Black man kissing his partner’s forehead outdoors on a bright day",
  tag: "References: Glowing",
  credit: {
    name: "LaShawn Dobbs",
    url: "https://unsplash.com/photos/Qx-jCqiTezY"
  },
  className: "col-span-2 lg:col-span-4 lg:row-span-2"
}, {
  src: "/images/black-love/after-dark.jpg",
  alt: "A Black couple posing together in black tank tops against a dark backdrop",
  tag: "Culture Fit: Perfect",
  credit: {
    name: "MONIQUE BEN",
    url: "https://unsplash.com/photos/gW_uUms6Rrw"
  },
  className: "lg:col-span-3 lg:row-span-2 [&_img]:object-top"
}, {
  src: "/images/black-love/hands-on-heart.jpg",
  alt: "A woman’s hands, wearing an engagement ring, resting on the chest of a Black man in a tuxedo",
  tag: "Tenure: For Life",
  credit: {
    name: "Clay Banks",
    url: "https://unsplash.com/photos/_3Sud4WPPYE"
  },
  className: "lg:col-span-3 lg:row-span-2"
}, {
  src: "/images/black-love/close-embrace.jpg",
  alt: "A Black couple holding each other close, about to kiss",
  tag: "Mutual Offer Accepted",
  credit: {
    name: "One zone Studio",
    url: "https://unsplash.com/photos/9B4hD5joEk4"
  },
  className: "col-span-2 lg:col-span-4 lg:row-span-2"
}];
const ghostDark = "btn border border-cream/20 text-cream hover:border-gold hover:text-gold-bright focus-visible:outline-2 focus-visible:outline-gold";
function Landing() {
  return /* @__PURE__ */ jsxs("div", { className: "after-hours relative min-h-screen overflow-hidden", children: [
    /* @__PURE__ */ jsx("div", { className: "film-grain", "aria-hidden": true }),
    /* @__PURE__ */ jsx(SiteHeader, { tone: "dark" }),
    /* @__PURE__ */ jsxs("main", { className: "relative z-[2]", children: [
      /* @__PURE__ */ jsx(Hero, {}),
      /* @__PURE__ */ jsx(Marquee, {}),
      /* @__PURE__ */ jsx(OnTheRecord, {}),
      /* @__PURE__ */ jsx(HowItWorks, {}),
      /* @__PURE__ */ jsx(Lounge, {}),
      /* @__PURE__ */ jsx(Example, {}),
      /* @__PURE__ */ jsx(Companion, {}),
      /* @__PURE__ */ jsx(Closing, {})
    ] }),
    /* @__PURE__ */ jsx(SiteFooter, { tone: "dark" })
  ] });
}
function Hero() {
  return /* @__PURE__ */ jsxs("section", { className: "mx-auto grid max-w-site items-center gap-16 px-6 pt-8 pb-24 lg:grid-cols-[1.1fr_1fr] lg:px-10 lg:pt-14 xl:gap-24 xl:pb-32", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("p", { className: "label inline-flex animate-in items-center gap-2 rounded-full border border-gold/30 bg-velvet/70 px-3 py-1.5 text-gold-bright fade-in fill-mode-both duration-700", children: [
        /* @__PURE__ */ jsx(Heart, { className: "size-3 animate-pulse-heart fill-rose text-rose motion-safe-only" }),
        "Now Accepting Applications"
      ] }),
      /* @__PURE__ */ jsxs("h1", { className: "mt-7 animate-in font-display text-[3.4rem] leading-[0.92] font-medium tracking-tight fade-in slide-in-from-bottom-4 fill-mode-both delay-100 duration-700 sm:text-[5.5rem] xl:text-[6.5rem] 2xl:text-[7.25rem]", children: [
        "We’re Here to Find ",
        /* @__PURE__ */ jsx("em", { className: "gold-foil pr-2 font-semibold", children: "Love," }),
        /* @__PURE__ */ jsx("span", { className: "block text-rose italic", children: "Baby." })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mt-7 max-w-[34rem] animate-in text-lg leading-relaxed text-smoke xl:text-xl xl:leading-relaxed fade-in slide-in-from-bottom-3 fill-mode-both delay-200 duration-700", children: "Dating profiles show what you look like. A Relationship Resume shows what it’s like to love you: what you adore, what you won’t tolerate, and why you’re worth the second date. One page, one link." }),
      /* @__PURE__ */ jsxs("div", { className: "mt-9 flex animate-in flex-wrap items-center gap-3 fade-in slide-in-from-bottom-3 fill-mode-both delay-300 duration-700", children: [
        /* @__PURE__ */ jsxs(Link, { to: "/create", className: "btn-primary px-7 py-3.5 text-base shadow-[0_10px_40px_-10px_rgba(179,38,62,0.9)]", children: [
          "Write Your Resume ",
          /* @__PURE__ */ jsx(ArrowRight, { className: "size-4" })
        ] }),
        /* @__PURE__ */ jsx("a", { href: "#example", className: `${ghostDark} px-7 py-3.5 text-base`, children: "Read an Example" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "label mt-8 animate-in text-smoke/80 fade-in fill-mode-both delay-500 duration-700", children: "Free · Sign In with Google or GitHub · ID-Checked Members · Only You Hold the Pen" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "relative mx-auto w-full max-w-md animate-in fade-in zoom-in-95 fill-mode-both delay-200 duration-1000 lg:max-w-none", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 translate-x-6 translate-y-5 rotate-[5deg] rounded-sm bg-velvet-soft", "aria-hidden": true }),
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 -translate-x-4 translate-y-3 -rotate-[4deg] rounded-sm bg-cream/80", "aria-hidden": true }),
      /* @__PURE__ */ jsxs("div", { className: "relative max-h-[540px] animate-drift xl:max-h-[640px] overflow-hidden rounded-sm shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)] motion-safe-only [--tilt:-1.5deg]", children: [
        /* @__PURE__ */ jsx(ResumeSheet, { resume: sampleResume, compact: true }),
        /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-sheet to-transparent" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "absolute -bottom-7 -left-5 grid size-28 rotate-[-12deg] place-items-center rounded-full bg-rose text-center shadow-[0_12px_30px_-8px_rgba(0,0,0,0.8)] ring-4 ring-gold/70 ring-offset-4 ring-offset-night sm:-left-10", children: /* @__PURE__ */ jsxs("span", { className: "font-display text-xl leading-none text-cream italic", children: [
        "Hired",
        /* @__PURE__ */ jsx(Heart, { className: "mx-auto mt-1 size-4 fill-cream" })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "absolute -top-5 -right-3 flex rotate-[3deg] items-center gap-3 rounded-xl border border-gold/25 bg-velvet/95 px-4 py-3 shadow-2xl backdrop-blur sm:-right-8", children: [
        /* @__PURE__ */ jsx("span", { className: "grid size-9 place-items-center rounded-full bg-rose/15", children: /* @__PURE__ */ jsx(Heart, { className: "size-4 fill-rose text-rose" }) }),
        /* @__PURE__ */ jsxs("span", { className: "text-sm leading-tight", children: [
          /* @__PURE__ */ jsx("span", { className: "block font-display text-base text-cream", children: "It’s a Match." }),
          /* @__PURE__ */ jsx("span", { className: "text-smoke", children: "References checked out." })
        ] })
      ] })
    ] })
  ] });
}
function Marquee() {
  const row = [...SECTIONS, ...SECTIONS];
  return /* @__PURE__ */ jsx("section", { className: "border-y border-ember bg-velvet/60", "aria-label": "Sections on every resume", children: /* @__PURE__ */ jsx("div", { className: "overflow-hidden py-4 [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]", children: /* @__PURE__ */ jsx("div", { className: "flex w-max animate-marquee gap-10 motion-safe-only", children: row.map((s, i) => /* @__PURE__ */ jsxs("span", { className: "label flex items-center gap-10 whitespace-nowrap text-gold", "aria-hidden": i >= SECTIONS.length, children: [
    s,
    /* @__PURE__ */ jsx(Heart, { className: "size-2.5 fill-rose/70 text-rose/70" })
  ] }, i)) }) }) });
}
function OnTheRecord() {
  return /* @__PURE__ */ jsxs("section", { className: "mx-auto max-w-site px-6 pt-28 lg:px-10 xl:pt-36", "aria-labelledby": "on-the-record", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-end", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "label text-gold", children: "Proof of Concept" }),
        /* @__PURE__ */ jsxs("h2", { id: "on-the-record", className: "mt-4 font-display text-4xl leading-[1.02] tracking-tight sm:text-6xl xl:text-7xl", children: [
          "Black Love, ",
          /* @__PURE__ */ jsx("em", { className: "gold-foil", children: "on the Record." })
        ] })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "max-w-md text-lg leading-relaxed text-smoke lg:justify-self-end", children: "Tender, joyful, and built to last. Here’s to the partnerships with a track record worth putting on paper, and to yours being next." })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-14 grid auto-rows-[170px] grid-cols-2 gap-4 sm:auto-rows-[220px] lg:auto-rows-[150px] lg:grid-cols-12 lg:gap-5 xl:auto-rows-[185px] 2xl:auto-rows-[215px]", children: PHOTOS.map(({
      src,
      alt,
      tag,
      className
    }) => /* @__PURE__ */ jsxs("figure", { className: `group relative overflow-hidden rounded-2xl border border-ember bg-velvet ${className}`, children: [
      /* @__PURE__ */ jsx("img", { src, alt, loading: "lazy", decoding: "async", className: "size-full object-cover transition duration-700 motion-safe:group-hover:scale-[1.04]" }),
      /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute inset-0 bg-gradient-to-t from-night/85 via-night/10 to-transparent", "aria-hidden": true }),
      /* @__PURE__ */ jsx("figcaption", { className: "label absolute bottom-3 left-3 rounded-full border border-gold/30 bg-night/70 px-3 py-1.5 text-gold-bright backdrop-blur sm:bottom-4 sm:left-4", children: tag })
    ] }, src)) }),
    /* @__PURE__ */ jsxs("p", { className: "mt-5 text-xs text-smoke/70", children: [
      "Photos by",
      " ",
      PHOTOS.map(({
        credit
      }, i) => /* @__PURE__ */ jsxs("span", { children: [
        /* @__PURE__ */ jsx("a", { href: credit.url, target: "_blank", rel: "noopener noreferrer", className: "underline-offset-2 hover:text-gold-bright hover:underline", children: credit.name }),
        i < PHOTOS.length - 2 ? ", " : i === PHOTOS.length - 2 ? " and " : ""
      ] }, credit.url)),
      " ",
      "on Unsplash."
    ] })
  ] });
}
function HowItWorks() {
  return /* @__PURE__ */ jsxs("section", { className: "mx-auto max-w-site px-6 py-28 lg:px-10 xl:py-36", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid gap-6 lg:grid-cols-[1fr_1.2fr] lg:items-end", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "label text-gold", children: "How It Works" }),
        /* @__PURE__ */ jsxs("h2", { className: "mt-4 font-display text-4xl leading-[1.02] tracking-tight sm:text-6xl xl:text-7xl", children: [
          "Skip the Small Talk. ",
          /* @__PURE__ */ jsx("em", { className: "text-rose", children: "Send the Summary." })
        ] })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "max-w-md text-lg leading-relaxed text-smoke lg:justify-self-end", children: "Five minutes from blank page to a beautifully set, one-page case for why you’re a catch." })
    ] }),
    /* @__PURE__ */ jsx("ol", { className: "mt-16 grid gap-5 md:grid-cols-3 xl:gap-7", children: STEPS.map(({
      no,
      tag,
      icon: Icon,
      title,
      body
    }, i) => /* @__PURE__ */ jsxs("li", { className: `group relative rounded-2xl border border-ember bg-velvet/80 p-7 transition duration-300 hover:-translate-y-1 hover:border-gold/50 xl:p-9 ${i === 1 ? "md:translate-y-10 md:hover:translate-y-9" : ""}`, children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("span", { className: "label text-gold", children: [
          no,
          " / ",
          tag
        ] }),
        /* @__PURE__ */ jsx(Icon, { className: "size-5 text-smoke transition group-hover:text-gold-bright" })
      ] }),
      /* @__PURE__ */ jsx("span", { className: "mt-6 block font-display text-7xl leading-none text-cream/10 transition group-hover:text-rose/40", children: no }),
      /* @__PURE__ */ jsx("h3", { className: "mt-2 font-display text-2xl text-cream xl:text-[1.75rem]", children: title }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 leading-relaxed text-smoke", children: body })
    ] }, no)) })
  ] });
}
function Lounge() {
  return /* @__PURE__ */ jsxs("section", { className: "mx-auto max-w-site px-6 pt-10 pb-28 lg:px-10 xl:pb-36", children: [
    /* @__PURE__ */ jsx("p", { className: "label text-gold", children: "The Members’ Lounge" }),
    /* @__PURE__ */ jsxs("h2", { className: "mt-4 max-w-3xl font-display text-4xl leading-[1.02] tracking-tight sm:text-5xl xl:text-6xl", children: [
      "Your Love Life, ",
      /* @__PURE__ */ jsx("em", { className: "gold-foil", children: "Under Lock and Key." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-14 grid gap-5 md:grid-cols-6 xl:gap-7", children: [
      /* @__PURE__ */ jsxs("article", { className: "relative overflow-hidden rounded-2xl border border-ember bg-gradient-to-br from-velvet-soft to-velvet p-8 xl:p-10 md:col-span-4", children: [
        /* @__PURE__ */ jsx(KeyRound, { className: "size-6 text-gold-bright" }),
        /* @__PURE__ */ jsx("h3", { className: "mt-5 font-display text-3xl text-cream", children: "Only You Hold the Pen." }),
        /* @__PURE__ */ jsx("p", { className: "mt-3 max-w-md leading-relaxed text-smoke", children: "Your resume is tied to your account. Anyone can read it; nobody can rewrite it. Revise it from any device whenever your dealbreakers evolve." }),
        /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute -right-10 -bottom-12 font-display text-[11rem] leading-none text-cream/[0.04] italic", "aria-hidden": true, children: "♥" })
      ] }),
      /* @__PURE__ */ jsxs("article", { className: "rounded-2xl border border-rose/30 bg-rose/10 p-8 xl:p-10 md:col-span-2", children: [
        /* @__PURE__ */ jsx(Users, { className: "size-6 text-rose" }),
        /* @__PURE__ */ jsx("h3", { className: "mt-5 font-display text-2xl text-cream", children: "Bring a Wingperson." }),
        /* @__PURE__ */ jsx("p", { className: "mt-3 leading-relaxed text-smoke", children: "Add your best friend as a co-editor. They know your best angles better than you do." })
      ] }),
      /* @__PURE__ */ jsxs("article", { className: "rounded-2xl border border-ember bg-velvet/80 p-8 xl:p-10 md:col-span-3", children: [
        /* @__PURE__ */ jsx(ShieldCheck, { className: "size-6 text-gold-bright" }),
        /* @__PURE__ */ jsx("h3", { className: "mt-5 font-display text-2xl text-cream", children: "A Second Reference Check." }),
        /* @__PURE__ */ jsx("p", { className: "mt-3 leading-relaxed text-smoke", children: "Turn on an authenticator app and every edit needs a 6-digit code. Heartbreak-proof, or at least hijack-proof." })
      ] }),
      /* @__PURE__ */ jsxs("article", { className: "rounded-2xl border border-ember bg-velvet/80 p-8 xl:p-10 md:col-span-3", children: [
        /* @__PURE__ */ jsx("p", { className: "label text-gold", children: "Sign In Your Way" }),
        /* @__PURE__ */ jsx("h3", { className: "mt-4 font-display text-2xl text-cream", children: "One Tap and You’re on the List." }),
        /* @__PURE__ */ jsx("div", { className: "mt-6 flex flex-wrap gap-2", children: ["Google", "GitHub"].map((p) => /* @__PURE__ */ jsx("span", { className: "rounded-full border border-cream/15 px-4 py-1.5 text-sm text-cream", children: p }, p)) })
      ] })
    ] })
  ] });
}
function Example() {
  return /* @__PURE__ */ jsxs("section", { id: "example", className: "relative scroll-mt-6 bg-paper py-28 text-ink xl:py-36", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent", "aria-hidden": true }),
    /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-page px-4 sm:px-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "label text-rose", children: "Example Application" }),
          /* @__PURE__ */ jsxs("h2", { className: "mt-3 font-display text-4xl tracking-tight sm:text-6xl xl:text-7xl", children: [
            "Meet Juniper. ",
            /* @__PURE__ */ jsx("em", { className: "text-rose", children: "Very Employable." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Link, { to: "/create", className: "btn shrink-0 bg-ink text-cream hover:bg-rose", children: [
          "Start from Scratch ",
          /* @__PURE__ */ jsx(ArrowRight, { className: "size-4" })
        ] })
      ] }),
      /* @__PURE__ */ jsx(ResumeSheet, { resume: sampleResume })
    ] })
  ] });
}
function Companion() {
  return /* @__PURE__ */ jsx("section", { className: "mx-auto max-w-site px-6 py-28 lg:px-10 xl:py-36", children: /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-br from-velvet-soft via-velvet to-night p-10 sm:p-14 xl:p-20", children: [
    /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-gold/10 blur-3xl", "aria-hidden": true }),
    /* @__PURE__ */ jsxs("div", { className: "relative grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-center", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "label text-gold", children: "A Companion to The Social Match Game" }),
        /* @__PURE__ */ jsxs("h2", { className: "mt-4 font-display text-4xl leading-[1.02] tracking-tight sm:text-5xl xl:text-6xl", children: [
          "Found Your People? ",
          /* @__PURE__ */ jsx("em", { className: "text-rose", children: "Now Send Your Resume." })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-5 max-w-xl text-lg leading-relaxed text-smoke", children: "The Social Match Game is where you meet the community and the details that make each member themselves. The Relationship Resume is the follow-up: the one page that tells your match what a second date would actually be like." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 lg:items-end", children: [
        /* @__PURE__ */ jsxs("a", { href: COMPANION_URL, target: "_blank", rel: "noopener noreferrer", className: "btn bg-gold px-7 py-3.5 text-base text-night hover:bg-gold-bright", children: [
          "Play The Social Match Game ",
          /* @__PURE__ */ jsx(ArrowUpRight, { className: "size-4" })
        ] }),
        /* @__PURE__ */ jsx(Link, { to: "/create", className: `${ghostDark} px-7 py-3.5 text-base`, children: "Write Your Resume First" })
      ] })
    ] })
  ] }) });
}
function Closing() {
  return /* @__PURE__ */ jsxs("section", { className: "mx-auto max-w-4xl px-6 pt-6 pb-32 text-center xl:max-w-5xl xl:pb-40", children: [
    /* @__PURE__ */ jsx(Heart, { className: "mx-auto size-8 animate-pulse-heart fill-rose text-rose motion-safe-only" }),
    /* @__PURE__ */ jsxs("p", { className: "mt-8 font-display text-3xl leading-snug italic sm:text-[2.6rem] xl:text-[3.25rem] xl:leading-[1.2]", children: [
      "“The position of ",
      /* @__PURE__ */ jsx("span", { className: "gold-foil not-italic", children: "great love" }),
      " is open. Applications close when you stop looking.”"
    ] }),
    /* @__PURE__ */ jsxs(Link, { to: "/create", className: "btn-primary mt-12 px-8 py-4 text-base shadow-[0_10px_40px_-10px_rgba(179,38,62,0.9)]", children: [
      "Write Yours in Five Minutes ",
      /* @__PURE__ */ jsx(ArrowRight, { className: "size-4" })
    ] })
  ] });
}
export {
  Landing as component
};
