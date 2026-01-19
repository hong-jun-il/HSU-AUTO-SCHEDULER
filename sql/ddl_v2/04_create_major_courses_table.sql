CREATE TABLE major_courses (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    requirement_type ENUM(
        'MAJOR_REQUIRED',      
        'MAJOR_ELECTIVE',      
        'MAJOR_BASIC',         
        'GENERAL_REQUIRED',   
        'ELECTIVE_GENERAL',    
        'GENERAL_ELECTIVE',    
        'FREE_ELECTIVE',       
        'MD_MAJOR_ELECTIVE'
    ) NOT NULL,
    grade INT NOT NULL,
    grade_limit INT,
    major_id BIGINT UNSIGNED NOT NULL,
    course_id BIGINT UNSIGNED NOT NULL,
    CONSTRAINT fk_major_courses_major_id FOREIGN KEY (major_id) REFERENCES major(id) ON DELETE CASCADE,
    CONSTRAINT fk_major_courses_course_id FOREIGN KEY (course_id) REFERENCES course(id) ON DELETE CASCADE,
    CONSTRAINT uk_major_courses UNIQUE(major_id, course_id)
);  