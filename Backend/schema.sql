-- URL Shortener database schema
-- Run this once against a fresh MySQL database to create the required tables.

CREATE DATABASE IF NOT EXISTS urlshortener;
USE urlshortener;

CREATE TABLE IF NOT EXISTS long_url (
  id INT AUTO_INCREMENT PRIMARY KEY,
  long_url VARCHAR(2048) NOT NULL
);

CREATE TABLE IF NOT EXISTS url (
  id INT AUTO_INCREMENT PRIMARY KEY,
  long_url_id INT NOT NULL,
  click_count INT NOT NULL DEFAULT 0,
  FOREIGN KEY (long_url_id) REFERENCES long_url(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS alias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  url_id INT NOT NULL,
  alias VARCHAR(16) NOT NULL UNIQUE,
  FOREIGN KEY (url_id) REFERENCES url(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS urlexpiry (
  id INT AUTO_INCREMENT PRIMARY KEY,
  url_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  FOREIGN KEY (url_id) REFERENCES url(id) ON DELETE CASCADE
);
