import 'dotenv/config'
import { fastify } from 'fastify';
import pino from 'pino';
import db from './config/index';
import routes from './routes/index';

const Port = process.env.PORT || 7000;
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/blogs';
const server = fastify({
    logger: pino({ level: 'info' })
});

void server.register(db, { uri });
void server.register(routes);

const start = async () => {
    try {
        await server.listen(Port);
        console.log('Server started successfully');
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};
void start();