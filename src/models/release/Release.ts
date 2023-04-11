import {ReleaseStatus} from './schemas';

import {getById, getByIdOrThrow, getMany} from './get';
import update from './update';
import create from './create';
import publish from './publish';
import search from './search';
import config from '../../config';
import Build from '../build/Build';

export type ReleasePrimitive = Awaited<ReturnType<Release['asPrimitive']>>;
export type ReleaseData = {
    id: number;
    name: string;
    parent_id: number | null;
    created_at: Date;
    updated_at: Date;
    status: ReleaseStatus;
};

export default class Release {
    static getByIdOrThrow = getByIdOrThrow;
    static getById = getById;
    static getMany = getMany;
    static create = create;
    static update = update;
    static publish = publish;
    static search = search;

    private data: ReleaseData;
    type: 'release';

    constructor(data: ReleaseData) {
        this.data = data;
    }

    get id() {
        return this.data.id;
    }

    get status() {
        return this.data.status;
    }

    async selections() {
        const {db} = await config();
        const rows = await db.manyOrNone(
            `
            select * from release_selections
            where release_id = $[releaseId]
            and status = 'ACTIVE'

        `,
            {releaseId: this.id}
        );

        return Promise.all(
            rows.map(async (s) => ({
                id: s.id,
                build: await (await Build.getByIdOrThrow({id: s.build_id})).asPrimitive(),
                startDate: s.start_date,
                endDate: s.end_date,
                brand: s.brand,
                industry: s.industry,
                category: s.category,
                product: s.product
            }))
        );
    }

    asPrimitiveShallow() {
        return {
            id: this.data.id,
            parentId: this.data.parent_id,
            name: this.data.name,
            createdAt: this.data.created_at,
            updatedAt: this.data.updated_at,
            status: this.data.status
        };
    }

    async asPrimitive() {
        return {
            ...this.asPrimitiveShallow(),
            selections: await this.selections()
        };
    }
}
