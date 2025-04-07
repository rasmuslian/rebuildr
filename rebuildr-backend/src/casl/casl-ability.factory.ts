import { AbilityBuilder, createMongoAbility } from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { Category } from 'src/entities/category.entity';
import { Product } from 'src/entities/product.entity';
import { Purchase } from 'src/entities/purchase.entity';
import { User, UserRoleEnum } from 'src/entities/user.entity';

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User) {
    const { can, cannot, build } = new AbilityBuilder(createMongoAbility);
    const isAdmin = user.role === UserRoleEnum.ADMIN;

    //User
    if (isAdmin) {
      can('manage', User);
    }
    if (!isAdmin) {
      can('update', User, { id: user.id });
    }

    //Product
    can('create', Product);
    can('read', Product);
    if (!isAdmin) {
      can('update', Product, { sellerId: user.id });
      cannot('update', Product, ['hiddenReason']);
    }
    if (isAdmin) {
      can('update', Product);
      can('delete', Product);
    }
    can('delete', Product, { sellerId: user.id });

    //Category
    if (isAdmin) {
      can('manage', Category);
    }

    //Purchase
    can('update', Purchase, { buyerId: user.id });

    return build();
  }
}
