import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  Point,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { User } from './user.entity';
import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Review } from './review.entity';
import { ShippingPrice } from './shipping-price.entity';
import { ReportPurchase } from './report-purchase.entity';

//To keep track of where in a purchase cycle a purchase is in
export enum PurchaseStatusEnum {
  CLAIMED = 'CLAIMED', //Initial state of a purchase, buyer has claimed the product
  PAYMENT_STARTED = 'PAYMENT_STARTED', //Buyer has initiated payment to Stripe
  PAYMENT_ACCEPTED = 'PAYMENT_ACCEPTED', //The payment is accepted by Stripe
  SHIPMENT_BOOKED = 'SHIPMENT_BOOKED', //(OPTIONAL) Seller has booked a shipment
  SHIPMENT_DROPPED_OFF = 'SHIPMENT_DROPPED_OFF', //(OPTIONAL) Seller has dropped off product at shipping provider
  SHIPPING_STARTED = 'SHIPPING_STARTED', //(OPTIONAL) Shipping provider has started transporting the product
  SHIPPING_DELIVERED = 'SHIPPING_DELIVERED', //(OPTIONAL) Shipping provider has delivered the product to a service point
  DELIVERED = 'DELIVERED', //The product has been delivered to the buyer either through shipping or through handoff
  APPROVED = 'APPROVED', //(OPTIONAL) Buyer has accepted the product
  PAYOUT_STARTED = 'PAYOUT_STARTED', //Stripe has started payout to seller
  FINISHED_FAILED = 'FINISHED_FAILED', //Purchase was for any reason canceled
  FINISHED_SUCCESS = 'FINISHED_SUCCESS', //Purchase is complete
  PAUSED = 'PAUSED', //Buyer has pauset the purchase
  PAYOUT_FAILED = 'PAYOUT_FAILED', //Payout to seller failed
}
registerEnumType(PurchaseStatusEnum, { name: 'PurchaseStatusEnum' });

export enum TransportationEnum {
  PICKUP = 'PICKUP',
  SHIPPING = 'SHIPPING',
  DELIVERY = 'DELIVERY',
}
registerEnumType(TransportationEnum, { name: 'TransportationEnum' });

export enum SupportedPaymentMethod {
  SWISH = 'SWISH',
  CARD = 'CARD',
}
registerEnumType(SupportedPaymentMethod, {
  name: 'PaymentMethod',
});

@Entity()
@ObjectType()
export class Purchase {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => Date)
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column()
  productId: string;
  @ManyToOne(() => Product, (p) => p.purchases)
  product: Product;

  @Field()
  @Column()
  buyerId: string;
  @ManyToOne(() => User, (u) => u.purchases)
  buyer: User;

  @Column({ nullable: true, comment: "payment id on buyer's side" })
  paymentIntentId?: string;

  @Column({ nullable: true, comment: 'charge made on payment' })
  chargeId?: string;

  @Column({ nullable: true, comment: 'tranfer regarding payment' })
  transferId?: string;

  @Column({ nullable: true, comment: "payment id on seller's side" })
  destinationPaymentId?: string;

  @Column({ nullable: true })
  payoutId?: string;

  @Field(() => Date, { nullable: true })
  @Column('timestamptz', { nullable: true })
  paymentStartedAt?: Date | null;
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
    insert: false,
    update: false,
    asExpression: `
      CASE
        WHEN "failedAt" IS NOT NULL THEN '${PurchaseStatusEnum.FINISHED_FAILED}'::purchase_status_enum
        WHEN "payoutReceivedAt" IS NOT NULL THEN '${PurchaseStatusEnum.FINISHED_SUCCESS}'::purchase_status_enum
        WHEN "payoutFailedAt" IS NOT NULL THEN '${PurchaseStatusEnum.PAYOUT_FAILED}'::purchase_status_enum
        WHEN "payoutStartedAt" IS NOT NULL THEN '${PurchaseStatusEnum.PAYOUT_STARTED}'::purchase_status_enum
        WHEN "approvedAt" IS NOT NULL THEN '${PurchaseStatusEnum.APPROVED}'::purchase_status_enum
        WHEN "pausedAt" IS NOT NULL THEN '${PurchaseStatusEnum.PAUSED}'::purchase_status_enum
        WHEN "deliveredAt" IS NOT NULL THEN '${PurchaseStatusEnum.DELIVERED}'::purchase_status_enum
        WHEN "shipmentDeliveredAt" IS NOT NULL THEN '${PurchaseStatusEnum.SHIPPING_DELIVERED}'::purchase_status_enum
        WHEN "shipmentStartedAt" IS NOT NULL THEN '${PurchaseStatusEnum.SHIPPING_STARTED}'::purchase_status_enum
        WHEN "shipmentDroppedOffAt" IS NOT NULL THEN '${PurchaseStatusEnum.SHIPMENT_DROPPED_OFF}'::purchase_status_enum
        WHEN "shipmentBookedAt" IS NOT NULL THEN '${PurchaseStatusEnum.SHIPMENT_BOOKED}'::purchase_status_enum
        WHEN "paymentAcceptedAt" IS NOT NULL THEN '${PurchaseStatusEnum.PAYMENT_ACCEPTED}'::purchase_status_enum
        WHEN "paymentStartedAt" IS NOT NULL THEN '${PurchaseStatusEnum.PAYMENT_STARTED}'::purchase_status_enum
        ELSE '${PurchaseStatusEnum.CLAIMED}'::purchase_status_enum
      END
    `,
  })
  status: PurchaseStatusEnum;

  @Column({ nullable: true })
  refundId?: string;

  @Column({ nullable: true })
  payoutBankAccountId?: string;

  @Column({ nullable: true })
  payoutBankName?: string;

  @Column({ nullable: true })
  payoutBankLast4?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  abortedById?: string;
  @ManyToOne(() => User, (u) => u.id, { nullable: true })
  abortedBy?: User;

  @OneToMany(() => Review, (review) => review.purchase)
  reviews: Review[];

  @Field(() => SupportedPaymentMethod, { nullable: true })
  @Column({ type: 'enum', enum: SupportedPaymentMethod, nullable: true })
  paymentMethod?: SupportedPaymentMethod;

  @Field(() => TransportationEnum)
  @Column({ type: 'enum', enum: TransportationEnum })
  transportationMethod: TransportationEnum;

  @Column({ nullable: true })
  shippingId?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  toServicePointId?: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true, type: 'character varying' })
  qrCodeUrl?: string | null;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true, type: 'character varying' })
  qrCodeContent: string | null;

  @Column({ nullable: true, type: 'json' })
  postnordRawData?: JSON;

  @Column({ nullable: true })
  deliverToAddress?: string;

  @Column('geometry', {
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  deliverToLocation?: Point;

  @Field({ nullable: true })
  @Column('timestamptz', { nullable: true })
  sellerRespondedAt?: Date;

  @Column({ nullable: true })
  shippingPriceId?: string;
  @ManyToOne(() => ShippingPrice, (shippingPrice) => shippingPrice.id, {
    nullable: true,
  })
  shippingPrice?: ShippingPrice;

  @Field({ nullable: true })
  @Column({ nullable: true })
  purchasedQuantity?: number;

  @OneToOne(() => ReportPurchase, (rp) => rp.purchase, { nullable: true })
  reportPurchase?: ReportPurchase;
}
