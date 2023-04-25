import fp from 'fastify-plugin';
import type { User as User } from '../model/user';
import generateKey from '../helper/generateKey';
import AuthToken from '../model/authToken';
import { Schema } from 'mongoose';

type UserType = User & { _id: Schema.Types.ObjectId };

declare module 'fastify' {
    interface FastifyReply {
        loginCallback(user: UserType, payload: any): void;
    }
}

const cookieOptions = {
    domain: 'localhost',
    path: '/',
    signed: true,
    httpOnly: true,
    secure: false,
};

const replyDecorator = fp(async (fastify, _opts) => {

    fastify.decorateReply('loginCallback', async function (user: UserType, payload: unknown) {
        const token = generateKey();
        const authToken = new AuthToken({
            key: token,
            userId: user._id,
            timeToLive: 1000 * 60 * 60 * 24 * 7,
        });
        await authToken.save();
        void this.setCookie('token', token, cookieOptions).code(200).send(payload);
    });

    fastify.decorateReply('logout', async function () {
        void this.clearCookie('token', cookieOptions).code(200).send({ message: 'Logged out' });
    });
});

export default replyDecorator;