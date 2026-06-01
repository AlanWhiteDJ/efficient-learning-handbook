const fs = require('fs');
const FILE = 'C:\\Users\\Administrator\\.openclaw\\workspace\\efficient-learning-handbook\\高效学习手册.md';
let c = fs.readFileSync(FILE, 'utf8');

// Fix card references: ](card_ → ](cards/card_
c = c.replace(/\]\(card_/g, '](cards/card_');

fs.writeFileSync(FILE, c, 'utf8');
console.log('Card paths fixed');
