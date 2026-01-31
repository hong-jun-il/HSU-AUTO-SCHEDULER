CREATE TABLE semester_major (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    semester_id varchar(20) NOT NULL,
    major_id BIGINT UNSIGNED NOT NULL,
    CONSTRAINT fk_semester_major_semester_id FOREIGN KEY (semester_id) REFERENCES semester(id) ON DELETE CASCADE,
    CONSTRAINT fk_semester_major_major_id FOREIGN KEY (major_id) REFERENCES major(id) ON DELETE CASCADE,
    UNIQUE KEY uk_semester_major (semester_id, major_id)
)