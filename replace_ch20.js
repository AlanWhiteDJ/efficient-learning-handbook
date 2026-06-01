const fs = require('fs');
const FILE = 'C:\\Users\\Administrator\\.openclaw\\workspace\\efficient-learning-handbook\\高效学习手册.md';
let main = fs.readFileSync(FILE, 'utf8').replace(/\r\n/g, '\n');
let ch20 = fs.readFileSync('C:\\Users\\Administrator\\.openclaw\\workspace\\efficient-learning-handbook\\ch20_new.md', 'utf8').replace(/\r\n/g, '\n');

// Find the LAST occurrence of "第20章 考试策略" (the actual chapter, not TOC ref)
// The actual chapter is followed by blank line then "一、"
// It's the last "第20章" before "# 第21章"
const ch21Idx = main.indexOf('\n# 第21章');
const before21 = main.substring(0, ch21Idx);
const ch20Idx = before21.lastIndexOf('第20章 考试策略');

if (ch20Idx < 0 || ch21Idx < 0) {
  console.log('ERROR: boundaries not found');
  process.exit(1);
}

console.log('ch20 at offset', ch20Idx, 'ch21 at offset', ch21Idx);

const before = main.substring(0, ch20Idx);
const after = main.substring(ch21Idx);

const newMain = before + ch20.trimEnd() + '\n\n' + after.trimStart();

fs.writeFileSync(FILE, newMain, 'utf8');
console.log('Done. Size:', newMain.length, 'bytes');
