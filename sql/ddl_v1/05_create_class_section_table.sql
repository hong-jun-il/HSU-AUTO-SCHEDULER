CREATE TABLE class_section (
    class_section_id VARCHAR(255) PRIMARY KEY,
    class_section VARCHAR(10) NOT NULL,
    professor_names VARCHAR(160) NOT NULL,
    day_or_night ENUM('day', 'night', 'both') NOT NULL,
    delivery_method VARCHAR(255) NOT NULL,
    online_hour DECIMAL(2,1) NOT NULL DEFAULT 0.0,
    plan_code VARCHAR(255),
    semester_id VARCHAR(255) NOT NULL,
    course_code VARCHAR(255) NOT NULL,
    FOREIGN KEY (semester_id, course_code) REFERENCES course(semester_id, course_code) ON DELETE CASCADE,
    UNIQUE(semester_id, course_code, class_section, professor_names)
);
