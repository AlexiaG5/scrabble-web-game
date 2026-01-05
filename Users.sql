DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `email` TEXT PRIMARY KEY,
  `username` TEXT,
  `password_hash` TEXT
);