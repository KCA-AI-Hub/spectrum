export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  userPromptTemplate: string;
  variables: string[];
}

export const PROMPT_TEMPLATES: Record<string, PromptTemplate> = {
  keyword_extraction: {
    id: 'keyword_extraction',
    name: 'Keyword Extraction',
    description: 'Extract important keywords from text',
    systemPrompt: '당신은 텍스트에서 주요 키워드를 추출하는 전문가입니다. 한국어로 응답해주세요.',
    userPromptTemplate: '다음 텍스트에서 가장 중요한 키워드 {{count}}개를 추출해주세요. 키워드는 쉼표로 구분해서 나열해주세요.\n\n텍스트:\n{{content}}',
    variables: ['count', 'content']
  },

  topic_classification: {
    id: 'topic_classification',
    name: 'Topic Classification',
    description: 'Classify text into predefined topics',
    systemPrompt: '당신은 텍스트의 주제를 분류하는 전문가입니다. 주어진 카테고리 중에서 가장 적합한 주제를 선택하고, 신뢰도를 제공해주세요.',
    userPromptTemplate: `다음 텍스트의 주제를 분류해주세요.

카테고리: {{categories}}

응답은 다음 JSON 형식으로 작성해주세요:
{
  "primaryTopic": "주요 주제",
  "secondaryTopics": ["부차적 주제1", "부차적 주제2"],
  "confidence": 0.95,
  "reasoning": "분류 근거"
}

텍스트:
{{content}}`,
    variables: ['categories', 'content']
  },

  sentiment_analysis: {
    id: 'sentiment_analysis',
    name: 'Sentiment Analysis',
    description: 'Analyze sentiment of text',
    systemPrompt: '당신은 텍스트의 감정을 분석하는 전문가입니다. 감정을 "긍정적", "부정적", "중립적" 중 하나로 분류하고, 신뢰도를 0-1 사이의 숫자로 제공해주세요.',
    userPromptTemplate: '다음 텍스트의 감정을 분석해주세요. 응답 형식: "감정: [긍정적/부정적/중립적], 신뢰도: [0-1 숫자]"\n\n텍스트:\n{{content}}',
    variables: ['content']
  },

  summary_short: {
    id: 'summary_short',
    name: 'Short Summary',
    description: 'Generate short summary (2-3 sentences)',
    systemPrompt: '당신은 전문적인 텍스트 요약 전문가입니다. 한국어로 응답해주세요.',
    userPromptTemplate: '다음 텍스트를 2-3문장으로 간략하게 요약해주세요.\n\n텍스트:\n{{content}}',
    variables: ['content']
  },

  summary_medium: {
    id: 'summary_medium',
    name: 'Medium Summary',
    description: 'Generate medium-length summary (1-2 paragraphs)',
    systemPrompt: '당신은 전문적인 텍스트 요약 전문가입니다. 한국어로 응답해주세요.',
    userPromptTemplate: '다음 텍스트를 1-2문단으로 중간 길이로 요약해주세요.\n\n텍스트:\n{{content}}',
    variables: ['content']
  },

  summary_long: {
    id: 'summary_long',
    name: 'Long Summary',
    description: 'Generate detailed summary with key points',
    systemPrompt: '당신은 전문적인 텍스트 요약 전문가입니다. 한국어로 응답해주세요.',
    userPromptTemplate: '다음 텍스트를 상세하게 요약해주세요. 주요 포인트와 세부사항을 포함해주세요.\n\n텍스트:\n{{content}}',
    variables: ['content']
  },

  summary_bullet_points: {
    id: 'summary_bullet_points',
    name: 'Bullet Point Summary',
    description: 'Summarize as bullet points',
    systemPrompt: '당신은 전문적인 텍스트 요약 전문가입니다. 한국어로 응답해주세요.',
    userPromptTemplate: '다음 텍스트의 주요 내용을 불릿 포인트 형태로 정리해주세요.\n\n텍스트:\n{{content}}',
    variables: ['content']
  }
};

export function renderPrompt(templateId: string, variables: Record<string, any>): {
  systemPrompt: string;
  userPrompt: string;
} {
  const template = PROMPT_TEMPLATES[templateId];

  if (!template) {
    throw new Error(`Template '${templateId}' not found`);
  }

  let userPrompt = template.userPromptTemplate;

  for (const variable of template.variables) {
    if (!(variable in variables)) {
      throw new Error(`Missing variable '${variable}' for template '${templateId}'`);
    }

    const value = variables[variable];
    const placeholder = `{{${variable}}}`;
    userPrompt = userPrompt.replace(new RegExp(placeholder, 'g'), String(value));
  }

  return {
    systemPrompt: template.systemPrompt,
    userPrompt
  };
}

export function getTemplate(templateId: string): PromptTemplate | undefined {
  return PROMPT_TEMPLATES[templateId];
}

export function listTemplates(): PromptTemplate[] {
  return Object.values(PROMPT_TEMPLATES);
}
