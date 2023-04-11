import {ZodSchema} from 'zod';
import * as z from 'zod';

/**
    Create a route handler
*/
export function createHandler<
    S extends ZodSchema,
    H extends (input: z.output<S>) => ReturnType<H>
>(schema: (zod: typeof z) => S, handler: H) {
    const compiledSchema = schema(z);
    return (input: z.input<S>) => handler(compiledSchema.parse(input))
}
