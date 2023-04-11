import {Boom as BoomType, boomify, isBoom} from '@hapi/boom';
import {ZodError} from 'zod';

const defaultHeaders = {'Content-Type': 'application/json'};
export default {
    //
    // Success

    ok(response: any) {
        return {
            statusCode: 200,
            headers: defaultHeaders,
            body: JSON.stringify(response)
        };
    },

    //
    // Custom  Error Types

    fromZodError(err: ZodError) {
        const name = 'Validation Error';
        const issue = err.issues[0];
        const message =
            issue.path.length > 0 ? `'${issue.path.join('.')}' is ${issue.message}` : issue.message;
        return {
            statusCode: 400,
            headers: defaultHeaders,
            body: JSON.stringify({
                error: {name, message, statusCode: 400, code: issue.code, path: issue.path}
            })
        };
    },

    fromBoomError(err: BoomType | Error) {
        const boom = isBoom(err) ? err : boomify(err);
        return {
            statusCode: boom.output.statusCode,
            headers: defaultHeaders,
            body: JSON.stringify({
                error: {
                    name: boom.output.payload.error,
                    message: boom.message ?? boom.output.payload.message,
                    data: boom.data,
                    statusCode: boom.output.statusCode
                }
            })
        };
    }
};
