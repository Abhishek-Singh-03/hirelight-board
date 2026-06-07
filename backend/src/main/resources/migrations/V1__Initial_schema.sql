CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('CANDIDATE', 'RECRUITER') DEFAULT 'CANDIDATE',
    skills JSON,
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    apply_link VARCHAR(500),
    posted_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    category VARCHAR(100),
    description TEXT,
    salary VARCHAR(100),
    type VARCHAR(50),
    recruiter_id INT,
    FOREIGN KEY (recruiter_id) REFERENCES users(id)
);

CREATE TABLE experiences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type ENUM('offer', 'interview', 'rejection') NOT NULL,
    upvotes INT DEFAULT 0,
    author_id INT,
    share_code VARCHAR(8) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id)
);

CREATE TABLE salaries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    yoe INT NOT NULL,
    base_salary INT NOT NULL,
    bonus INT DEFAULT 0,
    stock INT DEFAULT 0,
    author_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id)
);
