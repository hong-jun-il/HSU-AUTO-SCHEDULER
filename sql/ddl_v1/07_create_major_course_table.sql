CREATE TABLE major_course (
    semester_id VARCHAR(255) NOT NULL,
    major_code VARCHAR(255) NOT NULL,
    course_code VARCHAR(255) NOT NULL,
    PRIMARY KEY (major_code, course_code, semester_id),
    FOREIGN KEY (semester_id, course_code) REFERENCES course(semester_id, course_code) ON DELETE CASCADE,
    FOREIGN KEY (major_code) REFERENCES major(major_code) ON DELETE CASCADE
);
