import Boom from '@hapi/boom';
import config from '../../config';
import Release, {ReleaseData, ReleaseLineageData} from './Release';
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

export async function getLineage() {
    const {db} = await config();

    const releaseDataList = (await db.manyOrNone(
        `
        select distinct r.id as release_id, rs.build_id from releases r
        left join release_selections rs
        on r.id = rs.release_id OR r.parent_id = rs.release_id
        order by r.id desc, rs.build_id desc
    `,
    )) as ReleaseLineageData[];

    return releaseDataList;
}
