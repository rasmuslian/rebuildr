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

registerEnumType(BannerActionEnum, { name: 'BannerActionEnum' });
registerEnumType(BannerPresetBackground, { name: 'BannerPresetBackground' });

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

  @Field()
  @Column()
  label: string;

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

  @Field(() => File, { nullable: true })
  @OneToOne(() => File, (f) => f.id, { nullable: true })
  @JoinColumn()
  backgroundImage?: File;

  @Field()
  @Column({ default: true })
  active: boolean;
}
