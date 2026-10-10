import { c as createServerRpc } from "./createServerRpc-D_-6bKnO.js";
import { c as createServerFn } from "../server.js";
import { eq } from "drizzle-orm";
import QRCode from "qrcode";
import { z } from "zod";
import { m as mfaState, g as getMfaRow, n as newSecret, d as db, a as memberMfa, t as totpFor, c as checkCode, s as startMfaSession, e as endMfaSessions, b as endCurrentMfaSession } from "./mfa-DWEh_Kis.js";
import { i as identityMiddleware, r as requireSignInMiddleware } from "./identity-DwbvUTDg.js";
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
import "node:crypto";
import "otpauth";
import "drizzle-orm/netlify-db";
import "drizzle-orm/pg-core";
import "@netlify/identity";
const codeInput = z.object({
  code: z.string().regex(/^\s*\d{3}\s?\d{3}\s*$/, "Enter the 6-digit code.")
});
const getMfaStatus_createServerFn_handler = createServerRpc({
  id: "1d7260af46ee4b747c72a4e1609b88398e53457c88cc597746f69ad8ea60941f",
  name: "getMfaStatus",
  filename: "src/server/mfa.functions.ts"
}, (opts) => getMfaStatus.__executeServer(opts));
const getMfaStatus = createServerFn({
  method: "GET"
}).middleware([identityMiddleware]).handler(getMfaStatus_createServerFn_handler, async ({
  context
}) => {
  if (!context.user) return {
    signedIn: false,
    enabled: false,
    verified: false
  };
  return {
    signedIn: true,
    ...await mfaState(context.user.id)
  };
});
const startMfaSetup_createServerFn_handler = createServerRpc({
  id: "5d5e29c5e8d28924550dca071dda6deab560fed3a333c54bddedefdf2c271921",
  name: "startMfaSetup",
  filename: "src/server/mfa.functions.ts"
}, (opts) => startMfaSetup.__executeServer(opts));
const startMfaSetup = createServerFn({
  method: "POST"
}).middleware([requireSignInMiddleware]).handler(startMfaSetup_createServerFn_handler, async ({
  context
}) => {
  const existing = await getMfaRow(context.user.id);
  if (existing?.enabled) throw new Error("Two-factor authentication is already on.");
  const secret = newSecret();
  await db.insert(memberMfa).values({
    userId: context.user.id,
    secret
  }).onConflictDoUpdate({
    target: memberMfa.userId,
    set: {
      secret,
      lastStep: 0,
      failedAttempts: 0,
      lockedUntil: null,
      updatedAt: /* @__PURE__ */ new Date()
    }
  });
  const uri = totpFor(secret, context.user.email ?? context.user.id).toString();
  return {
    secret,
    qr: await QRCode.toDataURL(uri, {
      margin: 1,
      width: 220
    })
  };
});
const confirmMfaSetup_createServerFn_handler = createServerRpc({
  id: "52e94b6cf2afb1cdefdfd0dd85fd0d54a1a680ad51a45a6f561c1c82ebab572e",
  name: "confirmMfaSetup",
  filename: "src/server/mfa.functions.ts"
}, (opts) => confirmMfaSetup.__executeServer(opts));
const confirmMfaSetup = createServerFn({
  method: "POST"
}).middleware([requireSignInMiddleware]).inputValidator(codeInput).handler(confirmMfaSetup_createServerFn_handler, async ({
  data,
  context
}) => {
  await checkCode(context.user.id, data.code);
  await db.update(memberMfa).set({
    enabled: true,
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq(memberMfa.userId, context.user.id));
  await startMfaSession(context.user.id);
  return {
    enabled: true
  };
});
const verifyMfa_createServerFn_handler = createServerRpc({
  id: "235a37bca34da7e78f607716dd21e5ad982fef73252b4484c0158523fa8da5db",
  name: "verifyMfa",
  filename: "src/server/mfa.functions.ts"
}, (opts) => verifyMfa.__executeServer(opts));
const verifyMfa = createServerFn({
  method: "POST"
}).middleware([requireSignInMiddleware]).inputValidator(codeInput).handler(verifyMfa_createServerFn_handler, async ({
  data,
  context
}) => {
  const row = await getMfaRow(context.user.id);
  if (!row?.enabled) return {
    verified: true
  };
  await checkCode(context.user.id, data.code);
  await startMfaSession(context.user.id);
  return {
    verified: true
  };
});
const disableMfa_createServerFn_handler = createServerRpc({
  id: "b84c4546e609d137558ee1e0c18b6e311efdf476c61dfc7313548e25450d3910",
  name: "disableMfa",
  filename: "src/server/mfa.functions.ts"
}, (opts) => disableMfa.__executeServer(opts));
const disableMfa = createServerFn({
  method: "POST"
}).middleware([requireSignInMiddleware]).inputValidator(codeInput).handler(disableMfa_createServerFn_handler, async ({
  data,
  context
}) => {
  await checkCode(context.user.id, data.code);
  await db.delete(memberMfa).where(eq(memberMfa.userId, context.user.id));
  await endMfaSessions(context.user.id);
  return {
    enabled: false
  };
});
const endMfaSession_createServerFn_handler = createServerRpc({
  id: "f89b33be52cee6122199993091904eba0cfedf2e362f3f3652edf7773de46614",
  name: "endMfaSession",
  filename: "src/server/mfa.functions.ts"
}, (opts) => endMfaSession.__executeServer(opts));
const endMfaSession = createServerFn({
  method: "POST"
}).handler(endMfaSession_createServerFn_handler, async () => {
  await endCurrentMfaSession();
  return {
    ok: true
  };
});
export {
  confirmMfaSetup_createServerFn_handler,
  disableMfa_createServerFn_handler,
  endMfaSession_createServerFn_handler,
  getMfaStatus_createServerFn_handler,
  startMfaSetup_createServerFn_handler,
  verifyMfa_createServerFn_handler
};
