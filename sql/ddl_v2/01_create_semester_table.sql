CREATE TABLE semester (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    year INT NOT NULL,
    term TINYINT NOT NULL CHECK (term IN (1, 2, 3, 4)),
    CONSTRAINT uk_semester UNIQUE(year, term)
);