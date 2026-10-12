# PingXiang Charity

A complete dynamic website for discovering, searching, and registering for charity
fundraising events. It is built with a MySQL database, a Node.js + Express RESTful
API, and two AngularJS front-ends (a public client site and an admin site).

- **Database:** MySQL (`charityevents_db`)
- **RESTful API:** Node.js + Express + `mysql2`
- **Client:** HTML + AngularJS (`$http`, controllers, directives, filters)
- **Admin:** HTML + AngularJS (full C.R.U.D. for events)

> 中文说明请见 [README.zh-CN.md](README.zh-CN.md)

## Features

- Public client site
  - Home page with upcoming events (category badges, funding progress)
  - Search / filter by date, location and category
  - Event detail page with the list of registered attendees
  - Registration page to reserve tickets for an event
- Admin site
  - Dashboard listing every event (Active, Past, Suspended)
  - Create, update, and delete events
  - Registration data shown when editing an event
  - Deletion is blocked when an event has registrations

## Project structure

```
charity-events-project/
├── api/                      # backend (usernameA3-api.zip)
│   ├── event_db.js           # MySQL connection pool
│   ├── server.js             # Express entry point
│   ├── routes/
│   │   ├── events.js         # /api/events (CRUD + registrations)
│   │   ├── categories.js     # /api/categories
│   │   ├── organisations.js  # /api/organisations
│   │   └── registrations.js  # /api/registrations (create)
│   ├── package.json
│   └── .env.example
├── clientside/               # public site (usernameA3-clientside.zip)
│   ├── index.html            # Home
│   ├── search.html           # Search / filter
│   ├── event.html            # Event detail + registrations
│   ├── register.html         # Event registration
│   ├── css/style.css
│   └── js/
│       ├── app.js            # AngularJS module, API service, directives
│       ├── controllers.js    # page controllers
│       └── nav.js            # shared navigation / icons
├── adminside/                # admin site (usernameA3-adminside.zip)
│   ├── index.html            # Dashboard (list + delete)
│   ├── create.html           # New event
│   ├── edit.html             # Edit event + registrations
│   ├── css/style.css
│   └── js/
│       ├── app.js
│       ├── controllers.js
│       └── icons.js
├── database/
│   └── charityevents_db.sql  # schema + data (events, categories,
│                             #   organisations, registrations)
├── start.bat                 # one-click launcher (Windows)
└── README.md
```

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [MySQL](https://dev.mysql.com/downloads/) server (local instance)

## Quick start

### Option A — one-click (Windows)

Double-click `start.bat`. It starts:

- API on `http://localhost:3000`
- Client on `http://localhost:5500`
- Admin on `http://localhost:5501`

Make sure your MySQL service (e.g. `MySQL84`) is running first.

### Option B — manual

#### 1. Import the database

```bash
mysql -u root -p < database/charityevents_db.sql
```

#### 2. Start the API

```bash
cd api
npm install
npm start          # http://localhost:3000
```

#### 3. Start the client and admin

```bash
cd clientside
npx serve .        # http://localhost:5500
```

```bash
cd adminside
npx serve .        # http://localhost:5501
```

> In development the front-ends call `http://localhost:3000/api/...`. On cPanel
> they automatically switch to a relative `/api` path (see `js/app.js`).

## API endpoints

| Method | Path                   | Purpose                                   |
|--------|------------------------|-------------------------------------------|
| GET    | `/api/events`          | Upcoming, non-suspended events            |
| GET    | `/api/events?all=true` | All events (admin dashboard)              |
| GET    | `/api/events/search`   | Search by date / location / category      |
| GET    | `/api/events/:id`      | Event details + registration list         |
| POST   | `/api/events`          | Create an event                           |
| PUT    | `/api/events/:id`      | Update an event                           |
| DELETE | `/api/events/:id`      | Delete an event (blocked if registered)   |
| GET    | `/api/categories`      | List categories                           |
| GET    | `/api/organisations`   | List organisations                        |
| POST   | `/api/registrations`   | Create a registration                     |

## Database credentials

Edit `api/.env` to match your local MySQL setup:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your-password
DB_NAME=charityevents_db
PORT=3000
```

Copy `.env.example` to `.env` and fill in your own values.
