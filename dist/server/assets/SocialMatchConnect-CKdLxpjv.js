import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Heart, X, ArrowUpRight, Loader2 } from "lucide-react";
import { M as MFA_REQUIRED } from "./identity-DwbvUTDg.js";
import { S as SOCIAL_MATCH_API } from "./social-match-C-j9rk_j.js";
import { c as cn } from "./SiteHeader-I_Xv8yCg.js";
import { k as sendToSocialMatch } from "./router-BxDATaWB.js";
function SocialMatchButton({
  slug,
  className,
  compact,
  returnTo
}) {
  const [open, setOpen] = useState(false);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        className: cn(compact ? "inline-flex items-center gap-1 text-ink-soft hover:text-ink" : "btn-ghost", className),
        onClick: () => setOpen(true),
        children: [
          /* @__PURE__ */ jsx(Heart, { className: compact ? "size-3.5" : "size-4" }),
          " Add to Social Match"
        ]
      }
    ),
    open ? /* @__PURE__ */ jsx(SocialMatchDialog, { slug, returnTo: returnTo ?? `/r/${slug}`, onClose: () => setOpen(false) }) : null
  ] });
}
function SocialMatchDialog({ slug, returnTo, onClose }) {
  const navigate = useNavigate();
  const dialog = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState();
  const [joinUrl, setJoinUrl] = useState();
  useEffect(() => {
    dialog.current?.showModal();
    fetch(`${SOCIAL_MATCH_API}/api/auth/providers`, { mode: "no-cors" }).catch(() => {
    });
  }, []);
  const send = async () => {
    setBusy(true);
    setError(void 0);
    try {
      const res = await sendToSocialMatch({ data: { slug } });
      if (res.ok) {
        setJoinUrl(res.joinUrl);
        window.location.assign(res.joinUrl);
      } else {
        setError(res.error);
      }
    } catch (err) {
      if (err instanceof Error && err.message === MFA_REQUIRED) {
        await navigate({ to: "/login", search: { mode: "mfa", redirect: returnTo } });
        return;
      }
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ jsx(
    "dialog",
    {
      ref: dialog,
      onClose,
      onClick: (e) => e.target === dialog.current && dialog.current?.close(),
      className: "no-print m-auto w-[min(28rem,calc(100vw-2rem))] rounded-lg border border-rule bg-sheet p-0 text-ink shadow-2xl backdrop:bg-ink/40 backdrop:backdrop-blur-[2px]",
      children: /* @__PURE__ */ jsxs("div", { className: "relative p-6 sm:p-7", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: () => dialog.current?.close(),
            className: "absolute top-4 right-4 rounded-full p-1.5 text-ink-soft hover:bg-blush",
            "aria-label": "Close",
            children: /* @__PURE__ */ jsx(X, { className: "size-4" })
          }
        ),
        /* @__PURE__ */ jsx("p", { className: "label text-rose", children: "Cross-Posting" }),
        joinUrl ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("h2", { className: "mt-2 font-display text-3xl", children: "Application Forwarded." }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-ink-soft", children: "Taking you to The Social Match Game to finish the interview. If nothing happens, use the button below." }),
          /* @__PURE__ */ jsxs("a", { href: joinUrl, className: "btn-primary mt-6 w-full", children: [
            "Continue to The Social Match Game ",
            /* @__PURE__ */ jsx(ArrowUpRight, { className: "size-4" })
          ] })
        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("h2", { className: "mt-2 font-display text-3xl", children: "Send to The Social Match Game" }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-ink-soft", children: "We'll hand your resume and your verified name, date of birth and sex to The Social Match Game, then send you over to finish the paperwork:" }),
          /* @__PURE__ */ jsxs("ol", { className: "mt-3 grid list-decimal gap-1 pl-5 text-sm text-ink-soft", children: [
            /* @__PURE__ */ jsx("li", { children: "Sign in there with the same Google or GitHub account you use here — they check it matches." }),
            /* @__PURE__ */ jsx("li", { children: "Confirm you're 21 or older and accept their policies." }),
            /* @__PURE__ */ jsx("li", { children: "Your resume is pinned to your profile automatically." })
          ] }),
          error ? /* @__PURE__ */ jsx("p", { role: "alert", className: "mt-4 text-sm text-rose", children: error }) : null,
          /* @__PURE__ */ jsxs("button", { type: "button", className: "btn-primary mt-6 w-full", onClick: send, disabled: busy, children: [
            busy ? /* @__PURE__ */ jsx(Loader2, { className: "size-4 animate-spin" }) : /* @__PURE__ */ jsx(Heart, { className: "size-4" }),
            busy ? "Forwarding Your Application…" : "Send My Resume"
          ] }),
          busy ? /* @__PURE__ */ jsx("p", { className: "mt-2 text-center text-xs text-ink-soft", children: "The Social Match Game can take up to a minute to wake up after a quiet spell." }) : /* @__PURE__ */ jsx("p", { className: "mt-2 text-center text-xs text-ink-soft", children: "The invite is good for a week, and no passwords change hands." })
        ] })
      ] })
    }
  );
}
export {
  SocialMatchButton as S
};
