import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banner, BannerPlacementEnum } from 'src/entities/banner.entity';
import {
  CmsCreateBannerInput,
  CmsUpdateBannerInput,
} from 'src/resolvers/banner.resolver';
import { FileService } from './file.service';
import { BadUserInputException, NotFoundException } from 'src/exceptions';

@Injectable()
export class BannerService {
  constructor(
    @InjectRepository(Banner) private bannerRepository: Repository<Banner>,
    private fileService: FileService,
  ) {}

  async getBanners(placement = BannerPlacementEnum.STANDARD) {
    const now = new Date();
    const query = this.bannerRepository
      .createQueryBuilder('banner')
      .where('banner.showFrom <= :now', { now })
      .andWhere('(banner.showTo IS NULL OR banner.showTo >= :now)', { now })
      .andWhere(':placement = ANY(banner.placements)', { placement })
      .orderBy('RANDOM()');

    if (placement === BannerPlacementEnum.STANDARD) query.limit(3);
    if (placement === BannerPlacementEnum.PRODUCT_INLINE) query.limit(1);

    return query.getMany();
  }

  async findAll(): Promise<Banner[]> {
    return this.bannerRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Banner> {
    const banner = await this.bannerRepository.findOne({
      where: { id },
      relations: { backgroundImage: true, logo: true },
    });
    if (!banner) throw NotFoundException('Banner not found');
    return banner;
  }

  async createBanner(input: CmsCreateBannerInput) {
    const banner = new Banner();

    try {
      Object.assign<Banner, Partial<Banner>>(banner, {
        label: input.label,
        title: input.title,
        url: input.url,
        action: input.action,
        presetBackground: input.presetBackground,
        placements: input.placements,
        ctaText: input.ctaText,
        showFrom: input.showFrom,
        showTo: input.showTo,
      });

      if (input.backgroundImage) {
        banner.backgroundImage = await this.fileService.createFile(
          input.backgroundImage,
        );
      }
      if (input.logo)
        banner.logo = await this.fileService.createFile(input.logo);

      await this.bannerRepository.save(banner);

      const imagePutUrl = banner.backgroundImage
        ? await this.fileService.uploadFile(banner.backgroundImage, true)
        : null;
      const logoPutUrl = banner.logo
        ? await this.fileService.uploadFile(banner.logo, true)
        : null;

      return { banner, imagePutUrl, logoPutUrl };
    } catch (error) {
      throw BadUserInputException('Failed to create banner: ' + error);
    }
  }

  async updateBanner(input: CmsUpdateBannerInput) {
    const banner = await this.findOne(input.id);

    try {
      Object.assign<Banner, Partial<Banner>>(banner, {
        label: input.label,
        title: input.title,
        url: input.url,
        action: input.action,
        presetBackground: input.presetBackground,
        placements: input.placements,
        ctaText: input.ctaText,
        showFrom: input.showFrom,
        showTo: input.showTo,
      });

      if (input.backgroundImage) {
        banner.backgroundImage = await this.fileService.createFile(
          input.backgroundImage,
        );
      }
      if (input.logo)
        banner.logo = await this.fileService.createFile(input.logo);

      await this.bannerRepository.save(banner);

      const imagePutUrl = input.backgroundImage
        ? await this.fileService.uploadFile(banner.backgroundImage, true)
        : null;
      const logoPutUrl = input.logo
        ? await this.fileService.uploadFile(banner.logo, true)
        : null;

      return { banner, imagePutUrl, logoPutUrl };
    } catch (error) {
      throw BadUserInputException('Failed to update banner: ' + error);
    }
  }
}
