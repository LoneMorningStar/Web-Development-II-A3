# PingXiang Charity

A complete dynamic website for discovering, searching, and registering for charity
fundraising events. It is built with a MySQL database, a Node.js + Express RESTful
API, and two AngularJS front-ends (a public client site and an admin site).

- **Database:** MySQL (`charityevents_db`)
- **RESTful API:** Node.js + Express + `mysql2`
- **Client:** HTML + AngularJS 1.8 (`$http`, controllers, services, directives, filters)
- **Admin:** HTML + AngularJS (full C.R.U.D. for events)
- **Auth:** user registration / login with password hashing (bcryptjs), plus an
  admin-only area for managing events

> 中文说明请见 [README.zh-CN.md](README.zh-CN.md)

## Features

- Public client site
  - Home page with upcoming events (category badges, funding progress)
  - Search / filter by date, location and category
  - Event detail page with the list of registered attendees
  - Registration page to reserve tickets for an event (raises the event's
    `raised_amount` by `ticket_price × tickets`)
  - User registration and login (modal)
- Admin site / admin pages
  - Dashboard listing every event (Upcoming, Past, Suspended)
  - Create, update, and delete events
  - Upload an image for an event
  - Deletion is blocked when an event already has registrations

## Project structure

```
charity-events-project/
├── api/                         # Node.js + Express backend
│   ├── event_db.js              # MySQL connection pool (mysql2/promise)
│   ├── server.js                # Express entry point
│   ├── middleware/
│   │   └── requireAdmin.js      # guards admin-only routes
│   ├── routes/
│   │   ├── events.js            # /api/events (CRUD + detail)
│   │   ├── categories.js        # /api/categories
│   │   ├── organisations.js     # /api/organisations
│   │   ├── registrations.js     # /api/registrations (create)
│   │   ├── users.js             # /api/users (register + login)
│   │   └── upload.js            # /api/upload (event images)
│   ├── package.json
│   └── .env.example
├── clientside/                  # public site
│   ├── index.html               # Home
│   ├── search.html              # Search / filter
│   ├── event.html               # Event detail + registrations
│   ├── register.html            # Event registration
│   ├── login.html               # Login (modal)
│   ├── signup.html              # Sign up
│   ├── admin.html               # Admin: manage events
│   ├── event-form.html          # Admin: create / edit event
│   ├── css/style.css
│   ├── images/                  # event images served to the browser
│   ├── videos/hero.mp4
│   └── js/
│       ├── angular.min.js       # AngularJS 1.8
│       ├── app.js               # module, API service, auth, directives
│       ├── controllers.js       # page controllers
│       └── nav.js               # shared navigation / icons
├── adminside/                   # standalone admin site
│   ├── index.html               # Dashboard (list + delete)
│   ├── create.html              # New event
│   ├── edit.html                # Edit event
│   ├── login.html               # Admin login
│   ├── css/style.css
│   └── js/
│       ├── angular.min.js
│       ├── app.js
│       ├── controllers.js
│       └── icons.js
├── Images/                      # original event images
├── database/
│   ├── charityevents_db.sql           # full schema + seed data
│   ├── charityevents_db_import.sql    # cPanel import (no DROP/CREATE/USE)
│   └── add_registrations.sql          # incremental users + registrations upgrade
├── start.bat                    # one-click launcher (Windows)
├── README.md
└── README.zh-CN.md
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

#### 2. Configure the API

```bash
cd api
copy .env.example .env   # then edit DB credentials if needed
npm install
npm start                # http://localhost:3000
```

#### 3. Start the client and admin

```bash
cd clientside
npx serve .              # http://localhost:5500
```

```bash
cd adminside
npx serve .              # http://localhost:5501
```

> In development the front-ends call `http://localhost:3000/api/...`. On cPanel
> they automatically switch to a relative `/api` path (see `js/app.js`).

## Default administrator

| Email               | Password  |
|---------------------|-----------|
| admin@pingxiang.org | admin123  |

## API endpoints

| Method | Path                            | Purpose                                      |
|--------|---------------------------------|----------------------------------------------|
| GET    | `/api/events`                   | Upcoming, non-suspended events               |
| GET    | `/api/events?all=true`          | All events (admin dashboard)                 |
| GET    | `/api/events/search`            | Search by `date` / `location` / `category`   |
| GET    | `/api/events/:id`               | Event details + registration list            |
| POST   | `/api/events`                   | Create an event (admin)                      |
| PUT    | `/api/events/:id`               | Update an event (admin)                      |
| DELETE | `/api/events/:id`               | Delete an event (admin, blocked if registered) |
| GET    | `/api/categories`               | List categories                              |
| GET    | `/api/organisations`            | List organisations                           |
| POST   | `/api/registrations`            | Register for an event                        |
| POST   | `/api/users/register`           | Create a user account                        |
| POST   | `/api/users/login`              | Log in and return the user                   |
| POST   | `/api/upload`                   | Upload an event image (admin)                |

Admin routes require an `X-Admin-User` header with the logged-in admin's
`user_id` (set automatically by the AngularJS `ApiService`).

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
