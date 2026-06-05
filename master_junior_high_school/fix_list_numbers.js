const fs = require('fs');
const FILE = 'C:\\Users\\Administrator\\.openclaw\\workspace\\efficient-learning-handbook\\高效学习手册.md';
let c = fs.readFileSync(FILE, 'utf8').replace(/\r\n/g, '\n');
const lines = c.split('\n');
const out = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const trimmed = line.trim();
  
  if (i > 0 && line.startsWith('   ') && trimmed.length > 0 && 
      !trimmed.startsWith('>') && !trimmed.startsWith('#') && 
      !trimmed.startsWith('|') && !trimmed.startsWith('-') &&
      !trimmed.startsWith('![') && !/^\d/.test(trimmed) &&
      !/^[一二三四五六七八九十]、/.test(trimmed)) {
    const prev = out[out.length - 1].trim();
    if (/^\d+[\.、]/.test(prev)) {
      out[out.length - 1] = out[out.length - 1] + ' ' + trimmed;
      continue;
    }
  }
  
  out.push(line);
}

fs.writeFileSync(FILE, out.join('\n'), 'utf8');
console.log('Main book: merged continuation lines into numbered items');
