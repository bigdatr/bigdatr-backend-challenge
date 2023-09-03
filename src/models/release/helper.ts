import {releaseGet} from '../../api/release';

export async function getBuildsAndRelease(releaseId: number) {
    const release = await releaseGet({id: releaseId});

    const buildsAndRelease = release.selections.flatMap((build: any) => ({
        buildId: build.id,
        buildName: build.build.name,
        releaseId: release.id,
        releaseName: release.name
    }));

    if (release.parentId) {
        const parentBuildsAndRelease = await getBuildsAndRelease(+release.parentId);
        buildsAndRelease.push(...parentBuildsAndRelease);
    }

    return buildsAndRelease.sort((a, b) => {
        if (b.releaseId === a.releaseId) {
            return b.buildId - a.buildId;
        }
        return b.releaseId - a.releaseId;
    });
}
