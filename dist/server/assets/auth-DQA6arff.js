import { c as createServerRpc } from "./createServerRpc-D_-6bKnO.js";
import { c as createServerFn } from "../server.js";
import { getUser } from "@netlify/identity";
import { k as socialProviderOf, m as mfaState } from "./mfa-DWEh_Kis.js";
import { g as getProfile, s as statusOf } from "./members-DV04sj37.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "seroval";
import "@tanstack/history";
import "react";
import "@tanstack/react-router";
import "react/jsx-runtime";
import "@tanstack/react-router/ssr/server";
import "zod";
import "node:crypto";
import "drizzle-orm";
import "otpauth";
import "drizzle-orm/netlify-db";
import "drizzle-orm/pg-core";
const getServerUser_createServerFn_handler = createServerRpc({
  id: "49106938b52c8bf2e7795ac418917757130e43844a341613882f98c174227919",
  name: "getServerUser",
  filename: "src/lib/auth.ts"
}, (opts) => getServerUser.__executeServer(opts));
const getServerUser = createServerFn({
  method: "GET"
}).handler(getServerUser_createServerFn_handler, async () => {
  const user = await getUser();
  if (!user || !socialProviderOf(user)) return null;
  const [mfa, profile] = await Promise.all([mfaState(user.id), getProfile(user.id)]);
  return {
    id: user.id,
    email: user.email ?? null,
    name: user.name ?? null,
    mfaPending: !mfa.verified,
    identity: statusOf(profile)
  };
});
export {
  getServerUser_createServerFn_handler
};
