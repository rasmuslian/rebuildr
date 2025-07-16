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

/** Array of customs declaration CN22 */
export type CustomsDeclarationCN22Array = CustomsDeclarationCN22Item[];

/** Array of customs declaration CN23 */
export type CustomsDeclarationCN23Array = CustomsDeclarationCN23Item[];

/** The shipment information required to create an EDI Instruction */
export interface PickupBooking {
  /** Refers to the date when the client/system creates the request/message. */
  messageDate: MessageDate;
  /** The incoming EDI will be stored and released to PostNord Production at this date. Date must be in the future and within 60 days. */
  releaseDate?: ReleaseDate;
  /**
   * Message function identifier.
   * * Instruction - goods are about to be or has already been loaded on a pick-up means of a transport
   * * PickupBooking - Book a pickup or a DPD Collection Request.
   */
  messageFunction?: MessageFunction;
  /** Unique id for the message within the current information exchange setting. */
  messageId?: MessageId;
  /** Object used to identifying the client */
  application?: Application;
  /** An optional attribute indicating the language in which the contents of text elements and code value text equivalents are written. Use ISO 3166 two position alphabetic countrycode */
  language?: Language;
  /**
   * Either of these indicators must be used.
   *
   * For messageFunction Instruction
   * * If not used the message will be treated as an Original.
   * * An update can only be performed after an Original.
   * * Update and Deletion are not supported for (Z11=PostNord Denmark, Z13=PostNord Norway, Z14=PostNord Finland)
   *
   * For messageFunction PickupBooking
   * * Only Original is supported
   * @default "Original"
   */
  updateIndicator: 'Original' | 'Update' | 'Deletion';
  /**
   * If this is "true";
   * * The request will only be validate against business rules
   * * A "Test" label can be fetch using the item ID
   * * No EDI will be sent to PostNord
   * @default false
   */
  testIndicator?: boolean;
  /**
   * Max 200 allowed
   * @minItems 1
   */
  shipment: ShipmentCustomsv2[];
}

/** The shipment information required to create an EDI Instruction */
export interface EdiInstruction {
  /** Refers to the date when the client/system creates the request/message. */
  messageDate: MessageDate;
  /** The incoming EDI will be stored and released to PostNord Production at this date. Date must be in the future and within 60 days. */
  releaseDate?: ReleaseDate;
  /**
   * Message function identifier.
   * * Instruction - goods are about to be or has already been loaded on a pick-up means of a transport
   * * PickupBooking - Book a pickup or a DPD Collection Request.
   */
  messageFunction?: MessageFunction;
  /** Unique id for the message within the current information exchange setting. */
  messageId?: MessageId;
  /** Object used to identifying the client */
  application?: Application;
  /** An optional attribute indicating the language in which the contents of text elements and code value text equivalents are written. Use ISO 3166 two position alphabetic countrycode */
  language?: Language;
  /**
   * Either of these indicators must be used.
   *
   * For messageFunction Instruction
   * * If not used the message will be treated as an Original.
   * * An update can only be performed after an Original.
   * * Update and Deletion are not supported for (Z11=PostNord Denmark, Z13=PostNord Norway, Z14=PostNord Finland)
   *
   * For messageFunction PickupBooking
   * * Only Original is supported
   * @default "Original"
   */
  updateIndicator: 'Original' | 'Update' | 'Deletion';
  /**
   * If this is "true";
   * * The request will only be validate against business rules
   * * A "Test" label can be fetch using the item ID
   * * No EDI will be sent to PostNord
   * @default false
   */
  testIndicator?: boolean;
  /**
   * Max 200 allowed
   * @minItems 1
   */
  shipment: ShipmentCustomsv2[];
}

/** The information associated with the request from Digital Return Web */
export interface DigitalReturn {
  metaData: MetaData;
  returnById?: ReturnById;
  returnByEdi?: ReturnByEdi;
  /** All the details about and reasons for a return */
  returnForm?: FormEntries;
}

export interface MetaData {
  templateId: string;
}

export interface ReturnById {
  id?: Id;
  /** Identification of a product or service offered by TransportCompany or Forwarder */
  basicServiceCode?: BasicServiceCode;
  additionalServiceCode?: AdditionalServiceCode[];
  /** The booking ID for the sent in EDI Instruction */
  references?: References;
  /** weight of units */
  grossWeight?: Weight;
  goodsItem?: {
    /** weight of units */
    grossWeight?: Weight;
  }[];
  freeTexts?: FreeText[];
}

export interface ReturnByEdi {
  /** Identification of a product or service offered by TransportCompany or Forwarder */
  basicServiceCode?: BasicServiceCode;
  additionalServiceCode?: AdditionalServiceCode[];
  /** Transport or other insurance which is ordered for or which is covered for the transport */
  insurance?: Insurance;
  /** Total number of length meters occupied by goods item in means of transport */
  loadingMetres?: LoadingMetres;
  /** Total number of volume units */
  totalVolume?: Volume;
  consignor?: ReturnConsignor;
  /**
   * A party (usually a buyer) named by the consignor (usually a seller) in transportation documents as the party to whose order a shipment will be delivered to.
   * * Mandatory party for Instruction
   */
  consignee?: Consignee;
  /** The party responsible for the cost of shipment. The cost may include carrying charges, storage fees, insurance coverage and other costs to transport goods */
  freightPayer?: FreightPayer;
  /** The booking ID for the sent in EDI Instruction */
  references?: References;
  freeTexts?: FreeText[];
  /** weight of units */
  grossWeight?: Weight;
  goodsItem?: {
    id?: Id;
    /**
     * Type of package or packaging material, allowed codes:
     * * PC = Parcel
     * * PE = EUR Pallet
     * * AF = Half Pallet
     * * OA = Quearter Pallet
     * * OF = Special Pallet
     * * CW = Cage Roll
     * * BX = Box
     * * EN = Envelope
     *
     * Refers to UN/ECE Rec. No. 21. The ZZ is to be used when ordering a PickupBooking for groupage shipment IDs.
     */
    packageTypeCode?: PackageTypeCode;
    items?: {
      references?: ReferenceItem[];
      /** weight of units */
      grossWeight?: Weight;
      /** The dimensions */
      dimensions?: Dimension;
      /** Total number of volume units */
      volume?: Volume;
    }[];
  }[];
}

export interface ReturnConsignor {
  /**
   * The customer number country agreement is with;
   * * Z11 = PostNord Denmark
   * * Z12 = PostNord Sweden
   * * Z13 = PostNord Norway
   * * Z14 = PostNord Finland
   * * ZDL = Direct Link (Customer needs to have a agreement with Direct Link)
   */
  issuerCode?: IssuerCode;
  /** Party identification */
  partyIdentification?: PartyIdentification;
  /** The party object */
  party?: Party;
}

/** The information associated with the created label prinouts */
export interface EdiLabelResponse {
  /** The booking ID for the sent in EDI Instruction */
  bookingResponse?: BookingResponse;
  /** The information associated with the created label prinouts */
  labelPrintout?: LabelPrintout;
}

/** Array of customs invoice declaration */
export type CustomsInvoice = CustomsDeclaration[];

/** Response for the add customs declaration with PDF */
export interface AddCustomsDeclarationPdfResponse {
  /** The booking ID for the sent in EDI Instruction */
  bookingResponse?: BookingResponseCN;
  /** The information associated with the created label prinouts */
  labelPrintout?: LabelPrintout;
}

/** Array of customs invoice declaration */
export type DangerousGoods = {
  /** List of IDs */
  ids?: Ids;
  dangerousGoods?: DangerousGoods2[];
}[];

/** Array of ids that EDI will be deleted */
export interface DeleteEdiRequest {
  ids?: DeleteEdiIds[];
}

export interface DeleteEdiIds {
  id?: string;
}

export interface IdList {
  id?: string;
}

/** The pickup by ids */
export interface PickupIdInfo {
  /**
   * Creation date and time
   * @format date-time
   */
  earliestPickupDate?: string;
  /**
   * Creation date and time
   * @format date-time
   */
  latestPickupDate?: string;
  itemId: Id;
}

/** List of IDs */
export type Ids = IdsInner[];

/** List of IDs */
export type IdsQrcode = IdList[];

export interface IdsInner {
  id?: Id;
  /**
   * Defines the label type to produce, supported options;
   * * **standard** = 190*105mm
   * * **small** = 75*105mm
   * * **ste** = 75*105mm
   * Note; **small** is not available for all lables produced, then **standard** will be defaulted.
   * @default "standard"
   */
  labelType?: string;
}

/**
 * @minLength 0
 * @maxLength 35
 */
export type Id = string;

export type PrintoutLabelOptionsRequest = PrintoutLabelOptionsIds[];

export interface PrintoutLabelOptionsIds {
  id?: Id;
  /** @default "PDF" */
  format?: 'PDF' | 'ZPL' | 'ALL';
  /**
   * The value of this should be the number of degrees to rotate the label clockwise, default market rotation value (SE=0, DK=90)
   * @default "0"
   */
  rotate?: '0' | '90' | '180' | '270' | 'SE' | 'DK';
  /**
   * Defines the prinouts to be returned using the sent in information to PostNord.
   * * **onlyCustomsDeclarations**           = print only custom declarations for the item ID (CN22/CN23/customsInvoice)
   * * **onlyCustomsDeclarationsLoadList**   = print only custom declarations for the item ID (CN22/CN23/customsInvoice) include Load List
   * * **onlyLabels**                        = print only labels for the item ID and Dangerous Goods
   * * **labelsAndEmptyCN22**                = print labels and empty CN22
   * * **labelsAndEmptyCN23**                = print labels and empty CN23
   * * **labelsAndEmptyCustomsInvoice**      = print labels and empty Customs Invoice
   * * **onlyDPC**                           = print only digital portocode
   * * **labelsAndCustomsDeclarations**      = print labels and customs declarations
   * @default "ALL"
   */
  definePrintout?: string;
}

export interface PrintoutLabelOptionsIdsOption {
  /** @example "standard" */
  labelType?: string;
  paperSize?: string[];
  rotate?: string[];
  definePrintout?: string[];
  /** @example "PDF" */
  format?: string;
}

export interface PrintoutLabelOptionsResponse {
  summaryPrintoutLabelOptions?: SummaryPrintoutLabelOptions[];
  printoutLabelOptions?: PrintoutLabelOptions;
}

export type PrintoutLabelOptions = PrintoutLabelOption[];

export interface PrintoutLabelOption {
  id?: Id;
  printoutOptions?: PrintoutLabelOptionsIdsOption[];
}

export type SummaryPrintoutLabelOptions = PrintoutLabelOptionsIdsOption;

/** List of return IDs Information */
export type Returns = ReturnInner[];

export interface ReturnInner {
  /** Object used to identifying the client */
  application?: Application;
  /** Return Information Object */
  return?: ReturnInfo;
}

/** Return Information Object */
export interface ReturnInfo {
  id: Id;
  /** Identification of a product or service offered by TransportCompany or Forwarder */
  basicServiceCode?: BasicServiceCode;
  additionalServiceCode?: AdditionalServiceCode[];
  /** All the details about and reasons for a return */
  formInfo?: FormEntries;
  /** Party where the goods will be returned to if other than consignor-party (i.e. if the recipient doesn't collect them). */
  returnParty?: ReturnParty;
  /** List of references that will either be added or replaced depending on mirrorReferences parameter */
  returnReferences?: Reference[];
  /** The party responsible for the cost of shipment. The cost may include carrying charges, storage fees, insurance coverage and other costs to transport goods */
  freightPayer?: FreightPayer;
}

export interface ReturnValidationInfo {
  id: Id;
  /**
   * The SMS no to the contact
   * @minLength 1
   * @maxLength 50
   * @example "+467052555"
   */
  sms?: string;
  /** The email to the contact */
  email?: string;
}

/**
 * All the details about and reasons for a return
 * @uniqueItems true
 */
export type FormEntries = FormEntry[];

/** All the details about and reasons for an item/items in a return */
export interface FormEntry {
  /** A list of all the details of a formEntry */
  data?: FormFields;
}

/**
 * A list of all the details of a formEntry
 * @uniqueItems true
 */
export type FormFields = FormField[];

/** A field with details about a formEntry */
export interface FormField {
  value?: string;
  metaData?: FormMetadata[];
}

export interface FormMetadata {
  name?: string;
  value?: string;
}

/** Pickup Stop Date Request */
export interface PickupStopDateV4 {
  /** The earliest date and time at which Consignment, GoodsItem or Package is expected to be or required to be picked up at the premises of DespatchParty */
  earliestPickupDate?: EarliestPickupDate;
  /** Identification of a product or service offered by TransportCompany or Forwarder */
  basicServiceCode?: BasicServiceCode;
  /** Additional service linked to Basic Service Code */
  additionalServiceCode?: AdditionalServiceCode;
  /** content of pickup */
  packageTypeCodes?: PackageTypeCodes;
  /** The address */
  fromAddress?: Address;
}

/**
 * Test
 * content of pickup
 */
export type PackageTypeCodes = PackageTypeCodeEntry[];

/** content entry of pickup */
export interface PackageTypeCodeEntry {
  /**
   * Number of units of packageTypeCode type.
   * @example 1
   */
  units?: number;
  /**
   * Type of package or packaging material, allowed codes:
   * * PC = Parcel
   * * PE = EUR Pallet
   * * AF = Half Pallet
   * * OA = Quearter Pallet
   * * OF = Special Pallet
   * * CW = Cage Roll
   * * BX = Box
   * * EN = Envelope
   *
   * Refers to UN/ECE Rec. No. 21. The ZZ is to be used when ordering a PickupBooking for groupage shipment IDs.
   */
  packageTypeCode?: PackageTypeCode;
}

/** Distribution area json response */
export interface PickupStopDateResponseV4 {
  nextPickupTimeSlot?: NextPickupTimeSlotArray;
}

export type NextPickupTimeSlotArray = NextPickupTimeSlotEntry[];

/** Timeslot entry */
export interface NextPickupTimeSlotEntry {
  /** @example "2022-04-26T14:00:00Z" */
  nextBookingStopTime?: string;
  /** @example "2022-04-26" */
  pickupDate?: string;
  /** @example "08:00" */
  from?: string;
  /** @example "16:00" */
  to?: string;
  /** @example "SE" */
  pickupCountry?: string;
}

/** The booking ID for the sent in EDI Instruction */
export interface BookingResponse {
  /**
   * The booking ID created for the sent in EDI Instruction
   * @example "3YSFH8NG0LNREZO38UIN68B3RRWL4X"
   */
  bookingId?: string;
  idInformation?: IdInfo[];
}

export interface IdInfo {
  /**
   * If the shipment was created
   * @example "OK"
   */
  status?: 'OK' | 'FAIL';
  /** The booking ID for the sent in EDI Instruction */
  references?: References;
  ids?: AssignedIds[];
  urls?: Urls[];
  attributes?: ParamValue[];
  /** PostNord standard error response message */
  errorResponse?: ErrorResponse;
}

/** The booking ID for the sent in EDI Instruction */
export interface References {
  shipment?: Reference[];
  item?: Reference[];
}

/** The reference */
export interface Reference {
  /** The reference number */
  referenceNo: ReferenceNo;
  /** Code giving specific meaning to a reference segment or a reference number, get more detailed information from API. */
  referenceType: ReferenceType;
}

/**
 * The reference number
 * @minLength 1
 * @maxLength 35
 * @example "ref-12121A"
 */
export type ReferenceNo = string;

/**
 * Code giving specific meaning to a reference segment or a reference number, get more detailed information from API.
 * @minLength 1
 * @maxLength 3
 * @example "CU"
 */
export type ReferenceType = string;

/** A value pair explaining the assigned idType with the corresponding value */
export interface AssignedIds {
  /**
   * The ID Type defining the value (itemId, shipmentId, returnId, originalItemId etc).
   * @example "itemId"
   */
  idType?: string;
  /**
   * The value for the specified idType
   * @example "00373500454541020957"
   */
  value?: string;
  /**
   * The printId is use to print the label, in the endpoints /v3/labels/ids/(zpl|pdf)
   * @example "31eed2dad84b48a2ba92a26590a0a69f"
   */
  printId?: string;
}

/** A value pair of URLs */
export interface Urls {
  /**
   * Defines the type of URL (TRACKING, BOOKPICKUP, SERVICEPOINTFILE etc).
   * @example "TRACKING"
   */
  type?: string;
  /**
   * The url
   * @example "https://tracking.postnord.com/se/?id=00373501093010042961"
   */
  url?: string;
}

/** A parameter value pair is a set of two linked data items */
export interface ParamValue {
  param?: string;
  value?: string;
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
  faults?: Fault[];
}

/** Fault object with the associated code and explanation text */
export interface Fault {
  /** @uniqueItems true */
  paramValues?: ParamValue[];
  /** @example "Missing parameter" */
  explanationText: string;
  /** @example "API-005" */
  faultCode?: string;
}

/** The information associated with the created label prinouts */
export type LabelPrintout = LabelPrintoutInner[];

/** Next page with label printouts. */
export interface LabelPrintoutInner {
  /** The shipment ID to print a PostNord label */
  itemIds?: ItemIds;
  printout?: Printout;
  printoutComposition?: PrintoutComposition;
  nextPage?: HttpLink;
}

/** The shipment ID to print a PostNord label */
export type ItemIds = ItemIdsInner[];

export interface ItemIdsInner {
  /** A reference number uniquely identifying item. In some cases will a value of 0 trigger that PostNord creates the ID for the client */
  itemIds?: ItemId;
  printId?: string;
  /** Identification of a product or service offered by TransportCompany or Forwarder */
  basicServiceCode?: BasicServiceCode;
  /** The booking ID for the sent in EDI Instruction */
  reference?: References;
  /**
   * Able to create a label for the item ID
   * @example "OK"
   */
  status?: 'OK' | 'FAIL';
  /** PostNord standard error response message */
  errorResponse?: ErrorResponse;
}

/**
 * A reference number uniquely identifying item. In some cases will a value of 0 trigger that PostNord creates the ID for the client
 * @minLength 1
 * @maxLength 35
 * @example "00373500489530470000"
 */
export type ItemId = string;

/**
 * Identification of a product or service offered by TransportCompany or Forwarder
 * @minLength 1
 * @maxLength 10
 * @example "19"
 */
export type BasicServiceCode = string;

export interface Printout {
  /** Uniqueue Id */
  id?: Id2;
  /**
   * Identifies the type of printout
   * * LABEL
   * * QRCODE
   */
  type?: PrintoutType;
  /** Refers to the format of the label (PDF, ZPL or SVG) */
  labelFormat?: LabelFormat;
  /** Encoding of the data (base64) */
  encoding?: Encoding;
  /** URI resource end-point */
  uriResource?: UriResource;
  /** URI resource for stored labels */
  uriStoreLabel?: UriStoreLabel;
  /** The value in the data object */
  dataValue?: DataValue;
  /** Data attribute */
  data?: Data;
}

/**
 * Uniqueue Id
 * @example 123456
 */
export type Id2 = string;

/**
 * Identifies the type of printout
 * * LABEL
 * * QRCODE
 * @example "LABEL"
 */
export type PrintoutType = string;

/**
 * Refers to the format of the label (PDF, ZPL or SVG)
 * @example "PDF"
 */
export type LabelFormat = string;

/**
 * Encoding of the data (base64)
 * @example "base64"
 */
export type Encoding = string;

/**
 * URI resource end-point
 * @example "https://atapi2.postnord.com/labels/6e9ae982-f820-46ba-a4ab-977c2d770212-pdf"
 */
export type UriResource = string;

/**
 * URI resource for stored labels
 * @example "https://atapi2.postnord.com/labels/f4ced00f-a1c0-40a1-b180-27a089ebd09d.pdf"
 */
export type UriStoreLabel = string;

/** The value in the data object */
export type DataValue = string;

/** Data attribute */
export type Data = string;

export interface PrintoutComposition {
  label?: number;
  cn22?: number;
  cn23?: number;
  customsInvoice?: number;
  loadList?: number;
  securityDeclarations?: number;
  dpc?: number;
  dangerousGoods?: number;
  fraktsedel?: number;
  routingDocument?: number;
  errorLabel?: number;
}

export interface HttpLink {
  /**
   * HTTP method
   * @example "POST"
   */
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  /** @example "https://atapi2.postnord.se/labels/ids/zpl?apikey=gfsfg3esgsdgd&page=2" */
  url: string;
  body?: any;
}

/** Response on API health check (UP=OK, FATAL=Needs action, DOWN=Not working) */
export interface Health {
  status: 'UP' | 'FATAL' | 'DOWN';
  name?: string;
  detailChecks?: DetailCheck[];
}

/** Response on API health check (UP=OK, FATAL=Needs action, DOWN=Not working) */
export interface DetailCheck {
  status: 'UP' | 'FATAL' | 'DOWN';
  name?: string;
  /** A parameter value pair is a set of two linked data items */
  detailCheck?: ParamValue;
}

/** The booking ID for the sent in EDI Instruction */
export interface BookingResponseCN {
  /**
   * The booking ID created for the sent in EDI Instruction
   * @example "3YSFH8NG0LNREZO38UIN68B3RRWL4X"
   */
  bookingId?: string;
  idInformation?: IdInfoCN[];
}

export interface IdInfoCN {
  /**
   * If the shipment was created
   * @example "OK"
   */
  status?: 'OK' | 'FAIL';
  /** The booking ID for the sent in EDI Instruction */
  references?: References;
  ids?: AssignedIds[];
}

/** Book a consolidated customs declaration for a transport of goods. */
export interface Consolidation {
  /**
   * @maxItems 1
   * @minItems 1
   */
  ids: CustomsDeclarationIds[];
  /** @maxItems 1 */
  transport?: Transport[];
  departure?: Departure;
  /** Refers to the date when the client/system creates the request/message. */
  messageDate?: MessageDate;
  /**
   * Message function identifier.
   * * Customsdeclaration
   * * ConsolidatedCustomsdeclaration
   */
  messageFunction?: MessageFunctionCustoms;
  /**
   * It is mandatory to send in an unique id for the message within the current information exchange setting
   * * An idempotency check is done on this attribute together with the updateIndicator attribute.
   * @minLength 1
   * @maxLength 14
   * @example "msg-182721551"
   */
  messageId?: string;
  /** Object used to identifying the client */
  application?: Application;
  /** An optional attribute indicating the language in which the contents of text elements and code value text equivalents are written. Use ISO 3166 two position alphabetic countrycode */
  language?: Language;
  /**
   * Either of these indicators must be used.
   * @default "Original"
   */
  updateIndicator?: 'Original' | 'Update' | 'Deletion';
  /**
   * If this is "true";
   * * The request will only be validate against business rules
   * * A "Test" label can be fetch using the item ID
   * * No EDI will be sent to PostNord
   * @default false
   */
  testIndicator?: boolean;
  /**
   * Defines the declaration types for the consolidation.
   *
   * Default is: **exportDeclaration**
   *
   * Valid Enums:
   *   - IOSS
   *   - invoiceExportDeclaration
   *   - invoiceImportDeclaration
   */
  declarationType?: string;
  attributeList?: AttributeList[];
  /**
   * @maxItems 399
   * @minItems 1
   */
  customsInvoices: ConsoCustomsInvoice[];
}

/** ID refering to the customs declaration.  */
export interface CustomsDeclarationIds {
  /**
   * The id that the customs invoice refers to.
   * - Used to fetch the already sent in EDI
   * - Set as interchangeref in the customs declaration
   * @minLength 1
   * @maxLength 35
   * @example "00373500489530470000"
   */
  id: string;
  /**
   * Defined idTypes
   * - ITEMID
   * - SHIPMENTID
   * - CUSTOMSREFERENCE
   * - CONSOLIDATIONID
   * - BAGID
   * - OTHER
   * @minLength 1
   * @default "ITEMID"
   */
  idType: string;
}

export interface Transport {
  /** @example "100000001012123" */
  mrn?: string;
  /**
   * Mode of transport
   * * 10 - Vessels, Norwegian/foreign
   * * 12 - Railway wagon on vessel
   * * 16 - Car on vessel
   * * 17 - Trailer on vessel
   * * 20 - Railway
   * * 23 - Car/trailer on railway
   * * 30 - Car (road transport)
   * * 40 - Aircraft
   * * 50 - Item
   * * 70 - Fixed installations (pipes, cables, etc.)
   * * 80 - Transport on inland waterways
   * * 90 - Own progress
   * @example "30"
   */
  transportModeBorder?: string;
  /** @example "AB1234" */
  transportIdentityBorder?: string;
  /** @example "SE" */
  transportNationalityBorder?: string;
  transportName?: string;
  transportUniqueId?: string;
  truckId?: string;
  departurePlace?: string;
  additionalInformation?: string;
  /**
   * @minLength 2
   * @maxLength 2
   */
  departureCountryCode?: string;
  /**
   * @minLength 2
   * @maxLength 2
   */
  destinationCountryCode?: string;
  /**
   * @format dateTime
   * @example "2024-05-01T10:40:52Z"
   */
  arrivalDate?: string;
  /**
   * @format time
   * @example "18:00"
   */
  arrivalTime?: string;
}

export interface Departure {
  /** The ID for the forwarding agent */
  agentId?: string;
}

/**
 * Refers to the date when the client/system creates the request/message.
 * @format date-time
 * @example "2018-11-28T10:40:52Z"
 */
export type MessageDate = string;

/**
 * Message function identifier.
 * * Customsdeclaration
 * * ConsolidatedCustomsdeclaration
 */
export type MessageFunctionCustoms = string;

/** Object used to identifying the client */
export interface Application {
  /**
   * The ID is assigned by PostNord for the client.
   * @example 2001
   */
  applicationId?: number;
  /**
   * The Name of the client integration, which is decided by the client.
   * @minLength 1
   * @maxLength 35
   * @example "PostNord Online Shipping Tool"
   */
  name: string;
  /**
   * The version of the client integration, which is decided by the client.
   * @minLength 1
   * @maxLength 35
   * @example "1.0"
   */
  version?: string;
}

/**
 * An optional attribute indicating the language in which the contents of text elements and code value text equivalents are written. Use ISO 3166 two position alphabetic countrycode
 * @minLength 2
 * @maxLength 2
 * @default "EN"
 * @example "EN"
 */
export type Language = string;

/** List of name / value of the attribute */
export interface AttributeList {
  /** Code giving specific meaning to a attribute */
  type?: Type;
  /** The attribute value */
  value?: AttributeValue;
}

/**
 * Code giving specific meaning to a attribute
 * @minLength 1
 * @maxLength 3
 * @example "ZSD"
 */
export type Type = string;

/**
 * The attribute value
 * @minLength 1
 * @maxLength 35
 * @example "0111550"
 */
export type AttributeValue = string;

/**
 * The customs invoice declaration is used for packages classified as parcels.
 *
 * There are two different types of customs invoices, **commercial invoice** (namely trade invoice) and **proforma invoice** (export invoice).
 * - A commercial invoice is used when you export or import an item to be sold.
 * - A proforma invoice is used when you export or import something that you should not charge for or get paid for.
 *
 * When you use a pro forma invoice, you therefore rarely need to pay customs and VAT because you are not sending for a commercial purpose.
 *
 * Examples of occasions when you can use a proforma invoice are when you send samples of goods, gifts and advertising or return and replace goods
 */
export interface ConsoCustomsInvoice {
  /**
   * Represents the incoming unique transaction ID from the client.
   * The client can use it for acknowledgment, report, and response messages to reference the original message
   * @example "f058ebd6-02f7-4d3f-942e-904344e8c645"
   */
  externalTransactionId?: string;
  /**
   * The type of customs invoice
   *  - PROFORMA
   *  - COMMERCIAL
   * @default "commercial"
   */
  type: string;
  /** The load position */
  loadingListPosition?: LoadingListPosition;
  /** Identification of a product or service offered by TransportCompany or Forwarder */
  basicServiceCode?: BasicServiceCode;
  /** For import to norway */
  voec?: Voec;
  /** For import to EU */
  ioss?: Ioss;
  /** The sellers name, address, contact information, and tax identification number. */
  seller: Seller;
  /** The buyers full name, address, contact information, and tax identification number */
  buyer: Buyer;
  shipTo?: ShipTo[];
  /** Invoice information */
  invoice: Invoice;
  ids?: Ids2[];
  attributeList?: AttributeList[];
  detailedDescription: DetailedDescriptionCustomsInvoice[];
  /** weight of units */
  totalNetWeight?: Weight;
  /** weight of units */
  totalGrossWeight: Weight;
  /** The quantity */
  totalNumberOfPackages?: Quantity;
  /** Invoice sub-total is the total amount after any discount or rebate */
  invoiceSubTotal?: InvoiceSubTotal;
  /** The amount object */
  freightCost?: Amount;
  /** The amount object */
  invoiceTotal: Amount;
  /** Other remarks */
  otherRemarks?: OtherRemarks;
}

/** The load position */
export type LoadingListPosition = string;

/** For import to norway */
export type Voec = string;

/** For import to EU */
export type Ioss = string;

/** The sellers name, address, contact information, and tax identification number. */
export interface Seller {
  /** Party identification */
  partyIdentification: PartyIdentification;
  /** The assigned VAT number */
  vatNo: VatNo;
  /** Name of the person or company or place */
  name: Name;
  streets: Street[];
  /** Place name (ex Sted name in Denmark) */
  place?: PlaceName;
  /** The name of the city */
  city: City;
  /** The postal code for the address */
  postalCode: PostalCode;
  /** ISO 3166 country code of the item. */
  countryCode: CountryCode;
  /** Contact information */
  contacts: Contacts;
  /** An EORI number is required in all customs declarations and for all other customs related activities, such as applications for authorisations. */
  eoriNo?: EoriNo;
}

/** Party identification */
export interface PartyIdentification {
  /** Witholds the information ID associated with the party */
  partyId: PartyId;
  /**
   * Code list qualifier for the partyId;
   * * 160 = Customer number
   * * 167 = VAT customer number
   * * 156 = Service point ID in deliveryParty
   * * 229 = Geographic location
   */
  partyIdType: PartyIdType;
}

/**
 * Witholds the information ID associated with the party
 * @minLength 1
 * @maxLength 17
 * @example "1234567890"
 */
export type PartyId = string;

/**
 * Code list qualifier for the partyId;
 * * 160 = Customer number
 * * 167 = VAT customer number
 * * 156 = Service point ID in deliveryParty
 * * 229 = Geographic location
 * @minLength 1
 * @maxLength 3
 * @example "160"
 */
export type PartyIdType = string;

/**
 * The assigned VAT number
 * @maxLength 18
 * @example "SE543210123401"
 */
export type VatNo = string;

/**
 * Name of the person or company or place
 * @minLength 1
 * @maxLength 60
 * @example "Nils Andersson"
 */
export type Name = string;

/**
 * The street name in the address
 * @example "Engelbrekts väg"
 */
export type Street = string;

/**
 * Place name (ex Sted name in Denmark)
 * @minLength 1
 * @maxLength 60
 */
export type PlaceName = string;

/**
 * The name of the city
 * @minLength 1
 * @maxLength 35
 * @example "Sollentuna"
 */
export type City = string;

/**
 * The postal code for the address
 * @minLength 1
 * @example "19162"
 */
export type PostalCode = string;

/**
 * ISO 3166 country code of the item.
 * @minLength 2
 * @maxLength 2
 * @example "SE"
 */
export type CountryCode = string;

/** Contact information */
export interface Contacts {
  /** Name of the person or company or place */
  name: Name;
  /** The phone or mobile number to the contact */
  phoneNo: PhoneNo;
  /** The email adress to the contact */
  emailAddress?: EmailAddress;
  /** The sms number to the contact */
  smsNo?: SmsNo;
}

/**
 * The phone or mobile number to the contact
 * @minLength 1
 * @maxLength 50
 * @example "+4685586363"
 */
export type PhoneNo = string;

/**
 * The email adress to the contact
 * @minLength 0
 * @maxLength 70
 * @example "me@postnord.com"
 */
export type EmailAddress = string;

/**
 * The sms number to the contact
 * @minLength 1
 * @maxLength 50
 * @example "+467052555"
 */
export type SmsNo = string;

/**
 * An EORI number is required in all customs declarations and for all other customs related activities, such as applications for authorisations.
 * @minLength 1
 * @maxLength 35
 * @example "SE5561234711"
 */
export type EoriNo = string;

/** The buyers full name, address, contact information, and tax identification number */
export interface Buyer {
  /** Party identification */
  partyIdentification?: PartyIdentification;
  /** The assigned VAT number */
  vatNo?: VatNo;
  /** Name of the person or company or place */
  name: Name;
  streets: Street[];
  /** The name of the city */
  city: City;
  /** The postal code for the address */
  postalCode: PostalCode;
  /** ISO 3166 country code of the item. */
  countryCode: CountryCode;
  /** Contact information */
  contacts: Contacts;
  /** An EORI number is required in all customs declarations and for all other customs related activities, such as applications for authorisations. */
  eoriNo?: EoriNo;
}

/** The ship to partys full name, address, contact information. If different from the buyers */
export interface ShipTo {
  /** Party identification */
  partyIdentification?: PartyIdentification;
  /** Name of the person or company or place */
  name?: Name;
  streets?: Street[];
  /** The name of the city */
  city?: City;
  /** The postal code for the address */
  postalCode?: PostalCode;
  /** ISO 3166 country code of the item. */
  countryCode?: CountryCode;
  /** Contact information */
  contacts?: Contacts;
  /** Reference to one or more ITEMID use for matching a parcel line to corresponding 'detailedDescriptionCustomsInvoice' */
  refItemIds?: RefItemIds;
}

/** Reference to one or more ITEMID use for matching a parcel line to corresponding 'detailedDescriptionCustomsInvoice' */
export type RefItemIds = string[];

/** Invoice information */
export interface Invoice {
  /** The invoice number is assigned by the shipper */
  invoiceNo: InvoiceNo;
  /** The date the transaction took place in the sellers record or invoice date */
  shippingDate?: ShippingDate;
  /** Shipping Id */
  shippingId?: ShippingId;
  /** Purchase order number is assigned by the shipper,if applicable */
  purchaseOrderNo?: PurchaseOrderNo;
  /**
   * The shipper will include the reason for export using the procedure code.
   *
   * Examples
   * - 1000 (GIFT, SALES, SAMPLES)
   * - 1040 (RETURN)
   *
   * Examples For DK
   * -  10000000 (GIFT, SALES, SAMPLES)
   * - 10400000 (RETURN)
   */
  reasonForExportation: ReasonForExportation;
  /**
   * Terms of sale (Incoterms) refers to the billing terms on the invoice. The terms state who (seller or buyer) is responsible for paying various costs — shipping, insurance, import tax and duty charges
   * - DDP = Delivery at Place (DAP Cleared)
   * - DAP = Delivery at Place (DAP)
   * - EXW = Ex Works
   * - DAT = Delivery at Terminal
   */
  termsOfSale?: TermsOfSale;
  /** Import reference */
  importerReference?: ImporterReference;
  /** Export reference */
  exportReference?: ExportReference;
  /** Terms of payment */
  termsOfPayment?: TermsOfPayment;
  /** The reference that the Customs in the sending country has assigned to the assignment for customs clearance */
  customsDeclarationId?: CustomsDeclarationId;
}

/**
 * The invoice number is assigned by the shipper
 * @example "Invoice number"
 */
export type InvoiceNo = string;

/**
 * The date the transaction took place in the sellers record or invoice date
 * @format date
 * @example "2020-12-20"
 */
export type ShippingDate = string;

/**
 * Shipping Id
 * @example "Shipping Id"
 */
export type ShippingId = string;

/**
 * Purchase order number is assigned by the shipper,if applicable
 * @example "Purchase Order Number"
 */
export type PurchaseOrderNo = string;

/**
 * The shipper will include the reason for export using the procedure code.
 *
 * Examples
 * - 1000 (GIFT, SALES, SAMPLES)
 * - 1040 (RETURN)
 *
 * Examples For DK
 * -  10000000 (GIFT, SALES, SAMPLES)
 * - 10400000 (RETURN)
 * @example "1000"
 */
export type ReasonForExportation = string;

/**
 * Terms of sale (Incoterms) refers to the billing terms on the invoice. The terms state who (seller or buyer) is responsible for paying various costs — shipping, insurance, import tax and duty charges
 * - DDP = Delivery at Place (DAP Cleared)
 * - DAP = Delivery at Place (DAP)
 * - EXW = Ex Works
 * - DAT = Delivery at Terminal
 * @example "DAP"
 */
export type TermsOfSale = string;

/**
 * Import reference
 * @example "Import reference"
 */
export type ImporterReference = string;

/**
 * Export reference
 * @example "Export reference"
 */
export type ExportReference = string;

/**
 * Terms of payment
 * @example "Terms of payment"
 */
export type TermsOfPayment = string;

/**
 * The reference that the Customs in the sending country has assigned to the assignment for customs clearance
 * @example "Customs Declaration Id"
 */
export type CustomsDeclarationId = string;

/** ID refering to the customs declaration.  */
export interface Ids2 {
  /**
   * The id that the customs invoice refers to.
   * - Used to fetch the already sent in EDI
   * - Set as interchangeref in the customs declaration
   * @example "00373500489530470000"
   */
  id?: string;
  /**
   * Defined idTypes
   * - ITEMID
   * - SHIPMENTID
   * - CUSTOMSREFERENCE
   * - CONSOLIDATIONID
   * - OTHER
   * @default "ITEMID"
   */
  idType?: string;
}

/** Detailed description of the goods */
export interface DetailedDescriptionCustomsInvoice {
  /**
   * Pieces of the given content
   * @example 1
   */
  quantity: number;
  /**
   * Units is used, if quantity is not applicable e.g. liters of gasoline, meters of wool
   * @maxLength 4
   * @default "1"
   * @example "DTM"
   */
  units?: string;
  /** HS tariff number and country of origin of goods tulltaxan.tullverket.se */
  hsTariffNumber: HsTariffNumber;
  /**
   * The 2-letter ISO 3166 country code which the tariff number refers to.
   * * If no value is given, the sender country code is used as default
   */
  hsTariffNumberCountryCode?: HsTariffNumberCountryCode;
  /** Describe the content of the goods */
  content: Content;
  /** ISO 3166 country code of the item. */
  countryOfOrigin: CountryCode;
  /** weight of units */
  netWeight: Weight;
  /** weight of units */
  grossWeight?: Weight;
  /** The amount object */
  itemValue: Amount;
  /** Reference to one or more ITEMID use for matching a parcel line to corresponding 'detailedDescriptionCustomsInvoice' */
  refItemIds?: RefItemIds;
  /** Article Number (EAN) is a type of barcode used to identify products that are sold internationally */
  articleNumber?: ArticleNumber;
  /** Identifying code that will be unique for different orders */
  orderNumber?: OrderNumber;
  attributeList?: AttributeList[];
}

/**
 * HS tariff number and country of origin of goods tulltaxan.tullverket.se
 * @example "33040000"
 */
export type HsTariffNumber = string;

/**
 * The 2-letter ISO 3166 country code which the tariff number refers to.
 * * If no value is given, the sender country code is used as default
 * @minLength 2
 * @maxLength 2
 * @example "SE"
 */
export type HsTariffNumberCountryCode = string;

/**
 * Describe the content of the goods
 * @minLength 1
 * @maxLength 1025
 * @example "Cotton shirt"
 */
export type Content = string;

/** weight of units */
export interface Weight {
  /**
   * The value with . as separator, if applicable
   * @format double
   * @example 5
   */
  value: number;
  /**
   * The unit of the value
   * * KGM = kilogram
   * * GRM = gram
   * * TON = ton
   * @minLength 3
   * @maxLength 3
   * @example "KGM"
   */
  unit: string;
}

/** The amount object */
export interface Amount {
  /**
   * The amount in 2-decimal format with . as separator, if applicable
   * @format double
   * @example 20
   */
  amount: number;
  /**
   * The currency refers to ISO 4217
   * @example "SEK"
   */
  currency: string;
}

/**
 * Article Number (EAN) is a type of barcode used to identify products that are sold internationally
 * @maxLength 50
 */
export type ArticleNumber = string;

/**
 * Identifying code that will be unique for different orders
 * @maxLength 50
 */
export type OrderNumber = string;

/** The quantity */
export interface Quantity {
  /**
   * The number of value
   * @example 5
   */
  value: number;
}

/** Invoice sub-total is the total amount after any discount or rebate */
export interface InvoiceSubTotal {
  /**
   * The amount in 2-decimal format with . as separator, if applicable
   * @format double
   * @example 20
   */
  amount: number;
  /**
   * The currency refers to ISO 4217
   * @example "SEK"
   */
  currency: string;
}

/**
 * Other remarks
 * @example "Other remarks"
 */
export type OtherRemarks = string;

/** Name information associated with company, organization or a person */
export interface CustomsDeclarationCN22Item {
  /** A reference number uniquely identifying item. In some cases will a value of 0 trigger that PostNord creates the ID for the client */
  itemId: ItemId;
  /** Name information associated with company, organization or a person */
  customsDeclarationCN22: CustomsDeclarationCN22;
}

/** Name information associated with company, organization or a person */
export interface CustomsDeclarationCN22 {
  /**
   * Defines the declaration type.
   *
   * - Export declaration are sent to the export country customs system
   * - Import  declaration are sent to the import country customs system
   *
   * Valid Enums:
   *   - invoiceExportDeclaration
   *   - invoiceImportDeclaration
   *   - exportDeclaration
   *   - importDeclaration
   */
  declarationType?: DeclarationType;
  /** An EORI number is required in all customs declarations and for all other customs related activities, such as applications for authorisations. */
  EORIorPersonalIdNumber?: EORIorPersonalIdNumber;
  /** For import to norway */
  voec?: Voec;
  /** For import to EU */
  ioss?: Ioss;
  /** ISO 3166 country code of the item. */
  countryOfOrigin?: CountryCode;
  hsTariffNumber?: HsTariffNumber[];
  /** Defines the type of category for the goods */
  categoryOfItem?: CategoryOfItem;
  /** @minItems 1 */
  detailedDescription: DetailedDescription[];
  /** weight of units */
  totalGrossWeight?: Weight;
  /** The amount object */
  totalValue: Amount;
  /** The amount object */
  postalCharges?: Amount;
}

/**
 * Defines the declaration type.
 *
 * - Export declaration are sent to the export country customs system
 * - Import  declaration are sent to the import country customs system
 *
 * Valid Enums:
 *   - invoiceExportDeclaration
 *   - invoiceImportDeclaration
 *   - exportDeclaration
 *   - importDeclaration
 * @default "exportDeclaration"
 */
export type DeclarationType = string;

/**
 * An EORI number is required in all customs declarations and for all other customs related activities, such as applications for authorisations.
 * @minLength 1
 * @maxLength 17
 * @example "SE5561234711"
 */
export type EORIorPersonalIdNumber = string;

/** Defines the type of category for the goods */
export interface CategoryOfItem {
  categoryType: CategoryType[];
  /** Additional explanation */
  explanation?: string;
}

/**
 * Specifying the category of goods (GIFT, DOCUMENT, RETURNED GOODS, COMMERCIAL SAMPLE, OTHER, SALE OF GOODS)
 * @example "GIFT"
 */
export type CategoryType = string;

/** Detailed description of the goods */
export interface DetailedDescription {
  /** Describe the content of the goods */
  content: Content;
  /** The quantity */
  quantity?: DetailedDescriptionQuantity;
  /** weight of units */
  grossWeight?: Weight;
  /** The amount object */
  value?: Amount;
  /** HS tariff number and country of origin of goods tulltaxan.tullverket.se */
  hsTariffNumber?: HsTariffNumber;
  /** ISO 3166 country code of the item. */
  countryCode?: CountryCode;
  rowNo?: number;
}

/** The quantity */
export interface DetailedDescriptionQuantity {
  /**
   * The number of value
   * @max 999999
   * @example 5
   */
  value: number;
}

/** Name information associated with company, organization or a person */
export interface CustomsDeclarationCN23Item {
  /** A reference number uniquely identifying item. In some cases will a value of 0 trigger that PostNord creates the ID for the client */
  itemId: ItemId;
  /** Name information associated with company, organization or a person */
  customsDeclarationCN23: CustomsDeclarationCN23;
}

/** Name information associated with company, organization or a person */
export interface CustomsDeclarationCN23 {
  /**
   * Defines the declaration type.
   *
   * - Export declaration are sent to the export country customs system
   * - Import  declaration are sent to the import country customs system
   *
   * Valid Enums:
   *   - invoiceExportDeclaration
   *   - invoiceImportDeclaration
   *   - exportDeclaration
   *   - importDeclaration
   */
  declarationType?: DeclarationType;
  /** An EORI number is required in all customs declarations and for all other customs related activities, such as applications for authorisations. */
  EORIorPersonalIdNumber?: EORIorPersonalIdNumber;
  /** For import to norway */
  voec?: Voec;
  /** For import to EU */
  ioss?: Ioss;
  /** Defines the type of category for the goods */
  categoryOfItem?: CategoryOfItem;
  /** @minItems 1 */
  detailedDescription: DetailedDescription[];
  /** weight of units */
  totalGrossWeight?: Weight;
  /** The amount object */
  totalValue: Amount;
  itemIds?: ItemId[];
  /**
   * Could be an ID/tax code/VAT No./importer code
   * @example "12345678"
   */
  senderCustomsReferenceId?: string;
  /**
   * The importers reference  explantion of the category
   * @example "1234-customs-ref"
   */
  importerReference?: string;
  /**
   * Contact information phone/fax/e-mail
   * @example "+46070775589"
   */
  importerContactInfo?: string;
  commercialItems?: CommercialItems[];
  quarantineComments?: QuarantineComments[];
  /** Name of the person or company or place */
  officeOfOrigin?: Name;
  /** The date and time */
  dateOfPosting?: Date;
  /** The amount object */
  postalCharges: Amount;
}

/** For commercial items only or content exceed 200 EUR */
export interface CommercialItems {
  /** HS tariff number and country of origin of goods tulltaxan.tullverket.se */
  hsTariffNumber?: HsTariffNumber;
  /** ISO 3166 country code of the item. */
  countryCode?: CountryCode;
  detailedDescRowNo?: number;
}

/** Provide details if the goods are subject to quarantine (plant, animal, food products, etc.) or other restrictions */
export interface QuarantineComments {
  /**
   * Goods comments
   * @example "comments"
   */
  comments: string;
  /**
   * If your item is accompanied by a licence
   * @example "licenceNumber"
   */
  licenceNumber?: string;
  /**
   * If your item is accompanied by a certificate
   * @example "certificateNumber"
   */
  certificateNumber?: string;
  /**
   * If your item is accompanied by a invoice number, you should attach an invoice for all commercial items.
   * @example "invoiceNumber"
   */
  invoiceNumber?: string;
}

/**
 * The date and time
 * @format date-time
 * @example "2017-11-24T10:40:52Z"
 */
export type Date = string;

/**
 * The incoming EDI will be stored and released to PostNord Production at this date. Date must be in the future and within 60 days.
 * @format date-time
 * @example "2017-11-24T10:40:52Z"
 */
export type ReleaseDate = string;

/**
 * Message function identifier.
 * * Instruction - goods are about to be or has already been loaded on a pick-up means of a transport
 * * PickupBooking - Book a pickup or a DPD Collection Request.
 * @default "Instruction"
 */
export type MessageFunction = string;

/**
 * Unique id for the message within the current information exchange setting.
 * @minLength 1
 * @maxLength 14
 * @example "msg-182721551"
 */
export type MessageId = string;

/** Goods transported on behalf of ordering party from one or more Consignor to one or more Consignee */
export interface ShipmentCustomsv2 {
  /** A reference number uniquely identifying shipment */
  shipmentIdentification?: ShipmentIdentification;
  /** Date and times associated with the shipment, goods item or item. */
  dateAndTimes?: DateAndTimes;
  /** The service representation on the goods */
  service: Service;
  /** The goods are only to be delivered if the content of COD has been fulfilled (e.g. through the valid receipt for a paid amount) */
  cashOnDelivery?: CashOnDelivery;
  /** Transport or other insurance which is ordered for or which is covered for the transport */
  insurance?: Insurance;
  /** Value of the commodity or commodities contained in shipment */
  goodsValue?: GoodsValue;
  freeText?: FreeText[];
  /** The quantity */
  numberOfPackages?: Quantity;
  /** The quantity */
  numberOfPalletFootPrints?: Quantity;
  /** weight of units */
  totalGrossWeight?: Weight;
  /** Total number of volume units */
  totalVolume?: Volume;
  /** Total number of length meters occupied by goods item in means of transport */
  loadingMetres?: LoadingMetres;
  /** Terms agreed between goods seller and goods buyer */
  termsOfDelivery?: TermsOfDelivery;
  references?: Reference[];
  /** Part of the total carriage way delimited by start location and end location. */
  transportLeg?: TransportLeg;
  /** Parties associated with the transport of goods */
  parties: Parties;
  /**
   * Max 200 allowed
   * @minItems 1
   */
  goodsItem: GoodsItem[];
  equipment?: Equipment[];
  /** Name information associated with company, organization or a person */
  customsDeclarationCN22?: CustomsDeclarationCN22;
  /** Name information associated with company, organization or a person */
  customsDeclarationCN23?: CustomsDeclarationCN23;
  /**
   * The customs invoice declaration is used for packages classified as parcels.
   *
   * There are two different types of customs invoices, **commercial invoice** (namely trade invoice) and **proforma invoice** (export invoice).
   * - A commercial invoice is used when you export or import an item to be sold.
   * - A proforma invoice is used when you export or import something that you should not charge for or get paid for.
   *
   * When you use a pro forma invoice, you therefore rarely need to pay customs and VAT because you are not sending for a commercial purpose.
   *
   * Examples of occasions when you can use a proforma invoice are when you send samples of goods, gifts and advertising or return and replace goods
   */
  customsInvoice?: CustomsInvoice2;
}

/** A reference number uniquely identifying shipment */
export interface ShipmentIdentification {
  /** A reference number uniquely identifying shipment */
  shipmentId?: ShipmentId;
}

/**
 * A reference number uniquely identifying shipment
 * @minLength 1
 * @maxLength 35
 * @example "00373500489530470000"
 */
export type ShipmentId = string;

/** Date and times associated with the shipment, goods item or item. */
export interface DateAndTimes {
  /** DateAndTimes at which Consignment, GoodsItem or Package is expected to be loaded, required to be loaded or has loaded onto MeansOfTransport at a specific location. Date and times at which the goods is expected to be loaded */
  loadingDate?: LoadingDate;
  /** The earliset date and time at which Consignment, GoodsItem or Package is expected to be or required to delivered at the premises of DeliveryParty. */
  earliestDeliveryDate?: EarliestDeliveryDate;
  /** The latest date and time at which goods is expected to be or required to be at the premises of delivery party. */
  latestDeliveryDate?: LatestDeliveryDate;
  /** The earliest date and time at which Consignment, GoodsItem or Package is expected to be or required to be picked up at the premises of DespatchParty */
  earliestPickupDate?: EarliestPickupDate;
  /** The latest date and times at which Consignment, GoodsItem or Package is expected to be or required to be picked up at the premises of DespatchParty */
  latestPickupDate?: LatestPickupDate;
}

/**
 * DateAndTimes at which Consignment, GoodsItem or Package is expected to be loaded, required to be loaded or has loaded onto MeansOfTransport at a specific location. Date and times at which the goods is expected to be loaded
 * @format date-time
 * @example "2017-11-24T10:40:52Z"
 */
export type LoadingDate = string;

/**
 * The earliset date and time at which Consignment, GoodsItem or Package is expected to be or required to delivered at the premises of DeliveryParty.
 * @format date-time
 * @example "2017-11-24T10:40:52Z"
 */
export type EarliestDeliveryDate = string;

/**
 * The latest date and time at which goods is expected to be or required to be at the premises of delivery party.
 * @format date-time
 * @example "2017-11-24T10:40:52Z"
 */
export type LatestDeliveryDate = string;

/**
 * The earliest date and time at which Consignment, GoodsItem or Package is expected to be or required to be picked up at the premises of DespatchParty
 * @format date-time
 * @example "2017-11-24T10:40:52Z"
 */
export type EarliestPickupDate = string;

/**
 * The latest date and times at which Consignment, GoodsItem or Package is expected to be or required to be picked up at the premises of DespatchParty
 * @format date-time
 * @example "2017-11-24T10:40:52Z"
 */
export type LatestPickupDate = string;

/** The service representation on the goods */
export interface Service {
  /** Identification of a product or service offered by TransportCompany or Forwarder */
  basicServiceCode: BasicServiceCode;
  additionalServiceCode?: AdditionalServiceCode[];
}

/**
 * Additional service linked to Basic Service Code
 * @minLength 1
 * @maxLength 10
 * @example "A1"
 */
export type AdditionalServiceCode = string;

/** The goods are only to be delivered if the content of COD has been fulfilled (e.g. through the valid receipt for a paid amount) */
export interface CashOnDelivery {
  /**
   * Payment reference OCR or Text
   * @minLength 1
   * @maxLength 35
   * @example "070004453904"
   */
  transactionIdentifier: string;
  /**
   * Type of COD (BANKRECEIPT)
   * @minLength 1
   * @maxLength 18
   * @example "BANKRECEIPT"
   */
  codType?: string;
  /** The amount to be paid before the goods may be delivered. */
  codAmount: CodAmount;
}

/** The amount to be paid before the goods may be delivered. */
export interface CodAmount {
  /**
   * The amount in 2-decimal format with . as separator, if applicable
   * @format double
   * @example 20
   */
  amount: number;
  /**
   * The currency refers to ISO 4217
   * @minLength 3
   * @maxLength 3
   * @example "SEK"
   */
  currency: string;
}

/** Transport or other insurance which is ordered for or which is covered for the transport */
export interface Insurance {
  /**
   * Used with insurance additional service for country DK
   * * DOMESTICDK
   * * EUROPE
   * * RESTOFTHEWORLD
   * @minLength 1
   * @maxLength 35
   * @example "EUROPE"
   */
  typeOfInsurance?: string;
  /** Amount for which the commodity or commodities contained in shipment, have been insured through the type of insurance identified by shipment */
  insuranceAmount: InsuranceAmount;
}

/** Amount for which the commodity or commodities contained in shipment, have been insured through the type of insurance identified by shipment */
export interface InsuranceAmount {
  /**
   * The amount in 2-decimal format with . as separator, if applicable
   * @format double
   * @example 20
   */
  amount: number;
  /**
   * The currency refers to ISO 4217
   * @minLength 3
   * @maxLength 3
   * @example "SEK"
   */
  currency: string;
}

/** Value of the commodity or commodities contained in shipment */
export interface GoodsValue {
  /**
   * The amount in 2-decimal format with . as separator, if applicable
   * @format double
   * @example 20
   */
  amount: number;
  /**
   * The currency refers to ISO 4217 3-letter representation
   * @minLength 3
   * @maxLength 3
   * @example "SEK"
   */
  currency: string;
}

/** Text which may be written freely and without restrictions */
export interface FreeText {
  /**
   * The usage intended for Text
   * * DEL = Delivery instruction
   * * ICN = Information for consignee
   * * INS = Insurance additional services
   * * ZRE = Used with return parcel service (Z11)
   * * ZTG = Text to be written on label
   * * ZHD = Handover description
   * * ZOI = Order information
   * * ZUL = URL to the label
   * @minLength 3
   * @maxLength 3
   * @example "DEL"
   */
  usageCode: string;
  /**
   * Instruction or other text to be used as specified by usage code
   * @minLength 1
   * @maxLength 1000
   * @example "Sign on glass required"
   */
  text: string;
}

/** Total number of volume units */
export interface Volume {
  /**
   * The value with . as separator, if applicable
   * @format double
   * @example 2
   */
  value: number;
  /**
   * The unit of the value
   * * DMQ = cubic decimetres
   * * MTQ = cubic metres
   * @minLength 3
   * @maxLength 3
   * @example "MTQ"
   */
  unit: string;
}

/** Total number of length meters occupied by goods item in means of transport */
export interface LoadingMetres {
  /**
   * The value with . as separator, if applicable
   * @format double
   * @example 5
   */
  value: number;
  /**
   * * The unit of the value
   * * MTR = loading metres
   * @minLength 3
   * @maxLength 3
   * @example "MTR"
   */
  unit: string;
}

/** Terms agreed between goods seller and goods buyer */
export interface TermsOfDelivery {
  /**
   * Terms of payment agreement between goods seller and goods buyer. Valid values;
   * * EXW = Consignee (Ex Works)
   * * DDP = Consignor
   * * DAP = Delivered at Place
   * * DAT = Delivered at Terminal
   * * FCA = Free Carrier
   * * FAS = Free Alongside Ship
   * * FOB = Free on Board
   * * CFR = Cost and Freight
   * * CIF = Cost, Insurance and Freight
   * * CPT = Carriage Paid To
   * * CIP = Carriage and Insurance Paid To
   */
  todConditionCode: TodConditionCode;
  /** Denotes whether TODConditionCode is (2000=COMBITERMS, 1990=INCOTERMS) */
  todConditionCodeList: string;
  /**
   * Location in respect to which TermsOfDelivery is defined
   * @example "CIP Stavanger"
   */
  todLocation?: string;
}

/**
 * Terms of payment agreement between goods seller and goods buyer. Valid values;
 * * EXW = Consignee (Ex Works)
 * * DDP = Consignor
 * * DAP = Delivered at Place
 * * DAT = Delivered at Terminal
 * * FCA = Free Carrier
 * * FAS = Free Alongside Ship
 * * FOB = Free on Board
 * * CFR = Cost and Freight
 * * CIF = Cost, Insurance and Freight
 * * CPT = Carriage Paid To
 * * CIP = Carriage and Insurance Paid To
 * @minLength 1
 * @maxLength 3
 * @example "DDP"
 */
export type TodConditionCode = string;

/** Part of the total carriage way delimited by start location and end location. */
export interface TransportLeg {
  /**
   * Valid values (MAINTRANSPORT=main transport, POSTCARRIAGE=postcarriage)
   * @example "MAINTRANSPORT"
   */
  transportLegType: string;
  /**
   * Identification of transport leg (e.g. identification of a particular route)
   * @example "S/S FRYD"
   */
  transportLegId?: string;
  /** Unit actively contributing to the carriage of shipment */
  meansOfTransport?: MeansOfTransport;
  /** Enveloping start location, end location and routing */
  location?: Location;
}

/** Unit actively contributing to the carriage of shipment */
export interface MeansOfTransport {
  /**
   * Identification of means of transport, e.g. license plate, car number
   * @example "KNP123"
   */
  meansOfTransportId?: string;
  /**
   * The name of means of transport, mostly relevant for sea carriers (e.g. S/S FRYD)
   * @example "S/S FRYD"
   */
  name?: string;
  /**
   * Type of MeansOfTransport
   * * 11 = Ship/boat
   * * 6 = Airplane
   * * 1 = Truck/truck with trailer
   * * 14 = Flat bed truck with trailer, truck, tugmaster
   * @example "1"
   */
  meansOfTransportType?: string;
  /** ISO 3166 country code of the item. */
  countryCode?: CountryCode;
}

/** Enveloping start location, end location and routing */
export interface Location {
  /** Unique identification of location */
  startLocation?: LocationIdentification;
  /** Unique identification of location */
  endLocation?: LocationIdentification;
  /** Unique identification of location */
  routing?: LocationIdentification;
}

/** Unique identification of location */
export interface LocationIdentification {
  /**
   * An ID uniquely identifying the location
   * @example "0037"
   */
  locationId: string;
  /**
   * Denotes which type of identification is employed in location ID
   * * POSTNORD_NO = PostNord NO location
   * * ZONECODE = Zone code
   * * DPD = DPD location
   * * IATA = IATA code
   * * UNLOCODE = UN location code
   * @example "DPD"
   */
  locationIdType: string;
}

/** Parties associated with the transport of goods */
export interface Parties {
  /** Person or firm (usually the seller) who delivers a shipment to a carrier for transporting it to a consignee (usually the buyer) named in the transportation documents */
  consignor: Consignor;
  /**
   * A party (usually a buyer) named by the consignor (usually a seller) in transportation documents as the party to whose order a shipment will be delivered to.
   * * Mandatory party for Instruction
   */
  consignee?: Consignee;
  /** Entity named in a delivery note and/or shipping documents as the party that will receive the delivery. Usually, the consignee of a shipment is the delivery party */
  deliveryParty?: DeliveryParty;
  /** The party responsible for the cost of shipment. The cost may include carrying charges, storage fees, insurance coverage and other costs to transport goods */
  freightPayer?: FreightPayer;
  /** Party where goods are collected or taken over by the carrier (i.e. if other than consignor). */
  pickupParty?: PickupParty;
  /** The original supplier of the goods */
  originalShipper?: OriginalShipper;
  /** Party named in the shipping documents as the party to whom a notice of arrival must also be sent */
  notifyParty?: NotifyParty;
  /** Party where the goods will be returned to if other than consignor-party (i.e. if the recipient doesn't collect them). */
  returnParty?: ReturnParty;
}

/** Person or firm (usually the seller) who delivers a shipment to a carrier for transporting it to a consignee (usually the buyer) named in the transportation documents */
export interface Consignor {
  /**
   * The customer number country agreement is with;
   * * Z11 = PostNord Denmark
   * * Z12 = PostNord Sweden
   * * Z13 = PostNord Norway
   * * Z14 = PostNord Finland
   * * ZDL = Direct Link (Customer needs to have a agreement with Direct Link)
   */
  issuerCode: IssuerCode;
  /** Party identification */
  partyIdentification: PartyIdentification;
  /** The party object */
  party: Party;
  /** The reference */
  reference?: Reference;
  /** The payment account */
  account?: Account;
}

/**
 * The customer number country agreement is with;
 * * Z11 = PostNord Denmark
 * * Z12 = PostNord Sweden
 * * Z13 = PostNord Norway
 * * Z14 = PostNord Finland
 * * ZDL = Direct Link (Customer needs to have a agreement with Direct Link)
 * @minLength 1
 * @maxLength 3
 * @example "Z11"
 */
export type IssuerCode = string;

/** The party object */
export interface Party {
  /** Name information associated with company, organization or a person */
  nameIdentification: NameIdentification;
  /** The address */
  address: Address;
  /** GLN number (Global location number) */
  glnLocation?: GlnLocation;
  /** GPS location in decimal format (ISO 6709) */
  gpsLocation?: GpsLocation;
  /** The contact object */
  contact?: Contact;
  legalEntity?: LegalEntity;
}

/** Name information associated with company, organization or a person */
export interface NameIdentification {
  /** Name of the person or company or place */
  name: Name;
  /** The name of the company */
  companyName?: CompanyName;
  /** The care of name */
  careOfName?: CareOfName;
}

/**
 * The name of the company
 * @minLength 1
 * @maxLength 60
 * @example "PostNord AB"
 */
export type CompanyName = string;

/**
 * The care of name
 * @minLength 1
 * @maxLength 60
 * @example "Karl Svensson"
 */
export type CareOfName = string;

/** The address */
export interface Address {
  streets?: AddressLine[];
  /** The postal code for the address */
  postalCode: PostalCode;
  /** Place name (ex Sted name in Denmark) */
  placeName?: PlaceName;
  /** The name of the state or region */
  state?: State;
  /** The name of the city */
  city: City;
  /** ISO 3166 country code of the item. */
  countryCode: CountryCode;
}

/**
 * The street name and number object
 * @minLength 1
 * @maxLength 50
 * @example "Engelbrekts väg 110B"
 */
export type AddressLine = string;

/**
 * The name of the state or region
 * @minLength 1
 * @maxLength 35
 */
export type State = string;

/**
 * GLN number (Global location number)
 * @pattern ([0-9]{1,13})
 * @example "7350053850019"
 */
export type GlnLocation = string;

/**
 * Gps
 * GPS location in decimal format (ISO 6709)
 */
export interface GpsLocation {
  /**
   * @format float
   * @min -90
   * @max 90
   * @example 48.831238
   */
  latitude?: number;
  /**
   * @format float
   * @min -180
   * @max 180
   * @example 2.278131
   */
  longitude?: number;
}

/** The contact object */
export interface Contact {
  /** The name of the contact */
  contactName?: ContactName;
  /** The email adress to the contact */
  emailAddress?: EmailAddress;
  /** The phone or mobile number to the contact */
  phoneNo?: PhoneNo;
  /** The sms number to the contact */
  smsNo?: SmsNo;
}

/**
 * The name of the contact
 * @minLength 1
 * @maxLength 50
 * @example "Nils Andersson"
 */
export type ContactName = string;

export interface LegalEntity {
  /**
   * Business Type:
   * * `P` : PRIVATE
   * * `B` : BUSINESS
   */
  businessType?: BusinessType;
}

/**
 * Business Type:
 * * `P` : PRIVATE
 * * `B` : BUSINESS
 * @example "P"
 */
export type BusinessType = string;

/** The payment account */
export interface Account {
  /** The account number associated with the supplied bank name */
  accountNo?: AccountNo;
  /** Values (Z01=Swedish Bank Giro, Z04=Swedish Plus Giro, ADE=Bank account, IBAN=International Bank Account Number, PEC=Pallet Exchange Customer Number, Z10=DB Image, Z11=DB File OCR) */
  bankName?: BankName;
  /**
   * The swift code for the account information. Also called BIC. When to get paid from abroad always give your IBAN and BIC to your foreign payers.
   * @example "SWEDSESS"
   */
  swiftCode?: string;
}

/**
 * The account number associated with the supplied bank name
 * @minLength 1
 * @maxLength 35
 * @example "7bbb-aaaaaaa"
 */
export type AccountNo = string;

/**
 * Values (Z01=Swedish Bank Giro, Z04=Swedish Plus Giro, ADE=Bank account, IBAN=International Bank Account Number, PEC=Pallet Exchange Customer Number, Z10=DB Image, Z11=DB File OCR)
 * @minLength 3
 * @maxLength 4
 * @example "ADE"
 */
export type BankName = string;

/**
 * A party (usually a buyer) named by the consignor (usually a seller) in transportation documents as the party to whose order a shipment will be delivered to.
 * * Mandatory party for Instruction
 */
export interface Consignee {
  /**
   * The customer number country agreement is with;
   * * Z11 = PostNord Denmark
   * * Z12 = PostNord Sweden
   * * Z13 = PostNord Norway
   * * Z14 = PostNord Finland
   * * ZDL = Direct Link (Customer needs to have a agreement with Direct Link)
   */
  issuerCode?: IssuerCode;
  /** Party identification */
  partyIdentification?: PartyIdentification;
  /** The party object */
  party: Party;
  /** The reference */
  reference?: Reference;
  /** The payment account */
  account?: AccountInner;
}

/** The payment account */
export interface AccountInner {
  /** The account number associated with the supplied bank name */
  accountNo?: AccountNo;
  /** Values (Z01=Swedish Bank Giro, Z04=Swedish Plus Giro, ADE=Bank account, IBAN=International Bank Account Number, PEC=Pallet Exchange Customer Number, Z10=DB Image, Z11=DB File OCR) */
  bankName?: BankName;
}

/** Entity named in a delivery note and/or shipping documents as the party that will receive the delivery. Usually, the consignee of a shipment is the delivery party */
export interface DeliveryParty {
  /** Party identification */
  partyIdentification?: PartyIdentification;
  /** The party object */
  party: PartyExt;
}

/** The party object */
export interface PartyExt {
  /** Name information associated with company, organization or a person */
  nameIdentification: NameIdentification;
  /** The address */
  address: Address;
  /** The contact object */
  contact?: Contact;
}

/** The party responsible for the cost of shipment. The cost may include carrying charges, storage fees, insurance coverage and other costs to transport goods */
export interface FreightPayer {
  /**
   * The customer number country agreement is with;
   * * Z11 = PostNord Denmark
   * * Z12 = PostNord Sweden
   * * Z13 = PostNord Norway
   * * Z14 = PostNord Finland
   * * ZDL = Direct Link (Customer needs to have a agreement with Direct Link)
   */
  issuerCode: IssuerCode;
  /** Party identification */
  partyIdentification: PartyIdentification;
  /** The party object */
  party?: Party;
}

/** Party where goods are collected or taken over by the carrier (i.e. if other than consignor). */
export interface PickupParty {
  /** The party object */
  party: Party;
  /** The reference */
  reference?: Reference;
}

/** The original supplier of the goods */
export interface OriginalShipper {
  /** Party identification */
  partyIdentification?: PartyIdentification;
  /** The party object */
  party: Party;
  /** The payment account */
  account?: Account;
}

/** Party named in the shipping documents as the party to whom a notice of arrival must also be sent */
export interface NotifyParty {
  /** The party object */
  party: PartyNotify;
}

/** The party object */
export interface PartyNotify {
  /** Name information associated with company, organization or a person */
  nameIdentification?: NameIdentification;
  /** The address */
  address?: Address;
  /** The contact object */
  contact?: ContactInner;
}

/** The contact object */
export interface ContactInner {
  /** The name of the contact */
  contactName?: ContactName;
  /** The email adress to the contact */
  emailAddress?: EmailAddress;
  /** The phone or mobile number to the contact */
  phoneNo?: PhoneNo;
  /** The sms number to the contact */
  smsNo?: SmsNo;
}

/** Party where the goods will be returned to if other than consignor-party (i.e. if the recipient doesn't collect them). */
export interface ReturnParty {
  /** The party object */
  party: Party;
}

/** A collection of items displaying a set of common characteristics */
export interface GoodsItem {
  /** Description of the commodities contained in the transport of goods. Also used for taging the labels with additional information e.g. REK, Postal parcel international */
  marking?: Marking;
  /** Description of the commodities contained in the transport of goods */
  goodsDescription?: GoodsDescription;
  /** The temperature goods object */
  temperature?: Temperature;
  dangerousGoods?: DangerousGoods2[];
  /**
   * Type of package or packaging material, allowed codes:
   * * PC = Parcel
   * * PE = EUR Pallet
   * * AF = Half Pallet
   * * OA = Quearter Pallet
   * * OF = Special Pallet
   * * CW = Cage Roll
   * * BX = Box
   * * EN = Envelope
   *
   * Refers to UN/ECE Rec. No. 21. The ZZ is to be used when ordering a PickupBooking for groupage shipment IDs.
   */
  packageTypeCode?: PackageTypeCode;
  /** The quantity */
  numberOfPackageTypeCodeItems?: Quantity;
  /**
   * Max 200 allowed
   * @minItems 1
   */
  items: Item[];
}

/**
 * Description of the commodities contained in the transport of goods. Also used for taging the labels with additional information e.g. REK, Postal parcel international
 * @minLength 1
 * @maxLength 35
 * @example "marking label on the goods"
 */
export type Marking = string;

/**
 * Description of the commodities contained in the transport of goods
 * @minLength 1
 * @maxLength 35
 * @example "Car parts"
 */
export type GoodsDescription = string;

/** The temperature goods object */
export interface Temperature {
  /** The value object */
  idealTemperature?: Value;
  /** The value object */
  minTemperature?: Value;
  /** The value object */
  maxTemperature?: Value;
}

/** The value object */
export interface Value {
  /**
   * The value with . as separator, if applicable
   * @format double
   */
  value: number;
  /** The unit of the value */
  unit: string;
}

/** The dangerous goods object */
export interface DangerousGoods2 {
  /**
   * The unique serial number assigned within the United Nations to substances and articles contained in a list of the dangerous goods most commonly carried.
   * @example 1891
   */
  UNNo?: number;
  /**
   * Hazard identification code
   * @minLength 1
   * @maxLength 7
   * @example "6.1"
   */
  hazardIdentificationCode?: string;
  /**
   * Special packing provisions
   * @minLength 1
   * @maxLength 7
   * @example "B4"
   */
  additionalHazardClassificationIdentifier?: string;
  /**
   * Determines the degree of protective packaging required
   * * I = High danger
   * * II = Medium danger
   * * III = low danger
   * @example "II"
   */
  packingGroup?: string;
  /**
   * Determines the type of the package
   * * SA = Bag
   * * SAL = Big bag
   * * GB = Bottle, gas
   * * CS = Box
   * * IPC = Composite package
   * * CK = Drum
   * * IBC = IBC Container
   * * CX = Jerrican
   * * PCL = Large packagings
   * @example "SA"
   */
  packageType?: string;
  /**
   * A code indicating a restriction for transport through tunnels
   * @minLength 1
   * @maxLength 6
   * @example "(D/E)"
   */
  tunnelCode?: string;
  /** @example 1 */
  quantity?: number;
  /** @example "Etylbromid" */
  technicalNameNos?: string;
  /** The value object */
  netWeight?: Value;
  /** The value object */
  grossWeight?: Value;
  labelNumber?: string;
  isMarinePollutant?: boolean;
  ems?: string;
  flashPoint?: number;
}

/**
 * Type of package or packaging material, allowed codes:
 * * PC = Parcel
 * * PE = EUR Pallet
 * * AF = Half Pallet
 * * OA = Quearter Pallet
 * * OF = Special Pallet
 * * CW = Cage Roll
 * * BX = Box
 * * EN = Envelope
 *
 * Refers to UN/ECE Rec. No. 21. The ZZ is to be used when ordering a PickupBooking for groupage shipment IDs.
 * @minLength 1
 * @maxLength 7
 * @example "PC"
 */
export type PackageTypeCode = string;

/** A physical unit due to be transported, currently being transported or having been transported containing one or more commodities collected and packed as one physical unit. */
export interface Item {
  /** A reference number uniquely identifying item */
  itemIdentification: ItemIdentification;
  references?: ReferenceItem[];
  /** The dimensions */
  dimensions?: Dimension;
  /** weight of units */
  grossWeight?: Weight;
  /** Total number of volume units */
  volume?: Volume;
  /** Text which may be written freely and without restrictions */
  freeText?: FreeText;
  /** The amount object */
  itemValue?: Amount;
}

/** A reference number uniquely identifying item */
export interface ItemIdentification {
  /** A reference number uniquely identifying item. In some cases will a value of 0 trigger that PostNord creates the ID for the client */
  itemId: ItemId;
  /**
   * Identifies the type of itemId
   * * SSCC
   * * S10
   * * DPD
   * * OTHER
   * * CUSTOMER
   */
  itemIdType?: ItemIdType;
}

/**
 * Identifies the type of itemId
 * * SSCC
 * * S10
 * * DPD
 * * OTHER
 * * CUSTOMER
 * @example "SSCC"
 */
export type ItemIdType = string;

/** The reference */
export interface ReferenceItem {
  /** The reference number */
  referenceNo: ReferenceNo;
  /** Code giving specific meaning to a reference segment or a reference number, get more detailed information from API. */
  referenceType: ReferenceTypeItem;
}

/**
 * Code giving specific meaning to a reference segment or a reference number, get more detailed information from API.
 * @minLength 1
 * @maxLength 3
 * @example "ACD"
 */
export type ReferenceTypeItem = string;

/** The dimensions */
export interface Dimension {
  /** One of 3 dimensions, the other two being Width and Length */
  height?: Height;
  /** One of 3 dimensions, the other two being Height and Length */
  width?: Width;
  /** One of 3 dimensions, the other two being Width and Height */
  length?: Length;
}

/** One of 3 dimensions, the other two being Width and Length */
export interface Height {
  /**
   * The number of value
   * @format double
   * @example 25
   */
  value: number;
  /**
   * The unit of the value
   * * MTR = Metres
   * * DTM = Decimetres
   * * CMT = Centimetres
   * @minLength 3
   * @maxLength 3
   * @example "CMT"
   */
  unit?: string;
}

/** One of 3 dimensions, the other two being Height and Length */
export interface Width {
  /**
   * The number of value
   * @format double
   * @example 45
   */
  value: number;
  /**
   * The unit of the value
   * * MTR = Metres
   * * DTM = Decimetres
   * * CMT = Centimetres
   * @minLength 3
   * @maxLength 3
   * @example "CMT"
   */
  unit?: string;
}

/** One of 3 dimensions, the other two being Width and Height */
export interface Length {
  /**
   * The number of value
   * @format double
   * @example 15
   */
  value: number;
  /**
   * The unit of the value
   * * MTR = Metres
   * * DMT = Decimetres
   * * CMT = Centimetres
   * @minLength 3
   * @maxLength 3
   * @example "CMT"
   */
  unit?: string;
}

/** The equipment object */
export interface Equipment {
  /**
   * Exchangeable EUR pallet
   * @minLength 1
   * @maxLength 3
   * @example "EFP"
   */
  equipmentType?: string;
  /** Identifying containers and pallets (only available in Norway) */
  equipmentId?: string;
  /** The quantity */
  noOfUnits?: Quantity;
  seals?: Seal[];
}

/** The seal object (only available in Norway) */
export interface Seal {
  /** @example "123" */
  sealId: string;
  /**
   * @minLength 1
   * @maxLength 3
   */
  partyId?: string;
}

/**
 * The customs invoice declaration is used for packages classified as parcels.
 *
 * There are two different types of customs invoices, **commercial invoice** (namely trade invoice) and **proforma invoice** (export invoice).
 * - A commercial invoice is used when you export or import an item to be sold.
 * - A proforma invoice is used when you export or import something that you should not charge for or get paid for.
 *
 * When you use a pro forma invoice, you therefore rarely need to pay customs and VAT because you are not sending for a commercial purpose.
 *
 * Examples of occasions when you can use a proforma invoice are when you send samples of goods, gifts and advertising or return and replace goods
 */
export interface CustomsInvoice2 {
  /**
   * Defines the declaration type.
   *
   * - Export declaration are sent to the export country customs system
   * - Import  declaration are sent to the import country customs system
   *
   * Valid Enums:
   *   - invoiceExportDeclaration
   *   - invoiceImportDeclaration
   *   - exportDeclaration
   *   - importDeclaration
   * @default "invoiceExportDeclaration"
   */
  declarationType?: string;
  /**
   * The type of customs invoice
   *  - PROFORMA
   *  - COMMERCIAL
   * @default "commercial"
   */
  type: string;
  /** Identification of a product or service offered by TransportCompany or Forwarder */
  basicServiceCode?: BasicServiceCode;
  /** For import to norway */
  voec?: Voec;
  /** For import to EU */
  ioss?: Ioss;
  /** For export to Norway */
  splitShipmentId?: SplitShipmentId;
  /** The sellers name, address, contact information, and tax identification number. */
  seller: Seller;
  /** The buyers full name, address, contact information, and tax identification number */
  buyer: Buyer;
  /** The ship to partys full name, address, contact information. If different from the buyers */
  shipTo?: ShipTo;
  /** Invoice information */
  invoice: Invoice;
  ids?: Ids2[];
  /** @minItems 1 */
  detailedDescription: DetailedDescriptionCustomsInvoice[];
  /** weight of units */
  totalNetWeight?: Weight;
  /** weight of units */
  totalGrossWeight: Weight;
  /** The quantity */
  totalNumberOfPackages?: Quantity;
  /** Invoice sub-total is the total amount after any discount or rebate */
  invoiceSubTotal?: InvoiceSubTotal;
  /** The amount object */
  freightCost?: Amount;
  /** The amount object */
  invoiceTotal: Amount;
  transport?: Transport;
  /** Other remarks */
  otherRemarks?: OtherRemarks;
}

/** For export to Norway */
export type SplitShipmentId = string;

/** Book a customs declaration for the shipment of goods. */
export interface CustomsDeclaration {
  /** Refers to the date when the client/system creates the request/message. */
  messageDate?: MessageDate;
  /**
   * Message function identifier.
   * * Customsdeclaration
   * * ConsolidatedCustomsdeclaration
   */
  messageFunction?: MessageFunctionCustoms;
  /**
   * It is mandatory to send in an unique id for the message within the current information exchange setting
   * * An idempotency check is done on this attribute together with the updateIndicator attribute.
   * @minLength 1
   * @maxLength 14
   * @example "msg-182721551"
   */
  messageId?: string;
  /** Object used to identifying the client */
  application?: Application;
  /** An optional attribute indicating the language in which the contents of text elements and code value text equivalents are written. Use ISO 3166 two position alphabetic countrycode */
  language?: Language;
  /**
   * Either of these indicators must be used.
   *
   * For messageFunction Instruction
   * * If not used the message will be treated as an Original.
   * * An update can only be performed after an Original.
   * * A Deletion can only be performed, if an Original exists.
   * * Update and Deletion are not supported for (Z11=PostNord Denmark, Z13=PostNord Norway, Z14=PostNord Finland)
   *
   * For messageFunction PickupBooking
   * * Only Original is supported
   * @default "Original"
   */
  updateIndicator?: 'Original' | 'Update' | 'Deletion';
  /**
   * If this is "true";
   * * The request will only be validate against business rules
   * * A "Test" label can be fetch using the item ID
   * * No EDI will be sent to PostNord
   * @default false
   */
  testIndicator?: boolean;
  /**
   * @maxItems 1
   * @minItems 1
   */
  ids: CustomsDeclarationIds[];
  /** Name information associated with company, organization or a person */
  customsDeclarationCN22?: CustomsDeclarationCN22;
  /** Name information associated with company, organization or a person */
  customsDeclarationCN23?: CustomsDeclarationCN23;
  /**
   * The customs invoice declaration is used for packages classified as parcels.
   *
   * There are two different types of customs invoices, **commercial invoice** (namely trade invoice) and **proforma invoice** (export invoice).
   * - A commercial invoice is used when you export or import an item to be sold.
   * - A proforma invoice is used when you export or import something that you should not charge for or get paid for.
   *
   * When you use a pro forma invoice, you therefore rarely need to pay customs and VAT because you are not sending for a commercial purpose.
   *
   * Examples of occasions when you can use a proforma invoice are when you send samples of goods, gifts and advertising or return and replace goods
   */
  customsInvoice?: CustomsInvoice2;
  /**
   * Shipments to Norway that is declared by our customer or via its Agent/speditor.
   *
   * PostNord needs to get a TVINN documuent.
   *
   * To properly prefrom the customs boader custos control according to Digitoll.
   */
  customsTvinn?: CustomsTvinn;
}

/**
 * Shipments to Norway that is declared by our customer or via its Agent/speditor.
 *
 * PostNord needs to get a TVINN documuent.
 *
 * To properly prefrom the customs boader custos control according to Digitoll.
 */
export interface CustomsTvinn {
  /** The sellers name, address, contact information, and tax identification number. */
  seller?: Seller;
  /** The buyers full name, address, contact information, and tax identification number */
  buyer?: Buyer;
  externalDeclaration?: ExternalDeclaration[];
  ids?: Ids2[];
}

export interface ExternalDeclaration {
  /**
   * What type of declaration.
   * * For now only TVINN is used.
   */
  declarantType?: DeclarantType;
  /**
   * For TVINN this is the combination of declarantno + declaration date + sequence number.
   * * Mandatory for TVINN.
   */
  declarationIdentification?: DeclarationIdentification;
  /**
   * The external declaraions issued export MRN.
   * * Mandatory for TVINN.
   */
  exportMRN?: ExportMRN;
  /** If transit MRN is issued */
  transitMRN?: TransitMRN;
  /**
   * For TVINN the declarant number.
   * * Mandatory for TVINN.
   */
  declarantNo?: DeclarantNo;
  /**
   * The date the customs declare
   * * Mandatory for TVINN
   */
  declarationDate?: TvinnDeclarationDate;
  /**
   * For TVINN the declaration sequence number.
   * * Mandatory for TVINN.
   */
  declarationSequence?: DeclarationSequence;
  /**
   * Total number of weight units including number of weight units of the packaging material
   * * Mandatory for TVINN
   */
  totalGrossWeight?: TvinnWeight;
  /**
   * The quantity.
   * * Mandatory for TVINN
   */
  totalNoOfPackages?: TvinnQuantity;
  /**
   * Description for the goods in the declaration.
   * * Mandatory for TVINN.
   *
   *
   */
  goodsDescription?: GoodsDescription2;
}

/**
 * What type of declaration.
 * * For now only TVINN is used.
 * @maxLength 35
 */
export type DeclarantType = string;

/**
 * For TVINN this is the combination of declarantno + declaration date + sequence number.
 * * Mandatory for TVINN.
 * @maxLength 256
 */
export type DeclarationIdentification = string;

/**
 * The external declaraions issued export MRN.
 * * Mandatory for TVINN.
 * @maxLength 35
 */
export type ExportMRN = string;

/**
 * If transit MRN is issued
 * @maxLength 35
 */
export type TransitMRN = string;

/**
 * For TVINN the declarant number.
 * * Mandatory for TVINN.
 * @maxLength 35
 */
export type DeclarantNo = string;

/**
 * The date the customs declare
 * * Mandatory for TVINN
 * @format date
 * @example "2024-10-03"
 */
export type TvinnDeclarationDate = string;

/**
 * For TVINN the declaration sequence number.
 * * Mandatory for TVINN.
 * @maxLength 35
 */
export type DeclarationSequence = string;

/**
 * Total number of weight units including number of weight units of the packaging material
 * * Mandatory for TVINN
 */
export interface TvinnWeight {
  /**
   * The value with . as separator, if applicable
   * @format double
   * @example 50
   */
  value: number;
  /**
   * The unit of the value
   * @example "KGM"
   */
  unit: 'KGM' | 'GRM' | 'TON';
}

/**
 * The quantity.
 * * Mandatory for TVINN
 */
export interface TvinnQuantity {
  /**
   * The number of value
   * @example 5
   */
  value: number;
}

/**
 * Description for the goods in the declaration.
 * * Mandatory for TVINN.
 *
 *
 * @maxLength 256
 */
export type GoodsDescription2 = string;

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

export type RequestParams = Omit<FullRequestParams, 'body' | 'method' | 'query' | 'path'>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, 'baseUrl' | 'cancelToken' | 'signal'>;
  securityWorker?: (securityData: SecurityDataType | null) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown> extends Response {
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
  private customFetch = (...fetchParams: Parameters<typeof fetch>) => fetch(...fetchParams);

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
    const keys = Object.keys(query).filter((key) => 'undefined' !== typeof query[key]);
    return keys
      .map((key) => (Array.isArray(query[key]) ? this.addArrayQueryParam(query, key) : this.addQueryParam(query, key)))
      .join('&');
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : '';
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === 'object' || typeof input === 'string') ? JSON.stringify(input) : input,
    [ContentType.Text]: (input: any) => (input !== null && typeof input !== 'string' ? JSON.stringify(input) : input),
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

  protected mergeRequestParams(params1: RequestParams, params2?: RequestParams): RequestParams {
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

  protected createAbortSignal = (cancelToken: CancelToken): AbortSignal | undefined => {
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

    return this.customFetch(`${baseUrl || this.baseUrl || ''}${path}${queryString ? `?${queryString}` : ''}`, {
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type && type !== ContentType.FormData ? { 'Content-Type': type } : {}),
      },
      signal: (cancelToken ? this.createAbortSignal(cancelToken) : requestParams.signal) || null,
      body: typeof body === 'undefined' || body === null ? null : payloadFormatter(body),
    }).then(async (response) => {
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
 * @title Booking APIs (Public)
 * @version 3.4.8
 * @termsOfService https://developer.postnord.com/support
 * @baseUrl https://api2.postnord.com/rest/shipment
 *
 * The intent with the Booking APIs is to support all different kinds of transport bookings that PostNord offers.
 *
 * ---
 *
 * **These are the main uses cases for the APIs**
 *
 * - Book EDI Instruction
 * - Book EDI Instruction and get labels (PDF | ZPL)
 * - Book Digital Returns and get labels (PDF | ZPL | QR code)
 * - Book Pickups
 * - Book Digital Returns
 * - Book Customs Book Customs Information (CN22, CN23, Commercial Invoice, Proforma Invoice)
 * - Get labels and documents
 *
 * ---
 *
 * **Important**
 * - There are several pre-conditons to use the APIs, so please contact your PostNord organization.
 *
 *   - _*Denmark kundeintegration@postnord.com*_
 *   - _*Finland it.fi@postnord.com*_
 *   - _*Norway edi.no@postnord.com*_
 *   - _*Sweden kundintegration.se@postnord.com*_
 *   - _*Germany logistics.it.de@postnord.com*_
 *
 *
 * ---
 * **API Information**
 *
 * | **Date**   | **Version** | **Description**                                          |
 * | ---------- | ----------- | -------------------------------------------------------- |
 * | 2021-11-28 | 3.3.21      | Added new endpoints|
 *
 * | **Feature**| **Setting** | **Description**                                          |
 * | ---------- | ----------- | -------------------------------------------------------- |
 * | CORS       | True        | Enable access to the API from a different origin |
 * | SECURED    | False      |The API do not require a PostNord Oauth2 login         |
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  v3 = {
    /**
     * @description The Book Pickup is to support all different kinds of pickup. The pickup process will differ depending on; - Pickup country - Consignor country - Package Type Code _*This first version of the API however only supports the booking of Collection Request*_ --- **Definitions of Parties** - CONSIGNOR    The party **paying** and defining the **pickup address**. - PICKUPPARTY  Used to define a **different pickup address** from the address in the consignor. - CONSIGNEE    The party defining the **delivery address. Only mandatory with collection request**. --- **Collection Request Pickup** - Package Type Code; Parcel (PC) **and** - Pickup Country; Outside the Nordics Countries **or** - Consignor Country; Is not the same as Pickup Country **The process will be as follows;** 1. Send in the pickup booking request via the REST API. 2. Get response back via the REST API containing status and pickup ID. This is the status of the communication with PostNord’s booking component. 3. Use the pickup ID via the track and trace API or web site to get information about further status of the booking and the transport of the parcel. You will also get information about the item ID that will be used on the parcel during transport. --- - An alternative way of getting this information is to subscribe to status messages from PostNord via EDI. - The first status in this step, is the information that PostNord receives in return on the order from DPD, which is either a positive status, where also the item ID is returned, or a negative status with a number of different reasons. --- **Important** - The request is based upon the EDI Instruction format [Click me](https://atdeveloper.postnord.com/api/external/docs?query=Description+of+Pickup+Booking+API+request.pdf) - Exampel request can be found [here.](https://guides.developer.postnord.com/#cb72703f-e200-4673-b451-4b857df29605)
     *
     * @tags Book Pickups
     * @name CreatePickups
     * @summary Book Pickups
     * @request POST:/v3/pickups
     */
    createPickups: (
      query: {
        /**
         * The unique consumer (client) identifier 32 characters
         * @default "eac3dc8da4a73ab3001150b5c2d653d1"
         */
        apikey: string;
      },
      pickupBooking: PickupBooking,
      params: RequestParams = {},
    ) =>
      this.request<BookingResponse, ErrorResponse | void>({
        path: `/v3/pickups`,
        method: 'POST',
        query: query,
        body: pickupBooking,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description The pickup process will differ depending on; - Pickup country - Consignor country - Package Type Code --- **Limitations** - Only supports domestic pickups of items in SE, DK, FI --- **The process will be as follows;** 1. Send in the pickup booking request via the REST API. 2. Get response back via the REST API containing status and pickup ID. This is the status of the communication with PostNord’s booking component. 3. Use the pickup ID via the track and trace API or web site to get information about further status of the booking and the transport of the parcel. You will also get information about the item ID that will be used on the parcel during transport. --- - An alternative way of getting this information is to subscribe to status messages from PostNord via EDI. - The first status in this step, is the information that PostNord receives in return on the order from DPD, which is either a positive status, where also the item ID is returned, or a negative status with a number of different reasons.
     *
     * @tags Book Pickups
     * @name CreatePickupIds
     * @summary Book Pickup by item ID
     * @request POST:/v3/pickups/ids
     */
    createPickupIds: (
      query: {
        /**
         * The unique consumer (client) identifier 32 characters
         * @default "eac3dc8da4a73ab3001150b5c2d653d1"
         */
        apikey: string;
      },
      ids: PickupIdInfo[],
      params: RequestParams = {},
    ) =>
      this.request<BookingResponse, ErrorResponse | void>({
        path: `/v3/pickups/ids`,
        method: 'POST',
        query: query,
        body: ids,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description **This API support the following use case** - Book shipment based on the EDI instruction **Description** - The ordering party sends a request to PostNord regarding carrying out a transport service, possibly to be conducted at a particular time.
     *
     * @tags Book EDI Instruction & get Labels
     * @name CreateEdi
     * @summary Book shipment based on the EDI instruction
     * @request POST:/v3/edi
     */
    createEdi: (
      query: {
        /**
         * The unique consumer (client) identifier 32 characters
         * @default "eac3dc8da4a73ab3001150b5c2d653d1"
         */
        apikey: string;
        /**
         * Whether to generate a qrCode image and add link to image in response (used with additional service code C2 and only for certain products)
         * @default false
         */
        generateQrcodeImage?: boolean;
        /**
         * The number of pixels for each module in the QRCode, must be a square number (1, 4, 9, 16, 25 etc)
         * @default 4
         * @example 9
         */
        qrCodeScale?: number;
        /**
         * The format of qrcode
         * @default "PNG"
         */
        qrCodeFormat?: 'PNG' | 'SVG';
        /**
         * The generated QR code will be sent to the email address given here (used with additional service code C2 and only for certain products)
         * @example "someone@example.com"
         */
        emailQRcodeTo?: string;
        /**
         * The generated QR code will be SMS to the smsNo given here (used with additional service code C2 and only for certain products)
         * @example "+46707219595"
         */
        smsQRcodeTo?: string;
        /**
         * The SMS and Email is written in the defined language [sv | da | no | fi | en]
         * @default "sv"
         * @example "sv"
         */
        locale?: string;
      },
      shipmentInformation: EdiInstruction,
      params: RequestParams = {},
    ) =>
      this.request<BookingResponse, ErrorResponse | void>({
        path: `/v3/edi`,
        method: 'POST',
        query: query,
        body: shipmentInformation,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description **This API support the following use case** - Send in EDI Instruction and generate the refering ZPL labels **ZPL Viewer** - The ZPL result set can be view using: http://labelary.com/viewer.html - Save the API data result into a file.txt - Open the file.txt - Set LabelSize to 105x190mm - Select Redraw - Note, multiple label can exists
     *
     * @tags Book EDI Instruction & get Labels
     * @name CreateEdiLabelZpl
     * @summary Book EDI Instruction and generate the referring ZPL labels
     * @request POST:/v3/edi/labels/zpl
     */
    createEdiLabelZpl: (
      query: {
        /**
         * The unique consumer (client) identifier 32 characters
         * @default "eac3dc8da4a73ab3001150b5c2d653d1"
         */
        apikey: string;
        /**
         * Whether to generate a qrCode image and add link to image in response (used with additional service code C2 and only for certain products)
         * @default false
         */
        generateQrcodeImage?: boolean;
        /**
         * The number of pixels for each module in the QRCode, must be a square number (1, 4, 9, 16, 25 etc)
         * @default 4
         * @example 9
         */
        qrCodeScale?: number;
        /**
         * The format of qrcode
         * @default "PNG"
         */
        qrCodeFormat?: 'PNG' | 'SVG';
        /**
         * The generated QR code will be sent to the email address given here (used with additional service code C2 and only for certain products)
         * @example "someone@example.com"
         */
        emailQRcodeTo?: string;
        /**
         * The generated QR code will be SMS to the smsNo given here (used with additional service code C2 and only for certain products)
         * @example "+46707219595"
         */
        smsQRcodeTo?: string;
        /**
         * The SMS and Email is written in the defined language [sv | da | no | fi | en]
         * @default "sv"
         * @example "sv"
         */
        locale?: string;
        /** Generate Error label for shipments that fail to book due to some problems like bad data */
        errorLabel?: boolean;
        /**
         * The ZPL files will contain one or more label, and are optimized against the paper size. If you are requesting a PDF file and you would like it to contain all of the labels defined in your request
         * @default false
         * @example false
         */
        multiZPL?: boolean;
        /**
         * Includes the CUT command (MMC) into the produced ZPL label.
         * @default false
         * @example false
         */
        cutter?: boolean;
        /**
         * The desired print density, in dots per millimeter. Valid values are 8dpmm (203dpi).
         * @default "8dpmm"
         */
        dpmm?: '8dpmm';
        /**
         * The PostNord label uses the fonts Arial (E:ARI000.TTF, E:ARIAL.TTF, E:T0003M_). A client can override the font, but there are no guarantees that it works from a layout prespective.
         * @default "E:ARI000.TTF, E:ARIAL.TTF, E:T0003M_"
         */
        fonts?: string;
        /**
         * The PostNord label has a lenght of 190mm. The client can define a lenght that is more then 190mm here.
         * @format int32
         * @min 190
         * @default 190
         */
        labelLength?: number;
        /**
         * Defines the label type to produce, supported options;
         * * **standard** = 190*105mm
         * * **small** = 75*105mm
         *
         * Note; **small** is not available for all lables produced, then **standard** will be defaulted.
         * @default "standard"
         * @example "standard"
         */
        labelType?: string;
        /**
         * Add the PostNord information text, which is printed on its own label (only used by PostNord clients)
         * @default false
         * @example false
         */
        pnInfoText?: boolean;
        /**
         * Add Security declaration
         * @default false
         */
        printSecurityDeclaration?: boolean;
        /**
         * max number of labels in response.
         * @format int32
         * @min 1
         * @max 100
         * @default 100
         */
        labelsPerPage?: number;
        /**
         * which page of labels to view.
         * @format int32
         * @min 1
         * @default 1
         */
        page?: number;
        /**
         * Generate labels offline and return link to where the label will be stored when generated. If this parameter is true then the parameters labelsPerPage and page will have no effect.
         * @default false
         * @example false
         */
        processOffline?: boolean;
      },
      shipmentInformation: EdiInstruction,
      params: RequestParams = {},
    ) =>
      this.request<EdiLabelResponse, ErrorResponse | void>({
        path: `/v3/edi/labels/zpl`,
        method: 'POST',
        query: query,
        body: shipmentInformation,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description **This API support the following use case** - Send in EDI Instruction and generate the refering PDF labels **PDF Viewer** - The PDF result set can be view using: https://www.motobit.com/util/base64-decoder-encoder.asp - Save the API data result into a file.txt - Import the file.txt - Decoded the file.txt to a binary file (save as file.pdf) - Open file.pdf
     *
     * @tags Book EDI Instruction & get Labels
     * @name CreateEdiLabelPdf
     * @summary Book EDI Instruction and generate the referring PDF labels
     * @request POST:/v3/edi/labels/pdf
     */
    createEdiLabelPdf: (
      query: {
        /**
         * The unique consumer (client) identifier 32 characters
         * @default "eac3dc8da4a73ab3001150b5c2d653d1"
         */
        apikey: string;
        /**
         * Whether to generate a qrCode image and add link to image in response (used with additional service code C2 and only for certain products)
         * @default false
         */
        generateQrcodeImage?: boolean;
        /**
         * The number of pixels for each module in the QRCode, must be a square number (1, 4, 9, 16, 25 etc)
         * @default 4
         * @example 9
         */
        qrCodeScale?: number;
        /**
         * The format of qrcode
         * @default "PNG"
         */
        qrCodeFormat?: 'PNG' | 'SVG';
        /**
         * The generated QR code will be sent to the email address given here (used with additional service code C2 and only for certain products)
         * @example "someone@example.com"
         */
        emailQRcodeTo?: string;
        /**
         * The generated QR code will be SMS to the smsNo given here (used with additional service code C2 and only for certain products)
         * @example "+46707219595"
         */
        smsQRcodeTo?: string;
        /**
         * The SMS and Email is written in the defined language [sv | da | no | fi | en]
         * @default "sv"
         * @example "sv"
         */
        locale?: string;
        /** Generate Error label for shipments that fail to book due to some problems like bad data */
        errorLabel?: boolean;
        /**
         * Tells the API to use a specific PDF page size.
         * @default "A4"
         */
        paperSize?: 'A4' | 'A5' | 'A6' | 'LETTER' | 'LABEL';
        /**
         * The value of this should be the number of degrees to rotate the label clockwise
         * @default "0"
         */
        rotate?: '0' | '90' | '180' | '270';
        /**
         * The PDF file will contain one or more label, and are optimized against the paper size. If you are requesting a PDF file and you would like it to contain all of the labels defined in your request
         * @default false
         */
        multiPDF?: boolean;
        /**
         * Defines the label type to produce, supported options;
         * * **standard** = 190*105mm
         * * **small** = 75*105mm
         * * **ste** = 190*105mm with special alignment of positioning
         *
         * Note; **small** is not available for all lables produced, then **standard** will be defaulted.
         * @default "standard"
         * @example "standard"
         */
        labelType?: string;
        /**
         * Add the PostNord information text, which is printed on its own label (only used by PostNord clients)
         * @default false
         * @example false
         */
        pnInfoText?: boolean;
        /**
         * Add Security declaration
         * @default false
         */
        printSecurityDeclaration?: boolean;
        /**
         * max number of labels in response.
         * @format int32
         * @min 1
         * @max 100
         * @default 100
         */
        labelsPerPage?: number;
        /**
         * which page of labels to view.
         * @format int32
         * @min 1
         * @default 1
         */
        page?: number;
        /**
         * Generate labels offline and return link to where the label will be stored when generated. If this parameter is true then the parameters labelsPerPage and page will have no effect.
         * @default false
         * @example false
         */
        processOffline?: boolean;
        /**
         * PostNord will store the Label, and the response will contain an URL to the label.
         * @default false
         */
        storeLabel?: boolean;
        /**
         * The pageHorizontalAlign defines how to align the labels horizontally. Valid values are LEFT, RIGHT, CENTER and JUSTIFY. The default value is JUSTIFY, which distributes extra horizontal whitespace evenly across the page.
         * @default "JUSTIFY"
         */
        pageHorizontalAlign?: string;
        /**
         * The pageVerticalAlign defines how to align the labels vertically. Valid values are TOP, BOTTOM, CENTER and JUSTIFY. The default value is JUSTIFY, which distributes extra vertical whitespace evenly across the page
         * @default "JUSTIFY"
         */
        pageVerticalAlign?: string;
      },
      shipmentInformation: EdiInstruction,
      params: RequestParams = {},
    ) =>
      this.request<EdiLabelResponse, ErrorResponse | void>({
        path: `/v3/edi/labels/pdf`,
        method: 'POST',
        query: query,
        body: shipmentInformation,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description **This API support the following use case** - Return ZPL labels for the requested printId - Return custom documents in ZPL
     *
     * @tags Book EDI Instruction & get Labels
     * @name GetLabelZpl
     * @summary Return ZPL labels/documents for the requested printId
     * @request POST:/v3/labels/ids/zpl
     */
    getLabelZpl: (
      query: {
        /**
         * The unique consumer (client) identifier 32 characters
         * @default "eac3dc8da4a73ab3001150b5c2d653d1"
         */
        apikey: string;
        /**
         * The ZPL files will contain one or more label, and are optimized against the paper size. If you are requesting a PDF file and you would like it to contain all of the labels defined in your request
         * @default false
         * @example false
         */
        multiZPL?: boolean;
        /**
         * Includes the CUT command (MMC) into the produced ZPL label.
         * @default false
         * @example false
         */
        cutter?: boolean;
        /**
         * The desired print density, in dots per millimeter. Valid values are 8dpmm (203dpi).
         * @default "8dpmm"
         */
        dpmm?: '8dpmm';
        /**
         * The PostNord label uses the fonts Arial (E:ARI000.TTF, E:ARIAL.TTF, E:T0003M_). A client can override the font, but there are no guarantees that it works from a layout prespective.
         * @default "E:ARI000.TTF, E:ARIAL.TTF, E:T0003M_"
         */
        fonts?: string;
        /**
         * The PostNord label has a lenght of 190mm. The client can define a lenght that is more then 190mm here.
         * @format int32
         * @min 190
         * @default 190
         */
        labelLength?: number;
        /**
         * The margin above the label
         * @default "0"
         */
        labelMarginTop?: string;
        /**
         * Define the documents to print based on the information PostNord has received.
         * * ALL = Print all documents
         * * customsInvoice = Only print customs invoice
         * * onlyDPC  = print only digital portocode
         * * labelsAndCustomsDeclarations  = print labels and customs declarations
         * * onlySecurityDeclaration = print only the security declaration
         * @default "ALL"
         */
        definePrintout?: string;
        /**
         * Add the PostNord information text, which is printed on its own label (only used by PostNord clients)
         * @default false
         * @example false
         */
        pnInfoText?: boolean;
        /**
         * Add Security declaration
         * @default false
         */
        printSecurityDeclaration?: boolean;
        /**
         * max number of labels in response.
         * @format int32
         * @min 1
         * @max 100
         * @default 100
         */
        labelsPerPage?: number;
        /**
         * which page of labels to view.
         * @format int32
         * @min 1
         * @default 1
         */
        page?: number;
        /**
         * Generate labels offline and return link to where the label will be stored when generated. If this parameter is true then the parameters labelsPerPage and page will have no effect.
         * @default false
         * @example false
         */
        processOffline?: boolean;
      },
      ids: Ids,
      params: RequestParams = {},
    ) =>
      this.request<LabelPrintout, ErrorResponse | void>({
        path: `/v3/labels/ids/zpl`,
        method: 'POST',
        query: query,
        body: ids,
        format: 'json',
        ...params,
      }),

    /**
     * @description **This API support the following use case** - Return PDF labels for the requested printId - Return customs documents in PDF
     *
     * @tags Book EDI Instruction & get Labels
     * @name GetLabelPdfs
     * @summary Return PDF labels/documents for the requested printId
     * @request POST:/v3/labels/ids/pdf
     */
    getLabelPdfs: (
      query: {
        /**
         * The unique consumer (client) identifier 32 characters
         * @default "eac3dc8da4a73ab3001150b5c2d653d1"
         */
        apikey: string;
        /**
         * Tells the API to use a specific PDF page size.
         * @default "A4"
         */
        paperSize?: 'A4' | 'A5' | 'A6' | 'LETTER' | 'LABEL';
        /**
         * The value of this should be the number of degrees to rotate the label clockwise
         * @default "0"
         */
        rotate?: '0' | '90' | '180' | '270';
        /**
         * The margin above the label
         * @default "0"
         */
        labelMarginTop?: string;
        /**
         * The PDF files will contain one or more label, and are optimized against the paper size. If you are requesting a PDF file and you would like it to contain all of the labels defined in your request
         * @default false
         * @example false
         */
        multiPDF?: boolean;
        /**
         * Defines the prinouts to be returned using the sent in information to PostNord.
         * * **onlyCustomsDeclarations**           = print only custom declarations for the item ID (CN22/CN23/customsInvoice)
         * * **onlyCustomsDeclarationsLoadList**   = print only custom declarations for the item ID (CN22/CN23/customsInvoice) include Load List
         * * **onlyLabels**                        = print only labels for the item ID and Dangerous Goods
         * * **labelsAndEmptyCN22**                = print labels and empty CN22
         * * **labelsAndEmptyCN23**                = print labels and empty CN23
         * * **labelsAndEmptyCustomsInvoice**      = print labels and empty Customs Invoice
         * * **onlyDPC**                           = print only digital portocode
         * * **labelsAndCustomsDeclarations**      = print labels and customs declarations
         * * **onlyFraktsedel**                    = print only Fraktsedel document
         * * **allExceptDangerousGoods**           = print all labels excetp Dangerous goods document
         * * **onlySecurityDeclaration** = print only the security declaration
         * @default "ALL"
         */
        definePrintout?: string;
        /**
         * Add the PostNord information text, which is printed on its own label (only used by PostNord clients)
         * @default false
         * @example false
         */
        pnInfoText?: boolean;
        /**
         * Add Security declaration
         * @default false
         */
        printSecurityDeclaration?: boolean;
        /**
         * max number of labels in response.
         * @format int32
         * @min 1
         * @max 100
         * @default 100
         */
        labelsPerPage?: number;
        /**
         * which page of labels to view.
         * @format int32
         * @min 1
         * @default 1
         */
        page?: number;
        /**
         * Generate labels offline and return link to where the label will be stored when generated. If this parameter is true then the parameters labelsPerPage and page will have no effect.
         * @default false
         * @example false
         */
        processOffline?: boolean;
        /**
         * PostNord will store the Label, and the response will contain an URL to the label.
         * @default false
         */
        storeLabel?: boolean;
        /**
         * The pageHorizontalAlign defines how to align the labels horizontally. Valid values are LEFT, RIGHT, CENTER and JUSTIFY. The default value is JUSTIFY, which distributes extra horizontal whitespace evenly across the page.
         * @default "JUSTIFY"
         */
        pageHorizontalAlign?: string;
        /**
         * The pageVerticalAlign defines how to align the labels vertically. Valid values are TOP, BOTTOM, CENTER and JUSTIFY. The default value is JUSTIFY, which distributes extra vertical whitespace evenly across the page
         * @default "JUSTIFY"
         */
        pageVerticalAlign?: string;
      },
      ids: Ids,
      params: RequestParams = {},
    ) =>
      this.request<LabelPrintout, ErrorResponse | void>({
        path: `/v3/labels/ids/pdf`,
        method: 'POST',
        query: query,
        body: ids,
        format: 'json',
        ...params,
      }),

    /**
     * @description **This API support the following use case** - The API will return the PDF/ZPL Print Label Options for the requested IDs
     *
     * @tags Print Label Options
     * @name LabelsPrintoptionsIdsCreate
     * @summary Return the PDF Print Label Options for the requested IDs
     * @request POST:/v3/labels/printoptions/ids
     */
    labelsPrintoptionsIdsCreate: (
      query: {
        /**
         * The unique consumer (client) identifier 32 characters
         * @default "eac3dc8da4a73ab3001150b5c2d653d1"
         */
        apikey: string;
      },
      ids: PrintoutLabelOptionsRequest,
      params: RequestParams = {},
    ) =>
      this.request<PrintoutLabelOptionsResponse, ErrorResponse | void>({
        path: `/v3/labels/printoptions/ids`,
        method: 'POST',
        query: query,
        body: ids,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description **This API support the following use case** - Create a **Return Drop Off, Varubrev Return or Rek Return** and generate using the referring PDF labels - This done by using an EDI for Return Drop Off, Varubrev return or Rek Return.
     *
     * @tags Book Digital Returns
     * @name PostDropoffReturnEdi
     * @summary Book return using EDI
     * @request POST:/v3/returns/edi
     */
    postDropoffReturnEdi: (
      query: {
        /**
         * The unique consumer (client) identifier 32 characters
         * @default "eac3dc8da4a73ab3001150b5c2d653d1"
         */
        apikey: string;
        /**
         * The number of pixels for each module in the QRCode, must be a square number (1, 4, 9, 16, 25 etc)
         * @default 4
         * @example 9
         */
        qrCodeScale?: number;
        /**
         * The format of qrcode
         * @default "PNG"
         */
        qrCodeFormat?: 'PNG' | 'SVG';
        /**
         * The generated QR code will be sent to the email address given in the consignor contact information
         * @default false
         */
        emailQRcode?: boolean;
        /**
         * The generated QR code will be SMS to the smsNo given in the consignor contact information
         * @default false
         */
        smsQRcode?: boolean;
        /**
         * The SMS and Email is written in the defined language [sv | da | no | fi | en]
         * @default "sv"
         * @example "sv"
         */
        locale?: string;
      },
      shipmentInformation: EdiInstruction,
      params: RequestParams = {},
    ) =>
      this.request<EdiLabelResponse, ErrorResponse | void>({
        path: `/v3/returns/edi`,
        method: 'POST',
        query: query,
        body: shipmentInformation,
        format: 'json',
        ...params,
      }),

    /**
     * @description **This API support the following use case** - Create a **Return Drop Off, Varubrev Return or Rek Return** and generate using the referring PDF labels - This done by using an EDI for Return Drop Off, Varubrev Return or Rek Return.
     *
     * @tags Book Digital Returns
     * @name PostDropoffReturnEdiZpl
     * @summary Book return using EDI and generate the referring ZPL labels
     * @request POST:/v3/returns/edi/labels/zpl
     */
    postDropoffReturnEdiZpl: (
      query: {
        /**
         * The unique consumer (client) identifier 32 characters
         * @default "eac3dc8da4a73ab3001150b5c2d653d1"
         */
        apikey: string;
        /**
         * The number of pixels for each module in the QRCode, must be a square number (1, 4, 9, 16, 25 etc)
         * @default 4
         * @example 9
         */
        qrCodeScale?: number;
        /**
         * The format of qrcode
         * @default "PNG"
         */
        qrCodeFormat?: 'PNG' | 'SVG';
        /**
         * The ZPL files will contain one or more label, and are optimized against the paper size. If you are requesting a PDF file and you would like it to contain all of the labels defined in your request
         * @default false
         * @example false
         */
        multiZPL?: boolean;
        /**
         * Includes the CUT command (MMC) into the produced ZPL label.
         * @default false
         * @example false
         */
        cutter?: boolean;
        /**
         * The desired print density, in dots per millimeter. Valid values are 8dpmm (203dpi).
         * @default "8dpmm"
         */
        dpmm?: '8dpmm';
        /**
         * The PostNord label uses the fonts Arial (E:ARI000.TTF, E:ARIAL.TTF, E:T0003M_). A client can override the font, but there are no guarantees that it works from a layout prespective.
         * @default "E:ARI000.TTF, E:ARIAL.TTF, E:T0003M_"
         */
        fonts?: string;
        /**
         * Defines the label type to produce, supported options;
         * * **standard** = 190*105mm
         * * **small** = 75*105mm
         *
         * Note; **small** is not available for all lables produced, then **standard** will be defaulted.
         * @default "standard"
         * @example "standard"
         */
        labelType?: string;
        /**
         * The PostNord label has a lenght of 190mm. The client can define a lenght that is more then 190mm here.
         * @format int32
         * @min 190
         * @default 190
         */
        labelLength?: number;
        /**
         * Add the PostNord information text, which is printed on its own label (only used by PostNord clients)
         * @default false
         * @example false
         */
        pnInfoText?: boolean;
        /**
         * max number of labels in response.
         * @format int32
         * @min 1
         * @max 100
         * @default 100
         */
        labelsPerPage?: number;
        /**
         * which page of labels to view.
         * @format int32
         * @min 1
         * @default 1
         */
        page?: number;
        /**
         * Generate labels offline and return link to where the label will be stored when generated. If this parameter is true then the parameters labelsPerPage and page will have no effect.
         * @default false
         * @example false
         */
        processOffline?: boolean;
        /**
         * The generated QR code will be sent to the email address given in the consignor contact information
         * @default false
         */
        emailQRcode?: boolean;
        /**
         * The generated QR code will be SMS to the smsNo given in the consignor contact information
         * @default false
         */
        smsQRcode?: boolean;
        /**
         * The SMS and Email is written in the defined language [sv | da | no | fi | en]
         * @default "sv"
         * @example "sv"
         */
        locale?: string;
        /**
         * PostNord will store the Label, and the response will contain an URL to the label.
         * @default false
         */
        storeLabel?: boolean;
        /**
         * Whether to add C2 addon and QRCODE to the return
         * @default true
         * @example false
         */
        addQRCODE?: boolean;
      },
      shipmentInformation: EdiInstruction,
      params: RequestParams = {},
    ) =>
      this.request<EdiLabelResponse, ErrorResponse | void>({
        path: `/v3/returns/edi/labels/zpl`,
        method: 'POST',
        query: query,
        body: shipmentInformation,
        format: 'json',
        ...params,
      }),

    /**
     * @description **This API support the following use case** - Create a **Return Drop Off, Varubrev Return or Rek Return** and generate using the referring PDF labels - This done by using an EDI for Return Drop Off, Varubrev Return or Rek Return.
     *
     * @tags Book Digital Returns
     * @name PostDropoffReturnEdiPdf
     * @summary Book return using EDI and generate the referring PDF labels
     * @request POST:/v3/returns/edi/labels/pdf
     */
    postDropoffReturnEdiPdf: (
      query: {
        /**
         * The unique consumer (client) identifier 32 characters
         * @default "eac3dc8da4a73ab3001150b5c2d653d1"
         */
        apikey: string;
        /**
         * The number of pixels for each module in the QRCode, must be a square number (1, 4, 9, 16, 25 etc)
         * @default 4
         * @example 9
         */
        qrCodeScale?: number;
        /**
         * The format of qrcode
         * @default "PNG"
         */
        qrCodeFormat?: 'PNG' | 'SVG';
        /**
         * Tells the API to use a specific PDF page size.
         * @default "A4"
         */
        paperSize?: 'A4' | 'A5' | 'A6' | 'LETTER' | 'LABEL';
        /**
         * The value of this should be the number of degrees to rotate the label clockwise
         * @default "0"
         */
        rotate?: '0' | '90' | '180' | '270';
        /**
         * The PDF files will contain one or more label, and are optimized against the paper size. If you are requesting a PDF file and you would like it to contain all of the labels defined in your request
         * @default false
         * @example false
         */
        multiPDF?: boolean;
        /**
         * Defines the label type to produce, supported options;
         * * **standard** = 190*105mm
         * * **small** = 75*105mm
         *
         * Note; **small** is not available for all lables produced, then **standard** will be defaulted.
         * @default "standard"
         * @example "standard"
         */
        labelType?: string;
        /**
         * Add the PostNord information text, which is printed on its own label (only used by PostNord clients)
         * @default false
         * @example false
         */
        pnInfoText?: boolean;
        /**
         * max number of labels in response.
         * @format int32
         * @min 1
         * @max 100
         * @default 100
         */
        labelsPerPage?: number;
        /**
         * which page of labels to view.
         * @format int32
         * @min 1
         * @default 1
         */
        page?: number;
        /**
         * Generate labels offline and return link to where the label will be stored when generated. If this parameter is true then the parameters labelsPerPage and page will have no effect.
         * @default false
         * @example false
         */
        processOffline?: boolean;
        /**
         * The generated QR code will be sent to the email address given in the consignor contact information
         * @default false
         */
        emailQRcode?: boolean;
        /**
         * The generated QR code will be SMS to the smsNo given in the consignor contact information
         * @default false
         */
        smsQRcode?: boolean;
        /**
         * The SMS and Email is written in the defined language [sv | da | no | fi | en]
         * @default "sv"
         * @example "sv"
         */
        locale?: string;
        /**
         * PostNord will store the Label, and the response will contain an URL to the label.
         * @default false
         */
        storeLabel?: boolean;
        /**
         * The pageHorizontalAlign defines how to align the labels horizontally. Valid values are LEFT, RIGHT, CENTER and JUSTIFY. The default value is JUSTIFY, which distributes extra horizontal whitespace evenly across the page.
         * @default "JUSTIFY"
         */
        pageHorizontalAlign?: string;
        /**
         * The pageVerticalAlign defines how to align the labels vertically. Valid values are TOP, BOTTOM, CENTER and JUSTIFY. The default value is JUSTIFY, which distributes extra vertical whitespace evenly across the page
         * @default "JUSTIFY"
         */
        pageVerticalAlign?: string;
        /**
         * Whether to add C2 addon and QRCODE to the return
         * @default true
         * @example false
         */
        addQRCODE?: boolean;
      },
      shipmentInformation: EdiInstruction,
      params: RequestParams = {},
    ) =>
      this.request<EdiLabelResponse, ErrorResponse | void>({
        path: `/v3/returns/edi/labels/pdf`,
        method: 'POST',
        query: query,
        body: shipmentInformation,
        format: 'json',
        ...params,
      }),

    /**
     * @description **This API support the following use case** - Returns the health of the API
     *
     * @tags Book EDI Instruction & get Labels
     * @name GetHealth
     * @summary API health check request
     * @request GET:/v3/edi/labels/manage/health
     */
    getHealth: (
      query: {
        /**
         * The unique consumer (client) identifier 32 characters
         * @default "eac3dc8da4a73ab3001150b5c2d653d1"
         */
        apikey: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<Health, ErrorResponse | void>({
        path: `/v3/edi/labels/manage/health`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params,
      }),

    /**
     * @description The EDI for the item ID must have been sent in earlier to PostNord.
     *
     * @tags Book Customs Information
     * @name AddCustomsDeclaration
     * @summary Book customs declaration: CN22, CN23, Proforma or Commercial Customs Invoice
     * @request POST:/v3/customs/declaration
     */
    addCustomsDeclaration: (
      query: {
        /**
         * The unique consumer (client) identifier 32 characters
         * @default "eac3dc8da4a73ab3001150b5c2d653d1"
         */
        apikey: string;
      },
      content: CustomsInvoice,
      params: RequestParams = {},
    ) =>
      this.request<BookingResponseCN, ErrorResponse | void>({
        path: `/v3/customs/declaration`,
        method: 'POST',
        query: query,
        body: content,
        format: 'json',
        ...params,
      }),

    /**
     * @description The EDI for the item ID must have been sent in earlier to PostNord.
     *
     * @tags Book Customs Information
     * @name AddCustomsConsolidation
     * @summary Book customs declaration: multiple Commercial Customs Invoice in one transport or shipment
     * @request POST:/v3/customs/consolidation
     */
    addCustomsConsolidation: (
      query: {
        /**
         * The unique consumer (client) identifier 32 characters
         * @default "eac3dc8da4a73ab3001150b5c2d653d1"
         */
        apikey: string;
      },
      content: Consolidation,
      params: RequestParams = {},
    ) =>
      this.request<BookingResponseCN, ErrorResponse | void>({
        path: `/v3/customs/consolidation`,
        method: 'POST',
        query: query,
        body: content,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),

    /**
     * @description The EDI for the item ID must have been sent in earlier to PostNord.
     *
     * @tags Book Customs Information
     * @name AddCustomsDeclarationAndGetPdfLabel
     * @summary Book customs declaration: CN22, CN23, Proforma or Commercial Customs Invoice and retrieve the pdf label
     * @request POST:/v3/customs/declaration/pdf
     */
    addCustomsDeclarationAndGetPdfLabel: (
      query: {
        /**
         * The unique consumer (client) identifier 32 characters
         * @default "eac3dc8da4a73ab3001150b5c2d653d1"
         */
        apikey: string;
        /**
         * Tells the API to use a specific PDF page size.
         * @default "A4"
         */
        paperSize?: 'A4' | 'A5' | 'A6' | 'LETTER' | 'LABEL';
        /**
         * The value of this should be the number of degrees to rotate the label clockwise
         * @default "0"
         */
        rotate?: '0' | '90' | '180' | '270';
        /**
         * The PDF files will contain one or more label, and are optimized against the paper size. If you are requesting a PDF file and you would like it to contain all of the labels defined in your request
         * @default false
         * @example false
         */
        multiPDF?: boolean;
        /**
         * max number of labels in response.
         * @format int32
         * @min 1
         * @max 100
         * @default 100
         */
        labelsPerPage?: number;
        /**
         * which page of labels to view.
         * @format int32
         * @min 1
         * @default 1
         */
        page?: number;
        /**
         * Generate labels offline and return link to where the label will be stored when generated. If this parameter is true then the parameters labelsPerPage and page will have no effect.
         * @default false
         * @example false
         */
        processOffline?: boolean;
        /**
         * PostNord will store the Label, and the response will contain an URL to the label.
         * @default false
         */
        storeLabel?: boolean;
        /**
         * The pageHorizontalAlign defines how to align the labels horizontally. Valid values are LEFT, RIGHT, CENTER and JUSTIFY. The default value is JUSTIFY, which distributes extra horizontal whitespace evenly across the page.
         * @default "JUSTIFY"
         */
        pageHorizontalAlign?: string;
        /**
         * The pageVerticalAlign defines how to align the labels vertically. Valid values are TOP, BOTTOM, CENTER and JUSTIFY. The default value is JUSTIFY, which distributes extra vertical whitespace evenly across the page
         * @default "JUSTIFY"
         */
        pageVerticalAlign?: string;
      },
      content: CustomsInvoice,
      params: RequestParams = {},
    ) =>
      this.request<AddCustomsDeclarationPdfResponse, ErrorResponse | void>({
        path: `/v3/customs/declaration/pdf`,
        method: 'POST',
        query: query,
        body: content,
        format: 'json',
        ...params,
      }),

    /**
     * @description - Provides PostNord with the Dangerous Goods Information as a complement to the EDI. - The EDI for the item ID must have been sent in earlier to PostNord.
     *
     * @tags Book Dangerous Goods Information
     * @name AddDangerousGoods
     * @summary Book Dangerous Goods declaration
     * @request POST:/v3/dangerousgoods
     */
    addDangerousGoods: (
      query: {
        /**
         * The unique consumer (client) identifier 32 characters
         * @default "eac3dc8da4a73ab3001150b5c2d653d1"
         */
        apikey: string;
      },
      content: DangerousGoods,
      params: RequestParams = {},
    ) =>
      this.request<BookingResponseCN, ErrorResponse | void>({
        path: `/v3/dangerousgoods`,
        method: 'POST',
        query: query,
        body: content,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),
  };
  v4 = {
    /**
     * @description * **Earliest Pickup Date** - The earliest date and time the goods is ready to be picked up at the sender. * **Next Pickup Stop Date Time** - The PostNord latest date time when the goods will be picked up at the sender. * **Next Booking Stop Date Time** - Shows the latest earliest pickup date to use, when PostNord guarantees the returned Next Pickup Stop Date Time.
     *
     * @tags Book Pickups
     * @name PostPickupDateV4
     * @summary Fetch Next Booking Stop DateTime and Next Pickup Stop DateTime for the Earliest Pickup Date.
     * @request POST:/v4/sac/pickup/stopdate
     */
    postPickupDateV4: (
      query: {
        /**
         * The unique consumer (client) identifier 32 characters
         * @default "eac3dc8da4a73ab3001150b5c2d653d1"
         */
        apikey: string;
        /**
         * The number of stop date response you needed
         * @default 1
         */
        maxHits?: number;
      },
      body: PickupStopDateV4,
      params: RequestParams = {},
    ) =>
      this.request<PickupStopDateResponseV4, ErrorResponse | void>({
        path: `/v4/sac/pickup/stopdate`,
        method: 'POST',
        query: query,
        body: body,
        type: ContentType.Json,
        format: 'json',
        ...params,
      }),
  };
}
