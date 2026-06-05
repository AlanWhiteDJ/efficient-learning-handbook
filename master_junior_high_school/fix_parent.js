const fs = require('fs');
const FILE = 'C:\\Users\\Administrator\\.openclaw\\workspace\\efficient-learning-handbook\\家长指南.md';
let c = fs.readFileSync(FILE, 'utf8').replace(/\r\n/g, '\n');
const lines = c.split('\n');
const result = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const trimmed = line.trim();
  
  // Check if this is a blank line between two numbered list items
  if (trimmed === '' && i > 0 && i < lines.length - 1) {
    const prevTrim = lines[i-1].trim();
    const nextTrim = lines[i+1].trim();
    const prevIsNum = /^\d+\.\s/.test(prevTrim);
    const nextIsNum = /^\d+\.\s/.test(nextTrim);
    
    // Also check if previous line is content continuation (indented) of a numbered item
    const prevIsContent = lines[i-1].startsWith('   ') && !prevTrim.startsWith('#') && !prevTrim.startsWith('>') && !prevTrim.startsWith('|') && !prevTrim.startsWith('-');
    
    if ((prevIsNum && nextIsNum) || (prevIsContent && nextIsNum)) {
      // Skip this blank line - it breaks the list
      continue;
    }
  }
  
  result.push(line);
}

fs.writeFileSync(FILE, result.join('\n'), 'utf8');
console.log('Done: ' + (lines.length - result.length) + ' blank lines removed');
