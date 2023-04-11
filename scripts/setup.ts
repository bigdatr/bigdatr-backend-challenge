import pg from '../src/services/postgres';
import fs from 'fs';
import path from 'path';

const config = {
    local: {
        host: 'localhost',
        port: '5439',
        database: 'dataentry_app',
        password: 'dataentry_app',
        user: 'dataentry_app'
    },
    test: {
        host: 'localhost',
        port: '5439',
        database: 'tests',
        password: 'dataentry_app',
        user: 'dataentry_app'
    }
};

(async () => {
    const stage = process.argv[2] as 'local' | 'test';

    const db = pg(config[stage]);

    const schema = fs.readFileSync(path.resolve('__dirname', '../schema.sql')).toString();
    const seed = fs.readFileSync(path.resolve('__dirname', '../seed.sql')).toString();

    await db.db.none(schema);

    console.log('database schema generated');

    if (stage === 'local') {
        await db.db.none(seed);
    }

    console.log('seed data added');
    process.exit(0);
})().catch((err) => {
    console.error(err);
    process.exit(1);
});
