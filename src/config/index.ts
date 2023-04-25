import { FastifyInstance } from 'fastify';
import { FastifyPluginAsync, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin';
import mongoose from 'mongoose';

// define options
export interface DbPluginOptions {
    uri: string;
}
const ConnectDB: FastifyPluginAsync<DbPluginOptions> = async (
    fastify: FastifyInstance,
    options: FastifyPluginOptions
) => {
    try {
        mongoose.connection.on('connected', () => {
            fastify.log.info({ actor: 'MongoDB' }, 'connected');
        });
        mongoose.connection.on('disconnected', () => {
            fastify.log.error({ actor: 'MongoDB' }, 'disconnected');
        });
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const db = await mongoose.connect(options.uri);
        fastify.decorate('mongo', db);
    } catch (error) {
        console.error(error);
    }
};

export default fp(ConnectDB);