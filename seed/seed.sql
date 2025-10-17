-- -----------------------------------------------------
-- DATABASE: book_management
-- -----------------------------------------------------
DROP DATABASE IF EXISTS book_management;
CREATE DATABASE book_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE book_management;

-- -----------------------------------------------------
-- TABLE: users
-- -----------------------------------------------------
CREATE TABLE users (
  user_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),
  role ENUM('USER', 'ADMIN') DEFAULT 'USER',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO users (email, password_hash, display_name, role)
VALUES
('abc@mail.com', 'hashedpass1', 'Khanh', 'ADMIN'),
('xyz@mail.com', 'hashedpass2', 'Pham', 'USER');

-- -----------------------------------------------------
-- TABLE: books
-- -----------------------------------------------------
CREATE TABLE books (
  book_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  isbn VARCHAR(50) UNIQUE,
  title TEXT NOT NULL,
  publication_year INT,
  cover_url TEXT,
  genres TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

INSERT INTO books (user_id, isbn, title, publication_year, genres, description)
VALUES
(1, '9780747532743', 'Harry Potter', 1997, 'Fantasy', 'Wizard boy adventure'),
(1, '9780679734529', 'The Godfather', 1969, 'Crime', 'Mafia family story'),
(2, '9781400032716', 'Batman', 2008, 'Action', 'Dark Knight in Gotham');

-- -----------------------------------------------------
-- TABLE: collections
-- -----------------------------------------------------
CREATE TABLE collections (
  collection_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_collection_user_name (user_id, name(100)),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

INSERT INTO collections (user_id, name)
VALUES
(1, 'Favorites'),
(2, 'Drama'),
(2, 'Action');

-- -----------------------------------------------------
-- TABLE: collection_items
-- -----------------------------------------------------
CREATE TABLE collection_items (
  collection_item_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  collection_id BIGINT NOT NULL,
  book_id BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_collection_book (collection_id, book_id),
  FOREIGN KEY (collection_id) REFERENCES collections(collection_id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE
);

INSERT INTO collection_items (collection_id, book_id)
VALUES
(1, 1),
(2, 2),
(3, 3);

-- -----------------------------------------------------
-- TABLE: user_book_states
-- -----------------------------------------------------
CREATE TABLE user_book_states (
  user_book_state_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  book_id BIGINT NOT NULL,
  status ENUM('DONE', 'READING', 'ABORT') DEFAULT 'READING',
  rating INT,
  tag TEXT,
  notes TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_book_state (user_id, book_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE
);

INSERT INTO user_book_states (user_id, book_id, status, rating, tag)
VALUES
(1, 1, 'DONE', 5, 'magic'),
(1, 2, 'DONE', 4, 'classic'),
(2, 3, 'ABORT', 3, 'dark');

-- -----------------------------------------------------
-- TABLE: notes
-- -----------------------------------------------------
CREATE TABLE notes (
  note_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  book_id BIGINT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE
);

INSERT INTO notes (user_id, book_id, body)
VALUES
(1, 1, 'Amazing book!'),
(1, 2, 'Powerful story'),
(2, 3, 'Need to finish reading this');

-- -----------------------------------------------------
-- ✅ Done
-- -----------------------------------------------------
SELECT '✅ Database setup completed successfully!' AS message;
