import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Event, EventType } from 'src/entities/event.entity';
import { Product } from 'src/entities/product.entity';
import { Repository } from 'typeorm';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async recordEvent(input: {
    userId: string;
    eventType: EventType;
    value: string;
  }) {
    const event = new Event();

    event.userId = input.userId;
    event.type = input.eventType;
    event.value = input.value;

    await this.eventRepository.save(event);
  }

  async recordProductVisit(productId: string, userId?: string) {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: { category: true },
    });
    if (!product.category) {
      //Events are side effects. Don't throw, just return.
      return;
    }
    await this.recordEvent({
      userId,
      eventType: EventType.CATEGORY_VISIT,
      value: product.category.id,
    });
  }
}
