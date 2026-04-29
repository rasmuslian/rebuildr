import { User } from 'src/entities/user.entity';
import { MessageService, SystemMessageInput } from './message.service';
import { Product } from 'src/entities/product.entity';
import { Purchase, TransportationEnum } from 'src/entities/purchase.entity';
import dayjs from 'dayjs';
import { ShippingProviderEnum } from 'src/entities/shipping-price.entity';
import { forwardRef, Inject, Injectable } from '@nestjs/common';

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

@Injectable()
export class SystemMessagesService {
  constructor(
    @Inject(forwardRef(() => MessageService))
    private messageService: MessageService,
  ) {}

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
    
    
# Du behöver svara senast [](<date::D MMMM kl. HH:mm::${dayjs(purchase.paymentAcceptedAt).add(1, 'day').toDate()}>), annars avbryts köpet automatiskt och köparen får tillbaka sina pengar.`
      : `# Du har sålt en vara! Svara köparen i chatten och bestäm tid och plats för ${transportationWording[purchase.transportationMethod].form1}.
    
    
# Du behöver svara senast [](<date::D MMMM kl. HH:mm::${dayjs(purchase.paymentAcceptedAt).add(1, 'day').toDate()}>), annars avbryts köpet automatiskt och köparen får tillbaka sina pengar.`;
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
    
    
_Ångrat dig? Du kan fortfarande [avbryta ${this.tradeWording(isFree).form1}](ABORT) innan dess._`
      : `# Nu är det dags att åka och hämta din vara!
    
    
# Hämta senast [](<date::D MMMM::${dayjs(responseDate).add(7, 'day').toDate()}>), annars avbryts ${!isFree ? 'affären automatiskt' : 'köpet och du får tillbaka dina pengar'}.


_Ångrat dig? Du kan fortfarande [avbryta ${this.tradeWording(isFree).form1}](ABORT) innan dess._`;

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

_Ångrat dig? Inga problem! Du kan fortfarande [avbryta ${this.tradeWording(isFree).form1}](ABORT)._`
      : `# Köparen hämtar varan senast [](<date::D MMMM::${dayjs(responseDate).add(7, 'day').toDate()}>).
    

# Kom ihåg att markera varan som överlämnad när överlämningen är klar, ${isFree ? 'så att ni båda kan lämna omdöme' : 'så kan vi betala ut pengarna till dig'}.

_Ångrat dig? Inga problem! Du kan fortfarande [avbryta ${this.tradeWording(isFree).form1}](ABORT)._`;

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
    

# Nu har du 48 timmar på dig att kontrollera att allt stämmer med annonsen.


# Om allt ser bra ut betalas pengarna automatiskt ut till säljaren.

_Stämmer inte varan med annonsen? [Rapportera problem med köp](REPORT)_`;

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
    

# Köparen har nu 48 timmar på sig att godkänna köpet eller rapportera ett problem.


# Om allt ser bra ut betalas pengarna ut automatiskt till ditt konto.`;

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


# ${seller.username} skickar din vara senast den [](<date::D MMMM::${dayjs(purchase.paymentAcceptedAt).add(7, 'day').toDate()}>).

_Ångrat dig? Inga problem! Du kan fortfarande [avbryta innan paketet skickas](ABORT)._`;
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

_Ångrat dig? Inga problem! Du kan fortfarande [avbryta innan paketet skickas](ABORT)._`;
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
    seller: User,
    product: Product,
    purchase: Purchase,
  ) {
    const message = `# Du har hämtat upp ditt paket.


# Nu har du 48 timmar på dig att se så att varan stämmer överens med annonsen innan den godkänns automatiskt.

_Stämmer inte varan överens med annonsen? [Rapportera problem med köp](REPORT)_`;

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
    seller: User,
    product: Product,
    purchase: Purchase,
    isFree = false,
  ) {
    const message = isFree
      ? `# Överlämningen är nu bekräftad och allting är klart!
    

# Nu kan du passa på att lämna ett omdöme om säljaren.`
      : `# Köpet är klart!
    

# Du har godkänt varan och pengarna har betalats ut till säljaren.


# Nu kan du passar på att lämna ett omdöme om säljaren.`;

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


# Nu kan du passa på att lämna ett omdöme om köparen.`;

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

  private isDelivery(purchase: Purchase) {
    return purchase.transportationMethod === TransportationEnum.DELIVERY;
  }
  private tradeWording(isFree: boolean) {
    return tradeWording[isFree ? 'free' : 'notFree'];
  }
}
