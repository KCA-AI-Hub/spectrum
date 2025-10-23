import OpenAI from 'openai';
import { usageTracker } from '@/lib/ai/usage-tracker';

// OpenAI 클라이언트 인스턴스
let openaiClient: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured in environment variables');
    }

    openaiClient = new OpenAI({
      apiKey,
    });
  }

  return openaiClient;
}

async function logAPIUsage(
  operation: string,
  model: string,
  usage: OpenAI.CompletionUsage | null | undefined,
  responseTime: number,
  status: 'success' | 'error',
  errorMessage?: string
) {
  try {
    if (usage) {
      await usageTracker.logUsage({
        operation,
        model,
        promptTokens: usage.prompt_tokens || 0,
        completionTokens: usage.completion_tokens || 0,
        totalTokens: usage.total_tokens || 0,
        responseTime,
        status,
        errorMessage
      });
    }
  } catch (error) {
    console.error('Failed to log API usage:', error);
  }
}

// 텍스트 요약 생성
export async function generateSummary(
  content: string,
  options?: {
    type?: 'short' | 'medium' | 'long' | 'bullet_points' | 'keywords_only';
    model?: string;
    maxTokens?: number;
  }
) {
  const startTime = Date.now();
  const model = options?.model || 'gpt-4';

  try {
    const client = getOpenAIClient();

    const summaryPrompts = {
      short: '다음 텍스트를 2-3문장으로 간략하게 요약해주세요.',
      medium: '다음 텍스트를 1-2문단으로 중간 길이로 요약해주세요.',
      long: '다음 텍스트를 상세하게 요약해주세요. 주요 포인트와 세부사항을 포함해주세요.',
      bullet_points: '다음 텍스트의 주요 내용을 불릿 포인트 형태로 정리해주세요.',
      keywords_only: '다음 텍스트에서 주요 키워드들을 추출해주세요.',
    };

    const prompt = summaryPrompts[options?.type || 'medium'];

    const response = await client.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: '당신은 전문적인 텍스트 요약 전문가입니다. 한국어로 응답해주세요.',
        },
        {
          role: 'user',
          content: `${prompt}\n\n텍스트:\n${content}`,
        },
      ],
      max_tokens: options?.maxTokens || 500,
      temperature: 0.3,
    });

    const summary = response.choices[0]?.message?.content;
    const responseTime = (Date.now() - startTime) / 1000;

    await logAPIUsage('summary_generation', model, response.usage, responseTime, 'success');

    return {
      success: true,
      summary,
      usage: response.usage,
      error: null,
    };
  } catch (error) {
    const responseTime = (Date.now() - startTime) / 1000;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    await logAPIUsage('summary_generation', model, null, responseTime, 'error', errorMessage);

    console.error('OpenAI summary generation error:', error);
    return {
      success: false,
      summary: null,
      usage: null,
      error: errorMessage,
    };
  }
}

// 키워드 추출
export async function extractKeywords(
  content: string,
  options?: {
    count?: number;
    model?: string;
  }
) {
  try {
    const client = getOpenAIClient();

    const response = await client.chat.completions.create({
      model: options?.model || 'gpt-4',
      messages: [
        {
          role: 'system',
          content: '당신은 텍스트에서 주요 키워드를 추출하는 전문가입니다. 한국어로 응답해주세요.',
        },
        {
          role: 'user',
          content: `다음 텍스트에서 가장 중요한 키워드 ${options?.count || 5}개를 추출해주세요. 키워드는 쉼표로 구분해서 나열해주세요.\n\n텍스트:\n${content}`,
        },
      ],
      max_tokens: 200,
      temperature: 0.2,
    });

    const keywords = response.choices[0]?.message?.content;

    return {
      success: true,
      keywords,
      usage: response.usage,
      error: null,
    };
  } catch (error) {
    console.error('OpenAI keyword extraction error:', error);
    return {
      success: false,
      keywords: null,
      usage: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// 감정 분석
export async function analyzeSentiment(
  content: string,
  options?: {
    model?: string;
  }
) {
  try {
    const client = getOpenAIClient();

    const response = await client.chat.completions.create({
      model: options?.model || 'gpt-4',
      messages: [
        {
          role: 'system',
          content: '당신은 텍스트의 감정을 분석하는 전문가입니다. 감정을 "긍정적", "부정적", "중립적" 중 하나로 분류하고, 신뢰도를 0-1 사이의 숫자로 제공해주세요.',
        },
        {
          role: 'user',
          content: `다음 텍스트의 감정을 분석해주세요. 응답 형식: "감정: [긍정적/부정적/중립적], 신뢰도: [0-1 숫자]"\n\n텍스트:\n${content}`,
        },
      ],
      max_tokens: 100,
      temperature: 0.1,
    });

    const sentiment = response.choices[0]?.message?.content;

    return {
      success: true,
      sentiment,
      usage: response.usage,
      error: null,
    };
  } catch (error) {
    console.error('OpenAI sentiment analysis error:', error);
    return {
      success: false,
      sentiment: null,
      usage: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// 주제 분류
export async function classifyTopic(
  content: string,
  options?: {
    categories?: string[];
    model?: string;
  }
) {
  try {
    const client = getOpenAIClient();

    const defaultCategories = [
      '정치',
      '경제',
      '사회',
      '문화',
      '과학기술',
      '스포츠',
      '국제',
      '건강',
      '환경',
      '교육',
      '기타'
    ];

    const categories = options?.categories || defaultCategories;

    const response = await client.chat.completions.create({
      model: options?.model || 'gpt-4',
      messages: [
        {
          role: 'system',
          content: '당신은 텍스트의 주제를 분류하는 전문가입니다. 주어진 카테고리 중에서 가장 적합한 주제를 선택하고, 신뢰도를 제공해주세요.',
        },
        {
          role: 'user',
          content: `다음 텍스트의 주제를 분류해주세요.

카테고리: ${categories.join(', ')}

응답은 다음 JSON 형식으로 작성해주세요:
{
  "primaryTopic": "주요 주제",
  "secondaryTopics": ["부차적 주제1", "부차적 주제2"],
  "confidence": 0.95,
  "reasoning": "분류 근거"
}

텍스트:\n${content}`,
        },
      ],
      max_tokens: 300,
      temperature: 0.2,
    });

    const classification = response.choices[0]?.message?.content;

    return {
      success: true,
      classification,
      usage: response.usage,
      error: null,
    };
  } catch (error) {
    console.error('OpenAI topic classification error:', error);
    return {
      success: false,
      classification: null,
      usage: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// 퀴즈 문제 생성
export async function generateQuiz(
  content: string,
  options?: {
    questionCount?: number;
    questionTypes?: ('multiple_choice' | 'true_false' | 'fill_blank' | 'short_answer')[];
    difficulty?: 'easy' | 'medium' | 'hard';
    model?: string;
  }
) {
  try {
    const client = getOpenAIClient();

    const response = await client.chat.completions.create({
      model: options?.model || 'gpt-4',
      messages: [
        {
          role: 'system',
          content: '당신은 교육용 퀴즈를 만드는 전문가입니다. 주어진 텍스트를 바탕으로 학습 효과가 높은 문제를 생성해주세요.',
        },
        {
          role: 'user',
          content: `다음 텍스트를 바탕으로 ${options?.questionCount || 5}개의 퀴즈 문제를 만들어주세요.

난이도: ${options?.difficulty || 'medium'}
문제 유형: ${options?.questionTypes?.join(', ') || '객관식, 참/거짓'}

각 문제는 다음 JSON 형식으로 작성해주세요:
{
  "question": "문제",
  "type": "multiple_choice|true_false|fill_blank|short_answer",
  "options": ["선택지1", "선택지2", "선택지3", "선택지4"], // 객관식일 때만
  "correctAnswer": "정답",
  "explanation": "해설"
}

텍스트:\n${content}`,
        },
      ],
      max_tokens: 1000,
      temperature: 0.4,
    });

    const quiz = response.choices[0]?.message?.content;

    return {
      success: true,
      quiz,
      usage: response.usage,
      error: null,
    };
  } catch (error) {
    console.error('OpenAI quiz generation error:', error);
    return {
      success: false,
      quiz: null,
      usage: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// 비디오 프롬프트 생성
export async function generateVideoPrompt(
  content: string,
  options?: {
    style?: string;
    format?: string;
    duration?: number;
    keywords?: string[];
    tone?: 'professional' | 'casual' | 'energetic' | 'calm' | 'dramatic';
    targetAudience?: string;
    customTemplate?: string;
    model?: string;
  }
) {
  const startTime = Date.now();
  const model = options?.model || 'gpt-4';

  try {
    const client = getOpenAIClient();

    const styleDescriptions: Record<string, string> = {
      MODERN: '현대적이고 세련된 스타일로, 깔끔한 전환 효과와 미니멀한 디자인',
      MINIMAL: '미니멀하고 간결한 스타일로, 단순하고 우아한 애니메이션',
      BOLD: '대담하고 생동감 넘치는 스타일로, 강렬한 색상과 역동적인 움직임',
      ELEGANT: '우아하고 고급스러운 스타일로, 부드러운 전환과 세련된 효과',
      PLAYFUL: '재미있고 활기찬 스타일로, 다이나믹한 애니메이션과 밝은 분위기'
    };

    const formatDescriptions: Record<string, string> = {
      VERTICAL: '세로형 (9:16) - 모바일 최적화, TikTok/Instagram Reels용',
      HORIZONTAL: '가로형 (16:9) - 데스크톱 및 TV 최적화, YouTube용',
      SQUARE: '정사각형 (1:1) - 소셜 미디어 피드 최적화'
    };

    const toneDescriptions: Record<string, string> = {
      professional: '전문적이고 신뢰감 있는 톤',
      casual: '편안하고 친근한 톤',
      energetic: '활기차고 역동적인 톤',
      calm: '차분하고 안정적인 톤',
      dramatic: '극적이고 감성적인 톤'
    };

    const styleDesc = options?.style ? styleDescriptions[options.style] || options.style : '현대적인 스타일';
    const formatDesc = options?.format ? formatDescriptions[options.format] || options.format : '세로형 모바일 포맷';
    const toneDesc = options?.tone ? toneDescriptions[options.tone] : '전문적인 톤';

    let systemPrompt = '당신은 Text-to-Video AI를 위한 프롬프트를 작성하는 전문가입니다. 주어진 텍스트 콘텐츠를 시각적으로 매력적인 비디오로 변환하기 위한 상세하고 구체적인 프롬프트를 생성해주세요.';

    let userPrompt = `다음 콘텐츠를 바탕으로 ${options?.duration || 30}초 길이의 숏폼 비디오를 생성하기 위한 프롬프트를 작성해주세요.

비디오 스타일: ${styleDesc}
비디오 포맷: ${formatDesc}
영상 톤: ${toneDesc}
${options?.targetAudience ? `타겟 오디언스: ${options.targetAudience}` : ''}
${options?.keywords && options.keywords.length > 0 ? `핵심 키워드: ${options.keywords.join(', ')}` : ''}

원본 콘텐츠:
${content}

프롬프트 작성 지침:
1. 비디오의 각 장면을 구체적으로 묘사하세요
2. 시각적 요소 (색상, 조명, 구도)를 명확히 기술하세요
3. 텍스트 오버레이가 필요한 부분을 표시하세요
4. 전환 효과와 애니메이션 스타일을 지정하세요
5. 전체적인 분위기와 느낌을 전달하세요

프롬프트는 명확하고 구체적으로 작성해주세요. Text-to-Video AI가 이해하기 쉽도록 영어로 작성하되, 필요한 경우 한글 텍스트는 그대로 유지해주세요.`;

    if (options?.customTemplate) {
      userPrompt = options.customTemplate.replace('{{content}}', content);
    }

    const response = await client.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      max_tokens: 800,
      temperature: 0.7,
    });

    const prompt = response.choices[0]?.message?.content;
    const responseTime = (Date.now() - startTime) / 1000;

    await logAPIUsage('video_prompt_generation', model, response.usage, responseTime, 'success');

    return {
      success: true,
      prompt,
      usage: response.usage,
      error: null,
    };
  } catch (error) {
    const responseTime = (Date.now() - startTime) / 1000;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    await logAPIUsage('video_prompt_generation', model, null, responseTime, 'error', errorMessage);

    console.error('OpenAI video prompt generation error:', error);
    return {
      success: false,
      prompt: null,
      usage: null,
      error: errorMessage,
    };
  }
}