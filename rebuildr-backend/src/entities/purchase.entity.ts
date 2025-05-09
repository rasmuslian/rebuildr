import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { User } from './user.entity';
import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Review } from './review.entity';

//To keep track of where in a purchase cycle a purchase is in
export enum PurchaseStatusEnum {
  CLAIMED = 'CLAIMED', //Initial state of a purchase, buyer has claimed the product
  PAYMENT_SENT = 'PAYMENT_SENT', //Buyer has sent money to Rocker
  PAYMENT_ACCEPTED = 'PAYMENT_ACCEPTED', //The payment is accepted by Rocker
  SHIPMENT_BOOKED = 'SHIPMENT_BOOKED', //(OPTIONAL) Seller has booked a shipment
  SHIPMENT_DROPPED_OFF = 'SHIPMENT_DROPPED_OFF', //(OPTIONAL) Seller has dropped off product at shipping provider
  SHIPPING_STARTED = 'SHIPPING_STARTED', //(OPTIONAL) Shipping provider has started transporting the product
  SHIPPING_DELIVERED = 'SHIPPING_DELIVERED', //(OPTIONAL) Shipping provider has delivered the product to a service point
  DELIVERED = 'DELIVERED', //The product has been delivered to the buyer either through shipping or through handoff
  APPROVED = 'APPROVED', //(OPTIONAL) Buyer has accepted the product
  PAYOUT_STARTED = 'PAYOUT_STARTED', //Rocker has started payout to seller
  FINISHED_FAILED = 'FINISHED_FAILED', //Purchase was for any reason canceled
  FINISHED_SUCCESS = 'FINISHED_SUCCESS', //Seller has received the money and the Purchase is complete
  PAUSED = 'PAUSED', //Buyer has pauset the purchase
  PAYOUT_FAILED = 'PAYOUT_FAILED', //Payout to seller failed
}
registerEnumType(PurchaseStatusEnum, { name: 'PurchaseStatusEnum' });

@Entity()
@ObjectType()
export class Purchase {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  productId: string;
  @ManyToOne(() => Product, (p) => p.purchases)
  product: Product;

  @Column()
  buyerId: string;
  @ManyToOne(() => User, (u) => u.purchases)
  buyer: User;

  @Column({ nullable: true, unique: true })
  rockerPaymentId?: string;

  @Column({ nullable: true })
  rockerOfferId?: string;

  @Column({ nullable: true })
  rockerPayoutId?: string;

  @Field(() => Date, { nullable: true })
  @Column('timestamptz', { nullable: true })
  paymentSentAt?: Date | null;
  @Field(() => Date, { nullable: true })
  @Column('timestamptz', { nullable: true })
  paymentAcceptedAt?: Date | null;
  @Field(() => Date, { nullable: true })
  @Column('timestamptz', { nullable: true })
  shipmentBookedAt?: Date | null;
  @Field(() => Date, { nullable: true })
  @Column('timestamptz', { nullable: true })
  shipmentDroppedOffAt?: Date | null;
  @Field(() => Date, { nullable: true })
  @Column('timestamptz', { nullable: true })
  shipmentDeliveredAt?: Date;
  @Field(() => Date, { nullable: true })
  @Column('timestamptz', { nullable: true })
  shipmentStartedAt?: Date;
  @Field(() => Date, { nullable: true })
  @Column('timestamptz', { nullable: true })
  deliveredAt?: Date | null;
  @Field(() => Date, { nullable: true })
  @Column('timestamptz', { nullable: true })
  approvedAt?: Date | null;
  @Field(() => Date, { nullable: true })
  @Column('timestamptz', { nullable: true })
  payoutStartedAt?: Date | null;
  @Field(() => Date, { nullable: true })
  @Column('timestamptz', { nullable: true })
  payoutReceivedAt?: Date | null;
  @Field(() => Date, { nullable: true })
  @Column('timestamptz', { nullable: true })
  failedAt?: Date | null;
  @Field(() => Date, { nullable: true })
  @Column('timestamptz', { nullable: true })
  pausedAt?: Date | null;
  @Field(() => Date, { nullable: true })
  @Column('timestamptz', { nullable: true })
  payoutFailedAt?: Date | null;

  @Field(() => PurchaseStatusEnum)
  @Column({
    type: 'enum',
    enum: PurchaseStatusEnum,
    generatedType: 'STORED',
    asExpression: `
      CASE
        WHEN "failed_at" IS NOT NULL THEN '${PurchaseStatusEnum.FINISHED_FAILED}'::purchase_status_enum
        WHEN "payout_received_at" IS NOT NULL THEN '${PurchaseStatusEnum.FINISHED_SUCCESS}'::purchase_status_enum
        WHEN "payout_failed_at" IS NOT NULL THEN '${PurchaseStatusEnum.PAYOUT_FAILED}'::purchase_status_enum
        WHEN "payout_started_at" IS NOT NULL THEN '${PurchaseStatusEnum.PAYOUT_STARTED}'::purchase_status_enum
        WHEN "approved_at" IS NOT NULL THEN '${PurchaseStatusEnum.APPROVED}'::purchase_status_enum
        WHEN "paused_at" IS NOT NULL THEN '${PurchaseStatusEnum.PAUSED}'::purchase_status_enum
        WHEN "delivered_at" IS NOT NULL THEN '${PurchaseStatusEnum.DELIVERED}'::purchase_status_enum
        WHEN "shipment_delivered_at" IS NOT NULL THEN '${PurchaseStatusEnum.SHIPPING_DELIVERED}'::purchase_status_enum
        WHEN "shipment_started_at" IS NOT NULL THEN '${PurchaseStatusEnum.SHIPPING_STARTED}'::purchase_status_enum
        WHEN "shipment_dropped_off_at" IS NOT NULL THEN '${PurchaseStatusEnum.SHIPMENT_DROPPED_OFF}'::purchase_status_enum
        WHEN "shipment_booked_at" IS NOT NULL THEN '${PurchaseStatusEnum.SHIPMENT_BOOKED}'::purchase_status_enum
        WHEN "payment_accepted_at" IS NOT NULL THEN '${PurchaseStatusEnum.PAYMENT_ACCEPTED}'::purchase_status_enum
        WHEN "payment_sent_at" IS NOT NULL THEN '${PurchaseStatusEnum.PAYMENT_SENT}'::purchase_status_enum
        ELSE '${PurchaseStatusEnum.CLAIMED}'::purchase_status_enum
      END
    `,
  })
  status: PurchaseStatusEnum;

  @Column({ nullable: true })
  refundId?: string;

  @OneToMany(() => Review, (review) => review.purchase)
  reviews: Review[];
}
