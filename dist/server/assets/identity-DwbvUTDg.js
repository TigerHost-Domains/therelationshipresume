import { a as createMiddleware } from "../server.js";
import { getUser } from "@netlify/identity";
import { S as SOCIAL_SIGN_IN_REQUIRED, m as mfaState, k as socialProviderOf } from "./mfa-DWEh_Kis.js";
const MFA_REQUIRED = "Two-factor verification required.";
async function socialUser() {
  const user = await getUser() ?? null;
  if (!user) return { user: null, retired: false };
  return socialProviderOf(user) ? { user, retired: false } : { user: null, retired: true };
}
const identityMiddleware = createMiddleware().server(async ({ next }) => {
  const { user } = await socialUser();
  return next({ context: { user } });
});
const requireSignInMiddleware = createMiddleware().server(async ({ next }) => {
  const { user, retired } = await socialUser();
  if (!user) throw new Error(retired ? SOCIAL_SIGN_IN_REQUIRED : "Please sign in to continue.");
  return next({ context: { user } });
});
const requireAuthMiddleware = createMiddleware().server(async ({ next }) => {
  const { user, retired } = await socialUser();
  if (!user) throw new Error(retired ? SOCIAL_SIGN_IN_REQUIRED : "Please sign in to continue.");
  const mfa = await mfaState(user.id);
  if (!mfa.verified) throw new Error(MFA_REQUIRED);
  return next({ context: { user } });
});
export {
  MFA_REQUIRED as M,
  requireAuthMiddleware as a,
  identityMiddleware as i,
  requireSignInMiddleware as r
};
