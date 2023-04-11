import {
    releaseCreate,
    releaseGet,
    releaseGetMany,
    releaseUpdate,
    releasePublish,
    releaseSearch
} from '../release';
import {v4 as uuid} from 'uuid';
import Boom from '@hapi/boom';
import {buildCreate} from '../build';
import {ReleaseSelection} from '../../models/release/schemas';

const name = 'Test Release';

describe('get', () => {
    it(`can get a release`, async () => {
        const created = await releaseCreate({name});
        const release = await releaseGet({id: created.id});
        expect(release.status).toBe('DRAFT');
        expect(release.id).toBe(created.id);
    });

    it(`will throw 404s for missing releases`, async () => {
        await expect(releaseGet({id: 12315})).rejects.toThrowError();
    });

    it(`can get archived releases`, async () => {
        const {id} = await releaseCreate({name});
        await releaseUpdate({id, status: 'ARCHIVED'});
        await expect(releaseGet({id})).rejects.toThrowError();
        const release = await releaseGet({id, includeArchived: true});
        expect(release.status).toBe('ARCHIVED');
    });
});

describe('getMany', () => {
    it(`can return a list of ids`, async () => {
        const a = await releaseCreate({name});
        const b = await releaseCreate({name});

        const list = await releaseGetMany({idList: [a.id, b.id]});
        expect(list[0].id).toBe(a.id);
        expect(list[1].id).toBe(b.id);
    });

    it(`won't return an archived release`, async () => {
        const release = await releaseCreate({name});
        await releaseUpdate({id: release.id, status: 'ARCHIVED'});
        const list = await releaseGetMany({idList: [release.id]});
        expect(list).toHaveLength(0);
    });
});

describe('create', () => {
    it(`can create a new release`, async () => {
        const created = await releaseCreate({name});
        expect(created.status).toBe('DRAFT');
        expect(created.createdAt).toBeDefined();
    });

    it(`will validate releaseCreate input data`, async () => {
        // @ts-expect-error
        expect(() => releaseCreate({foo: 'bar'})).toThrowError('invalid_type');
    });
});

describe('update', () => {
    it(`can update an existing release`, async () => {
        const first = await releaseCreate({name});
        const second = await releaseUpdate({id: first.id, name: 'Next Name'});
        expect(first.name).not.toBe(second.name);
        expect(first.id).toEqual(second.id);
    });

    it(`will throw if you try to update a non-existing release`, async () => {
        await expect(releaseUpdate({id: 123124, name})).rejects.toThrow(Boom.notFound());
    });

    it(`will validate releaseUpdate input data`, async () => {
        // @ts-expect-error
        expect(() => releaseUpdate({name})).toThrowError();
    });

    it(`will throw if you try to update to a published status`, async () => {
        const {id} = await releaseCreate({name});
        // @ts-expect-error
        expect(() => releaseUpdate({id, status: 'LIVE'})).toThrowError();
        // @ts-expect-error
        expect(() => releaseUpdate({id, status: 'PREVIOUS'})).toThrowError();
    });

    it(`wont let you change the status of the live release`, async () => {
        const first = await releaseCreate({name});
        await releasePublish({id: first.id});
        await expect(releaseUpdate({id: first.id, status: 'ARCHIVED'})).rejects.toThrowError();
    });
});

describe('publish', () => {
    it('will mark the existing published release as previous', async () => {
        const first = await releaseCreate({name});
        await releasePublish({id: first.id});

        const second = await releaseCreate({name});
        await releasePublish({id: second.id});

        const previous = await releaseGet({id: first.id});
        expect(previous.status).toBe('PREVIOUS');
    });
});

describe('search', () => {
    it('it can search a subset of releases', async () => {
        const firstName = uuid();
        const secondName = uuid();
        await releaseCreate({name: firstName});
        await releaseCreate({name: secondName});

        const first = await releaseSearch({query: firstName});
        expect(first.items[0].name).toBe(firstName);

        const second = await releaseSearch({query: secondName});
        expect(second.items[0].name).toBe(secondName);
    });

    it('can search pages of data', async () => {
        const name = uuid();
        const first = await releaseCreate({name: name + uuid()});
        const second = await releaseCreate({name: name + uuid()});

        const page1 = await releaseSearch({query: name, pagination: {page: 1, count: 1}});
        expect(page1.items[0].name).toBe(first.name);
        const page2 = await releaseSearch({query: name, pagination: {page: 2, count: 1}});
        expect(page2.items[0].name).toBe(second.name);
    });

    it('can choose to return archived releases', async () => {
        const name = uuid();
        const release = await releaseCreate({name});
        const archived = await releaseUpdate({id: release.id, status: 'ARCHIVED'});

        const first = await releaseSearch({query: name});
        expect(first).not.toContainEqual(archived);
        const second = await releaseSearch({query: name, includeArchived: true});
        expect(second.items[0]).toEqual(archived);
    });
});

describe('selections', () => {
    it('will create selections for each provided build', async () => {
        const buildName = uuid();
        const build = (
            await buildCreate({
                name: buildName,
                requiresReview: false,
                startDate: new Date('2022-01-01'),
                endDate: new Date('2022-12-31')
            })
        ).id;

        const created = await releaseCreate({
            name,
            selections: [
                {
                    build,
                    startDate: new Date('2022-01-01'),
                    endDate: new Date('2022-12-31')
                }
            ]
        });

        expect(created.selections[0].id).toBeDefined();
        expect(created.selections[0].build.name).toBe(buildName);
    });

    it('will remove and update selections', async () => {
        const dates = {
            startDate: new Date('2022-01-01'),
            endDate: new Date('2022-12-31')
        };
        const newBuild = async (name: string) => {
            return buildCreate({
                name: uuid() + ' ' + name,
                requiresReview: false,
                ...dates
            });
        };

        const buildToRemove = (await newBuild('remove')).id;
        const buildToAdd = (await newBuild('add')).id;
        const buildToUpdate = (await newBuild('update')).id;

        const created = await releaseCreate({
            name,
            selections: [
                {build: buildToRemove, ...dates},
                {build: buildToUpdate, ...dates}
            ]
        });

        await releaseUpdate({
            id: created.id,
            selections: [
                {build: buildToAdd, ...dates},
                {id: created.selections[1].id, build: buildToUpdate, ...dates}
            ]
        });

        const get = await releaseGet({id: created.id});

        expect(get.selections.map((ii) => ii.build.id)).not.toContain(buildToRemove);
        expect(get.selections.map((ii) => ii.build.id)).toContain(buildToAdd);
        expect(get.selections.map((ii) => ii.build.id)).toContain(buildToUpdate);
    });

    it('will validate selections in create', async () => {
        const build = (
            await buildCreate({
                name: uuid(),
                requiresReview: false,
                startDate: new Date('2022-01-01'),
                endDate: new Date('2022-12-31')
            })
        ).id;

        const create = async (selection: Partial<ReleaseSelection>) =>
            releaseCreate({
                name,
                selections: [
                    {
                        build,
                        startDate: new Date('2022-01-01'),
                        endDate: new Date('2022-12-31'),
                        ...selection
                    }
                ]
            });

        // Bad Dates
        await expect(() => create({startDate: new Date('2021-01-01')})).rejects.toThrowError();
        await expect(() => create({endDate: new Date('2024-01-01')})).rejects.toThrowError();
    });

    it('will validate selections in update', async () => {
        const build = (
            await buildCreate({
                name: uuid(),
                requiresReview: false,
                startDate: new Date('2022-01-01'),
                endDate: new Date('2022-12-31')
            })
        ).id;

        const release = await releaseCreate({
            name: uuid()
        });

        const update = async (selection: Partial<ReleaseSelection>) =>
            releaseUpdate({
                id: release.id,
                selections: [
                    {
                        build,
                        startDate: new Date('2022-01-01'),
                        endDate: new Date('2022-12-31'),
                        ...selection
                    }
                ]
            });

        // Bad Dates
        await expect(() => update({startDate: new Date('2021-01-01')})).rejects.toThrowError();
        await expect(() => update({endDate: new Date('2024-01-01')})).rejects.toThrowError();
    });
});
