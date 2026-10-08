import { z } from 'zod'
import { NAME_STYLES, type Sex, type SocialProvider } from '@/lib/member'

const shortText = (max: number) => z.string().trim().max(max)
const list = (max: number, itemMax = 80) =>
  z.array(z.string().trim().min(1).max(itemMax)).max(max)

export const resumeInputSchema = z.object({
  // Name and age are filled in from the verified identity on file; the server ignores whatever is sent here.
  name: shortText(60),
  age: shortText(10),
  nameStyle: z.enum(NAME_STYLES).catch('first-initial'),
  location: shortText(80),
  headline: shortText(120),
  objective: shortText(600),
  lookingFor: shortText(400),
  qualities: list(12),
  likes: list(16),
  dislikes: list(16),
  dealbreakers: list(10),
  loveLanguages: list(5, 40),
  experience: z
    .array(
      z.object({
        role: shortText(80).min(1),
        place: shortText(80),
        years: shortText(30),
        description: shortText(300),
      }),
    )
    .max(6),
  references: z
    .array(
      z.object({
        name: shortText(60).min(1),
        relation: shortText(60),
        quote: shortText(300).min(1),
      }),
    )
    .max(4),
  contact: shortText(160),
  accent: z.enum(['rose', 'ink', 'sage', 'marigold']),
})

export type ResumeInput = z.infer<typeof resumeInputSchema>
export type Resume = ResumeInput & {
  slug: string
  createdAt: string
  /** From the owner's identity on file; null for older resumes whose owner hasn't completed the check. */
  sex: Sex | null
  verifiedVia: SocialProvider | null
}

export const ACCENTS: Record<ResumeInput['accent'], { label: string; color: string }> = {
  rose: { label: 'Rosé', color: '#b3263e' },
  ink: { label: 'Ink', color: '#22305e' },
  sage: { label: 'Sage', color: '#3f6b4f' },
  marigold: { label: 'Marigold', color: '#b8641a' },
}

export const LOVE_LANGUAGES = [
  'Words of affirmation',
  'Quality time',
  'Acts of service',
  'Physical touch',
  'Receiving gifts',
]

export const emptyResume: ResumeInput = {
  name: '',
  age: '',
  nameStyle: 'first-initial',
  location: '',
  headline: '',
  objective: '',
  lookingFor: '',
  qualities: [],
  likes: [],
  dislikes: [],
  dealbreakers: [],
  loveLanguages: [],
  experience: [],
  references: [],
  contact: '',
  accent: 'rose',
}

// Sample shown on the landing page and offered as a starting point in the builder.
export const sampleResume: ResumeInput = {
  name: 'Juniper Hale',
  age: '31',
  nameStyle: 'full',
  location: 'Portland, OR',
  headline: 'Amateur baker, professional overthinker, seeking co-pilot for Sunday markets',
  objective:
    'To find a kind, curious partner who wants to build a slow, silly, deeply loyal life together — one weekend farmers market at a time.',
  lookingFor:
    'Someone who reads the plaque at the museum, texts back eventually, and thinks a good argument about pizza toppings is a form of flirting.',
  qualities: ['Loyal to a fault', 'Excellent listener', 'Remembers birthdays', 'Emotionally fluent', 'Makes a mean focaccia'],
  likes: ['Rainy bookstore afternoons', 'Natural wine', 'Long walks with no destination', 'Board games', 'Handwritten notes', 'Old dogs'],
  dislikes: ['Cilantro', 'Being late', 'Phones at dinner', 'Cold coffee'],
  dealbreakers: ['Unkind to waitstaff', "Doesn't like dogs", 'Never says sorry'],
  loveLanguages: ['Quality time', 'Acts of service'],
  experience: [
    {
      role: 'Long-term Partner',
      place: 'A 4-year relationship',
      years: '2019 – 2023',
      description:
        'Learned to communicate before resenting, to split chores fairly, and that "I\'m fine" is never the full story. Parted as friends.',
    },
    {
      role: 'Plant Parent',
      place: 'Seven houseplants, one fern survivor',
      years: '2020 – Present',
      description: 'Demonstrated consistent care, patience, and the ability to admit when something needs more light.',
    },
  ],
  references: [
    {
      name: 'Maya R.',
      relation: 'Best friend of 12 years',
      quote: "Juniper is the person you call at 2am. They'll show up with snacks and a plan.",
    },
    {
      name: 'Mom',
      relation: 'Biased, but accurate',
      quote: 'Still calls every Sunday. Do not let this one get away.',
    },
  ],
  contact: 'juniper.hale@example.com',
  accent: 'rose',
}
