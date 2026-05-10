# LibroSchool 文档目录

本文档目录包含 LibroSchool 项目的完整技术文档和规划。

---

## 📚 文档导航

### 产品文档

| 文档 | 描述 |
|------|------|
| [PRD.md](./PRD.md) | 产品需求文档 - 产品定位、功能需求、用户流程 |
| [MASTER_PLAN.md](./MASTER_PLAN.md) | 总体规划 - 技术栈、MVP 范围、开发原则 |
| [ROADMAP.md](./ROADMAP.md) | 路线图 - 开发阶段和时间规划 |

### 技术架构

| 文档 | 描述 |
|------|------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | 系统架构 - 整体技术架构、组件关系、部署架构 |
| [API.md](./API.md) | API 规范 - RESTful API 端点、请求/响应格式 |
| [DATABASE.md](./DATABASE.md) | 数据库设计 - 表结构、字段说明、索引设计 |
| [SECURITY.md](./SECURITY.md) | 安全规则 - 认证授权、权限控制、数据保护 |

### 开发计划

| 文档 | 描述 |
|------|------|
| [BACKEND_PLAN.md](./BACKEND_PLAN.md) | 后端开发计划 - Laravel API 开发阶段 |
| [FRONTEND_PLAN.md](./FRONTEND_PLAN.md) | 前端开发计划 - Next.js 页面和组件规划 |
| [DATABASE_PLAN.md](./DATABASE_PLAN.md) | 数据库计划 - 迁移和模型开发计划 |
| [ADMIN_PLAN.md](./ADMIN_PLAN.md) | 管理后台计划 - 后台功能规划 |
| [UI.md](./UI.md) | UI 设计系统 - 视觉规范、组件设计 |

### 部署和运维

| 文档 | 描述 |
|------|------|
| [DEPLOYMENT.md](./DEPLOYMENT.md) | 部署文档 - 完整部署流程、配置、检查清单 |

### 项目管理

| 文档 | 描述 |
|------|------|
| [EXECUTION_PLAN.md](./EXECUTION_PLAN.md) | 执行计划 - 任务分解和执行顺序 |
| [AGENT_TASKS.md](./AGENT_TASKS.md) | Agent 任务 - AI Agent 任务分配 |
| [TASK_STATUS.md](./TASK_STATUS.md) | 任务状态 - 当前任务进度跟踪 |

---

## 🚀 快速开始

### 本地开发

1. 阅读 [MASTER_PLAN.md](./MASTER_PLAN.md) 了解项目概况
2. 按照 [README.md](../README.md) 配置本地环境
3. 参考 [BACKEND_PLAN.md](./BACKEND_PLAN.md) 和 [FRONTEND_PLAN.md](./FRONTEND_PLAN.md) 开始开发

### 部署上线

参考 [DEPLOYMENT.md](./DEPLOYMENT.md) 完成：
- 服务器环境准备
- 后端部署 (VPS)
- 前端部署 (Vercel)
- Cloudflare R2 配置
- 监控和日志设置

---

## 📖 阅读建议

### 新团队成员

1. **第一步**: PRD.md → MASTER_PLAN.md → ARCHITECTURE.md
2. **第二步**: API.md → DATABASE.md → SECURITY.md
3. **第三步**: BACKEND_PLAN.md / FRONTEND_PLAN.md (根据角色)

### 部署运维

重点阅读 [DEPLOYMENT.md](./DEPLOYMENT.md)，包含：
- 完整的部署步骤
- 环境配置
- 检查清单
- 故障排查
- 监控设置

### 开发参考

- **API 开发**: API.md + BACKEND_PLAN.md
- **前端开发**: FRONTEND_PLAN.md + UI.md
- **数据库**: DATABASE.md + DATABASE_PLAN.md

---

## 📝 文档维护

- 文档应与代码同步更新
- API 变更时更新 API.md
- 数据库变更时更新 DATABASE.md
- 部署流程变更时更新 DEPLOYMENT.md

---

*LibroSchool 开发团队*  
*文档最后更新: 2025年*
