const fs = require('fs');

const FILE = 'C:\\Users\\Administrator\\.openclaw\\workspace\\efficient-learning-handbook\\高效学习手册.md';
let content = fs.readFileSync(FILE, 'utf8');

// Fix SVG paths
content = content.replace(/!\[(.*?)\]\((\d+_.*?\.svg)\)/g, '![$1](illustrations/$2)');

// Add ch19/20 checklist
const aiSection = '\n### AI依赖型';
const insertChecklist = `
### 管不住手型 → 第19章 屏幕管理

- [ ] 学习前先刷手机，说好5分钟，再看表已经过了半小时
- [ ] 本来只想查一道题，结果被短视频/消息拐跑了
- [ ] 手机放桌上，余光扫到就想拿

### 考砸型 → 第20章 考试策略

- [ ] 平时都会，一上考场就发挥失常
- [ ] 卷子发下来先懵5分钟
- [ ] 经常因为审题/时间/粗心丢分——不是不会，是不会考

`;
content = content.replace(aiSection, insertChecklist + aiSection.trimStart());

const lines = content.split('\n');

// Build chapter index
let chStarts = {}, chEnds = {};
for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(/^第(\d+)章\s/);
  if (m) chStarts[parseInt(m[1])] = i;
}
const nums = Object.keys(chStarts).map(Number).sort((a,b)=>a-b);
for (let idx = 0; idx < nums.length; idx++) {
  const n = nums[idx];
  chEnds[n] = (idx+1 < nums.length) ? chStarts[nums[idx+1]] - 1 : lines.length - 1;
}

// Section detection
function isSectionLine(t) {
  return /^(一、|二、|三、|四、|五、|六、|【.*】|#{2,3}\s|本章小结|延伸阅读)/.test(t) ||
    /海马体的夜班/.test(t) || /全章工具箱/.test(t) || /方法速查/.test(t) ||
    /如果方法用了/.test(t) || /如果做不到/.test(t);
}

// Get sections for a chapter (skip 探索问题 - images go to content, not Qs)
function getSections(from, to) {
  let secs = [];
  for (let i = from; i <= to; i++) {
    const t = lines[i].trim();
    if (isSectionLine(t) && !t.includes('探索问题')) secs.push({ line: i, text: t });
  }
  return secs;
}

// Match image to section - uses tokens (numbers + CJK words) with character-level CJK fallback
function matchImage(alt, sections) {
  // Tokenize: keep number sequences, CJK character sequences
  const tokens = alt.match(/\d+|[\u4e00-\u9fff]+/g) || [];
  let best = null, bestScore = 0;
  
  for (const sec of sections) {
    let score = 0;
    for (const tok of tokens) {
      if (sec.text.includes(tok)) {
        // Exact match: weight by length squared
        score += tok.length * tok.length;
      } else if (/[\u4e00-\u9fff]/.test(tok)) {
        // CJK: character-level fallback
        let charHits = 0;
        for (const ch of tok) {
          if (sec.text.includes(ch)) charHits++;
        }
        score += charHits * charHits;
      }
    }
    if (score > bestScore) { bestScore = score; best = sec; }
  }
  
  return { section: best, score: bestScore };
}

// Process
let result = [];
let i = 0;
while (i < lines.length) {
  const chMatch = lines[i].match(/^第(\d+)章\s/);
  if (!chMatch) { result.push(lines[i]); i++; continue; }
  
  const chNum = parseInt(chMatch[1]);
  const chEnd = chEnds[chNum] || (lines.length - 1);
  
  result.push(lines[i]); i++; // chapter title
  
  // Collect header images
  let headerImgs = [];
  while (i <= chEnd) {
    const t = lines[i].trim();
    if (t.startsWith('![')) { headerImgs.push({ line: lines[i] }); i++; }
    else if (t === '') { i++; }
    else break;
  }
  
  const contentStart = i;
  const sections = getSections(contentStart, chEnd);
  
  // Find first numbered section (一、二、etc) for fallback
  let firstNumberedSection = contentStart;
  for (const sec of sections) {
    if (/^[一二三四五六]、/.test(sec.text)) { firstNumberedSection = sec.line; break; }
  }
  
  // Assign images
  let assigned = {};
  for (const img of headerImgs) {
    const altMatch = img.line.match(/!\[(.*?)\]/);
    const alt = altMatch ? altMatch[1] : '';
    const { section: bestSec } = matchImage(alt, sections);
    
    let targetLine;
    // Special: method速查/工具箱/总地图 → end of chapter
    if (/方法速查|工具箱|总地图/.test(alt)) {
      targetLine = sections.length > 0 ? sections[sections.length - 1].line : firstNumberedSection;
    } else if (bestSec && bestSec.line > 0) {
      targetLine = bestSec.line;
    } else {
      targetLine = firstNumberedSection;
    }
    
    if (!assigned[targetLine]) assigned[targetLine] = [];
    assigned[targetLine].push(img.line);
  }
  
  result.push(''); // blank after title
  
  // Emit content with images
  for (let j = contentStart; j <= chEnd; j++) {
    if (assigned[j]) {
      for (const imgLine of assigned[j]) {
        result.push(imgLine);
        result.push('');
      }
    }
    result.push(lines[j]);
  }
  
  i = chEnd + 1;
}

fs.writeFileSync(FILE, result.join('\n'), 'utf8');
console.log('Done: paths + checklist + images');
