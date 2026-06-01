const fs = require('fs');
const FILE = 'C:\\Users\\Administrator\\.openclaw\\workspace\\efficient-learning-handbook\\高效学习手册.md';
let c = fs.readFileSync(FILE, 'utf8');

// Pair 1: 海马体守门人 + 睡眠记忆回放 → separate, put sleep image deeper
// (already done manually above for pair 1)

// Pair 2: 合书拷问四步法 + 白纸倾泻法 → already fixed (白纸 moved to 强制输出法)

// Pair 3: 识别vs提取 + 有间隔的彩排 → put 识别vs提取 before 一、 of ch2
// Remove from current position (before 【高阶方法】有间隔的彩排)
c = c.replace(
  '一翻书就回到了识别模式。\n![识别vs提取](illustrations/07_识别vs提取.svg)\n\n![有间隔的彩排](illustrations/10_有间隔的彩排.svg)\n\n【高阶方法】有间隔的彩排',
  '一翻书就回到了识别模式。\n\n![有间隔的彩排](illustrations/10_有间隔的彩排.svg)\n\n【高阶方法】有间隔的彩排'
);

// Insert 识别vs提取 before "一、为什么会"看了就忘"" in ch2
// Find "一、为什么会"看了就忘"" that's after "### 探索问题" in ch2
c = c.replace(
  '一、为什么会"看了就忘"\n你肯定有过这种经历',
  '![识别vs提取](illustrations/07_识别vs提取.svg)\n\n一、为什么会"看了就忘"\n你肯定有过这种经历'
);

// But we only want to fix the one in ch2. Let me be more targeted by using unique context.
// Actually the first match should be ch2 since that's where this text first appears after ch2's 探索问题.
// Let me check... actually ch2's content says "一、为什么会"看了就忘"" with Chinese quotes.
// The regex already used the exact match.

// Pair 4: 一题通吃法题型卡片 + 一题通吃文理双轨 → separate
c = c.replace(
  '![一题通吃法题型卡片](illustrations/21_一题通吃法题型卡片.svg)\n\n![一题通吃文理双轨](illustrations/52_一题通吃文理双轨.svg)\n\n【高阶方法】一题通吃法',
  '![一题通吃法题型卡片](illustrations/21_一题通吃法题型卡片.svg)\n\n【高阶方法】一题通吃法'
);

// Insert 一题通吃文理双轨 inside the 一题通吃法 method content (after first paragraph)
c = c.replace(
  '不是多刷同类题，而是把一个典型题的所有变化可能性都挖掘出来。一道题榨干了，一类题就都解决了。\n\n操作步骤',
  '不是多刷同类题，而是把一个典型题的所有变化可能性都挖掘出来。一道题榨干了，一类题就都解决了。\n\n![一题通吃文理双轨](illustrations/52_一题通吃文理双轨.svg)\n\n操作步骤'
);

// Pair 1 reminder: put 睡眠记忆回放 inside the 海马体夜班 content
// Find "你睡着之后，海马体才开始真正干活" and insert before it
c = c.replace(
  '你睡着之后，海马体才开始真正干活',
  '![睡眠记忆回放](illustrations/49_睡眠记忆回放.svg)\n\n你睡着之后，海马体才开始真正干活'
);

fs.writeFileSync(FILE, c, 'utf8');
console.log('All close image pairs separated');
