CREATE TABLE course (
    course_code VARCHAR(255) NOT NULL,
    semester_id VARCHAR(255) NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    completion_type VARCHAR(255) NOT NULL,
    credit INT NOT NULL,
    grade VARCHAR(30) NOT NULL,
    grade_limit INT,
    PRIMARY KEY (semester_id, course_code),
    FOREIGN KEY (semester_id) REFERENCES semester(semester_id) ON DELETE CASCADE
);
