import config from '../../config';
import {BuildCreateSchema} from './schemas';
import Build from './Build';

export default async function create(input: BuildCreateSchema) {
    const {db, dbHelpers} = await config();

    const insert =
        dbHelpers.insert(
            {
                name: input.name,
                start_date: input.startDate,
                end_date: input.endDate,
                requires_review: input.requiresReview,
                created_at: new Date(),
                updated_at: new Date()
            },
            null,
            'builds'
        ) +
        `
        returning *
    `;

    const result = await db.one(insert);

    const build = new Build(result);
    return build;
}
