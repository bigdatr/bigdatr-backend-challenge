import {createHandler} from '../util/handler';
import ReleaseLineAge from '../models/release/ReleaseLineAge';
import { releaseLineage } from '../models/release/schemas';

export const getData = createHandler(
    () => releaseLineage,
    async () => {
        const releases = await ReleaseLineAge.getReleaseLineAge();
        return Promise.all(releases.map((ii) => ii.asPrimitive()));
    }
);
