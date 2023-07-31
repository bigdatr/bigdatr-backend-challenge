import Boom from '@hapi/boom';
import config from '../../config';
import Release, {ReleaseData} from './Release';
import {ReleaseLineageSchema} from './schemas';
import Build from '../build/Build';


export default async function releaseLineage(input: ReleaseLineageSchema) {
    const {db} = await config();
    const {id} = input;

    let dataList = await db.manyOrNone(
        `
        WITH RECURSIVE tree AS (
                SELECT * FROM releases r where r.id = $[id]
            UNION ALL
                SELECT r.* FROM tree 
                    JOIN releases r ON r.id = tree.parent_id
        )
        SELECT build_id, release_id FROM release_selections WHERE release_id IN (
            SELECT id FROM tree
        )
        
    `,
        {id}
    );

    dataList = await Promise.all(
                dataList.map(async (selection) => ({
                    build_id: selection.build_id,
                    build: await (await Build.getByIdOrThrow({id: selection.build_id})).asPrimitive(),
                    release_id: selection.release_id,
                    release: await (await Release.getByIdOrThrow({id: selection.release_id})).asPrimitiveShallow(),
                }))
            ) 

    dataList = dataList.sort((a, b) => {
        return b.release_id - a.release_id || b.build_id - a.build_id 
    })

    return dataList
}