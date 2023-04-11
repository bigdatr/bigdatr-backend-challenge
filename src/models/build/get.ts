import Boom from '@hapi/boom';
import config from '../../config';
import Build, {BuildData} from './Build';
import {BuildGetSchema, BuildGetManySchema} from './schemas';

export async function getById(input: BuildGetSchema) {
    const {db} = await config();
    const {id} = input;
    const data = (await db.oneOrNone(`select * from builds where id = $[id]`, {
        id
    })) as BuildData | null;
    return data ? new Build(data) : null;
}

export async function getByIdOrThrow(input: BuildGetSchema) {
    const release = await getById(input);
    if (!release) throw Boom.notFound();
    return release;
}

export async function getMany(input: BuildGetManySchema) {
    const {db} = await config();
    const {idList} = input;

    const buildsDataList = (await db.manyOrNone(
        `
        select * from builds where id = any($[idList])
    `,
        {idList}
    )) as BuildData[];

    // sort the releaseDataList based on the index of each id in the idList
    if (idList) {
        buildsDataList.sort((a, b) => {
            const aIndex = idList.indexOf(a.id);
            const bIndex = idList.indexOf(b.id);
            return aIndex - bIndex;
        });
    }

    return buildsDataList.map((releaseData) => new Build(releaseData));
}
