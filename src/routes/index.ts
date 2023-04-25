import { FastifyInstance } from 'fastify';
import { FastifyPluginAsync, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin';
import { getPrompt, getChatCompletion } from '../service/gpt/index';
import User from '../model/user';
import { ChatCompletionRequestMessageRoleEnum } from 'openai';
const routes: FastifyPluginAsync<FastifyPluginOptions> = async(
    fastify: FastifyInstance) => {
    
    type PromptMessage = {
        content: string;
        role:ChatCompletionRequestMessageRoleEnum;
    };
    fastify.get('/', async () => {
        const user = new User({
            name: 'test',
            email: 'test@gmail.com',
            password: 'test',
            avatar: 'test',
        });
        const userData = await user.save();
        return userData;
    });
    }

export default fp(routes);
