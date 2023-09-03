import Hapi from '@hapi/hapi';
import {handleRequest} from './util/request';

// api imports
import * as build from './api/build';
import * as release from './api/release';
import {getBuildsAndRelease} from './models/release/helper';

const routes = {
    ...build,
    ...release
};

const init = async () => {
    const server = Hapi.server({
        port: 4556,
        host: 'localhost'
    });

    server.route({
        method: 'POST',
        path: '/rpc',
        handler: async (request, h) => {
            const result = await handleRequest(request.payload, routes);

            const response = h.response(result.body);

            response.code(result.statusCode);
            Object.entries(result.headers).forEach(([key, value]) => {
                response.header(key, value);
            });

            return response;
        }
    });

    server.route({
        method: 'GET',
        path: '/releaseLineage/{releaseId}',
        handler: async (request, h) => {
            const releaseId = +request.params.releaseId;
            const buildsAndRelease = await getBuildsAndRelease(releaseId);
            return h.response(buildsAndRelease);
        }
    });

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
    console.error(err);
    process.exit(1);
});

init();
