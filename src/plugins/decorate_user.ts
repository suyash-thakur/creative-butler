import fp from 'fastify-plugin'
import User from '../model/user'
import AuthToken from '../model/authToken'
import type { User as UserType } from '../model/user'
import fastify, { FastifyInstance, FastifyRequest } from 'fastify'

type User = UserType & { _id: string }

declare module 'fastify' {
	interface FastifyRequest {
		user: User
	}
}

const parseCookie = (cookie: string) => {
	const cookies = cookie.split(';')
	const cookieObj = cookies.reduce((acc, cookie) => {
		const [key, value] = cookie.split('=')
		return { ...acc, [key.trim()]: value }
	}, {})
	return cookieObj
}

const userDecorator = async (fastify: FastifyInstance) => {
	fastify.decorateRequest('user', null)
	fastify.addHook('onRequest', async (request: FastifyRequest) => {
		const { cookie } = request.headers as { cookie: string };
		if (!cookie) throw new Error('Token not found');
		const { authorization } = parseCookie(cookie) as { authorization: string };
		const authToken = await AuthToken.findOne({ key: authorization });
		if (!authToken) throw new Error('Token not found');
		const user = await User.findById(authToken.userId)
		if (!user) throw new Error('User not found')
		request.user = user
	})
}



export default fp(userDecorator)


