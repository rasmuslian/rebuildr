import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import { AuthedUserType } from 'src/auth/constants';
import { Product } from 'src/entities/product.entity';
import { InventoryService } from 'src/services/inventory.service';

/**
 * AI import for the internal inventory. A logged-in (business) user provides
 * either photos or a product list; the AI creates internal listings in their
 * company's internlager with generated catalogue images. The inventory itself
 * is read via the normal products query (visibility=INTERNAL).
 */
@Resolver(() => Product)
export class InventoryResolver {
  constructor(private inventoryService: InventoryService) {}

  @Mutation(() => [Product])
  @UseGuards(GqlAuthGuard)
  async aiImportInventoryImages(
    @Args('images', { type: () => [String] }) images: string[],
    @CurrentUser() user: AuthedUserType,
  ): Promise<Product[]> {
    return this.inventoryService.aiImportFromImages(images, user.id);
  }

  @Mutation(() => [Product])
  @UseGuards(GqlAuthGuard)
  async aiImportInventoryDocument(
    @Args('file') file: string,
    @Args('mimeType') mimeType: string,
    @CurrentUser() user: AuthedUserType,
  ): Promise<Product[]> {
    return this.inventoryService.aiImportFromDocument(file, mimeType, user.id);
  }
}
