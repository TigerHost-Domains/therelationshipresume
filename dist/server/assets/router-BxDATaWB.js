import { createRootRoute, HeadContent, Scripts, createFileRoute, lazyRouteComponent, redirect, notFound, createRouter } from "@tanstack/react-router";
import { jsx, Fragment, jsxs } from "react/jsx-runtime";
import { useEffect, useState, createContext, useContext } from "react";
import { handleAuthCallback, getUser, onAuthChange, logout } from "@netlify/identity";
import { T as TSS_SERVER_FUNCTION, g as getServerFnById, c as createServerFn } from "../server.js";
import { z } from "zod";
import { i as identityMiddleware, r as requireSignInMiddleware, a as requireAuthMiddleware } from "./identity-DwbvUTDg.js";
import { i as identityInputSchema } from "./mfa-DWEh_Kis.js";
import { r as resumeInputSchema } from "./resume-CLkl9H33.js";
var createSsrRpc = (functionId) => {
  const url = "/_serverFn/" + functionId;
  const serverFnMeta = { id: functionId };
  const fn = async (...args) => {
    return (await getServerFnById(functionId))(...args);
  };
  return Object.assign(fn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
const getServerUser = createServerFn({
  method: "GET"
}).handler(createSsrRpc("49106938b52c8bf2e7795ac418917757130e43844a341613882f98c174227919"));
async function nextStepAfterSignIn(redirect2) {
  const user = await getServerUser();
  if (!user) return null;
  const back = encodeURIComponent(redirect2);
  if (user.mfaPending) return `/login?mode=mfa&redirect=${back}`;
  if (user.identity === "missing") return `/verify?redirect=${back}`;
  return redirect2;
}
const OAUTH_REDIRECT_KEY = "relationship-resume:oauth-redirect";
const AUTH_HASH_PATTERN = /^#(confirmation_token|recovery_token|invite_token|email_change_token|access_token)=/;
async function finishSocialSignIn() {
  const stored = window.sessionStorage.getItem(OAUTH_REDIRECT_KEY);
  window.sessionStorage.removeItem(OAUTH_REDIRECT_KEY);
  const redirect2 = stored && /^\/(?!\/)/.test(stored) ? stored : "/";
  const next = await nextStepAfterSignIn(redirect2) ?? "/login";
  if (next !== window.location.pathname + window.location.search) window.location.assign(next);
}
function CallbackHandler({ children }) {
  useEffect(() => {
    if (!AUTH_HASH_PATTERN.test(window.location.hash)) return;
    if (!window.location.hash.startsWith("#access_token=")) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
      window.location.assign("/login");
      return;
    }
    handleAuthCallback().then((result) => {
      if (result?.type === "oauth") return finishSocialSignIn();
    }).catch(() => {
    });
  }, []);
  return /* @__PURE__ */ jsx(Fragment, { children });
}
const codeInput = z.object({
  code: z.string().regex(/^\s*\d{3}\s?\d{3}\s*$/, "Enter the 6-digit code.")
});
const getMfaStatus = createServerFn({
  method: "GET"
}).middleware([identityMiddleware]).handler(createSsrRpc("1d7260af46ee4b747c72a4e1609b88398e53457c88cc597746f69ad8ea60941f"));
const startMfaSetup = createServerFn({
  method: "POST"
}).middleware([requireSignInMiddleware]).handler(createSsrRpc("5d5e29c5e8d28924550dca071dda6deab560fed3a333c54bddedefdf2c271921"));
const confirmMfaSetup = createServerFn({
  method: "POST"
}).middleware([requireSignInMiddleware]).inputValidator(codeInput).handler(createSsrRpc("52e94b6cf2afb1cdefdfd0dd85fd0d54a1a680ad51a45a6f561c1c82ebab572e"));
const verifyMfa = createServerFn({
  method: "POST"
}).middleware([requireSignInMiddleware]).inputValidator(codeInput).handler(createSsrRpc("235a37bca34da7e78f607716dd21e5ad982fef73252b4484c0158523fa8da5db"));
const disableMfa = createServerFn({
  method: "POST"
}).middleware([requireSignInMiddleware]).inputValidator(codeInput).handler(createSsrRpc("b84c4546e609d137558ee1e0c18b6e311efdf476c61dfc7313548e25450d3910"));
const endMfaSession = createServerFn({
  method: "POST"
}).handler(createSsrRpc("f89b33be52cee6122199993091904eba0cfedf2e362f3f3652edf7773de46614"));
const IdentityContext = createContext(null);
function IdentityProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    getUser().then((u) => {
      setUser(u ?? null);
      setReady(true);
    });
    return onAuthChange((_event, u) => setUser(u ?? null));
  }, []);
  const logout$1 = async () => {
    await endMfaSession().catch(() => {
    });
    await logout();
  };
  return /* @__PURE__ */ jsx(IdentityContext.Provider, { value: { user, ready, logout: logout$1 }, children });
}
function useIdentity() {
  const ctx = useContext(IdentityContext);
  if (!ctx) throw new Error("useIdentity must be used within an IdentityProvider");
  return ctx;
}
const siteName = "The Relationship Resume";
const siteDescription = "Build a one-page resume for your love life — your qualities, likes, dislikes, dealbreakers and references — and share it with someone worth meeting.";
const Route$7 = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: siteName },
      { name: "description", content: siteDescription },
      { property: "og:title", content: siteName },
      { property: "og:description", content: siteDescription },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" }
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..800;1,9..144,300..700&family=IBM+Plex+Mono:wght@400;500&family=Instrument+Sans:wght@400..700&display=swap"
      },
      { rel: "icon", href: "/favicon.ico" }
    ]
  }),
  shellComponent: RootDocument
});
function RootDocument({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxs("body", { className: "grain min-h-screen", children: [
      /* @__PURE__ */ jsx(IdentityProvider, { children: /* @__PURE__ */ jsx(CallbackHandler, { children }) }),
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
const $$splitComponentImporter$6 = () => import("./index-DD3fUM6w.js");
const Route$6 = createFileRoute("/")({
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const getMyIdentity = createServerFn({
  method: "GET"
}).middleware([requireSignInMiddleware]).handler(createSsrRpc("9c2f77572ad60d31a23e34a959b34a6873d7baf274743fc07c5588fb83d5f1f8"));
const submitIdentity = createServerFn({
  method: "POST"
}).middleware([requireAuthMiddleware]).inputValidator(identityInputSchema).handler(createSsrRpc("d30c38c4a115b52d82d85894ad1b82b63262bb9f19bbe363fad265c0a97f7635"));
const getResume = createServerFn({
  method: "GET"
}).inputValidator(z.object({
  slug: z.string().min(1).max(60)
})).handler(createSsrRpc("54a68125e5f762cbe731cd6992c5e8d8e61d6e25a492390513ed256f9f19a42f"));
const createResume = createServerFn({
  method: "POST"
}).middleware([requireAuthMiddleware]).inputValidator(resumeInputSchema).handler(createSsrRpc("8b916d9325d5aa8fb91d66dafb2383ef3abb599e4de818e9c51c521f6817c0f7"));
const slugInput = z.string().min(1).max(60);
const openResumeForEditing = createServerFn({
  method: "POST"
}).middleware([requireAuthMiddleware]).inputValidator(z.object({
  slug: slugInput,
  editToken: z.string().max(64).optional()
})).handler(createSsrRpc("fad0a2752dff549dc95771c1f7c040a35ba4a9c2b8aa57c285db4f6a91919eda"));
const updateResume = createServerFn({
  method: "POST"
}).middleware([requireAuthMiddleware]).inputValidator(z.object({
  slug: slugInput,
  resume: resumeInputSchema
})).handler(createSsrRpc("26612a0a5d42a315747d45b4781fd2d6066e7ba0f6a13451e784604f3c26cf50"));
const updateEditors = createServerFn({
  method: "POST"
}).middleware([requireAuthMiddleware]).inputValidator(z.object({
  slug: slugInput,
  emails: z.array(z.email().max(254)).max(20)
})).handler(createSsrRpc("52969441072aa7fff7648f39f784918e2cb2ae38214fa152894f156c6d1fcc14"));
const getEditAccess = createServerFn({
  method: "GET"
}).middleware([identityMiddleware]).inputValidator(z.object({
  slug: slugInput
})).handler(createSsrRpc("2a1b86c197518a91f412a30013ec467a63184e4e600d0f0a57e6ae40084241c2"));
const listMyResumes = createServerFn({
  method: "GET"
}).middleware([requireSignInMiddleware]).handler(createSsrRpc("c4d680e62f771c38faac16ace2293d0420c17e86ab417bfa47844203ef3f9e19"));
const sendToSocialMatch = createServerFn({
  method: "POST"
}).middleware([requireAuthMiddleware]).inputValidator(z.object({
  slug: slugInput
})).handler(createSsrRpc("5d52de2e542e85c8322a26c7a89c80d32b9eb229e40e5cd0d02e91835759eda3"));
const $$splitComponentImporter$5 = () => import("./account-Da5pSfIl.js");
const Route$5 = createFileRoute("/account")({
  beforeLoad: async ({
    location
  }) => {
    const user = await getServerUser();
    if (!user) throw redirect({
      to: "/login",
      search: {
        redirect: location.href
      }
    });
    return {
      user
    };
  },
  loader: async () => {
    const [status, myResumes, identity] = await Promise.all([getMfaStatus(), listMyResumes(), getMyIdentity()]);
    return {
      status,
      myResumes,
      identity
    };
  },
  head: () => ({
    meta: [{
      title: "Your Account · The Relationship Resume"
    }, {
      name: "robots",
      content: "noindex"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./create-AOPI7iRX.js");
const Route$4 = createFileRoute("/create")({
  validateSearch: z.object({
    draft: z.union([z.literal(1), z.literal(2)]).optional().catch(void 0)
  }),
  head: () => ({
    meta: [{
      title: "Write Your Relationship Resume"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./login-rdYlrfXf.js");
const modes = ["signin", "mfa"];
const Route$3 = createFileRoute("/login")({
  validateSearch: z.object({
    // Old links (?mode=signup, reset, invite…) fall back to the sign-in screen.
    mode: z.enum(modes).optional().catch(void 0),
    // Only same-site paths, so the redirect can't be used to bounce people elsewhere.
    redirect: z.string().regex(/^\/(?!\/)/).optional().catch(void 0)
  }),
  head: () => ({
    meta: [{
      title: "Sign In · The Relationship Resume"
    }, {
      name: "robots",
      content: "noindex"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./verify-CmcjT6Un.js");
const Route$2 = createFileRoute("/verify")({
  validateSearch: z.object({
    redirect: z.string().regex(/^\/(?!\/)/).optional().catch(void 0)
  }),
  beforeLoad: async ({
    location
  }) => {
    const user = await getServerUser();
    if (!user) throw redirect({
      to: "/login",
      search: {
        redirect: location.href
      }
    });
    if (user.mfaPending) throw redirect({
      to: "/login",
      search: {
        mode: "mfa",
        redirect: location.href
      }
    });
  },
  loader: () => getMyIdentity(),
  head: () => ({
    meta: [{
      title: "Identity Check · The Relationship Resume"
    }, {
      name: "robots",
      content: "noindex"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./index-8IKTk9L2.js");
const $$splitNotFoundComponentImporter = () => import("./index-B9Bab1IN.js");
const Route$1 = createFileRoute("/r/$slug/")({
  validateSearch: z.object({
    published: z.boolean().optional()
  }),
  loader: async ({
    params
  }) => {
    const resume = await getResume({
      data: {
        slug: params.slug
      }
    });
    if (!resume) throw notFound();
    return resume;
  },
  head: ({
    loaderData
  }) => ({
    meta: loaderData ? [{
      title: `${loaderData.name} — Relationship Resume`
    }, {
      name: "description",
      content: loaderData.headline || loaderData.objective.slice(0, 150)
    }, {
      property: "og:title",
      content: `${loaderData.name}'s Relationship Resume`
    }, {
      property: "og:description",
      content: loaderData.headline || loaderData.objective.slice(0, 150)
    }] : []
  }),
  notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter, "notFoundComponent"),
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./edit-B6qROOsM.js");
const Route = createFileRoute("/r/$slug/edit")({
  validateSearch: z.object({
    key: z.string().optional()
  }),
  beforeLoad: async ({
    location
  }) => {
    const user = await getServerUser();
    if (!user) throw redirect({
      to: "/login",
      search: {
        redirect: location.href
      }
    });
    if (user.mfaPending) throw redirect({
      to: "/login",
      search: {
        mode: "mfa",
        redirect: location.href
      }
    });
    if (user.identity !== "verified") throw redirect({
      to: "/verify",
      search: {
        redirect: location.href
      }
    });
    return {
      user
    };
  },
  loaderDeps: ({
    search
  }) => ({
    key: search.key
  }),
  loader: ({
    params,
    deps
  }) => openResumeForEditing({
    data: {
      slug: params.slug,
      editToken: deps.key
    }
  }),
  head: () => ({
    meta: [{
      title: "Edit Your Relationship Resume"
    }, {
      name: "robots",
      content: "noindex"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const IndexRoute = Route$6.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$7
});
const AccountRoute = Route$5.update({
  id: "/account",
  path: "/account",
  getParentRoute: () => Route$7
});
const CreateRoute = Route$4.update({
  id: "/create",
  path: "/create",
  getParentRoute: () => Route$7
});
const LoginRoute = Route$3.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => Route$7
});
const VerifyRoute = Route$2.update({
  id: "/verify",
  path: "/verify",
  getParentRoute: () => Route$7
});
const RSlugIndexRoute = Route$1.update({
  id: "/r/$slug/",
  path: "/r/$slug/",
  getParentRoute: () => Route$7
});
const RSlugEditRoute = Route.update({
  id: "/r/$slug/edit",
  path: "/r/$slug/edit",
  getParentRoute: () => Route$7
});
const rootRouteChildren = {
  IndexRoute,
  AccountRoute,
  CreateRoute,
  LoginRoute,
  VerifyRoute,
  RSlugEditRoute,
  RSlugIndexRoute
};
const routeTree = Route$7._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const router2 = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  OAUTH_REDIRECT_KEY as O,
  Route$5 as R,
  Route$4 as a,
  createResume as b,
  confirmMfaSetup as c,
  disableMfa as d,
  Route$3 as e,
  Route$2 as f,
  getMyIdentity as g,
  submitIdentity as h,
  Route$1 as i,
  getEditAccess as j,
  sendToSocialMatch as k,
  Route as l,
  updateResume as m,
  nextStepAfterSignIn as n,
  updateEditors as o,
  router as r,
  startMfaSetup as s,
  useIdentity as u,
  verifyMfa as v
};
