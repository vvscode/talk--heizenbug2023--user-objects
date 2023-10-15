const DEFAULT_DELAY_MS = 10_000;

export const sleep = (ms: number = DEFAULT_DELAY_MS) => new Promise((resolve) => setTimeout(resolve, ms));
