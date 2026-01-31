import {
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ScheduleService } from './services/schedule.service';
import { FilterDto } from './dto/filter.dto';
import { ConstraintsDto } from './dto/constraints.dto';
import { CPSATFilterDto } from './dto/cpsat-filter.dto';

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get('get-semesters')
  getSemesters() {
    return this.scheduleService.getSemesters();
  }

  @Get('get-majors')
  getMajors(@Query('semesterId') semesterId: string) {
    return this.scheduleService.getMajors(semesterId);
  }

  // 필터가 너무 많으므로 POST로 바꿈
  @Post('get-courses')
  getCourses(
    @Body('currentPage', ParseIntPipe)
    currentPage: number,
    @Body('pagePerLimit', ParseIntPipe)
    pagePerLimit: number,
    @Body('filters') filters: FilterDto,
  ) {
    return this.scheduleService.getCourses(currentPage, pagePerLimit, filters);
  }

  @Post('get-cpsat')
  handleScheduleConstaraints(
    @Body('currentPage', ParseIntPipe)
    currentPage: number,
    @Body('pagePerLimit', ParseIntPipe)
    pagePerLimit: number,
    @Body('filters')
    filters: CPSATFilterDto,
    @Body('constraints')
    constraints: ConstraintsDto,
  ) {
    return this.scheduleService.getCPSATResult(
      currentPage,
      pagePerLimit,
      filters,
      constraints,
    );
  }
}
