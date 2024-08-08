import { openai } from '@ai-sdk/openai';
import { streamText, StreamData } from 'ai';
import { NextResponse } from 'next/server';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const data = new StreamData();
    data.append({ test: 'value' });

    const result = await streamText({
        model: openai('gpt-4-turbo'),
        messages,
        onFinish() {
        data.close();
        },
    });

    return result.toDataStreamResponse({ data });
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}