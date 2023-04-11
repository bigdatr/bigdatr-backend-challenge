import {createHandler} from '../util/handler';
import Build from '../models/build/Build';
import {
    buildCreateSchema,
    buildGetSchema,
    buildGetManySchema,
    buildSearchSchema
} from '../models/build/schemas';

export const buildCreate = createHandler(
    () => buildCreateSchema,
    async (input) => {
        const build = await Build.create(input);
        return build.asPrimitive();
    }
);

export const buildGet = createHandler(
    () => buildGetSchema,
    async (input) => {
        const build = await Build.getByIdOrThrow(input);
        return build.asPrimitive();
    }
);

export const buildGetMany = createHandler(
    () => buildGetManySchema,
    async (input) => {
        const builds = await Build.getMany(input);
        return Promise.all(builds.map((ii) => ii.asPrimitive()));
    }
);

export const buildSearch = createHandler(
    () => buildSearchSchema,
    async (input) => {
        return await Build.search(input);
    }
);
