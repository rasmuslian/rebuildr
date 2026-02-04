import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Partner } from 'src/entities/partner.entity';
import { CmsCreatePartnerInput } from 'src/resolvers/partner.resolver';
import { Repository } from 'typeorm';
import { FileService } from './file.service';
import { BadUserInputException } from 'src/exceptions';
import { validateWebsite } from 'src/utility/website';

@Injectable()
export class PartnerService {
  constructor(
    @InjectRepository(Partner)
    private partnerRepository: Repository<Partner>,
    private fileService: FileService,
  ) {}

  async partners() {
    return await this.partnerRepository.find({
      order: { name: 'ASC', createdAt: 'DESC' },
    });
  }

  async createPartner(input: CmsCreatePartnerInput) {
    const partner = new Partner();
    try {
      Object.assign<Partner, Partial<Partner>>(partner, {
        name: input.name,
        description: input.description,
      });

      if (input.websiteUrl) {
        partner.websiteUrl = validateWebsite(input.websiteUrl);
      }

      if (input.logo) {
        partner.logo = await this.fileService.createFile(input.logo);
      }

      await this.partnerRepository.save(partner);
      const imagePutUrl = partner.logo
        ? await this.fileService.uploadFile(partner.logo, true)
        : null;

      return { partner, imagePutUrl };
    } catch (error) {
      throw BadUserInputException('Failed to create partner: ' + error);
    }
  }
}
