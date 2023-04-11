import {z} from 'zod';

export const pagination = z.object({
    page: z.number().int().positive(),
    count: z.number().int().positive()
});
export type Pagination = z.infer<typeof pagination>;
