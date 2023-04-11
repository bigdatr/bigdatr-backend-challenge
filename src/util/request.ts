import {createHandler} from './handler';
import * as z from 'zod';
import Boom from '@hapi/boom';
import response from './response';

/**
Api Handler
*/
export async function handleRequest(
    body: unknown,
    routes: Record<string, ReturnType<typeof createHandler>>,
) {

    try {
        const parsedBody = (() => {
            try {
                return z
                    .object({
                        method: z.string(),
                        payload: z.unknown()
                    })
                    .parse(body);
            } catch (e) {
                throw Boom.badRequest('Invalid request body');
            }
        })();

        const handler = routes[parsedBody.method];

        if (!handler) throw Boom.notFound();


        const result = await handler(parsedBody.payload);
        if (result === undefined) throw Boom.internal('Route handler returned no data');

        return response.ok(result);
    } catch (err) {
        if (err.name === 'ZodError') return response.fromZodError(err);
        return response.fromBoomError(err);
    }
}