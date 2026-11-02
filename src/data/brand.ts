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

  /**
   * The day the catalogue opened. Everything the site says about the house
   * has to be true on this date — which rules out a history, a headcount, a
   * list of countries shipped to, and a track record. A new house has none
   * of those, and inventing them is the quickest way to lose the only thing
   * it does have.
   */
  launched: "2026-11-01",

  /** One line, used in metadata and the footer. Not a slogan. */
  descriptor: "Contemporary furniture, made to order.",

  /** Long-form positioning, used on Our Story and in structured data. */
  summary:
    "Norevra is a new furniture house. Twenty pieces, drawn in-house and made to order from stone, solid timber and woven cloth chosen for how they age. The catalogue opened in November 2026; everything in it is being made for the first time.",

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

  /**
   * PLACEHOLDER — replace with the real address before launch.
   *
   * These are the only invented facts left in this file and they are here
   * because the site needs somewhere to put an address, not because the
   * address is known. Do not add a second or third location until there is
   * one: a list of offices is the first thing a trade buyer checks.
   */
  locations: [
    {
      id: "studio",
      label: "Studio",
      city: "Milan",
      lines: ["Address to be confirmed", "Milan", "Italy"],
      hours: ["By appointment"],
      note: "We are not open to the street yet. Write first and we will arrange a time to show you the pieces.",
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

    /**
     * Pre-order terms.
     *
     * Every piece in the opening catalogue is being made for the first time,
     * so an order is a reservation against a production run rather than a
     * purchase from stock. A deposit secures a place in that run; the balance
     * is taken before despatch, once the piece exists.
     */
    preOrder: {
      depositRate: 0.3,
      runLabel: "First production run",
      dispatchFrom: "March 2027",
      summary:
        "Every piece in this catalogue is being made for the first time. An order reserves a place in the first production run: thirty per cent on confirmation, the balance before despatch, and nothing charged twice.",
      protection:
        "If we cannot make your piece — a material withdrawn, a run cancelled — the deposit is returned in full within five working days. You may also cancel for any reason until we cut, and we will tell you the date that happens.",
    },
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

  /**
   * What the house can say on its first day.
   *
   * These are commitments and specifications, not achievements. There is no
   * headcount here, no founding year and no list of countries, because there
   * is nothing to count yet. Each one is a decision already made, which is a
   * different kind of claim from a record.
   */
  commitments: [
    {
      value: "Made to order",
      label: "Nothing is held in stock, and nothing is cut until an order is confirmed",
    },
    {
      value: "Solid, not faced",
      label: "No veneer on any surface you can see or touch",
    },
    {
      value: "Ten years",
      label: "Structural guarantee on frames and joinery, from first delivery",
    },
    {
      value: "Eighteen materials",
      label: "A short library, chosen for how it ages rather than how it photographs",
    },
  ],

  /**
   * Design is in-house. Named designers with careers behind them would be
   * invented people; the studio is the honest attribution.
   */
  designers: [
    {
      id: "studio",
      name: "Norevra Studio",
      role: "In-house design",
      bio: "Every piece in the catalogue is drawn in-house, in elevation first and in plan second. We do not commission outside designers, and when we do we will say whose work it is.",
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
