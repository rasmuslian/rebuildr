import { AbilityBuilder, createMongoAbility } from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { Product } from 'src/entities/product.entity';
import { User, UserRoleEnum } from 'src/entities/user.entity';

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User) {
    const { can, cannot, build } = new AbilityBuilder(createMongoAbility);
    const isAdmin = user.role === UserRoleEnum.ADMIN;

    //Product
    can('create', Product);
    can('read', Product);
    if (!isAdmin) {
      can('update', Product, { userId: user.id });
      cannot('update', Product, ['hiddenReason']);
    }
    if (isAdmin) {
      can('update', Product);
      can('delete', Product);
    }
    can('delete', Product, { userId: user.id });

    return build();
  }
}
