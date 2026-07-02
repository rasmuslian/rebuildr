export interface ICreditSafeSignatoryPosition {
  roleCode: number;
  roleName: string;
}

export interface ICreditSafeSignatoryPerson {
  /**
   * Name of the signatory
   */
  name: string;
  /**
   * Function(s) of the signatory (contains array of roleCode and roleName)
   */
  positions: ICreditSafeSignatoryPosition[];
  /**
   * Person number of signatory
   */
  personalNumber: string;
}

export interface ICreditSafeSignatoryReport {
  /**
   * The company’s organisation number as sent in the request (only digits
allowed)
   */
  companyId: string;
  /**
   * Specifies if all combinations could be identified.
Available values: complete, partial, none
   */
  coverage: 'complete' | 'partial' | 'none';
  /**
   * Persons that are allowed to sign for the company only in administrative
matters
   */
  adminSign: ICreditSafeSignatoryPerson[][];
  /**
   * Possible signing combinations. The response is limited to max 5.000
combinations
   */
  combinations: ICreditSafeSignatoryPerson[][];
}

export interface ICreditSafeSignatoryMetaData {
  /**
   * A unique identifier for the Creditsafe API log. Please refer to this ID
   * when contacting Creditsafe support, as it allows them to access the
   * full context of your request.
   */
  apiLogId: number;
  /**
   * The exact time when the request was processed by Creditsafe.
   */
  timeStamp: string;
  /**
   * Indicates which service delivered the report.
   */
  resource: string;
  /**
   * Specifies the HTTP method used for the request.
   */
  method: string;
  /**
   * The complete URL of the request sent to Creditsafe.
   */
  requestUrl: string;
}

export interface IGetSignatoryResponse {
  metaData?: ICreditSafeSignatoryMetaData;
  report: ICreditSafeSignatoryReport[];
}

export interface ICreditSafeCompanyStatus {
  date: string;
  status: string;
}

export interface ICreditSafeCompanyType {
  code: string;
  description: string;
  legalCode: number;
}

export interface ICreditSafeIndustryCode {
  code: string;
  description: string;
}

export interface ICreditSafeIndustry {
  mainIndustry: ICreditSafeIndustryCode;
  secondaryActivities: ICreditSafeIndustryCode[];
}

export interface ICreditSafeTaxRegistration {
  registered: boolean;
  startDate?: string;
  vatNumber?: string;
}

export interface ICreditSafeTaxInformation {
  fTax: ICreditSafeTaxRegistration;
  vat: ICreditSafeTaxRegistration;
  employmentTax: ICreditSafeTaxRegistration;
}

export interface ICreditSafeAddress {
  date: string;
  fullAddress: string;
  fullAddressWithoutCareOf: string;
  careOf: string | null;
  zipCode: string;
  town: string;
  municipality: string;
  county: string;
}

export interface ICreditSafeContactInformation {
  registeredAddress: ICreditSafeAddress;
}

/**
 * A Basic Block contains fundamental information. For individuals, this
 * includes name, address, status, marital status, company engagements, and
 * trustee information. For companies, it includes name, address, status,
 * type of company, registration date, and information on f-tax, VAT, and
 * employer's contribution. The information in the Basic Block can be used
 * to automatically populate names and addresses. Calls to a Basic Block
 * never result in a letter of disclosure being sent, regardless of whether
 * it is for an individual or a company.
 *
 * Only the basicInformation section is documented in the GetData manual.
 * A block can include further sections (financial, property, payment
 * remarks, bankruptcy, etc.) defined per the customer's Block template -
 * those aren't typed here and fall through the Record<string, unknown>.
 */
export interface ICreditSafeBasicInformation {
  organizationNumber: string;
  safeNumber: string;
  cfarNumber: number;
  companyName: string;
  previousCompanyName?: string;
  formedDate: string;
  incorporationDate: string;
  companyStatus: ICreditSafeCompanyStatus;
  companyType: ICreditSafeCompanyType;
  industry: ICreditSafeIndustry;
  taxInformation: ICreditSafeTaxInformation;
  contactInformation: ICreditSafeContactInformation;
}

export interface ICreditSafeMetaData {
  /**
   * A unique identifier for the Creditsafe API log. Please refer to this ID
   * when contacting Creditsafe support, as it allows them to access the
   * full context of your request. The apiLogId can also be used to fetch a
   * previous report from our report archive using the ReportFetcher
   * service.
   */
  apiLogId: number;
  /**
   * The exact time when the request was processed by Creditsafe.
   */
  timeStamp: string;
  /**
   * Indicates which service delivered the report.
   */
  resource: string;
  /**
   * Specifies the HTTP method used for the request.
   */
  method: string;
  /**
   * The complete URL of the request sent to Creditsafe.
   */
  requestUrl: string;
  /**
   * A flag indicating whether a Letter of Disclosure (LOD) was generated as
   * a result of the request.
   */
  lodCreated: boolean;
}

/**
 * Rejection codes are returned when the requested consumer, sole trader or
 * company is not active - e.g. deceased, blocked, protected, emigrated
 * (consumers/sole traders, returned with HTTP 200 OK) or
 * inactive/bankrupt/deregistered (companies, returned with HTTP 403
 * Forbidden).
 */
export interface ICreditSafeRejection {
  code: string;
  text: string;
  detail?: string;
}

export interface IGetDataResponse {
  metaData?: ICreditSafeMetaData;
  /**
   * A Credit Block includes all the parameters in the Basic Block, plus
   * additional information such as income/financial statement information,
   * property information, payment remarks, debt balance, and bankruptcy
   * information.
   *
   * Not present when the requested consumer or company was rejected - see
   * `error`.
   */
  report?: Partial<ICreditSafeBasicInformation> & Record<string, unknown>;
  /**
   * Present instead of `report` when the requested consumer or company is
   * rejected.
   */
  error?: ICreditSafeRejection;
}
