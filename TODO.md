# TODO.md — 待办任务

## 近期

- [ ] **路线数据补全**：在 `src/data/routeData.ts` 中扩展更多路线数据（雨崩、虎跳峡、贡嘎等）
- [ ] **装备产品资料完善**：扩充 `src/data/gearCatalog.ts` 中的品牌型号与参数
- [ ] **知识点页面扩容**：`src/data/gearKnowledge.ts` 丰富装备知识内容

## 中期

- [x] **国内路线首页**：MapLibre Outdoor 全国地图展示已收录路线地点
- [ ] **路线对比功能**：支持选择 2–3 条路线并列对比关键参数
- [ ] **3D 装备查看器**：完善 GearAnatomyViewer 交互（Three.js）
- [ ] **响应式打磨**：确保手机端浏览体验完整

## 长期

- [x] **个人装备清单**：已有 / 待购买双清单通过本地 Node API 保存到 SQLite
- [ ] **装备打包清单导出**：支持导出为 PDF / 文本格式
- [ ] **社区路线分享**：用户贡献路线信息的基础框架

## 基础设施

- [ ] **Netlify 部署流程**：配置自动部署
- [x] **Tailwind CSS 配置**：自定义颜色调色板（forest / sand 色系）
- [x] **GSAP skill 集成**：动画基础能力就绪
- [ ] **CI 自动化**：Node 内置测试已就绪，仍需接入 GitHub Actions

---

Last updated: 2026-08-10
