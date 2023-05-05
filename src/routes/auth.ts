import { FastifyInstance } from 'fastify';
import { Schema } from 'mongoose';
import { FastifyPluginAsync, FastifyPluginOptions } from 'fastify';
import type { FastifyRequest as IncomingMessage, FastifyReply as Response } from 'fastify';
import { OAuth2Namespace } from '@fastify/oauth2';
import axios, { AxiosResponse } from 'axios';
import fp from 'fastify-plugin';
import User from '../model/user';
import type { User as UserType } from '../model/user';

type UserDocument = UserType & { _id: Schema.Types.ObjectId };

declare module 'fastify' {
	interface FastifyInstance {
		googleOAuth2: OAuth2Namespace;
	}

	interface Response {
		loginCallback: unknown;
	}
}


const routes: FastifyPluginAsync<FastifyPluginOptions> = async (
	fastify: FastifyInstance) => {
	fastify.get('/auth/google/login', async (_request: IncomingMessage, _reply: Response) => {
		const { googleOAuth2 } = fastify;
		const url = googleOAuth2.generateAuthorizationUri(_request);
		void _reply.redirect(url);
	});

	fastify.get('/auth/google/callback', async (_request: IncomingMessage, _reply: Response) => {
		let oauthToken = await fastify.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(
			_request
		);

		if (oauthToken.expired()) {
			oauthToken = await oauthToken.refresh();
		}

		const config = {
			method: 'get',
			url: `https://www.googleapis.com/oauth2/v2/userinfo`,
			headers: {
				Authorization: `Bearer ${oauthToken.token.access_token}`,
			},
		};
		let user: UserDocument | null = null;
		try {
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
			const { data } = await axios(config) as AxiosResponse<{ email: string, name: string, picture: string }>;
			user = await User.findOne({ email: data.email });
			if (!user) {
				const userData = new User({
					name: data.name,
					email: data.email,
					avatar: 'www.random.com'
				})
				user = await userData.save();
			}
		} catch (error) {
			console.log(error);
		}
		if (!user) throw new Error('User not found');
		return _reply.loginCallback(user, { message: 'Logged in successfully' });
	});
};

export default fp(routes);
