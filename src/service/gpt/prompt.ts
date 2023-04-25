import { ChatCompletionRequestMessageRoleEnum } from 'openai';

type PromptMessage = {
  content: string;
  role: ChatCompletionRequestMessageRoleEnum;
  variableNumber: number;
}

type PromptMap = {
  [key: string]: PromptMessage;
}

const promptMap: PromptMap = {
  gpt: {
    content: 'Please enter your name',
    role: 'user',
    variableNumber: 0
  },
}

const getMessage = async (key: string, variables: Array<string>) => {
  try {
    const promptMessage = promptMap[key];
    if (!promptMessage) throw new Error('No prompt message found');
    if(variables.length !== promptMessage.variableNumber) throw new Error('Variable number does not match');
    let content = promptMessage.content;
    for (let i = 0; i < promptMessage.variableNumber; i++) {
      content = content.replace(`{${i}}`, variables[i]);
    }
    return {
      content,
      role: promptMessage.role,
    };
  } catch (error) {
    console.error(error);
  }
}

export default getMessage;