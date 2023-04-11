import config from '../../config';
import Build, {BuildData} from './Build';
import {BuildSearchSchema} from './schemas';

export default async function search(input: BuildSearchSchema) {
    const {db} = await config();
    const {query, pagination: {page, count} = {page: 1, count: 100}} = input ?? {};

    const buildDataSearch = (await db.manyOrNone(
        `
        select * from builds
        ${
            query
                ? `
                    where name ilike '%' || $[query] || '%'
                `
                : ''
        }
        order by id
        limit $[limit:raw]
        offset $[offset:raw]
    `,
        {
            limit: count + 1,
            offset: count * (page - 1),
            query
        }
    )) as BuildData[];

    const queryCount = buildDataSearch.length ?? 0;
    const hasNextPage = queryCount > count;

    if (hasNextPage) buildDataSearch.pop();

    const builds = buildDataSearch.map((releaseData) => new Build(releaseData));

    const result = {
        items: await Promise.all(builds.map((ii) => ii.asPrimitive())),
        pageInfo: {
            hasNextPage,
            hasPreviousPage: page > 1
        }
    };

    return result;
}
