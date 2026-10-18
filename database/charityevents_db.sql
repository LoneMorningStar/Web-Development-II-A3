-- charityevents_db — schema + seed data.
-- Works on both local MySQL and cPanel shared hosting: select the target
-- database first, then import this file. Shared hosts disable
-- DROP/CREATE DATABASE, so this file only recreates the TABLES.
-- Safe to run repeatedly (existing tables are dropped first).
-- Includes the 25 seeded demo accounts (@qq.com) and their registrations.

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS registrations;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS organisations;
SET FOREIGN_KEY_CHECKS = 1;


CREATE TABLE organisations (
  org_id        INT AUTO_INCREMENT PRIMARY KEY,
  org_name      VARCHAR(150) NOT NULL,
  mission       TEXT,
  contact_email VARCHAR(120),
  contact_phone VARCHAR(40),
  website       VARCHAR(200)
);


CREATE TABLE categories (
  category_id   INT AUTO_INCREMENT PRIMARY KEY,
  category_name VARCHAR(80) NOT NULL UNIQUE,
  description   VARCHAR(255)
);


CREATE TABLE events (
  event_id      INT AUTO_INCREMENT PRIMARY KEY,
  event_name    VARCHAR(180) NOT NULL,
  description   TEXT,
  event_date    DATETIME NOT NULL,
  location      VARCHAR(180) NOT NULL,
  ticket_price  DECIMAL(10,2) DEFAULT 0.00,
  goal_amount   DECIMAL(12,2) DEFAULT 0.00,
  raised_amount DECIMAL(12,2) DEFAULT 0.00,
  image_url     VARCHAR(255),
  is_suspended  TINYINT(1) DEFAULT 0,
  org_id        INT NOT NULL,
  category_id   INT NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_events_org      FOREIGN KEY (org_id)      REFERENCES organisations(org_id),
  CONSTRAINT fk_events_category FOREIGN KEY (category_id) REFERENCES categories(category_id)
);


CREATE TABLE users (
  user_id       INT AUTO_INCREMENT PRIMARY KEY,
  email         VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name     VARCHAR(150) NOT NULL,
  phone         VARCHAR(40),
  is_admin      TINYINT(1) NOT NULL DEFAULT 0,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE registrations (
  registration_id   INT AUTO_INCREMENT PRIMARY KEY,
  user_id           INT NOT NULL,
  event_id          INT NOT NULL,
  tickets           INT NOT NULL DEFAULT 1,
  registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_registrations_user  FOREIGN KEY (user_id)  REFERENCES users(user_id),
  CONSTRAINT fk_registrations_event FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE RESTRICT,
  CONSTRAINT uq_registrations_user_event UNIQUE (user_id, event_id)
);

INSERT INTO categories (category_id, category_name, description) VALUES
(1, 'Fun Run', 'Community running/walking fundraiser'),
(2, 'Gala Dinner', 'Formal dinner and auction evening'),
(3, 'Silent Auction', 'Bidding-based fundraising event'),
(4, 'Concert', 'Live music charity concert'),
(5, 'Bake Sale', 'Community baking fundraiser');

INSERT INTO organisations (org_id, org_name, mission, contact_email, contact_phone, website) VALUES
(1, 'Hope Foundation', 'Supporting children education', 'info@hope.org', '0400000001', 'https://hope.org'),
(2, 'Green Earth', 'Environmental protection', 'hello@green.org', '0400000002', 'https://green.org'),
(3, 'Care Australia', 'Community health support', 'care@care.org', '0400000003', 'https://care.org');

INSERT INTO events
(event_id, event_name, description, event_date, location, ticket_price, goal_amount, raised_amount, image_url, is_suspended, org_id, category_id, created_at) VALUES
(1, 'City Fun Run 2026', 'A 5km charity fun run through the city to raise funds for children''s education programs.', '2026-11-15 08:00:00', 'Anyuan District, Pingxiang City, Jiangxi Province', 25.00, 10000.00, 3675.00, 'images/city-fun-run-2026.png', 0, 1, 1, '2026-10-12 15:34:29'),
(2, 'Charity Gala Night', 'A formal gala dinner and live auction evening supporting Hope Foundation.', '2026-12-05 18:30:00', 'Anyuan District, Pingxiang City, Jiangxi Province', 120.00, 50000.00, 21860.00, 'images/charity-gala-night.png', 0, 1, 2, '2026-10-12 15:34:29'),
(3, 'Silent Auction for Kids', 'A silent auction of donated items, with all proceeds going to children in need.', '2026-10-20 10:00:00', 'Xiangdong District, Pingxiang City, Jiangxi Province', 0.00, 20000.00, 7600.00, 'images/silent-auction-for-kids.png', 0, 2, 3, '2026-10-12 15:34:29'),
(4, 'Green Earth Concert', 'A live charity concert featuring local artists to support environmental protection.', '2026-11-30 19:00:00', 'Luxi County, Pingxiang City, Jiangxi Province', 45.00, 30000.00, 13125.00, 'images/green-earth-concert.png', 0, 2, 4, '2026-10-12 15:34:29'),
(5, 'Community Bake Sale', 'A community bake sale raising funds for a local homeless shelter.', '2026-10-05 09:00:00', 'Shangli County, Pingxiang City, Jiangxi Province', 5.00, 2000.00, 1015.00, 'images/anyuan-childrens-charity-bazaar.png', 0, 3, 5, '2026-10-12 15:34:29'),
(6, 'Charity Walk for Health', 'A 10km awareness walk along the river to promote community health.', '2026-11-01 07:30:00', 'Anyuan District, Pingxiang City, Jiangxi Province', 15.00, 8000.00, 2950.00, 'images/charity-walk-for-health.png', 0, 3, 1, '2026-10-12 15:34:29'),
(8, 'Suspended Event X', 'An event that was suspended due to a policy review and is hidden from the public.', '2026-12-01 10:00:00', 'Lianhua County, Pingxiang City, Jiangxi Province', 10.00, 5000.00, 360.00, 'images/anyuan-childrens-charity-bazaar.png', 1, 1, 2, '2026-10-12 15:34:29'),
(9, 'Pingxiang Charity Concert', 'An evening of live music in Anyuan to raise funds for local children''s education.', '2026-12-12 19:00:00', 'Anyuan District, Pingxiang City, Jiangxi Province', 60.00, 40000.00, 16980.00, 'images/pingxiang-charity-concert.png', 0, 2, 4, '2026-10-12 15:34:29'),
(10, 'Anyuan Children''s Charity Bazaar', 'A family-friendly bazaar with home-made food and crafts supporting children in need.', '2026-10-25 09:00:00', 'Shangli County, Pingxiang City, Jiangxi Province', 0.00, 5000.00, 1200.00, 'images/anyuan-childrens-charity-bazaar.png', 0, 1, 5, '2026-10-12 15:34:29'),
(11, 'Lianhua County Charity Gala', 'A formal dinner and auction evening supporting community health programs in Lianhua.', '2026-12-18 18:00:00', 'Lianhua County, Pingxiang City, Jiangxi Province', 150.00, 60000.00, 26500.00, 'images/lianhua-county-charity-gala.png', 0, 3, 2, '2026-10-12 15:34:29'),
(12, 'Xiangdong Eco Fun Run', 'A 6km eco fun run through Xiangdong to promote environmental awareness.', '2026-11-08 08:00:00', 'Xiangdong District, Pingxiang City, Jiangxi Province', 30.00, 12000.00, 4750.00, 'images/xiangdong-eco-fun-run.png', 0, 2, 1, '2026-10-12 15:34:29'),
(13, 'Luxi Silent Auction for Education', 'A silent auction of artwork and crafts to fund scholarships for rural students.', '2026-11-20 10:00:00', 'Luxi County, Pingxiang City, Jiangxi Province', 0.00, 25000.00, 8100.00, 'images/luxi-silent-auction-for-education.png', 0, 1, 3, '2026-10-12 15:34:29'),
(20, 'Dream charity party', NULL, '2026-10-19 20:05:00', 'shangli county', 150.00, 1500000.00, 18600.00, 'images/charity-gala-night.png', 0, 1, 2, '2026-10-18 16:42:48');

INSERT INTO users (user_id, email, password_hash, full_name, phone, is_admin, created_at) VALUES
(3, '111111@qq.com', '$2b$10$88jfpgE9OqupbfkD0YWuSu0/mXl/G7JEKjmYqmLMfAC1GunP0Neny', '111', '111111', 0, '2026-10-12 15:41:47'),
(4, 'admin@pingxiang.org', '$2b$10$R9p3YGtfja9IfefgdOUikeojI3Na3XVyoIhYf9PczM1MvAIzxoHC.', 'Administrator', NULL, 1, '2026-10-12 20:46:31'),
(5, '10086@qq.com', '$2b$10$CjaZXT4TL80E0WMwuekNEOOjcT5rEoENLALNnxQlKEi5a7b1pZDBG', '10086', '10086', 0, '2026-10-17 19:08:33'),
(6, '58652055@qq.com', '$2b$10$0SOXdxE0Cl4e/WWxg/STueuNLIvkUa9wNecohCW9S6LKi8g1DckoW', 'Finn Guo', '58652055', 0, '2026-10-18 20:44:25'),
(7, '759720@qq.com', '$2b$10$hgcGgDCUwYey2zRUG3L1AeIY7TBH5.3gc0Np5Y9K4DGtnIcrJphgm', 'Hannah Cao', '759720', 0, '2026-10-18 20:44:25'),
(8, '106600@qq.com', '$2b$10$/mL.dpNJLqIjN9cgSpYn3uJsF/5BNS2qC2Okx99glzhrswhX.Belm', 'James Zheng', '106600', 0, '2026-10-18 20:44:25'),
(9, '70956197@qq.com', '$2b$10$H0SCjC9Fz3z.duGOQGpCzOIlHLdCGWc7M8r5Ib0IqLON6LEqtaM9q', 'Hannah Cao', '70956197', 0, '2026-10-18 20:44:25'),
(10, '21003492@qq.com', '$2b$10$t7jzyAOwPVJdRPNxao2t8O888ttzlM7tq7I3sQByP83PRNnjrL9IS', 'Nora Xu', '21003492', 0, '2026-10-18 20:44:25'),
(11, '470820@qq.com', '$2b$10$zrnP58F.EvRVZdM6sRgRa.i/7Bewb46N1l9/XwyiEkohmzJILJcf.', 'Felix Zhou', '470820', 0, '2026-10-18 20:44:25'),
(12, '6717522@qq.com', '$2b$10$3Cgmm00qsAiArjxafqdoKObyl3Qzj6eJl35BP6bi9aOO1lSkYTfna', 'Henry Yang', '6717522', 0, '2026-10-18 20:44:25'),
(13, '758979@qq.com', '$2b$10$tFzaJKBf6aF0v7nKkuLldegIH6SA/fS098FSoJeNsbqSjM22.ld3.', 'James Wang', '758979', 0, '2026-10-18 20:44:25'),
(14, '682652@qq.com', '$2b$10$IRot/2hy08Ic8U39j7JeCeujIh/svz21h30dsOI21cS9X/IoBk0B.', 'Amelia Zhu', '682652', 0, '2026-10-18 20:44:25'),
(15, '614689@qq.com', '$2b$10$Ory/BjEmMFphkTCnxFXZSuj1dg2FgZuyye7pPnT2IRTIYwYeuBDri', 'Jack Hu', '614689', 0, '2026-10-18 20:44:25'),
(16, '1342081@qq.com', '$2b$10$2I7FeTfcZej3OR5DEuOfhur4XL.N0kvRIv5kawNA4gM37eqJAsbf.', 'Isla Feng', '1342081', 0, '2026-10-18 20:44:25'),
(17, '816902@qq.com', '$2b$10$r42lgq3NFyRt5luk3psJTOws9JAkWFshGKPxkNELvGkzYHLn7wpQO', 'James Yang', '816902', 0, '2026-10-18 20:44:25'),
(18, '46222053@qq.com', '$2b$10$pStDjhKX27mfheG7EiQOluEnpCKPboI3/36qdPUNk5NZZunh1q6oG', 'Sophia Guo', '46222053', 0, '2026-10-18 20:44:25'),
(19, '2882696@qq.com', '$2b$10$AjLjxJR5qZpMySz2YoFBFu/ZDKwHrxqn3/nIPz6LTU7na9NnmzCnW', 'Logan Feng', '2882696', 0, '2026-10-18 20:44:25'),
(20, '6691963@qq.com', '$2b$10$Aw1xDBUaI7HF59DdLIZONee/m7TKajMlIpAVRqMeGAeHnthNTxgzC', 'Ivy Yang', '6691963', 0, '2026-10-18 20:44:25'),
(21, '82938013@qq.com', '$2b$10$/G8IejvnyTEqj0sZTH4.TuOtIkdOiUBbc3ibXeUMBDv3T3rJ/EBYm', 'Olivia Hu', '82938013', 0, '2026-10-18 20:44:25'),
(22, '168573@qq.com', '$2b$10$0nlnjiuBQToMbLw956wmPuVuVvMI7HjH3z21R8eiN60PXXaIe3UWi', 'Sophia Guo', '168573', 0, '2026-10-18 20:44:25'),
(23, '3115254@qq.com', '$2b$10$GJu5kf5qNCQQcCIM4.HhiuP5ZysoEHDo5Bc4VBeIguDZ/xmbX..BC', 'Mia Xie', '3115254', 0, '2026-10-18 20:44:25'),
(24, '3874848@qq.com', '$2b$10$yl4n2JY/Mct0qwm1r.RlHeoxo31s7F98QLBibG2uK9obJNVFM2XDq', 'Olivia Luo', '3874848', 0, '2026-10-18 20:44:25'),
(25, '248362@qq.com', '$2b$10$6EOSRXb8DFe4moJEauUrD.4GOJ42Z8L70LcMV7tor6JXg7di3pTJq', 'Jack Xiao', '248362', 0, '2026-10-18 20:44:25'),
(26, '32469985@qq.com', '$2b$10$m1CGGc1yKc.g4tFAEF2uVOpRpgYDCaIm/sckdznPZtx4tOntRVjOG', 'Amelia Ma', '32469985', 0, '2026-10-18 20:44:25'),
(27, '555837@qq.com', '$2b$10$z9mptG42tCGFzwAaL6LHzeytoTKpZ3mJmfjaG809uOYOd87tEfJH.', 'Nora Zhou', '555837', 0, '2026-10-18 20:44:25'),
(28, '32796228@qq.com', '$2b$10$WKFuDYNLZrQG3pSDPoWB/.19W0ZWmwhENfhibpj7GkdHmkVsXaDz6', 'Lucas Lin', '32796228', 0, '2026-10-18 20:44:25'),
(29, '2301944@qq.com', '$2b$10$v1YFoEjTOqrUJFkDrwgVreXIQoq.BWvegwFUUiw6FafVSXVhbel1G', 'Owen Zhao', '2301944', 0, '2026-10-18 20:44:25'),
(30, '379436@qq.com', '$2b$10$ZChMqWUpv2y40qSF4ZltB.Bn.Xbk5f2aZ0JTKq4myyMV6HskczYGG', 'Ruby Wang', '379436', 0, '2026-10-18 20:44:25');

INSERT INTO registrations (registration_id, user_id, event_id, tickets, registration_date) VALUES
(4, 3, 1, 1, '2026-10-12 16:20:32'),
(7, 3, 13, 2, '2026-10-12 16:23:32'),
(8, 3, 12, 4, '2026-10-12 16:25:54'),
(9, 3, 2, 7, '2026-10-12 16:28:15'),
(10, 3, 3, 1, '2026-10-12 21:07:27'),
(13, 4, 4, 10, '2026-10-17 19:19:17'),
(14, 3, 9, 5, '2026-10-17 21:14:24'),
(15, 8, 1, 2, '2026-10-13 22:17:25'),
(16, 16, 1, 1, '2026-09-30 17:33:25'),
(17, 29, 1, 1, '2026-10-08 11:32:25'),
(18, 10, 1, 1, '2026-10-16 09:49:25'),
(19, 19, 1, 2, '2026-09-22 08:06:25'),
(20, 7, 1, 1, '2026-10-02 08:46:25'),
(21, 14, 1, 1, '2026-10-05 01:59:25'),
(22, 17, 1, 1, '2026-10-01 11:26:25'),
(23, 15, 1, 3, '2026-09-19 10:20:25'),
(24, 23, 1, 1, '2026-09-25 21:08:25'),
(25, 26, 1, 3, '2026-09-24 22:47:25'),
(26, 18, 1, 2, '2026-09-26 20:24:25'),
(27, 30, 2, 2, '2026-09-30 11:02:25'),
(28, 7, 2, 3, '2026-10-08 00:08:25'),
(29, 19, 2, 3, '2026-10-10 06:38:25'),
(30, 9, 2, 3, '2026-09-21 18:32:25'),
(31, 17, 2, 2, '2026-09-21 08:33:25'),
(32, 15, 2, 1, '2026-10-12 14:14:25'),
(33, 6, 2, 2, '2026-10-02 09:48:25'),
(34, 23, 2, 2, '2026-10-12 06:52:25'),
(35, 20, 2, 2, '2026-10-06 06:22:25'),
(36, 24, 2, 2, '2026-10-17 12:34:25'),
(37, 14, 2, 1, '2026-10-04 22:30:25'),
(38, 8, 2, 2, '2026-09-29 10:45:25'),
(39, 12, 2, 3, '2026-10-12 14:54:25'),
(40, 15, 4, 2, '2026-09-25 01:33:25'),
(41, 9, 4, 3, '2026-09-19 06:14:25'),
(42, 24, 4, 3, '2026-09-23 22:03:25'),
(43, 12, 4, 3, '2026-10-06 05:55:25'),
(44, 21, 4, 2, '2026-10-02 22:53:25'),
(45, 17, 4, 2, '2026-09-27 14:12:25'),
(46, 26, 4, 3, '2026-09-23 08:20:25'),
(47, 20, 4, 2, '2026-09-27 05:18:25'),
(48, 22, 4, 2, '2026-10-17 23:54:25'),
(49, 19, 4, 3, '2026-09-28 15:16:25'),
(50, 9, 5, 2, '2026-10-15 16:01:25'),
(51, 13, 5, 3, '2026-09-24 19:42:25'),
(52, 16, 5, 3, '2026-10-05 04:12:25'),
(53, 24, 5, 2, '2026-10-05 14:54:25'),
(54, 7, 5, 1, '2026-10-18 11:22:25'),
(55, 14, 5, 1, '2026-10-10 15:09:25'),
(56, 20, 5, 2, '2026-10-08 23:10:25'),
(57, 21, 5, 1, '2026-10-04 20:20:25');

INSERT INTO registrations (registration_id, user_id, event_id, tickets, registration_date) VALUES
(58, 26, 5, 1, '2026-09-25 02:23:25'),
(59, 27, 5, 1, '2026-10-12 03:56:25'),
(60, 29, 5, 1, '2026-10-04 23:09:25'),
(61, 12, 5, 3, '2026-10-17 23:05:25'),
(62, 30, 5, 2, '2026-10-12 05:07:25'),
(63, 30, 6, 3, '2026-09-22 04:35:25'),
(64, 19, 6, 2, '2026-10-16 07:51:25'),
(65, 29, 6, 3, '2026-09-27 18:57:25'),
(66, 26, 6, 3, '2026-10-07 01:01:25'),
(67, 17, 6, 2, '2026-09-22 14:24:25'),
(68, 12, 6, 2, '2026-09-20 01:48:25'),
(69, 18, 6, 2, '2026-10-17 10:16:25'),
(70, 8, 6, 2, '2026-10-12 23:00:25'),
(71, 16, 6, 3, '2026-10-02 15:19:25'),
(72, 15, 6, 1, '2026-10-06 14:59:25'),
(73, 10, 6, 2, '2026-09-22 01:17:26'),
(74, 22, 6, 2, '2026-09-25 04:28:26'),
(75, 9, 6, 3, '2026-10-15 19:04:26'),
(76, 21, 8, 2, '2026-10-09 19:33:26'),
(77, 26, 8, 3, '2026-09-28 23:48:26'),
(78, 20, 8, 3, '2026-09-25 18:20:26'),
(79, 9, 8, 3, '2026-10-15 08:02:26'),
(80, 14, 8, 3, '2026-09-21 10:03:26'),
(81, 18, 8, 3, '2026-10-17 15:23:26'),
(82, 29, 8, 2, '2026-10-14 03:50:26'),
(83, 6, 8, 2, '2026-09-26 00:51:26'),
(84, 22, 8, 2, '2026-10-01 10:43:26'),
(85, 15, 8, 3, '2026-10-16 06:22:26'),
(86, 19, 9, 2, '2026-09-21 03:59:26'),
(87, 30, 9, 1, '2026-10-03 17:14:26'),
(88, 20, 9, 1, '2026-09-24 07:57:26'),
(89, 18, 9, 2, '2026-09-29 09:23:26'),
(90, 11, 9, 1, '2026-10-07 20:16:26'),
(91, 6, 9, 3, '2026-10-12 11:21:26'),
(92, 14, 9, 3, '2026-09-29 20:56:26'),
(93, 15, 9, 3, '2026-09-25 18:44:26'),
(94, 16, 9, 3, '2026-10-01 19:44:26'),
(95, 22, 9, 3, '2026-10-12 01:14:26'),
(96, 29, 9, 2, '2026-09-27 12:59:26'),
(97, 7, 9, 1, '2026-10-06 11:24:26'),
(98, 26, 9, 3, '2026-09-19 19:50:26'),
(99, 20, 11, 1, '2026-10-16 01:12:26'),
(100, 16, 11, 3, '2026-10-08 01:06:26'),
(101, 11, 11, 3, '2026-10-08 02:15:26'),
(102, 6, 11, 2, '2026-10-11 17:46:26'),
(103, 23, 11, 1, '2026-10-08 14:22:26'),
(104, 17, 11, 2, '2026-10-05 22:24:26'),
(105, 29, 11, 1, '2026-10-01 01:50:26'),
(106, 25, 11, 2, '2026-09-24 17:01:26'),
(107, 21, 11, 3, '2026-10-17 02:38:26');

INSERT INTO registrations (registration_id, user_id, event_id, tickets, registration_date) VALUES
(108, 28, 11, 3, '2026-10-16 15:37:26'),
(109, 7, 11, 3, '2026-09-19 02:18:26'),
(110, 8, 11, 3, '2026-09-25 08:56:26'),
(111, 14, 11, 3, '2026-10-13 23:04:26'),
(112, 25, 12, 1, '2026-09-30 06:13:26'),
(113, 27, 12, 1, '2026-09-20 07:23:26'),
(114, 17, 12, 1, '2026-09-19 06:05:26'),
(115, 15, 12, 1, '2026-10-14 00:20:26'),
(116, 20, 12, 3, '2026-09-24 22:21:26'),
(117, 19, 12, 1, '2026-09-30 14:39:26'),
(118, 29, 12, 2, '2026-10-03 02:40:26'),
(119, 13, 12, 3, '2026-10-03 06:56:26'),
(120, 16, 12, 1, '2026-09-20 10:27:26'),
(121, 30, 12, 1, '2026-09-24 10:25:26'),
(122, 14, 20, 1, '2026-09-19 06:41:26'),
(123, 21, 20, 3, '2026-09-19 17:23:26'),
(124, 6, 20, 2, '2026-10-10 22:05:26'),
(125, 24, 20, 3, '2026-09-27 22:02:26'),
(126, 26, 20, 3, '2026-10-11 07:43:26'),
(127, 18, 20, 2, '2026-10-13 03:40:26'),
(128, 10, 20, 3, '2026-10-09 11:19:26'),
(129, 29, 20, 3, '2026-10-17 12:31:26'),
(130, 9, 20, 1, '2026-10-12 21:32:26'),
(131, 8, 20, 2, '2026-10-11 11:28:26'),
(132, 16, 20, 1, '2026-10-10 04:20:26'),
(133, 19, 3, 3, '2026-10-02 00:23:06'),
(134, 8, 3, 3, '2026-10-05 12:58:06'),
(135, 21, 3, 3, '2026-09-29 12:07:06'),
(136, 28, 3, 1, '2026-10-05 02:44:06'),
(137, 7, 3, 2, '2026-09-18 23:54:06'),
(138, 9, 3, 1, '2026-09-21 18:33:06'),
(139, 16, 3, 3, '2026-10-02 09:59:06'),
(140, 18, 3, 2, '2026-09-26 11:00:06'),
(141, 17, 3, 3, '2026-09-24 12:31:06'),
(142, 22, 3, 3, '2026-09-25 06:29:06'),
(143, 30, 3, 3, '2026-09-29 12:38:06'),
(144, 23, 3, 3, '2026-09-22 11:20:06'),
(145, 20, 3, 1, '2026-10-04 02:55:06'),
(146, 18, 10, 1, '2026-09-21 14:51:06'),
(147, 24, 10, 3, '2026-09-20 13:48:06'),
(148, 10, 10, 2, '2026-10-13 16:21:06'),
(149, 8, 10, 3, '2026-10-03 04:29:06'),
(150, 13, 10, 1, '2026-10-09 17:32:06'),
(151, 7, 10, 3, '2026-09-18 23:46:06'),
(152, 30, 10, 1, '2026-10-07 06:18:06'),
(153, 11, 10, 3, '2026-10-09 19:35:06'),
(154, 15, 10, 3, '2026-09-23 23:57:06'),
(155, 26, 10, 1, '2026-10-17 02:27:06'),
(156, 27, 10, 1, '2026-10-02 22:07:06'),
(157, 28, 10, 2, '2026-10-08 19:41:06');

INSERT INTO registrations (registration_id, user_id, event_id, tickets, registration_date) VALUES
(158, 14, 10, 1, '2026-09-20 12:17:07'),
(159, 12, 13, 3, '2026-10-18 16:29:07'),
(160, 9, 13, 1, '2026-09-19 03:40:07'),
(161, 11, 13, 2, '2026-10-10 13:34:07'),
(162, 27, 13, 1, '2026-10-03 00:41:07'),
(163, 17, 13, 3, '2026-10-07 03:00:07'),
(164, 28, 13, 2, '2026-10-02 02:34:07'),
(165, 15, 13, 2, '2026-09-20 06:27:07'),
(166, 25, 13, 3, '2026-09-25 15:44:07'),
(167, 16, 13, 3, '2026-10-07 22:42:07'),
(168, 13, 13, 3, '2026-09-25 01:22:07'),
(169, 29, 13, 2, '2026-10-01 05:17:07');
