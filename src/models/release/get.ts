import Boom from '@hapi/boom';
import config from '../../config';
import Release, {ReleaseData} from './Release';
import {ReleaseGetSchema, ReleaseGetManySchema} from './schemas';

export async function getById(input: ReleaseGetSchema) {
    const {db} = await config();
    const {id, includeArchived = false} = input;

    const data = (await db.oneOrNone(
        `
        select * from releases where id = $[id]
        ${!includeArchived ? `and status is distinct from 'ARCHIVED'` : ''}
    `,
        {id}
    )) as ReleaseData;

    return data ? new Release(data) : null;
}

export async function getByIdOrThrow(input: ReleaseGetSchema) {
    const release = await getById(input);
    if (!release) throw Boom.notFound();
    return release;
}

export async function getMany(input: ReleaseGetManySchema) {
    const {db} = await config();
    const {includeArchived = false, idList} = input ?? {};

    const releaseDataList = (await db.manyOrNone(
        `
        select * from releases
        where id = any($[idList])
        ${!includeArchived ? `and status is distinct from 'ARCHIVED'` : ''}
    `,
        {idList}
    )) as ReleaseData[];

    return releaseDataList.map((releaseData) => new Release(releaseData));
}
