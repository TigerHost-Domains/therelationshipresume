import { z } from "zod";
import { N as NAME_STYLES } from "./mfa-DWEh_Kis.js";
const LIMITS = {
  location: 80,
  headline: 120,
  contact: 160,
  /** Objective and Ideal Candidate. */
  paragraph: 600,
  /** How many entries each Qualities & Preferences list holds. */
  listItems: 16,
  /** Characters per Qualities & Preferences entry. */
  listItem: 80,
  /** Experience descriptions and reference quotes. */
  blurb: 300
};
const shortText = (max) => z.string().trim().max(max);
const list = (max = LIMITS.listItems, itemMax = LIMITS.listItem) => z.array(z.string().trim().min(1).max(itemMax)).max(max);
const resumeInputSchema = z.object({
  // Name and age are filled in from the verified identity on file; the server ignores whatever is sent here.
  name: shortText(60),
  age: shortText(10),
  nameStyle: z.enum(NAME_STYLES).catch("first-initial"),
  location: shortText(LIMITS.location),
  headline: shortText(LIMITS.headline),
  objective: shortText(LIMITS.paragraph),
  lookingFor: shortText(LIMITS.paragraph),
  qualities: list(),
  likes: list(),
  dislikes: list(),
  dealbreakers: list(),
  loveLanguages: list(5, 40),
  experience: z.array(
    z.object({
      role: shortText(80).min(1),
      place: shortText(80),
      years: shortText(30),
      description: shortText(LIMITS.blurb)
    })
  ).max(6),
  references: z.array(
    z.object({
      name: shortText(60).min(1),
      relation: shortText(60),
      quote: shortText(LIMITS.blurb).min(1)
    })
  ).max(4),
  contact: shortText(LIMITS.contact),
  accent: z.enum(["rose", "ink", "sage", "marigold"])
});
const ACCENTS = {
  rose: { label: "Rosé", color: "#b3263e" },
  ink: { label: "Ink", color: "#22305e" },
  sage: { label: "Sage", color: "#3f6b4f" },
  marigold: { label: "Marigold", color: "#b8641a" }
};
const LOVE_LANGUAGES = [
  "Words of affirmation",
  "Quality time",
  "Acts of service",
  "Physical touch",
  "Receiving gifts"
];
const emptyResume = {
  name: "",
  age: "",
  nameStyle: "first-initial",
  location: "",
  headline: "",
  objective: "",
  lookingFor: "",
  qualities: [],
  likes: [],
  dislikes: [],
  dealbreakers: [],
  loveLanguages: [],
  experience: [],
  references: [],
  contact: "",
  accent: "rose"
};
const sampleResume = {
  name: "Juniper Hale",
  age: "31",
  nameStyle: "full",
  location: "Portland, OR",
  headline: "Amateur baker, professional overthinker, seeking co-pilot for Sunday markets",
  objective: "To find a kind, curious partner who wants to build a slow, silly, deeply loyal life together — one weekend farmers market at a time.",
  lookingFor: "Someone who reads the plaque at the museum, texts back eventually, and thinks a good argument about pizza toppings is a form of flirting.",
  qualities: ["Loyal to a fault", "Excellent listener", "Remembers birthdays", "Emotionally fluent", "Makes a mean focaccia"],
  likes: ["Rainy bookstore afternoons", "Natural wine", "Long walks with no destination", "Board games", "Handwritten notes", "Old dogs"],
  dislikes: ["Cilantro", "Being late", "Phones at dinner", "Cold coffee"],
  dealbreakers: ["Unkind to waitstaff", "Doesn't like dogs", "Never says sorry"],
  loveLanguages: ["Quality time", "Acts of service"],
  experience: [
    {
      role: "Long-term Partner",
      place: "A 4-year relationship",
      years: "2019 – 2023",
      description: `Learned to communicate before resenting, to split chores fairly, and that "I'm fine" is never the full story. Parted as friends.`
    },
    {
      role: "Plant Parent",
      place: "Seven houseplants, one fern survivor",
      years: "2020 – Present",
      description: "Demonstrated consistent care, patience, and the ability to admit when something needs more light."
    }
  ],
  references: [
    {
      name: "Maya R.",
      relation: "Best friend of 12 years",
      quote: "Juniper is the person you call at 2am. They'll show up with snacks and a plan."
    },
    {
      name: "Mom",
      relation: "Biased, but accurate",
      quote: "Still calls every Sunday. Do not let this one get away."
    }
  ],
  contact: "juniper.hale@example.com",
  accent: "rose"
};
export {
  ACCENTS as A,
  LIMITS as L,
  LOVE_LANGUAGES as a,
  emptyResume as e,
  resumeInputSchema as r,
  sampleResume as s
};
