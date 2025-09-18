import { convertToModelMessages, generateText } from 'ai';
import { createThirdwebAI } from '@thirdweb-dev/ai-sdk-provider';

export const maxDuration = 300;

const thirdwebAI = createThirdwebAI({
  secretKey: process.env.THIRDWEB_SECRET_KEY!,
});

export async function POST(req: Request) {
  const { messages, id, context } = await req.json();

  const result = await generateText({
    model: thirdwebAI.chat(id, {
      context: {
        chain_ids: context?.chain_ids ?? [137], // Polygon por defecto
        from: context?.from, // opcional
        auto_execute_transactions: context?.auto ?? false,
      },
    }),
    messages: convertToModelMessages(messages),
    tools: thirdwebAI.tools(), // firma tx, swaps, monitor
  });

  return Response.json({
    message: result.text,
    toolCalls: result.toolCalls,
    toolResults: result.toolResults,
  });
}
