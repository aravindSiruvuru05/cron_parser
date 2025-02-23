import {
  CRON_FIELD_RANGES,
  CronValidationError,
  getRangeValues,
  getSteppedValues,
  ICronFields,
} from "./utils";

// Determine the type of the cron expression (LIST, STEP, RANGE, or SINGLE)
const getExpressionType = (value: string): string => {
  if (value.includes(",")) return "LIST"; // If value contains commas, it's a LIST
  if (value.includes("/")) return "STEP"; // If value contains a slash, it's a STEP expression
  if (value.includes("-")) return "RANGE"; // If value contains a dash, it's a RANGE expression
  if (value.includes("*")) return "WILDCARD"; // If value contains a dash, it's a RANGE expression
  return "SINGLE"; // Default is SINGLE if none of the above
};

// Validate the expression for a particular cron field
// Input:
//   - fieldName: A string representing the cron field (e.g., "minute", "hour", "dayOfMonth", "month", "dayOfWeek").
//   - fieldValue: A string representing the cron expression for the respective field (e.g., "5", "1-5", "*/2", "1,3,5").
// Output:
//   - Returns an array of numbers based on the expression of input cron field (e.g., [5], [1, 2, 3], [1, 3, 5] or [0, 2, 4, 6, 8]).
export const validateExpression = (
  fieldName: keyof Omit<ICronFields, "command">,
  fieldValue: string
): number[] => {
  switch (getExpressionType(fieldValue)) {
    case "WILDCARD": {
      const range = CRON_FIELD_RANGES[fieldName];
      if (!range) {
        throw new CronValidationError(
          `No range defined for field "${fieldName}".`
        );
      }
      fieldValue = fieldValue.replace(
        "*",
        `${range.minValue}-${range.maxValue}`
      );
      return validateExpression(fieldName, fieldValue);
    }
    case "LIST": {
      // Process comma-separated values (e.g., "1,3,5")
      const list = fieldValue.split(",");
      const results: number[] = [];
      for (const part of list) {
        results.push(...validateExpression(fieldName, part.trim()));
      }
      return results;
    }
    case "STEP": {
      // Process step values (e.g., "0-10/2" or "3/4")
      const [base, stepStr] = fieldValue.split("/");
      if (!stepStr) {
        throw new CronValidationError(
          `Missing step value in expression "${fieldValue}" for field "${fieldName}".`
        );
      }
      const step = Number(stepStr);
      if (isNaN(step) || step <= 0) {
        throw new CronValidationError(
          `Invalid step value "${stepStr}" in expression "${fieldValue}" for field "${fieldName}".`
        );
      }
      let baseExpression = base;
      if (!base.includes("-") && !isNaN(Number(base))) {
        // If no explicit range is provided, assume the full range from provided value as min.
        const range = CRON_FIELD_RANGES[fieldName];
        baseExpression = `${base}-${range.maxValue}`;
      }
      const rangeValues = validateExpression(fieldName, baseExpression);
      return getSteppedValues(rangeValues, step);
    }
    case "RANGE": {
      // Process range values (e.g., "1-5")
      const parts = fieldValue.split("-").map(Number);
      if (parts.length !== 2 || parts.some(isNaN)) {
        throw new CronValidationError(
          `Invalid range "${fieldValue}" for field "${fieldName}". Expected format "start-end" with numeric values.`
        );
      }
      const [start, end] = parts;
      if (end < start) {
        throw new CronValidationError(
          `Invalid range for field "${fieldName}": start value (${start}) is greater than end value (${end}).`
        );
      }
      return getRangeValues(fieldName, start, end); // Return the range values
    }
    case "SINGLE":
    default: {
      // Process a single numeric value (e.g., "5")
      const num = Number(fieldValue);
      if (isNaN(num)) {
        throw new CronValidationError(
          `Invalid numeric value "${fieldValue}" for field "${fieldName}".`
        );
      }
      return [num];
    }
  }
};
type IExpressions = Omit<ICronFields, "command">;
// Parse the cron expression string into individual fields
export const parseCron = (expression: string[]): IExpressions => {
  if (expression.length !== 5) {
    throw new CronValidationError(
      `Cron expression must contain exactly 5 fields, but received ${expression.length}.`
    );
  }
  const expressions: Omit<ICronFields, "command"> = {
    minute: expression[0],
    hour: expression[1],
    dayOfMonth: expression[2],
    month: expression[3],
    dayOfWeek: expression[4],
  };
  const result = {} as IExpressions;

  for (const key in expressions) {
    const typedKey = key as unknown as keyof Omit<ICronFields, "command">;
    const validated = validateExpression(typedKey, expressions[typedKey]).sort(
      (a, b) => a - b
    );
    result[typedKey] = Array.from(new Set(validated)).toString();
  }

  return result;
};
