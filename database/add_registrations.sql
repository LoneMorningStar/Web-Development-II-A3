-- ============================================================
--  Incremental upgrade for an existing charityevents_db (A3):
--  add the users table and the registrations table that links
--  a user account to an event.
--
--  This script does NOT drop the database and does NOT insert
--  sample rows. It is safe for an existing A2 database that has
--  no registrations table yet.
--
--  NOTE: if an old-style `registrations` table already exists
--  (with attendee_name / attendee_email columns), drop it first:
--      DROP TABLE IF EXISTS registrations;
--
--  Run with:  mysql -u root -p charityevents_db < add_registrations.sql
-- ============================================================

USE charityevents_db;

CREATE TABLE IF NOT EXISTS users (
  user_id       INT AUTO_INCREMENT PRIMARY KEY,
  email         VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name     VARCHAR(150) NOT NULL,
  phone         VARCHAR(40),
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS registrations (
  registration_id   INT AUTO_INCREMENT PRIMARY KEY,
  user_id           INT NOT NULL,
  event_id          INT NOT NULL,
  tickets           INT NOT NULL DEFAULT 1,
  registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_registrations_user  FOREIGN KEY (user_id)  REFERENCES users(user_id),
  CONSTRAINT fk_registrations_event FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE RESTRICT,
  CONSTRAINT uq_registrations_user_event UNIQUE (user_id, event_id)
);
