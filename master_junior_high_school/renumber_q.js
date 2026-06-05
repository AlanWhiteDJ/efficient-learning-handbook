const fs = require('fs');

const file = 'C:\\Users\\Administrator\\.openclaw\\workspace\\efficient-learning-handbook\\高效学习手册.md';
let content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

// ========== PASS 1: Map exploration blocks to chapters ==========
let currentChapter = 0;
let explorationSections = [];
let inBlock = false;
let blockStart = -1;
let qLines = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Track chapter: line starting with optional # prefix + 第N章
  const chMatch = line.match(/^(?:#{1,3}\s*)?第(\d+)章\s/);
  if (chMatch) {
    currentChapter = parseInt(chMatch[1]);
  }
  
  if (line.trim() === '### 探索问题') {
    inBlock = true;
    blockStart = i;
    qLines = [];
  } else if (inBlock) {
    if (line.match(/^> \*\*Q\d+\*\*：/)) {
      qLines.push(i);
    } else if (qLines.length > 0 && line.trim() !== '' && !line.startsWith('>')) {
      // End of Q block: next line is non-empty and not a Q line or blank
      explorationSections.push({
        headerLine: blockStart,
        qLines: [...qLines],
        chapter: currentChapter
      });
      inBlock = false;
      qLines = [];
    }
  }
}

// Catch last block if file ends with Q lines
if (inBlock && qLines.length > 0) {
  explorationSections.push({
    headerLine: blockStart,
    qLines: [...qLines],
    chapter: currentChapter
  });
}

console.log(`Found ${explorationSections.length} exploration sections:`);
explorationSections.forEach((s, idx) => {
  console.log(`  Block ${idx + 1}: line ${s.headerLine}, ch ${s.chapter}, ${s.qLines.length} questions`);
});

// ========== PASS 2: Renumber questions by chapter ==========
let chCounters = {};
for (const sec of explorationSections) {
  const ch = sec.chapter;
  if (!chCounters[ch]) chCounters[ch] = 1;
  
  for (const qLine of sec.qLines) {
    const line = lines[qLine];
    const newQNum = `Q${ch}-${chCounters[ch]}`;
    lines[qLine] = line.replace(/\*\*Q\d+\*\*/, `**${newQNum}**`);
    chCounters[ch]++;
  }
}

// ========== PASS 3: Add blank lines between consecutive Q lines ==========
let result = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  result.push(line);
  
  if (line.match(/^> \*\*Q\d+-\d+\*\*：/)) {
    // Look ahead for next Q line (skip blanks)
    let j = i + 1;
    while (j < lines.length && lines[j].trim() === '') j++;
    if (j < lines.length && lines[j].match(/^> \*\*Q\d+-\d+\*\*：/)) {
      result.push(''); // blank line between Qs
    }
  }
}

fs.writeFileSync(file, result.join('\n'), 'utf8');
console.log('\nDone! Renumbered by chapter with line breaks.');
