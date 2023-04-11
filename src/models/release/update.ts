import Boom from '@hapi/boom';
import config from '../../config';
import Release, {ReleaseData} from './Release';
import {ReleaseUpdateSchema} from './schemas';
import {validateSelections} from './validation';

export default async function update({id, ...input}: ReleaseUpdateSchema) {
    const {db, dbHelpers} = await config();
    const current = await Release.getByIdOrThrow({id, includeArchived: true});

    // Validate status
    if (input.status && (current.status === 'LIVE' || current.status === 'PREVIOUS')) {
        throw Boom.badRequest('You can not alter the status of a published release');
    }

    // Validate selections
    if (input.selections) await validateSelections(input.selections);

    const updatedRelease = await db.tx(async (tt) => {
        // Update the release
        const updatedRelease = await tt.one<ReleaseData>(
            `
            update releases
                set updated_at = now()
                ${input.name ? ', name = $[name]' : ''}
                ${input.parentId ? ', parent_id = $[parentId]' : ''}
                ${input.status ? ', status = $[status]' : ''}
            where id = $[id]
            returning *

        `,
            {
                id,
                name: input.name,
                parentId: input.parentId,
                status: input.status
            }
        );

        // Mark existing selections as deleted before inserting the new ones
        await tt.none(
            `
            update release_selections
            set status = 'DELETED',
                updated_at = now()
            where release_id = $[id]
        `,
            {id}
        );

        const selectionData = (input.selections ?? []).map((selection) => ({
            release_id: current.id,
            build_id: selection.build,
            start_date: selection.startDate,
            end_date: selection.endDate,
            status: 'ACTIVE'
        }));

        if (selectionData.length > 0) {
            const selectionInsert = dbHelpers.insert(
                selectionData,
                Object.keys(selectionData[0]),
                'release_selections'
            );
            await tt.none(selectionInsert);
        }

        return updatedRelease;
    });

    const next = new Release(updatedRelease);

    return next;
}
