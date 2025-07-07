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

/**
 * Visiting address is where the item is pickuped or dropped off at the service point.
 * The delivery address is used in the EDI for optional service point.
 */
export interface Address {
  /**
   * The 2-letter country code
   * @example "SE"
   */
  countryCode?: string;
  /**
   * The city
   * @example "SOLNA"
   */
  city?: string;
  /**
   * The street name
   * @example "Terminalvägen"
   */
  streetName?: string;
  /**
   * The street number
   * @example "24"
   */
  streetNumber?: string;
  /**
   * The postal code
   * @example "17173"
   */
  postalCode?: string;
  /**
   * The type of the address
   * @example "VISITING"
   */
  addressType?: string;
  /** @example "The locker box is found on the 2:a floor" */
  additionalDescription?: string;
}

/** Additional information about parcel boxes */
export interface BoxType {
  /**
   * The Label for the box type
   * @example "MyBox"
   */
  label?: string;
  /**
   * The ID of the box type label
   * @format int32
   * @example 3
   */
  id?: number;
  /**
   * Describes if the box is located indoor or outdoor
   * @example "indoor"
   */
  located?: string;
  pickupRequirements?: PickupRequirement[];
}

/** Defines the requirements to be able to pickup the item */
export interface PickupRequirement {
  /**
   * ENUM for the pickup requirement
   * @example "1"
   */
  id?: string;
  /**
   * Label associated with the id
   * @example "PostNord APP"
   */
  label?: string;
}

/** The composite fault object containing an array of fault objects */
export interface CompositeFault {
  faults?: Faults[];
}

/** Fault object with the associated code and explanation text */
export interface Faults {
  /** @uniqueItems true */
  paramValues?: ParamValue[];
  /**
   * Explanation text message
   * @example "Missing parameter"
   */
  explanationText: string;
  /**
   * The defined fault code
   * @example "API-005"
   */
  faultCode?: string;
}

/** Map coordinates to the service point */
export interface Coordinate {
  /**
   * The 2-letter country code
   * @example "SE"
   */
  countryCode?: string;
  /**
   * Longitude
   * @example 59.35014139999998
   */
  northing: number;
  /**
   * Latitude
   * @example 18.009889600000005
   */
  easting: number;
  /**
   * Geodetic coordinate system
   * @example "EPSG:4326"
   */
  srId: string;
}

/** Customer support information */
export interface CustomerSupport {
  /**
   * The customer support phone number
   * @example "+46771333310"
   */
  customerSupportPhoneNo: string;
  /**
   * The 2-letter country code
   * @example "SE"
   */
  country: string;
}

/** Defines the PostNord capabilities associated with/what a recipient can drop off at a service point */
export interface DropOff {
  /**
   * Defines if items can be sent outside the nordic region: [true|false]
   * @example "true"
   */
  abroadExport?: string;
  /**
   * Defines the amount limit for value items
   * @example "100000"
   */
  amountLimit?: string;
  /**
   * Defines the type of supported customers meeting: [B2B | B2C]
   * @example "B2B"
   */
  customerFacing?: string;
  /**
   * Defines if prepaid items can be dropped off at the service point: [true|false]
   * @example "true"
   */
  prepaidOnly?: string;
  /**
   * Defines if only customers with an agreement can drop off items: [true|false]
   * @example "false"
   */
  agreementOnly?: string;
  products?: ProductDropOff[];
}

/** List of products */
export interface ProductDropOff {
  /**
   * Product name
   * @example "PARCELS"
   */
  name?: string;
  /** Time slots concerning drop offs */
  timeSlots?: DropOffTimeslots[];
}

/** Defines the postal codes which are covered by the service point */
export interface NotificationArea {
  postalCodes?: string[];
}

/** Popularity */
export interface Popularity {
  /**
   * Weekday
   * @example "MONDAY"
   */
  day?: string;
  /**
   * The percentage of visits the associated day
   * @format integer
   * @example 16
   */
  percent?: number;
  hours?: Hours[];
}

export interface Hours {
  /**
   * Hour of day
   * @example "07:00"
   */
  hour?: string;
  /**
   * The percentage of visits for that hour for the associated day
   * @format integer
   * @example 9
   */
  percent?: number;
  /**
   * The value is based on dividing the day-hour percent with the highest day-hour percent for the service point independent on day/hour
   * @format integer
   * @example 9
   */
  peakHourPercent?: number;
}

export interface PostalDate {
  /** @example "MONDAY" */
  openDay?: string;
  /** @example "07:00" */
  openTime?: string;
  /** @example "MONDAY" */
  closeDay?: string;
  /** @example "07:00" */
  closeTime?: string;
  /** @example "Ordinary opening hours" */
  note?: string;
}

export interface CountResponse {
  /**
   * The typeId
   * @example "2"
   */
  typeId?: string;
  /**
   * 2-letter country code
   * @example "SE"
   */
  countryCode?: string;
  /**
   * Number of service points
   * @example 1200
   */
  count?: number;
  detailedCount?: CountEligibleParcelOutlet[];
}

export interface CountEligibleParcelOutlet {
  /**
   * The name
   * @example "OptionalServicePoint"
   */
  name?: string;
  /** @example "true" */
  value?: string;
  /**
   * Number of service points
   * @example 1200
   */
  count?: number;
}

/** Name value pair object */
export interface ParamValue {
  /**
   * The parameter
   * @example "countryCode"
   */
  param: string;
  /**
   * The value for for the parameter
   * @example "SE"
   */
  value: string;
}

export interface ResponseDto {
  servicePointInformationResponse: ServicePointInformationResponse;
}

export interface DeltaResponseDto {
  servicePointInformationResponse: ServicePointInformationDeltaResponse;
}

export interface ServicePointInformationStore {
  /**
   * The unique ID used in the EDI for optional service point
   * @example "020001"
   */
  servicePointId?: string;
  /**
   * Refers to the name of location
   * @example "PostNord Service Point"
   */
  name?: string;
  /**
   * Information used for labels in Finland
   * @example "TUR"
   */
  routingCode?: string;
  /**
   * Information used for labels in Finland
   * @example "AKAA MH-ASIAMIES"
   */
  handlingOffice?: string;
  /**
   * Additional information about the servicepoint
   * @example "detailed information"
   */
  locationDetail?: string | null;
  /** Phone number to the cash register */
  phoneNoToCashRegister?: string | null;
  /**
   * The distance in meter to service point from a given address
   * @format int32
   * @example 1017
   */
  routeDistance?: number;
  /**
   * Supplier name
   * @example "SBClassic"
   */
  supplier?: string;
  /** Defines the rules when the service point is eligible to, select as optional service point */
  eligibleParcelOutlet?: EligibleParcelOutlet;
  /** Defines the PostNord capabilities associated with/what a recipient can drop off at a service point */
  dropOff?: DropOff;
  /** PostNord delivery capabilities e.g products, timeslots, features, heavy goods,etc */
  pickup?: Pickup;
  /** Defines the PostNord capabilities with regards to the customer meeting at the service point */
  buy?: Buy;
  /**
   * Visiting address is where the item is pickuped or dropped off at the service point.
   * The delivery address is used in the EDI for optional service point.
   */
  visitingAddress?: Address;
  /**
   * Visiting address is where the item is pickuped or dropped off at the service point.
   * The delivery address is used in the EDI for optional service point.
   */
  deliveryAddress?: Address;
  /** Defines the postal codes which are covered by the service point */
  notificationArea?: NotificationArea;
  coordinates?: Coordinate[];
  /** The service point opening hours */
  openingHours?: OpeningHours;
  popularTimes?: PopularTimes;
  /** Service point type information */
  type?: Type;
}

/** Service point type information */
export interface Type {
  /**
   * Type ID
   * @example 2
   */
  groupTypeId?: number;
  /**
   * Type ID name
   * @example "Service Box"
   */
  groupTypeName?: string;
  /**
   * Detailed type ID
   * @example 2
   */
  typeId?: number;
  /**
   * Deailed type name
   * @example "Parcel Box Location"
   */
  typeName?: string;
  /** Additional information about parcel boxes */
  boxType?: BoxType;
}

/** Special Date */
export interface SpecialDate {
  /**
   * Start date
   * @example "2020-12-25"
   */
  startDate?: string;
  /**
   * Reason
   * @example "Christmas Day"
   */
  reason?: string;
  /**
   * Opening time
   * @example "08:00"
   */
  openTime?: string;
  /**
   * Is closed:  [true|false]
   * @example "false"
   */
  isClosed?: string;
  /**
   * End date
   * @example "2020-12-25"
   */
  endDate?: string;
  /**
   * Close time
   * @example "12:00"
   */
  closeTime?: string;
}

export interface ServicePointInformationDeltaResponse {
  /** The composite fault object containing an array of fault objects */
  compositeFault?: CompositeFault;
  /** @example {"SE":{"added":["734084"],"changed":["293593","695894"],"removed":["734063"]}} */
  countries?: Record<string, Countries>;
  customerSupports?: CustomerSupport[];
  servicePoints?: ServicePointInformationStore[];
}

export interface Countries {
  added?: string[];
  changed?: string[];
  endSize?: string;
  removed?: string[];
  startSize?: string;
}

export interface ServicePointInformationResponse {
  /** The composite fault object containing an array of fault objects */
  compositeFault?: CompositeFault;
  paging?: Paging;
  urls?: Urlsv2[];
  customerSupports?: CustomerSupport[];
  servicePoints?: ServicePointInformationStore[];
}

/** The service point opening hours */
export interface OpeningHours {
  /** Date/times when the service point handles postal services   */
  postalServices?: PostalDate[];
  /** Special date/times when the service point doesn't handle postal services */
  specialDates?: SpecialDate[];
}

export interface PopularTimes {
  /**
   * Defines the popularity of the location. Gives a weekly (by day and hour) how popular
   * that particular location is based on a count factor.
   */
  popularity?: Popularity[];
}

export interface Paging {
  /**
   * Number of results per page
   * @example 1000
   */
  perPage?: number;
  /**
   * Total entries of results
   * @example 2500
   */
  totalEntries?: number;
  /**
   * Total pages in the results
   * @example 3
   */
  totalPages?: number;
  /**
   * Current page in the results
   * @example 1
   */
  currentPage?: number;
}

/** PostNord delivery capabilities e.g products, timeslots, features, heavy goods,etc */
export interface Pickup {
  /**
   * Items with cash on delivery can be picked up:  [true|false]
   * @example "true"
   */
  cashOnDelivery?: string;
  heavyGoodsProducts?: Product[];
  products?: ProductPickup[];
}

/** Defines the PostNord capabilities with regards to the customer meeting at the service point */
export interface Buy {
  products?: Product[];
}

/** List of products */
export interface ProductPickup {
  /**
   * Product name
   * @example "PARCELS"
   */
  name?: string;
  timeSlots?: Timeslots;
}

export interface Product {
  /**
   * Product name
   * @example "PARCELS"
   */
  name?: string;
}

export interface DropOffTimeslots {
  /** A dropped off before this time will be pickup by PostNord the same day */
  guaranteedDropOffTime?: DropOffDay[];
}

/** Day */
export interface DropOffDay {
  /**
   * Time
   * @example "08:30"
   */
  latestTime?: string;
  /**
   * Day
   * @example "SATURDAY"
   */
  day?:
    | 'ALLWEEK'
    | 'MONDAY'
    | 'TUESDAY'
    | 'WEDNESDAY'
    | 'THURSDAY'
    | 'FRIDAY'
    | 'SATURDAY'
    | 'SUNDAY';
}

/** Defines the rules when the service point is eligible to, select as optional service point */
export type EligibleParcelOutlet = Eligible[];

export interface Eligible {
  /**
   * Eligible Parcel Outlet ID
   * @example "1"
   */
  id?: string;
  /**
   * Eligible Parcel Outlet Name
   * @example "Optional Service Point"
   */
  name?: string;
  /**
   * Eligible Parcel Outlet Value (true/false)
   * @example "true"
   */
  value?: string;
}

/** Day */
export interface PickupDay {
  /**
   * Time
   * @example "08:30"
   */
  earliestTime?: string;
  /**
   * Day
   * @example "SATURDAY"
   */
  day?:
    | 'ALLWEEK'
    | 'MONDAY'
    | 'TUESDAY'
    | 'WEDNESDAY'
    | 'THURSDAY'
    | 'FRIDAY'
    | 'SATURDAY'
    | 'SUNDAY';
}

export interface Timeslots {
  /** Standard: defines the days when PostNord delivers to the service point and the time when it is available for pickup */
  availableForPickupStandard?: PickupDay[];
  /** Early Collect: defines the days when PostNord delivers to the service point and the time when it is available for pickup */
  availableForPickupEarlyCollect?: PickupDay[];
}

export interface ServicePointTypes {
  /** defines the DK service points types */
  DK?: ServicePointTypeId[];
  /** defines the FI service points types */
  FI?: ServicePointTypeId[];
  /** defines the NO service points types */
  false?: ServicePointTypeId[];
  /** defines the SE service points types */
  SE?: ServicePointTypeId[];
}

export interface ServicePointTypeId {
  /** @example "2" */
  id?: string;
  /** @example "Parcel Box Location" */
  name?: string;
  /** @example "2" */
  groupTypeId?: string;
  /** @example "Service box" */
  groupTypeName?: string;
}

/** PostNord standard error response message */
export interface ErrorResponse {
  /** The composite fault object containing an array of fault objects */
  compositeFault?: CompositeFault;
  /**
   * High level error message.
   * @example "Query parameter missing"
   */
  message: string;
}

/** The composite fault object containing an array of fault objects */
export interface CompositeFault {
  /** @uniqueItems true */
  faults?: Faults[];
}

/** Fault object with the associated code and explanation text */
export interface Fault {
  /** @uniqueItems true */
  paramValues?: ParamValue2[];
  /** @example "Missing parameter" */
  explanationText: string;
  /** @example "API-005" */
  faultCode?: string;
}

/** A parameter value pair is a set of two linked data items */
export interface ParamValue2 {
  param?: string;
  value?: string;
}

/** Error returned from S3 storage */
export interface Error {
  Code?: string;
  Message?: string;
  RequestId?: string;
  HostId?: string;
}

/** A value pair of URLs */
export interface Urlsv2 {
  /**
   * Defines the type of URL (TRACKING, BOOKPICKUP, SERVICEPOINTFILE, etc).
   * @example "SERVICEPOINTFILE"
   */
  type?: string;
  /**
   * The url
   * @example "https://api2.postnord.com/file/servicepoints/xdradsgsvs.json"
   */
  url?: string;
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
  public baseUrl: string = 'https://api2.postnord.com/rest/businesslocation';
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
 * @title Service Points V5
 * @version 5.0.14
 * @baseUrl https://api2.postnord.com/rest/businesslocation
 *
 * This section describes how to retrieve delivery-address information for Postnord-locations such as Service points, Parcel-boxes, Terminals and Collect-in-store locations.Includes the Nordic region and other parts of Europe.
 *
 * **MyPack Collect (19)** is mainly the service that needs this information in order to route a parcel to a specific delivery location (optional service point). It will also be requirement for **Expresspaket (42)** and **Parcel (18)** when using collect-in-store/Early collect.
 * - The additional service **"Optional Service Point" (A7)** enables the customer to choose which service point the parcel should be delivered to for collection/pickup.
 * - The additional service **"Collect In-Store" (E4)** enables the customer to choose which of the customer’s self-provided collection points/stores the parcel should be delivered to for collection/pickup. Requires a special contract and setup with Postnord.
 * - The additional service **"Early Collect" (F6)** enables the customer to choose service points that offers an earlier delivery of the parcel.
 * ---
 *
 * **These are the main uses cases for the APIs**
 *
 * - Find nearest service point based on an address, postal code, city, or geo co-ordinates
 * - Present for customers where they can collect or drop off parcels in the E-commerce platform.
 * - What to state as delivery-party In the PostNord EDI when the additional service "optional service point" is used.
 * - What to print as delivery-party On the PostNord Label when the additional service "optional service point" is used.
 *
 * _For detailed information about EDI and Labels, see our Implementation Guidelines: <BR> https://developer.postnord.com/edi/edis-and-labels#humany-developer-portal-edi-contact=/contact/4461_
 *
 * ---
 *
 * **Important**
 * - The service point ID:s are not unique, you need to combine the service point ID with the country code.
 * - Service points are changed on a regular basis, we recommend you update your local database every day.
 * - The delivery address should be used in the EDI and on the Label
 * - The visiting address is used to guide the customers to the service point
 *
 * ---
 *
 * **Nearest Service Points APIs**
 *
 * The APIs provides the nearest service points from a location defined by an address or geo co-ordinates.
 *
 * - Distance is based on driving route.
 *
 * The accuracy of what service points that are presented in the response and the distance to these service points is dependent on how detailed the information in the search criteria is.
 * - If the search includes a full address down to street number, the service will be able to calculate an exact starting point and thus the response will be as accurate as it can be.
 *
 * - If the search only contains country code and city there are two different risks of getting a response that the e-buyer will not be satisfied with.
 *
 * - One is that if there are many cities in the country with the name in the search, the system might choose the wrong city.
 * - The other is that the system will calculate the starting point as the center of the city. If the e-buyer lives in the outskirts of the city the presented service points might not be the ones nearest at all.
 *
 * The remedy for the first case is to add the postal code as a search parameter and for the second one to also add street. In some cases postal code and street are pretty much the same, hence the starting position will be almost the same regardless of what value used.
 *
 * ---
 *
 * **Service Points Information APIs**
 *
 * The APIs provides service points information using different types of selections; defined by the incoming query parameters.
 *
 * - The bypostalcode API will retrieve the default service point associated with the postal code area of notification.
 * - The ids will get you information about a single service point
 * - The information will get you information about the service points that meets the incoming query.
 *
 * These APIs can be used for multiple reasons, like informing your customers of the address and opening hours for a specific service point.
 *
 * ---
 *
 * **Service Points Delta Information APIs**
 *
 * The APIs provides the functionality to discover newly created, updated, or deleted service points without performing a full read of the target resource with every request.
 *
 * ---
 *
 * **API Information**
 *
 * | **Date**   | **Version** | **Description**                                          |
 * | ---------- | ----------- | -------------------------------------------------------- |
 * |  |       |  |
 *
 * | **Feature**| **Setting** | **Description**                                          |
 * | ---------- | ----------- | -------------------------------------------------------- |
 * | CORS       | True        | Enable access to the API from a different origin |
 * | SECURED    | False      |The API do not require a PostNord Oauth2 login         |
 * ---
 * <h1><strong>NOTE: Click on Authorization button and provide your apikey you received after signup</strong></h1>
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  v5 = {
    /**
     * @description **Description** Find Nearest Service Points allows you to fetch information directly to your E-commerce platform or other system. - Query the enables applications to discover the nearest service point by coordinate. - The response contains an array of service points sorted by distance from the search point.
     *
     * @tags Nearest Service Points
     * @name RestBusinesslocationV1ServicepointFindNearestByCoordinatesByReturntypeGet
     * @summary Find nearest service points by coordinates
     * @request GET:/v5/servicepoints/nearest/bycoordinates
     * @secure
     */
    restBusinesslocationV1ServicepointFindNearestByCoordinatesByReturntypeGet: (
      query: {
        /** Defines the response message format */
        returnType: 'json' | 'xml';
        /**
         * Defines the country where the service point is located. Country code in ISO 3166-1.
         * * Allowed value is one of SE, NO, FI, DK, DE, BE, NL, LU, EE, LV, LT, AT, FR, ES, AX, PL, PT, CZ, IE, SK, SI
         * @example "SE"
         */
        countryCode: string;
        /**
         * The Northing coordinate
         * @format double
         * @example 57.8727
         */
        northing: number;
        /**
         * The Easting coordinate
         * @format double
         * @example 11.968
         */
        easting: number;
        /**
         * Used to retreive service points for the countryCode that has an agreement to be used for senders in the agreementCountry. Defined in ISO 3166-1.
         * * Value can be one of **(SE,NO,DK,FI)**. If countryCode is one of SE,NO,DK,FI then agreementCountry can be left empty.
         * @example "DK"
         */
        agreementCountry?: string;
        /**
         * World Geodetic System reference (SRID), the latest revision is WGS 84 (also known as WGS 1984, EPSG 4326)
         * @default "EPSG:4326"
         */
        srId?: string;
        /**
         * The number of service points to be returned
         * @format int32
         * @default 5
         */
        numberOfServicePoints?: number;
        /**
         * Used to retreive service points belong to a customer key
         * * **Collect In Store**
         */
        customerKey?: string;
        /**
         * A context has the logic of what types of service points to include in the response.
         * * **optionalservicepoint** - active service points available for deliveries. (**Recommended value for checkout-solutions and TA-systems**)
         * * **earlycollect** - service points available for the addon earlycollect (**F6**)
         * * **saturdaydelivery** - returns service points with Saturday delivery. When paired with another context for example 'optionalservicepoint', will return all optional servicepoints with Saturday delivery
         * * **mypacksmall** - Used for service Mypack Small (NO). will return one service point with preference to parcel locker if within 500 meters driving distance from consumer address.
         * * **all** - returns all service points including service points not eligible for sorting and deliveries. (**Only use if you have a logic for filtering out the not eligible service points from reponse**)
         *
         * Several contexts can be selected via a comma separated list.
         * @default "optionalservicepoint"
         */
        context?: string;
        /**
         * Defines the objects/attributes that is included in the response message to the application.
         * * **public** - Standard set of objects/attributes necessary for PostNord Customer requirements (EDI, Delivery Checkouts, Map views, etc)
         * * **internal** - Extended set that includes all objects/attributes defined in the swagger model (**only use if you need other data than standard set and have separate filtering and logic to manage the response**)
         * @default "public"
         */
        responseFilter?: string;
        /**
         * Defines the type of the service point, used to retreive specified types.
         * * **If left empty** - all types are included
         * * **2** - Parcel Box Location (Nordic)
         * * **4** - Postbutik (DK)
         * * **6** - Posthus (DK)
         * * **22** - Letter Office (SE)
         * * **24** - Business Centre (SE)
         * * **25** - Servicepoint (SE)
         * * **37** - Servicepoint (NOR)
         * * **38** - Servicepoint (FIN)
         * * **44** - Postbutik med begrænset sortiment (DK)
         * * **46** - Erhvervscenter (DK)
         * * **51** - Collect in Store (Nordic)
         * * **54** - Delivery Office (SE)
         * * **61** - Servicepoint (Europe)
         * * **73** - Terminal pickup (SE)
         * * **74** - Letter terminal drop off (SE)
         *
         * A comma separated list of valid typeIds
         *
         * Recommended types for checkout-solutions:
         * * Optional service points - 4,6,24,25,37,38,44,46,54,61
         *
         * * Parcel-boxes - 2
         *
         * * Collect in store service points (Special agreement requred) - 51
         * * Early Collect (Special agreement requred) - 73
         *
         * Recommended is to divide the service points, parcel-boxes and collect in store.
         * @example "24,25,54"
         */
        typeId?: string;
        /**
         * Used to retrieve service points based on location placement
         * * **indoor**
         * * **outdoor**
         * * **all**
         * @default "all"
         */
        located?: string;
        /** JSONP enables making cross domain calls by generating script tags in the current document and expecting a result back to calls a specified callback handler. */
        callback?: string;
        /**
         * Add a prefix called Postnord to each service point name that defines that it belongs to PostNord.
         * @default "false"
         */
        whiteLabelName?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<ResponseDto, ErrorResponse | void>({
        path: `/v5/servicepoints/nearest/bycoordinates`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description **Description** - Query the enables applications to discover the default service point by postal code. - This is query is only valid for the countryCodes **(SE, NO, FI)**. - Service points Denmark are connected to more than one postal code.
     *
     * @tags Service Points Information
     * @name RestBusinesslocationV1ServicepointFindByPostalCodeByReturntypeGet
     * @summary Find the default service point by postal code
     * @request GET:/v5/servicepoints/bypostalcode
     * @secure
     */
    restBusinesslocationV1ServicepointFindByPostalCodeByReturntypeGet: (
      query: {
        /** Defines the response message format */
        returnType: 'json' | 'xml';
        /**
         * Defines the country where the service point is located. Country code in ISO 3166-1.
         * * Allowed value can be one of SE, FI, NO
         * @example "SE"
         */
        countryCode: string;
        /**
         * The postal code.
         * * The postal code should always be presented without country code and spaces.
         * * Hyphens are regarded as part of the postal code and should be included.'
         */
        postalCode: string;
        /**
         * A context has the logic of what types of service points to include in the response.
         * * **optionalservicepoint** - active service points available for deliveries. (**Recommended value for checkout-solutions and TA-systems**)
         * * **earlycollect** - service points available for the addon earlycollect (**F6**)
         * * **saturdaydelivery** - returns service points with Saturday delivery. When paired with another context for example 'optionalservicepoint', will return all optional servicepoints with Saturday delivery
         * * **all** - returns all service points including service points not eligible for sorting and deliveries. (**Only use if you have a logic for filtering out the not eligible service points from reponse**)
         *
         * Several contexts can be selected via a comma separated list.
         * @default "optionalservicepoint"
         */
        context?: string;
        /**
         * Used to retrieve service points based on location placement
         * * **indoor**
         * * **outdoor**
         * * **all**
         * @default "all"
         */
        located?: string;
        /**
         * JSONP enables making cross domain calls by generating script tags in the current document and expecting a result back to calls a specified callback handler.
         * @example "jsonp"
         */
        callback?: string;
        /**
         * Add a prefix called Postnord to each service point name that defines that it belongs to PostNord.
         * @default "false"
         */
        whiteLabelName?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<ResponseDto, ErrorResponse | void>({
        path: `/v5/servicepoints/bypostalcode`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description **Description** - Query the enables applications to discover the nearest service point by address. - Always use as detailed information as possible, to get the most accurate response. - The response contains an array of service points sorted by distance from the search point.
     *
     * @tags Nearest Service Points
     * @name RestBusinesslocationV5ServicepointFindNearestByAddressByReturntypeGet
     * @summary Find the nearest service points by address
     * @request GET:/v5/servicepoints/nearest/byaddress
     * @secure
     */
    restBusinesslocationV5ServicepointFindNearestByAddressByReturntypeGet: (
      query: {
        /** Defines the response message format */
        returnType: 'json' | 'xml';
        /**
         * Defines the country where the service point is located. Country code in ISO 3166-1.
         * * Allowed value is one of SE, NO, FI, DK, DE, BE, NL, LU, EE, LV, LT, AT, FR, ES, AX, , PL, PT, CZ, IE, SK, SI
         * @example "SE"
         */
        countryCode: string;
        /**
         * Used to retreive service points for the countryCode that has an agreement to be used for senders in the agreementCountry. Defined in ISO 3166-1.
         * * Value can be one of **(SE,NO,DK,FI)**. If countryCode is one of SE,NO,DK,FI agreementCountry can be left empty.
         * @example "SE"
         */
        agreementCountry?: string;
        /**
         * Used to retreive service points belong to a customer key
         * * **Collect In Store**
         */
        customerKey?: string;
        /**
         * The name of the city.
         * * Mandatory, if the postalCode is not provided.
         */
        city?: string;
        /**
         * The postal code.
         * * Mandatory, if the city is not provided.
         *
         * The postal code should always be presented without country code and spaces.
         * Hyphens are regarded as part of the postal code and should be included.'
         */
        postalCode?: string;
        /** Name of the street */
        streetName?: string;
        /** Street Number */
        streetNumber?: string;
        /**
         * The number of service points to be returned
         * @format int32
         * @default 5
         */
        numberOfServicePoints?: number;
        /**
         * World Geodetic System reference (SRID), the latest revision is WGS 84 (also known as WGS 1984, EPSG 4326)
         * @default "EPSG:4326"
         */
        srId?: string;
        /**
         * A context has the logic of what types of service points to include in the response.
         * * **optionalservicepoint** - active service points available for deliveries. (**Recommended value for checkout-solutions and TA-systems**)
         * * **earlycollect** - service points available for the addon earlycollect (**F6**)
         * * **saturdaydelivery** - returns service points with Saturday delivery. When paired with another context for example 'optionalservicepoint', will return all optional servicepoints with Saturday delivery
         * * **mypacksmall** - Used for service Mypack Small (NO). will return one service point with preference to parcel locker if within 500 meters driving distance from consumer address.
         * * **all** - returns all service points including service points not eligible for sorting and deliveries. (**Only use if you have a logic for filtering out the not eligible service points from reponse**)
         *
         * Several contexts can be selected via a comma separated list.
         * @default "optionalservicepoint"
         */
        context?: string;
        /**
         * Defines the objects/attributes that is included in the response message to the application.
         * * **public** - Standard set of objects/attributes necessary for PostNord Customer requirements (EDI, Delivery Checkouts, Map views, etc)
         * * **internal** - Extended set that includes all objects/attributes defined in the swagger model (**only use if you need other data than standard set and have separate filtering and logic to manage the response**)
         * @default "public"
         */
        responseFilter?: string;
        /**
         * Defines the type of the service point, used to retreive specified types.
         * * **If left empty** - all types are included
         * * **2** - Parcel Box Location (Nordic)
         * * **4** - Postbutik (DK)
         * * **6** - Posthus (DK)
         * * **22** - Letter Office (SE)
         * * **24** - Business Centre (SE)
         * * **25** - Servicepoint (SE)
         * * **37** - Servicepoint (NOR)
         * * **38** - Servicepoint (FIN)
         * * **44** - Postbutik med begrænset sortiment (DK)
         * * **46** - Erhvervscenter (DK)
         * * **54** - Delivery Office (SE)
         * * **61** - Servicepoint (Europe)
         * * **73** - Terminal pickup (SE)
         * * **74** - Letter terminal drop off (SE)
         *
         * A comma separated list of valid typeIds
         *
         * Recommended types for checkout-solutions:
         * * Optional service points - 4,6,24,25,37,38,44,46,54,61
         *
         * * Parcel-boxes - 2
         *
         * * Collect in store service points (Special agreement requred) - 51
         * * Early Collect (Special agreement requred) - 73
         *
         * Recommended is to divide the service points, parcel-boxes and collect in store.
         * @example "24,25,54"
         */
        typeId?: string;
        /**
         * Used to retrieve service points based on location placement
         * * **indoor**
         * * **outdoor**
         * * **all**
         * @default "all"
         */
        located?: string;
        /** JSONP enables making cross domain calls by generating script tags in the current document and expecting a result back to calls a specified callback handler. */
        callback?: string;
        /**
         * Add a prefix called Postnord to each service point name that defines that it belongs to PostNord.
         * @default "false"
         */
        whiteLabelName?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<ResponseDto, ErrorResponse | void>({
        path: `/v5/servicepoints/nearest/byaddress`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description **Description** - Query the enables applications to discover service points using  one or more service point IDs.
     *
     * @tags Service Points Information
     * @name GetServicePointByIds
     * @summary Find service points by IDs
     * @request GET:/v5/servicepoints/ids
     * @secure
     */
    getServicePointByIds: (
      query: {
        /** Defines the response message format */
        returnType: 'json' | 'xml';
        /**
         * Defines the country where the service point is located. Country code in ISO 3166-1.
         * * Allowed value can be one of SE, NO, FI, DK, DE, BE, NL, LU, EE, LV, LT, AT, FR, ES, AX, PL, PT, CZ, IE, SK, SI
         * @example "SE"
         */
        countryCode: string;
        /**
         * Service point Id's. Several Id's can be selected via an comma separated list, i.e 10000,10001,10028. One and only one country code must be given when this parameter is supplied
         * @example "376062"
         */
        ids: string;
        /**
         * Defines the objects/attributes that is included in the response message to the application.
         * * **public** - returns objects/attributes nessassary for PostNord Customer requirements (EDI, Delivery Checkouts, Map views, ..)
         * * **internal** - returns all objects/attributes defined in the swagger model
         * @default "public"
         */
        responseFilter?: 'public' | 'internal';
        /**
         * Used to retrieve service points based on location placement
         * * **indoor**
         * * **outdoor**
         * * **all**
         * @default "all"
         */
        located?: string;
        /**
         * JSONP enables making cross domain calls by generating script tags in the current document and expecting a result back to calls a specified callback handler.
         * @example "jsonp"
         */
        callback?: string;
        /**
         * Add a prefix called Postnord to each service point name that defines that it belongs to PostNord.
         * @default "false"
         */
        whiteLabelName?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<ResponseDto, ErrorResponse | void>({
        path: `/v5/servicepoints/ids`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description **Description** - Query the enables applications to discover service points using  defined parameter keys. This endpoint now supports gzip response. You can add **Accept-Encoding: gzip** in request header.
     *
     * @tags Service Points Information
     * @name GetServicePoints
     * @summary Find service points by parameters keys
     * @request GET:/v5/servicepoints/information
     * @secure
     */
    getServicePoints: (
      query: {
        /** Defines the response message format */
        returnType: 'json' | 'xml';
        /**
         * Defines the country where the service point is located. Country code in ISO 3166-1.
         * * Allowed values are SE, NO, FI, DK, DE, BE, NL, LU, EE, LV, LT, AT, FR,ES, AX, PL, PT, CZ, IE, SK, SI
         * * If left empty the response contains all available Nordic countries service points (SE,FI,NO,DK)
         *
         * Several countries can be selected via a comma separated list.
         * @example "SE,FI,NO,DK"
         */
        countryCode?: string;
        /**
         * Used to retreive service points for the countryCode that has an agreement to be used for senders in the agreementCountry. Defined in ISO 3166-1.
         * * Value can be one of **(SE,NO,DK,FI)**. If countryCode is one of SE,NO,DK,FI agreementCountry can be left empty.
         * @example "SE"
         */
        agreementCountry?: string;
        /**
         * Used to retreive service points belong to a customer key
         * * **Collect In Store**
         */
        customerKey?: string;
        /**
         * A context has the logic of what types of service points to include in the response.
         * * **optionalservicepoint** - active service points available for deliveries. (**Recommended value for checkout-solutions and TA-systems**)
         * * **earlycollect** - service points available for the addon earlycollect (**F6**)
         * * **saturdaydelivery** - returns service points with Saturday delivery. When paired with another context for example 'optionalservicepoint', will return all optional servicepoints with Saturday delivery
         * * **all** - returns all service points including service points not eligible for sorting and deliveries. (**Only use if you have a logic for filtering out the not eligible service points from reponse**)
         *
         * Several contexts can be selected via a comma separated list.
         * @default "optionalservicepoint"
         */
        context?: string;
        /**
         * Defines the objects/attributes that is included in the response message to the application.
         * * **public** - Standard set of objects/attributes necessary for PostNord Customer requirements (EDI, Delivery Checkouts, Map views, etc)
         * * **internal** - Extended set that includes all objects/attributes defined in the swagger model (**only use if you need other data than standard set and have separate filtering and logic to manage the response**)
         * @default "public"
         */
        responseFilter?: string;
        /**
         * Defines the type of the service point, used to retreive specified types.
         * * **If left empty** - all types are included
         * * **2** - Parcel Box Location (Nordic)
         * * **4** - Postbutik (DK)
         * * **6** - Posthus (DK)
         * * **22** - Letter Office (SE)
         * * **24** - Business Centre (SE)
         * * **25** - Servicepoint (SE)
         * * **37** - Servicepoint (NOR)
         * * **38** - Servicepoint (FIN)
         * * **44** - Postbutik med begrænset sortiment (DK)
         * * **46** - Erhvervscenter (DK)
         * * **51** - Collect in Store (Nordic)
         * * **54** - Delivery Office (SE)
         * * **61** - Servicepoint (Europe)
         * * **73** - Terminal pickup (SE)
         * * **74** - Letter terminal drop off (SE)
         *
         * A comma separated list of valid typeIds
         *
         * Recommended types for checkout-solutions:
         * * Optional service points - 4,6,24,25,37,38,44,46,54,61
         *
         * * Parcel-boxes - 2
         *
         * * Collect in store service points (Special agreement requred) - 51
         * * Early Collect (Special agreement requred) - 73
         *
         * Recommended is to divide the service points, parcel-boxes and collect in store.
         * @example "25"
         */
        typeId?: string;
        /**
         * Used to retrieve service points based on location placement
         * * **indoor**
         * * **outdoor**
         * * **all**
         * @default "all"
         */
        located?: string;
        /** JSONP enables making cross domain calls by generating script tags in the current document and expecting a result back to calls a specified callback handler.           */
        callback?: string;
        /**
         * Generates a GZIP file containing the reponse for the request, an URL is returned associated with the stored response file. If this parameter is true then the parameters page and perPage will have no effect.
         * @default "false"
         */
        fileUrlResponse?: string;
        /** Page in the paginated list. This feature is activated, when a number is given here. */
        page?: number;
        /**
         * Number of results per page. Default and max is 1000.
         * @max 1000
         * @default 1000
         */
        perPage?: number;
        /**
         * Add a prefix called Postnord to each service point name that defines that it belongs to PostNord.
         * @default "false"
         */
        whiteLabelName?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<ResponseDto, ErrorResponse | void>({
        path: `/v5/servicepoints/information`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description **Description** - Query the enables applications to discover service points using  defined parameter keys.
     *
     * @tags Service Points Information
     * @name ServicePointCounts
     * @summary Count query by parameter keys
     * @request GET:/v5/servicepoints/counts
     * @secure
     */
    servicePointCounts: (
      query: {
        /**
         * Defines the country where the service point is located. Country code in ISO 3166-1.
         * * Value can be one of SE, NO, FI, DK, DE, BE, NL, LU, EE, LV, LT, AT, FR, ES, AX, PL, PT, CZ, IE, SK, SI
         */
        countryCode: string;
        /**
         * Defines the type of the service point, used to retreive specified types.
         * * **If left empty** - all types are included
         * * **2** - Parcel Box Location (Nordic)
         * * **4** - Postbutik (DK)
         * * **6** - Posthus (DK)
         * * **22** - Letter Office (SE)
         * * **24** - Business Centre (SE)
         * * **25** - Servicepoint (SE)
         * * **37** - Servicepoint (NOR)
         * * **38** - Servicepoint (FIN)
         * * **44** - Postbutik med begrænset sortiment (DK)
         * * **46** - Erhvervscenter (DK)
         * * **51** - Collect in Store (Nordic)
         * * **54** - Delivery Office (SE)
         * * **61** - Servicepoint (Europe)
         *
         * A comma separated list of valid typeIds
         */
        typeId?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<CountResponse, ErrorResponse | void>({
        path: `/v5/servicepoints/counts`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description **Description** - Delta query enables applications to discover newly created, updated, or deleted service points without performing a full read of the target resource with every request.
     *
     * @tags Service Points Delta Information
     * @name GetServicePointsDeltaInfo
     * @summary Delta query by parameters keys
     * @request GET:/v5/servicepoints/delta/information
     * @secure
     */
    getServicePointsDeltaInfo: (
      query: {
        /** Defines the response message format */
        returnType: 'json';
        /**
         * Defines the country where the service point is located. Country code in ISO 3166-1.
         * * Allowed values are SE, NO, FI, DK, DE, BE, NL, LU, EE, LV, LT, AT, FR, ES, AX, PL, PT, CZ, IE, SK, SI
         * * If left empty the response contains all available Nordic countries service points (SE,FI,NO,DK)
         *
         * Several countries can be selected via a comma separated list.
         * @example "SE,FI,NO,DK"
         */
        countryCode?: string;
        /**
         * Used to retreive service points for the countryCode that has an agreement to be used for senders in the agreementCountry. Defined in ISO 3166-1.
         * * Value can be one of **(SE,NO,DK,FI)**. If countryCode is one of SE,NO,DK,FI then agreementCountry can be left empty.
         * @example "SE"
         */
        agreementCountry?: string;
        /**
         * Defines the **startDate** of the delta timespan.
         * * Supports upto 30 days before the **endDate**
         * @example "2020-08-01"
         */
        startDate: string;
        /**
         * Defines the **endDate** of the delta timespan.
         * * If left empty the default value is **current date**
         * @example "2020-08-05"
         */
        endDate?: string;
        /**
         * Defines if the response should include the full service point information about added or updated service points.
         * @default false
         */
        content?: boolean;
        /**
         * Used to retreive service points belong to a customer key
         * * **Collect In Store**
         */
        customerKey?: string;
        /**
         * A context has the logic of what types of service points to include in the response.
         * * **optionalservicepoint** - active service points available for deliveries. (**Recommended value for checkout-solutions and TA-systems**)
         * * **earlycollect** - service points available for the addon earlycollect (**F6**)
         * * **saturdaydelivery** - returns service points with Saturday delivery. When paired with another context for example 'optionalservicepoint', will return all optional servicepoints with Saturday delivery
         * * **all** - returns all service points including service points not eligible for sorting and deliveries. (**Only use if you have a logic for filtering out the not eligible service points from reponse**)
         *
         * Several contexts can be selected via a comma separated list.
         * @default "optionalservicepoint"
         */
        context?: string;
        /**
         * Defines the objects/attributes that is included in the response message to the application.
         * * **public** - returns objects/attributes nessassary for PostNord Customer requirements (EDI, Delivery Checkouts, Map views, ..)
         * * **internal** - returns all objects/attributes defined in the swagger model
         * @default "public"
         */
        responseFilter?: 'public' | 'internal';
        /** JSONP enables making cross domain calls by generating script tags in the current document and expecting a result back to calls a specified callback handler. */
        callback?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<DeltaResponseDto, ErrorResponse | void>({
        path: `/v5/servicepoints/delta/information`,
        method: 'GET',
        query: query,
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get service point file of all Nordic countries (SE,FI,DK,NO) from S3 storage. You can download previous service point file upto 7 days from current date.
     *
     * @tags Service Points File
     * @name ServicePointFile
     * @summary Get service point file of all Nordic countries (SE,FI,DK,NO).
     * @request GET:/v5/servicepoints/file/ALL-SE-FI-DK-NO-{date}.json.gz
     * @secure
     */
    servicePointFile: (date: string, params: RequestParams = {}) =>
      this.request<ResponseDto, ErrorResponse | Error | void>({
        path: `/v5/servicepoints/file/ALL-SE-FI-DK-NO-${date}.json.gz`,
        method: 'GET',
        secure: true,
        ...params,
      }),

    /**
     * @description Get the changes of service points of all Nordic countries (SE,FI,DK,NO) from date specified upto current date. File available upto 30 days backward from current date. Download the file using the URL in reponse.
     *
     * @tags Service Points File
     * @name ServicePointDeltaFile
     * @summary Get the changes of service points of all Nordic countries (SE,FI,DK,NO).
     * @request GET:/v5/servicepoints/delta/file/ALL-DELTA-SE-FI-DK-NO-{from_date}.json.gz
     * @secure
     */
    servicePointDeltaFile: (fromDate: string, params: RequestParams = {}) =>
      this.request<DeltaResponseDto, ErrorResponse | Error>({
        path: `/v5/servicepoints/delta/file/ALL-DELTA-SE-FI-DK-NO-${fromDate}.json.gz`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),

    /**
     * @description Get all valid service point types and group types for Nordic countries (SE,FI,DK,NO)
     *
     * @tags Service Points Types
     * @name ServicePointTypes
     * @summary Get all valid service point types.
     * @request GET:/v5/servicepoints/types
     * @secure
     */
    servicePointTypes: (params: RequestParams = {}) =>
      this.request<ServicePointTypes, ErrorResponse | Error | void>({
        path: `/v5/servicepoints/types`,
        method: 'GET',
        secure: true,
        format: 'json',
        ...params,
      }),
  };
  v1 = {
    /**
     * @description Imports from BLOM Expose
     *
     * @tags Service Points Caching
     * @name GetFileListFromBlom
     * @summary Imports from BLOM Expose
     * @request GET:/v1/servicepoints/blom/sync
     * @secure
     */
    getFileListFromBlom: (params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/v1/servicepoints/blom/sync`,
        method: 'GET',
        secure: true,
        ...params,
      }),

    /**
     * @description Gets current state (Enabled/Disabled) of cron schedule for importing from BLOM Expose
     *
     * @tags Service Points Caching
     * @name GetBlomExposeSyncToggleState
     * @summary Gets current state (Enabled/Disabled) of cron schedule for importing from BLOM Expose
     * @request GET:/v1/servicepoints/blom/sync/toggle
     * @secure
     */
    getBlomExposeSyncToggleState: (params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/v1/servicepoints/blom/sync/toggle`,
        method: 'GET',
        secure: true,
        ...params,
      }),

    /**
     * @description Enables/Disables cron schedule for importing from BLOM Expose
     *
     * @tags Service Points Caching
     * @name ToggleBlomExposeSync
     * @summary Enables/Disables cron schedule for importing from BLOM Expose
     * @request PUT:/v1/servicepoints/blom/sync/toggle
     * @secure
     */
    toggleBlomExposeSync: (
      query: {
        /** the state of cron scheduler to be set */
        enable: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<void, void>({
        path: `/v1/servicepoints/blom/sync/toggle`,
        method: 'PUT',
        query: query,
        secure: true,
        ...params,
      }),

    /**
     * @description List of BLOM Expose sync executions
     *
     * @tags Service Points Caching
     * @name GetBlomExposeSyncExecutions
     * @summary List of BLOM Expose sync executions
     * @request GET:/v1/servicepoints/blom/sync/executions
     * @secure
     */
    getBlomExposeSyncExecutions: (params: RequestParams = {}) =>
      this.request<void, void>({
        path: `/v1/servicepoints/blom/sync/executions`,
        method: 'GET',
        secure: true,
        ...params,
      }),
  };
}
