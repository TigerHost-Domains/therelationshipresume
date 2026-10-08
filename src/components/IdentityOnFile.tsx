import { BadgeCheck } from 'lucide-react'
import { PROVIDER_LABELS, SEXES } from '@/lib/member'
import type { getMyIdentity } from '@/server/members.functions'

type Identity = Awaited<ReturnType<typeof getMyIdentity>>

/** The locked identity summary, also shown on the account page. */
export function IdentityOnFile({ identity }: { identity: Identity }) {
  const rows = [
    ['Name', identity.legalName],
    ['Age', identity.age !== null ? String(identity.age) : null],
    ['Sex', identity.sex ? SEXES[identity.sex] : null],
    ['Signed In With', PROVIDER_LABELS[identity.provider]],
    ['Sworn On', identity.attestedAt ? new Date(identity.attestedAt).toLocaleDateString() : null],
  ] as const
  return (
    <div className="sheet mt-6 rounded-lg p-6">
      <p className="flex items-center gap-2 text-sm text-ink-soft">
        <BadgeCheck className="size-4 text-rose" /> Locked. Contact The Relationship Resume if something needs
        correcting.
      </p>
      <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
        {rows.map(([label, value]) =>
          value ? (
            <div key={label} className="contents">
              <dt className="label text-ink-soft">{label}</dt>
              <dd>{value}</dd>
            </div>
          ) : null,
        )}
      </dl>
    </div>
  )
}

