import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { BoverketAPI } from 'src/apis/boverket.api';
import { DataModuleCode } from 'src/apis/types/boverket/all-resources';
import { CO2Factor } from 'src/entities/co2-factor.entity';
import { Repository } from 'typeorm';
import { Logger } from 'winston';

@Injectable()
export class CO2FactorService {
  constructor(
    @InjectRepository(CO2Factor)
    private co2FactorRepository: Repository<CO2Factor>,
    private boverketApi: BoverketAPI,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async getCO2Factors() {
    return await this.co2FactorRepository.find({
      order: { resourceId: 'ASC' },
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async syncCO2Data() {
    this.logger.info('Syncing CO2');
    const response = await this.boverketApi.getAllResouces();

    await Promise.all(
      response.Resources.map(async (resource) => {
        const resourceId = resource.ResourceId.toString();
        const productName = resource.Name;
        const categoryName = resource.Categories[0].Text;
        const coefficient = resource.DataItems[0].DataValueItems.find(
          (item) => item.DataModuleCode === DataModuleCode.A1A3Conservative,
        )?.Value;
        const version = resource.Version;
        const dataUpdatedAt = resource.UpdatedTime;

        //Validate data
        if (
          !resourceId ||
          !productName ||
          !categoryName ||
          coefficient === undefined ||
          coefficient === null ||
          !version ||
          !dataUpdatedAt
        ) {
          this.logger.error('syncCO2Data: Incorrect data', {
            resource,
          });
          return;
        }

        //Find if exists, otherwise create the row
        let co2Factor = await this.co2FactorRepository.findOne({
          where: { resourceId },
        });
        if (!co2Factor) {
          co2Factor = new CO2Factor();
          co2Factor.resourceId = resourceId;
        }

        //Set new values
        co2Factor.productName = productName;
        co2Factor.categoryName = categoryName;
        co2Factor.coefficient = coefficient;
        co2Factor.version = version;
        co2Factor.dataUpdatedAt = new Date(dataUpdatedAt);

        await this.co2FactorRepository.save(co2Factor);
      }),
    );
  }
}
