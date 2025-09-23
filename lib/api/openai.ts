import OpenAI from 'openai';

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

// 텍스트 요약 생성
export async function generateSummary(
  content: string,
  options?: {
    type?: 'short' | 'medium' | 'long' | 'bullet_points' | 'keywords_only';
    model?: string;
    maxTokens?: number;
  }
) {
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
      model: options?.model || 'gpt-4',
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

    return {
      success: true,
      summary,
      usage: response.usage,
      error: null,
    };
  } catch (error) {
    console.error('OpenAI summary generation error:', error);
    return {
      success: false,
      summary: null,
      usage: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
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