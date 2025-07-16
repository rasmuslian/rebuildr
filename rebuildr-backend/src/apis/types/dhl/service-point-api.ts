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

/** @format int32 */
export enum ServiceType {
  ParcelPickUp = 'parcel_pick_up',
  ParcelDropOff = 'parcel_drop_off',
  ParcelPickUpAll = 'parcel_pick_up_all',
  ExpressPickUp = 'express_pick_up',
  ExpressDropOff = 'express_drop_off',
  CashOnDelivery = 'cash_on_delivery',
  LetterService = 'letter_service',
  Postbank = 'postbank',
  CashService = 'cash_service',
  Franking = 'franking',
  PackagingMaterial = 'packaging_material',
  Postident = 'postident',
  AgeVerification = 'age_verification',
  HandicappedAccess = 'handicapped_access',
  Parking = 'parking',
  ParcelPickUpRegistered = 'parcel_pick_up_registered',
  ParcelPickUpUnregistered = 'parcel_pick_up_unregistered',
  ParcelDropOffUnregistered = 'parcel_drop_off_unregistered',
  ExpressDropOffPrelabeled = 'express_drop_off_prelabeled',
}

/** @format int32 */
export enum LocationType {
  Servicepoint = 'servicepoint',
  Locker = 'locker',
  Postoffice = 'postoffice',
  Postbank = 'postbank',
}

/** @format int32 */
export enum DistanceUnit {
  M = 'm',
  Km = 'km',
}

export interface Address {
  street?: string;
  streetNumber?: string;
  additionalAddressInfo?: string;
  cityName?: string;
  postalCode?: string;
  countryCode?: string;
}

export interface NearestServicePointRequest {
  address?: Address;
  featureCodes?: string[];
  bitCatCodes?: string[];
  /** @format int32 */
  maxNumberOfItems?: number;
  clickAndCollectId?: string;
  locationTypes?: LocationType[];
  serviceTypes?: ServiceType[];
  /** @format double */
  distance?: number;
  distanceUnit?: DistanceUnit;
  piece?: Piece;
}

export interface NearestServicePointResponse {
  status?: string;
  errorMessage?: string;
  doorStepDeliveryAvailable?: boolean;
  doorStepDelivery?: Party;
  servicePoints?: ServicePointReference[];
  residentialAddressing?: boolean;
  homedeliveryParcel?: boolean;
  lofi?: boolean;
}

export interface Party {
  id?: string;
  servicePointId?: string;
  name?: string;
  shopName?: string;
  address?: Address;
  phone?: string;
  email?: string;
  locationType?: LocationType;
}

export interface Piece {
  /** @format double */
  width?: number;
  /** @format double */
  height?: number;
  /** @format double */
  length?: number;
  /** @format double */
  weight?: number;
}

export interface ServicePointDetailResponse {
  status?: string;
  errorMessage?: string;
  servicePoint?: Party;
}

export interface ServicePointReference {
  id?: string;
  servicePointId?: string;
  street?: string;
  name?: string;
  shopName?: string;
  cityName?: string;
  postalCode?: string;
  countryCode?: string;
  /** @format double */
  distance?: number;
  /** @format double */
  routeDistance?: number;
  distanceUnit?: DistanceUnit;
  featureCodes?: string[];
  locationType?: LocationType;
  serviceTypes?: ServiceType[];
  /** @format double */
  latitude?: number;
  /** @format double */
  longitude?: number;
  clickAndCollectId?: string;
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
  public baseUrl: string =
    'https://test-api.freight-logistics.dhl.com/servicepointlocatorapi/v1';
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
 * @title Servicepoint API
 * @version 2.8.19
 * @baseUrl https://test-api.freight-logistics.dhl.com/servicepointlocatorapi/v1
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  servicepoint = {
    /**
     * No description
     *
     * @tags ServicePoint
     * @name FindnearestservicepointsCreate
     * @request POST:/servicepoint/findnearestservicepoints
     * @secure
     */
    findnearestservicepointsCreate: (
      body: NearestServicePointRequest,
      params: RequestParams = {},
    ) =>
      this.request<NearestServicePointResponse, any>({
        path: `/servicepoint/findnearestservicepoints`,
        method: 'POST',
        body: body,
        secure: true,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * No description
     *
     * @tags ServicePoint
     * @name GetservicepointdetailsDetail
     * @request GET:/servicepoint/getservicepointdetails/{servicePointId}
     * @secure
     */
    getservicepointdetailsDetail: (
      servicePointId: string,
      params: RequestParams = {},
    ) =>
      this.request<ServicePointDetailResponse, any>({
        path: `/servicepoint/getservicepointdetails/${servicePointId}`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),
  };
}
