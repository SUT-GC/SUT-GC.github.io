---
name: add-photo
description: 在 SutGC's Blog 的摄影墙添加一张新照片。当用户想要添加、上传摄影作品到摄影页面时使用此技能。
---

# 添加摄影作品

编辑 `_data/photos.yml` 文件添加新照片。

## 图床信息

R2 图床基础地址配置在 `r2_base_url` 字段。

## 配置格式

```yaml
- filename: 分类文件夹/图片文件名.jpg
  title: 图片标题
  category: 分类ID
  date: YYYY-MM-DD
  description: 图片描述
```

## 字段说明

| 字段 | 说明 |
|------|------|
| `filename` | 图片在 R2 上的相对路径 |
| `title` | 图片标题 |
| `category` | 分类 ID |
| `date` | 拍摄日期 YYYY-MM-DD |
| `description` | 图片描述（可选） |

## 可用分类

| ID | 名称 | 说明 |
|----|------|------|
| `landscape` | 风光 | 自然风景、城市风光 |
| `portrait` | 人像 | 人物摄影 |
| `street` | 街拍 | 街头摄影、纪实 |
| `life` | 生活 | 日常生活记录 |

## EXIF 信息（可选）

```yaml
- filename: landscape/sunset.jpg
  title: 海边日落
  category: landscape
  date: 2024-12-10
  description: 厦门海边的日落
  exif:
    camera: Sony A7M4
    lens: 24-70mm f/2.8
    aperture: f/2.8
    shutter: 1/500s
    iso: 400
```

## 预览

```bash
bundle exec jekyll serve
```

访问 http://localhost:4000/photography/
