# Mischief UI catalog

Every component, grouped by family. 115 in total.

Install one with `npx shadcn@latest add Tinkerers-Labs/mischief-ui/<component>`, and read its full
documentation at `https://ui.tinkererslabs.com/docs/components/<component>.md` before using it.

## Agent UI

The surface an assistant answers through: the thread, the composer, and everything it shows while it is working.

- `conversation`: The scroll container a thread lives in. It follows a streaming reply to the bottom, and stops the moment the reader scrolls up to read something older.
- `message`: One turn in a thread, with a role, an optional avatar and timestamp, and actions that stay reachable without a pointer.
- `prompt-input`: The composer. Grows with the message, sends on Enter, keeps Shift+Enter for a new line, and turns into a stop button while a reply streams.
- `suggestions`: A row of prompts to start or continue with, for the moment someone does not know what to ask.
- `questionnaire`: The questions an agent asks before it starts. One at a time, with single or multiple answers, an open answer alongside them, and required ones it will not move past.
- `ask-ai`: Hand someone a prepared, source-aware prompt in the AI assistant they already use, or let them copy it for another one.
- `streaming-text`: Text that arrives a piece at a time from an async source, with a cursor while it runs and sentence-level announcements for screen readers.
- `thinking-state`: A status row for work in progress, with a live elapsed timer and optional reasoning behind a disclosure.
- `tool-call`: A compact record of one tool invocation: name, status, duration, and the input and output behind a disclosure.
- `agent-checklist`: A task list whose items change state as work proceeds, announcing what changed instead of re-reading the whole list.
- `inline-citations`: Numbered markers placed inside generated text, each linking to its entry in a source list underneath.
- `response-actions`: The row under an answer: copy it, ask again, and rate it. Drops into the actions slot on Message.
- `voice-input`: A microphone that draws what it is hearing, so a live one is told apart from a dead one at a glance.
- `audio-player`: A recording with its shape, its position and its words, so a voice note can be read as well as heard.
- `bar-visualizer`: Frequency bars for audio on its way out, the counterpart to the trace a microphone draws on the way in.
- `mic-selector`: Chooses which microphone to use, then settles the question by lighting a meter from the one you chose.
- `chain-of-thought`: The steps an assistant took before answering, open while it is working and folded away once it is done.
- `video-player`: Video with captions that can be turned on, a real scrubber, and controls that survive full screen.
- `subagent-tree`: Several agents working at once, nested under whoever handed the work down, each with its own state and elapsed time.
- `stopped-run`: What the thread says after an answer ended early, with whatever it had already written kept above the line.
- `memory-chips`: Everything an assistant has been told to remember about someone, each one removable on its own.
- `orb`: A sphere that carries what an assistant is doing, settled when idle and moving with the voice when there is one.
- `matrix`: A grid of cells lit from the bottom by a level, which reads as a piece of hardware rather than as a chart.
- `response`: An assistant's answer as markdown, including while it is still half-written and briefly invalid.
- `transcript-viewer`: A recording as text, where every line is also the way back to the moment it was said.
- `stop-generating`: The control that interrupts a running answer, with the time it has been going and Escape wired up.
- `token-meter`: How much of the context window is gone, split by what spent it, and a warning before it runs out.
- `model-picker`: A model chooser that has room for what each one is good at, and full keyboard control.
- `source-card`: One retrieved passage: where it came from, what it said, and how well it matched.
- `presence-field`: An ambient backdrop that carries what the assistant is doing. It changes colour and pace with the state, and settles into each one rather than snapping to it.
- `stream-glow`: An edge that breathes along a region while tokens land in it, and stops the moment they do.

## Code

Code an agent wrote, ran, or wants to change, and the controls to accept it.

- `code-block`: A code panel with copy, optional line numbers, highlighted lines, and a collapse for anything long.
- `diff-view`: A proposed change shown as a unified or side-by-side diff, with optional accept and reject controls.
- `terminal-output`: Streaming command output with stderr called out, an exit code, and scroll that follows without trapping you.
- `web-preview`: A sandboxed frame for whatever the assistant just built, with the widths to check it at.
- `reviewable-diff`: A proposed change reviewed a hunk at a time: take three of the seven, leave the rest, apply what you took.

## Documents

Reading a file someone uploaded, marking it up, cutting it into pieces, and pulling structure out of it.

- `bounding-boxes`: Selectable regions drawn over a page image from normalized coordinates, for showing an agent exactly where an answer came from.
- `annotation-layer`: Notes attached to regions of a page. Drag to add one, select to read it, and the coordinates stay relative to the page rather than the screen.
- `redaction`: Mark regions to black out before a document leaves the building, with a reveal that says plainly it is only a preview.
- `page-navigator`: A rail of page thumbnails for moving through a long document, with arrow-key navigation and a clear active page.
- `file-tree`: An expandable tree of folders and files with full keyboard navigation and correct tree semantics.
- `document-splits`: Mark where one scanned batch becomes several documents. Splits are toggled between pages and the segments update as you go.
- `schema-builder`: Build the shape you want extracted from a document. Fields carry a name, type, description, and requirement, and object and array fields nest.
- `signature-pad`: Sign with a pointer on a canvas, or type a name instead. Returns a PNG data URL or the typed text.
- `csv-viewer`: A real table for delimited data, with sortable columns, a sticky header, and a row cap so a large file cannot lock the page.
- `json-viewer`: A collapsible tree for a JSON payload, navigable from the keyboard, where every row can hand you its path.
- `docx-viewer`: Renders a Word document as elements built through an allowlist, so a file you did not write cannot bring its own scripts or links.
- `pdf-viewer`: Page-by-page PDF rendering on a canvas, with paging and zoom, over any loader you give it.
- `markdown-blocks`: Extracted document regions rendered as markdown, each one selectable so it can be tied back to where it came from.

## Files

Getting a file in, and showing what arrived.

- `file-upload`: A file picker and dropzone with clear validation and a visible queue. Connect your upload function when you need progress, cancel, and retry.
- `file-thumbnail`: A compact image preview for attachments, upload queues, and file lists. Browser image files work without any setup.

## Feedback

What the page says while it waits, and when there is nothing to show.

- `empty-state`: What to show when there is nothing yet: what this place is for, and the way to fill it.
- `empty-row`: One line saying a list came back empty, for a table, a list, or a popover.
- `not-found`: The page-scale empty state: a status, a heading you can read across a room, and somewhere to go.
- `spinner`: The smallest way to say something is happening, for a control that is working.
- `shimmering-text`: Words with a light moving across them, for the wait between asking and the first token.
- `skeleton`: A placeholder the shape of what is coming, so the page does not jump when it arrives.
- `status-pill`: A dot and a few words: operational, degraded, closed.

## Controls

Familiar inputs with more feedback than usual, and none of it required to operate them.

- `magnetic-tabs`: Familiar tabs with a gentle pull toward the pointer. Selection stays clear and keyboard navigation remains immediate.
- `elastic-slider`: A precise slider with a small amount of give at either end. The current value stays visible and the control works without a pointer.
- `hold-button`: A confirmation button for actions that deserve a second thought. Release early to cancel, or activate once with a keyboard.
- `shift-button`: A call to action that trades its leading icon for a directional cue when someone approaches it.
- `impossible-checkbox`: A checkbox with one stubborn rule: the bear will not let you leave it on. Best kept for demos, Easter eggs, and harmless preferences.
- `theme-toggle`: A light and dark switch that survives a reload, follows the system when asked, and stays in step across tabs.
- `accordion`: A list of disclosures built on native details elements, so find-in-page and the browser do the work.
- `copy-button`: Copies a value and says whether it worked, including when the clipboard refuses.
- `secret-field`: An API key or token: hidden until asked for, copied whole either way.
- `scrub-bar`: The seek control on its own: a slider that happens to be a timeline, announced in minutes and seconds.
- `otp-input`: A one time code, one box per character, where pasting the whole code into any box fills the rest.
- `tag-input`: An input that turns what you typed into a removable tag, and gives the last one back when you press backspace on an empty field.
- `combobox`: A field that narrows a list as you type, and holds one choice or several as removable chips.
- `sortable-list`: A list reordered by dragging a handle, or from the keyboard without one, where every move is announced.
- `stepper`: Where someone is in something with a beginning and an end, said in words as well as drawn.

## Wayfinding

Knowing where you are in something long, and getting somewhere else quickly.

- `floating-index`: A compact outline for long pages. It keeps the active section and reading progress visible without becoming another permanent sidebar.
- `command-palette`: A search dialog over anything you can list, opened from a keyboard shortcut, with ranked matches and hidden keywords.
- `scroll-to-top-button`: A floating way back after someone has moved down a long page or scroll area. It stays hidden near the top.
- `pagination`: Page numbers with gaps where the run is broken, as buttons or as your own links.
- `side-panel`: A pane that comes in from the side: an inspector, a filter set, a row's detail.

## Docs

The furniture of a documentation site, taken out of this one.

- `install-command`: The install line for a library, switchable between package managers, with the runner and the installer kept apart.
- `copy-for-ai`: Hands the page to an assistant as markdown, by clipboard, by link, or by opening it somewhere that can read it.
- `table-of-contents`: An outline of the page that keeps up with the reader, marking the section they are in as they scroll.
- `component-preview`: A framed example with a tab for the source beside it, and the live one still running when you switch back.
- `kbd`: A keyboard chord rendered with the right glyphs for the reader's platform, and spoken in words.

## Blocks

Larger pieces that compose several components into one part of a page.

- `signature-footer`: A complete closing section with room for the useful links first and one oversized wordmark at the end.
- `image-gallery`: A responsive image collection with equal and masonry layouts, plus a lightbox that handles focus, keyboard navigation, and scroll locking.
- `footer-columns`: Labelled columns of links, with the column count and the link rendering left to you.
- `footer-row`: A wrapping row of links under its own label, set apart by a dashed rule.
- `footer-wordmark`: The oversized brand word that closes a page, drawn as texture rather than content.
- `image-grid`: Thumbnails in even cells or masonry columns, with nothing but React behind them.
- `lightbox`: One image at a time, full bleed, with the rest of the set a key away.
- `resizable-panels`: Two panels and something to drag between them, where the divider is a real separator that also works from the keyboard.
- `avatar-stack`: Overlapping faces with a count for the rest, and the names underneath as a real list.
- `timeline`: Things that happened, in the order they happened, with the state of each one said aloud rather than left in a coloured dot.
- `data-table`: Typed rows with cells you write, column widths you set or the reader drags, sorting that is one property to switch on, and selection kept in keys rather than positions.

## Scenes

Backdrops and moments where the drawing is the job, each one taking its colours from the theme it was installed into.

- `render-surface`: The canvas the other scenes are drawn on. It stays the size of its box, sleeps when nobody is looking at it, and holds still when motion is reduced.
- `aurora-field`: A drifting gradient backdrop for a hero or an empty state, built from the colours already in your theme rather than from a palette it brought with it.
- `grain-overlay`: Film grain for any positioned box, which incidentally fixes the banding a wide gradient shows on a good monitor.
- `spotlight-card`: A card that catches a light following the pointer, and can light every card in its grid from the same pointer at once.
- `constellation-field`: Drifting points joined by lines when they come close, brightening and swelling around the pointer.
- `burst`: A short burst of pieces for the moment something finally completes. It draws nothing until it is fired and stops as soon as the last piece falls out of the box.
- `shader-surface`: Four shader backdrops -- caustics, metal, plasma and ripple -- each taking its two colours from your theme, so the same surface arrives dark in a dark application and light in a light one.
- `displacement-image`: Two images crossing by pushing their pixels through the same noise in opposite directions, with the first image also present as ordinary markup for anything that cannot run it.
- `scene-hero`: A lit three-dimensional object behind a headline, steered by the pointer and coloured by the theme. The one component here that asks for three.
- `scroll-scene`: Turns the scrolling of a tall element into a number between nought and one, published to a custom property and to a callback, without rendering the page to do it.
- `tilt-card`: A card that leans toward the pointer as though it were a physical object lying on the page.
- `connection-beam`: A line between two elements with something travelling along it, measured from the elements rather than given as coordinates.
- `cursor-trail`: A fading mark behind the pointer, drawn only inside its own box and only while the pointer is in it.
- `metaballs`: Blobs that swell into one another as they meet, taking their two colours from your theme.
- `dither-image`: A photograph reduced to two theme colours through an ordered dither, the way a newspaper reduced one to ink and paper.
- `ascii-image`: A photograph redrawn as characters. The grid is worked out once and kept, so each frame is a single copy rather than thousands of letters measured again.
- `wireframe-globe`: A wireframe world with places marked on it, arcs between them, and the same places written out underneath as text.

## Motion

Entrances and numbers that move, driven by arrival or by scrolling, and never by withholding the content.

- `reveal`: Moves its children in when they arrive on screen. It changes how something arrives and never whether it is there.
- `split-text`: A heading animated one character, word, or line at a time, and still announced as one sentence rather than as a pile of single letters.
- `marquee`: A row that runs on its own, seamlessly, and turns back into an ordinary scrolling row for anyone who asked for less motion.
- `number-ticker`: Counts to a number rather than replacing it, in whatever currency or format you asked for.
