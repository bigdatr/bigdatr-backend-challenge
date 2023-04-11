import * as z from 'zod';
import {pagination} from '../../schemas/paginationSchema';

export const buildGetSchema = z.object({
    id: z.number().int(),
    includeArchived: z.boolean().optional()
});

export const buildGetManySchema = z
    .object({
        idList: z.array(z.number().int())
    })
    .required();

export const buildSearchSchema = z
    .object({
        query: z.string().optional(),
        pagination: pagination.optional()
    })
    .optional();

export const buildCreateSchema = z.object({
    name: z.string(),
    requiresReview: z.boolean(),
    startDate: z.date(),
    endDate: z.date()
});

export type BuildCreateSchema = z.infer<typeof buildCreateSchema>;
export type BuildGetSchema = z.infer<typeof buildGetSchema>;
export type BuildGetManySchema = z.infer<typeof buildGetManySchema>;
export type BuildSearchSchema = z.infer<typeof buildSearchSchema>;
