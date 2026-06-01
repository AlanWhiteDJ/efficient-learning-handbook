const fs = require('fs');
const FILE = 'C:\\Users\\Administrator\\.openclaw\\workspace\\efficient-learning-handbook\\高效学习手册.md';
let c = fs.readFileSync(FILE, 'utf8').replace(/\r\n/g, '\n');

// Fix SVG paths
c = c.replace(/!\[(.*?)\]\((\d+_.*?\.svg)\)/g, '![$1](illustrations/$2)');

// Add ch19/20 checklist
c = c.replace('### AI依赖型', '### 管不住手型 → 第19章 屏幕管理\n\n- [ ] 学习前先刷手机，说好5分钟，再看表已经过了半小时\n- [ ] 本来只想查一道题，结果被短视频/消息拐跑了\n- [ ] 手机放桌上，余光扫到就想拿\n\n### 考砸型 → 第20章 考试策略\n\n- [ ] 平时都会，一上考场就发挥失常\n- [ ] 卷子发下来先懵5分钟\n- [ ] 经常因为审题/时间/粗心丢分——不是不会，是不会考\n\n### AI依赖型');

// Remove dups that exist in the original
c = c.replace('第14章 自主：为什么总是被逼著学？\n\n一、为什么一提学习就抵触', '一、为什么一提学习就抵触');
c = c.replace('![AI学习伙伴](illustrations/54_AI学习伙伴.svg)\n\n\n\n![AI学习伙伴](illustrations/54_AI学习伙伴.svg)', '![AI学习伙伴](illustrations/54_AI学习伙伴.svg)');
c = c.replace(/\n\n> \*\*Q109\*\*[\s\S]*?\n\n\n### 探索问题/, '\n\n\n### 探索问题');

// ===== SEPARATE 4 IMAGE PAIRS =====
// Each replacement uses enough context to be unique (appears exactly once)

// Pair 1: 海马体守门人 + 睡眠记忆回放 (both before ## 海马体的夜班工作)
// After fix: 海马体守门人 stays before 海马体的夜班, 睡眠 moves into content body
c = c.replace(
  '![海马体守门人](illustrations/01_海马体守门人.svg)\n\n![睡眠记忆回放](illustrations/49_睡眠记忆回放.svg)\n\n## 海马体的夜班工作：睡眠与记忆巩固',
  '![海马体守门人](illustrations/01_海马体守门人.svg)\n\n## 海马体的夜班工作：睡眠与记忆巩固'
);
c = c.replace(
  '你以为睡着之后大脑在休息？正好相反。你睡着以后，海马体才开始真正干活。',
  '你以为睡着之后大脑在休息？正好相反。你睡着以后，海马体才开始真正干活。\n\n![睡眠记忆回放](illustrations/49_睡眠记忆回放.svg)'
);

// Pair 2: 合书拷问四步法 + 白纸倾泻法 (before 【简单方法】合书拷问法)
// 合书 stays, 白纸 moves to before 强制输出法
c = c.replace(
  '![合书拷问四步法](illustrations/08_合书拷问四步法.svg)\n\n![白纸倾泻法](illustrations/09_白纸倾泻法.svg)\n\n【简单方法】合书拷问法——每天一次的',
  '![合书拷问四步法](illustrations/08_合书拷问四步法.svg)\n\n【简单方法】合书拷问法——每天一次的'
);
// Put 白纸 before 强制输出法 - use unique full header
c = c.replace(
  '【进阶方法】强制输出法——把"输入模式"切换成"输出模式"',
  '![白纸倾泻法](illustrations/09_白纸倾泻法.svg)\n\n【进阶方法】强制输出法——把"输入模式"切换成"输出模式"'
);

// Pair 3: 识别vs提取 + 有间隔的彩排 (before 【高阶方法】有间隔的彩排)
// 识别vs提取 → before 一、为什么会看了就忘
c = c.replace(
  '![识别vs提取](illustrations/07_识别vs提取.svg)\n\n![有间隔的彩排](illustrations/10_有间隔的彩排.svg)\n\n【高阶方法】有间隔的彩排——模拟考试的',
  '![有间隔的彩排](illustrations/10_有间隔的彩排.svg)\n\n【高阶方法】有间隔的彩排——模拟考试的'
);
c = c.replace(
  '一、为什么会"看了就忘"\n你肯定有过这种经历：',
  '![识别vs提取](illustrations/07_识别vs提取.svg)\n\n一、为什么会"看了就忘"\n你肯定有过这种经历：'
);

// Pair 4: 一题通吃法题型卡片 + 一题通吃文理双轨 (before 【高阶方法】一题通吃法)
c = c.replace(
  '![一题通吃法题型卡片](illustrations/21_一题通吃法题型卡片.svg)\n\n![一题通吃文理双轨](illustrations/52_一题通吃文理双轨.svg)\n\n【高阶方法】一题通吃法——用一个典型例题',
  '![一题通吃法题型卡片](illustrations/21_一题通吃法题型卡片.svg)\n\n【高阶方法】一题通吃法——用一个典型例题'
);
c = c.replace(
  '不是多刷同类题，而是把一个典型题的所有变化可能性都挖掘出来。一道题榨干了，一类题就都解决了。\n\n操作步骤（4步）：',
  '不是多刷同类题，而是把一个典型题的所有变化可能性都挖掘出来。一道题榨干了，一类题就都解决了。\n\n![一题通吃文理双轨](illustrations/52_一题通吃文理双轨.svg)\n\n操作步骤（4步）：'
);

fs.writeFileSync(FILE, c, 'utf8');
console.log('All done');
