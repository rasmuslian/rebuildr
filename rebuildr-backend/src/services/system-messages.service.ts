import { User } from 'src/entities/user.entity';
import { MessageService, SystemMessageInput } from './message.service';
import { Product } from 'src/entities/product.entity';
import { Purchase } from 'src/entities/purchase.entity';
import dayjs from 'dayjs';
import { ShippingProviderEnum } from 'src/entities/shipping-price.entity';
import { forwardRef, Inject, Injectable } from '@nestjs/common';

@Injectable()
export class SystemMessagesService {
  constructor(
    @Inject(forwardRef(() => MessageService))
    private messageService: MessageService,
  ) {}

  private async message(input: SystemMessageInput) {
    this.messageService.sendSystemMessage(input);
  }

  async purchaseWithHandoffBuyer(
    buyer: User,
    seller: User,
    product: Product,
    purchase: Purchase,
  ) {
    const message = `# Du har betalat ([](<date::D MMMM::${purchase.paymentAcceptedAt}>)) och vi har skickat en bekräftelse till ${buyer.email}
    

# Nu är nästa steg att planera avhämtningen! Börja gärna med att skriva ett meddelande här i chatten för att bestämma tid och plats med säljaren.

_Om säljaren inte svarar inom 24 timmar får du automatiskt pengarna tillbaka._`;

    await this.message({
      productId: product.id,
      senderId: seller.id,
      receiverId: buyer.id,
      message,
    });
  }

  async purchaseWithHandoffSeller(
    buyer: User,
    seller: User,
    product: Product,
    purchase: Purchase,
  ) {
    const message = `# Du har sålt en vara! Svara köparen i chatten och bestäm tid och plats för avhämtning.
    
    
# Du behöver svara senast [](<date::D MMMM kl. hh:mm::${dayjs(purchase.paymentAcceptedAt).add(1, 'day').toDate()}>), annars avbryts köpet automatiskt och köparen får tillbaka sina pengar.`;
    await this.message({
      productId: product.id,
      senderId: buyer.id,
      receiverId: seller.id,
      message,
    });
  }

  async sellerRespondedBuyer(
    buyer: User,
    seller: User,
    product: Product,
    responseDate: Date,
  ) {
    const message = `# Nu är det dags att åka och hämta din vara!
    
    
# Hämta senast [](<date::D MMMM::${dayjs(responseDate).add(7, 'day').toDate()}>), annars avbryts köpet automatiskt och du får tillbaka dina pengar.


_Ångrat dig? Du kan fortfarande [avbryta köpet](ABORT) innan dess._`;

    await this.message({
      productId: product.id,
      senderId: seller.id,
      receiverId: buyer.id,
      message,
    });
  }

  async sellerRespondedSeller(
    buyer: User,
    seller: User,
    product: Product,
    responseDate: Date,
  ) {
    const message = `# Köparen hämtar varan senast [](<date::D MMMM::${dayjs(responseDate).add(7, 'day').toDate()}>).
    

# Kom ihåg att markera varan som överlämnad när överlämningen är klar, så kan vi betala ut pengarna till dig.

_Ångrat dig? Inga problem! Du kan fortfarande [avbryta köpet](ABORT)._`;

    await this.message({
      productId: product.id,
      senderId: buyer.id,
      receiverId: seller.id,
      message,
    });
  }

  async handoffConfirmedBuyer(buyer: User, seller: User, product: Product) {
    const message = `# Avhämtningen är bekräftad!
    

# Nu har du 48 timmar på dig att kontrollera att allt stämmer med annonsen.


# Om allt ser bra ut betalas pengarna automatiskt ut till säljaren.

_Stämmer inte varan med annonsen? [Rapportera problem med köp](REPORT)_`;

    await this.message({
      productId: product.id,
      senderId: seller.id,
      receiverId: buyer.id,
      message,
    });
  }

  async handoffConfirmedSeller(buyer: User, seller: User, product: Product) {
    const message = `# Överlämningen är nu bekräftad, snart får du betalt!
    

# Köparen har nu 48 timmar på sig att godkänna köpet eller rapportera ett problem.


# Om allt ser bra ut betalas pengarna ut automatiskt till ditt konto.`;

    await this.message({
      productId: product.id,
      senderId: buyer.id,
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
      senderId: seller.id,
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
      senderId: buyer.id,
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
      senderId: seller.id,
      receiverId: buyer.id,
      message,
    });
  }

  async shipmentDroppedOff(buyer: User, seller: User, product: Product) {
    const message = `# Paketet är inlämnat och på väg till köparen!


# Vi hör av oss så snart köparen har hämtat ut paketet.`;
    await this.message({
      productId: product.id,
      senderId: buyer.id,
      receiverId: seller.id,
      message,
    });
  }

  async shipmentDeliveredBuyer(buyer: User, seller: User, product: Product) {
    const message = `# Du har hämtat upp ditt paket.


# Nu har du 48 timmar på dig att se så att varan stämmer överens med annonsen innan den godkänns automatiskt.

_Stämmer inte varan överens med annonsen? [Rapportera problem med köp](REPORT)_`;

    await this.message({
      productId: product.id,
      senderId: seller.id,
      receiverId: buyer.id,
      message,
    });
  }

  async shipmentDeliveredSeller(buyer: User, seller: User, product: Product) {
    const message = `# Köparen har hämtat ut paketet.

    
# Nu har köparen 48 timmar på sig att kontrollera att varan stämmer med annonsen innan köpet godkänns automatiskt.`;

    await this.message({
      productId: product.id,
      senderId: buyer.id,
      receiverId: seller.id,
      message,
    });
  }

  async purchaseSuccessBuyer(buyer: User, seller: User, product: Product) {
    const message = `# Köpet är klart!
    

# Du har godkänt varan och pengarna har betalats ut till säljaren.


# Nu kan du passar på att lämna ett omdöme om säljaren.`;

    await this.message({
      productId: product.id,
      senderId: seller.id,
      receiverId: buyer.id,
      message,
    });
  }

  async purchaseSuccessSeller(buyer: User, seller: User, product: Product) {
    const message = `# Köparen har godkänt varan!
    

# Du har fått betalt och pengarna har betalats ut till ditt utbetalningskonto.


# Nu kan du passa på att lämna ett omdöme om köparen.`;

    await this.message({
      productId: product.id,
      senderId: buyer.id,
      receiverId: seller.id,
      message,
    });
  }

  async productReportedBuyer(buyer: User, seller: User, product: Product) {
    const message = `# Du har meddelat att något inte stämmer med varan.
    
    
# Utbetalningen till säljaren är pausad under tiden ärendet pågår.

_Vill du lämna ett omdöme redan nu? Du kan recensera din upplevelse även om ärendet fortfarande pågår._`;

    await this.message({
      productId: product.id,
      senderId: seller.id,
      receiverId: buyer.id,
      message,
    });
  }

  async productReportedSeller(buyer: User, seller: User, product: Product) {
    const message = `# Köparen har meddelat att något inte stämmer med varan. Utbetalningen är därför pausad under tiden ärendet pågår.
    
_Vill du lämna ett omdöme redan nu? Du kan recensera din upplevelse, även om ärendet fortfarande pågår._`;

    await this.message({
      productId: product.id,
      senderId: buyer.id,
      receiverId: seller.id,
      message,
    });
  }

  async supportErrandConcluded(
    reporter: User,
    otherUser: User,
    product: Product,
    decision: string,
  ) {
    const message = `# Kundsupport har nu avslutat ärendet.
    
    
# Vi har granska allt material och fattat ett beslut utifrån informationen som skickats in.


# Beslut: ${decision}.


# Du hittar mer information i bekräftelsen som har skickats till din e-post.`;

    await this.message({
      productId: product.id,
      senderId: otherUser.id,
      receiverId: reporter.id,
      message,
    });
  }

  async purchaseAbortedByBuyerBuyer(
    buyer: User,
    seller: User,
    product: Product,
  ) {
    const message = `# Du har valt att avbryta köpet.
    

# Köpet är nu avbrutet och dina pengar återbetalas automatiskt.`;

    await this.message({
      productId: product.id,
      senderId: seller.id,
      receiverId: buyer.id,
      message,
    });
  }

  async purchaseAbortedBySellerBuyer(
    buyer: User,
    seller: User,
    product: Product,
  ) {
    const message = `# Säljaren har valt att avbryta köpet.
    

# Köpet är nu avbrutet och dina pengar har återbetalats.`;

    await this.message({
      productId: product.id,
      senderId: seller.id,
      receiverId: buyer.id,
      message,
    });
  }

  async purchaseAbortedByBuyerSeller(
    buyer: User,
    seller: User,
    product: Product,
  ) {
    const message = `# Köparen har valt att avbryta köpet.
    

# Annonsen är nu aktiv och tillgänglig för nya köpare.`;

    await this.message({
      productId: product.id,
      senderId: buyer.id,
      receiverId: seller.id,
      message,
    });
  }
  async purchaseAbortedBySellerSeller(
    buyer: User,
    seller: User,
    product: Product,
  ) {
    const message = `# Köpet är nu avbrutet och köparens pengar har återbetalats.
    

# Annonsen är nu aktiv och tillgänglig för nya köpare.`;

    await this.message({
      productId: product.id,
      senderId: buyer.id,
      receiverId: seller.id,
      message,
    });
  }

  async lateShippingDropOffBuyer(buyer: User, seller: User, product: Product) {
    const message = `# Säljaren lämnade inte in paketet i tid.
    
    
# Köpet är nu avbrutet och dina pengar har återbetalats.`;

    await this.message({
      productId: product.id,
      senderId: seller.id,
      receiverId: buyer.id,
      message,
    });
  }

  async lateShippingDropOffSeller(buyer: User, seller: User, product: Product) {
    const message = `# Du lämnade inte in paketet i tid.
    
    
# Köpet är nu avbrutet och köparens pengar har återbetalats.`;

    await this.message({
      productId: product.id,
      senderId: buyer.id,
      receiverId: seller.id,
      message,
    });
  }
}
