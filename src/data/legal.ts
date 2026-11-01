import { brand } from "./brand";

export type LegalSection = { id: string; heading: string; body: string[] };
export type LegalDocument = {
  slug: string;
  title: string;
  updated: string;
  standfirst: string;
  sections: LegalSection[];
};

const C = brand.commerce;

export const legalDocuments: LegalDocument[] = [
  {
    slug: "terms",
    title: "Terms of Sale",
    updated: "2026-09-01",
    standfirst: `These terms govern orders placed with ${brand.legalEntity} through norevra.com. They are written to be read rather than skipped.`,
    sections: [
      {
        id: "orders",
        heading: "Orders and acceptance",
        body: [
          "Every piece in the catalogue is made to order. Placing an order through the site is an offer to buy; a contract is formed when we confirm your finishes and a production slot by email, which is normally within one working day.",
          "We will not begin production until that confirmation has been sent. If a finish you have chosen is unavailable, or a dimension will not work in the room you have described, we will say so before anything is cut.",
        ],
      },
      {
        id: "prices",
        heading: "Prices and tax",
        body: [
          `Catalogue prices are shown in euro and stated inclusive of Italian ${C.taxLabel} at ${Math.round(C.taxRate * 100)}%. ${C.taxNote}`,
          "Prices may change, but never for an order we have already confirmed. Import duties and any taxes due in the destination country are the customer's responsibility and are not included in the price shown.",
        ],
      },
      {
        id: "payment",
        heading: "Payment",
        body: [
          "Card payment is taken at checkout through our payment processor. We never see or store your card details.",
          "For orders above €25,000, and for all trade orders, we invoice instead: fifty per cent on confirmation and the balance before despatch. Bank details appear on the invoice.",
        ],
      },
      {
        id: "delivery",
        heading: "Delivery and installation",
        body: [
          C.deliverySummary,
          "Lead times shown on each piece are production times and begin at order confirmation, not at checkout. Current estimates by region:",
          ...C.deliveryTiers.map((t) => `${t.region} — ${t.lead}. Delivery cost: ${t.cost}.`),
          "We will agree a delivery window with you by telephone. Please tell us about lifts, stair widths, parking restrictions and any floor-loading limits before despatch; a failed delivery caused by access we were not told about is re-charged at cost.",
        ],
      },
      {
        id: "returns",
        heading: "Returns and cancellation",
        body: [
          C.returns,
          "Consumers in the European Union have a statutory right to withdraw within fourteen days of delivery, which these terms do not reduce. That right does not extend to goods made to a bespoke specification — a non-catalogue dimension, a customer-supplied fabric, or a finish not listed on the piece.",
          "Returned pieces must be in the condition they arrived in and in their original packaging, which is built for the purpose and should be kept until you are certain. We arrange collection; the cost of collection is deducted from the refund unless the piece was faulty or wrongly supplied.",
        ],
      },
      {
        id: "care",
        heading: "Guarantee, care and repair",
        body: [
          C.warranty,
          "The guarantee covers defects in material and workmanship in normal domestic use. It does not cover wear, fading from direct sunlight, damage from unsuitable cleaning products, or the natural movement of solid timber, stone and leather — which is not a defect and is described on each piece.",
          `We hold components for pieces we stopped making a decade ago. If something needs attention, write to ${brand.email.care} with photographs and we will tell you honestly whether it is a repair, a refurbishment, or beyond help.`,
        ],
      },
      {
        id: "natural",
        heading: "Natural materials",
        body: [
          "Stone is quarried and timber is grown. Vein, pore, figure and colour vary between pieces and we do not correct for it: a second Alvara table ordered next year will not match the first exactly, and book-matching across a long top requires a particular block.",
          "Upholstery shades vary between dye lots. If an exact match to an existing piece matters, tell us and we will cut from the same roll where we still have it.",
        ],
      },
      {
        id: "law",
        heading: "Governing law",
        body: [
          `These terms are governed by Italian law. ${brand.legalEntity} is registered in Italy; the courts of Milan have jurisdiction, without prejudice to any mandatory consumer protection in the customer's country of residence.`,
          "Nothing here limits our liability for death, personal injury or fraud.",
        ],
      },
    ],
  },
  {
    slug: "privacy",
    title: "Privacy Notice",
    updated: "2026-09-01",
    standfirst: `What ${brand.legalEntity} does with your information, and what it does not do with it.`,
    sections: [
      {
        id: "controller",
        heading: "Who is responsible",
        body: [
          `${brand.legalEntity}, ${brand.locations[1].lines.join(", ")}, is the data controller. For any question about this notice, write to ${brand.email.general}.`,
        ],
      },
      {
        id: "what",
        heading: "What we collect, and why",
        body: [
          "Enquiries. Your name, email address, any practice name you give us, and what you write. We use it to answer you and to keep a record of the conversation. Lawful basis: our legitimate interest in replying to you.",
          "Orders. Name, billing and delivery address, telephone number, email address, and the specification of what you bought. We need it to make and deliver the piece and to meet Italian accounting obligations. Lawful basis: performance of a contract, and legal obligation for the invoice.",
          "Newsletter. Your email address only, and only if you ask. Lawful basis: consent, withdrawable at any time from any email we send.",
          "Card details. We never receive them. Payment is handled by our payment processor on their own infrastructure.",
        ],
      },
      {
        id: "browser",
        heading: "What stays in your browser",
        body: [
          "Your shopping bag and your saved pieces are stored in your own browser, not on our servers. We cannot see them, they are not attached to any account, and clearing your browser data removes them.",
        ],
      },
      {
        id: "sharing",
        heading: "Who else sees it",
        body: [
          "Our payment processor, for the transaction. Our hosting provider, which processes requests to this site. Our freight partners, who need the delivery address and your telephone number. Our mailing provider, if you subscribe.",
          "We do not sell personal data, we do not share it for advertising, and we do not combine it with data bought from anyone else.",
        ],
      },
      {
        id: "retention",
        heading: "How long we keep it",
        body: [
          "Enquiries: three years, then deleted. Order records and invoices: ten years, because Italian tax law requires it. Newsletter: until you unsubscribe.",
        ],
      },
      {
        id: "rights",
        heading: "Your rights",
        body: [
          "You may ask for a copy of what we hold, ask us to correct it, ask us to delete it, object to our using it, or ask us to send it elsewhere. Write to the address above; we answer within thirty days and there is no charge.",
          "If you are not satisfied with our answer you may complain to the Garante per la protezione dei dati personali in Italy, or to the supervisory authority where you live.",
        ],
      },
    ],
  },
  {
    slug: "cookies",
    title: "Cookies",
    updated: "2026-09-01",
    standfirst: "This site sets no tracking cookies, which makes this a short page.",
    sections: [
      {
        id: "none",
        heading: "What we do not use",
        body: [
          "No analytics cookies. No advertising or retargeting pixels. No social media embeds that set cookies. No consent banner, because there is nothing to consent to.",
        ],
      },
      {
        id: "storage",
        heading: "What we do store locally",
        body: [
          "Your shopping bag and saved pieces are kept in your browser's local storage under a single key. This is not a cookie: it is never sent to our servers and it expires only when you clear it.",
          "If you reach checkout, our payment processor sets its own cookies on its own pages, which are necessary for the payment to work and are governed by their policy, not ours.",
        ],
      },
      {
        id: "removing",
        heading: "Removing it",
        body: [
          "Emptying your bag and clearing your saved pieces removes the stored data. Clearing site data for this domain in your browser settings does the same thing more thoroughly.",
        ],
      },
    ],
  },
  {
    slug: "accessibility",
    title: "Accessibility",
    updated: "2026-09-01",
    standfirst:
      "Our intention is that everything on this site can be used with a keyboard, with a screen reader, at any text size, and without animation.",
    sections: [
      {
        id: "standard",
        heading: "What we aim at",
        body: [
          "We build to WCAG 2.2 Level AA. Text contrast is checked against the warm neutral palette rather than assumed, interactive elements are reachable and operable by keyboard, focus is always visible, and every image carries a description written for the picture rather than for a search engine.",
        ],
      },
      {
        id: "motion",
        heading: "Motion",
        body: [
          "The site uses a good deal of movement by default. If your system is set to reduce motion, all of it stops: scroll reveals resolve immediately, the hero does not advance on its own, parallax is disabled, and smooth scrolling is not loaded at all. You lose nothing but the animation.",
        ],
      },
      {
        id: "known",
        heading: "Known limitations",
        body: [
          "The generated elevation and plan drawings are SVG with dimensions as text; they are labelled, but a complex drawing is difficult to convey in a single description. The same dimensions are always available as a text table alongside.",
          "Photography is central to how furniture is judged. Where an image carries information we also state it in words.",
        ],
      },
      {
        id: "telling-us",
        heading: "Telling us about a problem",
        body: [
          `If something here does not work for you, please write to ${brand.email.general} and describe what happened and what you were using. We will reply, and we will fix it.`,
        ],
      },
    ],
  },
];

export const legalBySlug = (slug: string) => legalDocuments.find((d) => d.slug === slug);
