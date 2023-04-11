import {createHandler} from '../util/handler';
import Release from '../models/release/Release';
import {releaseCreateSchema} from '../models/release/schemas';
import {releaseGetSchema} from '../models/release/schemas';
import {releaseUpdateSchema} from '../models/release/schemas';
import {releasePublishSchema} from '../models/release/schemas';
import {releaseGetManySchema} from '../models/release/schemas';
import {releaseSearchSchema} from '../models/release/schemas';

export const releaseCreate = createHandler(
    () => releaseCreateSchema,
    async (input) => {
        const release = await Release.create(input);
        return release.asPrimitive();
    }
);

export const releaseGet = createHandler(
    () => releaseGetSchema,
    async (input) => {
        const release = await Release.getByIdOrThrow(input);
        return release.asPrimitive();
    }
);

export const releaseGetMany = createHandler(
    () => releaseGetManySchema,
    async (input) => {
        const releases = await Release.getMany(input);
        return Promise.all(releases.map((ii) => ii.asPrimitive()));
    }
);

export const releaseUpdate = createHandler(
    () => releaseUpdateSchema,
    async (input) => {
        const release = await Release.update(input);
        return release.asPrimitive();
    }
);

export const releasePublish = createHandler(
    () => releasePublishSchema,
    async (input) => {
        const release = await Release.publish(input);
        return release.asPrimitive();
    }
);

export const releaseSearch = createHandler(
    () => releaseSearchSchema,
    async (input) => {
        return await Release.search(input);
    }
);
