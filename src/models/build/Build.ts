import {getById, getByIdOrThrow, getMany} from './get';
import create from './create';
import search from './search';

export type BuildPrimitive = Awaited<ReturnType<Build['asPrimitive']>>;
export type BuildData = {
    id: number;
    name: string;
    requires_review: boolean;
    start_date: Date;
    end_date: Date;
};

export default class Build {
    static getByIdOrThrow = getByIdOrThrow;
    static getById = getById;
    static getMany = getMany;
    static create = create;
    static search = search;

    private data: BuildData;
    type: 'build';

    constructor(data: BuildData) {
        this.data = data;
    }

    get startDate() {
        return this.data.start_date;
    }

    get endDate() {
        return this.data.end_date;
    }

    async asPrimitive() {
        return {
            id: this.data.id,
            name: this.data.name,
            requiresReview: this.data.requires_review,
            startDate: this.data.start_date,
            endDate: this.data.end_date
        };
    }
}
