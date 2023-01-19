import { z } from "zod";

export const intSchema = z.coerce.number().int();

export function getCreditsFromAmount(amount: number) {
  return Math.round(amount / 100 / 0.1);
}
