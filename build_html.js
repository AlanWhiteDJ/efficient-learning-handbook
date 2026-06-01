#!/usr/bin/env node
// Build 高效学习手册.html from three markdown sources
// v2 - fixes chapter ordering and deduplication

const fs = require('fs');
const path = require('path');

const BASE = __dirname;
const OUTPUT = path.join(BASE, '高效学习手册.html');
const AI_MD = path.join(BASE, 'AI推荐语.md');
const BOOK_MD = path.join(BASE, '高效学习手册.md');
const PARENT_MD = path.join(BASE, '家长指南.md');

const CSS = `@page {
    size: A4 portrait;
    margin: 2.5cm;
}
body {
    font-family: SimSun, 宋体, serif;
    font-size: 14pt;
    line-height: 1.8;
    color: #333;
}
h1 {
    font-family: SimHei, 黑体, sans-serif;
    font-size: 22pt;
    page-break-before: always;
    border-bottom: 2px solid #2b5797;
    padding-bottom: 6pt;
    margin-top: 24pt;
}
h1.no-break {
    page-break-before: auto;
}
h2 {
    font-family: SimHei, 黑体, sans-serif;
    font-size: 16pt;
    color: #2b5797;
    margin-top: 20pt;
}
h3 {
    font-family: SimHei, 黑体, sans-serif;
    font-size: 14pt;
    color: #444;
    margin-top: 16pt;
}
p {
    text-indent: 2em;
    margin: 6pt 0;
}
blockquote {
    background: #f5f5f5;
    border-left: 4px solid #2b5797;
    padding: 6pt 12pt;
    margin: 8pt 0;
}
.discipline-tip {
    background: #e8f4fd;
    border-left: 4px solid #d4a017;
    padding: 6pt 12pt;
    margin: 8pt 0;
    font-size: 13pt;
}
img {
    max-width: 60%;
    margin: 8pt auto;
    display: block;
}
table {
    border-collapse: collapse;
    margin: 8pt 0;
    width: 100%;
}
td, th {
    border: 1px solid #ddd;
    padding: 6pt;
}
hr {
    border: none;
    border-top: 1px solid #ddd;
    margin: 16pt 0;
}
.tool-card {
    font-size: 13pt;
    color: #555;
}
`;

function escapeHtml(text) {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function processInline(text) {
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    return text;
}

function isChapterTitle(line) {
    for (let i = 1; i <= 21; i++) {
        const pattern = new RegExp(`^第${i}章\\s`);
        if (pattern.test(line)) return i;  // return chapter number
    }
    return 0;
}

function isPartHeader(line) {
    return /^(记忆篇|理解篇|应用篇|专注篇|动力篇|调节篇|数字化学习篇)/.test(line);
}

function isMethodHeader(line) {
    return /^【(简单方法|进阶方法|高阶方法|高阶方法一|高阶方法二|备选锦囊)】/.test(line);
}

function mdToHtmlBook(mdText) {
    const lines = mdText.split('\n');
    const htmlLines = [];
    let i = 0;
    
    let inParagraph = false;
    let paraLines = [];
    let inBlockquote = false;
    let bqLines = [];
    let inTable = false;
    let tableLines = [];
    let inUl = false;
    let inOl = false;
    let firstH1 = true;
    
    // Track chapter sequence
    let chapterSequenceStarted = false;  // true after 第1章 is seen
    let emittedChapters = new Set();     // track which chapter numbers have been emitted
    
    function flushParagraph() {
        if (paraLines.length > 0) {
            let text = paraLines.join(' ').trim();
            if (text) {
                if (text.includes('🃏')) {
                    htmlLines.push(`<p class="tool-card">${processInline(text)}</p>`);
                } else {
                    htmlLines.push(`<p>${processInline(text)}</p>`);
                }
            }
            paraLines = [];
        }
        inParagraph = false;
    }
    
    function flushBlockquote() {
        if (bqLines.length > 0) {
            let text = bqLines.join(' ').trim();
            if (text.startsWith('📐')) {
                htmlLines.push(`<div class="discipline-tip">${processInline(text)}</div>`);
            } else if (text.includes('🃏')) {
                htmlLines.push(`<blockquote class="tool-card">${processInline(text)}</blockquote>`);
            } else {
                htmlLines.push(`<blockquote>${processInline(text)}</blockquote>`);
            }
            bqLines = [];
        }
        inBlockquote = false;
    }
    
    function flushTable() {
        if (tableLines.length > 0) {
            htmlLines.push('<table>');
            for (let ti = 0; ti < tableLines.length; ti++) {
                const row = tableLines[ti];
                const cells = row.split('|').filter(c => c.trim());
                const tag = ti === 0 ? 'th' : 'td';
                htmlLines.push('<tr>');
                for (const cell of cells) {
                    htmlLines.push(`<${tag}>${processInline(cell.trim())}</${tag}>`);
                }
                htmlLines.push('</tr>');
            }
            htmlLines.push('</table>');
            tableLines = [];
        }
        inTable = false;
    }
    
    function closeLists() {
        if (inUl) { htmlLines.push('</ul>'); inUl = false; }
        if (inOl) { htmlLines.push('</ol>'); inOl = false; }
    }
    
    function emitChapterH1(chapterNum, text) {
        if (emittedChapters.has(chapterNum)) return; // skip duplicate
        // Only emit as h1 if in proper sequence (chapter 1 triggers start, others follow)
        if (chapterNum !== 1 && !chapterSequenceStarted) {
            // Chapters appearing before 第1章 should be h2
            htmlLines.push(`<h2>${processInline(text)}</h2>`);
            return;
        }
        emittedChapters.add(chapterNum);
        chapterSequenceStarted = true;
        htmlLines.push(`<h1>${processInline(text)}</h1>`);
    }
    
    // Check if first non-empty line is the book title (no # marker)
    let firstLineIdx = 0;
    while (firstLineIdx < lines.length && lines[firstLineIdx].trim() === '') firstLineIdx++;
    
    while (i < lines.length) {
        let line = lines[i];
        const stripped = line.trim();
        
        // Book title: first non-empty line starting with 《 (no heading marker)
        if (i === firstLineIdx && stripped.startsWith('《') && firstH1) {
            firstH1 = false;
            htmlLines.push(`<h1 class="no-break">${processInline(stripped)}</h1>`);
            // Skip the next line if it's empty
            i++;
            while (i < lines.length && lines[i].trim() === '') i++;
            continue;
        }
        
        // Empty lines
        if (stripped === '') {
            flushParagraph();
            flushBlockquote();
            closeLists();
            if (inTable) flushTable();
            htmlLines.push('');
            i++;
            continue;
        }
        
        // Special standalone lines that should be headings
        if (stripped === '前言') {
            flushParagraph();
            flushBlockquote();
            closeLists();
            if (inTable) flushTable();
            htmlLines.push(`<h2>${processInline(stripped)}</h2>`);
            i++;
            continue;
        }
        
        // Detect start of 后记 (concluding section after all chapters)
        if (stripped.startsWith('你合上书的时候')) {
            flushParagraph();
            flushBlockquote();
            closeLists();
            if (inTable) flushTable();
            htmlLines.push('<h1>后记</h1>');
            // Continue to process this line as paragraph text
            inParagraph = true;
            paraLines = [stripped];
            i++;
            continue;
        }
        
        // Horizontal rules
        if (stripped === '---' || stripped === '___' || stripped === '***') {
            flushParagraph();
            flushBlockquote();
            closeLists();
            if (inTable) flushTable();
            htmlLines.push('<hr>');
            i++;
            continue;
        }
        
        // Images
        const imgMatch = stripped.match(/^!\[(.*?)\]\((.*?)\)$/);
        if (imgMatch) {
            flushParagraph();
            flushBlockquote();
            closeLists();
            if (inTable) flushTable();
            const alt = imgMatch[1];
            const src = imgMatch[2];
            // Always ensure blank line before image
            if (htmlLines.length === 0 || htmlLines[htmlLines.length - 1] !== '') {
                htmlLines.push('');
            }
            htmlLines.push(`<img src="${src}" alt="${escapeHtml(alt)}">`);
            // Always ensure blank line after image
            htmlLines.push('');
            // If next line in source is also an image, the blank line separator is already there
            i++;
            continue;
        }
        
        // Tables
        if (stripped.includes('|') && stripped.startsWith('|')) {
            flushParagraph();
            flushBlockquote();
            closeLists();
            if (!inTable) {
                inTable = true;
                tableLines = [];
            }
            if (/^\|[\s\-:|\s]+$/.test(stripped)) {
                i++;
                continue;
            }
            tableLines.push(stripped);
            i++;
            continue;
        }
        
        // Blockquotes - each > line becomes its own blockquote for readability
        if (stripped.startsWith('> ')) {
            flushParagraph();
            closeLists();
            if (inTable) flushTable();
            flushBlockquote();
            const content = stripped.substring(2);
            bqLines = [content];
            inBlockquote = true;
            i++;
            continue;
        }
        
        // Markdown headers with #
        const hMatch = stripped.match(/^(#{1,4})\s+(.+)$/);
        if (hMatch) {
            flushParagraph();
            flushBlockquote();
            closeLists();
            if (inTable) flushTable();
            const level = hMatch[1].length;
            let text = hMatch[2];
            
            if (level === 1) {
                // Book title
                const cls = firstH1 ? ' class="no-break"' : '';
                firstH1 = false;
                htmlLines.push(`<h1${cls}>${processInline(text)}</h1>`);
            } else if (level === 2) {
                const textClean = text.trim();
                const chNum = isChapterTitle(textClean);
                if (chNum > 0) {
                    // Only treat as chapter h1 if we're in the main sequence
                    // (after chapterSequenceStarted or this is 第1章 itself)
                    if (chNum === 1 || chapterSequenceStarted) {
                        emitChapterH1(chNum, textClean);
                    } else {
                        // Before sequence starts, treat as h2
                        htmlLines.push(`<h2>${processInline(textClean)}</h2>`);
                    }
                } else if (isPartHeader(textClean)) {
                    htmlLines.push(`<h2>${processInline(textClean)}</h2>`);
                } else {
                    htmlLines.push(`<h2>${processInline(text)}</h2>`);
                }
            } else if (level === 3) {
                htmlLines.push(`<h3>${processInline(text)}</h3>`);
            } else {
                htmlLines.push(`<h4>${processInline(text)}</h4>`);
            }
            i++;
            continue;
        }
        
        // Plain-text chapter headers (no # marker)
        const chNum = isChapterTitle(stripped);
        if (chNum > 0) {
            flushParagraph();
            flushBlockquote();
            closeLists();
            if (inTable) flushTable();
            emitChapterH1(chNum, stripped);
            i++;
            continue;
        }
        
        // Part headers
        if (isPartHeader(stripped)) {
            flushParagraph();
            flushBlockquote();
            closeLists();
            if (inTable) flushTable();
            htmlLines.push(`<h2>${processInline(stripped)}</h2>`);
            i++;
            continue;
        }
        
        // Method headers
        if (isMethodHeader(stripped)) {
            flushParagraph();
            flushBlockquote();
            closeLists();
            if (inTable) flushTable();
            htmlLines.push(`<h3>${processInline(stripped)}</h3>`);
            i++;
            continue;
        }
        
        // Numbered subsections like "一、..." or "二、..."
        if (/^[一二三四五六七八九十]、/.test(stripped)) {
            flushParagraph();
            flushBlockquote();
            closeLists();
            if (inTable) flushTable();
            htmlLines.push(`<h3>${processInline(stripped)}</h3>`);
            i++;
            continue;
        }
        
        // Unordered lists
        const ulMatch = stripped.match(/^(\s*)[-*]\s+(.+)$/);
        if (ulMatch) {
            flushParagraph();
            flushBlockquote();
            if (inTable) flushTable();
            if (!inUl) { inUl = true; htmlLines.push('<ul>'); }
            htmlLines.push(`<li>${processInline(ulMatch[2])}</li>`);
            i++;
            continue;
        }
        
        // Ordered lists
        const olMatch = stripped.match(/^(\s*)\d+[\.、]\s*(.+)$/);
        if (olMatch) {
            flushParagraph();
            flushBlockquote();
            if (inTable) flushTable();
            const content = olMatch[2];
            if (stripped.length > 3 && !/^[一二三四五六七八九十]、/.test(stripped)) {
                if (!inOl) { inOl = true; htmlLines.push('<ol>'); }
                htmlLines.push(`<li>${processInline(content)}</li>`);
                i++;
                continue;
            }
        }
        
        // Close lists if line doesn't continue them
        if (inUl || inOl) {
            closeLists();
            continue;
        }
        
        // Paragraph text
        if (inBlockquote) {
            bqLines.push(stripped);
        } else {
            if (!inParagraph) {
                inParagraph = true;
                paraLines = [];
            }
            paraLines.push(stripped);
        }
        
        i++;
    }
    
    // Flush remaining
    flushParagraph();
    flushBlockquote();
    closeLists();
    if (inTable) flushTable();
    
    return htmlLines.join('\n');
}

function mdToHtmlSimple(mdText, section) {
    // For AI推荐语 and 家长指南 - simpler conversion
    const lines = mdText.split('\n');
    const htmlLines = [];
    let i = 0;
    
    let inParagraph = false;
    let paraLines = [];
    let inBlockquote = false;
    let bqLines = [];
    let inTable = false;
    let tableLines = [];
    let inUl = false;
    let inOl = false;
    let firstH1 = true;
    
    function flushParagraph() {
        if (paraLines.length > 0) {
            let text = paraLines.join(' ').trim();
            if (text) {
                htmlLines.push(`<p>${processInline(text)}</p>`);
            }
            paraLines = [];
        }
        inParagraph = false;
    }
    
    function flushBlockquote() {
        if (bqLines.length > 0) {
            let text = bqLines.join(' ').trim();
            if (text.includes('🃏')) {
                htmlLines.push(`<blockquote class="tool-card">${processInline(text)}</blockquote>`);
            } else {
                htmlLines.push(`<blockquote>${processInline(text)}</blockquote>`);
            }
            bqLines = [];
        }
        inBlockquote = false;
    }
    
    function flushTable() {
        if (tableLines.length > 0) {
            htmlLines.push('<table>');
            for (let ti = 0; ti < tableLines.length; ti++) {
                const row = tableLines[ti];
                const cells = row.split('|').filter(c => c.trim());
                const tag = ti === 0 ? 'th' : 'td';
                htmlLines.push('<tr>');
                for (const cell of cells) {
                    htmlLines.push(`<${tag}>${processInline(cell.trim())}</${tag}>`);
                }
                htmlLines.push('</tr>');
            }
            htmlLines.push('</table>');
            tableLines = [];
        }
        inTable = false;
    }
    
    function closeLists() {
        if (inUl) { htmlLines.push('</ul>'); inUl = false; }
        if (inOl) { htmlLines.push('</ol>'); inOl = false; }
    }
    
    while (i < lines.length) {
        let line = lines[i];
        const stripped = line.trim();
        
        if (stripped === '') {
            flushParagraph();
            flushBlockquote();
            closeLists();
            if (inTable) flushTable();
            htmlLines.push('');
            i++;
            continue;
        }
        
        if (stripped === '---' || stripped === '___' || stripped === '***') {
            flushParagraph();
            flushBlockquote();
            closeLists();
            if (inTable) flushTable();
            htmlLines.push('<hr>');
            i++;
            continue;
        }
        
        const imgMatch = stripped.match(/^!\[(.*?)\]\((.*?)\)$/);
        if (imgMatch) {
            flushParagraph();
            flushBlockquote();
            closeLists();
            if (inTable) flushTable();
            if (htmlLines.length > 0 && htmlLines[htmlLines.length - 1] !== '') {
                htmlLines.push('');
            }
            htmlLines.push(`<img src="${imgMatch[2]}" alt="${escapeHtml(imgMatch[1])}">`);
            htmlLines.push('');
            i++;
            continue;
        }
        
        if (stripped.includes('|') && stripped.startsWith('|')) {
            flushParagraph();
            flushBlockquote();
            closeLists();
            if (!inTable) { inTable = true; tableLines = []; }
            if (/^\|[\s\-:|\s]+$/.test(stripped)) { i++; continue; }
            tableLines.push(stripped);
            i++;
            continue;
        }
        
        if (stripped.startsWith('> ')) {
            flushParagraph();
            closeLists();
            if (inTable) flushTable();
            flushBlockquote();
            bqLines = [stripped.substring(2)];
            inBlockquote = true;
            i++;
            continue;
        }
        
        const hMatch = stripped.match(/^(#{1,4})\s+(.+)$/);
        if (hMatch) {
            flushParagraph();
            flushBlockquote();
            closeLists();
            if (inTable) flushTable();
            const level = hMatch[1].length;
            const text = hMatch[2];
            
            if (level === 1) {
                const cls = firstH1 ? ' class="no-break"' : '';
                firstH1 = false;
                htmlLines.push(`<h1${cls}>${processInline(text)}</h1>`);
            } else if (level === 2) {
                htmlLines.push(`<h2>${processInline(text)}</h2>`);
            } else if (level === 3) {
                htmlLines.push(`<h3>${processInline(text)}</h3>`);
            } else {
                htmlLines.push(`<h4>${processInline(text)}</h4>`);
            }
            i++;
            continue;
        }
        
        const ulMatch = stripped.match(/^(\s*)[-*]\s+(.+)$/);
        if (ulMatch) {
            flushParagraph();
            flushBlockquote();
            if (inTable) flushTable();
            if (!inUl) { inUl = true; htmlLines.push('<ul>'); }
            htmlLines.push(`<li>${processInline(ulMatch[2])}</li>`);
            i++;
            continue;
        }
        
        const olMatch = stripped.match(/^(\s*)\d+[\.、]\s*(.+)$/);
        if (olMatch) {
            flushParagraph();
            flushBlockquote();
            if (inTable) flushTable();
            const content = olMatch[2];
            if (stripped.length > 3) {
                if (!inOl) { inOl = true; htmlLines.push('<ol>'); }
                htmlLines.push(`<li>${processInline(content)}</li>`);
                i++;
                continue;
            }
        }
        
        if (inUl || inOl) {
            closeLists();
            continue;
        }
        
        if (inBlockquote) {
            bqLines.push(stripped);
        } else {
            if (!inParagraph) { inParagraph = true; paraLines = []; }
            paraLines.push(stripped);
        }
        
        i++;
    }
    
    flushParagraph();
    flushBlockquote();
    closeLists();
    if (inTable) flushTable();
    
    return htmlLines.join('\n');
}

function main() {
    const aiText = fs.readFileSync(AI_MD, 'utf-8');
    const bookText = fs.readFileSync(BOOK_MD, 'utf-8');
    const parentText = fs.readFileSync(PARENT_MD, 'utf-8');
    
    const aiHtml = mdToHtmlSimple(aiText, 'ai');
    const bookHtml = mdToHtmlBook(bookText);
    const parentHtml = mdToHtmlSimple(parentText, 'parent');
    
    const fullHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>高效学习手册</title>
<style>
${CSS}
</style>
</head>
<body>

<!-- ====== 第一部分：AI推荐语 ====== -->
${aiHtml}

<!-- ====== 第二部分：学生书正文+后记 ====== -->
${bookHtml}

<!-- ====== 第三部分：家长指南 ====== -->
${parentHtml}

</body>
</html>`;
    
    fs.writeFileSync(OUTPUT, '\uFEFF' + fullHtml, 'utf-8');
    
    console.log(`HTML generated: ${OUTPUT}`);
    const stats = fs.statSync(OUTPUT);
    console.log(`File size: ${stats.size} bytes`);
}

main();
