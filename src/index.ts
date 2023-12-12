import Hapi from '@hapi/hapi';
import {handleRequest} from './util/request';

// api imports
import * as build from './api/build';
import * as release from './api/release';
import Release from './models/release/Release'

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
        path: '/releaseLineage/{id}',
        handler: async (request, h) => {
            try {                
                const lineAge = await Release.getLineage(request.params.id)
                const response = {'result': lineAge}

                return response;
            } catch(e) {
                console.log('exception occured:', e)
            }
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
