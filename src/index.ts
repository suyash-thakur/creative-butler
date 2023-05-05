/* eslint-disable @typescript-eslint/no-floating-promises */

import 'dotenv/config'
import { FastifyRequest, fastify } from 'fastify';
import pino from 'pino';
import db from './config/index';
import path from 'path';

import fastifyOauth2 from '@fastify/oauth2';
import cookie from '@fastify/cookie';
import autoLoad from '@fastify/autoload';

const clientID = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const callbackUri = process.env.GOOGLE_CALLBACK_URI;

console.log(clientID, clientSecret, callbackUri);

const Port = process.env.PORT || 7000;
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/blogs';
const server = fastify({
	logger: pino({ level: 'info' })
});




const start = async () => {
	try {

		await server.register(db, { uri });
		await server.register(autoLoad, {
			dir: path.join(__dirname, 'plugins', 'common')
		});
		await server.register(autoLoad, {
			dir: path.join(__dirname, 'routes'),
		});

		await server.register(cookie);

		await server.register(fastifyOauth2, {
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
		await server.listen(Port)
		console.log('Server started successfully');
	} catch (err) {
		server.log.error(err);
		process.exit(1);
	}
};
void start();
