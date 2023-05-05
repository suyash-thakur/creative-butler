import fp from 'fastify-plugin';
import type { User as User } from '../../model/user';
import generateKey from '../../helper/generateKey';
import AuthToken from '../../model/authToken';
import { Schema } from 'mongoose';

type UserType = User & { _id: Schema.Types.ObjectId };

declare module 'fastify' {
    interface FastifyReply {
        loginCallback(user: UserType, payload: any): void;
    }
}

const cookieOptions = {
    path: '/',
    httpOnly: true,
    domain: 'localhost',
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
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
        await this.setCookie('authorization', token, cookieOptions).code(200).send(payload);
    });

    fastify.decorateReply('logout', async function () {
        void this.clearCookie('authorization', cookieOptions).code(200).send({ message: 'Logged out' });
    });
});

export default replyDecorator;