# 咖啡风味科学手册 · Coffee & Flavor Science Handbook

面向咖啡爱好者的双语交互式 HTML 电子书。手册系列「通识线」第二本。

**在线阅读：<https://xxxxxthhh.github.io/coffee-handbook/>**（`gh-pages` 分支部署，内容由 `node tools/publish.mjs` 生成的 `dist/` 提供）
核心卖点：把「玄学参数」还原成可解释的机制——每章一个可交互实验，拖动变量看风味往哪边走。

## 仓库导航（给 Claude Code）

| 文件 | 作用 |
|------|------|
| `CLAUDE.md` | 项目约定（必读）：五要素结构、机制优先原则、交互规范、dark mode、写作红线、构建顺序 |
| `QUALITY.md` | 系列批量生产质量协议（必读）：六类衰减的外部检查、mutation test、横切面清单 |
| `SKELETON.md` | 全书章节级骨架（已定稿），含每章交互实验的指定形式 |
| `reference/chapter-1-3-control-chart-sample.html` | 已人工审定的样章，全书格式基准（不发布） |

从 `CLAUDE.md` 的「构建顺序」开始工作。

## 常用命令

```bash
node tools/check.mjs      # 程序化门禁，提交前必跑（规则数以脚本输出为准）
node tools/mutate.mjs     # 对门禁本身的 mutation test，改动 check.mjs 后必跑
node tools/build.mjs      # 重新生成目录页、附录 A/B/C、章节导航链
node tools/publish.mjs    # 白名单式发布到 dist/（先跑门禁，reference/ 与 tools/ 不发布）
```

本地预览：`python3 -m http.server 8765`（或用 `.claude/launch.json` 里的 `handbook` 配置）。

## 内容规模

18 章 / 6 个 Part / 3 篇附录；每章一个原生 JS 交互实验。术语表 33 条、诊断卡 18 条、工具层 12 块，
全部由 `tools/build.mjs` 从章节标记聚合——**不要手改生成页**，改章节里的 `data-term` / `data-diag` / `.toolbox` 再重新生成。

## 靠判断而非模式的收录点（QUALITY.md 第 5 条清单）

下面这些不会被脚本自动完成，新增或改动章节后须人工过一遍：

1. **`data-diag` 标记该打在哪句话上**：附录 B 的每一行都来自某章正文里的一个 `data-diag`。
   脚本只负责聚合，不负责判断「这一章有没有值得进诊断卡的症状」，也不负责去重（症状描述相近时需要人工合并）。
2. **`data-def` 写在哪一次出现上**：术语表取首次出现的章节作锚点，门禁只校验「每个术语恰好一处定义且在首见章节」，
   但「这个词值不值得进术语表」是判断。
3. **工具层的边界**：哪些数值该从正文移进 `.toolbox`（判据：换一批器具或标准修订后还成立吗），脚本不判断。
4. **跨书交叉引用**：与概率手册的呼应写在正文里、不带链接（对方仓库的 URL 无法被死链门禁验证），需要人工确认表述仍然准确。
5. **案例的可溯源性**：门禁只校验「每个案例块有来源行」，不校验来源是否真实可达——这一条只能靠人工与审计轮。
