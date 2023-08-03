import { ReleaseLineageBuilds } from './schemas';
import config from '../../config';

export type ReleasePrimitive = Awaited<ReturnType<ReleaseLineAge['asPrimitive']>>;
export type ReleaseLineAgeData = {
  id: number;
  builds: Array<ReleaseLineageBuilds>;
};

export default class ReleaseLineAge {
  private data: ReleaseLineAgeData;
  type: 'releaseLineAge';

  constructor(data: ReleaseLineAgeData) {
    this.data = data;
  }

  async asPrimitive() {
    return this.data;
  }

  // Define the getReleaseLineAge method as a static method of the class
  static async getReleaseLineAge() {
    const { db } = await config();

    const releaseDataList = (await db.manyOrNone(`
        SELECT
            *
        FROM release_line_age
    `)) as ReleaseLineAgeData[];

    return releaseDataList.map((data) => new ReleaseLineAge(data));
  }
}
