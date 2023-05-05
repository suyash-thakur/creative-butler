import { FastifyInstance } from 'fastify';
import { FastifyPluginAsync, FastifyPluginOptions } from 'fastify';
import type { FastifyRequest as IncomingMessage } from 'fastify';
import { websiteSections, getProjectPrompt, getWebsiteSectionPrompt } from '../service/gpt/prompt';
import { getChatCompletion } from '../service/gpt';
import type { Section as SectionType } from '../service/gpt/prompt';
import fp from 'fastify-plugin';

import Project from '../model/project';
import type { Project as ProjectType } from '../model/project';
import { ChatCompletionRequestMessage } from 'openai';

const getWebsiteSectionsHandler = async () => {
	return { sections: websiteSections };
};

const getProjectPromptHandler = async (request: IncomingMessage) => {
	const { projectId } = request.params as { projectId: string };
	const { sections } = request.body as { sections: SectionType[] };
	const project = await Project.findById(projectId);
	if (!project) throw new Error('Project not found');
	const prompt = getProjectPrompt(JSON.parse(JSON.stringify(project)) as ProjectType);
	const websitePrompt = getWebsiteSectionPrompt(sections);
	const finalPrompt = { content: `${prompt?.content || ''}\n\n${websitePrompt} \n\n Create the copy of these website sections`, role: 'user' }
	const completion = await getChatCompletion([finalPrompt as ChatCompletionRequestMessage]);
	return { completion };
}

const routes: FastifyPluginAsync<FastifyPluginOptions> = async (
	fastify: FastifyInstance
) => {
	// eslint-disable-next-line @typescript-eslint/no-floating-promises
	fastify.register(async (fastify) => { 
		fastify.get('/sections', getWebsiteSectionsHandler);
		fastify.post('/projects/:projectId/prompt', getProjectPromptHandler);
	});

}

export default fp(routes);
