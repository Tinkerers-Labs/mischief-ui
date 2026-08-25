/**
 * Releases, kept here rather than read from git, because a tag message is a
 * sentence for whoever runs the release and a changelog entry is a sentence
 * for whoever is deciding whether to upgrade. Newest first.
 */
export type Release = {
  version: string
  date: string
  title: string
  summary: string
  changes: readonly string[]
}

export const releases: readonly Release[] = [
  {
    version: "0.8.9",
    date: "2026-08-25",
    title: "Four more, and a registry that installs",
    summary:
      "Seventeen components could not be installed at all: a dependency on a sibling was written as a bare name, which sends the CLI to shadcn's registry looking for a component only this one has. Nothing here caught it, because a dependency that resolves to the wrong place still parses. The build now installs the registry into a throwaway project and looks at what lands.",
    changes: [
      "JSON Viewer reads a payload as a keyboard-navigable tree, and every row can hand you its path in the notation you would paste back into code.",
      "Marquee runs a row seamlessly, and under reduced motion becomes an ordinary scrolling row rather than a frozen one with half its content out of reach.",
      "Voice Input draws what the microphone is hearing, which is the difference between a live one and a muted one. It records and hands back a Blob; transcription is a service, not a component.",
      "Connection Beam joins two elements with a line, measured from the elements themselves, so the diagram survives a reflow.",
      "Floating Index cancelled its own navigation: the panel closed in the same tick the scroll started, and a smooth scroll does not survive that. It now closes once the scroll has landed.",
      "Floating Index takes a position, so moving it out of the top no longer means undoing the default a utility at a time, and can say which section the reader is in.",
      "Components that animate a keyframe by name now publish it, and this site defines it too. The file thumbnail's shimmer had never run on these pages.",
      "Every component has a page for its family, and the guidelines this collection holds itself to are written down at /interfaces.",
    ],
  },
  {
    version: "0.8.8",
    date: "2026-08-24",
    title: "Pointer-aware backdrops",
    summary:
      "The two field components were built to sit behind other content, and neither could ever have received a pointer event there. Both now follow the pointer on the window instead.",
    changes: [
      "Metaballs can take the pointer as another blob, merging with the rest as it passes through them.",
      "Constellation Field answers to the pointer from behind a headline that is taking every event itself.",
      "Metaballs spread their blobs to the shape of the box. A wide one used to bunch them into the middle third and merge them into a single mass.",
      "The homepage stands on a scene from the collection, and the catalogue moved to the documentation where browsing belongs.",
    ],
  },
  {
    version: "0.8.7",
    date: "2026-08-23",
    title: "Data Table",
    summary:
      "Typed rows with cells you write, column widths you set or the reader drags, sorting that is one property to switch on, and selection kept in keys rather than positions.",
    changes: [
      "Sorting in three levels: absent, the built-in comparator, or your own. A third press gives back the order the rows arrived in, and blanks stay at the bottom whichever way the column points.",
      "Widths are a colgroup over a fixed layout, so any CSS length works and columns without one share the remainder.",
      "Boundaries drag, and the handles are separators in the tab order, moved with the arrow keys.",
      "A pinned column holds against the edge while the rest scrolls, its offsets following a drag.",
      "Loading fills the body with placeholders shaped like the rows they stand in for, held back a tenth of a second so a fast answer never flashes them.",
    ],
  },
  {
    version: "0.8.6",
    date: "2026-08-22",
    title: "Scenes and Motion",
    summary:
      "Two new families, from 65 components to 93. Scenes is for components where the drawing is the job; Motion is for entrances and numbers that move.",
    changes: [
      "Everything drawn sits on one shared surface, which sleeps off screen, recovers a lost GPU context, and paints one still frame instead of a loop when motion is reduced.",
      "Shaders resolve theme custom properties into their own colours, so the same surface arrives dark in a dark application and light in a light one.",
      "Two components ask for three, both as optional peers. The package root does not export them, so nothing else pays for it.",
      "Fixes a fault where sleeping rebuilt the canvas, wiping a surface that had painted once by the very act of stopping.",
    ],
  },
]
