import { parseCron } from "./cronparser";
import { CronValidationError } from "./utils";

// Run the cron parser using the provided command-line arguments
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
  if (argParts.length != 6) {
    console.error(
      `Error: Invalid arguments. Expected at least 6 parts (5 cron fields and a command), but got ${argParts.length}.`
    );
    process.exit(1);
  }
  const cronExpression = argParts.slice(0, 5);
  const command = argParts.slice(5)[0];

  try {
    const parsedCron = parseCron(cronExpression);
    console.log({ ...parsedCron, command });
  } catch (error: any) {
    if (error instanceof CronValidationError) {
      console.error("Cron Expression Error: " + error.message);
    } else {
      console.error("Unexpected Error: " + error.message);
    }
    process.exit(1);
  }
};

runCronParser(); // Run the cron parser
