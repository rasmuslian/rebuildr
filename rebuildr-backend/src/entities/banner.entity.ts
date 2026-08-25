import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { File } from './file.entity';

export enum BannerActionEnum {
  SELL = 'SELL',
}
export enum BannerPresetBackground {
  REBUILDR = 'REBUILDR',
  WOOD = 'WOOD',
  METALLIC = 'METALLIC',
}

export enum BannerForegroundColor {
  LOGO_BACKGROUND = 'LOGO_BACKGROUND',
  LOGO_VECTOR = 'LOGO_VECTOR',
  WHITE = 'WHITE',
  CHARCOAL = 'CHARCOAL',
}

export enum BannerPlacementEnum {
  STANDARD = 'STANDARD',
  END = 'END',
  PRODUCT_INLINE = 'PRODUCT_INLINE',
}

registerEnumType(BannerActionEnum, { name: 'BannerActionEnum' });
registerEnumType(BannerPresetBackground, { name: 'BannerPresetBackground' });
registerEnumType(BannerForegroundColor, { name: 'BannerForegroundColor' });
registerEnumType(BannerPlacementEnum, { name: 'BannerPlacementEnum' });

@Entity()
@ObjectType()
export class Banner {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  label?: string;

  @Field()
  @Column()
  title: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  url?: string;

  @Field(() => BannerActionEnum, { nullable: true })
  @Column('enum', { enum: BannerActionEnum, nullable: true })
  action?: BannerActionEnum;

  @Field(() => BannerPresetBackground)
  @Column('enum', {
    enum: BannerPresetBackground,
    default: BannerPresetBackground.REBUILDR,
  })
  presetBackground: BannerPresetBackground;

  @Field(() => BannerForegroundColor)
  @Column('enum', {
    enum: BannerForegroundColor,
    default: BannerForegroundColor.LOGO_BACKGROUND,
  })
  foregroundColor: BannerForegroundColor;

  @Field(() => [BannerPlacementEnum])
  @Column('enum', {
    enum: BannerPlacementEnum,
    array: true,
    default: [BannerPlacementEnum.STANDARD],
  })
  placements: BannerPlacementEnum[];

  @Field({ nullable: true })
  @Column({ nullable: true })
  ctaText?: string;

  @Field(() => File, { nullable: true })
  @OneToOne(() => File, (f) => f.id, { nullable: true })
  @JoinColumn()
  backgroundImage?: File;

  @Field(() => File, { nullable: true })
  @OneToOne(() => File, (f) => f.id, { nullable: true })
  @JoinColumn()
  logo?: File;

  @Field(() => Date)
  @Column()
  showFrom: Date;

  @Field(() => Date, { nullable: true })
  @Column({ nullable: true })
  showTo?: Date;
}
