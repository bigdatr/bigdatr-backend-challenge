import config from '../../config';
import Release from './Release';
import {ReleaseCreateSchema} from './schemas';
import {ReleaseData} from './Release';
import {validateSelections} from './validation';

export default async function create(input: ReleaseCreateSchema) {
    const {db, dbHelpers} = await config();

    // Ensure that parent release exists
    if (input.parentId) await Release.getByIdOrThrow({id: input.parentId, includeArchived: true});

    const row = await db.tx(async (tt) => {
        const releaseInputData = {
            name: input.name,
            status: 'DRAFT',
            parent_id: input.parentId
        };

        const releaseInsert =
            dbHelpers.insert(releaseInputData, null, 'releases') +
            `
            returning *
        `;

        const releaseData = (await tt.one(releaseInsert)) as ReleaseData;

        const selections = input.selections ?? [];

        if (selections.length > 0) {
            await validateSelections(selections);

            const selectionData = (input.selections ?? []).map((selection) => ({
                release_id: releaseData.id,
                build_id: selection.build,
                start_date: selection.startDate,
                end_date: selection.endDate,
                status: 'ACTIVE'
            }));

            const selectionInsert = dbHelpers.insert(
                selectionData,
                Object.keys(selectionData[0]),
                'release_selections'
            );

            await tt.none(selectionInsert);
        }

        return releaseData;
    });

    return new Release(row);
}
