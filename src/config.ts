import postgres, {PgClient, PgHelpers} from './services/postgres';

export class Config {
    db: PgClient;
    dbHelpers: PgHelpers;

    private constructor(input: {dbHelpers: PgHelpers; db: PgClient}) {
        this.db = input.db;
        this.dbHelpers = input.dbHelpers;
    }

    static async build() {
        const {db, dbHelpers} = postgres({
            host: 'localhost',
            port: '5439',
            database: process.env.TEST ? 'tests' : 'dataentry_app',
            password: 'dataentry_app',
            user: 'dataentry_app'
        });

        return new Config({
            db,
            dbHelpers
        });
    }
}

let config: Config;

export default async function getConfig() {
    if (config) return config;
    config = await Config.build();
    return config;
}
