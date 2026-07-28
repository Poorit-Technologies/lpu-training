const pptxgen = require("pptxgenjs");
const fs = require("fs");

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.author = "Bhupendra Dahal";
pres.title = "Generative AI — Day 2";

const W = 13.33, H = 7.5, M = 0.6;
const INK = "1E293B", MUTED = "64748B", ACCENT = "6366F1", ACC2 = "8B8FF5", CYAN = "0891B2",
      LINE = "E2E8F0", TINT = "F8FAFC", CARD = "F1F5F9", ACCTINT = "EEF0FF", CODEBG = "F3F4F6",
      WHITE = "FFFFFF", GREEN = "15803D", GREENBG = "F0FDF4", REDBG = "FEF2F2", RED = "B91C1C";
const HEAD = "Calibri", BODY = "Calibri", MONO = "Courier New";

function footer(s, n) {
  s.addText("Generative AI · Day 2", { x: M, y: H - 0.42, w: 6, h: 0.25, fontFace: BODY, fontSize: 9, color: MUTED, margin: 0 });
  s.addText(String(pres.slides.length), { x: W - M - 0.5, y: H - 0.42, w: 0.5, h: 0.25, fontFace: BODY, fontSize: 9, color: MUTED, align: "right", margin: 0 });  // auto-number from slide position (n arg ignored)
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
s.addText("Day 2 · Advanced prompting, structured outputs & tools", { x: M, y: 3.9, w: 12, h: 0.6, fontFace: BODY, fontSize: 20, color: ACCENT, margin: 0 });
s.addText([{ text: "Lovely Professional University", options: { bold: true, color: INK } }, { text: "    ·    Backend & Generative AI    ·    Poorit Technologies", options: { color: MUTED } }], { x: M, y: 6.4, w: 12, h: 0.4, fontFace: BODY, fontSize: 13, margin: 0 });
s.addNotes("Welcome back. One line to set the arc: yesterday we got a model to ANSWER; today we make it answer reliably (advanced prompting), in a shape our code can trust (structured outputs), and let it DO things (tools). Everything today feeds Day 4 (RAG) and Day 5 (agents).");

// 2 · Hook (light) — ONE open question
s = pres.addSlide();
s.addText("Your support bot is asked:", { x: 1.0, y: 1.9, w: W - 2, h: 0.6, fontFace: BODY, fontSize: 20, italic: true, color: MUTED, align: "center", margin: 0 });
s.addText("“Where's order A123 —", { x: 1.0, y: 2.6, w: W - 2, h: 1.0, fontFace: HEAD, fontSize: 42, bold: true, color: INK, align: "center", margin: 0 });
s.addText("and refund me if it's late.”", { x: 1.0, y: 3.6, w: W - 2, h: 1.0, fontFace: HEAD, fontSize: 42, bold: true, color: ACCENT, align: "center", margin: 0 });
s.addText("What does your LLM need that it simply does not have?", { x: 1.0, y: 5.0, w: W - 2, h: 0.5, fontFace: BODY, fontSize: 18, italic: true, color: MUTED, align: "center", margin: 0 });
s.addNotes("Think-pair-share (1 min). Let answers surface, then name the three gaps — they ARE today's three sections: (1) no LIVE DATA — it can't see order A123 -> tools/function calling; (2) your code needs a GUARANTEED SHAPE to act on -> structured outputs; (3) it must REASON reliably ('is 3 days late enough?') -> advanced prompting. Punch line: 'yesterday it talked; today it acts.'");

// 3 · Context — yesterday to today
s = pres.addSlide(); h1(s, "From answering to acting");
s.addText([{ text: "Day 1: ", options: { bold: true, color: INK } }, { text: "the model could talk.   ", options: { color: MUTED } }, { text: "Day 2: ", options: { bold: true, color: ACCENT } }, { text: "it acts — on real data, in a shape you can trust.", options: { color: INK } }], { x: M, y: 1.45, w: 12, h: 0.5, fontFace: BODY, fontSize: 17, margin: 0 });
[["No live data", "it can't see order A123", "Tools  ·  §4–5", ACCENT], ["No guaranteed shape", "your code needs exact fields", "Structured outputs  ·  §3", CYAN], ["Shaky reasoning", "“is 3 days late enough?”", "Advanced prompting  ·  §1–2", ACCENT]].forEach((c, i) => {
  const x = M + i * 4.15; card(s, x, 2.2, 3.85, 3.4, TINT, LINE);
  s.addText("The gap", { x: x + 0.3, y: 2.45, w: 3.3, h: 0.35, fontFace: HEAD, fontSize: 12, bold: true, color: RED, margin: 0 });
  s.addText(c[0], { x: x + 0.3, y: 2.85, w: 3.3, h: 0.6, fontFace: HEAD, fontSize: 19, bold: true, color: INK, margin: 0 });
  s.addText(c[1], { x: x + 0.3, y: 3.5, w: 3.3, h: 0.7, fontFace: BODY, fontSize: 14, italic: true, color: MUTED, margin: 0 });
  s.addShape("rightArrow", { x: x + 0.3, y: 4.35, w: 0.5, h: 0.4, fill: { color: c[3] }, line: { type: "none" } });
  s.addText(c[2], { x: x + 0.9, y: 4.3, w: 2.7, h: 0.9, fontFace: HEAD, fontSize: 14, bold: true, color: c[3], valign: "middle", margin: 0 });
});
footer(s, 3);
s.addNotes("This is the map of the whole day. Each gap in the Day-1 bot becomes one of today's sections. Keep pointing back here as you finish each section so they see the bot getting more capable. By the end, the bot in the hook can actually be built.");

// 4 · LLM parameters (projectable reference — the knobs)
s = pres.addSlide(); h1(s, "LLM call parameters — the knobs");
s.addText("Optional settings on every create(...) call — you met temperature on Day 1.", { x: M, y: 1.32, w: 12, h: 0.4, fontFace: BODY, fontSize: 15, italic: true, color: MUTED, margin: 0 });
const ph = (t) => ({ text: t, options: { bold: true, color: WHITE, fill: { color: INK }, fontSize: 13, valign: "middle" } });
const pc = (t, mono, col) => ({ text: t, options: { color: col || INK, fontSize: 12.5, valign: "middle", fontFace: mono ? MONO : BODY, fill: { color: WHITE } } });
s.addTable([
  [ph("Parameter"), ph("What it does"), ph("Use / note")],
  [pc("temperature", 1, ACCENT), pc("randomness — 0 = focused, high = creative"), pc("0 to extract, 0.7+ to ideate")],
  [pc("top_p", 1, ACCENT), pc("nucleus sampling — another randomness dial"), pc("tune temperature OR top_p")],
  [pc("max_tokens", 1, ACCENT), pc("caps the reply length"), pc("new name: max_completion_tokens")],
  [pc("frequency_penalty", 1, ACCENT), pc("less repetition of the same words"), pc("range −2 to 2")],
  [pc("presence_penalty", 1, ACCENT), pc("pushes toward new topics"), pc("range −2 to 2")],
  [pc("top_k", 1, CYAN), pc("keep only the top-k tokens"), pc("not on OpenAI — Gemini (LiteLLM)", 0, RED)],
], { x: M, y: 1.9, w: W - 2 * M, colW: [2.9, 5.3, 3.9], rowH: 0.6, border: { type: "solid", color: LINE, pt: 1 }, fontFace: BODY, margin: [3, 8, 3, 8], valign: "middle" });
s.addText([{ text: "Live:  ", options: { bold: true, color: ACCENT } }, { text: "set max_tokens=20 → the reply is cut off and finish_reason == \"length\". The cap is on length, not quality.", options: { color: INK } }], { x: M, y: 6.5, w: 12, h: 0.4, fontFace: BODY, fontSize: 13, italic: true, margin: 0 });
footer(s, 4);
s.addNotes("The knobs on every call. temperature and top_p both control randomness — tune ONE, not both. max_tokens caps output length (finish_reason='length' when it hits); newer/reasoning models rename it max_completion_tokens. Penalties (−2..2) cut repetition / push new topics. top_k is real but OpenAI doesn't expose it — Gemini and Claude do. Teach this live from notebook §2: change a value, re-run. Mention stop and seed exist too.");

// 5 · Streaming
s = pres.addSlide(); h1(s, "Streaming — see the answer as it's written");
s.addText("Default: wait for the whole reply. Streaming: tokens arrive as they're generated — it types out live.", { x: M, y: 1.35, w: 12, h: 0.4, fontFace: BODY, fontSize: 15, italic: true, color: MUTED, margin: 0 });
codebox(s, M, 1.95, 7.3, 4.35, "from litellm import completion\n\nstream = completion(\n    model=\"openai/gpt-4o-mini\",\n    messages=[...],\n    stream=True,          # the switch\n)\n\nresult = \"\"\nfor chunk in stream:\n    result += chunk.choices[0].delta.content or \"\"\n    yield result          # the text so far");
card(s, 7.9, 1.95, 4.8, 4.35, ACCTINT, ACCENT);
s.addText("Why stream?", { x: 8.2, y: 2.2, w: 4.2, h: 0.5, fontFace: HEAD, fontSize: 18, bold: true, color: ACCENT, margin: 0 });
s.addText(bullets(["feels instant — you read as it types", "essential for chat UIs (ChatGPT-style)", "the yield generator plugs straight into Gradio's ChatInterface"]), { x: 8.2, y: 2.85, w: 4.2, h: 3.0, fontFace: BODY, fontSize: 15, color: INK, margin: 0 });
s.addText([{ text: "Same call  +  ", options: { color: INK } }, { text: "stream=True", options: { bold: true, fontFace: MONO, color: ACCENT } }, { text: "  +  loop the chunks.", options: { color: INK } }], { x: M, y: 6.55, w: 12, h: 0.4, fontFace: BODY, fontSize: 15, margin: 0 });
footer(s, 5);
s.addNotes("Streaming = set stream=True and iterate the chunks; each chunk carries a 'delta' (the next bit of text). Accumulate into result and yield it — the UI shows it growing. Why it matters: same total time, but the user starts reading immediately, so it FEELS fast. The yield generator is exactly what Gradio's ChatInterface consumes (companion notebook). Teach this from notebook §2b (the ⚡ Streaming section).");

// 6 · Divider 01
divider("01", "Teaching by example", "Few-shot prompting: the cheapest way to teach a model a new task — show it, don't just tell it. This is in-context learning.");

// 5 · Zero-shot vs few-shot concept
s = pres.addSlide(); h1(s, "Zero-shot vs few-shot");
[["Zero-shot", "instructions only — no examples", ["“Classify this ticket…”", "every prompt from Day 1", "the model guesses your intent"], INK, TINT, LINE], ["Few-shot", "show a few input → output examples", ["“crashes on open → urgent”", "“change photo? → normal”", "the model copies the pattern"], ACCENT, ACCTINT, ACCENT]].forEach((c, i) => { const x = M + i * 6.15; card(s, x, 1.9, 5.9, 3.5, c[4], c[5]); s.addText(c[0], { x: x + 0.35, y: 2.15, w: 5.2, h: 0.5, fontFace: HEAD, fontSize: 22, bold: true, color: c[3], margin: 0 }); s.addText(c[1], { x: x + 0.35, y: 2.7, w: 5.2, h: 0.5, fontFace: BODY, fontSize: 15, italic: true, color: MUTED, margin: 0 }); s.addText(bullets(c[2]), { x: x + 0.35, y: 3.35, w: 5.2, h: 1.9, fontFace: BODY, fontSize: 15, color: INK, margin: 0 }); });
s.addText([{ text: "In-context learning:  ", options: { bold: true, color: ACCENT } }, { text: "you teach a brand-new task inside the prompt, at runtime — no retraining, no code.", options: { color: INK } }], { x: M, y: 5.7, w: 12, h: 0.5, fontFace: BODY, fontSize: 16, margin: 0 });
footer(s, 5);
s.addNotes("Define both plainly: zero-shot = tell, few-shot = show. The term to give them: 'in-context learning' — the model learns the task from the examples in the prompt itself. No fine-tuning, no training run. Next slide makes the difference visible.");

// 6 · Few-shot in action
s = pres.addSlide(); h1(s, "Few-shot in action — a custom classifier");
card(s, M, 1.85, 5.9, 3.5, REDBG, "FECACA");
s.addText("ZERO-SHOT", { x: M + 0.35, y: 2.05, w: 5, h: 0.4, fontFace: HEAD, fontSize: 14, bold: true, color: RED, margin: 0 });
s.addText("“Classify this support ticket:\n the app crashes every time I open it”", { x: M + 0.35, y: 2.5, w: 5.2, h: 1.2, fontFace: MONO, fontSize: 12.5, color: INK, margin: 0 });
s.addText("→ “This looks like a technical issue.”\n   (its own words — not your labels)", { x: M + 0.35, y: 4.0, w: 5.2, h: 1.1, fontFace: BODY, fontSize: 13, italic: true, color: MUTED, margin: 0 });
card(s, 6.85, 1.85, 5.9, 3.5, GREENBG, "BBF7D0");
s.addText("FEW-SHOT", { x: 7.2, y: 2.05, w: 5, h: 0.4, fontFace: HEAD, fontSize: 14, bold: true, color: GREEN, margin: 0 });
s.addText("crashes on open        → urgent\nchange profile photo?  → normal\nyou WON a free iPhone  → spam\n———\nthe app crashes …      →", { x: 7.2, y: 2.5, w: 5.3, h: 1.7, fontFace: MONO, fontSize: 12.5, color: INK, margin: 0 });
s.addText("→ urgent   (exactly your label)", { x: 7.2, y: 4.55, w: 5.2, h: 0.5, fontFace: BODY, fontSize: 13, italic: true, color: GREEN, margin: 0 });
s.addText([{ text: "Same model.  ", options: { bold: true, color: INK } }, { text: "The three examples did the teaching.", options: { color: INK } }], { x: M, y: 5.65, w: 12, h: 0.5, fontFace: BODY, fontSize: 17, margin: 0 });
footer(s, 6);
s.addNotes("The 'aha': with zero-shot the model invents its own labels or writes a sentence — useless to your code. Add three examples and it returns EXACTLY one of your labels. Run this live in the notebook if time. Tie forward: 'we'll then GUARANTEE that label with an enum in section 3.'");

// 7 · When few-shot wins + pitfalls
s = pres.addSlide(); h1(s, "When to reach for few-shot — and the traps");
[["Reach for it when…", ["a custom label set or category", "a specific format or house style", "a tone/voice to match", "easier to show than to describe"], ACCENT, ACCTINT], ["Watch out for…", ["imbalanced examples bias the answer", "order can sway the model", "example format IS the spec", "every example costs tokens each call"], RED, REDBG]].forEach((c, i) => { const x = M + i * 6.15; card(s, x, 1.9, 5.9, 3.9, c[3], c[2] === ACCENT ? ACCENT : "FECACA"); s.addText(c[0], { x: x + 0.35, y: 2.15, w: 5.2, h: 0.5, fontFace: HEAD, fontSize: 19, bold: true, color: c[2], margin: 0 }); s.addText(bullets(c[1]), { x: x + 0.35, y: 2.85, w: 5.2, h: 2.8, fontFace: BODY, fontSize: 15.5, color: INK, margin: 0 }); });
s.addText("Rule of thumb: 2–5 balanced examples. Start at 3.", { x: M, y: 6.05, w: 12, h: 0.4, fontFace: BODY, fontSize: 15, italic: true, color: MUTED, margin: 0 });
footer(s, 7);
s.addNotes("Few-shot is the cheapest 'fine-tuning' — reach for it before real training. But the traps are real: if all 3 examples are 'spam', it over-predicts spam. Keep labels balanced, keep the format identical to what you want back, and remember each example rides along on every call (cost).");

// 8 · Q1
checkSlide(8, "When is few-shot prompting most useful?", ["When you want the shortest possible prompt", "When you need a custom label set, format, or tone", "When the model must fetch live data", "When you want to lower token cost"],
  "Answer: B — few-shot shines for custom labels/format/tone and 'show-don't-tell' tasks. Why not the others: it makes prompts LONGER not shorter (A) and costs MORE tokens (D); live data needs tools, not examples (C). Discussion: 'what's a task in your capstone you'd teach with 3 examples?'");

// 9 · Divider 02
divider("02", "Reasoning on demand", "Chain-of-thought: give the model room to work through steps and accuracy jumps. Plus reasoning models — thinking built in.");

// 10 · Chain-of-thought
s = pres.addSlide(); h1(s, "Chain-of-thought — room to think");
s.addText("“A shop had 23 apples, sold 17, got 40 more, then sold half. How many now?”", { x: M, y: 1.4, w: 12, h: 0.5, fontFace: MONO, fontSize: 13.5, color: INK, margin: 0 });
card(s, M, 2.1, 5.9, 3.0, REDBG, "FECACA");
s.addText("ANSWER NOW", { x: M + 0.35, y: 2.3, w: 5, h: 0.4, fontFace: HEAD, fontSize: 14, bold: true, color: RED, margin: 0 });
s.addText("“Reply with only the number.”", { x: M + 0.35, y: 2.8, w: 5.2, h: 0.5, fontFace: MONO, fontSize: 12.5, color: INK, margin: 0 });
s.addText("→ 30   ✗  (a confident guess)", { x: M + 0.35, y: 3.7, w: 5.2, h: 0.6, fontFace: BODY, fontSize: 15, bold: true, color: RED, margin: 0 });
card(s, 6.85, 2.1, 5.9, 3.0, GREENBG, "BBF7D0");
s.addText("THINK STEP BY STEP", { x: 7.2, y: 2.3, w: 5, h: 0.4, fontFace: HEAD, fontSize: 14, bold: true, color: GREEN, margin: 0 });
s.addText("23 − 17 = 6\n6 + 40 = 46\n46 ÷ 2 = 23", { x: 7.2, y: 2.8, w: 5.2, h: 1.2, fontFace: MONO, fontSize: 12.5, color: INK, margin: 0 });
s.addText("→ 23   ✓", { x: 7.2, y: 4.35, w: 5.2, h: 0.5, fontFace: BODY, fontSize: 15, bold: true, color: GREEN, margin: 0 });
s.addText("The reasoning tokens are the model working on paper instead of guessing the last line.", { x: M, y: 5.5, w: 12, h: 0.5, fontFace: BODY, fontSize: 16, italic: true, color: MUTED, margin: 0 });
footer(s, 10);
s.addNotes("Run it live — the answer-only version often trips on the 'sold half'. Adding 'let's think step by step' (zero-shot CoT) fixes it. The mechanism to convey: writing the steps gives the model space to compute rather than pattern-match a final number. Mention few-shot CoT: examples that show the reasoning, not just the answer.");

// 11 · Reasoning models
s = pres.addSlide(); h1(s, "Reasoning models — thinking built in");
s.addText("Newer models reason internally before answering — CoT is baked in.", { x: M, y: 1.35, w: 12, h: 0.4, fontFace: BODY, fontSize: 16, italic: true, color: MUTED, margin: 0 });
["GPT-5 “thinking”\nOpenAI", "Gemini “thinking”\nGoogle", "Claude extended\nthinking · Anthropic"].forEach((m, i) => { const x = M + i * 4.15; card(s, x, 2.0, 3.8, 1.25, ACCTINT, ACCENT); s.addText(m, { x, y: 2.0, w: 3.8, h: 1.25, fontFace: HEAD, fontSize: 15, bold: true, color: INK, align: "center", valign: "middle", margin: 0 }); });
s.addText([{ text: "Steer with a reasoning-effort / thinking-budget knob (low · medium · high) — not prompt tricks.", options: { color: INK } }], { x: M, y: 3.55, w: 12, h: 0.5, fontFace: BODY, fontSize: 16, margin: 0 });
card(s, M, 4.25, 12.13, 1.75, REDBG, "FECACA");
s.addText([{ text: "Don't over-reason:  ", options: { bold: true, color: RED } }, { text: "on a reasoning model, skip “think step by step” (it already does). Skip CoT for simple lookups — it just burns tokens + latency. And a long chain on a real-time-fact question is a ", options: { color: INK } }, { text: "fancier hallucination", options: { bold: true, color: RED } }, { text: " → that's what RAG fixes (Day 4).", options: { color: INK } }], { x: M + 0.35, y: 4.5, w: 11.4, h: 1.3, fontFace: BODY, fontSize: 15, valign: "middle", margin: 0 });
footer(s, 11);
s.addNotes("A reasoning model = chain-of-thought built into the model and often hidden. You don't prompt the steps; you turn a knob (effort/budget) for harder problems. Key caution: reasoning ≠ knowledge — a long think on 'what happened yesterday' just produces a more elaborate wrong answer. That gap is the motivation for RAG on Day 4. ⚠️ Verify exact model IDs on the day.");

// 12 · Q2
checkSlide(12, "You're using a reasoning model. Should you add “think step by step”?", ["Yes — always add it", "No — it already reasons internally", "Only at temperature 0", "Only for prompts under 50 words"],
  "Answer: B — reasoning models already think internally; pasting 'think step by step' is redundant and can even hurt. You steer them with a reasoning-effort knob instead. Discussion: 'name a task worth the extra reasoning cost — and one that isn't.'");

// 13 · Divider 03
divider("03", "Outputs you can trust", "From 'please return JSON' (hope) to Structured Outputs (guarantee): a typed object your code can act on, every time.");

// 14 · JSON vs Structured Outputs
s = pres.addSlide(); h1(s, "“Ask for JSON” vs Structured Outputs");
[["“Please return JSON”", "makes the text LOOK like JSON", ["can drop a field", "can add extra keys", "can use the wrong type", "→ your validate() throws → retry"], RED, REDBG, "FECACA"], ["Structured Outputs", "generation constrained to your schema", ["every field present", "correct types, always", "no surprise keys", "→ a typed object, guaranteed"], GREEN, GREENBG, "BBF7D0"]].forEach((c, i) => { const x = M + i * 6.15; card(s, x, 1.9, 5.9, 3.9, c[5], c[6]); s.addText(c[0], { x: x + 0.35, y: 2.15, w: 5.2, h: 0.5, fontFace: HEAD, fontSize: 19, bold: true, color: c[3], margin: 0 }); s.addText(c[1], { x: x + 0.35, y: 2.7, w: 5.2, h: 0.5, fontFace: BODY, fontSize: 14, italic: true, color: MUTED, margin: 0 }); s.addText(bullets(c[2]), { x: x + 0.35, y: 3.3, w: 5.2, h: 2.4, fontFace: BODY, fontSize: 15, color: INK, margin: 0 }); });
s.addText([{ text: "Hope vs guarantee.  ", options: { bold: true, color: INK } }, { text: "The model literally can't emit a shape that breaks your schema.", options: { color: INK } }], { x: M, y: 6.0, w: 12, h: 0.4, fontFace: BODY, fontSize: 16, margin: 0 });
footer(s, 14);
s.addNotes("Day 1 asked for JSON and validated — good, but 'looks like JSON' still fails sometimes (missing field, wrong type) and you retry. Structured Outputs constrains the generation itself to your schema, so the shape is guaranteed. Fewer retries, no defensive parsing. Code next.");

// 15 · parse() in code
s = pres.addSlide(); h1(s, "Structured Outputs — in code");
codebox(s, M, 1.7, 7.6, 4.5, "from pydantic import BaseModel\n\nclass Recipe(BaseModel):\n    title: str\n    ingredients: list[str]\n    minutes: int\n\ncompletion = client.chat.completions.parse(\n    model=\"gpt-4o-mini\",\n    messages=[{\"role\": \"user\",\n        \"content\": \"A simple pasta recipe.\"}],\n    response_format=Recipe,      # pass the class\n)\nrecipe = completion.choices[0].message.parsed\nprint(recipe.title, recipe.minutes)");
s.addText(bullets([".parse(), not .create()", "response_format = your class", "message.parsed → a typed object", "recipe.title is safe to use", "works on gpt-4o-mini, Gemini, LiteLLM"]), { x: 8.5, y: 2.0, w: 4.2, h: 3.6, fontFace: BODY, fontSize: 15, color: INK, margin: 0 });
footer(s, 15);
s.addNotes("Two changes from Day 1: call .parse() and pass the Pydantic CLASS as response_format. You read .parsed and get a real Recipe object — no model_validate_json, no try/except. Emphasize: this is the contract between the messy LLM and a reliable backend/database.");

// 16 · Enums lock categories
s = pres.addSlide(); h1(s, "Lock the categories with an Enum");
codebox(s, M, 1.7, 7.6, 4.1, "from enum import Enum\n\nclass Priority(str, Enum):\n    urgent = \"urgent\"\n    normal = \"normal\"\n    spam   = \"spam\"\n\nclass Ticket(BaseModel):\n    customer: str\n    priority: Priority     # only these 3\n    summary:  str");
card(s, 8.5, 1.7, 4.2, 4.1, ACCTINT, ACCENT);
s.addText("Section 1's classifier —\nnow enforced", { x: 8.75, y: 1.95, w: 3.7, h: 0.9, fontFace: HEAD, fontSize: 16, bold: true, color: ACCENT, margin: 0 });
s.addText(bullets(["the model can't invent a 4th label", "few-shot suggested; the enum guarantees", "safe to write straight to a DB row", "same idea: dates, statuses, ratings"]), { x: 8.75, y: 2.95, w: 3.7, h: 2.6, fontFace: BODY, fontSize: 14, color: INK, margin: 0 });
footer(s, 16);
s.addNotes("Callback to section 1: few-shot taught the label set; an Enum ENFORCES it. The type system makes an invalid label impossible — not 'unlikely', impossible. This is why structured output + enums is how GenAI plugs into real systems (statuses, priorities, categories go straight into columns).");

// 17 · Q3
checkSlide(17, "“Ask for JSON” vs Structured Outputs — the real difference?", ["Structured Outputs is just faster", "Structured Outputs guarantees your exact schema", "JSON mode is always more accurate", "There is no real difference"],
  "Answer: B — Structured Outputs constrains generation to your exact schema (fields + types guaranteed); 'ask for JSON' only makes it look right and can still fail. It's about reliability, not speed (A). Discussion: 'what should your code do today when a field is missing — and how does this remove that?'");

// 18 · Divider 04
divider("04", "Giving the model tools", "Function calling — the model's hands. It can't do math or see your data, so you give it tools it can request. This is the day's centerpiece.");

// 19 · The problem + the idea
s = pres.addSlide(); h1(s, "The model can't act — so give it tools");
card(s, M, 1.9, 5.9, 3.5, REDBG, "FECACA");
s.addText("The problem", { x: M + 0.35, y: 2.15, w: 5.2, h: 0.5, fontFace: HEAD, fontSize: 19, bold: true, color: RED, margin: 0 });
s.addText(bullets(["can't do exact arithmetic", "can't read YOUR database", "can't hit an API or see live data", "so it confidently guesses (Day 1)"]), { x: M + 0.35, y: 2.8, w: 5.2, h: 2.5, fontFace: BODY, fontSize: 15.5, color: INK, margin: 0 });
card(s, 6.85, 1.9, 5.9, 3.5, ACCTINT, ACCENT);
s.addText("The idea", { x: 7.2, y: 2.15, w: 5.2, h: 0.5, fontFace: HEAD, fontSize: 19, bold: true, color: ACCENT, margin: 0 });
s.addText(bullets(["hand it a menu of tools (functions)", "each described as a JSON schema", "it REQUESTS a call — name + args", "YOUR code runs it, returns the result"]), { x: 7.2, y: 2.8, w: 5.2, h: 2.5, fontFace: BODY, fontSize: 15.5, color: INK, margin: 0 });
s.addText([{ text: "The boundary:  ", options: { bold: true, color: ACCENT } }, { text: "the model requests. Only your code acts. That's the whole safety story.", options: { color: INK } }], { x: M, y: 5.65, w: 12, h: 0.5, fontFace: BODY, fontSize: 17, margin: 0 });
footer(s, 19);
s.addNotes("Anchor on Day 1: instead of admitting it can't, the model hallucinates. Tools fix that. The single most important idea on this slide: the model NEVER runs your code — it just asks 'please call calculator(a=47853, b=1942, op=mul)'. You decide whether and how to run it. That boundary is what makes tools safe to use.");

// 20 · The 4-step loop
s = pres.addSlide(); h1(s, "The tool-call loop");
const loop = [["1", "You → model", "messages + tools=[…]", ACCENT], ["2", "model → you", "a tool_call: name + JSON args", CYAN], ["3", "You run it", "append result as role:\"tool\"", ACCENT], ["4", "You → model", "call again → final answer", CYAN]];
loop.forEach((r, i) => { const y = 1.85 + i * 1.15; badge(s, M, y, 0.75, r[0], r[3]); s.addText(r[1], { x: M + 1.0, y, w: 3.6, h: 0.75, fontFace: HEAD, fontSize: 17, bold: true, color: INK, valign: "middle", margin: 0 }); s.addText(r[2], { x: M + 4.7, y, w: 7.8, h: 0.75, fontFace: MONO, fontSize: 14, color: MUTED, valign: "middle", margin: 0 }); if (i < 3) s.addShape("rightArrow", { x: M + 0.18, y: y + 0.82, w: 0.4, h: 0.28, fill: { color: LINE }, line: { type: "none" }, rotate: 90 }); });
s.addText("Steps 2–4 repeat until the model has everything it needs to answer.", { x: M, y: 6.35, w: 12, h: 0.4, fontFace: BODY, fontSize: 14, italic: true, color: MUTED, margin: 0 });
footer(s, 20);
s.addNotes("Draw this loop on the board and keep it up for the code slides. The mental model: the model pauses, asks for a tool, you fill in the real-world answer, it resumes. Steps 2–4 can loop several times (multi-step). This exact loop, generalized, is an agent (section 6).");

// 21 · Declare a tool
s = pres.addSlide(); h1(s, "Declare a tool — in code");
codebox(s, M, 1.6, 7.7, 4.9, "tools = [{\n  \"type\": \"function\",\n  \"function\": {\n    \"name\": \"calculator\",\n    \"description\": \"Exact arithmetic on two numbers.\",\n    \"parameters\": {\n      \"type\": \"object\",\n      \"properties\": {\n        \"a\": {\"type\": \"number\"},\n        \"b\": {\"type\": \"number\"},\n        \"op\": {\"type\": \"string\",\n               \"enum\": [\"add\",\"sub\",\"mul\",\"div\"]}},\n      \"required\": [\"a\", \"b\", \"op\"],\n    }}}]\n\ndef calculator(a, b, op):   # your real function\n    return {\"result\": {\"add\": a+b, \"mul\": a*b}[op]}");
card(s, 8.6, 1.6, 4.1, 4.9, TINT, LINE);
s.addText("The schema is all\nthe model knows", { x: 8.85, y: 1.85, w: 3.6, h: 0.9, fontFace: HEAD, fontSize: 16, bold: true, color: INK, margin: 0 });
s.addText(bullets(["name — what to call", "description — WHEN to use it", "parameters — the args (JSON schema)", "you write the real function"]), { x: 8.85, y: 2.85, w: 3.6, h: 2.6, fontFace: BODY, fontSize: 14, color: INK, margin: 0 });
s.addText("description = prompt engineering", { x: 8.85, y: 5.85, w: 3.6, h: 0.5, fontFace: BODY, fontSize: 13, italic: true, color: ACCENT, margin: 0 });
footer(s, 21);
s.addNotes("The tool is two things: a SCHEMA (what the model sees) and a FUNCTION (what you run). Stress that the 'description' fields are prompt engineering — the model picks tools from those words. Vague description → wrong or missed tool. Good tool docs = good tool use.");

// 22 · Run the loop
s = pres.addSlide(); h1(s, "Run the loop — in code");
codebox(s, M, 1.6, 7.7, 4.9, "# 1) model asks for the tool\nmsgs = [{\"role\":\"user\",\"content\":\"What is 47853 * 1942?\"}]\nr = client.chat.completions.create(\n    model=\"gpt-4o-mini\", messages=msgs, tools=tools)\ncall = r.choices[0].message.tool_calls[0]\n\n# 2) you run it + feed the result back\nargs = json.loads(call.function.arguments)\nresult = calculator(**args)\nmsgs.append(r.choices[0].message)\nmsgs.append({\"role\": \"tool\",\n    \"tool_call_id\": call.id,\n    \"content\": json.dumps(result)})\n\nfinal = client.chat.completions.create(\n    model=\"gpt-4o-mini\", messages=msgs, tools=tools)\nprint(final.choices[0].message.content)");
card(s, 8.6, 1.6, 4.1, 4.9, ACCTINT, ACCENT);
s.addText("Output", { x: 8.85, y: 1.85, w: 3.6, h: 0.4, fontFace: HEAD, fontSize: 15, bold: true, color: ACCENT, margin: 0 });
s.addText("“47,853 × 1,942 = 92,930,526.”", { x: 8.85, y: 2.35, w: 3.6, h: 1.6, fontFace: BODY, fontSize: 15, italic: true, color: INK, margin: 0 });
s.addText("A real answer, built from real data — no hallucination.", { x: 8.85, y: 4.3, w: 3.6, h: 1.4, fontFace: BODY, fontSize: 13, color: MUTED, margin: 0 });
footer(s, 22);
s.addNotes("Walk it in two beats: (1) offer tools, model returns tool_calls[0] instead of an answer; (2) json.loads the args, run YOUR function, append the model's request AND your result (role:'tool', matching tool_call_id), call again for the natural answer. Note we read tool_calls[0] directly — one call — no loop needed for the demo.");

// 23 · Q4
checkSlide(23, "In function calling, who actually runs the function?", ["The model, automatically", "OpenAI's servers", "Your own code", "Nobody — it's simulated"],
  "Answer: C — your code runs it. The model only REQUESTS the call (name + args); you execute and hand back the result. That request/execute split is the safety boundary. Discussion: 'why is it safer that the model can't run the function itself?'");

// 24 · Divider 05
divider("05", "Many tools, safely", "Give the model several tools and it routes to the right one. Then the non-negotiable: validate what its 'hands' try to grab.");

// 25 · Routing (multiple tools)
s = pres.addSlide(); h1(s, "Multiple tools & routing");
codebox(s, M, 1.7, 6.2, 1.5, "tools = [calculator, get_weather]\n# the model reads the question, picks the fitting tool");
s.addText("How it routes", { x: M, y: 3.5, w: 6, h: 0.4, fontFace: HEAD, fontSize: 16, bold: true, color: INK, margin: 0 });
s.addText(bullets(["it matches the question to each tool's description", "no extra code — you just list the tools", "one turn can even request several calls at once", "run each, return each result by its tool_call_id"]), { x: M, y: 4.05, w: 6.0, h: 2.2, fontFace: BODY, fontSize: 14.5, color: INK, margin: 0 });
card(s, 7.2, 1.7, 5.5, 4.8, TINT, LINE);
s.addText("Routing = a free dispatcher", { x: 7.5, y: 1.95, w: 5.0, h: 0.5, fontFace: HEAD, fontSize: 17, bold: true, color: INK, margin: 0 });
s.addText(bullets(["“What's 47853 × 1942?” → calculator", "“Weather in Delhi?” → get_weather", "“Just say hi” → no tool, a plain reply", "the description is how it decides — write it well"]), { x: 7.5, y: 2.6, w: 4.9, h: 3.4, fontFace: BODY, fontSize: 15, color: INK, margin: 0 });
footer(s, 25);
s.addNotes("With several tools, the model reads the question and routes — a dispatcher for free. It decides purely from the tool DESCRIPTIONS, so write them well (callback to slide 23). Mention parallel tool calls: one turn can return several tool_calls — run them all and append one 'tool' message per call, each matching its tool_call_id.");

// 26 · Safety
s = pres.addSlide(); h1(s, "Tools are the model's hands — validate them");
s.addText("Tool arguments come from a model steered by user text → treat them as untrusted (Day 1's injection lesson, made real).", { x: M, y: 1.4, w: 12, h: 0.7, fontFace: BODY, fontSize: 16, italic: true, color: MUTED, margin: 0 });
[["Validate / whitelist", "check every arg before running — never eval() a calculator, never run raw SQL from args", ACCENT], ["Scope each tool", "least power that works — read-only where possible", CYAN], ["Gate costly actions", "refunds, deletes, emails, payments → hard limits + a human in the loop", RED]].forEach((c, i) => { const y = 2.35 + i * 1.2; badge(s, M, y, 0.75, String(i + 1), c[2]); s.addText(c[0], { x: M + 1.0, y: y - 0.05, w: 3.6, h: 0.85, fontFace: HEAD, fontSize: 17, bold: true, color: c[2], valign: "middle", margin: 0 }); s.addText(c[1], { x: M + 4.7, y: y - 0.05, w: 7.8, h: 0.85, fontFace: BODY, fontSize: 14.5, color: INK, valign: "middle", margin: 0 }); });
s.addText("The more power you give its hands, the harder you must check what they grab.", { x: M, y: 6.15, w: 12, h: 0.4, fontFace: BODY, fontSize: 15, bold: true, color: INK, margin: 0 });
footer(s, 26);
s.addNotes("This is where Day 1's prompt-injection warning becomes concrete. A user can steer the model, and the model fills tool arguments — so validate them like any untrusted input. The rule: never let a tool do something costly or irreversible without a cap and a human check. Ask the Q5 question next.");

// 27 · Q5
checkSlide(27, "Your agent has a send_refund(amount) tool. What's essential?", ["Nothing — trust the model", "Validate/cap the amount + require human approval", "Use a bigger model", "Raise the temperature"],
  "Answer: B — validate and cap the amount, and put a human in the loop for money. Tool args are untrusted (a user can steer the model). A bigger model or temperature change does nothing for safety (C, D). Discussion: 'which of your capstone's actions must never run without approval?'");

// 28 · Divider 06
divider("06", "The agent skeleton", "Snap the three pillars into one loop — and see why that loop is exactly what an agent is (Day 5) and how RAG uses it (Day 4).");

// 29 · Put it together
s = pres.addSlide(); h1(s, "Put it together");
const flow = [["User message", TINT, INK, LINE], ["Few-shot /\ngood prompt", ACCTINT, ACCENT, ACCENT], ["Model calls\na TOOL", ACCTINT, ACCENT, ACCENT], ["Returns a\nSTRUCTURED object", TINT, CYAN, CYAN]];
flow.forEach((f, i) => { const x = M + i * 3.15; s.addShape("roundRect", { x, y: 2.4, w: 2.7, h: 1.7, fill: { color: f[1] }, line: { color: f[3], width: 1 }, rectRadius: 0.1 }); s.addText(f[0], { x, y: 2.4, w: 2.7, h: 1.7, fontFace: HEAD, fontSize: 16, bold: true, color: f[2], align: "center", valign: "middle", margin: 0 }); if (i < 3) s.addShape("rightArrow", { x: x + 2.72, y: 3.05, w: 0.4, h: 0.4, fill: { color: MUTED }, line: { type: "none" } }); });
s.addText([{ text: "All three of today's pillars in one flow  ", options: { bold: true, color: INK } }, { text: "— and you never trusted a raw string.", options: { color: MUTED } }], { x: M, y: 4.6, w: 12, h: 0.5, fontFace: BODY, fontSize: 17, margin: 0 });
s.addText("§1–2 prompt well   ·   §4–5 call tools for real data   ·   §3 hand your code a typed object", { x: M, y: 5.3, w: 12, h: 0.4, fontFace: BODY, fontSize: 14, italic: true, color: MUTED, margin: 0 });
footer(s, 29);
s.addNotes("This is the payoff slide — the hook bot, now buildable. A good prompt frames it, a tool fetches the real order, structured output hands your code a typed result. Point at each box and name the section it came from. Then the reveal on the next slide: this loop has a name.");

// 30 · Where it goes next
s = pres.addSlide(); h1(s, "This loop is an agent");
card(s, M, 1.6, 12.13, 1.35, ACCTINT, ACCENT);
s.addText([{ text: "think → call a tool → observe the result → think again", options: { bold: true, color: ACCENT, fontFace: MONO } }, { text: "   , repeated until done  =  an agent.", options: { color: INK } }], { x: M + 0.35, y: 1.6, w: 11.4, h: 1.35, fontFace: BODY, fontSize: 17, valign: "middle", margin: 0 });
[["RAG · Day 4", "the tool becomes “search my documents” — the model answers from YOUR data instead of hallucinating", CYAN], ["Agents · Day 5", "this loop + memory + planning + many tools, running many steps on its own", ACCENT], ["In the wild", "support automation · coding assistants (read/run) · data-extraction pipelines", MUTED]].forEach((c, i) => { const y = 3.25 + i * 1.15; badge(s, M, y, 0.7, String(i + 1), c[2] === MUTED ? INK : c[2]); s.addText([{ text: c[0] + "  —  ", options: { bold: true, color: c[2] === MUTED ? INK : c[2] } }, { text: c[1], options: { color: INK } }], { x: M + 0.95, y, w: 11.4, h: 0.9, fontFace: BODY, fontSize: 15.5, valign: "middle", margin: 0 }); });
footer(s, 30);
s.addNotes("The big reveal: they just built the skeleton of an agent. Day 4 (RAG) is this loop where the tool is a document search — the fix for the hallucination problem from Day 1. Day 5 adds memory and planning to run many steps autonomously. Leave them feeling the through-line of the whole week.");

// 31 · Recap
s = pres.addSlide(); h1(s, "Recap");
["Few-shot teaches by example in the prompt — reach for it before fine-tuning.", "Chain-of-thought buys multi-step accuracy; reasoning models do it natively.", "parse() + a Pydantic model gives a guaranteed shape — the contract your code trusts.", "Function calling: the model requests, your code runs — always validate args. That loop is an agent."].forEach((r, i) => { const y = 1.8 + i * 1.05; badge(s, M, y, 0.62, String(i + 1), ACCENT); s.addText(r, { x: M + 0.95, y, w: 11.4, h: 0.62, fontFace: BODY, fontSize: 18, color: INK, valign: "middle", margin: 0 }); });
s.addText("Notebook §8 exercises + homework are in the run book. Next: Day 3 — embeddings & vector search.", { x: M, y: 6.15, w: 12, h: 0.4, fontFace: BODY, fontSize: 14, italic: true, color: MUTED, margin: 0 });
footer(s, 31);
s.addNotes("Ask the room to give you each takeaway back before you reveal it. Then send them to the notebook §8 (fill-in-the-blank) and the homework in the run book. One-line close: 'you can now make a model reason, return a shape you trust, and act on real data — that's the whole toolkit for RAG and agents next.'");

const out = "/Users/apple/Documents/Projects/LPU-Trainign/slides/Day02_GenAI.pptx";
fs.mkdirSync("/Users/apple/Documents/Projects/LPU-Trainign/slides", { recursive: true });
pres.writeFile({ fileName: out }).then(() => console.log("wrote", out, "· slides:", pres.slides ? pres.slides.length : "?"));
