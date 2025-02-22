import {
  CRON_FIELD_RANGES,
  getRangeValues,
  getSteppedValues,
  ICronFields,
} from "./utils";

const validateExpression = (
  fieldName: keyof Omit<ICronFields, "command">,
  fieldValue: string
): number[] => {
  if (fieldValue.includes("*")) {
    const range = CRON_FIELD_RANGES[fieldName];
    fieldValue = fieldValue.replace("*", `${range.minValue}-${range.maxValue}`);
  }
  // Helper function to determine the type of expression
  const getExpressionType = (value: string): string => {
    if (value.includes(",")) return "LIST";
    if (value.includes("/")) return "STEP";
    if (value.includes("-")) return "RANGE";
    return "SINGLE";
  };

  switch (getExpressionType(fieldValue)) {
    case "LIST":
      // Handle comma-separated values (e.g., "1,3,5")
      const list = fieldValue.split(",");
      return list.reduce<number[]>((acc, curr) => {
        acc = [...acc, ...validateExpression(fieldName, curr)];
        return acc;
      }, []);

    case "STEP":
      // Handle step values (e.g., "0-10/2")
      const valWithStep = fieldValue.split("/");
      console.log(valWithStep, "----");
      if (valWithStep.length > 2)
        throw new Error(`invalid expression at ${fieldName}`);
      let [expVal, step] = valWithStep;
      if (!expVal.includes("-")) {
        expVal += "-";
      }
      const rangeVals = validateExpression(fieldName, expVal);
      return getSteppedValues(rangeVals, parseInt(step));
    case "RANGE":
      // Handle range values (e.g., "1-5")
      const [start, end] = fieldValue.split("-").map(Number);
      return getRangeValues(fieldName, start, end);

    case "SINGLE":
    default:
      // Handle single value (e.g., "5")
      return [parseInt(fieldValue)];
  }
};

const parseCron = (expressioin: string[]): ICronFields => {
  const [minute, hour, dayOfMonth, month, dayOfWeek] = expressioin;
  const result: ICronFields = {} as ICronFields;

  result.minute = validateExpression("minute", minute).toString();
  result.hour = validateExpression("hour", hour).toString();
  return result;
};

// Fetching all the argumets passed via cmd line
const args = process.argv.slice(2);
const arg = args[0].split(" ");

if (arg.length != 6) {
  throw new Error("Invalid arguments passed!");
}
const [expression, command] = [arg.slice(0, 5), arg.slice(5)];

try {
  const parsedCron = parseCron(expression);
  console.log(parsedCron, command);
} catch (e) {
  console.error("Please provide a valid cron expression", e);
}
