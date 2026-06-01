const fs = require('fs');
const FILE = 'C:\\Users\\Administrator\\.openclaw\\workspace\\efficient-learning-handbook\\build_html.js';
let c = fs.readFileSync(FILE, 'utf8').replace(/\r\n/g, '\n');

// Target: the h1 emission in mdToHtmlBook (first occurrence of level===1)
// The code is: htmlLines.push(`<h1${cls}>${processInline(text)}</h1>`);
// We need to add ch21 id. The comment "// Book title" is unique to this h1 block.

// Use a unique-enough anchor: the "// Book title" comment line + the push line
let oldBlock = "// Book title\n                const cls = firstH1 ? ' class=\"no-break\"' : '';\n                firstH1 = false;\n                htmlLines.push(`<h1${cls}>${processInline(text)}</h1>`);";
let newBlock = "// Book title\n                const cls = firstH1 ? ' class=\"no-break\"' : '';\n                firstH1 = false;\n                const ch21_tag = text.startsWith('第21章') ? ' id=\"ch21\"' : '';\n                htmlLines.push(`<h1${cls}${ch21_tag}>${processInline(text)}</h1>`);";

if (c.includes(oldBlock)) {
  c = c.replace(oldBlock, newBlock);
  console.log('ch21 anchor added');
} else {
  console.log('NOT FOUND - trying alternative');
}

fs.writeFileSync(FILE, c, 'utf8');
