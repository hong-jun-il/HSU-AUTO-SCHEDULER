CREATE TABLE offline_schedule (
    offline_schedule_id VARCHAR(255) PRIMARY KEY,
    day ENUM('Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun') NOT NULL,
    start_time INT NOT NULL,
    end_time INT NOT NULL,
    place VARCHAR(255) NOT NULL,
    semester_id VARCHAR(255) NOT NULL,
    course_code VARCHAR(255) NOT NULL,
    class_section_id VARCHAR(255) NOT NULL,
    FOREIGN KEY (semester_id, course_code) REFERENCES course(semester_id, course_code) ON DELETE CASCADE,
    FOREIGN KEY (class_section_id) REFERENCES class_section(class_section_id) ON DELETE CASCADE,
    UNIQUE(semester_id, course_code, class_section_id, day, start_time, end_time)
);
