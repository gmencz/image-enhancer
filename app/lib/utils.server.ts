import { z } from "zod";

export const intSchema = z.coerce.number().int();
