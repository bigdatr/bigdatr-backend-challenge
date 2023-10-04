import config from '../../config';
import Build, {BuildData} from '../build/Build';
import Release from './Release';
import {ReleaseLineageSchema} from './schemas';

export default async function lineage({id}: ReleaseLineageSchema) {
    const {db} = await config();
    await Release.getByIdOrThrow({id});

    const builds = (await db.manyOrNone(
        `
        with recursive Ancestors as (
            select id, parent_id
            from releases
            where id = $[id]

            union all

            select r.id, r.parent_id
            from releases r
            join Ancestors a on r.id = a.parent_id
        )

        select b.*
        from release_selections rs
        join builds b on rs.build_id = b.id
        where rs.release_id in (select id from Ancestors)
        order by rs.release_id desc, rs.build_id desc
        `,
        {id}
    )) as BuildData[];

    return builds.map((build) => new Build(build));
}
