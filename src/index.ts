import {
  CRON_FIELD_RANGES,
  CronValidationError,
  getRangeValues,
  getSteppedValues,
  ICronFields,
} from "./utils";

const validateExpression = (
  fieldName: keyof Omit<ICronFields, "command">,
  fieldValue: string
): number[] => {
  // Replace wildcard "*" with the full range.
  if (fieldValue.includes("*")) {
    const range = CRON_FIELD_RANGES[fieldName];
    if (!range) {
      throw new CronValidationError(
        `No range defined for field "${fieldName}".`
      );
    }
    fieldValue = fieldValue.replace("*", `${range.minValue}-${range.maxValue}`);
  }

  // Determine the type of the expression.
  const getExpressionType = (value: string): string => {
    if (value.includes(",")) return "LIST";
    if (value.includes("/")) return "STEP";
    if (value.includes("-")) return "RANGE";
    return "SINGLE";
  };

  switch (getExpressionType(fieldValue)) {
    case "LIST": {
      // Process comma-separated values (e.g., "1,3,5").
      const list = fieldValue.split(",");
      const results: number[] = [];
      for (const part of list) {
        try {
          results.push(...validateExpression(fieldName, part.trim()));
        } catch (error: any) {
          throw new CronValidationError(
            `Error in list expression for field "${fieldName}": ${error.message}`
          );
        }
      }
      return results;
    }
    case "STEP": {
      // Process step values (e.g., "0-10/2" or "3/4").
      const [base, stepStr] = fieldValue.split("/");
      if (!stepStr) {
        throw new CronValidationError(
          `Missing step value in expression "${fieldValue}" for field "${fieldName}".`
        );
      }
      const step = parseInt(stepStr, 10);
      if (isNaN(step) || step <= 0) {
        throw new CronValidationError(
          `Invalid step value "${stepStr}" in expression "${fieldValue}" for field "${fieldName}".`
        );
      }
      let baseExpression = base;
      if (!base.includes("-")) {
        // If no explicit range is provided, assume the full range.
        const range = CRON_FIELD_RANGES[fieldName];
        baseExpression = `${range.minValue}-${range.maxValue}`;
      }
      const rangeValues = validateExpression(fieldName, baseExpression);
      return getSteppedValues(rangeValues, step);
    }
    case "RANGE": {
      // Process range values (e.g., "1-5").
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
      return getRangeValues(fieldName, start, end);
    }
    case "SINGLE":
    default: {
      // Process a single numeric value (e.g., "5").
      const num = parseInt(fieldValue, 10);
      if (isNaN(num)) {
        throw new CronValidationError(
          `Invalid numeric value "${fieldValue}" for field "${fieldName}".`
        );
      }
      return [num];
    }
  }
};

const parseCron = (expression: string[]): ICronFields => {
  if (expression.length !== 5) {
    throw new CronValidationError(
      `Cron expression must contain exactly 5 fields, but received ${expression.length}.`
    );
  }
  const [minute, hour, dayOfMonth, month, dayOfWeek] = expression;
  const result: Partial<ICronFields> = {};

  try {
    result.minute = validateExpression("minute", minute).toString();
  } catch (error: any) {
    throw new CronValidationError(
      `Error parsing minute field: ${error.message}`
    );
  }
  try {
    result.hour = validateExpression("hour", hour).toString();
  } catch (error: any) {
    throw new CronValidationError(`Error parsing hour field: ${error.message}`);
  }
  try {
    result.dayOfMonth = validateExpression("dayOfMonth", dayOfMonth).toString();
  } catch (error: any) {
    throw new CronValidationError(
      `Error parsing dayOfMonth field: ${error.message}`
    );
  }
  try {
    result.month = validateExpression("month", month).toString();
  } catch (error: any) {
    throw new CronValidationError(
      `Error parsing month field: ${error.message}`
    );
  }
  try {
    result.dayOfWeek = validateExpression("dayOfWeek", dayOfWeek).toString();
  } catch (error: any) {
    throw new CronValidationError(
      `Error parsing dayOfWeek field: ${error.message}`
    );
  }
  return result as ICronFields;
};

const runCronParser = (): void => {
  const args = process.argv.slice(2);
  if (args.length !== 1) {
    console.error(
      "Error: Expected exactly one argument containing the cron expression and command."
    );
    process.exit(1);
  }
  // Split on whitespace, allowing for multiple spaces.
  const argParts = args[0].trim().split(/\s+/);
  if (argParts.length < 6) {
    console.error(
      `Error: Insufficient arguments. Expected at least 6 parts (5 cron fields and a command), but got ${argParts.length}.`
    );
    process.exit(1);
  }
  if (argParts.length > 6) {
    console.warn(
      `Warning: More than 6 parts provided. Only the first 6 parts will be processed.`
    );
  }
  const cronExpression = argParts.slice(0, 5);
  const command = argParts.slice(5);

  try {
    const parsedCron = parseCron(cronExpression);
    console.log(parsedCron, command);
  } catch (error: any) {
    if (error instanceof CronValidationError) {
      console.error("Cron Expression Error: " + error.message);
    } else {
      console.error("Unexpected Error: " + error.message);
    }
    process.exit(1);
  }
};

runCronParser();
