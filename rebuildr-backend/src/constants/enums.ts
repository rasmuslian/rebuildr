import { registerEnumType } from '@nestjs/graphql';

export enum QuantityUnitEnum {
  AMOUNT = 'AMOUNT',
  BAGS = 'BAGS',
  ROLLS = 'ROLLS',
  M = 'M',
  M2 = 'M2',
  M3 = 'M3',
  LITERS = 'LITERS',
  CANS = 'CANS',
  PLATES = 'PLATES',
  PACKAGES = 'PACKAGES',
  BOARDS = 'BOARDS',
  KG = 'KG',
}
export const quantityUnitEnumName = 'quantity_unit_enum';
registerEnumType(QuantityUnitEnum, { name: 'QuantityUnitEnum' });

export enum MeasurementTypeEnum {
  THICKNESS = 'THICKNESS',
  HEIGHT = 'HEIGHT',
  WIDTH = 'WIDTH',
  LENGTH = 'LENGTH',
  DIAMETER = 'DIAMETER',
  WEIGHT = 'WEIGHT',
}
export const measurementTypeEnumName = 'measurement_type_enum';
registerEnumType(MeasurementTypeEnum, { name: 'MeasurementTypeEnum' });
