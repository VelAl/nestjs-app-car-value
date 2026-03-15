import { Injectable } from '@nestjs/common';
import { CreateReportDto } from './reports.dtos';

@Injectable()
export class ReportsService {
  createReport(reportDto: CreateReportDto) {
    console.log('value ===>', reportDto);
  }
}
