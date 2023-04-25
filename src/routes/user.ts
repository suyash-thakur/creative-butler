import { FastifyInstance } from 'fastify';
import { FastifyPluginAsync, FastifyPluginOptions } from 'fastify';
import type { FastifyRequest as IncomingMessage } from 'fastify';
import fp from 'fastify-plugin';
import User from '../model/user';
import type { User as UserType } from '../model/user';

const createUserHandler = async (request: IncomingMessage) => {
    const { name, email, password, avatar } = request.body as UserType;
    const user = new User({
        name,
        email,
        password,
        avatar,
    });
    const userData = await user.save();
    return userData;
};

const getUserHandler = async (request: IncomingMessage) => {
    const { id } = request.params as { id: string };
    const user = await User.findById(id);
    if (!user) throw new Error('User not found');
    return user;
};

const updateUserHandler = async (request: IncomingMessage) => {
    const { id } = request.params as { id: string };
    const { name, email, password, avatar } = request.body as UserType;
    const user = await User.findByIdAndUpdate(
        id,
        { name, email, password, avatar },
        { new: true }
    );
    if (!user) throw new Error('User not found');
    return user;
};

const deleteUserHandler = async (request: IncomingMessage) => {
    const { id } = request.params as { id: string };
    await User.findByIdAndDelete(id);
    return { message: 'User deleted successfully' };
};


const routes: FastifyPluginAsync<FastifyPluginOptions> = async (
    fastify: FastifyInstance) => {
    fastify.get('/users/:id', getUserHandler);
    fastify.post('/users', createUserHandler);
    fastify.put('/users/:id', updateUserHandler);
    fastify.delete('/users/:id', deleteUserHandler);
}

export default fp(routes);
