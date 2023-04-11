import PgPromise from 'pg-promise';
export type PgClient = PgPromise.IDatabase<Record<string, any>>;
export type PgHelpers = PgPromise.IHelpers;

export default function configure(db: {
    host: string;
    port: string;
    database: string;
    user: string;
    password: string;
}) {
    const {host, port, database, user, password} = db;
    const pgp = PgPromise();

    // @intent: node-postgres has a questionable default where dates fields are localized
    // when they are parsed. 1082 is the OID for the postgres date type and by adding the
    // timezone to the end of the date it ensures that they are parsed as UTC which matches
    // the functionality of graphql-iso-date which parses the user input.
    pgp.pg.types.setTypeParser(1082, (val) => {
        return new Date(val + 'T00:00:00.000Z');
    });

    return {
        db: pgp({
            host,
            port: Number.parseInt(port),
            database,
            user,
            password,
            application_name: 'api-dataentry'
        }),
        dbHelpers: pgp.helpers
    };
}
