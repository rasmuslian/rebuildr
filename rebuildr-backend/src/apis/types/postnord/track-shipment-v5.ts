/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

/** AdditionalServiceDto */
export interface AdditionalServiceDto {
  code: string;
  groupCode?: string;
  type?: string;
  name?: string;
  [key: string]: any;
}

/** AddressDto */
export interface AddressDto {
  street1?: string;
  street2?: string;
  city?: string;
  countryCode?: string;
  country?: string;
  postCode?: string;
  [key: string]: any;
}

/** CollectionPartyDto */
export interface CollectionPartyDto {
  name?: string;
  address?: AddressDto;
  contact?: ContactDto;
  [key: string]: any;
}

/** CompositeFault */
export interface CompositeFault {
  faults?: Fault[];
  [key: string]: any;
}

/**
 * ConsigneeDto
 * receiver
 */
export interface ConsigneeDto {
  name?: string;
  address?: AddressDto;
  [key: string]: any;
}

/**
 * ConsignorDto
 * sender
 */
export interface ConsignorDto {
  name?: string;
  issuercode?: string;
  address?: AddressDto;
  [key: string]: any;
}

/** ContactDto */
export interface ContactDto {
  contactName?: string;
  phone?: string;
  mobilePhone?: string;
  email?: string;
  [key: string]: any;
}

/** CoordinateDto */
export interface CoordinateDto {
  srId?: string;
  northing?: string;
  easting?: string;
  [key: string]: any;
}

/** DeliveryPointDto */
export interface DeliveryPointDto {
  name?: string;
  depotId?: string;
  locationDetail?: string;
  address?: AddressDto;
  contact?: ContactDto;
  coordinate?: CoordinateDto[];
  openingHours?: OpeningHoursDto[];
  displayName?: string;
  locationId: string;
  servicePointType?: string;
  [key: string]: any;
}

/** DistanceDto */
export interface DistanceDto {
  /**
   * String representing BigDecimal
   * @example "13.55"
   */
  value: string;
  unit: DistanceUnit;
  [key: string]: any;
}

/**
 * distanceUnit
 * @example "mm"
 */
export enum DistanceUnit {
  Mm = 'mm',
  Cm = 'cm',
  Dm = 'dm',
  M = 'm',
}

/** Fault */
export interface Fault {
  faultCode: string;
  explanationText: string;
  paramValues?: ParamValue[];
  [key: string]: any;
}

/** GeoLocationDto */
export interface GeoLocationDto {
  /** @format double */
  geoNorthing?: number;
  /** @format double */
  geoEasting?: number;
  geoReferenceSystem?: string;
  geoPostalCode?: string;
  geoCity?: string;
  geoCountryCode?: string;
  [key: string]: any;
}

/** ItemDto */
export interface ItemDto {
  itemId: string;
  /** @format date-time */
  estimatedTimeOfArrival?: string;
  /**
   * Public time of arrival. Might be based on statistical ETA
   * @format date-time
   */
  publicTimeOfArrival?: string;
  /** @format date-time */
  dropOffDate?: string;
  /** @format date-time */
  deliveryDate?: string;
  /** @format date-time */
  returnDate?: string;
  deliveryImageAvailable?: boolean;
  liveTracking?: LiveTrackingDto;
  typeOfItem?: string;
  typeOfItemName?: string;
  typeOfItemActual?: string;
  typeOfItemActualName?: string;
  additionalInformation?: string;
  /** @format int32 */
  noItems?: number;
  numberOfPallets?: string;
  status?: ItemStatus;
  statusText?: StatusTextDto;
  /** measurement that was made and scanned by Postnord */
  statedMeasurement?: MeasurementDto;
  /** measurement that was received in the shipment information */
  assessedMeasurement?: MeasurementDto;
  events?: TrackingEventDto[];
  stoppedInCustoms?: boolean;
  references?: ReferenceDto[];
  /** @uniqueItems true */
  previousItemStates?: ItemStatus[];
  isPlacedInRetailParcelBox?: boolean;
  [key: string]: any;
}

/** LiveTrackingDto */
export interface LiveTrackingDto {
  liveTrackId?: string;
  [key: string]: any;
}

/**
 * itemStatus
 * @example "CREATED"
 */
export enum ItemStatus {
  CREATED = 'CREATED',
  AVAILABLE_FOR_DELIVERY = 'AVAILABLE_FOR_DELIVERY',
  AVAILABLE_FOR_DELIVERY_PAR_LOC = 'AVAILABLE_FOR_DELIVERY_PAR_LOC',
  DELAYED = 'DELAYED',
  DELIVERED = 'DELIVERED',
  DELIVERY_IMPOSSIBLE = 'DELIVERY_IMPOSSIBLE',
  DELIVERY_REFUSED = 'DELIVERY_REFUSED',
  EXPECTED_DELAY = 'EXPECTED_DELAY',
  INFORMED = 'INFORMED',
  EN_ROUTE = 'EN_ROUTE',
  OTHER = 'OTHER',
  RETURNED = 'RETURNED',
  STOPPED = 'STOPPED',
}

/** LocationDto */
export interface LocationDto {
  name?: string;
  countryCode?: string;
  country?: string;
  locationId: string;
  depotId?: string;
  displayName?: string;
  postcode?: string;
  city?: string;
  locationType: LocationType;
  [key: string]: any;
}

/**
 * locationType
 * @example "HUB"
 */
export enum LocationType {
  CUSTOMER_LOCATION = 'CUSTOMER_LOCATION',
  DELIVERY_POINT = 'DELIVERY_POINT',
  DEPOT = 'DEPOT',
  DISTRIBUTION_PARTNER = 'DISTRIBUTION_PARTNER',
  DPD_DEPOT = 'DPD_DEPOT',
  HUB = 'HUB',
  IPS_LOCATION = 'IPS_LOCATION',
  LOAD_POINT = 'LOAD_POINT',
  POSTAL_SERVICE_TERMINAL = 'POSTAL_SERVICE_TERMINAL',
  SERVICE_POINT = 'SERVICE_POINT',
  SLINGA = 'SLINGA',
  UNDEF = 'UNDEF',
}

/** MeasurementDto */
export interface MeasurementDto {
  weight?: WeightDto;
  length?: DistanceDto;
  height?: DistanceDto;
  width?: DistanceDto;
  volume?: VolumeDto;
  [key: string]: any;
}

/** OpeningHoursDto */
export interface OpeningHoursDto {
  openFrom: string;
  openTo: string;
  openFrom2?: string;
  openTo2?: string;
  monday?: boolean;
  tuesday?: boolean;
  wednesday?: boolean;
  thursday?: boolean;
  friday?: boolean;
  saturday?: boolean;
  sunday?: boolean;
  [key: string]: any;
}

/** ParamValue */
export interface ParamValue {
  param: string;
  value: string;
  [key: string]: any;
}

/** PickupPartyDto */
export interface PickupPartyDto {
  name?: string;
  address?: AddressDto;
  contact?: ContactDto;
  [key: string]: any;
}

/** ReferenceDto */
export interface ReferenceDto {
  value: string;
  type: string;
  name?: string;
  [key: string]: any;
}

/** ResponseDto */
export interface ResponseDto {
  TrackingInformationResponse?: TrackingInformationResponse;
  [key: string]: any;
}

/** ReturnPartyDto */
export interface ReturnPartyDto {
  name?: string;
  address?: AddressDto;
  contact?: ContactDto;
  [key: string]: any;
}

/** ServiceDto */
export interface ServiceDto {
  code: string;
  name?: string;
  [key: string]: any;
}

/** ShipmentDto */
export interface ShipmentDto {
  shipmentId: string;
  uri?: string;
  /** @format int32 */
  assessedNumberOfItems?: number;
  cashOnDeliveryText?: string;
  /** @format date-time */
  deliveryDate?: string;
  /** @format date-time */
  returnDate?: string;
  /**
   * Estimated time of arrival
   * @format date-time
   */
  estimatedTimeOfArrival?: string;
  /**
   * Public time of arrival. Might be based on statistical ETA
   * @format date-time
   */
  publicTimeOfArrival?: string;
  numberOfPallets?: string;
  flexChangePossible?: boolean;
  service?: ServiceDto;
  /** sender */
  consignor?: ConsignorDto;
  /** receiver */
  consignee?: ConsigneeDto;
  returnParty?: ReturnPartyDto;
  pickupParty?: PickupPartyDto;
  collectionParty?: CollectionPartyDto;
  statusText?: ShipmentStatusTextDto;
  status?: Status18;
  deliveryPoint?: DeliveryPointDto;
  totalWeight?: WeightDto;
  totalVolume?: VolumeDto;
  assessedWeight?: WeightDto;
  assessedVolume?: VolumeDto;
  /** @uniqueItems true */
  splitStatuses?: SplitStatusDto[];
  shipmentReferences?: ReferenceDto[];
  /** @uniqueItems true */
  additionalServices?: AdditionalServiceDto[];
  /** @format int32 */
  harmonizedVersion?: number;
  items?: ItemDto[];
  [key: string]: any;
}

/** ShipmentStatusTextDto */
export interface ShipmentStatusTextDto {
  header?: string;
  body?: string;
  estimatedTimeOfArrival?: string;
  [key: string]: any;
}

/** SplitStatusDto */
export interface SplitStatusDto {
  /** @format int32 */
  noItemsWithStatus?: number;
  /** @format int32 */
  noItems?: number;
  statusDescription?: string;
  status?: Status;
  [key: string]: any;
}

/**
 * status
 * @example "CREATED"
 */
export enum Status {
  CREATED = 'CREATED',
  AVAILABLE_FOR_DELIVERY = 'AVAILABLE_FOR_DELIVERY',
  AVAILABLE_FOR_DELIVERY_PAR_LOC = 'AVAILABLE_FOR_DELIVERY_PAR_LOC',
  DELAYED = 'DELAYED',
  DELIVERED = 'DELIVERED',
  DELIVERY_IMPOSSIBLE = 'DELIVERY_IMPOSSIBLE',
  DELIVERY_REFUSED = 'DELIVERY_REFUSED',
  EXPECTED_DELAY = 'EXPECTED_DELAY',
  INFORMED = 'INFORMED',
  EN_ROUTE = 'EN_ROUTE',
  OTHER = 'OTHER',
  RETURNED = 'RETURNED',
  STOPPED = 'STOPPED',
}

/**
 * ShipmentStatus
 * @example "CREATED"
 */
export enum Status18 {
  CREATED = 'CREATED',
  AVAILABLE_FOR_DELIVERY = 'AVAILABLE_FOR_DELIVERY',
  DELAYED = 'DELAYED',
  DELIVERED = 'DELIVERED',
  DELIVERY_IMPOSSIBLE = 'DELIVERY_IMPOSSIBLE',
  DELIVERY_REFUSED = 'DELIVERY_REFUSED',
  EXPECTED_DELAY = 'EXPECTED_DELAY',
  INFORMED = 'INFORMED',
  EN_ROUTE = 'EN_ROUTE',
  OTHER = 'OTHER',
  RETURNED = 'RETURNED',
  STOPPED = 'STOPPED',
  SPLIT = 'SPLIT',
}

/** StatusTextDto */
export interface StatusTextDto {
  header?: string;
  body?: string;
  estimatedTimeOfArrival?: string;
  [key: string]: any;
}

/** TrackingEventDto */
export interface TrackingEventDto {
  /** @format date-time */
  eventTime: string;
  eventCode: string;
  location: LocationDto;
  geoLocation?: GeoLocationDto;
  status?: string;
  eventDescription?: string;
  [key: string]: any;
}

/** TrackingInformationResponse */
export interface TrackingInformationResponse {
  compositeFault?: CompositeFault;
  shipments?: ShipmentDto[];
  [key: string]: any;
}

/** VolumeDto */
export interface VolumeDto {
  /**
   * A string representation the BigDecimal value
   * @example "1.76"
   */
  value: string;
  unit: VolumeUnit;
  [key: string]: any;
}

/**
 * volumeUnit
 * @example "cm3"
 */
export enum VolumeUnit {
  Cm3 = 'cm3',
  Dm3 = 'dm3',
  M3 = 'm3',
}

/** WeightDto */
export interface WeightDto {
  /**
   * A string representing a BigDecimal
   * @example "11.92"
   */
  value: string;
  unit: WeightUnit;
  [key: string]: any;
}

/**
 * WeightUnit
 * @example "g"
 */
export enum WeightUnit {
  G = 'g',
  Kg = 'kg',
}

/** PostNord standard error response message */
export interface ErrorResponse {
  compositeFault?: CompositeFault;
  /**
   * High level error message.
   * @example "Query parameter missing"
   */
  message: string;
}

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
  public baseUrl: string = 'https://api2.postnord.com/rest/shipment';
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
 * @title Track Shipment V5
 * @version 1.0.7
 * @baseUrl https://api2.postnord.com/rest/shipment
 *
 * The PostNord Track Shipment API supports two different ways to retrieve shipment information.
 *
 * The same API is used on all PostNord’s websites (e.g. postnord.se, postdanmark.dk, postnord.no, postnord.fi and tracking.postnord.com).
 *
 * The result will contain the matching shipments/items with their associated events.
 *
 * **How to use the tracking API**
 * * Use the tracking-API when a system actually needs to present the latest events.
 *
 * * Avoid making unnecessary requests of all items at all the time when the tracking-service is not used.
 *
 * * Know what hours you need to update the tracking, for example not having the same intervals during night-time as day-time.
 *
 * Below are the options to retrieve the information:
 *
 * Track shipment by Identifier (Shipment-ID/Item-ID).
 * Track shipment by customer number and reference
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  v5 = {
    /**
     * @description The PostNord Track Shipment API supports different ways to retrieve shipment information. <br><br>The same API is used on all PostNord’s websites (e.g. postnord.se, postdanmark.dk, postnord.no, postnord.fi and tracking.postnord.com).<br><br>The result will contain the matching shipments with their associated events
     *
     * @tags Track Shipment V5
     * @name RestShipmentV2TrackandtraceFindByIdentifierByReturntypeGet
     * @summary Track shipment by Identifier
     * @request GET:/v5/trackandtrace/findByIdentifier.{returntype}
     */
    restShipmentV2TrackandtraceFindByIdentifierByReturntypeGet: (
      returntype: 'json' | 'xml',
      query: {
        /** The unique consumer (client) identifier 32 characters */
        apikey: string;
        /**
         * Shipment or Item identifier. Valid characters: A-Z, a-z, 0-9 Length: 10-35 characters
         * @example "96932007555SE"
         */
        id: string;
        /**
         * Default is en. Allowed values are en, sv, no, da and fi
         * @default "en"
         */
        locale?: string;
        /** Return JSON-P response */
        callback?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<ResponseDto, any>({
        path: `/v5/trackandtrace/findByIdentifier.${returntype}`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * @description The PostNord Track Shipment API supports different ways to retrieve shipment information. <br><br>The same API is used on all PostNord’s websites (e.g. postnord.se, postdanmark.dk, postnord.no, postnord.fi and tracking.postnord.com).<br><br>The result will contain the matching shipments with their associated events
     *
     * @tags Track Shipment V5
     * @name RestShipmentV2TrackandtraceFindByReferenceByReturntypeGet
     * @summary Track shipment by customer number and reference
     * @request GET:/v5/trackandtrace/findByReference.{returntype}
     */
    restShipmentV2TrackandtraceFindByReferenceByReturntypeGet: (
      returntype: 'json' | 'xml',
      query: {
        /** The unique consumer (client) identifier 32 characters */
        apikey: string;
        /**
         * The Postnord customer number for the shipment
         * @example "80068059"
         */
        customerNumber: string;
        /**
         * The customer reference on the shipment
         * @example "dk2238532288565/dk80059/0"
         */
        referenceValue: string;
        /**
         * Default is en. Allowed values are en, sv, no, da and fi
         * @default "en"
         */
        locale?: string;
        /** Return JSON-P response */
        callback?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<ResponseDto, any>({
        path: `/v5/trackandtrace/findByReference.${returntype}`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),
  };
}
