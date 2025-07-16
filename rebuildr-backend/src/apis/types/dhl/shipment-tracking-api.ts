/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

/** @example "consignee-city" */
export enum ControlledDataCode {
  ConsigneeCity = 'consignee-city',
  ServicepointFacilityId = 'servicepoint-facilityId',
  ServicepointUrl = 'servicepoint-url',
  ShipperCity = 'shipper-city',
  SignatoryName = 'signatory-name',
}

/**
 * Type of reference
 * @example "customer-confirmation-number"
 */
export enum ReferenceType {
  ContainerNumber = 'container-number',
  CustomerConfirmationNumber = 'customer-confirmation-number',
  CustomerReference = 'customer-reference',
  DomesticConsignmentId = 'domestic-consignment-id',
  EcommerceNumber = 'ecommerce-number',
  Housebill = 'housebill',
  LocalTrackingNumber = 'local-tracking-number',
  Masterbill = 'masterbill',
  PayerAccountNumber = 'payer-account-number',
  ReceiverAccountNumber = 'receiver-account-number',
  Reference = 'reference',
  ShipmentId = 'shipment-id',
  ShipperAccountNumber = 'shipper-account-number',
  RoutingCode = 'routing-code',
  CustomerOrderNumber = 'customer-order-number',
}

/**
 * A secret scope of protected or sensitive information
 * @example "public"
 */
export enum SecretScope {
  Public = 'public',
  Secret = 'secret',
  Sensitive = 'sensitive',
}

/**
 * Code of the status (high-level grouping statuses)
 * @example "delivered"
 */
export enum StatusCode {
  Delivered = 'delivered',
  Failure = 'failure',
  PreTransit = 'pre-transit',
  Transit = 'transit',
  Unknown = 'unknown',
}

/**
 * A secret policy protecting sensitive information
 * @default "postal-code"
 * @example "postal-code"
 */
export enum SecretPolicy {
  None = 'none',
  PostalCode = 'postal-code',
}

/**
 * Service (provider) used to resolve this tracking number (id)
 * @example "express"
 */
export enum Service {
  DGF = 'dgf',
  DSC = 'dsc',
  ECM = 'ecommerce',
  ECP = 'ecommerce-apac',
  ECE = 'ecommerce-europe',
  PPL = 'ecommerce-ppl',
  ECI = 'ecommerce-iberia',
  XPR = 'express',
  FRT = 'freight',
  PAD = 'parcel-de',
  PAN = 'parcel-nl',
  PAP = 'parcel-pl',
  PUK = 'parcel-uk',
  PSD = 'post-de',
  DPI = 'post-international',
  SMD = 'sameday',
  SVB = 'svb',
}

/** Unified tracking response object */
export interface TrackingShipments {
  /**
   * A link to current page
   * @format uri
   */
  url?: string;
  /**
   * A link to the previous page
   * @format uri
   */
  prevUrl?: string;
  /**
   * A link to the next page
   * @format uri
   */
  nextUrl?: string;
  /**
   * A link to the first page
   * @format uri
   */
  firstUrl?: string;
  /**
   * A link to the last page
   * @format uri
   */
  lastUrl?: string;
  /** An array of unified tracking shipments */
  shipments?: TrackingShipment[];
  /** An array of business services, where should be potentially shipment found */
  possibleAdditionalShipmentsUrl?: string[];
}

/** Unified tracking shipment */
export interface TrackingShipment {
  /** Define the TTL value in seconds of shipment between 30 and 365 days */
  '@ttl'?: Ttl;
  /** Shipment identification tracking number */
  id?: string;
  /** Service (provider) used to resolve this tracking number (id) */
  service?: Service;
  /** The (sub)division of service provider that owns the shipment */
  division?: string;
  /** The location of object */
  origin?: SecuredPlace;
  /** The location of object */
  destination?: SecuredPlace;
  /** High-level shipment status */
  status?: TrackingShipmentStatus;
  /**
   * Shipment pickup date
   * @format date-time
   */
  pickUpDate?: string;
  /**
   * Estimated time of delivery
   * @format date-time
   */
  estimatedTimeOfDelivery?: string;
  /** A term when shipment is expected to arrive */
  estimatedDeliveryTimeFrame?: EstimatedDeliveryTimeFrame;
  /** Human-readable description of the estimated delivery time */
  estimatedTimeOfDeliveryRemark?: string;
  /**
   * Custom link to BU tracking service
   * @format uri
   */
  serviceUrl?: string;
  /**
   * Custom link to BU rerouting service, if available for the current status of the shipment
   * @format uri
   */
  rerouteUrl?: string;
  /** A flag whether the delivery is returned back to consignor */
  returnFlag?: ReturnFlag;
  /** Shipment Details */
  details?: TrackingShipmentDetails;
  /** Historical list of events & timestamps */
  events?: TrackingShipmentEvent[];
  /** Telemetry measurement details about shipment */
  telemetry?: Measurement;
}

/** Shipment Details */
export interface TrackingShipmentDetails {
  /** Offered product or service */
  product?: Product;
  /** The service provider, service operator, or service performer */
  provider?: Provider;
  /** A real organization or personal entity, if type is not specified, a Organization implementation is used */
  receiver?: PersonEntity;
  /** A real organization or personal entity, if type is not specified, a Organization implementation is used */
  sender?: PersonEntity;
  /** A real organization or personal entity, if type is not specified, a Organization implementation is used */
  carrier?: PersonEntity;
  /** A real organization or personal entity, if type is not specified, a Organization implementation is used */
  shipper?: PersonEntity;
  /** A real organization or personal entity, if type is not specified, a Organization implementation is used */
  consignee?: PersonEntity;
  /** An acknowledgment that an order successfully arrived at its intended destination */
  proofOfDelivery?: ProofOfDelivery;
  /** \'Yes\' if signer identification is available */
  proofOfDeliverySignedAvailable?: boolean;
  /**
   * Total number of items or pieces in the shipment
   * @format int32
   */
  totalNumberOfPieces?: number;
  /** Ids of all the items or pieces in the shipment */
  pieceIds?: PieceId[];
  /** A point value or interval for product characteristics and other purposes */
  weight?: QuantitativeValue;
  /** A point value or interval for product characteristics and other purposes */
  volume?: QuantitativeValue;
  /**
   * A loading meter standard unit of measurement for transport by truck
   * @format float
   */
  loadingMeters?: number;
  /** A measurable extent of a particular kind of delivery */
  dimensions?: Dimensions;
  /** A list of indications that refers to related shipment */
  references?: Reference[];
  /** Services I booked together with my Tracking details */
  valueAddedServices?: ValueAddedServices;
  /** Extra Controlled Access Data Codes */
  controlledDataCodes?: ControlledDataCode[];
  /**
   * Shipment Activation date
   * @format date-time
   */
  shipmentActivationDate?: string;
  /** DHL Global Forwarding routing Details */
  'dgf:routes'?: DgfRoute[];
}

/** High-level shipment status */
export interface TrackingShipmentStatus {
  /**
   * A combination of date and time of day
   * @format date-time
   */
  timestamp: string;
  /** The location of object */
  location?: SecuredPlace;
  /** Code of the status (high-level grouping statuses) */
  statusCode: StatusCode;
  /** Short description of the status - title */
  status?: string;
  /** Detailed status of the shipment */
  statusDetailed?: string;
  /** Human-readable detailed description */
  description?: string;
  /** Remark regarding the shipment status */
  remark?: string;
  /** Description of the next steps */
  nextSteps?: string;
}

/** Shipment movement information */
export type TrackingShipmentEvent = TrackingShipmentStatus & {
  /** Ids of all the items or pieces in the shipment */
  pieceIds?: PieceId[];
};

/** Services I booked together with my Tracking details */
export interface ValueAddedServices {
  /** List of customer services */
  services?: ValueAddedService[];
}

/**
 * Define the TTL value in seconds of shipment between 30 and 365 days
 * @format int32
 * @min 2592000
 * @max 31536000
 * @default 15552000
 */
export type Ttl = number;

/**
 * Code specifying the country using ISO 3166-1 alpha-2
 * @format country-code
 * @example "CZ"
 */
export type CountryCode = string;

/** The mailing address secured by policy */
export interface SecuredAddress {
  /** A secret policy protecting sensitive information */
  '@policy'?: SecretPolicy;
  /**
   * Text specifying the name of the locality, for example a city
   * @example "Prague"
   */
  addressLocality?: string;
  /**
   * Text specifying a detail of address locality
   * @example "Chodov"
   */
  addressLocalityServicing?: string;
  /**
   * Text specifying a detail of country
   * @example "Prague 11"
   */
  addressRegion?: string;
  /** Code specifying the country using ISO 3166-1 alpha-2 */
  countryCode?: CountryCode;
  /**
   * Text specifying the postal code for an address
   * @example "14000"
   */
  postalCode?: string;
  /**
   * The street address expressed as free form text
   * @example "Batman Avenue 1040"
   */
  streetAddress?: string;
  /**
   * Text specifying the addressLine, for example an apartment, suite, or floor number
   * @example "3rd Floor"
   */
  addressLine?: string;
}

export interface ServicePoint {
  url?: string;
  label?: string;
}

/** The location of object */
export interface SecuredPlace {
  /** The mailing address secured by policy */
  address?: SecuredAddress;
  servicePoint?: ServicePoint;
}

/** A term when shipment is expected to arrive */
export interface EstimatedDeliveryTimeFrame {
  /**
   * The start date of the estimated time frame
   * @format date-time
   */
  estimatedFrom?: string;
  /**
   * The end date of the estimated time frame
   * @format date-time
   */
  estimatedThrough?: string;
}

/**
 * A flag whether the delivery is returned back to consignor
 * @default false
 */
export type ReturnFlag = boolean;

/** Offered product or service */
export interface Product {
  /**
   * Specific detail of product
   * @example "D2P"
   */
  deliveryMethodRemark?: string;
  productCode?: string;
  /**
   * Business unit product or service
   * @example "Worldwide Priority"
   */
  productName?: string;
}

/**
 * The service provider, service operator, or service performer
 * @example {"destinationProvider":"freight"}
 */
export interface Provider {
  /** The name of the provider organization handling the delivery in the destination country */
  destinationProvider:
    | 'acs-courier'
    | 'anpost'
    | 'bpost'
    | 'bring'
    | 'chronopost'
    | 'colis-prive'
    | 'econnect'
    | 'express'
    | 'fastway'
    | 'freight'
    | 'freight-fr'
    | 'freight-se'
    | 'hrvatska-posta'
    | 'magyar-posta'
    | 'oepag'
    | 'parcel-be'
    | 'parcel-bl'
    | 'parcel-cz'
    | 'parcel-de'
    | 'parcel-es'
    | 'parcel-iberia'
    | 'parcel-lu'
    | 'parcel-nl'
    | 'parcel-pl'
    | 'parcel-pt'
    | 'parcel-uk'
    | 'posta'
    | 'posta-slovenije'
    | 'posti'
    | 'poste-italiane'
    | 'ppl'
    | 'rapido'
    | 'relais-colis'
    | 'slovak-parcel-service'
    | 'speedy'
    | 'sps'
    | 'trans-o-flex'
    | 'urgent-cargus';
}

/** Technical internal integration object, not intended for direct integration! Use Organization or Person please. */
export interface UnknownEntity {
  /** @default "UnknownEntity" */
  '@type': string;
  /** @default null */
  '@policy'?: SecretPolicy | null;
  familyName?: string;
  givenName?: string;
  name?: string;
  organizationName?: string;
  /** The mailing address secured by policy */
  address?: SecuredAddress;
}

/** A sensitive common organization or company */
export interface Organization {
  /**
   * @default "Organization"
   * @example "Organization"
   */
  '@type': string;
  /** @default "SecretPolicy.POSTAL_CODE" */
  '@policy'?: SecretPolicy;
  /**
   * The name of the person
   * @example "Linford Alene"
   */
  name?: string;
  /**
   * The name of organization
   * @example "Highgate School and Academy"
   */
  organizationName?: string;
  /** The mailing address secured by policy */
  address?: SecuredAddress;
}

/** A public business organization */
export interface Company {
  /**
   * @default "Company"
   * @example "Company"
   */
  '@type': string;
  /** @default "SecretPolicy.POSTAL_CODE" */
  '@policy'?: SecretPolicy;
  /**
   * The name of the person
   * @example "Linford Alene"
   */
  name?: string;
  /**
   * The name of organization
   * @example "The First Dome Ltd."
   */
  organizationName?: string;
  /** The mailing address secured by policy */
  address?: SecuredAddress;
}

/** A person */
export interface Person {
  /**
   * @default "Person"
   * @example "Person"
   */
  '@type': string;
  /** @default "SecretPolicy.POSTAL_CODE" */
  '@policy'?: SecretPolicy;
  /** Family name, the last name of a person */
  familyName?: string;
  /** Given name, the first name of a person */
  givenName?: string;
  /**
   * The name of the person
   * @example "Dariel Leola"
   */
  name?: string;
  /** The mailing address secured by policy */
  address?: SecuredAddress;
}

/** A real organization or personal entity, if type is not specified, a Organization implementation is used */
export type PersonEntity = BasePersonEntity &
  (
    | BasePersonEntityTypeMapping<'UnknownEntity', UnknownEntity>
    | BasePersonEntityTypeMapping<'Organization', Organization>
    | BasePersonEntityTypeMapping<'Company', Company>
    | BasePersonEntityTypeMapping<'Person', Person>
  );

/** An acknowledgment that an order successfully arrived at its intended destination */
export interface ProofOfDelivery {
  /**
   * The link to related electronic proof of delivery document
   * @format uri
   * @example "https://webpod.dhl.com/pod?token=510f1359603a768a57af49cf10083f90&language=en"
   */
  documentUrl?: string;
  /**
   * The link to related electronic signature
   * @format uri
   */
  signatureUrl?: string;
  /** A real organization or personal entity, if type is not specified, a Organization implementation is used */
  signed?: PersonEntity;
  /**
   * Date and time of related proof of delivery document
   * @format date-time
   * @example "2022-10-21T12:30:00"
   */
  timestamp?: string;
}

/** Identification of item or piece in the shipment */
export type PieceId = string;

/** A point value or interval for product characteristics and other purposes */
export interface QuantitativeValue {
  /**
   * A string or text indicating the unit of measurement
   * @example "m"
   */
  unitText?: string;
  /**
   * The value of the quantitative value or property value node
   * @example 1.5
   */
  value?: number;
}

/** A measurable extent of a particular kind of delivery */
export interface Dimensions {
  /** A point value or interval for product characteristics and other purposes */
  height?: QuantitativeValue;
  /** A point value or interval for product characteristics and other purposes */
  length?: QuantitativeValue;
  /** A point value or interval for product characteristics and other purposes */
  width?: QuantitativeValue;
}

/** An indication that refers to related shipment */
export interface Reference {
  /** A secret scope of protected or sensitive information */
  '@scope'?: SecretScope;
  /** A value of reference */
  number?: string;
  /** Type of reference */
  type: ReferenceType;
}

/** End customer service */
export interface ValueAddedService {
  serviceType?:
    | 'bulky'
    | 'pickup'
    | 'gogreen'
    | 'priority'
    | 'extraInsurance'
    | 'directInjection'
    | 'cashOnDelivery'
    | 'importFees';
  serviceCriteria?: string;
  serviceFlag?: boolean;
}

/** DHL Global Forwarding Location */
export interface DgfLocation {
  /**
   * The name of the location
   * @example "GOTHENBURG"
   */
  'dgf:locationName'?: string;
}

/** DHL Global Forwarding Airport */
export type DgfAirport = DgfLocation & {
  /**
   * Airport of departure/destination in IATA code format
   * @example "AMS"
   */
  'dgf:locationCode'?: string;
  /** Code specifying the country using ISO 3166-1 alpha-2 */
  countryCode?: CountryCode;
};

/** DHL Global Forwarding Route */
export interface DgfRoute {
  /**
   * Vessel Name for Ocean
   * @example "MAERSK SARAT"
   */
  'dgf:vesselName'?: string;
  /**
   * Voyage number for Ocean, Flight Carrier and Number for Air
   * @example "TR TRUCK"
   */
  'dgf:voyageFlightNumber'?: string;
  /** DHL Global Forwarding Airport */
  'dgf:airportOfDeparture'?: DgfAirport;
  /** DHL Global Forwarding Airport */
  'dgf:airportOfDestination'?: DgfAirport;
  /**
   * Flight Estimated Date and Time of Departure
   * @format date-time
   */
  'dgf:estimatedDepartureDate'?: string;
  /**
   * Flight Estimated Date and Time of Arrival
   * @format date-time
   */
  'dgf:estimatedArrivalDate'?: string;
  /** DHL Global Forwarding Location */
  'dgf:placeOfAcceptance'?: DgfLocation;
  /** DHL Global Forwarding Location */
  'dgf:portOfLoading'?: DgfLocation;
  /** DHL Global Forwarding Location */
  'dgf:portOfUnloading'?: DgfLocation;
  /** DHL Global Forwarding Location */
  'dgf:placeOfDelivery'?: DgfLocation;
}

/** location co-ordinates of shipment */
export interface Location {
  /**
   * Latitude value
   * @format float
   * @example 18.556873
   */
  lat?: number;
  /**
   * Longitude value
   * @format float
   * @example -70.06104
   */
  lon?: number;
}

/** Humidity measurement */
export interface Humidity {
  /** Humidity value */
  value?: string;
  /**
   * Unit of measurement
   * @example "percentage"
   */
  unit?: 'percentage';
  /** Sensor device id measured the humidity */
  deviceId?: string;
}

/** Pressure measurement */
export interface Pressure {
  /** Pressure value */
  value?: string;
  /**
   * Unit of measurement
   * @example "pascal"
   */
  unit?: 'pascal' | 'bar' | 'psi';
  /** Sensor device id measured the pressure */
  deviceId?: string;
}

/** Temperature measurement */
export interface Temperature {
  /** Temperature value */
  value?: string;
  /**
   * Unit of measurement
   * @example "celsius"
   */
  unit?: 'celsius' | 'fahrenheit' | 'kelvin';
  /** Sensor device id measured the temperature */
  deviceId?: string;
}

/** Tilt measurement */
export interface Tilt {
  /** Tilt value */
  value?: string;
  /**
   * Unit of measurement
   * @example "degree"
   */
  unit?: 'degree' | 'radian';
  /** Sensor device id measured the tilt */
  deviceId?: string;
}

/** Telemetry measurement details about shipment */
export interface Measurement {
  /** A secret policy protecting sensitive information */
  '@policy'?: SecretPolicy;
  /**
   * Date and time when the telemetry data was created by the origin system
   * @format date-time
   */
  timestamp?: string;
  /** location co-ordinates of shipment */
  location?: Location;
  /** Humidity measurement */
  humidity?: Humidity;
  /** Pressure measurement */
  pressure?: Pressure;
  /** Temperature measurement */
  temperature?: Temperature;
  /** Tilt measurement */
  tilt?: Tilt;
}

/** A problem detail response */
export interface ProblemDetail {
  /**
   * A human-readable explanation specific to this occurrence of the problem
   * @example "Detailed explanation of problem"
   */
  detail?: string;
  /**
   * A URI reference that identifies the specific occurrence of the problem
   * @format uri
   * @example "https://www.some.uri/issue/400"
   */
  instance?: string;
  /**
   * The HTTP status code
   * @example 400
   */
  status?: number;
  /**
   * A short, human-readable summary of the problem type
   * @example "Something already happen"
   */
  title?: string;
  /**
   * An identity of caused exception class
   * @example "SomeException"
   */
  type?: string;
}

/** A real organization or personal entity, if type is not specified, a Organization implementation is used */
type BasePersonEntity = object;

type BasePersonEntityTypeMapping<Key, Type> = {
  '@type': Key;
} & Type;

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, 'body' | 'bodyUsed'>;

export interface FullRequestParams extends Omit<RequestInit, 'body'> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<
  FullRequestParams,
  'body' | 'method' | 'query' | 'path'
>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, 'baseUrl' | 'cancelToken' | 'signal'>;
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown>
  extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = 'application/json',
  FormData = 'multipart/form-data',
  UrlEncoded = 'application/x-www-form-urlencoded',
  Text = 'text/plain',
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = 'https://api-test.dhl.com/track';
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>['securityWorker'];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) =>
    fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: 'same-origin',
    headers: {},
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === 'number' ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join('&');
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter(
      (key) => 'undefined' !== typeof query[key],
    );
    return keys
      .map((key) =>
        Array.isArray(query[key])
          ? this.addArrayQueryParam(query, key)
          : this.addQueryParam(query, key),
      )
      .join('&');
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : '';
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === 'object' || typeof input === 'string')
        ? JSON.stringify(input)
        : input,
    [ContentType.Text]: (input: any) =>
      input !== null && typeof input !== 'string'
        ? JSON.stringify(input)
        : input,
    [ContentType.FormData]: (input: any) =>
      Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === 'object' && property !== null
              ? JSON.stringify(property)
              : `${property}`,
        );
        return formData;
      }, new FormData()),
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(
    params1: RequestParams,
    params2?: RequestParams,
  ): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (
    cancelToken: CancelToken,
  ): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === 'boolean' ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(
      `${baseUrl || this.baseUrl || ''}${path}${queryString ? `?${queryString}` : ''}`,
      {
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type && type !== ContentType.FormData
            ? { 'Content-Type': type }
            : {}),
        },
        signal:
          (cancelToken
            ? this.createAbortSignal(cancelToken)
            : requestParams.signal) || null,
        body:
          typeof body === 'undefined' || body === null
            ? null
            : payloadFormatter(body),
      },
    ).then(async (response) => {
      const r = response.clone() as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const data = !responseFormat
        ? r
        : await response[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title Unified Shipment Tracking API
 * @version 1.5.6
 * @baseUrl https://api-test.dhl.com/track
 * @contact UTAPI Team <API-UTAPI-Team@dhl.com> (https://confluence.dhl.com/x/DQLECQ)
 *
 *
 * The Shipment Tracking API provides up-to-the-minute shipment status reports. Users of this API can:
 *
 *  * Retrieve tracking information for shipments
 *
 *  * Identify the Deutsche Post DHL (DP DHL) service provider involved with the shipment
 *
 *  * Verify DP DHL is using the correct delivery address. This can reduce the number of misdelivered shipments
 *
 * ### Message Format ###
 * This API follows common UTAPI API standards documented on [UTAPI API Portal](https://pages.git.dhl.com/Global-API-2223/UTAPI_APIDocs/) page.</a>
 * ### Changelog ###
 * Disclaimer: This changelog section is an abstract and optional representation of the actual changes to the OpenAPI specification. For full details of the changes to a previous version please refer to the OpenAPI specification.
 * - **1.5.6**
 *   - added correlation-id response header
 *
 * - **1.5.5**
 *   - added telemetry
 *
 * - **1.5.4**
 *   - added shipmentActivationDate, shipper and consignee
 *
 * - **1.5.3**
 *   - PersonEntity validation and backward compatibility of 'unknown' object
 *
 * - **1.5.2**
 *   - additional Controlled Data Codes
 *   - return flag attribute
 *
 * - **1.5.1**
 *   - unifying places, all places are secured and protected by challenge in default
 *
 * - **1.5.0**
 *   - New JSON-LD elements
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  shipments = {
    /**
     * No description
     *
     * @name SummaryShipments
     * @request SUMMARY:/shipments
     */
    summaryShipments: (params: RequestParams = {}) =>
      this.request<any, any>({
        path: `/shipments`,
        method: 'SUMMARY',
        ...params,
      }),

    /**
     * No description
     *
     * @name DescriptionShipments
     * @request DESCRIPTION:/shipments
     */
    descriptionShipments: (params: RequestParams = {}) =>
      this.request<any, any>({
        path: `/shipments`,
        method: 'DESCRIPTION',
        ...params,
      }),

    /**
     * @description Retrieves the tracking information for shipments(s). The shipments are identified using the required `trackingNumber` query parameter.
     *
     * @name GetTrackingShipment
     * @summary Retrieve Tracking Information
     * @request GET:/shipments
     * @secure
     */
    getTrackingShipment: (
      query: {
        /** The tracking number of the shipment for which to return the information. */
        trackingNumber: string;
        /** Hint which service (provider) should be used to resolve the tracking number. */
        service?: Service;
        /** Optional [ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) country code represents country of the consumer of the API response. It optimizes the return of the API response. */
        requesterCountryCode?: string;
        /** Optional [ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) country code of the shipment origin to further qualify the shipment tracking number (`trackingNumber`) parameter of the request. */
        originCountryCode?: string;
        /**
         * Postal code of the destination address to
         * * further qualify the shipment tracking number (trackingNumber) parameter of the request or
         * * parcel-nl and parcel-de services to display full set of data in the response.
         */
        recipientPostalCode?: string;
        /**
         * ISO 639-1 2-character language code for the response. This parameter serves as an indication of the client preferences ONLY. Language availability depends on the service used. The actual response language is indicated by the Content-Language header.
         * @default "en"
         */
        language?: string;
        /**
         * Pagination parameter. Offset from the start of the result set at which to retrieve the remainder of the results (if any).
         * @default 0
         */
        offset?: number;
        /**
         * Pagination parameter. Maximal number of results to retireve.
         * @default 5
         */
        limit?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<TrackingShipments, ProblemDetail>({
        path: `/shipments`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),
  };
}
