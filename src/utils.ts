export interface ICronFields {
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
  command: string;
}
interface IRange {
  minValue: number;
  maxValue: number;
}

const CRON_FIELD_RANGES: Record<keyof Omit<ICronFields, "command">, IRange> = {
  minute: { minValue: 0, maxValue: 59 },
  hour: { minValue: 0, maxValue: 23 },
  dayOfMonth: { minValue: 1, maxValue: 31 },
  month: { minValue: 1, maxValue: 12 },
  dayOfWeek: { minValue: 1, maxValue: 7 },
};

export const getValidValuesForField = (
  fieldName: keyof Omit<ICronFields, "command">,
  min?: number,
  max?: number,
  exp?: string,
  step: number = 1
): number[] => {
  const vals: number[] = [];
  const cronFieldRange = CRON_FIELD_RANGES[fieldName];
  const isMinValid = min && min >= cronFieldRange.minValue;
  const isMaxValid = max && max >= cronFieldRange.maxValue;

  if (isMinValid && isMaxValid) {
    for (
      let i = cronFieldRange.minValue;
      i <= cronFieldRange.maxValue;
      i = i + step
    ) {
      vals.push(i);
    } 
  }

  return vals;
};
