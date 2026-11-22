-- 이수구분에 '복전선'(DOUBLE_MAJOR_ELECTIVE) 추가
-- 이미 떠 있는 DB에 한 번 실행한다. (새로 만드는 DB는 init.sql 에 반영돼 있음)
-- ENUM 끝에 값을 추가하는 것이라 기존 데이터는 바뀌지 않는다.
ALTER TABLE major_course
  MODIFY requirement_type ENUM(
    'MAJOR_REQUIRED',
    'MAJOR_ELECTIVE',
    'MAJOR_BASIC',
    'GENERAL_REQUIRED',
    'REQUIRED_GENERAL_ELECTIVE',
    'GENERAL_ELECTIVE',
    'FREE_ELECTIVE',
    'MD_MAJOR_ELECTIVE',
    'DOUBLE_MAJOR_ELECTIVE'
  ) NOT NULL;
