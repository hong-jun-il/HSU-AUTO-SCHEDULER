CREATE TABLE major_course (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    requirement_type ENUM(
        'MAJOR_REQUIRED',      
        'MAJOR_ELECTIVE',      
        'MAJOR_BASIC',         
        'GENERAL_REQUIRED',   
        'REQUIRED_GENERAL_ELECTIVE',    
        'GENERAL_ELECTIVE',    
        'FREE_ELECTIVE',       
        'MD_MAJOR_ELECTIVE'
    ) NOT NULL,
    grade INT NOT NULL,
    grade_limit INT,
    major_id BIGINT UNSIGNED NOT NULL,
    course_id BIGINT UNSIGNED NOT NULL,
    CONSTRAINT fk_major_course_major_id FOREIGN KEY (major_id) REFERENCES major(id) ON DELETE CASCADE,
    CONSTRAINT fk_major_course_course_id FOREIGN KEY (course_id) REFERENCES course(id) ON DELETE CASCADE,
    CONSTRAINT uk_major_course UNIQUE(major_id, course_id)
);  