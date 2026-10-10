import { jsxs, jsx } from "react/jsx-runtime";
import { BadgeCheck } from "lucide-react";
import { q as SEXES, P as PROVIDER_LABELS } from "./mfa-DWEh_Kis.js";
function IdentityOnFile({ identity }) {
  const rows = [
    ["Name", identity.legalName],
    ["Age", identity.age !== null ? String(identity.age) : null],
    ["Sex", identity.sex ? SEXES[identity.sex] : null],
    ["Signed In With", PROVIDER_LABELS[identity.provider]],
    ["Sworn On", identity.attestedAt ? new Date(identity.attestedAt).toLocaleDateString() : null]
  ];
  return /* @__PURE__ */ jsxs("div", { className: "sheet mt-6 rounded-lg p-6", children: [
    /* @__PURE__ */ jsxs("p", { className: "flex items-center gap-2 text-sm text-ink-soft", children: [
      /* @__PURE__ */ jsx(BadgeCheck, { className: "size-4 text-rose" }),
      " Locked. Contact The Relationship Resume if something needs correcting."
    ] }),
    /* @__PURE__ */ jsx("dl", { className: "mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm", children: rows.map(
      ([label, value]) => value ? /* @__PURE__ */ jsxs("div", { className: "contents", children: [
        /* @__PURE__ */ jsx("dt", { className: "label text-ink-soft", children: label }),
        /* @__PURE__ */ jsx("dd", { children: value })
      ] }, label) : null
    ) })
  ] });
}
export {
  IdentityOnFile as I
};
