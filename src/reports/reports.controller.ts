import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto, ReportDto } from './reports.dtos';
import { AuthGuard } from 'src/guards';
import { User } from 'src/users/user.entity';
import { CurrentUser } from 'src/users/decorators/current-user.decorator';
import { Serialize } from 'src/interceptors';

@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Post()
  @UseGuards(AuthGuard)
  @Serialize(ReportDto)
  createReport(@Body() body: CreateReportDto, @CurrentUser() user: User) {
    return this.reportsService.create(body, user);
  }
}
