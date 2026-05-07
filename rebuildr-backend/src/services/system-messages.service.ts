import { User } from 'src/entities/user.entity';
import { MessageService, SystemMessageInput } from './message.service';
import { Product } from 'src/entities/product.entity';
import { Purchase, TransportationEnum } from 'src/entities/purchase.entity';
import dayjs from 'dayjs';
import { ShippingProviderEnum } from 'src/entities/shipping-price.entity';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { registerEnumType } from '@nestjs/graphql';

export enum SystemMessageStepEnum {
  PURCHASE_INITIATED = 'PURCHASE_INITIATED',
  SELLER_RESPONDED = 'SELLER_RESPONDED',
  HANDOFF_CONFIRMED = 'HANDOFF_CONFIRMED',
  SHIPMENT_DROPPED_OFF = 'SHIPMENT_DROPPED_OFF',
  SHIPMENT_ARRIVED = 'SHIPMENT_ARRIVED',
  SHIPMENT_DELIVERED = 'SHIPMENT_DELIVERED',
  PURCHASE_SUCCESS = 'PURCHASE_SUCCESS',
  PURCHASE_REPORTED = 'PURCHASE_REPORTED',
  SUPPORT_CONCLUDED = 'SUPPORT_CONCLUDED',
  PURCHASE_ABORTED_BY_BUYER = 'PURCHASE_ABORTED_BY_BUYER',
  PURCHASE_ABORTED_BY_SELLER = 'PURCHASE_ABORTED_BY_SELLER',
  LATE_SHIPPING_DROP_OFF = 'LATE_SHIPPING_DROP_OFF',
}
registerEnumType(SystemMessageStepEnum, { name: 'SystemMessageStepEnum' });

export enum SystemMessageRoleEnum {
  BUYER = 'BUYER',
  SELLER = 'SELLER',
}
registerEnumType(SystemMessageRoleEnum, { name: 'SystemMessageRoleEnum' });

export interface CmsPreviewSystemMessageOptions {
  step: SystemMessageStepEnum;
  role: SystemMessageRoleEnum;
  transportation?: TransportationEnum;
  isFree?: boolean;
  firstSale?: boolean;
  provider?: ShippingProviderEnum;
  decision?: string;
}

const transportationWording: {
  [key in TransportationEnum]: {
    form1: string;
  };
} = {
  [TransportationEnum.PICKUP]: {
    form1: 'avhämtning',
  },
  [TransportationEnum.SHIPPING]: {
    form1: 'frakt',
  },
  [TransportationEnum.DELIVERY]: {
    form1: 'hemtransport',
  },
};
const tradeWording = {
  free: {
    form1: 'affären',
  },
  notFree: {
    form1: 'köpet',
  },
};

export enum ChatActionEnum {
  ABORT = 'ABORT',
  REPORT = 'REPORT',
  ABOUTREVIEW = 'ABOUTREVIEW',
}
registerEnumType(ChatActionEnum, { name: 'ChatActionEnum' });

@Injectable()
export class SystemMessagesService {
  constructor(
    @Inject(forwardRef(() => MessageService))
    private messageService: MessageService,
  ) {}

  // ─── Private utilities ───────────────────────────────────────────────────────

  private formatLink(text: string, chatAction: ChatActionEnum) {
    return `[${text}](${chatAction})`;
  }

  private async message(input: SystemMessageInput) {
    try {
      this.messageService.sendSystemMessage(input);
    } catch {
      return;
    }
  }

  private renderDateTags(message: string): string {
    const svMonths = [
      'januari',
      'februari',
      'mars',
      'april',
      'maj',
      'juni',
      'juli',
      'augusti',
      'september',
      'oktober',
      'november',
      'december',
    ];
    return message.replace(
      /\[\]\(<date::([^:]+)::(.+?)>\)/g,
      (_, fmt, dateStr) => {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        const day = d.getDate();
        const month = svMonths[d.getMonth()];
        if (fmt.includes('HH:mm')) {
          return `${day} ${month} kl. ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
        }
        return `${day} ${month}`;
      },
    );
  }

  // ─── Private message builders ────────────────────────────────────────────────

  private buildPurchaseWithHandoffBuyerMessage(
    buyerEmail: string,
    transportWord: string,
    paymentDate: Date,
    isFree: boolean,
  ): string {
    return isFree
      ? `# Du har köpt varan för 0 kr ([](<date::D MMMM::${paymentDate}>)) och vi har skickat en bekräftelse till ${buyerEmail}.


# Nu är nästa steg att planera ${transportWord}! Börja gärna med att skriva ett meddelande här i chatten för att bestämma tid och plats med säljaren.

_Om säljaren inte svarar inom 24 timmar avbryts affären automatiskt._`
      : `# Du har betalat ([](<date::D MMMM::${paymentDate}>)) och vi har skickat en bekräftelse till ${buyerEmail}


# Nu är nästa steg att planera ${transportWord}! Börja gärna med att skriva ett meddelande här i chatten för att bestämma tid och plats med säljaren.

_Om säljaren inte svarar inom 24 timmar får du automatiskt pengarna tillbaka._`;
  }

  private buildPurchaseWithHandoffSellerMessage(
    transportWord: string,
    paymentDate: Date,
    isFree: boolean,
  ): string {
    return isFree
      ? `# Du har sålt varan för 0kr! Svara köparen i chatten och bestäm tid och plats för ${transportWord}.


# Du behöver svara inom 24h - [](<date::D MMMM kl. HH:mm::${dayjs(paymentDate).add(1, 'day').toDate()}>), annars avbryts affären automatiskt.`
      : `# Du har sålt en vara! Svara köparen i chatten och bestäm tid och plats för ${transportWord}.


# Du behöver svara inom 24h - [](<date::D MMMM kl. HH:mm::${dayjs(paymentDate).add(1, 'day').toDate()}>), annars avbryts köpet automatiskt och köparen får tillbaka sina pengar.`;
  }

  private buildSellerRespondedBuyerMessage(
    isDelivery: boolean,
    responseDate: Date,
    isFree: boolean,
  ): string {
    return isDelivery
      ? `# Hemtransporten sker senast [](<date::D MMMM::${dayjs(responseDate).add(7, 'day').toDate()}>), annars avbryts ${isFree ? 'affären automatiskt' : 'köpet och du får tillbaka dina pengar'}.


_Jag vill ${this.formatLink(`avbryta ${this.tradeWording(isFree).form1}`, ChatActionEnum.ABORT)}._`
      : `# Nu är det dags att åka och hämta din vara!


# Hämta senast [](<date::D MMMM::${dayjs(responseDate).add(7, 'day').toDate()}>), annars avbryts ${isFree ? 'affären automatiskt' : 'köpet och du får tillbaka dina pengar'}.


_Jag vill ${this.formatLink(`avbryta ${this.tradeWording(isFree).form1}`, ChatActionEnum.ABORT)}._`;
  }

  private buildSellerRespondedSellerMessage(
    isDelivery: boolean,
    responseDate: Date,
    isFree: boolean,
  ): string {
    return isDelivery
      ? `# Åk och leverera senast [](<date::D MMMM::${dayjs(responseDate).add(7, 'day').toDate()}>).


# Kom ihåg att markera varan som överlämnad när överlämningen är klar, ${isFree ? 'så att ni båda kan lämna omdöme' : 'så kan vi betala ut pengarna till dig'}.

_Jag vill ${this.formatLink(`avbryta ${this.tradeWording(isFree).form1}`, ChatActionEnum.ABORT)}._`
      : `# Köparen hämtar varan senast [](<date::D MMMM::${dayjs(responseDate).add(7, 'day').toDate()}>).


# Kom ihåg att markera varan som överlämnad när överlämningen är klar, ${isFree ? 'så att ni båda kan lämna omdöme' : 'så kan vi betala ut pengarna till dig'}.

_Jag vill ${this.formatLink(`avbryta ${this.tradeWording(isFree).form1}`, ChatActionEnum.ABORT)}._`;
  }

  private buildHandoffConfirmedBuyerMessage(): string {
    return `# Överlämningen är bekräftad!


# Vänligen godkänn varan nu på plats.


# Godkänns den inte nu sker det automatiskt efter 48 timmar.

_Stämmer inte varan med annonsen? ${this.formatLink('Rapportera problem med köp', ChatActionEnum.REPORT)}_`;
  }

  private buildHandoffConfirmedSellerMessage(): string {
    return `# Överlämningen är nu bekräftad, snart får du betalt!


# Påminn nu köparen om att "Godkänna varan" i meddelandefältet.
Glömmer ni detta sker det automatiskt efter 48h.


# Efter att köparen godkänt - betalar vi ut pengarna till dig.`;
  }

  private buildPurchaseWithShippingBuyerMessage(
    buyerEmail: string,
    sellerUsername: string,
    paymentDate: Date,
  ): string {
    return `# Du har betalat ([](<date::D MMMM::${paymentDate}>)) och vi har skickat en bekräftelse till ${buyerEmail}.


# ${sellerUsername} skickar din vara senast den [](<date::D MMMM::${dayjs(paymentDate).add(7, 'day').toDate()}>).`;
  }

  private buildPurchaseWithShippingSellerMessage(
    paymentDate: Date,
    provider: ShippingProviderEnum,
  ): string {
    return `# Du har sålt en vara! Lämna in paketet senast den [](<date::D MMMM::${dayjs(paymentDate).add(7, 'day').toDate()}>).


# Visa din QR-kod hos valfritt ${provider === ShippingProviderEnum.DHL ? 'DHL' : 'PostNord'}-ombud. Ombudet skriver ut fraktsedeln åt dig, så du behöver inte förbereda något hemma.

_Du kan ${this.formatLink('avbryta innan paketet skickas', ChatActionEnum.ABORT)}._`;
  }

  private buildShipmentArrivedMessage(
    shipmentDeliveredAt: Date,
    provider: ShippingProviderEnum,
  ): string {
    return `# Ditt paket är framme!


# Hämta ut det hos ombud senast [](<date::D MMMM::${dayjs(shipmentDeliveredAt).add(7, 'days').toDate()}>).


# Du får en kod från ${provider === ShippingProviderEnum.DHL ? 'DHL' : 'PostNord'} via sms eller mejl.`;
  }

  private buildShipmentDroppedOffSellerMessage(): string {
    return `# Paketet är inlämnat och på väg till köparen!


# Vi hör av oss så snart köparen har hämtat ut paketet.`;
  }

  private buildShipmentDroppedOffBuyerMessage(): string {
    return `# Nu har paketet lämnats in och är på väg till dig.`;
  }

  private buildShipmentDeliveredBuyerMessage(): string {
    return `# Du har hämtat upp ditt paket.


# Godkänn din vara snarast möjligt - efter 48 timmar godkänns den automatiskt.

_Stämmer inte varan överens med annonsen? ${this.formatLink('Rapportera problem med köp', ChatActionEnum.REPORT)}_`;
  }

  private buildShipmentDeliveredSellerMessage(): string {
    return `# Köparen har hämtat ut paketet.


# Nu har köparen 48 timmar på sig att kontrollera att varan stämmer med annonsen innan köpet godkänns automatiskt.`;
  }

  private buildPurchaseSuccessBuyerMessage(isFree: boolean): string {
    return isFree
      ? `# Överlämningen är nu bekräftad och allting är klart!


# Nu kvarstår bara att lämna omdöme på säljaren!

_${this.formatLink('Om omdömen på Rebuildr', ChatActionEnum.ABOUTREVIEW)}_
`
      : `# Köpet är klart!


# Du har godkänt varan och pengarna har betalats ut till säljaren.


# Nu kvarstår bara att lämna omdöme på säljaren!

_${this.formatLink('Om omdömen på Rebuildr', ChatActionEnum.ABOUTREVIEW)}_`;
  }

  private buildPurchaseSuccessSellerMessage(
    isFree: boolean,
    firstSale: boolean,
  ): string {
    return isFree
      ? `# Överlämningen är nu bekräftad och allting är klart!


# Nu kan du passa på att lämna ett omdöme om köparen.`
      : `# Köparen har godkänt varan!


# ${firstSale ? 'Eftersom det här är din första försäljning kan det ta upp till 7 vardagar innan pengarna finns på plats. Därefter tar det normalt 1-3 bankdagar.' : 'Pengarna beräknas nå dig inom 1-3 bankdagar.'}


# Nu kvarstår bara att lämna omdöme på köparen.

_${this.formatLink('Om omdömen på Rebuildr', ChatActionEnum.ABOUTREVIEW)}_`;
  }

  private buildPurchaseReportedBuyerMessage(): string {
    return `# Du har meddelat att något inte stämmer med varan.


# Utbetalningen till säljaren är pausad under tiden ärendet pågår.

_Vill du lämna ett omdöme redan nu? Du kan recensera din upplevelse även om ärendet fortfarande pågår._`;
  }

  private buildPurchaseReportedSellerMessage(): string {
    return `# Köparen har meddelat att något inte stämmer med varan. Utbetalningen är därför pausad under tiden ärendet pågår.

_Vill du lämna ett omdöme redan nu? Du kan recensera din upplevelse, även om ärendet fortfarande pågår._`;
  }

  private buildSupportErrandConcludedMessage(decision: string): string {
    return `# Kundsupport har nu avslutat ärendet.


# Vi har granskat allt material och fattat ett beslut utifrån informationen som skickats in.


# Beslut: ${decision}.


# Har du frågor eller funderingar? Vänligen kontakta kundtjänst.`;
  }

  private buildPurchaseAbortedByBuyerBuyerMessage(isFree: boolean): string {
    return isFree
      ? `# Du har valt att avbryta affären.`
      : `# Du har valt att avbryta köpet.


# Köpet är nu avbrutet och dina pengar återbetalas automatiskt.`;
  }

  private buildPurchaseAbortedBySellerBuyerMessage(isFree: boolean): string {
    return isFree
      ? `# Säljaren har valt att avbryta affären.`
      : `# Säljaren har valt att avbryta köpet.


# Köpet är nu avbrutet och dina pengar har återbetalats.`;
  }

  private buildPurchaseAbortedByBuyerSellerMessage(isFree: boolean): string {
    return isFree
      ? `# Köparen har valt att avbryta affären.`
      : `# Köparen har valt att avbryta köpet.


# Annonsen är nu aktiv och tillgänglig för nya köpare.`;
  }

  private buildPurchaseAbortedBySellerSellerMessage(isFree: boolean): string {
    return isFree
      ? `# Du har valt att avbryta affären.`
      : `# Köpet är nu avbrutet och köparens pengar har återbetalats.


# Annonsen är nu aktiv och tillgänglig för nya köpare.`;
  }

  private buildLateShippingDropOffBuyerMessage(): string {
    return `# Säljaren lämnade inte in paketet i tid.


# Köpet är nu avbrutet och dina pengar har återbetalats.`;
  }

  private buildLateShippingDropOffSellerMessage(): string {
    return `# Du lämnade inte in paketet i tid.


# Köpet är nu avbrutet och köparens pengar har återbetalats.`;
  }

  // ─── Public send methods ─────────────────────────────────────────────────────

  async purchaseWithHandoffBuyer(
    buyer: User,
    seller: User,
    product: Product,
    purchase: Purchase,
    isFree = false,
  ) {
    await this.message({
      productId: product.id,
      purchaseId: purchase.id,
      buyerId: buyer.id,
      receiverId: buyer.id,
      message: this.buildPurchaseWithHandoffBuyerMessage(
        buyer.email,
        transportationWording[purchase.transportationMethod].form1,
        purchase.paymentAcceptedAt,
        isFree,
      ),
    });
  }

  async purchaseWithHandoffSeller(
    buyer: User,
    seller: User,
    product: Product,
    purchase: Purchase,
    isFree = false,
  ) {
    await this.message({
      productId: product.id,
      purchaseId: purchase.id,
      buyerId: buyer.id,
      receiverId: seller.id,
      message: this.buildPurchaseWithHandoffSellerMessage(
        transportationWording[purchase.transportationMethod].form1,
        purchase.paymentAcceptedAt,
        isFree,
      ),
    });
  }

  async sellerRespondedBuyer(
    buyer: User,
    seller: User,
    product: Product,
    responseDate: Date,
    purchase: Purchase,
    isFree = false,
  ) {
    await this.message({
      productId: product.id,
      purchaseId: purchase.id,
      buyerId: buyer.id,
      receiverId: buyer.id,
      message: this.buildSellerRespondedBuyerMessage(
        this.isDelivery(purchase),
        responseDate,
        isFree,
      ),
    });
  }

  async sellerRespondedSeller(
    buyer: User,
    seller: User,
    product: Product,
    responseDate: Date,
    purchase: Purchase,
    isFree = false,
  ) {
    await this.message({
      productId: product.id,
      purchaseId: purchase.id,
      buyerId: buyer.id,
      receiverId: seller.id,
      message: this.buildSellerRespondedSellerMessage(
        this.isDelivery(purchase),
        responseDate,
        isFree,
      ),
    });
  }

  async handoffConfirmedBuyer(
    buyer: User,
    seller: User,
    product: Product,
    purchase: Purchase,
  ) {
    await this.message({
      productId: product.id,
      purchaseId: purchase.id,
      buyerId: buyer.id,
      receiverId: buyer.id,
      message: this.buildHandoffConfirmedBuyerMessage(),
    });
  }

  async handoffConfirmedSeller(
    buyer: User,
    seller: User,
    product: Product,
    purchase: Purchase,
  ) {
    await this.message({
      productId: product.id,
      purchaseId: purchase.id,
      buyerId: buyer.id,
      receiverId: seller.id,
      message: this.buildHandoffConfirmedSellerMessage(),
    });
  }

  async purchaseWithShippingBuyer(
    buyer: User,
    seller: User,
    product: Product,
    purchase: Purchase,
  ) {
    await this.message({
      productId: product.id,
      purchaseId: purchase.id,
      buyerId: buyer.id,
      receiverId: buyer.id,
      message: this.buildPurchaseWithShippingBuyerMessage(
        buyer.email,
        seller.username,
        purchase.paymentAcceptedAt,
      ),
    });
  }

  async purchaseWithShippingSeller(
    buyer: User,
    seller: User,
    product: Product,
    purchase: Purchase,
    provider: ShippingProviderEnum,
  ) {
    await this.message({
      productId: product.id,
      purchaseId: purchase.id,
      buyerId: buyer.id,
      receiverId: seller.id,
      message: this.buildPurchaseWithShippingSellerMessage(
        purchase.paymentAcceptedAt,
        provider,
      ),
    });
  }

  async shipmentArrived(
    buyer: User,
    seller: User,
    product: Product,
    purchase: Purchase,
    provider: ShippingProviderEnum,
  ) {
    await this.message({
      productId: product.id,
      purchaseId: purchase.id,
      buyerId: buyer.id,
      receiverId: buyer.id,
      message: this.buildShipmentArrivedMessage(
        purchase.shipmentDeliveredAt,
        provider,
      ),
    });
  }

  async shipmentDroppedOffSeller(
    buyer: User,
    seller: User,
    product: Product,
    purchase: Purchase,
  ) {
    await this.message({
      productId: product.id,
      purchaseId: purchase.id,
      buyerId: buyer.id,
      receiverId: seller.id,
      message: this.buildShipmentDroppedOffSellerMessage(),
    });
  }

  async shipmentDroppedOffBuyer(
    buyer: User,
    seller: User,
    product: Product,
    purchase: Purchase,
  ) {
    await this.message({
      productId: product.id,
      purchaseId: purchase.id,
      buyerId: buyer.id,
      receiverId: buyer.id,
      message: this.buildShipmentDroppedOffBuyerMessage(),
    });
  }

  async shipmentDeliveredBuyer(
    buyer: User,
    product: Product,
    purchase: Purchase,
  ) {
    await this.message({
      productId: product.id,
      purchaseId: purchase.id,
      buyerId: buyer.id,
      receiverId: buyer.id,
      message: this.buildShipmentDeliveredBuyerMessage(),
    });
  }

  async shipmentDeliveredSeller(
    buyer: User,
    seller: User,
    product: Product,
    purchase: Purchase,
  ) {
    await this.message({
      productId: product.id,
      purchaseId: purchase.id,
      buyerId: buyer.id,
      receiverId: seller.id,
      message: this.buildShipmentDeliveredSellerMessage(),
    });
  }

  async purchaseSuccessBuyer(
    buyer: User,
    product: Product,
    purchase: Purchase,
    isFree = false,
  ) {
    await this.message({
      productId: product.id,
      purchaseId: purchase.id,
      buyerId: buyer.id,
      receiverId: buyer.id,
      message: this.buildPurchaseSuccessBuyerMessage(isFree),
    });
  }

  async purchaseSuccessSeller(
    buyer: User,
    seller: User,
    product: Product,
    purchase: Purchase,
    isFree = false,
    firstSale = false,
  ) {
    await this.message({
      productId: product.id,
      purchaseId: purchase.id,
      buyerId: buyer.id,
      receiverId: seller.id,
      message: this.buildPurchaseSuccessSellerMessage(isFree, firstSale),
    });
  }

  async purchaseReportedBuyer(
    buyer: User,
    seller: User,
    product: Product,
    purchase: Purchase,
  ) {
    await this.message({
      productId: product.id,
      purchaseId: purchase.id,
      buyerId: buyer.id,
      receiverId: buyer.id,
      message: this.buildPurchaseReportedBuyerMessage(),
    });
  }

  async purchaseReportedSeller(
    buyer: User,
    seller: User,
    product: Product,
    purchase: Purchase,
  ) {
    await this.message({
      productId: product.id,
      purchaseId: purchase.id,
      buyerId: buyer.id,
      receiverId: seller.id,
      message: this.buildPurchaseReportedSellerMessage(),
    });
  }

  async supportErrandConcludedBuyer(
    buyer: User,
    seller: User,
    product: Product,
    purchase: Purchase,
    decision: string,
  ) {
    await this.message({
      productId: product.id,
      purchaseId: purchase.id,
      buyerId: buyer.id,
      receiverId: buyer.id,
      message: this.buildSupportErrandConcludedMessage(decision),
    });
  }

  async supportErrandConcludedSeller(
    buyer: User,
    seller: User,
    product: Product,
    purchase: Purchase,
    decision: string,
  ) {
    await this.message({
      productId: product.id,
      purchaseId: purchase.id,
      buyerId: buyer.id,
      receiverId: seller.id,
      message: this.buildSupportErrandConcludedMessage(decision),
    });
  }

  async purchaseAbortedByBuyerBuyer(
    buyer: User,
    seller: User,
    product: Product,
    purchase: Purchase,
    isFree = false,
  ) {
    await this.message({
      productId: product.id,
      purchaseId: purchase.id,
      buyerId: buyer.id,
      receiverId: buyer.id,
      message: this.buildPurchaseAbortedByBuyerBuyerMessage(isFree),
    });
  }

  async purchaseAbortedBySellerBuyer(
    buyer: User,
    seller: User,
    product: Product,
    purchase: Purchase,
    isFree = false,
  ) {
    await this.message({
      productId: product.id,
      purchaseId: purchase.id,
      buyerId: buyer.id,
      receiverId: buyer.id,
      message: this.buildPurchaseAbortedBySellerBuyerMessage(isFree),
    });
  }

  async purchaseAbortedByBuyerSeller(
    buyer: User,
    seller: User,
    product: Product,
    purchase: Purchase,
    isFree = false,
  ) {
    await this.message({
      productId: product.id,
      purchaseId: purchase.id,
      buyerId: buyer.id,
      receiverId: seller.id,
      message: this.buildPurchaseAbortedByBuyerSellerMessage(isFree),
    });
  }

  async purchaseAbortedBySellerSeller(
    buyer: User,
    seller: User,
    product: Product,
    purchase: Purchase,
    isFree = false,
  ) {
    await this.message({
      productId: product.id,
      purchaseId: purchase.id,
      buyerId: buyer.id,
      receiverId: seller.id,
      message: this.buildPurchaseAbortedBySellerSellerMessage(isFree),
    });
  }

  async lateShippingDropOffBuyer(
    buyer: User,
    seller: User,
    product: Product,
    purchase: Purchase,
  ) {
    await this.message({
      productId: product.id,
      purchaseId: purchase.id,
      buyerId: buyer.id,
      receiverId: buyer.id,
      message: this.buildLateShippingDropOffBuyerMessage(),
    });
  }

  async lateShippingDropOffSeller(
    buyer: User,
    seller: User,
    product: Product,
    purchase: Purchase,
  ) {
    await this.message({
      productId: product.id,
      purchaseId: purchase.id,
      buyerId: buyer.id,
      receiverId: seller.id,
      message: this.buildLateShippingDropOffSellerMessage(),
    });
  }

  // ─── CMS preview ─────────────────────────────────────────────────────────────

  cmsPreviewSystemMessage(options: CmsPreviewSystemMessageOptions): string {
    const {
      step,
      role,
      transportation = TransportationEnum.SHIPPING,
      isFree = false,
      firstSale = false,
      provider = ShippingProviderEnum.DHL,
      decision = '[beslut]',
    } = options;

    const now = new Date();
    const isDelivery = transportation === TransportationEnum.DELIVERY;
    const transportWord = transportationWording[transportation].form1;

    let message: string;

    if (step === SystemMessageStepEnum.PURCHASE_INITIATED) {
      if (transportation === TransportationEnum.SHIPPING) {
        message =
          role === SystemMessageRoleEnum.BUYER
            ? this.buildPurchaseWithShippingBuyerMessage(
                'koper@example.com',
                'Säljaren',
                now,
              )
            : this.buildPurchaseWithShippingSellerMessage(now, provider);
      } else {
        message =
          role === SystemMessageRoleEnum.BUYER
            ? this.buildPurchaseWithHandoffBuyerMessage(
                'koper@example.com',
                transportWord,
                now,
                isFree,
              )
            : this.buildPurchaseWithHandoffSellerMessage(
                transportWord,
                now,
                isFree,
              );
      }
    } else if (step === SystemMessageStepEnum.SELLER_RESPONDED) {
      message =
        role === SystemMessageRoleEnum.BUYER
          ? this.buildSellerRespondedBuyerMessage(isDelivery, now, isFree)
          : this.buildSellerRespondedSellerMessage(isDelivery, now, isFree);
    } else if (step === SystemMessageStepEnum.HANDOFF_CONFIRMED) {
      message =
        role === SystemMessageRoleEnum.BUYER
          ? this.buildHandoffConfirmedBuyerMessage()
          : this.buildHandoffConfirmedSellerMessage();
    } else if (step === SystemMessageStepEnum.SHIPMENT_DROPPED_OFF) {
      message =
        role === SystemMessageRoleEnum.BUYER
          ? this.buildShipmentDroppedOffBuyerMessage()
          : this.buildShipmentDroppedOffSellerMessage();
    } else if (step === SystemMessageStepEnum.SHIPMENT_ARRIVED) {
      message = this.buildShipmentArrivedMessage(now, provider);
    } else if (step === SystemMessageStepEnum.SHIPMENT_DELIVERED) {
      message =
        role === SystemMessageRoleEnum.BUYER
          ? this.buildShipmentDeliveredBuyerMessage()
          : this.buildShipmentDeliveredSellerMessage();
    } else if (step === SystemMessageStepEnum.PURCHASE_SUCCESS) {
      message =
        role === SystemMessageRoleEnum.BUYER
          ? this.buildPurchaseSuccessBuyerMessage(isFree)
          : this.buildPurchaseSuccessSellerMessage(isFree, firstSale);
    } else if (step === SystemMessageStepEnum.PURCHASE_REPORTED) {
      message =
        role === SystemMessageRoleEnum.BUYER
          ? this.buildPurchaseReportedBuyerMessage()
          : this.buildPurchaseReportedSellerMessage();
    } else if (step === SystemMessageStepEnum.SUPPORT_CONCLUDED) {
      message = this.buildSupportErrandConcludedMessage(decision);
    } else if (step === SystemMessageStepEnum.PURCHASE_ABORTED_BY_BUYER) {
      message =
        role === SystemMessageRoleEnum.BUYER
          ? this.buildPurchaseAbortedByBuyerBuyerMessage(isFree)
          : this.buildPurchaseAbortedByBuyerSellerMessage(isFree);
    } else if (step === SystemMessageStepEnum.PURCHASE_ABORTED_BY_SELLER) {
      message =
        role === SystemMessageRoleEnum.BUYER
          ? this.buildPurchaseAbortedBySellerBuyerMessage(isFree)
          : this.buildPurchaseAbortedBySellerSellerMessage(isFree);
    } else if (step === SystemMessageStepEnum.LATE_SHIPPING_DROP_OFF) {
      message =
        role === SystemMessageRoleEnum.BUYER
          ? this.buildLateShippingDropOffBuyerMessage()
          : this.buildLateShippingDropOffSellerMessage();
    } else {
      return 'Ingen preview tillgänglig för denna kombination.';
    }

    return this.renderDateTags(message);
  }

  // ─── Private helpers ──────────────────────────────────────────────────────────

  private isDelivery(purchase: Purchase) {
    return purchase.transportationMethod === TransportationEnum.DELIVERY;
  }

  private tradeWording(isFree: boolean) {
    return tradeWording[isFree ? 'free' : 'notFree'];
  }
}
