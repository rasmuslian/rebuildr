import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Product, ProductStatus } from "src/entities/product.entity";
import { Project } from "src/entities/project.entity";
import { User } from "src/entities/user.entity";
import { MapPin, MapPinTypeEnum } from "src/entities/map-pin.entity";
import { LocationResponse } from "src/resolvers/geocoding.resolver";
import { MapPinGroup, MapPinResponse, ProductMapPinResponse } from "src/resolvers/map-pin.resolver";
import { Repository } from "typeorm/repository/Repository";
import { GeocodingService } from "./geocoding.service";
import { ProductsInput } from "src/resolvers/product.resolver";

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

  async removeMapPin(id: string): Promise<void> {
    if (id) {
      await this.mapPinRepository.delete(id);
    }
  }

  async syncApproximateLocations() {
    const batchSize = 100;
    let offset = 0;
    while (true) {
      const projects = await this.projectRepository.createQueryBuilder('project')
        .leftJoinAndSelect('project.products', 'product', 'product.status = :status', { status: ProductStatus.PUBLISHED })
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
              if (product.mapPinId) {
                product.mapPin = new MapPin({
                  address: approximateLocation.address,
                  location: {
                    type: "Point",
                    coordinates: [approximateLocation.lat, approximateLocation.lng],
                  },
                });
                if (product.mapPinId) {
                  product.mapPin.id = product.mapPinId;
                }
                updatedProducts.push(product);
              }
            }
          }
        } catch (error) {
          console.log(`Failed to approximate location for project ${project.id}: ${error}`);
        }
      }

      await this.projectRepository.save(updatedProjects);
      offset += batchSize;
    }

    offset = 0;
    while (true) {
      const users = await this.userRepository.createQueryBuilder('user')
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

          user.mapPin = (new MapPin({
            location: {
              type: 'Point',
              coordinates: [approximateLocation.lat, approximateLocation.lng],
            },
            address: approximateLocation.address,
          }));
          if (user.mapPinId) {
            user.mapPin.id = user.mapPinId;
          }
          updatedUsers.push(user);
        } catch (error) {
          console.log(`Failed to approximate location for user ${user.id}: ${error}`);
        }
      }

      await this.userRepository.save(updatedUsers);
      offset += batchSize;
    }

    offset = 0;
    while (true) {
      const products = await this.productRepository.createQueryBuilder('product')
        .andWhere('product.projectId IS NULL')
        .andWhere('product.status = :status', { status: ProductStatus.PUBLISHED })
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

          product.mapPin = (new MapPin({
            location: {
              type: 'Point',
              coordinates: [approximateLocation.lat, approximateLocation.lng],
            },
            address: approximateLocation.address,
          }));
          if (product.mapPinId) {
            product.mapPin.id = product.mapPinId;
          }
          updatedProducts.push(product);
        } catch (error) {
          console.log(`Failed to approximate location for product ${product.id}: ${error}`);
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
      .createQueryBuilder("mapPin")
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
  ): Promise<ProductMapPinResponse> {
    const result = await this.getFilteredMapPinsForProducts(
      `mapPin.location && ST_Buffer(ST_SetSRID(ST_MakePoint(:lat, :lng), 4326)::geography, :radius)`,
      {
        lat: point.lat,
        lng: point.lng,
        radius,
      },
      productsInput,
    );
    return result;
  }

  async findProductPinsInBoundingBox(
    southWest: LocationResponse,
    northEast: LocationResponse,
    productsInput?: ProductsInput,
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
    );
    return result;
  }


  private async getFilteredMapPinsForProducts(
    whereClause: string,
    whereParams: unknown,
    productsInput?: ProductsInput,
  ): Promise<ProductMapPinResponse>{
    const productPinsQuery = this.mapPinRepository
      .createQueryBuilder("mapPin")
      .where(
        whereClause,
        whereParams,
      )
      .innerJoinAndSelect("mapPin.product", "product");

    if (productsInput) {

      if (productsInput.sellerId) {
        productPinsQuery.andWhere('product."sellerId" = :sellerId', { sellerId: productsInput.sellerId });
      }

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
        productPinsQuery.innerJoin('category', 'c', 'product."categoryId" = c.id');

        if (productsInput.categoryIds?.length) {
          productPinsQuery.andWhere(
            '(c.id IN (:...categoryIds) OR c."parentId" IN (:...categoryIds))',
            {
              categoryIds: productsInput.categoryIds,
            },
          );
        } else if (productsInput.selectionCategories) {
          productPinsQuery.leftJoin('category', 'parent', 'parent.id = c."parentId"');
          productPinsQuery.andWhere('(c."inSelection" OR parent."inSelection")');
        } else {
          productPinsQuery.leftJoin('category', 'parent', 'parent.id = c."parentId"');
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
    const mapPins = await productPinsQuery.getMany();
    return this.groupMapPins(mapPins);
  }

  private reduceMapPinsByLocation = (mapPins: MapPin[]): Record<string, MapPinGroup> => {
    return mapPins.reduce((uniqueMap, pin) => {
      const key = pin.location.coordinates.toString();
      uniqueMap[key] ||= {
        id: pin.id,
        location: {
          lat: pin.location.coordinates[0],
          lng: pin.location.coordinates[1]
        },
        prices: [],
        products: [],
        projectIds: [],
        type: (pin.product?.projectId) ? MapPinTypeEnum.PROJECT : MapPinTypeEnum.PRODUCT,
      } as MapPinGroup;
      if (pin.product) {
        uniqueMap[key].prices.push((pin.product.price / 100));
        uniqueMap[key].products.push(pin.product);
        if (pin.product.projectId) {
          uniqueMap[key].projectIds.push(pin.product.projectId);
        }
      }
      uniqueMap[key].prices.sort((a, b) => a - b);
      return uniqueMap;
    }, {} as Record<string, MapPinGroup>);
  }

  private groupMapPins = (mapPins: MapPin[]) => {
    const projectMapPins = mapPins.filter((pin) => pin.product?.projectId);
    const productMapPins = mapPins.filter((pin) => pin.product && !pin.product.projectId);

    const groupedMapPins = this.reduceMapPinsByLocation(projectMapPins);

    const reducedProductMapPins = this.reduceMapPinsByLocation(productMapPins);
    Object.values(reducedProductMapPins).forEach((pinParent) => {
      const key = pinParent.location.lat + ',' + pinParent.location.lng;
      if (groupedMapPins[key]) {
        groupedMapPins[key].prices.push(...pinParent.prices);
        groupedMapPins[key].prices.sort((a, b) => a - b);
      } else {
        groupedMapPins[key] = pinParent;
      }
    });
    return {
      pins: Object.values(groupedMapPins),
      total: Object.values(groupedMapPins).length,
    };
  }
}