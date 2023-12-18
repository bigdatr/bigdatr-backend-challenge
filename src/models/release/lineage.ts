import config from '../../config';
import { BuildData } from '../build/Build';
import Release from './Release';
import { ReleaseLineageSchema } from './schemas';

type BuildsForRelease = BuildData & {
    release_id: number
}

async function getRecursiveBuildsForRelease(releaseId: number): Promise<BuildsForRelease[]> {
    const { db } = await config();
    const builds = await db.manyOrNone(
        `
        select builds.*, release_selections.release_id
        from builds
        join release_selections on release_selections.build_id = builds.id
        where release_selections.release_id = $[releaseId]
        order by builds.id DESC

    `, { releaseId });

    const release = (await Release.getByIdOrThrow({id: releaseId}))?.asPrimitiveShallow()

    if (release.parentId) {
        const ancestorBuilds = await getRecursiveBuildsForRelease(release.parentId);
        return [...builds, ...ancestorBuilds];
    }

    return builds;
};

export default async function lineage(input: ReleaseLineageSchema){
    const buildsForReleaseAndAncestors = await getRecursiveBuildsForRelease(input.id);

    return Promise.all(
        buildsForReleaseAndAncestors.map(async (build) => {
            const {release_id, ...buildData} = build
            const release = (await Release.getByIdOrThrow({ id: release_id })).asPrimitiveShallow();
            return {
                releaseId: release_id,
                buildId: build.id,
                releaseDetails: release,
                buildDetails: {
                    ...buildData
                }
            }
        })
    )
}  