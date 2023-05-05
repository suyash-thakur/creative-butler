import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from 'openai';
import  getMessage  from './prompt';

const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
    basePath: 'https://api.openai.com/v1'
});

const openai = new OpenAIApi(config);


const getPrompt = (trigger: string, variables: Array<string>) => {
    const prompt = getMessage(trigger, variables);
    return prompt;
}

const getChatCompletion = async ( messages  :  Array<ChatCompletionRequestMessage> )=> {
    try {
        if (!messages || messages.length === 0) throw new Error('No messages provided');
        const config = {
            model: 'gpt-3.5-turbo',
            messages,
        }
        const response = await openai.createChatCompletion(config);
        if (!response.data.choices || response.data.choices.length === 0) throw new Error('No response from GPT');
        return response.data.choices[0].message?.content;
    } catch (error) {
        console.error(error);
        return '';
    }
}

export { getPrompt, getChatCompletion };