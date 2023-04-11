import {buildCreate, buildGet, buildGetMany, buildSearch} from '../build';

import {v4 as uuid} from 'uuid';

describe('buildCreate', () => {
    it('should create a new build', async () => {
        const input = {
            name: uuid(),
            requiresReview: true,
            startDate: new Date('2022-01-01'),
            endDate: new Date('2022-12-31')
        };
        const response = await buildCreate(input);
        expect(response).toHaveProperty('id');
        expect(response).toHaveProperty('name', input.name);
        expect(response).toHaveProperty('startDate', input.startDate);
        expect(response).toHaveProperty('endDate', input.endDate);
    });
});

describe('buildGet', () => {
    it('can get a build', async () => {
        const input = {
            name: uuid(),
            requiresReview: true,
            startDate: new Date('2022-01-01'),
            endDate: new Date('2022-12-31')
        };
        const created = await buildCreate(input);
        const response = await buildGet({id: created.id});

        expect(response).toHaveProperty('id', created.id);
        expect(response).toHaveProperty('name', input.name);
        expect(response).toHaveProperty('startDate', input.startDate);
        expect(response).toHaveProperty('endDate', input.endDate);
    });

    it('can get multiple builds in the correct order', async () => {
        const builds = await Promise.all(
            Array.from({length: 10}, (_, i) =>
                buildCreate({
                    name: `Build ${i}`,
                    startDate: new Date(),
                    endDate: new Date(),
                    requiresReview: false
                })
            )
        );

        const ids = builds.map((build) => build.id);

        // get the builds in the correct order from buildGetMany
        const response = await buildGetMany({idList: ids});

        // expect the response to be in the correct order
        expect(response).toEqual(builds);
    });

    it('can search for builds', async () => {
        // create 10 uuids
        const uuids = Array.from({length: 10}, () => uuid());

        // create 10 builds build as names

        await Promise.all(
            uuids.map((uuid) =>
                buildCreate({
                    name: uuid,
                    startDate: new Date(),
                    endDate: new Date(),
                    requiresReview: false
                })
            )
        );

        // search for the first uuid
        const response = await buildSearch({query: uuids[0]});

        expect(response.items).toHaveLength(1);
        expect(response.items[0]).toHaveProperty('name', uuids[0]);
    });

    it('can search for builds with pagination', async () => {
        // create 10 builds build as names
        await Promise.all(
            Array.from({length: 10}, (_, i) =>
                buildCreate({
                    name: `Build ${i}`,
                    startDate: new Date(),
                    endDate: new Date(),
                    requiresReview: false
                })
            )
        );
        // search for the first uuid
        const response = await buildSearch({
            query: 'Build',
            pagination: {page: 1, count: 5}
        });

        expect(response.items).toHaveLength(5);
        expect(response.pageInfo).toHaveProperty('hasNextPage', true);
    });
});
