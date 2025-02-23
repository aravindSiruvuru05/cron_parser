import { parseCron, validateExpression } from "./cronparser";
import { CronValidationError, ITestCase } from "./utils";

describe("Cron Functions Tests", () => {
  it("should validate cron expressions correctly", () => {
    const testCases: ITestCase[] = [
      { field: "minute", value: "1,3,5", expected: [1, 3, 5] },
      { field: "minute", value: "0-10/2", expected: [0, 2, 4, 6, 8, 10] },
      { field: "minute", value: "1-5", expected: [1, 2, 3, 4, 5] },
      { field: "minute", value: "5", expected: [5] },
      { field: "hour", value: "*", expected: [...Array(24).keys()] },
    ];

    testCases.forEach(({ field, value, expected }) => {
      expect(validateExpression(field, value)).toEqual(expected);
    });
  });

  it("should correctly parse cron expressions", () => {
    const testCases: {
      input: string[];
      expected: object | typeof CronValidationError;
    }[] = [
      {
        input: ["5", "0", "1-5", "*", "1,2"],
        expected: {
          minute: "5",
          hour: "0",
          dayOfMonth: "1,2,3,4,5",
          month: "1,2,3,4,5,6,7,8,9,10,11,12",
          dayOfWeek: "1,2",
        },
      },
      {
        input: ["5", "*", "1-5", "*", "1,2a"],
        expected: CronValidationError, // Invalid cron expression should throw error
      },
      {
        input: ["5", "1/5a", "1-5", "*", "1,2"],
        expected: CronValidationError, // Invalid cron expression should throw error
      },
      {
        input: ["5", "1/5a", "1-5a", "*", "1,2"],
        expected: CronValidationError, // Invalid cron expression should throw error
      },
      {
        input: ["5", "1/5a", "1-5", "*a", "1,2"],
        expected: CronValidationError, // Invalid cron expression should throw error
      },
    ];

    testCases.forEach(({ input, expected }) => {
      if (expected === CronValidationError) {
        expect(() => parseCron(input)).toThrow(CronValidationError);
      } else {
        expect(parseCron(input)).toEqual(expected);
      }
    });
  });
});
