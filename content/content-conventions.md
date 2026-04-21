# 内容组织规范

本站采用**目录式文档单元**：每篇文章都是一个文件夹。

## 规范

- 正文文件统一命名为 `index.md`
- 图片、PDF、补充材料与正文放在同一目录下
- 建议附件放在 `assets/` 子目录中
- Markdown 中统一使用相对路径引用资源

## 示例

```text
docs/papers/example-paper/
├── index.md
└── assets/
    ├── figure-1.png
    └── appendix.pdf
```

正文中引用：

```md
![结构图](./assets/figure-1.png)
[附录 PDF](./assets/appendix.pdf)
```

## 命名建议

- 目录名使用英文 slug：`efficient-cxl-security`
- 图片名简洁稳定：`figure-1.png`、`overview.png`
- 不要在文件名中使用空格

## 原则

一篇文章的文字和资源尽量放在一起，方便：

- 迁移
- 备份
- 重命名
- Git 历史追踪
- 批量处理
