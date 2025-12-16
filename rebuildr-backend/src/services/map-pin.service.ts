import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product, ProductStatus } from 'src/entities/product.entity';
import { Project } from 'src/entities/project.entity';
import { User } from 'src/entities/user.entity';
import { MapPin, MapPinTypeEnum } from 'src/entities/map-pin.entity';
import { LocationResponse } from 'src/resolvers/geocoding.resolver';
import {
  MapPinResponse,
  ProductMapPinResponse,
} from 'src/resolvers/map-pin.resolver';
import { Repository } from 'typeorm/repository/Repository';
import { GeocodingService } from './geocoding.service';
import { ProductsInput } from 'src/resolvers/product.resolver';
import { ObjectLiteral } from 'typeorm';
import { BadUserInputException } from 'src/exceptions';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class MapPinService {
  constructor(
    @InjectRepository(MapPin)
    private mapPinRepository: Repository<MapPin>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private geocodingService: GeocodingService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async createMany(mapPins: MapPin[]): Promise<MapPin[]> {
    return await this.mapPinRepository.save(mapPins);
  }

  async upsert(mapPin: MapPin): Promise<MapPin> {
    return await this.mapPinRepository.save(mapPin);
  }

  async getOne(id: string): Promise<MapPin | null> {
    return await this.mapPinRepository.findOneBy({ id });
  }

  async removeMapPin(id: string): Promise<MapPin> {
    const mapPin = await this.getOne(id);
    if (!mapPin) {
      throw BadUserInputException();
    }
    return this.mapPinRepository.remove(mapPin);
  }

  async syncApproximateLocations() {
    const batchSize = 100;
    let offset = 0;
    while (true) {
      const projects = await this.projectRepository
        .createQueryBuilder('project')
        .leftJoinAndSelect(
          'project.products',
          'product',
          'product.status = :status',
          { status: ProductStatus.PUBLISHED },
        )
        .leftJoinAndSelect('map_pin', 'mp', 'product."mapPinId" = mp.id')
        .where('project.addressLocation IS NOT NULL')
        .limit(batchSize)
        .offset(offset)
        .getMany();

      if (projects.length === 0) {
        break;
      }

      const updatedProjects = [];
      const updatedProducts = [];
      for (const project of projects) {
        try {
          const location = {
            lat: project.addressLocation.coordinates[0],
            lng: project.addressLocation.coordinates[1],
          };
          const approximateLocation =
            await this.geocodingService.locationToApproximation(location);

          project.mapPin = new MapPin({
            location: {
              type: 'Point',
              coordinates: [approximateLocation.lat, approximateLocation.lng],
            },
            address: approximateLocation.address,
          });
          if (project.mapPinId) {
            project.mapPin.id = project.mapPinId;
          }
          updatedProjects.push(project);
          if (project.products && project.products.length > 0) {
            for (const product of project.products) {
              if (!product.mapPin) {
                product.mapPin = new MapPin({
                  address: approximateLocation.address,
                  location: {
                    type: 'Point',
                    coordinates: [
                      approximateLocation.lat,
                      approximateLocation.lng,
                    ],
                  },
                });
              } else {
                //update existing mapPin
                product.mapPin.address = approximateLocation.address;
                product.addressLocation = {
                  type: 'Point',
                  coordinates: [
                    approximateLocation.lat,
                    approximateLocation.lng,
                  ],
                };
              }
              updatedProducts.push({
                ...product,
                textSearch: undefined,
              });
            }
            await this.productRepository.save(updatedProducts);
          }
        } catch (error) {
          this.logger.error(
            `Failed to approximate location for project ${project.id}: ${error}`,
            {
              projectId: project.id,
            },
          );
        }
      }

      await this.projectRepository.save(updatedProjects);
      offset += batchSize;
    }

    offset = 0;
    while (true) {
      const users = await this.userRepository
        .createQueryBuilder('user')
        .andWhere('user.addressLocation IS NOT NULL')
        .limit(batchSize)
        .offset(offset)
        .getMany();

      if (users.length === 0) {
        break;
      }

      const updatedUsers = [];
      for (const user of users) {
        try {
          const location = {
            lat: user.addressLocation.coordinates[0],
            lng: user.addressLocation.coordinates[1],
          };
          const approximateLocation =
            await this.geocodingService.locationToApproximation(location);

          user.mapPin = new MapPin({
            location: {
              type: 'Point',
              coordinates: [approximateLocation.lat, approximateLocation.lng],
            },
            address: approximateLocation.address,
          });
          if (user.mapPinId) {
            user.mapPin.id = user.mapPinId;
          }
          updatedUsers.push(user);
        } catch (error) {
          this.logger.error(
            `Failed to approximate location for user ${user.id}: ${error}`,
            {
              userId: user.id,
            },
          );
        }
      }

      await this.userRepository.save(updatedUsers);
      offset += batchSize;
    }

    offset = 0;
    while (true) {
      const products = await this.productRepository
        .createQueryBuilder('product')
        .andWhere('product.projectId IS NULL')
        .andWhere('product.status = :status', {
          status: ProductStatus.PUBLISHED,
        })
        .andWhere('product.addressLocation IS NOT NULL')
        .limit(batchSize)
        .offset(offset)
        .getMany();

      if (products.length === 0) {
        break;
      }

      const updatedProducts = [];
      for (const product of products) {
        try {
          const location = {
            lat: product.addressLocation.coordinates[0],
            lng: product.addressLocation.coordinates[1],
          };
          const approximateLocation =
            await this.geocodingService.locationToApproximation(location);

          product.mapPin = new MapPin({
            location: {
              type: 'Point',
              coordinates: [approximateLocation.lat, approximateLocation.lng],
            },
            address: approximateLocation.address,
          });
          if (product.mapPinId) {
            product.mapPin.id = product.mapPinId;
          }
          updatedProducts.push(product);
        } catch (error) {
          this.logger.error(
            `Failed to approximate location for product ${product.id}: ${error}`,
            {
              productId: product.id,
            },
          );
        }
      }

      await this.productRepository.save(updatedProducts);
      offset += batchSize;
    }
  }

  async findMapPinsInBoundingBox(
    southWest: LocationResponse,
    northEast: LocationResponse,
  ): Promise<MapPinResponse> {
    const result = await this.mapPinRepository
      .createQueryBuilder('mapPin')
      .where(
        `mapPin.location && ST_MakeEnvelope(:swLat, :swLng, :neLat, :neLng, 4326)`,
        {
          swLng: southWest.lng,
          swLat: southWest.lat,
          neLng: northEast.lng,
          neLat: northEast.lat,
        },
      )
      .getManyAndCount();
    const [mapPins, total] = result;
    return {
      mapPins,
      total,
    };
  }

  async findProductPinsInRadius(
    point: LocationResponse,
    radius: number,
    productsInput?: ProductsInput,
    zoom?: number,
    offset?: number,
    limit?: number,
  ): Promise<ProductMapPinResponse> {
    const result = await this.getFilteredMapPinsForProducts(
      `mapPin.location && ST_Buffer(ST_SetSRID(ST_MakePoint(:lat, :lng), 4326)::geography, :radius)`,
      {
        lat: point.lat,
        lng: point.lng,
        radius,
      },
      productsInput,
      zoom,
      offset,
      limit,
    );
    return result;
  }

  async findProductPinsInBoundingBox(
    southWest: LocationResponse,
    northEast: LocationResponse,
    productsInput?: ProductsInput,
    zoom?: number,
    offset?: number,
    limit?: number,
  ): Promise<ProductMapPinResponse> {
    const result = await this.getFilteredMapPinsForProducts(
      `mapPin.location && ST_MakeEnvelope(:swLat, :swLng, :neLat, :neLng, 4326)`,
      {
        swLng: southWest.lng,
        swLat: southWest.lat,
        neLng: northEast.lng,
        neLat: northEast.lat,
      },
      productsInput,
      zoom,
      offset,
      limit,
    );
    return result;
  }

  private async getFilteredMapPinsForProducts(
    whereClause: string,
    whereParams: ObjectLiteral,
    productsInput?: ProductsInput,
    zoom?: number,
    offset?: number,
    limit?: number,
  ): Promise<ProductMapPinResponse> {
    const productPinsQuery = this.mapPinRepository
      .createQueryBuilder('mapPin')
      .select(
        `"mapPin".id AS id,
        "mapPin".location AS location,
        product.id AS product_id,
        product."projectId" AS project_id,
        product.price AS price`,
      )
      .where(whereClause, whereParams)
      .innerJoin('mapPin.product', 'product');

    if (offset !== undefined) {
      productPinsQuery.offset(offset);
    }
    if (limit !== undefined) {
      productPinsQuery.limit(limit);
    }

    if (productsInput) {
      if (productsInput.sellerId) {
        productPinsQuery.andWhere('product."sellerId" = :sellerId', {
          sellerId: productsInput.sellerId,
        });
      }

      productPinsQuery.andWhere(`(product."status" = 'PUBLISHED')`);

      if (productsInput.searchString) {
        productPinsQuery
          .addCommonTableExpression(
            `SELECT
              product.id,
              ts_rank(product."textSearch", plainto_tsquery(:searchString), 0) + similarity(product.title, :searchString) as resultrank
            FROM product product
            WHERE product."textSearch" @@ plainto_tsquery(:searchString)
              OR similarity(product.title, :searchString) > 0
            `,
            'ranked_products',
          )
          .setParameter('searchString', productsInput.searchString)
          .innerJoin('ranked_products', 'rp', 'rp.id = product.id')
          .andWhere(
            `(rp.resultrank > 0.25 OR product.title ILIKE '${productsInput.searchString}%' )`,
          );
      }
      if (
        productsInput.categoryIds ||
        productsInput.selectionCategories ||
        productsInput.seasonalCategories
      ) {
        productPinsQuery.innerJoin(
          'category',
          'c',
          'product."categoryId" = c.id',
        );

        if (productsInput.categoryIds?.length) {
          productPinsQuery.andWhere(
            '(c.id IN (:...categoryIds) OR c."parentId" IN (:...categoryIds))',
            {
              categoryIds: productsInput.categoryIds,
            },
          );
        } else if (productsInput.selectionCategories) {
          productPinsQuery.leftJoin(
            'category',
            'parent',
            'parent.id = c."parentId"',
          );
          productPinsQuery.andWhere(
            '(c."inSelection" OR parent."inSelection")',
          );
        } else {
          productPinsQuery.leftJoin(
            'category',
            'parent',
            'parent.id = c."parentId"',
          );
          productPinsQuery.andWhere('(c."inSeason" OR parent."inSeason")');
        }
      }

      if (productsInput.brandIds) {
        if (!productsInput.brandIds.length) {
          productPinsQuery.andWhere('product."brandId" IS NULL');
        }
        if (productsInput.brandIds.length) {
          productPinsQuery.andWhere('product."brandId" IN (:...brandIds)', {
            brandIds: productsInput.brandIds,
          });
        }
      }

      if (productsInput.conditions) {
        if (!productsInput.conditions.length) {
          productPinsQuery.andWhere('product.condition IS NULL');
        }
        if (productsInput.conditions.length) {
          productPinsQuery.andWhere('product.condition IN (:...conditions)', {
            conditions: productsInput.conditions,
          });
        }
      }

      //Prices
      if (productsInput.minPrice !== undefined) {
        productPinsQuery.andWhere('product.price / 100 >= :minPrice', {
          minPrice: productsInput.minPrice,
        });
      }
      if (productsInput.maxPrice !== undefined) {
        productPinsQuery.andWhere('product.price / 100 <= :maxPrice', {
          maxPrice: productsInput.maxPrice,
        });
      }

      if (productsInput.giveaway) {
        productPinsQuery.andWhere('"isGiveaway" = TRUE');
      }
    }
    const [innerSql, innerParams] = productPinsQuery.getQueryAndParameters();

    const result = await this.mapPinRepository.query(
      `
      SELECT
        grid_id as "gridId",
        ST_Collect(location) as location,
        ST_X(ST_Centroid(ST_Collect(location))) AS latitude,
        ST_Y(ST_Centroid(ST_Collect(location))) AS longitude,
        ARRAY_AGG("productId") AS "productIds",
        ARRAY_AGG("projectId") AS "projectIds",
        ARRAY_AGG(price order by price ASC) AS prices
      FROM (
        SELECT
          id,
          location,
          ST_SnapToGrid(
            location,
            $${innerParams.length + 1}
          ) AS grid_id,
          "product_id" as "productId",
          "project_id" as "projectId",
          price
        FROM (${innerSql}) AS filtered
      ) AS sub
      GROUP BY grid_id
      `,
      [...innerParams, this.cellSizeForZoom(zoom)],
    );

    return {
      pins: result.map((r) => ({
        location: {
          lat: r.latitude,
          lng: r.longitude,
        },
        productIds: r.productIds,
        projectIds: r.projectIds.filter(Boolean),
        type:
          r.projectIds.filter(Boolean).length > 0
            ? MapPinTypeEnum.PROJECT
            : MapPinTypeEnum.PRODUCT,
        prices: r.prices.map((p: number) => p / 100),
      })),
      total: result.length,
    };
  }

  private cellSizeForZoom(zoom?: number): number {
    if (zoom === undefined) {
      return 0.01;
    }
    // TODO: Tweak this cell size mapping as needed
    let cellSize = 0;
    switch (zoom) {
      case 0:
      case 1:
        cellSize = 50;
        break;
      case 2:
        cellSize = 20;
        break;
      case 3:
        cellSize = 10;
        break;
      case 4:
        cellSize = 5;
        break;
      case 5:
      case 6:
        cellSize = 2;
        break;
      case 7:
      case 8:
        cellSize = 1;
        break;
      case 9:
      case 10:
        cellSize = 0.5;
        break;
      case 11:
      case 12:
        cellSize = 0.1;
        break;
      default:
        cellSize = 0.001;
    }
    return cellSize;
  }
}
