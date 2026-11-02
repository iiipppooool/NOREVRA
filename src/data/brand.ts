/**
 * NOREVRA — brand & business single source of truth.
 *
 * Nothing in this file should be duplicated into a component. Addresses,
 * lead times, tax treatment, social handles and legal entity details are
 * read from here so a change lands everywhere at once.
 */

export const brand = {
  name: "Norevra",
  wordmark: "NOREVRA",
  legalEntity: "Norevra S.r.l.",
  founded: 1998,

  /** One line, used in metadata and the footer. Not a slogan. */
  descriptor: "Contemporary furniture, made in Brianza.",

  /** Long-form positioning, used on Our Story and in structured data. */
  summary:
    "Norevra designs and makes furniture for considered interiors. Each piece is drawn in Milan and built by hand in our workshop in Brianza, from stone, solid timber and woven cloth chosen for how they age.",

  domain: "norevra.com",
  url: "https://norevra.com",

  email: {
    general: "studio@norevra.com",
    trade: "trade@norevra.com",
    press: "press@norevra.com",
    care: "care@norevra.com",
  },

  telephone: {
    display: "+39 0362 554 180",
    href: "+390362554180",
  },

  locations: [
    {
      id: "milan",
      label: "Showroom",
      city: "Milan",
      lines: ["Via Cesare Correnti 14", "20123 Milano", "Italy"],
      hours: ["Monday – Friday, 10.00 – 19.00", "Saturday by appointment"],
      note: "Appointments preferred. Our team will set aside the hour.",
    },
    {
      id: "brianza",
      label: "Workshop",
      city: "Meda",
      lines: ["Via dei Gelsi 7", "20821 Meda MB", "Italy"],
      hours: ["Visits by arrangement"],
      note: "Where every piece is assembled, upholstered and finished.",
    },
    {
      id: "london",
      label: "Representation",
      city: "London",
      lines: ["Studio 4, 18 Charlotte Road", "London EC2A 3PB", "United Kingdom"],
      hours: ["Monday – Friday, 09.00 – 18.00"],
      note: "Specification support for UK and Ireland projects.",
    },
  ],

  social: [
    { label: "Instagram", handle: "@norevra", href: "https://www.instagram.com/" },
    { label: "Pinterest", handle: "norevra", href: "https://www.pinterest.com/" },
    { label: "LinkedIn", handle: "Norevra", href: "https://www.linkedin.com/" },
  ],

  /** Commerce configuration. Read by the cart, product pages and checkout. */
  commerce: {
    currency: "EUR" as const,
    locale: "en-GB",
    /** Prices in the catalogue are stated inclusive of this rate. */
    taxRate: 0.22,
    taxLabel: "IVA",
    taxNote: "Prices include Italian IVA at 22%. Export orders are adjusted at checkout.",
    freeDeliveryThreshold: 250000, // minor units — €2,500
    deliveryTiers: [
      { region: "Italy", lead: "6 – 9 weeks", cost: "Included" },
      { region: "European Union", lead: "8 – 12 weeks", cost: "Quoted on order" },
      { region: "United Kingdom & Switzerland", lead: "9 – 13 weeks", cost: "Quoted on order" },
      { region: "Rest of world", lead: "12 – 16 weeks", cost: "Quoted on order" },
    ],
    deliverySummary:
      "Every order is delivered by a two-person team, unpacked in the room it is intended for, and all packaging removed.",
    warranty: "Ten years on frames and structural joinery. Five years on upholstery and mechanisms.",
    returns:
      "Catalogue finishes may be returned within 30 days of delivery. Pieces made to a bespoke specification are final.",
  },

  /**
   * The house's position on imagery.
   *
   * Single-sourced because it appears on Our Story, on every product page,
   * at the foot of the catalogue and in the contact form's subject list —
   * and because it is an argument, not a disclaimer, so it has to be stated
   * the same way everywhere.
   */
  drawing: {
    title: "Drawn, not photographed",
    short: "Every piece here is a measured drawing. We do not photograph our furniture.",
    body: [
      "A photograph of a sofa is a photograph of a room, a lens and an afternoon. It tells you how one piece looked once, in light that was not yours, arranged by someone you will never meet. It is the most flattering thing we could put in front of you and the least useful.",
      "So we draw. Every frame on this site is built from the dimensions our workshop cuts to — the same numbers that appear on the elevation, to the millimetre. Choose a different cloth and the drawing changes with it. Nothing is styled, nothing is borrowed, and nothing has been made to look better than it is.",
      "What a drawing cannot do is the part that matters. How low thirty-eight centimetres feels after an hour. What bouclé does under your hand. How a honed travertine edge takes the light in a north-facing room in February. We are not going to pretend a picture carries any of that.",
      "Come to Via Cesare Correnti, or to the workshop in Meda, and sit on it. That is the whole of the argument.",
    ],
    request:
      "Specifying from another country? Ask, and we will have the piece photographed for you — in the finishes you are considering, in daylight, with a scale reference. It takes about a week and costs nothing.",
  },

  /** Facts used across Our Story and editorial sections. Keep these honest. */
  craft: [
    { value: "1998", label: "Workshop founded in Meda" },
    { value: "26", label: "Makers, joiners and upholsterers" },
    { value: "10 yr", label: "Structural guarantee" },
    { value: "41", label: "Countries specified in" },
  ],

  /** Named designers in the catalogue. */
  designers: [
    {
      id: "marcanti",
      name: "Elia Marcanti",
      role: "Co-founder, Design Director",
      bio: "Trained as an architect in Venice. Draws in elevation first and in plan second, which is why Norevra seating sits so low.",
    },
    {
      id: "reiss",
      name: "Johanna Reiss",
      role: "Designer",
      bio: "Works almost exclusively in stone. Spends a week at the quarry before a single line is drawn.",
    },
    {
      id: "vasseur",
      name: "Mireille Vasseur",
      role: "Designer",
      bio: "A textile background, and an insistence that a bedroom should be quiet before it is anything else.",
    },
    {
      id: "lindqvist",
      name: "Tomas Lindqvist",
      role: "Designer",
      bio: "Lighting and small objects. Interested in the shadow a thing casts more than the thing itself.",
    },
  ],
} as const;

export type Designer = (typeof brand.designers)[number];

export function designerById(id: string): Designer | undefined {
  return brand.designers.find((d) => d.id === id);
}

/**
 * Contact subjects. Declared once: the API validates against this list and
 * the form renders from it, so the two cannot drift.
 */
export const enquiryTopics = [
  "General enquiry",
  "A specific piece",
  "Photographs of a piece",
  "Trade and specification",
  "Material samples",
  "Showroom appointment",
  "Care and repair",
] as const;

export type EnquiryTopic = (typeof enquiryTopics)[number];

export const legalPages = [
  { slug: "terms", title: "Terms of Sale" },
  { slug: "privacy", title: "Privacy Notice" },
  { slug: "cookies", title: "Cookies" },
  { slug: "accessibility", title: "Accessibility" },
] as const;
