---
name: add-html-ppt
description: 创建基于 React + Vite 的 HTML 幻灯片演示文稿。当用户需要制作 PPT、创建幻灯片、做演示文稿、写 slides、做分享材料时使用此技能。支持赛博朋克/霓虹风格主题、Framer Motion 动画过渡、键盘和点击导航。产物为纯静态 HTML，可直接部署到博客。
---

# 创建 HTML 幻灯片

## 项目位置

- 源码：`_src/<project-name>/`
- 产物：`files/powerpoint/<project-name>/`
- 模板：`_src/agent-skills/`（复制此目录作为起点）

## 快速开始

1. 复制模板
```bash
cp -r _src/agent-skills _src/<new-name>
```

2. 修改 `vite.config.ts` 的 outDir
```typescript
build: {
  outDir: path.resolve(__dirname, "../../files/powerpoint/<new-name>"),
  emptyOutDir: true
}
```

3. 编辑 `src/lib/slides-data.ts` 定义幻灯片内容

4. 构建
```bash
cd _src/<new-name> && npm install && npm run build
```

5. 在 `_posts/2017-09-16-ppt.md` 添加链接
```markdown
* [标题]({{ site.paths.ppt }}<new-name>/index.html)
```

## 幻灯片数据格式

编辑 `src/lib/slides-data.ts`：

```typescript
export const slides: SlideData[] = [
  {
    id: "cover",
    type: "title-cover",  // 封面
    title: "演示标题",
    points: ["副标题"],
    image: coverBg  // 从 @/assets/ 导入
  },
  {
    id: "agenda",
    type: "agenda",  // 目录
    title: "目录",
    points: ["第一章", "第二章", "第三章"]
  },
  {
    id: "section-1",
    type: "section-divider",  // 章节分隔
    title: "第一章标题",
    points: ["章节副标题"]
  },
  {
    id: "content-1",
    type: "content",  // 内容页
    title: "内容页标题",
    points: [
      "要点一：说明文字",
      "• 子项用 • 符号",
      "要点二：另一个说明"
    ],
    extra: "侧边栏补充说明（可选）"
  },
  {
    id: "closing",
    type: "closing",  // 结束页
    title: "谢谢",
    points: ["联系方式或结语"],
    image: closingBg
  }
];
```

## 幻灯片类型速查

| type | 用途 | 布局 |
|------|------|------|
| `title-cover` | 封面 | 居中大标题 + 背景图 |
| `agenda` | 目录 | 编号列表 |
| `section-divider` | 章节分隔 | 居中标题 + 渐变背景 |
| `content` | 内容页 | 左侧要点 + 右侧备注 |
| `closing` | 结束页 | 居中 + 背景图 |

## 样式主题

- 主色：`neon-blue` (#00f3ff)
- 强调：`neon-purple` (#bc13fe)
- 辅助：`neon-cyan` (#00fff0)
- 背景：#050510 深色
- 字体：Orbitron（标题）、Rajdhani（正文）

## 注意事项

- 每页建议 4-6 个要点，避免内容溢出
- 图片放 `src/assets/`，通过 import 引入
- 导航：点击/右箭头/空格=下一页，左箭头=上一页
