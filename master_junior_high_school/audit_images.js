const fs = require('fs');
const FILE = 'C:\\Users\\Administrator\\.openclaw\\workspace\\efficient-learning-handbook\\高效学习手册.md';
const lines = fs.readFileSync(FILE, 'utf8').split('\n');

// Find all images and their surrounding context
let currentChapter = 0;
for (let i = 0; i < lines.length; i++) {
  const chM = lines[i].match(/^第(\d+)章\s/);
  if (chM) currentChapter = parseInt(chM[1]);
  
  const imgM = lines[i].match(/^!\[(.*?)\]\(illustrations\/(.*?\.svg)\)$/);
  if (imgM) {
    // Find nearest section header above and below
    let prevSection = '(none)', nextSection = '(none)';
    for (let j = i-1; j >= 0; j--) {
      const t = lines[j].trim();
      if (/^(一、|二、|三、|四、|五、|六、|【|#{2,3}\s|本章|延伸|全章|方法速查|海马体|如果)/.test(t) && !t.includes('探索问题')) {
        prevSection = t.substring(0, 50); break;
      }
    }
    for (let j = i+1; j < lines.length && j < i+5; j++) {
      const t = lines[j].trim();
      if (/^(一、|二、|三、|四、|五、|六、|【|#{2,3}\s|本章|延伸|全章|方法速查|海马体|如果)/.test(t) && !t.includes('探索问题')) {
        nextSection = t.substring(0, 50); break;
      }
    }
    console.log(`Ch${currentChapter} L${i+1}: ${imgM[1]} → before "${nextSection}"`);
  }
}
