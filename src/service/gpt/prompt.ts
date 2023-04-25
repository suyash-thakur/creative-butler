import { ChatCompletionRequestMessageRoleEnum } from 'openai';
import type { Project as ProjectType } from '../../model/project';

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
  project: {
    content: 'The following is the details of the project\n {0}',
    role: 'user',
    variableNumber: 1
  }
}
export type Section = {
  name: string;
  subSections: Array<Section>;
}

export const websiteSections = [
  {
    name: 'Home',
    subSections: [
      {
        name: 'Hero',
        subSections: [
          {
            name: 'Title',
            subSections: []
          },
          {
            name: 'Subtitle',
            subSections: []
          },
          {
            name: 'CTA',
            subSections: []
          }
        ]
      },
      {
        name: 'About',
        subSections: [
          {
            name: 'Title',
            subSections: []
          },
          {
            name: 'Subtitle',
            subSections: []
          },
          {
            name: 'Content',
            subSections: []
          },
          {
            name: 'CTA',
            subSections: []
          }
        ]
      },
      {
        name: 'Services',
        subSections: [
          {
            name: 'Title',
            subSections: []
          },
          {
            name: 'Subtitle',
            subSections: []
          },
          {
            name: 'Content',
            subSections: []
          },
          {
            name: 'CTA',
            subSections: []
          }
        ]
      },
      {
        name: 'Testimonials',
        subSections: [
          {
            name: 'Title',
            subSections: []
          },
          {
            name: 'Subtitle',
            subSections: []
          },
          {
            name: 'Content',
            subSections: []
          },
          {
            name: 'CTA',
            subSections: []
          }
        ]
      },
      {
        name: 'Contact',
        subSections: [
          {
            name: 'Title',
            subSections: []
          },
          {
            name: 'Subtitle',
            subSections: []
          },
          {
            name: 'Content',
            subSections: []
          },
          {
            name: 'CTA',
            subSections: []
          }
        ]
      }
    ]
  },
];

const projectPromptWhiteListProperties = [
  'name',
  'type',
  'description',
  'status',
  'targetAudience',
  'targetAge',
  'targetGender',
  'goals',
  'keywords',
  'brandIdentity',
  'brandVoice',
  'toneOfVoice'
];

const getSubSectionPrompt = (sectionName: string, subSections: Array<Section>) => {
  let prompt = `\t the following is the sub-sections of the ${sectionName}\n`;
  for (const subSection of subSections) {
    prompt += `\t\t ${subSection.name}`;
    if (subSection.subSections.length) {
      prompt += getSubSectionPrompt(subSection.name, subSection.subSections);
    }
  }
  return prompt;
};

export const getWebsiteSectionPrompt = (sections: Array<Section>) => {
  let prompt = 'the following is the website structure\n';
  for (const section of sections) {
    prompt += `**${section.name}**`;
    if (section.subSections.length) {
      prompt += getSubSectionPrompt(section.name, section.subSections);
    }
  }
  return prompt;
};


const getMessage = (key: string, variables: Array<string>) => {
  try {
    const promptMessage = promptMap[key];
    if (!promptMessage.variableNumber) {
      promptMessage.variableNumber = variables.length;
    }
    if (!promptMessage) {
      throw new Error('No prompt message found');
    }
    if (variables.length !== promptMessage.variableNumber) {
      throw new Error('Variable number does not match');
    }
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

export const getProjectPrompt = (project: ProjectType) => {
  const variables: Array<string> = [];
  for (const key in project) {
    if (!projectPromptWhiteListProperties.includes(key)) {
      continue;
    }
    // eslint-disable-next-line no-prototype-builtins
    if (project.hasOwnProperty(key)) {
      const value = project[key as keyof ProjectType];
      if (typeof value === 'string') {
        variables.push(`${key}: ${value}`);
      } else if (Array.isArray(value)) {
        variables.push(`${key}: ${value.join(', ')}`);
      }
    }
  }

  return getMessage('project', [variables.join('\n ')]);
};

export default getMessage;
