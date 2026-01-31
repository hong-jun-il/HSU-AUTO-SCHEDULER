CREATE TABLE lecture (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    section VARCHAR(5) NOT NULL,
    delivery_method ENUM('FACE_TO_FACE', 'ONLINE', 'BLENDED') NOT NULL,
    day_or_night ENUM('DAY', 'NIGHT', 'BOTH') NOT NULL,
    professors VARCHAR(255) NOT NULL,
    online_hour DECIMAL(2,1) NOT NULL DEFAULT 0.0,
    plan_code VARCHAR(255),
    remark TEXT,
    semester_id varchar(20) NOT NULL,
    course_id BIGINT UNSIGNED NOT NULL,
    CONSTRAINT fk_lecture_semester_id FOREIGN KEY (semester_id) REFERENCES semester(id) ON DELETE CASCADE,
    CONSTRAINT fk_lecture_course_id FOREIGN KEY (course_id) REFERENCES course(id) ON DELETE CASCADE,
    CONSTRAINT uk_lecture UNIQUE(semester_id, course_id, section)
);