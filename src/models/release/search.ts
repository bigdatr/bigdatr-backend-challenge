import config from '../../config';
import Release, {ReleaseData} from './Release';
import {ReleaseSearchSchema} from './schemas';

export default async function search(input: ReleaseSearchSchema) {
    const {db} = await config();
    const {
        query,
        includeArchived = false,
        pagination: {page, count} = {page: 1, count: 100}
    } = input ?? {};

    const releaseDataSearch = (await db.manyOrNone(
        `
        select * from releases
        where name ilike '%' || $[query] || '%'
        ${!includeArchived ? `and status is distinct from 'ARCHIVED'` : ''}
        limit $[limit:raw]
        offset $[offset:raw]
    `,
        {
            query,
            limit: count + 1,
            offset: count * (page - 1)
        }
    )) as ReleaseData[];

    const queryCount = releaseDataSearch.length ?? 0;
    const hasNextPage = queryCount > count;

    if (hasNextPage) releaseDataSearch.pop();

    const builds = releaseDataSearch.map((releaseData) => new Release(releaseData));

    const result = {
        items: await Promise.all(builds.map((ii) => ii.asPrimitive())),
        pageInfo: {
            hasNextPage,
            hasPreviousPage: page > 1
        }
    };

    return result;
}
