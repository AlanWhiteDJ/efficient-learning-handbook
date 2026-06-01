const fs = require('fs');
const FILE = 'C:\\Users\\Administrator\\.openclaw\\workspace\\efficient-learning-handbook\\build_html.js';
let c = fs.readFileSync(FILE, 'utf8').replace(/\r\n/g, '\n');

// Fix 1: Don't close <li> immediately in olMatch handler
// Change: htmlLines.push(`<li>${processInline(content)}</li>`);
// To: keep <li> open for continuation content
c = c.replace(
  "if (!inOl) { inOl = true; htmlLines.push('<ol>'); }\n                htmlLines.push(`<li>${processInline(content)}</li>`);",
  "if (!inOl) { inOl = true; htmlLines.push('<ol>'); }\n                htmlLines.push(`<li>${processInline(content)}`);"
);

// Fix 2: Paragraph text inside a list should be added to the current <li>, not as a separate <p>
// Find the paragraph text fallthrough
const oldPara = `        // Paragraph text
        if (inBlockquote) {
            bqLines.push(stripped);
        } else {
            if (!inParagraph) {
                inParagraph = true;
                paraLines = [];
            }
            paraLines.push(stripped);
        }`;

const newPara = `        // Paragraph text
        if (inOl || inUl) {
            // Inside a list - add content to the current <li>
            htmlLines.push('<br>' + processInline(stripped));
            i++;
            continue;
        }
        if (inBlockquote) {
            bqLines.push(stripped);
        } else {
            if (!inParagraph) {
                inParagraph = true;
                paraLines = [];
            }
            paraLines.push(stripped);
        }`;

c = c.replace(oldPara, newPara);

// Fix 3: Close <li> when closing lists
const oldClose = '    function closeLists() {\n        if (inUl) { htmlLines.push(\'</ul>\'); inUl = false; }\n        if (inOl) { htmlLines.push(\'</ol>\'); inOl = false; }\n    }';
const newClose = '    function closeLists() {\n        if (inUl) { htmlLines.push(\'</ul>\'); inUl = false; }\n        if (inOl) { htmlLines.push(\'</li></ol>\'); inOl = false; }\n    }';

c = c.replace(oldClose, newClose);

// Fix 4: Also don't close lists on blank lines inside list
const oldBlank = `if (stripped === '') {
            flushParagraph();
            flushBlockquote();
            closeLists();
            if (inTable) flushTable();
            htmlLines.push('');
            i++;
            continue;
        }`;

const newBlank = `if (stripped === '') {
            flushParagraph();
            flushBlockquote();
            // Don't close lists on blank lines - keeps <ol> items together
            if (inTable) flushTable();
            htmlLines.push('');
            i++;
            continue;
        }`;

// Only replace first occurrence (mdToHtmlBook)
c = c.replace(oldBlank, newBlank);

// Fix 5: Same for mdToHtmlSimple's blank handler
c = c.replace(oldBlank, newBlank);

fs.writeFileSync(FILE, c, 'utf8');
console.log('Fixed: <li> stays open for continuation content within lists');
