// Builds a reader page per article: claude_ver/articles/src/<slug>.txt -> <slug>.html
// Run: node build-articles.js
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "canvas_ver", "articles");
const SRC = path.join(ROOT, "src");
const MANIFEST = require("./articles.json");

const esc = s => s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
const isSection = l => /^[一二三四五六七八九十]+$/.test(l.trim());

const MONTHS = ["January","February","March","April","May","June",
                "July","August","September","October","November","December"];
function longDate(iso){
  const [y,m,d] = iso.split("-").map(Number);
  return `${MONTHS[m-1]} ${d}, ${y}`;
}

function measure(text, lang){
  if (lang === "zh") {
    const n = (text.match(/[一-鿿]/g) || []).length;
    return `${n.toLocaleString("en-US")} characters`;
  }
  const n = (text.match(/[A-Za-z][A-Za-z'’-]*/g) || []).length;
  return `${n.toLocaleString("en-US")} words`;
}

function body(text, dropFirstLine){
  let lines = text.replace(/\r\n/g,"\n").split("\n");
  if (dropFirstLine) {
    while (lines.length && !lines[0].trim()) lines.shift();
    lines.shift();
  }
  const blocks = lines.join("\n").split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);
  return blocks.map(b =>
    isSection(b)
      ? `<div class="sec mono">${esc(b)}</div>`
      : `<p>${esc(b).replace(/\n/g,"<br>")}</p>`
  ).join("\n    ");
}

function page(a, text){
  const zh = a.lang === "zh";
  return `<!DOCTYPE html>
<html lang="${zh ? "zh" : "en"}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(a.title)} — Ruotian Wang</title>
<link rel="icon" type="image/png" sizes="32x32" href="../favicon-32.png">
<link rel="icon" type="image/png" sizes="512x512" href="../favicon.png">
<link rel="apple-touch-icon" href="../apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..900&family=Newsreader:ital,opsz,wght@0,6..72,300..600;1,6..72,300..500&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>
:root{
  --page:#EFEEEA;
  --ash:#DAD9D4;
  --ink:#131519;
  --ink-soft:#6E6F6A;
  --rule:#C6C5BF;
  --blue:#2320E8;

  --display:"Archivo","Helvetica Neue",Arial,sans-serif;
  --body:"Newsreader",Georgia,"Times New Roman",serif;
  --cjk:"Newsreader","Songti SC","Noto Serif SC","Source Han Serif SC",serif;
  --mono:"Space Mono",ui-monospace,SFMono-Regular,Menlo,monospace;

  --gutter:clamp(18px,4vw,56px);
}
*{box-sizing:border-box}
html,body{margin:0;padding:0}
body{
  background:var(--page);
  color:var(--ink);
  font-family:${zh ? "var(--cjk)" : "var(--body)"};
  -webkit-font-smoothing:antialiased;
}
a{color:inherit}
.mono{font-family:var(--mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase}

.topbar{
  display:flex;align-items:baseline;justify-content:space-between;gap:16px;
  padding:18px var(--gutter);
  border-bottom:1px solid var(--rule);
}
.topbar__name{
  font-family:var(--display);
  font-variation-settings:"wdth" 118,"wght" 800;
  font-size:14px;letter-spacing:.02em;text-transform:uppercase;
  text-decoration:none;
}
.topbar a.back{text-decoration:none;color:var(--ink-soft)}
.topbar a.back:hover{color:var(--blue)}

.wrap{max-width:none;padding:0 var(--gutter)}
header.piece{
  padding:clamp(44px,8vw,96px) 0 clamp(26px,4vw,44px);
  border-bottom:1px solid var(--rule);
  margin-bottom:clamp(28px,4vw,52px);
}
.eyebrow{color:var(--ink-soft);margin-bottom:clamp(16px,2.4vw,26px)}
h1{
  margin:0;
  font-family:var(--display);
  font-variation-settings:"wdth" 112,"wght" 840;
  font-size:clamp(32px,6.4vw,78px);
  line-height:.92;
  letter-spacing:-.02em;
  text-transform:uppercase;
  max-width:16ch;
}
.byline{margin-top:clamp(16px,2.2vw,24px);color:var(--ink-soft)}

article{
  max-width:${zh ? "40em" : "34em"};
  font-size:${zh ? "clamp(16px,1.35vw,18px)" : "clamp(17px,1.45vw,19.5px)"};
  line-height:${zh ? "1.95" : "1.62"};
  padding-bottom:clamp(48px,7vw,96px);
}
article p{margin:0 0 1.15em}
${zh ? "article p{text-align:justify;text-justify:inter-ideograph}\n" : ""}.sec{
  margin:2.4em 0 1.6em;
  color:var(--ink-soft);
  border-top:1px solid var(--rule);
  padding-top:1.1em;
  font-size:13px;
  letter-spacing:.05em;
}
/* the first marker sits right under the header rule — one line is enough */
article .sec:first-child{border-top:0;padding-top:0;margin:0 0 1.6em}

footer{
  border-top:1px solid var(--rule);
  padding:18px var(--gutter) 40px;
  display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;
  color:var(--ink-soft);
}
footer a{color:var(--blue);text-decoration:none;border-bottom:1px solid var(--blue);padding-bottom:2px}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
</style>
</head>
<body>

<header class="topbar">
  <a class="topbar__name" href="../index.html">Ruotian Wang</a>
  <a class="back mono" href="../index.html">← Catalog</a>
</header>

<div class="wrap">
  <header class="piece">
    <div class="eyebrow mono">${esc(a.kind)} · ${a.date.slice(0,4)}</div>
    <h1>${esc(a.title)}</h1>
    <div class="byline mono">${longDate(a.date)} · ${measure(text, a.lang)}</div>
  </header>

  <article>
    ${body(text, a.dropFirstLine)}
  </article>
</div>

<footer class="mono">
  <span>© ${a.date.slice(0,4)} Ruotian Wang</span>
  <a href="../index.html">Back to the catalog</a>
</footer>

</body>
</html>
`;
}

let built = 0;
for (const a of MANIFEST) {
  const src = path.join(SRC, a.slug + ".txt");
  const text = fs.readFileSync(src, "utf8");
  fs.writeFileSync(path.join(ROOT, a.slug + ".html"), page(a, text));
  const words = measure(text, a.lang);
  console.log(`  ${a.slug.padEnd(30)} ${a.date}  ${words}${a.was ? `   (was "${a.was}")` : ""}`);
  built++;
}
console.log(`built ${built} article pages`);
