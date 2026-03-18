import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReportDto } from './reports.dtos';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './reports.entity';
import { User } from 'src/users/user.entity';
import { ApproveReportDto } from './reports.dtos';

@Injectable()
export class ReportsService {
  constructor(@InjectRepository(Report) private repo: Repository<Report>) {}

  create(reportDto: CreateReportDto, user: User) {
    const report = this.repo.create(reportDto);

    report.user = user;

    return this.repo.save(report);
  }

  async approveReport(id: number, { approved }: ApproveReportDto) {
    const report = await this.repo.findOne({
      where: { id },
    });

    if (!report) {
      throw new NotFoundException(`Report with ID:${id} not found.`);
    }

    report.approved = approved;

    return this.repo.save(report);
  }
}
