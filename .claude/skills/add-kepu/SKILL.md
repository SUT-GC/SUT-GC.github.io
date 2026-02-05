---
name: add-kepu
description: 在 SutGC's Blog 中创建一个科普内容。当用户想要添加科普、创建科普分享、做科普演示文稿时使用此技能。科普内容以 HTML 幻灯片形式呈现，展示在 /kepu/ 页面的卡片列表中。
---

# 创建科普内容

科普内容 = HTML 幻灯片 + kepu.yml 数据条目。幻灯片使用 React + Vite 构建，展示在 `/kepu/` 页面。

## 完整流程

### 第一步：创建幻灯片项目

1. 复制模板（**不要复制** `node_modules`、`package-lock.json`、`CLAUDE.md`、`SCRIPT.md`、`README.md`）
```bash
cp -r _src/agent-skills _src/<project-name>
rm -rf _src/<project-name>/node_modules _src/<project-name>/package-lock.json
rm -f _src/<project-name>/CLAUDE.md _src/<project-name>/SCRIPT.md _src/<project-name>/README.md
```

2. 修改 `_src/<project-name>/vite.config.ts` 的 outDir
```typescript
build: {
  outDir: path.resolve(__dirname, "../../files/powerpoint/<project-name>"),
  emptyOutDir: true
}
```

3. 编辑 `_src/<project-name>/src/lib/slides-data.ts` 定义幻灯片内容（详见下方"幻灯片数据格式"）

4. 构建
```bash
cd _src/<project-name> && npm install && npm run build
```

### 第二步：添加 kepu.yml 条目

编辑 `_data/kepu.yml`，在末尾添加：

```yaml
- name: 标题
  description: 一句话描述
  icon: "emoji图标"
  url: /files/powerpoint/<project-name>/index.html
  date: YYYY-MM-DD
```

## 幻灯片数据格式

编辑 `src/lib/slides-data.ts`：

```typescript
import coverBg from "@/assets/cover-bg.jpg";
import closingBg from "@/assets/closing-bg.jpg";

export const slides: SlideData[] = [
  {
    id: "cover",
    type: "title-cover",  // 封面
    title: "演示标题",
    subtitle: "副标题",
    points: ["描述文字"],
    image: coverBg
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
      "• 子项用 • 符号缩进",
      "要点二：另一个说明"
    ],
    extra: "侧边栏补充说明（可选）"
  },
  {
    id: "compare-1",
    type: "comparison",  // 对比页
    title: "对比标题",
    leftTitle: "方案A",
    leftIcon: "💡",
    leftPoints: ["优点1", "优点2"],
    rightTitle: "方案B",
    rightIcon: "🔧",
    rightPoints: ["优点1", "优点2"]
  },
  {
    id: "code-1",
    type: "code-example",  // 代码示例
    title: "代码展示",
    code: `function hello() {\n  console.log("world");\n}`,
    codeLanguage: "typescript",
    extra: "代码说明"
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

| type | 用途 | 关键字段 |
|------|------|----------|
| `title-cover` | 封面 | `title`, `subtitle`, `points`, `image` |
| `agenda` | 目录 | `title`, `points`（自动编号） |
| `section-divider` | 章节分隔 | `title`, `points` |
| `content` | 内容页 | `title`, `points`, `extra`（可选侧栏） |
| `comparison` | 对比页 | `leftTitle/Points/Icon`, `rightTitle/Points/Icon` |
| `code-example` | 代码示例 | `code`, `codeLanguage`, `extra` |
| `quote` | 引用页 | `quote`, `quoteCn`, `quoteAuthor` |
| `pyramid` | 金字塔 | `pyramidLevels: [{title, description, icon}]` |
| `stats` | 数据统计 | `stats: [{value, label, description}]` |
| `resources` | 资源列表 | `resources: [{title, url, description}]` |
| `closing` | 结束页 | `title`, `points`, `image` |

## kepu.yml 字段说明

| 字段 | 说明 |
|------|------|
| `name` | 标题，展示在卡片上 |
| `description` | 一句话描述 |
| `icon` | emoji 图标，用引号包裹（如 `"🎯"`） |
| `url` | 固定格式：`/files/powerpoint/<project-name>/index.html` |
| `date` | 日期 `YYYY-MM-DD` |

## 注意事项

- 每页建议 4-6 个要点，避免内容溢出
- 图片放 `src/assets/`，通过 `import` 引入
- HTML 中的 `<` `>` 符号需转义为 `&lt;` `&gt;`，否则构建会报错
- 构建命令中使用绝对路径，避免使用 `cd` 后再执行其他命令
- 导航：点击/右箭头/空格 = 下一页，左箭头 = 上一页

## 预览

```bash
bundle exec jekyll serve
```

访问 http://localhost:4000/kepu/
