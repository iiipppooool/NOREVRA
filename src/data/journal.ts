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
    slug: "a-week-at-rapolano",
    title: "A week at Rapolano",
    category: "Materials",
    date: "2026-09-18",
    readMinutes: 6,
    author: "Johanna Reiss",
    standfirst:
      "Before a line of the Alvara table was drawn, we spent five days at the quarry learning what the stone would and would not do.",
    body: [
      { type: "p", text: "Travertine is laid down in beds, horizontally, over a very long time. Which direction you cut it in decides almost everything about the finished object: cut with the bed and you get the cloudy, mottled face most people picture; cut against it — vein cut — and the pores line up into a horizontal grain that reads almost like timber." },
      { type: "p", text: "We cut against. It is the more difficult choice, because it exposes the voids, and a vein cut slab will always have holes in it that a bed cut slab hides. Filling them is standard practice in the trade. We do not fill them." },
      { type: "plate", image: 0, caption: "The working face at Rapolano Terme. The horizontal banding is the bed." },
      { type: "h", text: "Buying the block, not the slab" },
      { type: "p", text: "Most furniture is made from slabs bought by the square metre from a stockist. A table made that way will have a top from one slab and legs from another, and the colour will be close but not the same. In a honed finish, under a window, close is not the same." },
      { type: "p", text: "So we buy blocks. A block for a 300-centimetre Alvara is roughly four cubic metres and yields the top, both plinths and a quantity of offcut we then have to find a use for. It is a worse way to run a business and the only way to get the grain to run continuously from one plinth, through the top, and down the other." },
      { type: "quote", text: "There is no finish that will hide a colour mismatch. There is a finish that will hide a hole, and we have decided not to use it.", attribution: "Johanna Reiss" },
      { type: "plate", image: 1, caption: "A block marked up for cutting. The chalk lines locate the plinths within the top's own bed." },
      { type: "h", text: "What a quarry teaches you about drawing" },
      { type: "p", text: "The 40-millimetre top is 40 millimetres because that is the thinnest section that will span 220 centimetres in this stone without a steel spine in it, and a steel spine would mean glue, and glue would mean the piece was joined. The 120-millimetre plinth is 120 because below that the proportion starts to look like a trestle." },
      { type: "p", text: "Neither number was arrived at on paper. Both came from standing in front of a saw with a man who has been cutting this stone for thirty years and asking him what he thought." },
    ],
    images: [
      plate("a-week-at-rapolano", 0, "Vein-cut travertine, the bedding reading as horizontal grain.", "100mm macro of a vein-cut slab at the quarry, raking light. The horizontal bedding must be the subject, pores and voids legible. Fills the frame."),
      plate("a-week-at-rapolano", 1, "Grigio Carnico marble beside ivory travertine.", "100mm macro of Grigio Carnico and ivory travertine laid edge to edge, raking light, the chalk vein running across the join."),
    ],
    related: ["the-case-against-handles", "thirty-eight-centimetres"],
  },
  {
    slug: "thirty-eight-centimetres",
    title: "Thirty-eight centimetres",
    category: "Making",
    date: "2026-07-02",
    readMinutes: 5,
    author: "Elia Marcanti",
    standfirst:
      "Eleven prototypes to settle a seat height. An argument about what a sofa is for.",
    body: [
      { type: "p", text: "The standard seat height for a sofa is between 42 and 45 centimetres. It is standard because it is the height of a dining chair, roughly, and because at that height most adults can stand up from it without using their hands." },
      { type: "p", text: "It is also the reason most living rooms feel like waiting rooms." },
      { type: "h", text: "What happens at thirty-eight" },
      { type: "p", text: "At 38 centimetres your knees come up slightly. You sit back rather than forward. The angle of your head changes, and so does what you look at — the window rather than the room, the ceiling rather than the opposite wall. A low seat makes a room feel taller, and it makes the people in it talk differently." },
      { type: "plate", image: 0, caption: "Prototype seven, in the Meda workshop. Rejected at 36 centimetres." },
      { type: "p", text: "We tried 36. Thirty-six is too low: getting out of it is a manoeuvre, and after an hour your lower back knows about it. We tried 40, which is comfortable and unremarkable. Thirty-eight is the point at which the posture changes and nothing is sacrificed." },
      { type: "quote", text: "Two centimetres is the difference between a sofa you notice and a sofa you sit on.", attribution: "Elia Marcanti" },
      { type: "h", text: "The consequence for everything else" },
      { type: "p", text: "A 38-centimetre seat forces every other decision. A low table has to come down to 29 or it is in the way. A side table has to be 48, which is taller than the seat, because at 38 you cannot see what is on it. The lounge chair has to keep the full 104-centimetre depth or it stops being comfortable at that height." },
      { type: "p", text: "That cascade is why Sestri is a collection rather than a sofa. Once you fix the seat height everything else is determined, and a room furnished from it has a consistency you cannot arrive at by buying four good objects separately." },
      { type: "plate", image: 1, caption: "The oak plinth, 40 millimetres, which sets the whole collection off the floor." },
    ],
    images: [
      plate("thirty-eight-centimetres", 0, "The Sestri sofa seen low, in a tall daylit room.", "35mm, camera at 55cm — deliberately at seat height. Sestri sofa in a tall plaster room, afternoon. The low horizon is the point of the picture."),
      plate("thirty-eight-centimetres", 1, "Chalk bouclé meeting the solid oak plinth.", "1:1 macro of the 40mm oak plinth edge with bouclé above, raking light, the 2mm shadow gap legible."),
    ],
    related: ["a-week-at-rapolano", "the-case-against-handles"],
  },
  {
    slug: "the-case-against-handles",
    title: "The case against handles",
    category: "Making",
    date: "2026-04-11",
    readMinutes: 4,
    author: "Elia Marcanti",
    standfirst:
      "A 14-millimetre rebate took eight months to resolve, and is the reason Kelvara reads as a single plane.",
    body: [
      { type: "p", text: "A handle is an admission. It says: this is a door, and here is where you pull it. On a cabinet of any size it also breaks the front into regions, because the eye goes to the hardware before it goes to the timber." },
      { type: "p", text: "Removing it is easy. Removing it and still having something to pull is the problem." },
      { type: "h", text: "Eight months of a shadow" },
      { type: "p", text: "Push-to-open mechanisms exist and we rejected them: they introduce a sprung component into a piece guaranteed for ten years, and they make a noise. What we wanted was a rebate — a recess along the lower edge of the door, deep enough for a finger." },
      { type: "p", text: "Too shallow and you cannot get purchase. Too deep and the door front looks thin. The resolved figure is 14 millimetres deep over a 28-millimetre height, with the upper edge of the recess undercut by three degrees so a fingertip is drawn in rather than skidding off." },
      { type: "plate", image: 0, caption: "The resolved rebate. Fourteen millimetres, undercut three degrees." },
      { type: "quote", text: "The detail you cannot see is the one the hand finds. We spent eight months on something the eye reads as a shadow." },
      { type: "p", text: "The secondary effect is the one we did not anticipate. Because every door carries the same recess at the same height, a Kelvara run of any length has one continuous shadow line along it. On a 300-centimetre sideboard that line does more for the proportion than any amount of figuring in the timber." },
    ],
    images: [
      plate("the-case-against-handles", 0, "Oak, shadow and patinated brass at a cabinet's lower edge.", "1:1 macro of the 14mm finger rebate on an oak cabinet door, hard raking light from above so the undercut reads. Brass plinth just visible below."),
    ],
    related: ["thirty-eight-centimetres", "a-week-at-rapolano"],
  },
  {
    slug: "the-cost-of-ten-years",
    title: "The cost of ten years",
    category: "Making",
    date: "2026-10-09",
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
      { type: "p", text: "Between eleven and fourteen per cent of the manufactured cost of a seating piece, by our own accounting. Most of that is labour, and almost none of it is visible in a photograph." },
      { type: "p", text: "We hold components for pieces we stopped making a decade ago, which ties up a room in Meda that could be doing something more profitable. In the last two years we have refilled eleven Kelvara drawers, re-webbed thirty-one Sestri seats, and refinished four Alvara tops." },
      { type: "p", text: "None of that is free, and all of it is in the price. We would rather state it than pretend the price is only about materials." },
    ],
    images: [
      plate("the-cost-of-ten-years", 0, "Smoked oak, bronze and chalk bouclé at a joint.", "1:1 macro of a mortise-and-tenon joint in beech, before upholstery. Raking workshop light. The glue line must be legible."),
    ],
    related: ["the-case-against-handles", "sixty-fabrics"],
  },
  {
    slug: "sixty-fabrics",
    title: "We used to offer sixty fabrics",
    category: "Materials",
    date: "2026-06-14",
    readMinutes: 4,
    author: "Mireille Vasseur",
    standfirst:
      "Cutting the material library from sixty to eighteen was the most useful thing we did for customers, and the hardest to explain to them.",
    body: [
      { type: "p", text: "A long fabric card looks like generosity. In practice it is an abdication: sixty options is the manufacturer declining to have a view, and passing the research to someone standing in a showroom for twenty minutes." },
      { type: "p", text: "It also quietly guarantees that some of those sixty are wrong. We had cloths on the card that we would have talked a client out of if they had asked — a linen too loose for a seat that gets daily use, a pale velvet that marked if you looked at it." },
      { type: "h", text: "The rule we applied" },
      { type: "p", text: "A material stays on the card if it has been specified for at least two years, is available in quantity from one mill, and will hold its appearance for twenty years in a domestic room. Eighteen survived that. Several that we liked did not." },
      { type: "plate", image: 0, caption: "What remains: three stones, four timbers, six cloths, two leathers, two metals." },
      { type: "quote", text: "Sixty options is not a service. It is the manufacturer declining to have an opinion.", attribution: "Mireille Vasseur" },
      { type: "h", text: "What changed afterwards" },
      { type: "p", text: "Lead times fell, because we hold stock of eighteen cloths rather than ordering sixty on demand. Returns on finish fell to almost nothing. And the conversation in the showroom changed: people stopped asking what everything was and started asking which of three we would choose." },
      { type: "p", text: "If what you want is not on the card, we will still source it — around one order in twelve is a customer's own material. We just will not pretend that choice, on its own, is the same thing as care." },
    ],
    images: [
      plate("sixty-fabrics", 0, "Chalk boucl\u00e9, oat linen and clay mohair laid against one another.", "100mm macro of three upholstery cloths laid edge to edge on a cutting table, raking north light, the loop and the slub both legible."),
    ],
    related: ["a-week-at-rapolano", "the-cost-of-ten-years"],
  },
  {
    slug: "a-room-in-trieste",
    title: "A room in Trieste",
    category: "Interiors",
    date: "2026-02-24",
    readMinutes: 7,
    author: "Norevra Studio",
    standfirst:
      "An apartment on the third floor of a 1930s building, five pieces, and a decision to leave three walls empty.",
    body: [
      { type: "p", text: "The architect had stripped the apartment back to its plaster and left it. Four and a half metre ceilings, original terrazzo, and a sequence of three rooms running the depth of the building with windows at either end." },
      { type: "p", text: "The brief was to furnish it with as little as possible." },
      { type: "plate", image: 0, caption: "The principal room, looking south. Five pieces in ninety square metres." },
      { type: "h", text: "Five objects" },
      { type: "p", text: "A Sestri sofa in chalk bouclé, three seat, with the chaise. The low table in ivory travertine. One Sestri Lounge, turned forty degrees off the sofa rather than squared to it. A Kelvara sideboard, 240 centimetres, on the only wall that takes a piece of that length. An Oriel floor light behind the lounge chair." },
      { type: "p", text: "That is the entire specification for ninety square metres. Three of the four walls carry nothing at all." },
      { type: "quote", text: "The temptation in a room like this is to fill the walls. What the room actually wants is for you to leave them alone and let the light cross them." },
      { type: "h", text: "The light decided the plan" },
      { type: "p", text: "Between two and four in the afternoon the south windows put a hard rectangle of light on the floor roughly two metres by four. Everything was positioned relative to that rectangle: the sofa just outside it so it is never in direct sun, the low table at its edge so the travertine catches, the lounge chair inside it." },
      { type: "plate", image: 1, caption: "Three in the afternoon. The rectangle the plan was drawn around." },
      { type: "p", text: "The sideboard is on the north wall, in permanent shade, which is why it is in smoked oak rather than natural. Natural oak in that position would have read grey." },
    ],
    images: [
      plate("a-room-in-trieste", 0, "A large sparsely furnished apartment interior.", "24mm wide, a very tall stripped-plaster room with terrazzo floor, Sestri sofa and low table on the left, three empty walls. Afternoon. Ceiling fully in frame."),
      plate("a-room-in-trieste", 1, "A stone dining table alone in a bare room.", "28mm, the Alvara table in the second room, bare, late afternoon, the hard rectangle of window light reaching the plinths. Three empty walls."),
    ],
    related: ["thirty-eight-centimetres", "a-week-at-rapolano"],
  },
];

export const journalMap: Record<string, JournalPost> = Object.fromEntries(
  journal.map((p) => [p.slug, p]),
);

export function postBySlug(slug: string): JournalPost | undefined {
  return journalMap[slug];
}

export const journalSorted = [...journal].sort((a, b) => b.date.localeCompare(a.date));
