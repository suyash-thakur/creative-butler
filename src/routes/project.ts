import { FastifyInstance, FastifyRequest, fastify } from 'fastify';
import { FastifyPluginAsync, FastifyPluginOptions } from 'fastify';
import type { FastifyRequest as IncomingMessage, FastifyReply as ServerResponse } from 'fastify';
import { getProjectPrompt } from '../service/gpt/prompt';
import fp from 'fastify-plugin';
import userDecorator from '../plugins/decorate_user';

import Project from '../model/project';
import type { Project as ProjectType } from '../model/project';
import type { User as UserType } from '../model/user';

type decoratedUser = { _id: string } & UserType;

declare module 'fastify' {
	interface FastifyRequest {
		user: decoratedUser;
	}
}

const createProjectHandler = async (request: FastifyRequest) => {
	const { name, type, description, status, targetAudience, targetAge, targetGender, goals, keywords, brandIdentity, brandVoice, toneOfVoice } = request.body as ProjectType;
	const { user } = request;
	if (!user) throw new Error('User not found');
	const project = new Project({
		name,
		type,
		description,
		status,
		targetAudience,
		targetAge,
		targetGender,
		goals,
		keywords,
		brandIdentity,
		brandVoice,
		userId: user._id,
		toneOfVoice,
	});
	const projectData = await project.save();
	return projectData;
}

const getProjectHandler = async (request: FastifyRequest) => {
	const { id } = request.params as { id: string };
	const { user } = request;
	const project = await Project.findOne({ _id: id, userId: user._id });
	if (!project) throw new Error('Project not found');
	return project;
}

const updateProjectHandler = async (request: FastifyRequest) => {
	const { id } = request.params as { id: string };
	const { user } = request;
	if (!user) throw new Error('User not found');
	const { name, type, description, status, targetAudience, targetAge, targetGender, goals, keywords, brandIdentity, brandVoice, toneOfVoice } = request.body as ProjectType;
	const project = await Project.findOneAndUpdate(
		{ _id: id, userId: user._id },
		{ name, type, description, status, targetAudience, targetAge, targetGender, goals, keywords, brandIdentity, brandVoice, toneOfVoice },
		{ new: true }
	);

	if (!project) throw new Error('Project not found');
	return project;
}

const deleteProjectHandler = async (request: IncomingMessage) => {
	const { id } = request.params as { id: string };
	const { user } = request;
	if (!user) throw new Error('User not found');
	await Project.findOneAndDelete({ _id: id, userId: user._id });
	return { message: 'Project deleted successfully' };
}

const getPrompt = async () => {
	const project = await Project.findOne({ name: 'Project 1' });
	const prompt = getProjectPrompt(JSON.parse(JSON.stringify(project)) as ProjectType);
	return { prompt };
};

const routes: FastifyPluginAsync<FastifyPluginOptions> = async (
	fastify: FastifyInstance
) => {
	// await fastify.register(userDecorator);
	fastify.get('/projects/:id', getProjectHandler);
	fastify.post('/projects', createProjectHandler);
	fastify.put('/projects/:id', updateProjectHandler);
	fastify.delete('/projects/:id', deleteProjectHandler);
	fastify.get('/prompt', getPrompt);
};


export default fp(routes);
