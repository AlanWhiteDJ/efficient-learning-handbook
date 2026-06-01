const fs = require('fs');

const FILE = 'C:\\Users\\Administrator\\.openclaw\\workspace\\efficient-learning-handbook\\高效学习手册.md';
let content = fs.readFileSync(FILE, 'utf8');

// Fix 3: Add illustrations/ prefix to all image paths
// Match ![alt](filename.svg) where filename starts with digits
content = content.replace(/!\[(.*?)\]\((\d+_.*?\.svg)\)/g, '![$1](illustrations/$2)');

// Fix 1: Add self-test checklist items for chapters 19 & 20
// Find the AI依赖型 section and add before it
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

const aiSection = '### AI依赖型';
if (content.includes(aiSection)) {
  content = content.replace(aiSection, insertChecklist + aiSection);
}

fs.writeFileSync(FILE, content, 'utf8');
console.log('Fixed SVG paths and added ch19/20 checklist items');
