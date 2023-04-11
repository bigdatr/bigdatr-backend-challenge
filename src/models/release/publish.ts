import config from '../../config';
import Release, {ReleaseData} from './Release';
import {ReleasePublishSchema, ReleaseStatus} from './schemas';

export default async function publish({id}: ReleasePublishSchema) {
    const {db, dbHelpers} = await config();
    await Release.getByIdOrThrow({id, includeArchived: false});

    return db.tx(async (tx) => {
        const current = await tx.oneOrNone<{id: number}>(`
            select id from releases
            where status = 'LIVE'
            limit 1
        `);

        //
        // Update Releases
        const update = async (id: number, status: ReleaseStatus) => {
            const query = `
                update releases set
                    status = $[status],
                    updated_at = $[updatedAt]
                where id = $[id]
                returning id, name, status, created_at, updated_at;
            `;
            const row = await tx.one<ReleaseData>(query, {
                id,
                status,
                updatedAt: new Date()
            });
            return new Release(row);
        };

        if (current) {
            await update(current.id, 'PREVIOUS');
        }

        const next = await update(id, 'LIVE');

        return next;
    });
}
