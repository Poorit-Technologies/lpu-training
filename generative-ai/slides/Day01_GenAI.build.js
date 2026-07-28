const pptxgen = require("pptxgenjs");
const fs = require("fs");

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.author = "Bhupendra Dahal";
pres.title = "Generative AI — Day 1";

const W = 13.33, H = 7.5, M = 0.6;
const INK = "1E293B", MUTED = "64748B", ACCENT = "6366F1", ACC2 = "8B8FF5", CYAN = "0891B2",
      LINE = "E2E8F0", TINT = "F8FAFC", CARD = "F1F5F9", ACCTINT = "EEF0FF", CODEBG = "F3F4F6",
      WHITE = "FFFFFF", GREEN = "15803D", GREENBG = "F0FDF4", REDBG = "FEF2F2", RED = "B91C1C";
const HEAD = "Calibri", BODY = "Calibri", MONO = "Courier New";

function footer(s, n) {
  s.addText("Generative AI · Day 1", { x: M, y: H - 0.42, w: 6, h: 0.25, fontFace: BODY, fontSize: 9, color: MUTED, margin: 0 });
  s.addText(String(n), { x: W - M - 0.5, y: H - 0.42, w: 0.5, h: 0.25, fontFace: BODY, fontSize: 9, color: MUTED, align: "right", margin: 0 });
}
function h1(s, t) { s.addText(t, { x: M, y: 0.5, w: W - 2 * M, h: 0.8, fontFace: HEAD, fontSize: 30, bold: true, color: INK, margin: 0 }); }
function badge(s, x, y, d, txt, fill) {
  s.addShape("roundRect", { x, y, w: d, h: d, fill: { color: fill }, line: { type: "none" }, rectRadius: d / 2 });
  s.addText(txt, { x, y, w: d, h: d, fontFace: HEAD, fontSize: d > 0.7 ? 18 : 15, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0 });
}
function card(s, x, y, w, h, fill, line) {
  s.addShape("roundRect", { x, y, w, h, fill: { color: fill }, line: line ? { color: line, width: 1 } : { type: "none" }, rectRadius: 0.1 });
}
function codebox(s, x, y, w, h, txt) {
  s.addShape("roundRect", { x, y, w, h, fill: { color: CODEBG }, line: { color: LINE, width: 1 }, rectRadius: 0.06 });
  s.addText(txt, { x: x + 0.28, y: y + 0.2, w: w - 0.56, h: h - 0.4, fontFace: MONO, fontSize: 13, color: INK, margin: 0, align: "left", valign: "top", lineSpacingMultiple: 1.15 });
}
function bullets(arr) { return arr.map((e, i) => ({ text: e, options: { bullet: { code: "2022" }, breakLine: i < arr.length - 1, paraSpaceAfter: 10 } })); }
function divider(num, t, notes) {
  const s = pres.addSlide(); s.background = { color: ACCTINT };
  s.addText(num, { x: M, y: 2.0, w: 4, h: 1.9, fontFace: HEAD, fontSize: 96, bold: true, color: ACCENT, margin: 0 });
  s.addText(t, { x: M + 0.06, y: 4.0, w: 11.6, h: 1.0, fontFace: HEAD, fontSize: 34, bold: true, color: INK, margin: 0 });
  if (notes) s.addNotes(notes); return s;
}
function checkSlide(n, q, opts, notes) {
  const s = pres.addSlide();
  s.addText("Quick check", { x: M, y: 0.5, w: 6, h: 0.5, fontFace: HEAD, fontSize: 16, bold: true, color: ACCENT, margin: 0 });
  s.addText(q, { x: M, y: 1.15, w: W - 2 * M, h: 1.0, fontFace: HEAD, fontSize: 26, bold: true, color: INK, margin: 0 });
  const L = ["A", "B", "C", "D"];
  opts.forEach((o, i) => { const y = 2.7 + i * 0.95; badge(s, M, y, 0.6, L[i], ACCENT); s.addText(o, { x: M + 0.85, y, w: 10.5, h: 0.6, fontFace: BODY, fontSize: 18, color: INK, valign: "middle", margin: 0 }); });
  if (notes) s.addNotes(notes); footer(s, n); return s;
}
let s;

// 1 · Title (light)
s = pres.addSlide();
s.addText("Generative AI", { x: M, y: 2.6, w: 11, h: 1.2, fontFace: HEAD, fontSize: 60, bold: true, color: INK, margin: 0 });
s.addText("Day 1 · Foundations, calling LLMs, and where it breaks", { x: M, y: 3.9, w: 11, h: 0.6, fontFace: BODY, fontSize: 20, color: ACCENT, margin: 0 });
s.addText([{ text: "Lovely Professional University", options: { bold: true, color: INK } }, { text: "    ·    Backend & Generative AI    ·    Poorit Technologies", options: { color: MUTED } }], { x: M, y: 6.4, w: 12, h: 0.4, fontFace: BODY, fontSize: 13, margin: 0 });
s.addNotes("Welcome. Set the tone: over 2 weeks we build real AI apps and a real backend; today is Generative AI from zero. Energy up. (Your personal intro is the separate slide.)");

// 2 · Hook (light)
s = pres.addSlide();
s.addText("What can AI do today —", { x: 1.0, y: 2.5, w: W - 2, h: 1.1, fontFace: HEAD, fontSize: 44, bold: true, color: INK, align: "center", margin: 0 });
s.addText("and what can it still not do?", { x: 1.0, y: 3.6, w: W - 2, h: 1.1, fontFace: HEAD, fontSize: 44, bold: true, color: ACCENT, align: "center", margin: 0 });
s.addText("no wrong answers — say what you think", { x: 1.0, y: 5.0, w: W - 2, h: 0.5, fontFace: BODY, fontSize: 16, italic: true, color: MUTED, align: "center", margin: 0 });
s.addNotes("Think-pair-share (1 min think, 2 min pair). Draw two columns on the board: CAN / CAN'T. If the room is quiet, prime it: 'you used AI this week — where?'. Seed answers — CAN: write/summarize text, code, translate, extract data, analyze images, brainstorm, tutor. CAN'T reliably: guarantee facts (hallucinates), exact math/counting, know real-time or your private data, take accountability, act on your systems without tools. Say: 'hold both lists — we'll test them all day, especially CAN'T.'");

// 3 · Timeline
s = pres.addSlide(); h1(s, "How we got here");
const tl = [["2022", "ChatGPT\nlaunches"], ["2023", "GPT-4 —\nthe race begins"], ["2024", "Multimodal, AI\nagents, ~1M context"], ["2025", "Reasoning models,\ncheap & fast"], ["2026", "Today: Opus 5 ·\nGPT-5.6 · Gemini 3.6"]];
const xs = [1.3, 4.0, 6.7, 9.4, 12.0];
s.addShape("rect", { x: 1.3, y: 3.685, w: 10.7, h: 0.03, fill: { color: LINE }, line: { type: "none" } });
tl.forEach((t, i) => { const x = xs[i], last = i === 4; s.addText(t[0], { x: x - 1.0, y: 2.75, w: 2.0, h: 0.5, fontFace: HEAD, fontSize: 20, bold: true, color: last ? ACCENT : INK, align: "center", margin: 0 }); const d = last ? 0.34 : 0.24; s.addShape("roundRect", { x: x - d / 2, y: 3.7 - d / 2, w: d, h: d, fill: { color: last ? ACCENT : MUTED }, line: { color: WHITE, width: 1.5 }, rectRadius: d / 2 }); s.addText(t[1], { x: x - 1.2, y: 4.05, w: 2.4, h: 1.1, fontFace: BODY, fontSize: 13, color: last ? INK : MUTED, bold: last, align: "center", margin: 0 }); });
s.addText("Three years — from a chat toy to systems that reason, see, and act.", { x: M, y: 5.7, w: 12, h: 0.5, fontFace: BODY, fontSize: 15, italic: true, color: MUTED, margin: 0 });
footer(s, 3);
s.addNotes("Anchor the pace: three years from ChatGPT to today. Ask: 'who used ChatGPT in 2022? what's changed since?' Point out 2026 is highlighted — the frontier moves monthly. This sets up why the failures at the end still matter.");

// 4 · Divider 01
divider("01", "What Generative AI is", "We start with the mental model: where GenAI sits inside AI/ML, and the one distinction that matters — predicting vs generating.");

// 5 · AI to GenAI
s = pres.addSlide(); h1(s, "From AI to Generative AI");
const defs = [["Artificial Intelligence", "any machine doing a “smart” task", ACCENT], ["Machine Learning", "learns patterns from data", ACCENT], ["Deep Learning", "ML using neural networks", CYAN], ["Generative AI", "deep learning that creates new content", ACCENT]];
defs.forEach((d, i) => { const y = 1.9 + i * 1.15; s.addText(d[0], { x: M, y, w: 6.0, h: 0.45, fontFace: HEAD, fontSize: 18, bold: true, color: d[2], margin: 0 }); s.addText(d[1], { x: M, y: y + 0.46, w: 6.0, h: 0.5, fontFace: BODY, fontSize: 14, color: INK, margin: 0 }); });
[[7.3, 1.75, 5.4, 5.0, ACCENT, "AI"], [7.95, 2.4, 4.1, 3.7, ACC2, "ML"], [8.6, 3.05, 2.8, 2.4, CYAN, "Deep Learning"]].forEach((b) => { s.addShape("roundRect", { x: b[0], y: b[1], w: b[2], h: b[3], fill: { color: b[4], transparency: 90 }, line: { color: b[4], width: 1.5 }, rectRadius: 0.06 }); s.addText(b[5], { x: b[0] + 0.15, y: b[1] + 0.1, w: b[2] - 0.3, h: 0.35, fontFace: HEAD, fontSize: 12, bold: true, color: b[4], margin: 0 }); });
s.addShape("roundRect", { x: 9.25, y: 3.7, w: 1.9, h: 1.15, fill: { color: ACCENT }, line: { type: "none" }, rectRadius: 0.06 });
s.addText("GenAI", { x: 9.25, y: 3.7, w: 1.9, h: 1.15, fontFace: HEAD, fontSize: 15, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0 });
footer(s, 5);
s.addNotes("Draw the nesting live if you like. Key line: 'GenAI is the same neural-net machinery you know — pointed at a new goal: generate content instead of predicting one value.' Tie ML back to anything they've seen (spam filters, recommendations).");

// 6 · Two kinds of model
s = pres.addSlide(); h1(s, "Two kinds of model");
[["Discriminative", "draws a boundary → a label or number", ["Regression → a number  (house price)", "Classification → a category  (spam / not-spam)"], INK, TINT, LINE], ["Generative", "models the data → new content", ["Write the email", "Generate the code", "Create the image"], ACCENT, ACCTINT, ACCENT]].forEach((c, i) => { const x = M + i * 6.15; card(s, x, 1.9, 5.9, 4.3, c[4], c[5]); s.addText(c[0], { x: x + 0.35, y: 2.15, w: 5.2, h: 0.5, fontFace: HEAD, fontSize: 22, bold: true, color: c[3], margin: 0 }); s.addText(c[1], { x: x + 0.35, y: 2.7, w: 5.2, h: 0.5, fontFace: BODY, fontSize: 15, italic: true, color: MUTED, margin: 0 }); s.addText(bullets(c[2]), { x: x + 0.35, y: 3.4, w: 5.2, h: 2.6, fontFace: BODY, fontSize: 16, color: INK, margin: 0 }); });
footer(s, 6);
s.addNotes("The core distinction of the day. Ask: 'predicting a house price vs writing its listing — what's fundamentally different about the output?' Answer: a value/label vs new content. Everything today lives on the right side.");

// 7 · Q1
checkSlide(7, "Which of these is a generative task?", ["Detect whether an email is spam", "Predict a house price from its size", "Write a product description", "Classify a photo as cat or dog"],
  "Answer: C — Write a product description (it creates new content). A, B, D output a label or number (discriminative). Ask why the others aren't generative before revealing. Discussion: 'give me another generative task from your own life.'");

// 8 · Divider 02
divider("02", "How LLMs work", "Just enough of the engine to build well: tokens, next-token prediction, context, and why they hallucinate.");

// 9 · LLM next token
s = pres.addSlide(); h1(s, "An LLM predicts the next token");
["The", "cat", "sat", "on", "the"].forEach((t, i) => { const x = M + i * 1.6; card(s, x, 2.7, 1.4, 0.95, TINT, LINE); s.addText(t, { x, y: 2.7, w: 1.4, h: 0.95, fontFace: BODY, fontSize: 17, color: INK, align: "center", valign: "middle", margin: 0 }); });
s.addShape("rightArrow", { x: M + 5 * 1.6 + 0.05, y: 2.95, w: 0.95, h: 0.45, fill: { color: MUTED }, line: { type: "none" } });
s.addShape("roundRect", { x: M + 5 * 1.6 + 1.2, y: 2.7, w: 1.7, h: 0.95, fill: { color: ACCENT }, line: { type: "none" }, rectRadius: 0.06 });
s.addText("? next", { x: M + 5 * 1.6 + 1.2, y: 2.7, w: 1.7, h: 0.95, fontFace: HEAD, fontSize: 18, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0 });
s.addText("Do that billions of times, one token at a time → paragraphs, code, conversation. The intelligence is emergent.", { x: M, y: 4.4, w: 11.5, h: 0.8, fontFace: BODY, fontSize: 17, color: INK, margin: 0 });
footer(s, 9);
s.addNotes("Demystify it: 'it just predicts the next chunk of text, over and over.' Then the punch: 'yet from that simple objective you get code and reasoning — that's emergence.' Ask: 'if it only predicts the next word, how can it debug code?'");

// 10 · Tokens
s = pres.addSlide(); h1(s, "Tokens — what you pay for");
s.addText(bullets(["Models see tokens, not letters or words.", "You pay per token; context is measured in tokens.", "Non-English text uses more tokens — so it costs more."]), { x: M, y: 2.0, w: 6.6, h: 3.0, fontFace: BODY, fontSize: 18, color: INK, margin: 0 });
card(s, 7.7, 2.0, 5.0, 2.4, ACCTINT, ACCENT);
s.addText("1 token ≈ ¾ word", { x: 7.7, y: 2.5, w: 5.0, h: 1.0, fontFace: HEAD, fontSize: 32, bold: true, color: ACCENT, align: "center", margin: 0 });
s.addText("Live: platform.openai.com/tokenizer", { x: 7.7, y: 4.55, w: 5.0, h: 0.4, fontFace: BODY, fontSize: 13, italic: true, color: MUTED, align: "center", margin: 0 });
footer(s, 10);
s.addNotes("Do the live tokenizer: paste 'Generative AI', then a line of code, then Hindi/regional text — watch counts rise. Ask: 'Hindi uses ~2x tokens — what does that do to your bill at scale?' This motivates cost thinking + the open-source discussion next.");

// 11 · Q2
checkSlide(11, "What does a larger context window let a model do?", ["Run faster", "Consider more text at once", "Cost less per token", "Never hallucinate"],
  "Answer: B — consider more text at once (its working memory). Clarify: bigger context ≠ faster or cheaper (often the opposite), and it does NOT stop hallucination. Discussion: 'what would you put in a 1M-token context?' (a whole codebase, a book).");

// 12 · Divider 03
divider("03", "The model landscape", "Two families of models — closed (proprietary) and open (open-weight). Understanding the trade-off is a real engineering decision.");

// 13 · Closed-source models
s = pres.addSlide(); h1(s, "Closed-source models");
s.addText("Proprietary · use via API · weights are private", { x: M, y: 1.35, w: 12, h: 0.4, fontFace: BODY, fontSize: 16, italic: true, color: MUTED, margin: 0 });
["Claude Opus 5\nAnthropic", "GPT-5.6\nOpenAI", "Gemini 3.6\nGoogle"].forEach((m, i) => { const x = M + i * 4.15; card(s, x, 2.0, 3.8, 1.3, ACCTINT, ACCENT); s.addText(m, { x, y: 2.0, w: 3.8, h: 1.3, fontFace: HEAD, fontSize: 16, bold: true, color: INK, align: "center", valign: "middle", margin: 0 }); });
s.addText([{ text: "Good: ", options: { bold: true, color: GREEN } }, { text: "frontier capability · easiest to start (just an API key) · no infra to run.", options: { color: INK } }], { x: M, y: 3.7, w: 12, h: 0.5, fontFace: BODY, fontSize: 16, margin: 0 });
s.addText([{ text: "Cost: ", options: { bold: true, color: RED } }, { text: "pay per token · your data leaves your infra · no self-hosting or full fine-tune · vendor lock-in.", options: { color: INK } }], { x: M, y: 4.4, w: 12, h: 0.5, fontFace: BODY, fontSize: 16, margin: 0 });
footer(s, 13);
s.addNotes("These are the models we call in the notebook. 'Closed' = you rent intelligence over an API; you never see the weights. Great to start, but you're sending data out and paying per token. Contrast coming up with open models.");

// 14 · Open-source models
s = pres.addSlide(); h1(s, "Open-source (open-weight) models");
s.addText("Weights are public · download, self-host, fine-tune", { x: M, y: 1.35, w: 12, h: 0.4, fontFace: BODY, fontSize: 16, italic: true, color: MUTED, margin: 0 });
["Llama\nMeta", "Mistral", "Qwen\nAlibaba", "DeepSeek", "Gemma\nGoogle"].forEach((m, i) => { const x = M + i * 2.44; card(s, x, 2.0, 2.25, 1.3, TINT, CYAN); s.addText(m, { x, y: 2.0, w: 2.25, h: 1.3, fontFace: HEAD, fontSize: 15, bold: true, color: INK, align: "center", valign: "middle", margin: 0 }); });
s.addText([{ text: "Good: ", options: { bold: true, color: GREEN } }, { text: "run on your own hardware · data stays private · fine-tune & customize · no lock-in.", options: { color: INK } }], { x: M, y: 3.7, w: 12, h: 0.5, fontFace: BODY, fontSize: 16, margin: 0 });
s.addText([{ text: "Cost: ", options: { bold: true, color: RED } }, { text: "you manage infra/GPUs · often behind the frontier · more setup effort.", options: { color: INK } }], { x: M, y: 4.4, w: 12, h: 0.5, fontFace: BODY, fontSize: 16, margin: 0 });
s.addText("“Open-weight” = weights are public; the training data/code often aren't (so not always fully “open-source”).", { x: M, y: 5.3, w: 12, h: 0.5, fontFace: BODY, fontSize: 13, italic: true, color: MUTED, margin: 0 });
footer(s, 14);
s.addNotes("'Open' = you own the model file; run it offline, fine-tune it, keep data in-house. Trade-off: you need GPUs and ops. Note the 'open-weight vs open-source' nuance so they use the term correctly. Ask: 'a hospital chatbot on patient data — closed or open? why?'");

// 15 · Closed vs Open comparison
s = pres.addSlide(); h1(s, "Closed vs Open — the trade-off");
const cvh = (t, c) => ({ text: t, options: { bold: true, color: WHITE, fill: { color: c || INK }, fontSize: 14, valign: "middle" } });
const cvc = (t, b) => ({ text: t, options: { color: INK, fontSize: 14, valign: "middle", bold: !!b, fill: { color: WHITE } } });
s.addTable([[cvh(""), cvh("Closed (proprietary)", ACCENT), cvh("Open (open-weight)", CYAN)],
  [cvc("Capability", 1), cvc("frontier / best"), cvc("strong, catching up")],
  [cvc("Start effort", 1), cvc("API key — minutes"), cvc("set up infra")],
  [cvc("Cost", 1), cvc("pay per token"), cvc("your hardware")],
  [cvc("Data / privacy", 1), cvc("leaves your infra"), cvc("stays with you")],
  [cvc("Customize", 1), cvc("limited"), cvc("full fine-tune")],
  [cvc("Lock-in", 1), cvc("yes"), cvc("no")]],
  { x: M, y: 1.7, w: W - 2 * M, colW: [2.6, 4.75, 4.75], rowH: 0.6, border: { type: "solid", color: LINE, pt: 1 }, fontFace: BODY, margin: [3, 8, 3, 8] });
footer(s, 15);
s.addNotes("Walk the rows. The headline: there's no 'best' — it's capability & convenience (closed) vs control & privacy (open). Have them vote row-by-row on what matters most for a project they care about.");

// 16 · When to use which
s = pres.addSlide(); h1(s, "When to use which");
[["Choose CLOSED when…", ["you need the hardest reasoning", "you want to ship fast", "volume is low or spiky", "you have no infra/ops team"], ACCENT, ACCTINT], ["Choose OPEN when…", ["privacy / compliance matters", "high steady volume (cost at scale)", "you need fine-tuning", "on-prem / offline / no lock-in"], CYAN, TINT]].forEach((c, i) => { const x = M + i * 6.15; card(s, x, 1.9, 5.9, 4.0, c[3], c[2]); s.addText(c[0], { x: x + 0.35, y: 2.15, w: 5.2, h: 0.5, fontFace: HEAD, fontSize: 19, bold: true, color: c[2], margin: 0 }); s.addText(bullets(c[1]), { x: x + 0.35, y: 2.9, w: 5.2, h: 2.8, fontFace: BODY, fontSize: 16, color: INK, margin: 0 }); });
footer(s, 16);
s.addNotes("Frame it as an engineering decision, not fandom. Real teams mix both (closed for hard tasks, open for high-volume/private). Ask each pair to pick a use case and justify closed vs open.");

// 17 · Q3
checkSlide(17, "A key advantage of open-weight models is…", ["They are always more capable", "You can self-host and keep data private", "They need no setup at all", "They are free to call via API"],
  "Answer: B — self-host & keep data private. Bust the myths in the others: not always more capable (A), they need infra (C), 'free API' is the closed convenience not open (D). Discussion: 'name a domain where privacy alone forces open models.'");

// 18 · Divider 04
divider("04", "Using LLMs in code", "From concept to code: one client for any provider, LiteLLM to switch freely, and structured output so code can trust the result.");

// 19 · One client, any provider
s = pres.addSlide(); h1(s, "One client, any provider");
[["OpenAI client", "the standard call", ACCENT], ["Same client → Gemini", "change key + base_url + model", ACC2], ["LiteLLM", "swap the model string", CYAN]].forEach((p, i) => { const x = M + i * 4.15; card(s, x, 2.1, 3.7, 2.5, TINT, LINE); badge(s, x + 0.3, 2.35, 0.6, String(i + 1), p[2]); s.addText(p[0], { x: x + 1.05, y: 2.38, w: 2.5, h: 0.55, fontFace: HEAD, fontSize: 16, bold: true, color: INK, valign: "middle", margin: 0 }); s.addText(p[1], { x: x + 0.3, y: 3.25, w: 3.1, h: 1.1, fontFace: BODY, fontSize: 14, color: MUTED, margin: 0 }); if (i < 2) s.addShape("rightArrow", { x: x + 3.72, y: 3.15, w: 0.42, h: 0.5, fill: { color: MUTED }, line: { type: "none" } }); });
s.addText([{ text: "Only 3 lines change.  ", options: { bold: true, color: INK } }, { text: "That's why the “OpenAI format” became the industry standard.", options: { color: INK } }], { x: M, y: 5.1, w: 12, h: 0.5, fontFace: BODY, fontSize: 17, margin: 0 });
footer(s, 19);
s.addNotes("The big idea before the code: providers converged on one request shape. So you learn ONE interface and reach everyone. Next two slides show the actual syntax.");

// 20 · OpenAI client syntax
s = pres.addSlide(); h1(s, "The OpenAI client — the basics");
codebox(s, M, 1.7, 7.4, 4.6, "pip install openai\n\nfrom openai import OpenAI\nclient = OpenAI()   # reads OPENAI_API_KEY\n\nresp = client.chat.completions.create(\n    model=\"gpt-4o-mini\",\n    messages=[\n        {\"role\": \"system\", \"content\": \"You are helpful.\"},\n        {\"role\": \"user\",   \"content\": \"Explain APIs in 2 lines.\"},\n    ],\n)\nprint(resp.choices[0].message.content)");
s.addText(bullets(["client — your connection (holds the key)", "model — which model to call", "messages — the chat, with roles: system / user / assistant", "response — resp.choices[0].message.content"]), { x: 8.3, y: 1.9, w: 4.4, h: 4.0, fontFace: BODY, fontSize: 15, color: INK, margin: 0 });
footer(s, 20);
s.addNotes("Walk the 4 parts on the right. 'system' = the model's instructions/persona; 'user' = the question. Everything else you'll do (tools, JSON) is a small addition to this same call. This is the exact shape in the notebook.");

// 21 · LiteLLM syntax + when
s = pres.addSlide(); h1(s, "LiteLLM — one call, many providers");
codebox(s, M, 1.7, 7.4, 3.0, "pip install litellm\n\nfrom litellm import completion\nr = completion(\n    model=\"gemini/gemini-2.0-flash\",  # or openai/gpt-4o-mini\n    messages=[{\"role\": \"user\", \"content\": \"Hello\"}],\n)\nprint(r.choices[0].message.content)");
card(s, 8.3, 1.7, 4.4, 3.0, ACCTINT, ACCENT);
s.addText("Use LiteLLM when…", { x: 8.55, y: 1.9, w: 4.0, h: 0.4, fontFace: HEAD, fontSize: 15, bold: true, color: ACCENT, margin: 0 });
s.addText(bullets(["you call multiple providers", "you want easy switching", "you need cost tracking / fallbacks", "you want to avoid lock-in"]), { x: 8.55, y: 2.45, w: 3.9, h: 2.2, fontFace: BODY, fontSize: 14, color: INK, margin: 0 });
s.addText("Single provider, simple app? Just use that provider's SDK.", { x: M, y: 5.1, w: 12, h: 0.5, fontFace: BODY, fontSize: 15, italic: true, color: MUTED, margin: 0 });
footer(s, 21);
s.addNotes("Same OpenAI-shaped call — only the model string changed. LiteLLM shines for multi-provider, fallbacks, and cost control. But don't over-engineer: one provider + simple app = just its SDK. Ask: 'your app is on GPT and Gemini gets cheaper — how much changes with LiteLLM?' (one string).");

// 22 · Structured output concept
s = pres.addSlide(); h1(s, "Structured output with Pydantic");
[["Messy\nfree text", TINT, INK, LINE], ["Pydantic model\n(the contract)", ACCENT, WHITE, ACCENT], ["Typed object\nyour code trusts", CYAN, WHITE, CYAN]].forEach((f, i) => { const x = M + i * 4.25; s.addShape("roundRect", { x, y: 2.4, w: 3.6, h: 1.8, fill: { color: f[1] }, line: { color: f[3], width: 1 }, rectRadius: 0.1 }); s.addText(f[0], { x, y: 2.4, w: 3.6, h: 1.8, fontFace: HEAD, fontSize: 18, bold: true, color: f[2], align: "center", valign: "middle", margin: 0 }); if (i < 2) s.addShape("rightArrow", { x: x + 3.62, y: 3.05, w: 0.5, h: 0.5, fill: { color: MUTED }, line: { type: "none" } }); });
s.addText("Ask for JSON → validate into an object → use it safely. This is how AI plugs into a real backend.", { x: M, y: 4.9, w: 12, h: 0.6, fontFace: BODY, fontSize: 17, color: INK, margin: 0 });
footer(s, 22);
s.addNotes("The problem: free text is unusable by code. The fix: define the shape you want (a Pydantic model), ask for JSON, validate. If validation fails, you catch it — not your users. Code next.");

// 23 · Structured output code
s = pres.addSlide(); h1(s, "Structured output — in code");
codebox(s, M, 1.7, 7.6, 4.7, "from pydantic import BaseModel\n\nclass Recipe(BaseModel):\n    title: str\n    ingredients: list[str]\n    minutes: int\n\nresp = client.chat.completions.create(\n    model=\"gpt-4o-mini\",\n    messages=[{\"role\": \"user\",\n        \"content\": \"Pasta recipe as JSON: title, ingredients, minutes\"}],\n    response_format={\"type\": \"json_object\"},\n)\nrecipe = Recipe.model_validate_json(resp.choices[0].message.content)\nprint(recipe.title, recipe.minutes)");
s.addText(bullets(["Define the shape (the contract)", "response_format = JSON", "model_validate_json → typed object", "recipe.title is now safe to use"]), { x: 8.5, y: 2.0, w: 4.2, h: 3.6, fontFace: BODY, fontSize: 15, color: INK, margin: 0 });
footer(s, 23);
s.addNotes("Read it top-down: shape → ask for JSON → validate → use. Emphasize model_validate_json: it turns text into a checked object. This is the bridge from 'AI toy' to 'AI in a backend'.");

// 24 · Q4
checkSlide(24, "How do you get trustworthy structured data from an LLM?", ["Trust the text and hope", "Ask for JSON and validate it with Pydantic", "Raise the temperature", "Ask the same question twice"],
  "Answer: B — ask for JSON + validate with Pydantic. Why not the others: hope isn't a plan (A); temperature adds randomness (C); asking twice doesn't guarantee structure (D). Discussion: 'what should your code do if validation fails?' (reject / retry / fallback).");

// 25 · Divider 05
divider("05", "Prompting well", "The cheapest way to better output: not a bigger model — a better prompt. A structure you can reuse every time.");

// 26 · Weak vs strong
s = pres.addSlide(); h1(s, "Prompt engineering: weak vs strong");
card(s, M, 1.9, 5.9, 2.9, REDBG, "FECACA");
s.addText("WEAK", { x: M + 0.35, y: 2.1, w: 5, h: 0.4, fontFace: HEAD, fontSize: 15, bold: true, color: RED, margin: 0 });
s.addText("“tell me about sorting”", { x: M + 0.35, y: 2.6, w: 5.2, h: 0.5, fontFace: MONO, fontSize: 14, color: INK, margin: 0 });
s.addText("→ a vague wall of text", { x: M + 0.35, y: 3.3, w: 5.2, h: 0.5, fontFace: BODY, fontSize: 14, italic: true, color: MUTED, margin: 0 });
card(s, 6.85, 1.9, 5.9, 2.9, GREENBG, "BBF7D0");
s.addText("STRONG", { x: 7.2, y: 2.1, w: 5, h: 0.4, fontFace: HEAD, fontSize: 15, bold: true, color: GREEN, margin: 0 });
s.addText("“You are a DSA tutor. Explain bubble sort to a 2nd-year student in exactly 3 bullets, then give its time complexity.”", { x: 7.2, y: 2.6, w: 5.2, h: 1.6, fontFace: MONO, fontSize: 12.5, color: INK, margin: 0 });
s.addText([{ text: "Same model.  ", options: { bold: true, color: INK } }, { text: "The prompt was the whole difference.", options: { color: INK } }], { x: M, y: 5.1, w: 12, h: 0.5, fontFace: BODY, fontSize: 18, margin: 0 });
footer(s, 26);
s.addNotes("Run both live in the notebook if time allows. The lesson: you don't always need a bigger/pricier model — you need a clearer prompt. Sets up the reusable framework next.");

// 27 · Prompt framework
s = pres.addSlide(); h1(s, "A prompt framework you can reuse");
[["Role", "who the model should be", "“You are a senior Python tutor.”"], ["Task", "what to do", "“Explain decorators.”"], ["Context", "the data / constraints", "“For a 2nd-year student, 100 words.”"], ["Format", "how to return it", "“3 bullets, then one code example.”"]].forEach((r, i) => { const y = 1.8 + i * 1.05; badge(s, M, y, 0.7, String(i + 1), ACCENT); s.addText([{ text: r[0] + " — ", options: { bold: true, color: ACCENT } }, { text: r[1], options: { color: INK } }], { x: M + 0.95, y, w: 6.0, h: 0.7, fontFace: BODY, fontSize: 17, valign: "middle", margin: 0 }); s.addText(r[2], { x: 7.3, y, w: 5.4, h: 0.7, fontFace: MONO, fontSize: 12.5, color: MUTED, italic: true, valign: "middle", margin: 0 }); });
s.addText("Add Examples (few-shot) when the task is fuzzy — we go deeper on Day 2.", { x: M, y: 6.2, w: 12, h: 0.4, fontFace: BODY, fontSize: 14, italic: true, color: MUTED, margin: 0 });
footer(s, 27);
s.addNotes("Give them the mnemonic: Role · Task · Context · Format. Tell them to keep it as a template and fill the blanks every time. This single habit fixes most 'the AI gave me junk' complaints.");

// 28 · Prompt template example
s = pres.addSlide(); h1(s, "The template in action");
codebox(s, M, 1.7, 6.0, 3.6, "You are a [ROLE].\n[TASK] for a [AUDIENCE].\nContext: [paste the data / rules].\nReturn as [FORMAT].");
card(s, 6.9, 1.7, 5.8, 3.6, GREENBG, "BBF7D0");
s.addText("Filled in", { x: 7.2, y: 1.9, w: 5, h: 0.4, fontFace: HEAD, fontSize: 15, bold: true, color: GREEN, margin: 0 });
s.addText("“You are a DSA tutor. Explain bubble sort for a 2nd-year student. Context: they know arrays & loops. Return as exactly 3 bullets + Big-O.”", { x: 7.2, y: 2.4, w: 5.2, h: 2.6, fontFace: MONO, fontSize: 13, color: INK, margin: 0 });
s.addText("Copy the left template into your notes — reuse it for every prompt.", { x: M, y: 5.7, w: 12, h: 0.4, fontFace: BODY, fontSize: 15, italic: true, color: MUTED, margin: 0 });
footer(s, 28);
s.addNotes("Have them literally copy the template. Then, live, take a weak prompt from the room and rewrite it with the 4 slots. Ask a volunteer for a task; build the strong prompt together.");

// 29 · Q5
checkSlide(29, "What makes a prompt strong?", ["Making it as long as possible", "Role + Task + Context + Format", "Writing in ALL CAPS", "Always saying please"],
  "Answer: B — Role + Task + Context + Format. Length ≠ quality (A); caps and politeness don't add structure (C, D). Discussion: 'which of the four slots do people most often forget?' (usually Format).");

// 30 · Divider 06
divider("06", "Where it breaks", "GenAI fails in real, expensive ways. Knowing the failure modes — and the guardrails — is the professional's job.");

// 31 · Failures
s = pres.addSlide(); h1(s, "When GenAI fails — real cases");
const fh = (t) => ({ text: t, options: { bold: true, color: WHITE, fill: { color: INK }, fontSize: 13, valign: "middle" } });
const fc = (t, b) => ({ text: t, options: { color: INK, fontSize: 12.5, valign: "middle", bold: !!b, fill: { color: WHITE } } });
s.addTable([[fh("Failure"), fh("What happened  ·  the lesson")],
  [fc("Hallucination", 1), fc("Air Canada's bot invented a refund policy → the airline had to pay (2024).  Lesson: confident ≠ correct.")],
  [fc("Bias", 1), fc("Gemini's image generator drew historically wrong “diverse” images → paused (2024).  Lesson: test across groups.")],
  [fc("Prompt injection", 1), fc("A Chevy dealer bot was talked into a “$1, legally binding” car (2023).  Lesson: don't trust user input.")],
  [fc("Security", 1), fc("“nullifAI” malicious models slipped past Hugging Face's scanner (2025).  Lesson: models are code — scan sources.")],
  [fc("Misuse", 1), fc("A $25M deepfake video call impersonated Arup's executives (2024).  Lesson: verify identity.")]],
  { x: M, y: 1.55, w: W - 2 * M, colW: [2.4, 9.7], rowH: 0.72, border: { type: "solid", color: LINE, pt: 1 }, fontFace: BODY, margin: [3, 8, 3, 8] });
const lk = (t, url) => ({ text: t, options: { hyperlink: { url }, color: ACCENT } });
s.addText([{ text: "Sources:  ", options: { bold: true, color: MUTED } }, lk("Air Canada (ABA)", "https://www.americanbar.org/groups/business_law/resources/business-law-today/2024-february/bc-tribunal-confirms-companies-remain-liable-information-provided-ai-chatbot/"), { text: "   ·   ", options: { color: MUTED } }, lk("Gemini (Axios)", "https://www.axios.com/2024/02/23/google-gemini-images-stereotypes-controversy"), { text: "   ·   ", options: { color: MUTED } }, lk("Chevy (VentureBeat)", "https://venturebeat.com/ai/a-chevy-for-1-car-dealer-chatbots-show-perils-of-ai-for-customer-service"), { text: "   ·   ", options: { color: MUTED } }, lk("nullifAI (Hacker News)", "https://thehackernews.com/2025/02/malicious-ml-models-found-on-hugging.html"), { text: "   ·   ", options: { color: MUTED } }, lk("Arup (CNN)", "https://www.cnn.com/2024/05/16/tech/arup-deepfake-scam-loss-hong-kong-intl-hnk")], { x: M, y: 6.25, w: W - 2 * M, h: 0.6, fontFace: BODY, fontSize: 11, margin: 0 });
footer(s, 31);
s.addNotes("Assign each pair one failure: 'in one line, how would you prevent it?' Collect on the board. Punch line: 'every one of these shipped without guardrails — that's the job.' The sources are clickable if anyone doubts a case.");

// 32 · Build with guardrails
s = pres.addSlide(); h1(s, "Build with guardrails");
["Verify outputs", "Test for bias", "Limit bot authority", "Scan model sources", "Human in the loop"].forEach((m, i) => { const x = M + i * 2.44; badge(s, x + 0.62, 2.6, 0.85, String(i + 1), i % 2 ? CYAN : ACCENT); s.addText(m, { x: x - 0.05, y: 3.7, w: 2.2, h: 1.0, fontFace: HEAD, fontSize: 15, bold: true, color: INK, align: "center", margin: 0 }); });
s.addText("Every failure on the last slide shipped without these. Knowing the failure modes is the job.", { x: M, y: 5.5, w: 12, h: 0.5, fontFace: BODY, fontSize: 15, italic: true, color: MUTED, margin: 0 });
footer(s, 32);
s.addNotes("Map each guardrail back to a failure: verify→hallucination, bias test→Gemini, limit authority→Chevy, scan sources→nullifAI, human-in-loop→deepfake. Next slide shows how to actually do them in code.");

// 33 · Guardrails examples
s = pres.addSlide(); h1(s, "Guardrails — in practice");
codebox(s, M, 1.7, 6.3, 4.4, "# 1) Validate output shape\nRecipe.model_validate_json(text)   # bad JSON -> caught\n\n# 2) Scope with the system prompt\nsystem = (\"Only answer billing questions. \"\n          \"Otherwise say you can't help.\")\n\n# 3) Limit authority\nif action.cost > 0:\n    require_human_approval()");
s.addText(bullets(["Validate outputs → reject bad data (Pydantic)", "Scope the bot in the system prompt", "No irreversible actions without approval", "Verify facts with RAG + citations (Day 4)", "Log & monitor what the model does"]), { x: 7.2, y: 1.95, w: 5.5, h: 4.0, fontFace: BODY, fontSize: 15, color: INK, margin: 0 });
footer(s, 33);
s.addNotes("Make it concrete: these are small, cheap habits — a validator, a scoping system prompt, an approval gate. Tie to their capstone: 'where does your project need a human in the loop?'");

// 34 · Recap (light)
s = pres.addSlide(); h1(s, "Recap");
["GenAI generates content by predicting tokens — you steer it with prompts.", "Closed vs open models is a trade-off: capability & ease vs control & privacy.", "One OpenAI-shaped client reaches everyone; ask for JSON + validate with Pydantic.", "GenAI hallucinates and can be misused — build with guardrails."].forEach((r, i) => { const y = 1.8 + i * 1.05; badge(s, M, y, 0.62, String(i + 1), ACCENT); s.addText(r, { x: M + 0.95, y, w: 11.4, h: 0.62, fontFace: BODY, fontSize: 18, color: INK, valign: "middle", margin: 0 }); });
footer(s, 34);
s.addNotes("Land the four takeaways. Ask the room to give you each one back before you show it. Then point them to the notebook exercises + homework.");

// 35 · Over to you
s = pres.addSlide(); h1(s, "Over to you");
card(s, M, 1.9, 5.9, 4.2, TINT, LINE);
s.addText("In the notebook", { x: M + 0.35, y: 2.15, w: 5.2, h: 0.5, fontFace: HEAD, fontSize: 18, bold: true, color: ACCENT, margin: 0 });
s.addText(bullets(["Q1 — your own OpenAI call", "Q2 — switch providers with LiteLLM", "Q3 — structured output with Pydantic"]), { x: M + 0.35, y: 2.8, w: 5.2, h: 3.0, fontFace: BODY, fontSize: 16, color: INK, margin: 0 });
card(s, 6.85, 1.9, 5.9, 4.2, ACCTINT, ACCENT);
s.addText("Homework", { x: 7.2, y: 2.15, w: 5.2, h: 0.5, fontFace: HEAD, fontSize: 18, bold: true, color: ACCENT, margin: 0 });
s.addText(bullets(["Call the same prompt via OpenAI, Gemini & LiteLLM", "Get one Pydantic structured output (a Book)", "Write 4–5 lines on one GenAI failure + a fix", "Read-ahead: zero-shot vs few-shot (Day 2)"]), { x: 7.2, y: 2.8, w: 5.2, h: 3.2, fontFace: BODY, fontSize: 15, color: INK, margin: 0 });
footer(s, 35);
s.addNotes("Send them to the notebook §10 (fill-in-the-blank). Restate homework and the Day-2 read-ahead. Close with one line: 'you can now call any model and make it code-safe — tomorrow we make prompts smarter.'");

const out = "/Users/apple/Documents/Projects/LPU-Trainign/slides/Day01_GenAI.pptx";
fs.mkdirSync("/Users/apple/Documents/Projects/LPU-Trainign/slides", { recursive: true });
pres.writeFile({ fileName: out }).then(() => console.log("wrote", out, "· slides:", pres.slides ? pres.slides.length : "?"));
