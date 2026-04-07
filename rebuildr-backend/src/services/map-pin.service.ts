import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product, ProductStatus } from 'src/entities/product.entity';
import { Project } from 'src/entities/project.entity';
import { User, UserType } from 'src/entities/user.entity';
import { MapPin, MapPinTypeEnum } from 'src/entities/map-pin.entity';
import { LocationResponse } from 'src/resolvers/geocoding.resolver';
import { MapPinGroupsResponse } from 'src/resolvers/map-pin.resolver';
import { Repository } from 'typeorm/repository/Repository';
import { GeocodingService } from './geocoding.service';
import { ProductsInput } from 'src/resolvers/product.resolver';
import { ObjectLiteral } from 'typeorm';
import { BadUserInputException } from 'src/exceptions';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { ProductService } from './product.service';
import { ProjectsInput } from 'src/resolvers/project.resolver';

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
    private productService: ProductService,
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

  async findMapPinGroupsByBoundingBox(
    southWest: LocationResponse,
    northEast: LocationResponse,
    productsInput?: ProductsInput,
    projectsInput?: ProjectsInput,
    zoom?: number,
    offset?: number,
    limit?: number,
  ): Promise<MapPinGroupsResponse> {
    const result = await this.getMapPinGroups(
      `mapPin.location && ST_MakeEnvelope(:swLat, :swLng, :neLat, :neLng, 4326)`,
      {
        swLng: southWest.lng,
        swLat: southWest.lat,
        neLng: northEast.lng,
        neLat: northEast.lat,
      },
      productsInput,
      projectsInput,
      zoom,
      offset,
      limit,
    );
    return result;
  }

  async getMapPinGroups(
    whereClause: string,
    whereParams: ObjectLiteral,
    productsInput?: ProductsInput,
    projectsInput?: ProjectsInput,
    zoom?: number,
    offset?: number,
    limit?: number,
  ): Promise<MapPinGroupsResponse> {
    const productPart = this.productRepository.createQueryBuilder('product');
    if (offset !== undefined) {
      productPart.offset(offset);
    }
    if (limit !== undefined) {
      productPart.limit(limit);
    }
    if (productsInput) {
      this.productService.basicFindProductsInputQueryBuilder(
        productsInput,
        productPart,
        'product',
      );
    }
    const [innerProductSql, innerProductParams] =
      productPart.getQueryAndParameters();

    const projectsPart = this.projectRepository.createQueryBuilder('project');
    if (offset !== undefined) {
      projectsPart.offset(offset);
    }
    if (limit !== undefined) {
      projectsPart.limit(limit);
    }
    if (projectsInput) {
      if (projectsInput.ids) {
        projectsPart.andWhere('project.id IN (:...projectIds)', {
          projectIds: projectsInput.ids,
        });
      }
    }
    const [innerProjectSql, innerProjectParams] =
      projectsPart.getQueryAndParameters();

    const mapPinsPart = this.mapPinRepository
      .createQueryBuilder('mapPin')
      .select(
        `"mapPin".id AS id,
        "mapPin".location AS location`,
      )
      .where(whereClause, whereParams);
    const [innerMapPinSql, innerMapPinParams] =
      mapPinsPart.getQueryAndParameters();

    const offsetSql = (sql: string, offset: number) =>
      sql.replace(/\$(\d+)/g, (_, n) => `$${parseInt(n) + offset}`);

    const offsetProjectSql = innerProjectSql;
    const offsetMapPinSql = offsetSql(
      innerMapPinSql,
      innerProjectParams.length,
    );
    const offsetProductSql = offsetSql(
      innerProductSql,
      innerProjectParams.length + innerMapPinParams.length,
    );

    const zoomParamNumber =
      innerProjectParams.length +
      innerMapPinParams.length +
      innerProductParams.length +
      1;

    /**
     * Explain query
     * 'clustered'
     *  All filtered products will be assigned a grid based on their location.
     * A Cluster is then achieved by grouping on grid_id. Also group on project_id to keep
     * clusters of products without project_id and clusters with different project_ids separated.
     *
     * 'jittered'
     * Separate the clusters a small bit to avoid overlap.
     */
    const result: {
      gridId: string;
      latitude: number;
      longitude: number;
      productIds: string[];
      projectId: string | null;
      sellerType: UserType;
      sellerIsFeatured: boolean;
      prices: number[];
    }[] = await this.mapPinRepository.query(
      `
      WITH 
        collections AS (
          --Project part
          SELECT 
            ST_SnapToGrid(
              location,
              $${zoomParamNumber}) AS grid_id,
            ST_Collect(location) AS geom,  
            pj.project_id as "projectId", 
            ARRAY_AGG(p.product_id) FILTER (WHERE p.product_id IS NOT NULL) AS "productIds",
            ARRAY_AGG(p.product_price ORDER BY p.product_price) AS prices,
            u."type" as "sellerType",
            u."isFeatured" as "sellerIsFeatured"
          FROM (${offsetMapPinSql}) mp
          INNER JOIN (${offsetProjectSql}) pj ON pj."project_mapPinId" = mp.id
          INNER JOIN "user" u ON pj."project_userId" = u.id
          LEFT JOIN (${offsetProductSql}) p ON p."product_projectId" = pj.project_id
          GROUP BY pj.project_id, grid_id, u.id

          UNION

          --Product part
          SELECT 
            ST_SnapToGrid(
              location,
              $${zoomParamNumber}) AS grid_id,
            ST_Collect(location) AS geom,
            null as "projectId",
            ARRAY_AGG(p.product_id) AS "productIds",
            ARRAY_AGG(p.product_price ORDER BY p.product_price) AS prices,
            null as "sellerType",
            null as "sellerIsFeatured"
          FROM (${offsetMapPinSql}) mp
          INNER JOIN (${offsetProductSql}) p ON p."product_mapPinId" = mp.id
          INNER JOIN "user" u ON u.id = p."product_sellerId"
          WHERE 
            p."product_projectId" IS NULL
          GROUP BY grid_id, u."isFeatured"),

        jittered AS (
          SELECT
            grid_id,
            "projectId",
            "productIds",
            ST_Translate(
              ST_Centroid(geom),
              ((hashtext(COALESCE("projectId"::text, 'null')) % 10) - 5) * 0.00010,
              ((hashtext(COALESCE("projectId"::text, 'null')) % 10) - 5) * 0.00010
            ) AS location,
            prices,
            "sellerIsFeatured",
            "sellerType"
          FROM collections)

        SELECT
          grid_id,
          "projectId",
          ST_X(location) AS latitude,
          ST_Y(location) AS longitude,
          "productIds",
          prices,
          "sellerIsFeatured",
          "sellerType"
        FROM jittered
    `,
      [
        ...innerProjectParams,
        ...innerMapPinParams,
        ...innerProductParams,
        this.cellSizeForZoom(zoom),
      ],
    );

    return {
      mapPinGroups: result.map((r) => ({
        location: {
          lat: r.latitude,
          lng: r.longitude,
        },
        productIds: r.productIds ? r.productIds : [],
        projectId: r.projectId,
        type: this.deriveMapPinType(
          !!r.projectId,
          r.sellerType,
          r.sellerIsFeatured,
        ),
        prices: r.prices.map((p: number) => p / 100),
      })),
      total: result.length,
    };
  }

  private deriveMapPinType = (
    isProject: boolean,
    sellerType: UserType,
    sellerIsFeatured: boolean,
  ) => {
    if (!isProject) {
      return MapPinTypeEnum.PRODUCT;
    }
    if (sellerType === UserType.PERSONAL) {
      return MapPinTypeEnum.PROJECT;
    }
    //Is Business
    if (sellerIsFeatured) {
      return MapPinTypeEnum.FEATURED;
    }
    return MapPinTypeEnum.HUB;
  };

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
