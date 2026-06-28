-- Blog posts table: admin-only publishing
CREATE TABLE IF NOT EXISTS blog_posts (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    slug        VARCHAR(255) NOT NULL UNIQUE,
    title       VARCHAR(512) NOT NULL,
    excerpt     TEXT,
    content     LONGTEXT NOT NULL,
    cover_image VARCHAR(1024),
    tags        VARCHAR(512),
    author_name VARCHAR(128) DEFAULT 'GoJobWise Team',
    published   TINYINT(1) NOT NULL DEFAULT 0,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
