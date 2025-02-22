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

export const CRON_FIELD_RANGES: Record<keyof Omit<ICronFields, "command">, IRange> = {
  minute: { minValue: 0, maxValue: 59 },
  hour: { minValue: 0, maxValue: 23 },
  dayOfMonth: { minValue: 1, maxValue: 31 },
  month: { minValue: 1, maxValue: 12 },
  dayOfWeek: { minValue: 1, maxValue: 7 },
};

export const getRangeValues = (
  fieldName: keyof Omit<ICronFields, "command">,
  min?: number,
  max?: number
): number[] => {
  const vals: number[] = [];
  const cronFieldRange = CRON_FIELD_RANGES[fieldName];
  const isMinValid = min && min >= cronFieldRange.minValue;
  const isMaxValid = max && max <= cronFieldRange.maxValue;

  if (isMinValid && isMaxValid) {
    for (let i = cronFieldRange.minValue; i <= cronFieldRange.maxValue; i++) {
      vals.push(i);
    }
  } else if (isMinValid) {
    for (let i = min; i <= cronFieldRange.maxValue; i++) {
      vals.push(i);
    }
  } else if (isMaxValid) {
    for (let i = cronFieldRange.minValue; i <= max; i++) {
      vals.push(i);
    }
  }

  return vals;
};

export const getSteppedValues = (
  values: number[],
  step: number = 1
): number[] => {
  const computed = [];
  let curr = values[0];
  while (curr <= values[values.length - 1]) {
    computed.push(curr);
    curr = curr + step;
  }
  return computed;
};
