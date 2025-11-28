import { Decimal } from "@prisma/client/runtime/library";

export const decimalToNumber = (decimal: Decimal | number): number => {
  if (typeof decimal === "number") {
    return decimal;
  }
  return decimal.toNumber();
};

export const convertDecimalFields = <T extends Record<string, any>>(
  obj: T,
  fields: (keyof T)[],
): T => {
  const result = { ...obj };

  fields.forEach((field) => {
    if (result[field] !== null && result[field] !== undefined) {
      result[field] = decimalToNumber(result[field] as any) as any;
    }
  });

  return result;
};

export const convertDecimalFieldsArray = <T extends Record<string, any>>(
  array: T[],
  fields: (keyof T)[],
): T[] => {
  return array.map((item) => convertDecimalFields(item, fields));
};
