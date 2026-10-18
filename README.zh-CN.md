# PingXiang Charity

一个完整的动态网站，用于浏览、搜索并报名慈善筹款活动。项目由 MySQL 数据库、
Node.js + Express RESTful API，以及两个 AngularJS 前端（公共客户端与管理端）组成。

- **数据库：** MySQL（`charityevents_db`）
- **RESTful API：** Node.js + Express + `mysql2`
- **客户端：** HTML + AngularJS 1.8（`http`、控制器、服务、指令、过滤器）
- **管理端：** HTML + AngularJS（活动的完整增删改查）
- **鉴权：** 用户注册 / 登录（bcryptjs 密码哈希），以及管理员专属的活动管理区域

> English version: [README.md](README.md)

## 功能

- 公共客户端
  - 首页展示即将举办的活动（分类徽章、募款进度）
  - 活动总页浏览全部活动，支持按日期 / 地点 / 分类搜索筛选
  - 活动详情页，展示已报名参与者列表
  - 报名页预订活动票券（报名后活动 `raised_amount` 会按 `票单价 × 票数` 增加）
  - 用户注册与登录（弹窗式）
  - 用户个人中心：查看个人信息与已参加活动，修改除登录邮箱外的信息
  - 导航栏实时天气（Open-Meteo 免费接口，无需 API key），悬停可查看详情：
    当前温度、今日最高/最低温、天气类型和湿度（详情框由 JS 事件驱动，兼容所有浏览器）
- 管理端 / 管理页面
  - 仪表盘列出所有活动（即将举办、已结束、已暂停）
  - 创建、修改、删除活动
  - 为活动上传图片
  - 活动已有报名记录时禁止删除

## 项目结构

```
charity-events-project/
├── api/                         # Node.js + Express 后端
│   ├── event_db.js              # MySQL 连接池（mysql2/promise）
│   ├── server.js                # Express 入口
│   ├── middleware/
│   │   └── requireAdmin.js      # 管理员路由守卫
│   ├── routes/
│   │   ├── events.js            # /api/events（增删改查 + 详情）
│   │   ├── categories.js        # /api/categories
│   │   ├── organisations.js     # /api/organisations
│   │   ├── registrations.js     # /api/registrations（创建报名）
│   │   ├── users.js             # /api/users（注册 + 登录 + 个人中心）
│   │   └── upload.js            # /api/upload（活动图片上传）
│   ├── package.json
│   └── .env.example
├── clientside/                  # 公共站点
│   ├── index.html               # 首页
│   ├── events.html              # 活动总页（浏览全部 + 搜索 / 筛选）
│   ├── event.html               # 活动详情 + 报名列表
│   ├── register.html            # 活动报名
│   ├── login.html               # 登录（弹窗）
│   ├── signup.html              # 注册
│   ├── profile.html             # 用户个人中心
│   ├── admin.html               # 管理：活动列表
│   ├── event-form.html          # 管理：创建 / 编辑活动
│   ├── favicon.svg              # 网站图标（Angular 标志）
│   ├── css/style.css
│   ├── images/                  # 活动图片（浏览器可直接访问）
│   ├── videos/hero.mp4
│   └── js/
│       ├── angular.min.js       # AngularJS 1.8
│       ├── app.js               # 模块、API 服务、鉴权、指令
│       ├── controllers.js       # 页面控制器
│       └── nav.js               # 共享导航 / 图标
├── adminside/                   # 独立管理端
│   ├── index.html               # 仪表盘（列表 + 删除）
│   ├── create.html              # 新建活动
│   ├── edit.html                # 编辑活动
│   ├── login.html               # 管理员登录
│   ├── css/style.css
│   └── js/
│       ├── angular.min.js
│       ├── app.js
│       ├── controllers.js
│       └── icons.js
├── Images/                      # 原始活动图片
├── database/
│   ├── charityevents_db.sql           # 完整表结构 + 示例数据
│   ├── charityevents_db_import.sql    # cPanel 导入版（无 DROP/CREATE/USE）
│   └── add_registrations.sql          # 增量升级：users + registrations 表
├── start.bat                    # 一键启动脚本（Windows）
├── README.md
└── README.zh-CN.md
```

## 环境要求

- [Node.js](https://nodejs.org/)（v18 或更高）
- [MySQL](https://dev.mysql.com/downloads/) 服务（本地实例）

## 快速开始

### 方式一：一键启动（Windows）

双击 `start.bat`。它会启动：

- API：`http://localhost:3000`
- 客户端：`http://localhost:5500`
- 管理端：`http://localhost:5501`

请先确保你的 MySQL 服务（例如 `MySQL84`）已在运行。

### 方式二：手动启动

#### 1. 导入数据库

```bash
mysql -u root -p < database/charityevents_db.sql
```

#### 2. 配置并启动 API

```bash
cd api
copy .env.example .env   # 如需要，编辑数据库配置
npm install
npm start                # http://localhost:3000
```

#### 3. 启动客户端与管理端

```bash
cd clientside
npx serve .              # http://localhost:5500
```

```bash
cd adminside
npx serve .              # http://localhost:5501
```

> 开发环境下前端调用 `http://localhost:3000/api/...`。部署到 cPanel 时会自动
> 切换为相对路径 `/api`（见 `js/app.js`）。

## 默认管理员

| 邮箱                | 密码     |
|---------------------|----------|
| admin@pingxiang.org | admin123 |

## 用户
| 邮箱                |   密码    |
|---------------------|-----------|
|     10086@qq.com    | 1008610086|

## 演示账户

已预置 25 个演示账户。邮箱为 6-8 位数字加 `@qq.com`，密码和电话为相同的
数字（如 `58652055@qq.com` / `58652055`）。这些账户已随机报名所有活动
（每个活动约 12 人、最少 10 人），且捐款总额不超过各活动的预筹集金额。

## API 端点

| 方法   | 路径                            | 用途                                        |
|--------|---------------------------------|---------------------------------------------|
| GET    | `/api/events`                   | 即将举办且未暂停的活动                      |
| GET    | `/api/events?all=true`          | 所有活动（管理仪表盘）                      |
| GET    | `/api/events/search`            | 按 `date` / `location` / `category` 搜索    |
| GET    | `/api/events/:id`               | 活动详情 + 报名列表                         |
| POST   | `/api/events`                   | 创建活动（管理员）                          |
| PUT    | `/api/events/:id`               | 更新活动（管理员）                          |
| DELETE | `/api/events/:id`               | 删除活动（管理员，有报名时禁止）            |
| GET    | `/api/categories`               | 列出所有分类                                |
| GET    | `/api/organisations`            | 列出所有组织                                |
| POST   | `/api/registrations`            | 报名活动                                    |
| POST   | `/api/users/register`           | 创建用户账号                                |
| POST   | `/api/users/login`              | 登录并返回用户信息                          |
| GET    | `/api/users/:id`                | 用户资料 + 已参加活动                        |
| PUT    | `/api/users/:id`                | 更新用户资料（邮箱不可改）                  |
| POST   | `/api/upload`                   | 上传活动图片（管理员）                      |

管理员路由要求携带 `X-Admin-User` 请求头，值为已登录管理员的 `user_id`
（由 AngularJS 的 `ApiService` 自动设置）。

## 数据库配置

编辑 `api/.env` 以匹配你本地的 MySQL 配置：

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=你的密码
DB_NAME=charityevents_db
PORT=3000
```

将 `.env.example` 复制为 `.env` 并填入你自己的值。
