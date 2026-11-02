export type JournalPost = {
  slug: string;
  title: string;
  /** Short kicker above the title. */
  category: "Making" | "Materials" | "Interiors" | "Conversation";
  date: string; // ISO
  readMinutes: number;
  author: string;
  standfirst: string;
  /** Body: paragraphs, pull quotes, and image plates, in order. */
  body: (
    | { type: "p"; text: string }
    | { type: "h"; text: string }
    | { type: "quote"; text: string; attribution?: string }
    | { type: "plate"; image: 0 | 1 | 2; caption: string }
  )[];
  images: { src: string; width: number; height: number; alt: string; brief: string }[];
  related: string[];
};

function plate(slug: string, n: number, alt: string, brief: string, portrait = false) {
  return {
    src: `/media/journal/${slug}-${n}.jpg`,
    width: portrait ? 1400 : 2000,
    height: portrait ? 1750 : 1250,
    alt,
    brief,
  };
}

export const journal: JournalPost[] = [
  {
    slug: "thirty-eight-centimetres",
    title: "Thirty-eight centimetres",
    category: "Making",
    date: "2026-11-01",
    readMinutes: 5,
    author: "Norevra Studio",
    standfirst:
      "Two centimetres decided a whole collection. An argument about what a sofa is for.",
    body: [
      { type: "p", text: "The standard seat height for a sofa is between 42 and 45 centimetres. It is standard because it is roughly the height of a dining chair, and because at that height most adults can stand up without using their hands." },
      { type: "p", text: "It is also the reason most living rooms feel like waiting rooms." },
      { type: "h", text: "What happens at thirty-eight" },
      { type: "p", text: "At 38 centimetres your knees come up slightly. You sit back rather than forward. The angle of your head changes, and so does what you look at — the window rather than the room, the ceiling rather than the opposite wall. A low seat makes a room feel taller, and it makes the people in it talk differently." },
      { type: "plate", image: 0, caption: "Prototype seven, in the Meda workshop. Rejected at 36 centimetres." },
      { type: "p", text: "Thirty-six is too low: getting out of it is a manoeuvre, and after an hour your lower back knows about it. Forty is comfortable and unremarkable. Thirty-eight is the point at which the posture changes and nothing is sacrificed." },
      { type: "quote", text: "Two centimetres is the difference between a sofa you notice and a sofa you sit on.", attribution: undefined },
      { type: "h", text: "The consequence for everything else" },
      { type: "p", text: "A 38-centimetre seat forces every other decision. A low table has to come down to 29 or it is in the way. A side table has to be 48, which is taller than the seat, because at 38 you cannot see what is on it. The lounge chair has to keep the full 104-centimetre depth or it stops being comfortable at that height." },
      { type: "p", text: "That cascade is why Sestri is a collection rather than a sofa. Once you fix the seat height everything else is determined, and a room furnished from it has a consistency you cannot arrive at by buying four good objects separately." },
      { type: "plate", image: 1, caption: "The oak plinth, 40 millimetres, which sets the whole collection off the floor." },
    ],
    images: [
      plate("thirty-eight-centimetres", 0, "The Sestri sofa seen low, in a tall daylit room.", "35mm, camera at 55cm — deliberately at seat height. Sestri sofa in a tall plaster room, afternoon. The low horizon is the point of the picture."),
      plate("thirty-eight-centimetres", 1, "Chalk bouclé meeting the solid oak plinth.", "1:1 macro of the 40mm oak plinth edge with bouclé above, raking light, the 2mm shadow gap legible."),
    ],
    related: ["the-case-against-handles", "sixty-fabrics"],
  },
  {
    slug: "the-case-against-handles",
    title: "The case against handles",
    category: "Making",
    date: "2026-11-01",
    readMinutes: 4,
    author: "Norevra Studio",
    standfirst:
      "A 14-millimetre rebate is the reason a Kelvara run reads as a single plane rather than a row of doors.",
    body: [
      { type: "p", text: "A handle is an admission. It says: this is a door, and here is where you pull it. On a cabinet of any size it also breaks the front into regions, because the eye goes to the hardware before it goes to the timber." },
      { type: "p", text: "Removing it is easy. Removing it and still having something to pull is the problem." },
      { type: "h", text: "Eight months of a shadow" },
      { type: "p", text: "Push-to-open mechanisms exist and we rejected them: they put a sprung component into a piece guaranteed for ten years, and they make a noise. What we wanted was a rebate — a recess along the lower edge of the door, deep enough for a finger." },
      { type: "p", text: "Too shallow and you cannot get purchase. Too deep and the door front looks thin. The figure we settled on is 14 millimetres deep over a 28-millimetre height, with the upper edge undercut three degrees so a fingertip is drawn in rather than skidding off." },
      { type: "plate", image: 0, caption: "The resolved rebate. Fourteen millimetres, undercut three degrees." },
      { type: "quote", text: "The detail you cannot see is the one the hand finds. The eye reads it only as a shadow." },
      { type: "p", text: "The secondary effect is the one we did not anticipate. Because every door carries the same recess at the same height, a Kelvara run of any length has one continuous shadow line along it. On a 300-centimetre sideboard that line does more for the proportion than any amount of figuring in the timber." },
    ],
    images: [
      plate("the-case-against-handles", 0, "Oak, shadow and patinated brass at a cabinet's lower edge.", "1:1 macro of the 14mm finger rebate on an oak cabinet door, hard raking light from above so the undercut reads. Brass plinth just visible below."),
    ],
    related: ["thirty-eight-centimetres", "the-cost-of-ten-years"],
  },
  {
    slug: "the-cost-of-ten-years",
    title: "The cost of ten years",
    category: "Making",
    date: "2026-11-01",
    readMinutes: 5,
    author: "Norevra Studio",
    standfirst:
      "A ten-year guarantee is not a marketing position. It is a constraint that decides how a piece is built, and it removes several cheaper ways of building it.",
    body: [
      { type: "p", text: "We guarantee frames and structural joinery for ten years. That number was not chosen because it sounded generous; it was chosen because it is the point at which the cheap options stop being available to us." },
      { type: "h", text: "What it rules out" },
      { type: "p", text: "Stapled frames. A staple into end grain holds perfectly well for four or five years of domestic use, and then it does not. Our frames are mortised and glued, which takes a joiner about three hours longer per sofa and cannot be done by a machine we could afford." },
      { type: "p", text: "Serpentine springs, which sag in a pattern you can see across a seat by year six. We use elasticated webbing, twelve bands, re-tensionable by anyone with a staple gun and an afternoon." },
      { type: "p", text: "Particle board behind a veneer. It is stable, it is cheap, it is perfectly honest in the right application — and it will not take a screw twice, so a cabinet made from it cannot be repaired after it has been moved a few times." },
      { type: "plate", image: 0, caption: "A mortised beech frame before upholstery. The joint is the guarantee." },
      { type: "quote", text: "A guarantee is a prediction about how something will fail. Writing one down forces you to have an opinion about that, which most furniture avoids." },
      { type: "h", text: "What it costs" },
      { type: "p", text: "Something in the order of an eighth of the manufactured cost of a seating piece. Most of it is labour, and almost none of it is visible in a photograph — which is part of why we publish the drawing instead." },
      { type: "p", text: "It also means holding components for every piece in the catalogue, for as long as it is made and ten years after — which ties up a room that could be doing something more profitable. We have committed to it in the terms of sale, where it can be held against us." },
      { type: "p", text: "None of that is free, and all of it is in the price. We would rather state it than pretend the price is only about materials." },
    ],
    images: [
      plate("the-cost-of-ten-years", 0, "Smoked oak, bronze and chalk bouclé at a joint.", "1:1 macro of a mortise-and-tenon joint in beech, before upholstery. Raking workshop light. The glue line must be legible."),
    ],
    related: ["the-case-against-handles", "sixty-fabrics"],
  },
  {
    slug: "sixty-fabrics",
    title: "Eighteen materials, not sixty",
    category: "Materials",
    date: "2026-11-01",
    readMinutes: 4,
    author: "Norevra Studio",
    standfirst:
      "We drew up a card of sixty materials and then cut it to eighteen before anyone saw it. Here is the argument for the short list.",
    body: [
      { type: "p", text: "A long fabric card looks like generosity. In practice it is an abdication: sixty options is the manufacturer declining to have a view, and handing the research to someone standing in a showroom for twenty minutes." },
      { type: "p", text: "It also quietly guarantees that some of those sixty are wrong. Our own long list had cloths on it we would have talked a client out of — a linen too loose for a seat in daily use, a pale velvet that marked if you looked at it." },
      { type: "h", text: "The rule we applied" },
      { type: "p", text: "A material goes on the card if it is available in quantity from a single mill or quarry, if the mill will hold it, and if we are satisfied it will keep its appearance for twenty years in a domestic room. Eighteen cleared that. Several we liked did not." },
      { type: "plate", image: 0, caption: "What remains: three stones, four timbers, six cloths, two leathers, two metals." },
      { type: "quote", text: "Sixty options is not a service. It is the manufacturer declining to have an opinion.", attribution: undefined },
      { type: "h", text: "What changed afterwards" },
      { type: "p", text: "The practical effect is shorter lead times, because eighteen materials can be held and sixty cannot. The intended effect is a different conversation: not what is available, but which of three we would choose." },
      { type: "p", text: "If what you want is not on the card we will still source it, and customers’ own materials are welcome. We just will not pretend that choice, on its own, is the same thing as care." },
    ],
    images: [
      plate("sixty-fabrics", 0, "Chalk boucl\u00e9, oat linen and clay mohair laid against one another.", "100mm macro of three upholstery cloths laid edge to edge on a cutting table, raking north light, the loop and the slub both legible."),
    ],
    related: ["the-cost-of-ten-years", "thirty-eight-centimetres"],
  },
];

export const journalMap: Record<string, JournalPost> = Object.fromEntries(
  journal.map((p) => [p.slug, p]),
);

export function postBySlug(slug: string): JournalPost | undefined {
  return journalMap[slug];
}

export const journalSorted = [...journal].sort((a, b) => b.date.localeCompare(a.date));
