'use client';
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
} from 'ai';
import { useChat, type UseChatHelpers } from '@ai-sdk/react';
import type { ThirdwebAiMessage } from '@thirdweb-dev/ai-sdk-provider';
import { TxSignButton } from './TxSignButton';
import { SwapButton } from './SwapButton';
import { MonitorBadge } from './MonitorBadge';

export default function NebulaChat() {
  const { messages, sendMessage, addToolResult, status, input, setInput } =
    useChat<ThirdwebAiMessage>({
      transport: new DefaultChatTransport({ api: '/api/chat' }),
      sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
      maxToolRoundtrips: 4,
    });

  return (
    <div className="space-y-3">
      <div className="rounded-xl border p-3 h-[60vh] overflow-y-auto">
        {messages.map((m) => (
          <RenderMessage key={m.id} message={m} addToolResult={addToolResult} />
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage({ content: input });
          setInput('');
        }}
        className="flex gap-2"
      >
        <input
          className="flex-1 border rounded-lg px-3 py-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe: Swap 0.01 ETH a USDC y envía 10 USDC a vitalik.eth"
        />
        <button
          className="px-4 py-2 rounded-lg bg-black text-white"
          disabled={status !== 'ready'}
        >
          Enviar
        </button>
      </form>
    </div>
  );
}

function RenderMessage({
  message,
  addToolResult,
}: {
  message: ThirdwebAiMessage;
  addToolResult: UseChatHelpers<ThirdwebAiMessage>['addToolResult'];
}) {
  return (
    <div className="mb-3">
      {message.parts.map((part) => {
        switch (part.type) {
          case 'text':
            return <p className="whitespace-pre-wrap">{part.text}</p>;
          case 'reasoning':
            return <p className="text-xs opacity-70">{part.text}</p>;
          case 'tool-sign_transaction': {
            const tx = part.input; // { chain_id, to, data, value }
            return (
              <TxSignButton
                tx={tx}
                onResult={(hash, chainId) =>
                  addToolResult({
                    tool: 'sign_transaction',
                    toolCallId: part.toolCallId,
                    output: { transaction_hash: hash, chain_id: chainId },
                  })
                }
              />
            );
          }
          case 'tool-sign_swap':
            return <SwapButton input={part.input} />;
          case 'tool-monitor_transaction':
            return <MonitorBadge input={part.input} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
