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
  ABOUT_REVIEWS = 'ABOUT_REVIEW',
}
registerEnumType(ChatActionEnum, { name: 'ChatActionEnum' });

@Injectable()
export class SystemMessagesService {
  constructor(
    @Inject(forwardRef(() => MessageService))
    private messageService: MessageService,
  ) {}

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

  async purchaseWithHandoffBuyer(
    buyer: User,
    seller: User,
    product: Product,
    purchase: Purchase,
    isFree = false,
  ) {
    const message = isFree
      ? `# Du har köpt varan för 0 kr ([](<date::D MMMM::${purchase.paymentAcceptedAt}>)) och vi har skickat en bekräftelse till ${buyer.email}.
    

# Nu är nästa steg att planera ${transportationWording[purchase.transportationMethod].form1}! Börja gärna med att skriva ett meddelande här i chatten för att bestämma tid och plats med säljaren.

_Om säljaren inte svarar inom 24 timmar avbryts affären automatiskt._`
      : `# Du har betalat ([](<date::D MMMM::${purchase.paymentAcceptedAt}>)) och vi har skickat en bekräftelse till ${buyer.email}
    

# Nu är nästa steg att planera ${transportationWording[purchase.transportationMethod].form1}! Börja gärna med att skriva ett meddelande här i chatten för att bestämma tid och plats med säljaren.

_Om säljaren inte svarar inom 24 timmar får du automatiskt pengarna tillbaka._`;

    await this.message({
      productId: product.id,
      purchaseId: purchase.id,
      buyerId: buyer.id,
      receiverId: buyer.id,
      message,
    });
  }

  async purchaseWithHandoffSeller(
    buyer: User,
    seller: User,
    product: Product,
    purchase: Purchase,
    isFree = false,
  ) {
    const message = isFree
      ? `# Du har sålt varan för 0kr! Svara köparen i chatten och bestäm tid och plats för ${transportationWording[purchase.transportationMethod].form1}.
    
    
# Du behöver svara inom 24h - [](<date::D MMMM kl. HH:mm::${dayjs(purchase.paymentAcceptedAt).add(1, 'day').toDate()}>), annars avbryts köpet automatiskt och köparen får tillbaka sina pengar.`
      : `# Du har sålt en vara! Svara köparen i chatten och bestäm tid och plats för ${transportationWording[purchase.transportationMethod].form1}.
    
    
# Du behöver svara inom 24h - [](<date::D MMMM kl. HH:mm::${dayjs(purchase.paymentAcceptedAt).add(1, 'day').toDate()}>), annars avbryts köpet automatiskt och köparen får tillbaka sina pengar.`;
    await this.message({
      productId: product.id,
      purchaseId: purchase.id,
      buyerId: buyer.id,
      receiverId: seller.id,
      message,
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
    const message = this.isDelivery(purchase)
      ? `# Hemtransporten sker senast [](<date::D MMMM::${dayjs(responseDate).add(7, 'day').toDate()}>), annars avbryts ${!isFree ? 'affären automatiskt' : 'köpet och du får tillbaka dina pengar'}.
    
    
_Jag vill ${this.formatLink(`avbryta ${this.tradeWording(isFree).form1}`, ChatActionEnum.ABORT)}._`
      : `# Nu är det dags att åka och hämta din vara!
    
    
# Hämta senast [](<date::D MMMM::${dayjs(responseDate).add(7, 'day').toDate()}>), annars avbryts ${!isFree ? 'affären automatiskt' : 'köpet och du får tillbaka dina pengar'}.


_Jag vill ${this.formatLink(`avbryta ${this.tradeWording(isFree).form1}`, ChatActionEnum.ABORT)}._`;

    await this.message({
      productId: product.id,
      purchaseId: purchase.id,
      buyerId: buyer.id,
      receiverId: buyer.id,
      message,
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
    const message = this.isDelivery(purchase)
      ? `# Åk och leverera senast [](<date::D MMMM::${dayjs(responseDate).add(7, 'day').toDate()}>).
    

# Kom ihåg att markera varan som överlämnad när överlämningen är klar, ${isFree ? 'så att ni båda kan lämna omdöme' : 'så kan vi betala ut pengarna till dig'}.

_Ångrat dig? Inga problem! Du kan fortfarande ${this.formatLink(`avbryta ${this.tradeWording(isFree).form1}`, ChatActionEnum.ABORT)}._`
      : `# Köparen hämtar varan senast [](<date::D MMMM::${dayjs(responseDate).add(7, 'day').toDate()}>).
    

# Kom ihåg att markera varan som överlämnad när överlämningen är klar, ${isFree ? 'så att ni båda kan lämna omdöme' : 'så kan vi betala ut pengarna till dig'}.

_Ångrat dig? Inga problem! Du kan fortfarande ${this.formatLink(`avbryta ${this.tradeWording(isFree).form1}`, ChatActionEnum.ABORT)}._`;

    await this.message({
      productId: product.id,
      purchaseId: purchase.id,
      buyerId: buyer.id,
      receiverId: seller.id,
      message,
    });
  }

  async handoffConfirmedBuyer(
    buyer: User,
    seller: User,
    product: Product,
    purchase: Purchase,
  ) {
    const message = `# Överlämningen är bekräftad!


# Vänligen godkänn varan nu på plats.
    

# Godkänns den inte nu sker det automatiskt efter 48 timmar.

_Stämmer inte varan med annonsen? ${this.formatLink('Rapportera problem med köp', ChatActionEnum.REPORT)}_`;

    await this.message({
      productId: product.id,
      purchaseId: purchase.id,
      buyerId: buyer.id,
      receiverId: buyer.id,
      message,
    });
  }

  async handoffConfirmedSeller(
    buyer: User,
    seller: User,
    product: Product,
    purchase: Purchase,
  ) {
    const message = `# Överlämningen är nu bekräftad, snart får du betalt!
    

# Påminn nu köparen om att "Godkänna varan" i meddelandefältet. 
Glömmer ni detta sker det automatiskt efter 48h.


# Efter att köparen godkänt - betalar vi ut pengarna till dig.`;

    await this.message({
      productId: product.id,
      purchaseId: purchase.id,
      buyerId: buyer.id,
      receiverId: seller.id,
      message,
    });
  }

  async purchaseWithShippingBuyer(
    buyer: User,
    seller: User,
    product: Product,
    purchase: Purchase,
  ) {
    const message = `# Du har betalat ([](<date::D MMMM::${purchase.paymentAcceptedAt}>)) och vi har skickat en bekräftelse till ${buyer.email}.


# ${seller.username} skickar din vara senast den [](<date::D MMMM::${dayjs(purchase.paymentAcceptedAt).add(7, 'day').toDate()}>).`;
    await this.message({
      productId: product.id,
      purchaseId: purchase.id,
      buyerId: buyer.id,
      receiverId: buyer.id,
      message,
    });
  }
  async purchaseWithShippingSeller(
    buyer: User,
    seller: User,
    product: Product,
    purchase: Purchase,
    provider: ShippingProviderEnum,
  ) {
    const message = `# Du har sålt en vara! Lämna in paketet senast den [](<date::D MMMM::${dayjs(purchase.paymentAcceptedAt).add(7, 'day').toDate()}>).


# Visa din QR-kod hos valfritt ${provider === ShippingProviderEnum.DHL ? 'DHL' : 'PostNord'}-ombud. Ombudet skriver ut fraktsedeln åt dig, så du behöver inte förbereda något hemma. 

_Du kan ${this.formatLink('avbryta innan paketet skickas', ChatActionEnum.ABORT)}._`;
    await this.message({
      productId: product.id,
      purchaseId: purchase.id,
      buyerId: buyer.id,
      receiverId: seller.id,
      message,
    });
  }

  async shipmentArrived(
    buyer: User,
    seller: User,
    product: Product,
    purchase: Purchase,
    provider: ShippingProviderEnum,
  ) {
    const message = `# Ditt paket är framme!


# Hämta ut det hos ombud senast [](<date::D MMMM::${dayjs(purchase.shipmentDeliveredAt).add(7, 'days').toDate()}>).


# Du får en kod från ${provider === ShippingProviderEnum.DHL ? 'DHL' : 'PostNord'} via sms eller mejl.`;

    await this.message({
      productId: product.id,
      purchaseId: purchase.id,
      buyerId: buyer.id,
      receiverId: buyer.id,
      message,
    });
  }

  async shipmentDroppedOffSeller(
    buyer: User,
    seller: User,
    product: Product,
    purchase: Purchase,
  ) {
    const message = `# Paketet är inlämnat och på väg till köparen!


# Vi hör av oss så snart köparen har hämtat ut paketet.`;
    await this.message({
      productId: product.id,
      purchaseId: purchase.id,
      buyerId: buyer.id,
      receiverId: seller.id,
      message,
    });
  }
  async shipmentDroppedOffBuyer(
    buyer: User,
    seller: User,
    product: Product,
    purchase: Purchase,
  ) {
    const message = `# Nu har paketet lämnats in och är på väg till dig.`;
    await this.message({
      productId: product.id,
      purchaseId: purchase.id,
      buyerId: buyer.id,
      receiverId: buyer.id,
      message,
    });
  }

  async shipmentDeliveredBuyer(
    buyer: User,
    product: Product,
    purchase: Purchase,
  ) {
    const message = `# Du har hämtat upp ditt paket.


# Godkänn din vara snarast möjligt - efter 48 timmar godkänns den automatiskt.

_Stämmer inte varan överens med annonsen? ${this.formatLink('Rapportera problem med köp', ChatActionEnum.REPORT)}_`;

    await this.message({
      productId: product.id,
      purchaseId: purchase.id,
      buyerId: buyer.id,
      receiverId: buyer.id,
      message,
    });
  }

  async shipmentDeliveredSeller(
    buyer: User,
    seller: User,
    product: Product,
    purchase: Purchase,
  ) {
    const message = `# Köparen har hämtat ut paketet.

    
# Nu har köparen 48 timmar på sig att kontrollera att varan stämmer med annonsen innan köpet godkänns automatiskt.`;

    await this.message({
      productId: product.id,
      purchaseId: purchase.id,
      buyerId: buyer.id,
      receiverId: seller.id,
      message,
    });
  }

  async purchaseSuccessBuyer(
    buyer: User,
    product: Product,
    purchase: Purchase,
    isFree = false,
  ) {
    const message = isFree
      ? `# Överlämningen är nu bekräftad och allting är klart!
    

# Nu kvarstår bara att lämna omdöme på säljaren!

_${this.formatLink('Om omdömen på Rebuildr', ChatActionEnum.ABOUT_REVIEWS)}_
`
      : `# Köpet är klart!
    

# Du har godkänt varan och pengarna har betalats ut till säljaren.


# Nu kvarstår bara att lämna omdöme på säljaren!

_${this.formatLink('Om omdömen på Rebuildr', ChatActionEnum.ABOUT_REVIEWS)}_`;

    await this.message({
      productId: product.id,
      purchaseId: purchase.id,
      buyerId: buyer.id,
      receiverId: buyer.id,
      message,
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
    const message = isFree
      ? `# Överlämningen är nu bekräftad och allting är klart!
    

# Nu kan du passa på att lämna ett omdöme om köparen.`
      : `# Köparen har godkänt varan!
    

# ${firstSale ? 'Eftersom det här är din första försäljning kan det ta upp till 7 vardagar innan pengarna finns på plats. Därefter tar det normalt 1-3 bankdagar.' : 'Pengarna beräknas nå dig inom 1-3 bankdagar.'}


# Nu kvarstår bara att lämna omdöme på köparen.

_${this.formatLink('Om omdömen på Rebuildr', ChatActionEnum.ABOUT_REVIEWS)}_`;

    await this.message({
      productId: product.id,
      purchaseId: purchase.id,
      buyerId: buyer.id,
      receiverId: seller.id,
      message,
    });
  }

  async purchaseReportedBuyer(
    buyer: User,
    seller: User,
    product: Product,
    purchase: Purchase,
  ) {
    const message = `# Du har meddelat att något inte stämmer med varan.
    
    
# Utbetalningen till säljaren är pausad under tiden ärendet pågår.

_Vill du lämna ett omdöme redan nu? Du kan recensera din upplevelse även om ärendet fortfarande pågår._`;

    await this.message({
      productId: product.id,
      purchaseId: purchase.id,
      buyerId: buyer.id,
      receiverId: buyer.id,
      message,
    });
  }

  async purchaseReportedSeller(
    buyer: User,
    seller: User,
    product: Product,
    purchase: Purchase,
  ) {
    const message = `# Köparen har meddelat att något inte stämmer med varan. Utbetalningen är därför pausad under tiden ärendet pågår.
    
_Vill du lämna ett omdöme redan nu? Du kan recensera din upplevelse, även om ärendet fortfarande pågår._`;

    await this.message({
      productId: product.id,
      purchaseId: purchase.id,
      buyerId: buyer.id,
      receiverId: seller.id,
      message,
    });
  }

  async supportErrandConcludedBuyer(
    buyer: User,
    seller: User,
    product: Product,
    purchase: Purchase,
    decision: string,
  ) {
    const message = `# Kundsupport har nu avslutat ärendet.
    
    
# Vi har granskat allt material och fattat ett beslut utifrån informationen som skickats in.


# Beslut: ${decision}.


# Har du frågor eller funderingar? Vänligen kontakta kundtjänst.`;

    await this.message({
      productId: product.id,
      purchaseId: purchase.id,
      buyerId: buyer.id,
      receiverId: buyer.id,
      message,
    });
  }
  async supportErrandConcludedSeller(
    buyer: User,
    seller: User,
    product: Product,
    purchase: Purchase,
    decision: string,
  ) {
    const message = `# Kundsupport har nu avslutat ärendet.
    
    
# Vi har granskat allt material och fattat ett beslut utifrån informationen som skickats in.


# Beslut: ${decision}.


# Har du frågor eller funderingar? Vänligen kontakta kundtjänst.`;

    await this.message({
      productId: product.id,
      purchaseId: purchase.id,
      buyerId: buyer.id,
      receiverId: seller.id,
      message,
    });
  }

  async purchaseAbortedByBuyerBuyer(
    buyer: User,
    seller: User,
    product: Product,
    purchase: Purchase,
    isFree = false,
  ) {
    const message = isFree
      ? `# Du har valt att avbryta affären.`
      : `# Du har valt att avbryta köpet.
    

# Köpet är nu avbrutet och dina pengar återbetalas automatiskt.`;

    await this.message({
      productId: product.id,
      purchaseId: purchase.id,
      buyerId: buyer.id,
      receiverId: buyer.id,
      message,
    });
  }

  async purchaseAbortedBySellerBuyer(
    buyer: User,
    seller: User,
    product: Product,
    purchase: Purchase,
    isFree = false,
  ) {
    const message = isFree
      ? `# Säljaren har valt att avbryta affären.`
      : `# Säljaren har valt att avbryta köpet.
    

# Köpet är nu avbrutet och dina pengar har återbetalats.`;

    await this.message({
      productId: product.id,
      purchaseId: purchase.id,
      buyerId: buyer.id,
      receiverId: buyer.id,
      message,
    });
  }

  async purchaseAbortedByBuyerSeller(
    buyer: User,
    seller: User,
    product: Product,
    purchase: Purchase,
    isFree = false,
  ) {
    const message = isFree
      ? `# Köparen har valt att avbryta affären.`
      : `# Köparen har valt att avbryta köpet.
    

# Annonsen är nu aktiv och tillgänglig för nya köpare.`;

    await this.message({
      productId: product.id,
      purchaseId: purchase.id,
      buyerId: buyer.id,
      receiverId: seller.id,
      message,
    });
  }
  async purchaseAbortedBySellerSeller(
    buyer: User,
    seller: User,
    product: Product,
    purchase: Purchase,
    isFree = false,
  ) {
    const message = isFree
      ? `# Du har valt att avbryta affären.`
      : `# Köpet är nu avbrutet och köparens pengar har återbetalats.
    

# Annonsen är nu aktiv och tillgänglig för nya köpare.`;

    await this.message({
      productId: product.id,
      purchaseId: purchase.id,
      buyerId: buyer.id,
      receiverId: seller.id,
      message,
    });
  }

  async lateShippingDropOffBuyer(
    buyer: User,
    seller: User,
    product: Product,
    purchase: Purchase,
  ) {
    const message = `# Säljaren lämnade inte in paketet i tid.
    
    
# Köpet är nu avbrutet och dina pengar har återbetalats.`;

    await this.message({
      productId: product.id,
      purchaseId: purchase.id,
      buyerId: buyer.id,
      receiverId: buyer.id,
      message,
    });
  }

  async lateShippingDropOffSeller(
    buyer: User,
    seller: User,
    product: Product,
    purchase: Purchase,
  ) {
    const message = `# Du lämnade inte in paketet i tid.
    
    
# Köpet är nu avbrutet och köparens pengar har återbetalats.`;

    await this.message({
      productId: product.id,
      purchaseId: purchase.id,
      buyerId: buyer.id,
      receiverId: seller.id,
      message,
    });
  }

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
    const buyerEmail = 'koper@example.com';
    const providerName =
      provider === ShippingProviderEnum.DHL ? 'DHL' : 'PostNord';
    const isDelivery = transportation === TransportationEnum.DELIVERY;
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
    const fmtDate = (d: Date) => `${d.getDate()} ${svMonths[d.getMonth()]}`;
    const fmtDateTime = (d: Date) =>
      `${fmtDate(d)} kl. ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    const transportWord = transportationWording[transportation].form1;
    const tradeWord = isFree ? 'affären' : 'köpet';
    const deadline7 = dayjs(now).add(7, 'day').toDate();
    const deadline1day = dayjs(now).add(1, 'day').toDate();

    if (
      step === SystemMessageStepEnum.PURCHASE_INITIATED &&
      role === SystemMessageRoleEnum.BUYER
    ) {
      if (transportation === TransportationEnum.SHIPPING) {
        return `# Du har betalat (${fmtDate(now)}) och vi har skickat en bekräftelse till ${buyerEmail}.\n\n\n# Säljaren skickar din vara senast den ${fmtDate(deadline7)}.\n\n_Ångrat dig? Inga problem! Du kan fortfarande avbryta innan paketet skickas._`;
      }
      return isFree
        ? `# Du har köpt varan för 0 kr (${fmtDate(now)}) och vi har skickat en bekräftelse till ${buyerEmail}.\n\n\n# Nu är nästa steg att planera ${transportWord}! Börja gärna med att skriva ett meddelande här i chatten för att bestämma tid och plats med säljaren.\n\n_Om säljaren inte svarar inom 24 timmar avbryts affären automatiskt._`
        : `# Du har betalat (${fmtDate(now)}) och vi har skickat en bekräftelse till ${buyerEmail}\n\n\n# Nu är nästa steg att planera ${transportWord}! Börja gärna med att skriva ett meddelande här i chatten för att bestämma tid och plats med säljaren.\n\n_Om säljaren inte svarar inom 24 timmar får du automatiskt pengarna tillbaka._`;
    }

    if (
      step === SystemMessageStepEnum.PURCHASE_INITIATED &&
      role === SystemMessageRoleEnum.SELLER
    ) {
      if (transportation === TransportationEnum.SHIPPING) {
        return `# Du har sålt en vara! Lämna in paketet senast den ${fmtDate(deadline7)}.\n\n\n# Visa din QR-kod hos valfritt ${providerName}-ombud. Ombudet skriver ut fraktsedeln åt dig, så du behöver inte förbereda något hemma.\n\n_Ångrat dig? Inga problem! Du kan fortfarande avbryta innan paketet skickas._`;
      }
      return isFree
        ? `# Du har sålt varan för 0kr! Svara köparen i chatten och bestäm tid och plats för ${transportWord}.\n\n\n# Du behöver svara senast ${fmtDateTime(deadline1day)}, annars avbryts köpet automatiskt och köparen får tillbaka sina pengar.`
        : `# Du har sålt en vara! Svara köparen i chatten och bestäm tid och plats för ${transportWord}.\n\n\n# Du behöver svara senast ${fmtDateTime(deadline1day)}, annars avbryts köpet automatiskt och köparen får tillbaka sina pengar.`;
    }

    if (
      step === SystemMessageStepEnum.SELLER_RESPONDED &&
      role === SystemMessageRoleEnum.BUYER
    ) {
      return isDelivery
        ? `# Hemtransporten sker senast ${fmtDate(deadline7)}, annars avbryts ${!isFree ? 'affären automatiskt' : 'köpet och du får tillbaka dina pengar'}.\n\n\n_Ångrat dig? Du kan fortfarande avbryta ${tradeWord} innan dess._`
        : `# Nu är det dags att åka och hämta din vara!\n\n\n# Hämta senast ${fmtDate(deadline7)}, annars avbryts ${!isFree ? 'affären automatiskt' : 'köpet och du får tillbaka dina pengar'}.\n\n\n_Ångrat dig? Du kan fortfarande avbryta ${tradeWord} innan dess._`;
    }

    if (
      step === SystemMessageStepEnum.SELLER_RESPONDED &&
      role === SystemMessageRoleEnum.SELLER
    ) {
      return isDelivery
        ? `# Åk och leverera senast ${fmtDate(deadline7)}.\n\n\n# Kom ihåg att markera varan som överlämnad när överlämningen är klar, ${isFree ? 'så att ni båda kan lämna omdöme' : 'så kan vi betala ut pengarna till dig'}.\n\n_Ångrat dig? Inga problem! Du kan fortfarande avbryta ${tradeWord}._`
        : `# Köparen hämtar varan senast ${fmtDate(deadline7)}.\n\n\n# Kom ihåg att markera varan som överlämnad när överlämningen är klar, ${isFree ? 'så att ni båda kan lämna omdöme' : 'så kan vi betala ut pengarna till dig'}.\n\n_Ångrat dig? Inga problem! Du kan fortfarande avbryta ${tradeWord}._`;
    }

    if (
      step === SystemMessageStepEnum.HANDOFF_CONFIRMED &&
      role === SystemMessageRoleEnum.BUYER
    ) {
      return `# Överlämningen är bekräftad!\n\n\n# Nu har du 48 timmar på dig att kontrollera att allt stämmer med annonsen.\n\n\n# Om allt ser bra ut betalas pengarna automatiskt ut till säljaren.\n\n_Stämmer inte varan med annonsen? Rapportera problem med köp_`;
    }
    if (
      step === SystemMessageStepEnum.HANDOFF_CONFIRMED &&
      role === SystemMessageRoleEnum.SELLER
    ) {
      return `# Överlämningen är nu bekräftad, snart får du betalt!\n\n\n# Köparen har nu 48 timmar på sig att godkänna köpet eller rapportera ett problem.\n\n\n# Om allt ser bra ut betalas pengarna ut automatiskt till ditt konto.`;
    }

    if (
      step === SystemMessageStepEnum.SHIPMENT_DROPPED_OFF &&
      role === SystemMessageRoleEnum.BUYER
    ) {
      return `# Nu har paketet lämnats in och är på väg till dig.`;
    }
    if (
      step === SystemMessageStepEnum.SHIPMENT_DROPPED_OFF &&
      role === SystemMessageRoleEnum.SELLER
    ) {
      return `# Paketet är inlämnat och på väg till köparen!\n\n\n# Vi hör av oss så snart köparen har hämtat ut paketet.`;
    }

    if (step === SystemMessageStepEnum.SHIPMENT_ARRIVED) {
      return `# Ditt paket är framme!\n\n\n# Hämta ut det hos ombud senast ${fmtDate(deadline7)}.\n\n\n# Du får en kod från ${providerName} via sms eller mejl.`;
    }

    if (
      step === SystemMessageStepEnum.SHIPMENT_DELIVERED &&
      role === SystemMessageRoleEnum.BUYER
    ) {
      return `# Du har hämtat upp ditt paket.\n\n\n# Nu har du 48 timmar på dig att se så att varan stämmer överens med annonsen innan den godkänns automatiskt.\n\n_Stämmer inte varan överens med annonsen? Rapportera problem med köp_`;
    }
    if (
      step === SystemMessageStepEnum.SHIPMENT_DELIVERED &&
      role === SystemMessageRoleEnum.SELLER
    ) {
      return `# Köparen har hämtat ut paketet.\n\n\n# Nu har köparen 48 timmar på sig att kontrollera att varan stämmer med annonsen innan köpet godkänns automatiskt.`;
    }

    if (
      step === SystemMessageStepEnum.PURCHASE_SUCCESS &&
      role === SystemMessageRoleEnum.BUYER
    ) {
      return isFree
        ? `# Överlämningen är nu bekräftad och allting är klart!\n\n\n# Nu kan du passa på att lämna ett omdöme om säljaren.`
        : `# Köpet är klart!\n\n\n# Du har godkänt varan och pengarna har betalats ut till säljaren.\n\n\n# Nu kan du passa på att lämna ett omdöme om säljaren.`;
    }
    if (
      step === SystemMessageStepEnum.PURCHASE_SUCCESS &&
      role === SystemMessageRoleEnum.SELLER
    ) {
      return isFree
        ? `# Överlämningen är nu bekräftad och allting är klart!\n\n\n# Nu kan du passa på att lämna ett omdöme om köparen.`
        : `# Köparen har godkänt varan!\n\n\n# ${firstSale ? 'Eftersom det här är din första försäljning kan det ta upp till 7 vardagar innan pengarna finns på plats. Därefter tar det normalt 1-3 bankdagar.' : 'Pengarna beräknas nå dig inom 1-3 bankdagar.'}\n\n\n# Nu kan du passa på att lämna ett omdöme om köparen.`;
    }

    if (
      step === SystemMessageStepEnum.PURCHASE_REPORTED &&
      role === SystemMessageRoleEnum.BUYER
    ) {
      return `# Du har meddelat att något inte stämmer med varan.\n\n\n# Utbetalningen till säljaren är pausad under tiden ärendet pågår.\n\n_Vill du lämna ett omdöme redan nu? Du kan recensera din upplevelse även om ärendet fortfarande pågår._`;
    }
    if (
      step === SystemMessageStepEnum.PURCHASE_REPORTED &&
      role === SystemMessageRoleEnum.SELLER
    ) {
      return `# Köparen har meddelat att något inte stämmer med varan. Utbetalningen är därför pausad under tiden ärendet pågår.\n\n_Vill du lämna ett omdöme redan nu? Du kan recensera din upplevelse, även om ärendet fortfarande pågår._`;
    }

    if (step === SystemMessageStepEnum.SUPPORT_CONCLUDED) {
      return `# Kundsupport har nu avslutat ärendet.\n\n\n# Vi har granskat allt material och fattat ett beslut utifrån informationen som skickats in.\n\n\n# Beslut: ${decision}.\n\n\n# Har du frågor eller funderingar? Vänligen kontakta kundtjänst.`;
    }

    if (
      step === SystemMessageStepEnum.PURCHASE_ABORTED_BY_BUYER &&
      role === SystemMessageRoleEnum.BUYER
    ) {
      return isFree
        ? `# Du har valt att avbryta affären.`
        : `# Du har valt att avbryta köpet.\n\n\n# Köpet är nu avbrutet och dina pengar återbetalas automatiskt.`;
    }
    if (
      step === SystemMessageStepEnum.PURCHASE_ABORTED_BY_BUYER &&
      role === SystemMessageRoleEnum.SELLER
    ) {
      return isFree
        ? `# Köparen har valt att avbryta affären.`
        : `# Köparen har valt att avbryta köpet.\n\n\n# Annonsen är nu aktiv och tillgänglig för nya köpare.`;
    }

    if (
      step === SystemMessageStepEnum.PURCHASE_ABORTED_BY_SELLER &&
      role === SystemMessageRoleEnum.BUYER
    ) {
      return isFree
        ? `# Säljaren har valt att avbryta affären.`
        : `# Säljaren har valt att avbryta köpet.\n\n\n# Köpet är nu avbrutet och dina pengar har återbetalats.`;
    }
    if (
      step === SystemMessageStepEnum.PURCHASE_ABORTED_BY_SELLER &&
      role === SystemMessageRoleEnum.SELLER
    ) {
      return isFree
        ? `# Du har valt att avbryta affären.`
        : `# Köpet är nu avbrutet och köparens pengar har återbetalats.\n\n\n# Annonsen är nu aktiv och tillgänglig för nya köpare.`;
    }

    if (
      step === SystemMessageStepEnum.LATE_SHIPPING_DROP_OFF &&
      role === SystemMessageRoleEnum.BUYER
    ) {
      return `# Säljaren lämnade inte in paketet i tid.\n\n\n# Köpet är nu avbrutet och dina pengar har återbetalats.`;
    }
    if (
      step === SystemMessageStepEnum.LATE_SHIPPING_DROP_OFF &&
      role === SystemMessageRoleEnum.SELLER
    ) {
      return `# Du lämnade inte in paketet i tid.\n\n\n# Köpet är nu avbrutet och köparens pengar har återbetalats.`;
    }

    return 'Ingen preview tillgänglig för denna kombination.';
  }

  private isDelivery(purchase: Purchase) {
    return purchase.transportationMethod === TransportationEnum.DELIVERY;
  }
  private tradeWording(isFree: boolean) {
    return tradeWording[isFree ? 'free' : 'notFree'];
  }
}
