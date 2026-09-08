import { renderMarkdown } from "@/lib/markdown";
const md = `| Program | Track | Length | Fee | Per-week cost | Best for |\n|---|---|---|---|---|---|\n| [Classic Barbering](/programs/classic-barbering) | Barbering | 14 weeks | ৳45,000 | ~৳3,200 | Complete beginners |\n`;
const html = renderMarkdown(md);
console.log(JSON.stringify(html.slice(0, 200)));
console.log("---WRAPPER-OK:", html.includes('<div class="overflow-x-auto"><table>'));
