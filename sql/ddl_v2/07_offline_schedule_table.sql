CREATE TABLE offline_schedule (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    day ENUM('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN') NOT NULL,
    start_time INT NOT NULL,
    end_time INT NOT NULL,
    place VARCHAR(255) NOT NULL,
    lecture_id BIGINT UNSIGNED NOT NULL,
    CONSTRAINT fk_offline_schedule_lecture_id FOREIGN KEY (lecture_id) REFERENCES lecture(id) ON DELETE CASCADE,
    CONSTRAINT uk_offline_schedule UNIQUE(lecture_id, day, start_time)
);
