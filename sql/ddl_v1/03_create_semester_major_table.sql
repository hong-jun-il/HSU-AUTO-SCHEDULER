CREATE TABLE semester_major (
  semester_id VARCHAR(255) NOT NULL,
  major_code VARCHAR(255) NOT NULL,
  PRIMARY KEY (semester_id, major_code),
  FOREIGN KEY (semester_id) REFERENCES semester(semester_id) ON DELETE CASCADE,
  FOREIGN KEY (major_code) REFERENCES major(major_code) ON DELETE CASCADE
);
