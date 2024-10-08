import { AbilityBuilder, createMongoAbility } from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { Category } from 'src/entities/category.entity';
import { Product } from 'src/entities/product.entity';
import { RockerUser } from 'src/entities/rocker-user.entity';
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
      can('update', Product, { userId: user.id });
      cannot('update', Product, ['hiddenReason']);
    }
    if (isAdmin) {
      can('update', Product);
      can('delete', Product);
    }
    can('delete', Product, { userId: user.id });

    //Category
    if (isAdmin) {
      can('manage', Category);
    }

    //RockerUser
    can('update', RockerUser, { userId: user.id });
    can('read', RockerUser, { userId: user.id });

    return build();
  }
}
