# 本地 SQLite 装备后端设计

**日期：** 2026-08-08  
**状态：** 已确认

## 目标

把“我的装备”从浏览器 IndexedDB 迁移到本机后端和 SQLite 数据库。前端只通过 HTTP API 查询和保存装备；关闭浏览器或重启项目后，数据继续保存在本机数据库文件中。

首期只服务当前电脑上的单个用户，不保留手机号或访客隔离。现有页面布局和交互保持不变。

## 范围

包含：

- 本地 Node 服务。
- SQLite 数据库文件和装备表。
- 查询、整表保存装备的 API。
- 前端存储层从 IndexedDB 切换到 API。
- 本次通过 API 写入 19 件已有装备和 25 件待购买装备。
- 自动化测试、浏览器验证和重启持久化验证。

不包含：

- 云端部署或跨设备同步。
- 多用户、登录鉴权或手机号隔离。
- 采购价格、数量、备注、图片或联网商品搜索。
- 自动读取或合并旧 IndexedDB 数据。

## 架构

使用单个 Node 进程同时承载 Vite 开发页面和装备 API，统一监听 `http://localhost:58514`。

- `server/dev.mjs`：启动 HTTP 服务、挂载 API 和 Vite middleware。
- `server/gearDatabase.mjs`：使用 Node v26 内置 `node:sqlite` 管理数据库。
- `.local-data/gear.sqlite`：本机数据库文件；`.local-data/` 整体加入 `.gitignore`。
- `src/lib/gearInventory.ts`：保留装备名称校验、分类和不可变数组操作等纯函数；浏览器 IndexedDB 读写替换为 HTTP 请求。
- `src/components/GearInventory.tsx`：继续通过 `getGearInventory()` 和 `saveGearInventory()` 使用存储服务，不直接接触 SQLite 或 API 细节。

不新增 npm 依赖。Node v26 已提供稳定可用的 `node:sqlite`，Vite 作为现有开发依赖以 middleware mode 运行。

## 数据模型

SQLite 表 `gear_items`：

| 字段 | 类型 | 约束 |
|---|---|---|
| `id` | TEXT | PRIMARY KEY |
| `name` | TEXT | NOT NULL |
| `normalized_name` | TEXT | NOT NULL, UNIQUE |
| `status` | TEXT | NOT NULL，限定 `owned` / `wanted` |
| `system_slug` | TEXT | 可为空，非空时限定六大系统 slug |
| `created_at` | TEXT | NOT NULL，ISO 时间字符串 |

`normalized_name` 使用修剪首尾空格并转英文小写后的名称，确保已有和待购买之间全局去重。

SQLite 表 `gear_metadata` 保存单行递增 `revision`，用于拒绝多标签页提交的旧清单快照。

## API

### `GET /api/gear`

返回全部装备：

```json
{
  "items": [],
  "revision": 0
}
```

装备按 `created_at` 倒序返回。

### `PUT /api/gear`

请求体：

```json
{
  "items": [],
  "revision": 0
}
```

服务端验证整个清单后，在一个 SQLite 事务内核对 `revision` 并替换 `gear_items` 全部内容。成功后版本递增并返回保存后的标准化清单；任何一项失败则整批回滚。

返回规则：

- `200`：保存成功。
- `400`：请求格式、字段、状态、系统、时间或名称重复错误。
- `409`：提交版本已过期，页面需要刷新后重试。
- `404`：未知 API 路径。
- `500`：数据库或服务内部错误。

错误响应统一为：

```json
{
  "error": "中文错误说明"
}
```

## 数据流

1. 页面加载时调用 `GET /api/gear`。
2. 后端从 SQLite 查询并返回完整清单与当前 `revision`。
3. 用户新增、编辑、分类、移动状态或删除时，前端继续使用现有纯函数计算下一份清单。
4. 前端携带读取时的 `revision` 调用 `PUT /api/gear` 保存下一份完整清单。
5. 保存成功后更新 React 状态；失败则保留当前已提交页面状态并显示错误。

单机单用户且当前清单规模很小，整表事务保存比新增多组 CRUD 接口更简单，也能直接复用现有 `commit(nextItems)` 数据流。

## 初始数据

数据库建表逻辑本身创建空表，不在源码中硬编码个人装备名称。本次实施启动服务后，通过 `PUT /api/gear` 一次性写入用户已提供的 19 件已有装备和 25 件待购买装备。

个人清单只存在于被 Git 忽略的 `.local-data/gear.sqlite`，不会进入源码、测试夹具或提交历史。删除该数据库文件会清空数据，不会自动重新植入。

## 错误处理

- API 只监听 `localhost`，不对局域网开放。
- 请求体设置合理体积上限，拒绝超大输入。
- SQLite 写入使用事务，避免部分覆盖。
- SQLite revision 检查拒绝多标签页的陈旧整表覆盖。
- 前端读取失败显示“无法连接本地装备数据库，请确认项目已启动”。
- 前端保存失败显示数据库返回的中文错误；未确认保存前不覆盖已提交状态。
- 服务启动失败时在终端输出明确原因并退出，不静默切换到 IndexedDB。

## 启动方式

`npm run dev` 改为运行统一的本地服务，固定监听：

```text
http://localhost:58514/
```

不再依赖 Vite 自动选择端口，避免 IndexedDB 时期出现的来源变化问题。

## 测试与验收

自动化测试覆盖：

- 首次启动建表和空库查询。
- 保存后重新打开数据库仍可读取。
- 两种状态和六大系统值校验。
- 空名称、忽略首尾空格和英文大小写的重复名称校验。
- 非法批次不会部分写入，原数据保持不变。
- `GET /api/gear`、`PUT /api/gear`、错误状态码和响应体。
- 前端存储服务正确调用 API，不再使用 IndexedDB。

浏览器验收覆盖：

- 页面显示“已有 19 · 待购买 25”。
- 新增、编辑、手动分类、已买到、移回待购买和删除正常。
- 刷新后数据保留。
- 完全关闭并重新启动项目后数据保留。
- SQLite 直接查询记录总数为 44，状态数量为 19 / 25。
- 1440×900 和 390×844 布局无回归。

## 约束与后续

- 当前方案是本机开发用途，不可直接部署到 Netlify 静态托管。
- 如果以后需要跨设备或正式部署，应把同一 API 契约迁移到正式后端数据库；前端组件不需要重写。
- 不保留 IndexedDB fallback，避免后端故障时读到另一份过期清单。
