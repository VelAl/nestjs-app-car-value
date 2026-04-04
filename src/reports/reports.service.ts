import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReportDto, GetEstimateDto } from './reports.dtos';
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

  // Estimates price by averaging up to 3 nearby reports with matching make/model/year.
  async getEstimate(
    estimateDto: GetEstimateDto,
  ): Promise<{ price: number | null }> {
    const res = (await this.repo
      .createQueryBuilder()
      .select('AVG(price)', 'price')
      .where('make = :make', { make: estimateDto.make })
      .andWhere('model = :model', { model: estimateDto.model })
      .andWhere('lng - :lng BETWEEN -5 AND 5', { lng: estimateDto.lng })
      .andWhere('lat - :lat BETWEEN -5 AND 5', { lat: estimateDto.lat })
      .andWhere('year - :year BETWEEN -3 AND 3', { year: estimateDto.year })
      .andWhere('approved IS TRUE')
      .orderBy('ABS(mileage - :mileage)', 'ASC')
      .setParameters({ mileage: estimateDto.mileage })
      .limit(3)
      .getRawOne()) as { price: number | null };

    return { price: res?.price || null };
  }
}
