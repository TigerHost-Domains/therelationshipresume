import { eq } from "drizzle-orm";
import { I as IDENTITY_REQUIRED, d as db, f as memberProfiles, l as ageOn } from "./mfa-DWEh_Kis.js";
async function getProfile(userId) {
  const [row] = await db.select().from(memberProfiles).where(eq(memberProfiles.userId, userId)).limit(1);
  return row;
}
function statusOf(row) {
  if (!row) return "missing";
  if (row.refusedAt) return "refused";
  return row.legalName && row.birthDate && row.sex ? "verified" : "missing";
}
function identityOf(row) {
  if (statusOf(row) !== "verified" || !row) return null;
  return {
    legalName: row.legalName,
    age: ageOn(row.birthDate),
    sex: row.sex,
    provider: row.provider
  };
}
async function requireIdentity(user, minAge) {
  const row = await getProfile(user.id);
  const status = statusOf(row);
  if (status === "refused") throw new Error("Relationship Resumes are for members 18 and over.");
  const identity = identityOf(row);
  if (!identity) throw new Error(IDENTITY_REQUIRED);
  if (identity.age < minAge) throw new Error(`This is open to members ${minAge} and over.`);
  return identity;
}
export {
  getProfile as g,
  identityOf as i,
  requireIdentity as r,
  statusOf as s
};
