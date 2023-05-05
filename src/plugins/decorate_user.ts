import fp from 'fastify-plugin'
import User from '../model/user'
import type { User as UserType } from '../model/user'

type User = UserType & { _id: string }
const decorateUserPlugin = fp(async (fastify) => {

	fastify.addHook('preHandler', async (request) => {
		const { userId } = request.params as { userId: string };
		let user: User | null = null;
		if (userId) {
			user = await User.findById(userId);
		}
		fastify.decorateRequest('user', user);
	});
});

export default decorateUserPlugin;
