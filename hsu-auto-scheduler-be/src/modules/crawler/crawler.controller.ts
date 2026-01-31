import { Controller, Post, Body } from '@nestjs/common';
import { SemesterDto } from 'src/common/dto/semester.dto';
import { MajorDto } from 'src/common/dto/major.dto';
import { CrawlerService } from './services/crawler.service';
import { CourseDto } from 'src/common/dto/course.dto';

@Controller('crawler')
export class CrawlerController {
  constructor(private readonly crawlerService: CrawlerService) {}

  // 학기 저장(학기 테이블)
  @Post('save-semester')
  handleSemesterData(@Body() semester: SemesterDto) {
    return this.crawlerService.createSemester(semester);
  }

  // 전공 저장 로직(전공 테이블, 학기-전공 관계 테이블)
  @Post('save-majors')
  handleMajorData(
    @Body('semesterId') semesterId: string,
    @Body('majors') majors: MajorDto[],
  ) {
    return this.crawlerService.createMajors(semesterId, majors);
  }

  // 강의 저장 로직(강의 테이블, 분반 테이블, 오프라인 스케줄 테이블)
  @Post('save-courses')
  handleCourseData(
    @Body('semesterId')
    semesterId: string,
    @Body('major')
    major: MajorDto,
    @Body('courses') courses: CourseDto[],
  ) {
    return this.crawlerService.createCourseTransaction(
      semesterId,
      major,
      courses,
    );
  }
}
