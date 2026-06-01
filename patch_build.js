const fs = require('fs');
const FILE = 'C:\\Users\\Administrator\\.openclaw\\workspace\\efficient-learning-handbook\\build_html.js';
let c = fs.readFileSync(FILE, 'utf8').replace(/\r\n/g, '\n');

// Fix sidebar chapter detection: also match "# 第N章" format (used by ch21)
c = c.replace(
  "const chM = t.match(/^第(\\d+)章\\s+(.+)$/);",
  "const chM = t.match(/^(?:#\\s*)?第(\\d+)章\\s+(.+)$/);"
);

fs.writeFileSync(FILE, c, 'utf8');
console.log('Sidebar chapter detection fixed for ch21');
