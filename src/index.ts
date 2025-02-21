import { ICronFields } from "./utils";

const validateExpression = (
  fieldName: keyof ICronFields,
  fieldValue: string
): string => {
    if(fieldValue.includes(',')) {
        return fieldValue
          .split(",")
          .map((val) => validateExpression(fieldName, val)).join(' ');
    }
    if(fieldValue.includes('/')) {
        const valWithStep = fieldValue.split('/')
        if(valWithStep.length > 2) throw new Error(`invalid expression at ${fieldName}`)
        const [expVal, step] = valWithStep

        
    }
  return "";
};

const parseCron = (expressioin: string[]): ICronFields => {
  const [minute, hour, dayOfMonth, month, dayOfWeek] = expressioin;
  const result: ICronFields = {} as ICronFields;

  result.minute = validateExpression("minute", minute);
  result.hour = validateExpression("hour", hour);
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
