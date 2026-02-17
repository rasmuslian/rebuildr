export interface IGetAllResousesResponse {
  Location: Location;
  Culture: Culture;
  Publisher: Publisher;
  Version: Version;
  PublishedDate: Date;
  Categories: Category[];
  Resources: Resource[];
}

export interface Category {
  Id: number;
  Culture: Culture;
  CategorySystem: CategorySystem;
  Title: string;
  Children?: Category[];
}

export enum CategorySystem {
  Bk04 = 'BK04',
  Boverket = 'Boverket',
}

export enum Culture {
  SvSE = 'sv-se',
}

export enum Location {
  SE = 'SE',
}

export enum Publisher {
  BoverketSweden = 'Boverket, Sweden',
}

export interface Resource {
  ResourceId: number;
  SourceVersion: Version;
  ProductSystemId: number;
  ProductSystemResourceId: string;
  Location: Location;
  Publisher: Publisher;
  Version: Version;
  Copyright: boolean;
  TimeStamp: Date;
  Name: string;
  Names: Names;
  StdName?: string;
  StdDescription?: string;
  StdCalc: StdCalc;
  UseAdviceForDataSet?: string;
  TechnologicalApplicability?: string;
  GeneralComment?: string;
  Synonyms?: string;
  TechnologyDescriptionAndIncludedProcesses?: string;
  GeographicalRepresentativenessDescription: GeographicalRepresentativenessDescription;
  TimeRepresentativenessDescription?: string;
  UpdatedTime: Date;
  InventoryUnit: InventoryUnit;
  CalculatedBiogenicCarbon?: number;
  ConservativeDataConversionFactor: number;
  WasteFactor: number;
  RefServiceLifeNormal: RefServiceLifeNormal;
  RefServiceLifeNormalComment?: string;
  ComparativeProperty?: string;
  A4ValueBackground?: string;
  AnnualSupplyOrProductionVolume?: string;
  Conversions?: Conversion[];
  DataItems: DataItem[];
  Categories: ResourceCategory[];
  TransportItems?: TransportItem[];
}

export interface ResourceCategory {
  ClassificationType: CategorySystem;
  Code: string;
  Text: string;
}

export interface Conversion {
  Field: Field;
  Unit: Unit;
  Value: number;
}

export enum Field {
  Area = 'Area',
  Energy = 'Energy',
  Volume = 'Volume',
}

export enum Unit {
  KgM = 'kg/m³',
  MJKg = 'MJ/kg',
  MJLiter = 'MJ/liter',
  UnitKgM = 'kg/m²',
}

export interface DataItem {
  PropertyId: number;
  PropertyName: PropertyName;
  PropertyCode: PropertyCode;
  PropertyTypeId: number;
  PropertyUnitCode: PropertyUnitCode;
  DataValueItems: DataValueItem[];
}

export interface DataValueItem {
  DataModuleCode: DataModuleCode;
  Value: number;
}

export enum DataModuleCode {
  A1A3Conservative = 'A1-A3 Conservative',
  A1A3Typical = 'A1-A3 Typical',
  A4 = 'A4',
  A51 = 'A5.1',
}

export enum PropertyCode {
  GwpGhgAr4 = 'GWP-GHG AR4',
}

export enum PropertyName {
  GlobalWarmingPotential = 'Global Warming potential',
}

export enum PropertyUnitCode {
  KgCO2EqKWh = 'kg CO2 eq./kWh',
  KgCO2EqKg = 'kg CO2 eq./kg',
  KgCO2EqM = 'kg CO2 eq./m²',
  KgCO2EqMJ = 'kg CO2 eq./MJ',
}

export enum GeographicalRepresentativenessDescription {
  SwedishAverage = 'Swedish average',
}

export enum InventoryUnit {
  KWh = 'kWh',
  Kg = 'kg',
  M = 'm²',
  Mj = 'MJ',
}

export interface Names {
  EN: string;
  SV: string;
}

export enum RefServiceLifeNormal {
  GenerellUppgiftSaknas = 'Generell uppgift saknas',
  InteRelevant = 'Inte relevant',
  RefServiceLifeNormal40År = '>40 år',
  RefServiceLifeNormal50År = '50 år',
  The20År = '20 år',
  The30År = '30 år',
  The40År = '<40 år',
  The50År = '>50 år',
}

export enum Version {
  The0207000 = '02.07.000',
}

export enum StdCalc {
  En15804A1 = 'EN 15804:A1',
}

export interface TransportItem {
  NameId: number;
  Name: Name;
  GenericDistance: number;
  TransportTypeId: number;
  TransportTypeName: TransportTypeName;
  EnergyUseId: number;
  EnergyUseName: EnergyUseName;
  EnergyUseValue: number;
  FuelTypeId: number;
  FuelTypeName: FuelTypeName;
  FuelTypeResourceId: number;
}

export enum EnergyUseName {
  BåtTankerContainerfartyg = 'Båt, tanker-/containerfartyg',
  LastbilLandsväg = 'Lastbil, landsväg',
  LastbilNärdistribution = 'Lastbil, närdistribution',
  LastbilRegiontransport = 'Lastbil, regiontransport',
}

export enum FuelTypeName {
  DieselMK1Reduktionsplikt2024 = 'Diesel MK1, reduktionsplikt (2024)',
  Eldningsolja1 = 'Eldningsolja 1',
}

export enum Name {
  FabrikTillByggarbetsplats = 'Fabrik till byggarbetsplats',
  FabrikTillÅterförsäljareLager = 'Fabrik till återförsäljare/lager',
  FrånGränsLagerTillÅterförsäljareEllerByggarbetsplats = 'Från gräns/lager till återförsäljare eller byggarbetsplats',
  ImportTillGränsLager = 'Import till gräns/lager',
  Närdistribution = 'Närdistribution',
}

export enum TransportTypeName {
  Båt = 'Båt',
  Lastbil = 'Lastbil',
}
