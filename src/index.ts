import 'dotenv/config'
import { FastifyRequest, fastify } from 'fastify';
import pino from 'pino';
import db from './config/index';
import userRoutes from './routes/user';
import projectRoutes from './routes/project';
import promptRoute from './routes/prompt';
import fastifyOauth2 from '@fastify/oauth2';
import cookie from '@fastify/cookie'

const clientID = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const callbackUri = process.env.GOOGLE_CALLBACK_URI;


const Port = process.env.PORT || 7000;
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/blogs';
const server = fastify({
	logger: pino({ level: 'info' })
});

void server.register(cookie);

void server.register(fastifyOauth2, {
	name: 'googleOAuth2',
	scope: ['profile', 'email'],
	credentials: {
		client: {
			id: clientID as string,
			secret: clientSecret as string,
		},
		auth: fastifyOauth2.GOOGLE_CONFIGURATION,
	},
	startRedirectPath: '/login/google',
	callbackUri: callbackUri as string,
	generateStateFunction: (request: FastifyRequest) => {
		const { state } = request.query as { state: string };
		return state;
	},
	// eslint-disable-next-line @typescript-eslint/ban-types
	checkStateFunction: (returnedState: any, callback: Function) => {
		callback();
	},
	callbackUriParams: {
		// custom query param that will be passed to callbackUri
		access_type: 'offline', // will tell Google to send a refreshToken too
	},
});
void server.register(db, { uri });
void server.register(userRoutes);
void server.register(projectRoutes);
void server.register(promptRoute);

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
