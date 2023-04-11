import * as z from 'zod';
import {pagination} from '../../schemas/paginationSchema';

export const releaseStatusSchema = z.enum(['ARCHIVED', 'DRAFT', 'PREVIOUS', 'LIVE']);

export const releaseSelectionSchema = z.object({
    build: z.number(),
    startDate: z.date(),
    endDate: z.date()
});

export const releaseGetSchema = z.object({
    id: z.number().int(),
    includeArchived: z.boolean().optional()
});

export const releaseGetManySchema = z
    .object({
        idList: z.array(z.number().int()),
        includeArchived: z.boolean().optional()
    })
    .optional();

export const releaseCreateSchema = z.object({
    name: z.string(),
    parentId: z.number().int().optional(),
    selections: z.array(releaseSelectionSchema).optional()
});

export const releaseUpdateSchema = z.object({
    id: z.number().int(),
    parentId: z.number().int().optional(),
    name: z.string().optional(),
    status: z.enum(['ARCHIVED', 'DRAFT']).optional(),
    selections: z
        .array(
            releaseSelectionSchema.extend({
                id: z.number().optional()
            })
        )
        .optional()
});

export const releaseSearchSchema = z
    .object({
        query: z.string(),
        includeArchived: z.boolean().optional(),
        pagination: pagination.optional()
    })
    .optional();

export const releasePublishSchema = z.object({
    id: z.number().int()
});

export type ReleaseCreateSchema = z.infer<typeof releaseCreateSchema>;
export type ReleaseGetManySchema = z.infer<typeof releaseGetManySchema>;
export type ReleaseGetSchema = z.infer<typeof releaseGetSchema>;
export type ReleasePublishSchema = z.infer<typeof releasePublishSchema>;
export type ReleaseSearchSchema = z.infer<typeof releaseSearchSchema>;
export type ReleaseSelection = z.infer<typeof releaseSelectionSchema>;
export type ReleaseStatus = z.infer<typeof releaseStatusSchema>;
export type ReleaseUpdateSchema = z.infer<typeof releaseUpdateSchema>;
