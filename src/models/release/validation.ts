import Boom from '@hapi/boom';
import Build from '../build/Build';
import {ReleaseSelection} from './schemas';

export async function validateSelections(selections: Array<ReleaseSelection>) {
    const builds = await Promise.all(
        selections.map(async (ii) => Build.getByIdOrThrow({id: ii.build}))
    );

    await Promise.all(
        builds.map(async (build, index) => {
            const selection = selections[index];
            const {startDate, endDate} = selection;
            if (startDate < build.startDate || endDate > build.endDate) {
                throw Boom.badRequest(
                    `selection[${index}] has a  date range is outside of the build`
                );
            }
        })
    );
}
