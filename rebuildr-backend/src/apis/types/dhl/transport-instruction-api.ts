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

export interface Shipment {
  /**
   * The shipment/tracking id: The unique global number that ensures that packages are not separated from each other during transport from one point to another. Leave empty to get it assigned automatically.
   * @maxLength 10
   * @example ""
   */
  id?: string;
  /**
   * See the product documentation for available options.
   * @maxLength 3
   * @example "103"
   */
  productCode: string;
  /** @format date */
  shippingDate?: string;
  /**
   * Used with **DHL Eurapid** and **DHL EuroConnect**. The earliest pickup date. Depending on booking deadline and availability the pickup date may be altered by DHL Freight.
   * @format date
   */
  pickupDate?: string;
  /**
   * Required with **DHL Eurapid** and Commited Delivery Date (CDD).
   * @format date
   */
  requestedDeliveryDate?: string;
  /** @format date */
  plannedDeliveryDate?: string;
  /** @maxLength 140 */
  pickupInstruction?: string;
  /** @maxLength 140 */
  deliveryInstruction?: string;
  /**
   * @format int32
   * @max 999
   * @example 1
   */
  totalNumberOfPieces?: number;
  /**
   * The shipemnts total weight weight in kg
   * @format double
   * @max 99999
   * @example 19.5
   */
  totalWeight?: number;
  /**
   * The shipemnts total volume in mÂ³
   * @format double
   * @max 999
   */
  totalVolume?: number;
  /**
   * A loading meter (LDM) is 1 meter of the loading space of a truckâ€™s width and full height. Usually calculated for goods that cannot be stacked on or with other goods.
   * @format double
   * @max 99
   * @example null
   */
  totalLoadingMeters?: number;
  /**
   * Pallet place (PPL) is based on the dimensions of a EUR pallet: 120 Ã— 80 cm. Usually calculated for goods that cannot be stacked on or with other goods. 1 PLL =  0.4 LDM.
   * @format double
   * @max 999
   * @example null
   */
  totalPalletPlaces?: number;
  /** @maxItems 99 */
  references?: Reference[];
  payerCode: PayerCode;
  /**
   * @maxItems 6
   * @minItems 2
   */
  parties: Party[];
  /** @maxItems 999 */
  pieces: Piece[];
  routingCode?: string;
  additionalServices?: AdditionalServicesDTO;
  customsInformation?: CustomsInformation;
}

export interface Reference {
  /** @maxLength 3 */
  qualifier: string;
  /** @maxLength 35 */
  value: string;
}

export interface PayerCode {
  /**
   * See the product documentation for available options based on selected product.
   * @maxLength 3
   * @example "1"
   */
  code: string;
  /**
   * @maxLength 17
   * @example ""
   */
  location?: string;
}

export interface Party {
  /**
   * For a consignor, consignee or freight payer the customer/agreement number. Mandatory on the part according to the payer code. For a access point, i.e. parcels shop, parcel station etc, this is the identifier of this location.
   * @maxLength 15
   */
  id?: string;
  /** @maxLength 15 */
  type:
    | "Consignor"
    | "Pickup"
    | "Consignee"
    | "Delivery"
    | "AccessPoint"
    | "FreightPayer";
  /**
   * Used for customs clearance when importing or exporting with countries outside the EU.
   * @maxLength 20
   * @example ""
   */
  vatEoriSocialSecurityNumber?: string;
  /** @maxLength 35 */
  name: string;
  /** @maxLength 35 */
  contactName?: string;
  /** @maxItems 99 */
  references?: string[];
  address: Address;
  /** @maxLength 64 */
  phone?: string;
  /** @maxLength 64 */
  email?: string;
  /**
   * Use with access point to state if itâ€™s a parcels shop, parcel station etc.
   * @maxLength 15
   */
  subType?:
    | "ParcelShop"
    | "ParcelStation"
    | "Servicepoint"
    | "Locker"
    | "Postoffice"
    | "Postbank";
}

export interface AdditionalServicesDTO {
  /** @example false */
  bookIn?: boolean;
  /** @example false */
  carryingHelpPickup?: boolean;
  /** @example false */
  carryingHelpToRoomOfChoice?: boolean;
  cashOnDelivery?: CashOnDeliveryOptions;
  /** @example false */
  collectionAtTerminal?: boolean;
  customsCustomersOwnDeclaration?: CustomsCustomersOwnDeclarationOptions;
  /** @example false */
  customsHandlingFullService?: boolean;
  /** @example false */
  customsHandlingStandard?: boolean;
  customsJointDeclaration?: CustomsJointDeclarationOptions;
  /** @example false */
  dangerousGoods?: boolean;
  /** @example false */
  dangerousGoodsDomestic?: boolean;
  /** @example false */
  dangerousGoodsLimitedQuantity?: boolean;
  /** @example false */
  deliveryAtConstructionSite?: boolean;
  deliveryMonitoringArrivedAtDhlTerminal?: DeliveryMonitoringOptions;
  deliveryMonitoringCollectedByReciever?: DeliveryMonitoringOptions;
  deliveryMonitoringDelivered?: DeliveryMonitoringOptions;
  deliveryMonitoringNotCollectedByReciever?: DeliveryMonitoringOptions;
  deliveryMonitoringOutForDelivery?: DeliveryMonitoringOptions;
  deliveryMonitoringPickup?: DeliveryMonitoringOptions;
  /** @example false */
  deliveryWithIdControl?: boolean;
  /** @example false */
  deliveryWithoutIdControl?: boolean;
  /** @example false */
  deliveryWithoutProofOfDelivery?: boolean;
  doorstepDelivery?: DoorstepDeliveryOptions;
  /** @example false */
  emptyPalletPickup?: boolean;
  eurPalletExchange?: EURPalletExchangeOptions;
  eveningDeliveryZoneA?: boolean;
  /** @example false */
  eveningDeliveryZoneB?: boolean;
  /** @example false */
  eveningDeliveryZoneC?: boolean;
  /** @example false */
  eveningDeliveryZoneD?: boolean;
  /** @example false */
  eveningDeliveryZoneE?: boolean;
  freightSubsidy?: FreightSubsidyOptions;
  /** @example false */
  greenFreight?: boolean;
  hardcopyProofOfDelivery?: HardcopyProofOfDeliveryOptions;
  /** @example false */
  indoorDelivery?: boolean;
  installation?: InstallationOptions;
  installationAdvanced?: InstallationAdvancedOptions;
  insurance?: InsuranceOptions;
  highValueShipment?: HighValueShipmentOptions;
  m20?: M20Options;
  m40?: M40Options;
  m60?: M60Options;
  nonStackable?: boolean;
  /** @example false */
  notification?: boolean;
  /** @example false */
  notificationECE?: boolean;
  /** @example false */
  notificationByLetter?: boolean;
  onlineAppointmentBooking?: OnlineAppointmentBookingOptions;
  /** @example false */
  packagingRemoval?: boolean;
  /** @example false */
  preAdvice?: boolean;
  preAdviceByDriver?: PreAdviceByDriverOptions;
  /** @example false */
  priorityServiceG7?: boolean;
  /** @example false */
  priorityServiceG10?: boolean;
  /** @example false */
  priorityServiceG12?: boolean;
  removalOfReplacedGoods?: RemovalOfReplacedGoodsOptions;
  sortAndQuantity?: SortAndQuantityOptions;
  /** @example false */
  tailLiftLoading?: boolean;
  /** @example false */
  tailLiftUnloading?: boolean;
  thermoCold?: ThermoColdOptions;
  thermoFreeze?: ThermoFreezeOptions;
  thermoWarm?: ThermoWarmOptions;
  timeDefiniteLoading?: TimeDefiniteLoadingOptions;
  timeDefiniteUnloading?: TimeDefiniteUnloadingOptions;
  /** @example false */
  truck?: boolean;
  /** @example false */
  twoManHandling?: boolean;
  voecSupplyVAT?: VoecSupplyVATOptions;
  /** @example false */
  weekendDelivery?: boolean;
  fixedDeliveryDate?: FixedDeliveryDateOptions;
  climateNeutral?: boolean;
  bookInWithInfo?: BookInWithInfoOptions;
  /** @example false */
  priorityServiceP10?: boolean;
  /** @example false */
  priorityServiceP12?: boolean;
  /** @example false */
  dropOffByConsignor?: boolean;
  /** @example false */
  personalDelivery?: boolean;
  /** @example false */
  preAdvicePickup?: boolean;
  /** @example false */
  after12Delivery?: boolean;
  /** @example false */
  timeSlotBookingPickup?: boolean;
  /** @example false */
  timeSlotBookingDelivery?: boolean;
  /** @example false */
  sideLoadingPickup?: boolean;
  /** @example false */
  sideUnloadingDelivery?: boolean;
  availablePickupTime?: AvailablePickupTimeOptions;
  availableDeliveryTime?: AvailableDeliveryTimeOptions;
  preAdviceByDriverPickup?: PreAdviceByDriverPickupOptions;
}

export interface CustomsInformation {
  /** @maxItems 999 */
  customsDocuments?: CustomsDocument[];
  /** @maxItems 999 */
  customsCommodities?: CustomsCommodity[];
}

export interface Piece {
  /**
   * The SSCC (Serial Shipping Container Code) a unique GS1/GS1-128 numbers used to identify a logistic unit, such as a case, pallet or parcel. Leave empty to get it assigned automatically.
   * @example []
   */
  id?: string[];
  /** @maxLength 70 */
  goodsType?: string;
  /**
   * See the product documentation for available options based on selected product.
   * @maxLength 4
   */
  packageType?: string;
  /** @maxLength 17 */
  marksAndNumbers?: string;
  /**
   * @format int32
   * @min 1
   * @max 999
   */
  numberOfPieces: number;
  /**
   * Item weight in kg
   * @format double
   * @max 99999
   */
  weight: number;
  /**
   * Item volume in mÂ³
   * @format double
   * @max 999
   */
  volume?: number;
  /**
   * @format double
   * @max 99
   */
  loadingMeters?: number;
  /**
   * @format double
   * @max 999
   */
  palletPlaces?: number;
  /**
   * Item width in cm
   * @format double
   * @max 999
   */
  width?: number;
  /**
   * Item height in cm
   * @format double
   * @max 999
   */
  height?: number;
  /**
   * Item length in cm
   * @format double
   * @max 9999
   */
  length?: number;
  /** Used with **DHL Eurapid** and **DHL EuroConnect** */
  dangerousGoods?: DangerousGoods;
  stackable?: boolean;
}

export interface AdditionalInformation {
  code?: string;
  stringValue?: string;
  /** @format date-time */
  dateValue?: string;
  /** @format double */
  numericValue?: number;
}

export interface Address {
  /** @maxLength 35 */
  street: string;
  /** @maxLength 10 */
  streetNumber?: string;
  /** @maxLength 35 */
  additionalAddressInfo?: string;
  /** @maxLength 35 */
  cityName: string;
  /** @maxLength 9 */
  postalCode?: string;
  /** @maxLength 3 */
  countryCode: string;
  /** @maxLength 20 */
  accessCode?: string;
}

export interface CashOnDeliveryOptions {
  /** @format int64 */
  amount: number;
  /** @maxLength 9 */
  bankGiroNumber?: string;
  /** @maxLength 9 */
  plusGiroNumber?: string;
  /** @maxLength 35 */
  reference?: string;
  /** @maxLength 35 */
  currency: string;
}

export interface CustomsCustomersOwnDeclarationOptions {
  /** @maxLength 70 */
  customsId: string;
  /** @maxLength 70 */
  customsClearanceInstruction?: string;
}

export interface CustomsJointDeclarationOptions {
  /** @maxLength 35 */
  sfid: string;
}

export interface DeliveryMonitoringOptions {
  /** @maxLength 64 */
  email?: string;
  /** @maxLength 20 */
  smsPhoneNumber?: string;
}

export interface DoorstepDeliveryOptions {
  /** @maxLength 20 */
  accessCode?: string;
}

export interface EURPalletExchangeOptions {
  /**
   * @format int32
   * @max 999
   */
  quantity: number;
  /** @maxLength 6 */
  consignorPalletRegistrationNumber?: string;
  /** @maxLength 6 */
  consigneePalletRegistrationNumber?: string;
}

export interface FreightSubsidyOptions {
  /**
   * @format int32
   * @max 99999
   */
  ncmNumber: number;
}

export interface HardcopyProofOfDeliveryOptions {
  /** @maxLength 64 */
  email?: string;
}

export interface InstallationOptions {
  /**
   * @format int32
   * @min 1
   * @max 999
   */
  quantity: number;
}

export interface InstallationAdvancedOptions {
  /**
   * @format int32
   * @min 1
   * @max 999
   */
  quantity: number;
}

export interface InsuranceOptions {
  /** @format double */
  value: number;
  /** @maxLength 3 */
  currency: string;
}

export interface HighValueShipmentOptions {
  /** @format double */
  value: number;
  /** @maxLength 3 */
  currency: string;
}

export interface M20Options {
  /**
   * @format int32
   * @min 1
   * @max 999
   */
  quantity: number;
}

export interface M40Options {
  /**
   * @format int32
   * @min 1
   * @max 999
   */
  quantity: number;
}

export interface M60Options {
  /**
   * @format int32
   * @min 1
   * @max 999
   */
  quantity: number;
}

export interface OnlineAppointmentBookingOptions {
  responseText?: string;
}

export interface PreAdviceByDriverOptions {
  /** @maxLength 64 */
  phone?: string;
}

export interface RemovalOfReplacedGoodsOptions {
  /**
   * @format int32
   * @min 1
   * @max 999
   */
  quantity: number;
}

export interface SortAndQuantityOptions {
  /**
   * @format double
   * @max 999
   */
  sort: number;
  /**
   * @format double
   * @max 9999
   */
  quantity: number;
}

export interface ThermoColdOptions {
  /** @format double */
  min?: number;
  /** @format double */
  max?: number;
}

export interface ThermoFreezeOptions {
  /** @format double */
  min?: number;
  /** @format double */
  max?: number;
}

export interface ThermoWarmOptions {
  /** @format double */
  min?: number;
  /** @format double */
  max?: number;
}

export interface TimeDefiniteLoadingOptions {
  /** @format date-time */
  dateTime: string;
}

export interface TimeDefiniteUnloadingOptions {
  /** @format date-time */
  dateTime: string;
}

export interface VoecSupplyVATOptions {
  /** @maxLength 20 */
  vatId?: string;
}

export interface FixedDeliveryDateOptions {
  /** @format date */
  date: string;
}

export interface AvailableDeliveryTimeOptions {
  /**
   * @minLength 3
   * @pattern ^(?:[01]?\d|2[0-3])(?::[0-5]\d){1,2}$
   * @example "07:30"
   */
  fromTime: string;
  /**
   * @minLength 3
   * @pattern ^(?:[01]?\d|2[0-3])(?::[0-5]\d){1,2}$
   * @example "16:30"
   */
  toTime: string;
}

export interface AvailablePickupTimeOptions {
  /**
   * @minLength 3
   * @pattern ^(?:[01]?\d|2[0-3])(?::[0-5]\d){1,2}$
   * @example "07:30"
   */
  fromTime: string;
  /**
   * @minLength 3
   * @pattern ^(?:[01]?\d|2[0-3])(?::[0-5]\d){1,2}$
   * @example "16:30"
   */
  toTime: string;
}

export interface PreAdviceByDriverPickupOptions {
  /** @maxLength 64 */
  phone: string;
}

export interface BookInWithInfoOptions {
  /** @maxLength 64 */
  contactDetails?: string;
  contactDetailsType?:
    | "email"
    | "phonenumber"
    | "externalSystem"
    | "timeWindow"
    | "other";
}

export interface CustomsDocument {
  id?: string;
  type?:
    | "CommercialInvoice"
    | "ProformaInvoice"
    | "ExportLicence"
    | "T1Note"
    | "SAD";
  transportMovement?: "Export" | "Import";
  /** @format date */
  invoiceDate?: string;
  /** @maxLength 3 */
  invoiceCurrency?: string;
  /** @format double */
  invoiceAmount?: number;
  /** @maxLength 20 */
  eori?: string;
}

export interface CustomsCommodity {
  /** @maxLength 3 */
  countryCodeOfOrigin?: string;
  /** @maxLength 3 */
  customsValueCurrency?: string;
  /** @format double */
  customsValue?: number;
  /** @maxLength 38 */
  hsItemId?: string;
  /** @maxLength 35 */
  commodityDescription?: string;
  /** @maxLength 4 */
  procedureCode?: string;
  /** @maxLength 70 */
  customsClearanceInstruction?: string;
  /** @format double */
  netWeight?: number;
  /** @format int32 */
  numberOfUnits?: number;
  /** @maxLength 44 */
  additionalInformation?: string;
  /** @maxLength 70 */
  customsDeclarationNumberABT?: string;
  /** @maxLength 35 */
  certificateOfOrigin?: string;
  /** @maxLength 35 */
  certificateOfOriginFormGSP?: string;
  /** @maxLength 35 */
  importLicence?: string;
  /** @maxLength 35 */
  goodsDescription?: string;
}

/** Used with **DHL Eurapid** and **DHL EuroConnect** */
export interface DangerousGoods {
  /**
   * Unique ADR identification. Only relevant if you use the vendor DG Office for ADR
   * @format int32
   */
  dgmId?: number;
  /**
   * ADR Class is mandatory, but can be left empty for limited quantities (LQ) and excepted quantities (EQ)
   * @maxLength 7
   * @example "4.2"
   */
  adrClass: string;
  /**
   * @format int32
   * @example "1380"
   */
  unNumber: number;
  /** @maxLength 45 */
  properShippingName: string;
  /** @maxLength 8 */
  flashpointValue?: string;
  /**
   * Official ADR package group codes I, II, III or blanks
   * @maxLength 3
   * @example "I"
   */
  packageGroup?: string;
  /**
   * @maxLength 6
   * @example "B/E"
   */
  tunnelCode: string;
  /** @format double */
  grossWeight: number;
  quantityMeasurementUnitQualifier?: string;
  /** @format double */
  quantityMeasurementValue?: number;
  /** @format int32 */
  numberOfPieces: number;
  /**
   * Official ADR Packaging code
   * @maxLength 3
   * @example "1B2"
   */
  packageType: string;
  /**
   * This is the additional technical name, only when required for UN-number with N.O.S. Not Otherwise Specified, so additional chemical substance name is then required.
   * @maxLength 70
   */
  officialNameTechDescription?: string;
  marinePollutant?: boolean;
  /** @maxLength 45 */
  marinePollutantName?: string;
  exceptedQuantity?: boolean;
  limitedQuantity?: boolean;
  emptyContainer?: boolean;
  environmentHazardous?: boolean;
  waste?: boolean;
}

export interface TransportInstructionResponse {
  status?: string;
  transportInstruction?: Shipment;
}

export interface TransportInstructionErrorResponse {
  status?: string;
  validationErrors?: IValidationError[];
  errorMessage?: string;
}

export interface IValidationError {
  field?: string;
  /** @format int32 */
  errorCode?: number;
  message?: string;
  incompatibleFields?: string[];
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
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
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
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
  Json = "application/json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string =
    "https://test-api.freight-logistics.dhl.com/transportinstructionapi/v1";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) =>
    fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter(
      (key) => "undefined" !== typeof query[key],
    );
    return keys
      .map((key) =>
        Array.isArray(query[key])
          ? this.addArrayQueryParam(query, key)
          : this.addQueryParam(query, key),
      )
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.Text]: (input: any) =>
      input !== null && typeof input !== "string"
        ? JSON.stringify(input)
        : input,
    [ContentType.FormData]: (input: any) =>
      Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === "object" && property !== null
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
      ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(
      `${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`,
      {
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type && type !== ContentType.FormData
            ? { "Content-Type": type }
            : {}),
        },
        signal:
          (cancelToken
            ? this.createAbortSignal(cancelToken)
            : requestParams.signal) || null,
        body:
          typeof body === "undefined" || body === null
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
 * @title TransportInstruction
 * @version 2.8.65
 * @baseUrl https://test-api.freight-logistics.dhl.com/transportinstructionapi/v1
 * @contact Support <se.dbi@dhl.com> (https://www.dhldashboard.se/Services/APIFarm.aspx)
 *
 * Used to submit complete transport data that forms the basis for the transport and invoicing
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  transportinstruction = {
    /**
     * No description
     *
     * @tags TransportInstruction
     * @name TransportInstructionSendTransportInstructionPost
     * @request POST:/transportinstruction/sendtransportinstruction
     * @secure
     */
    transportInstructionSendTransportInstructionPost: (
      transportInstructionModel: Shipment,
      params: RequestParams = {},
    ) =>
      this.request<
        TransportInstructionResponse,
        TransportInstructionErrorResponse
      >({
        path: `/transportinstruction/sendtransportinstruction`,
        method: "POST",
        body: transportInstructionModel,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags TransportInstruction
     * @name PingList
     * @request GET:/transportinstruction/ping
     * @secure
     */
    pingList: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/transportinstruction/ping`,
        method: "GET",
        secure: true,
        ...params,
      }),
  };
}
