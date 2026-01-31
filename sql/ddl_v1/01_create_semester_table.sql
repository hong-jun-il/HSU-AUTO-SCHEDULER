CREATE TABLE semester (
    semester_id VARCHAR(255) PRIMARY KEY,
    year INT NOT NULL,
    term INT NOT NULL CHECK (term IN (1, 2))
);