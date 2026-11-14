"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { COACH_CHAT_MAX_MESSAGE_CHARS, summarizeCoachResult } from "@/lib/coach/chat";
import type { CoachChatMessage, CoachMode, CoachResult } from "@/lib/types";

export interface UseCoachChatParams {
  mode: CoachMode;
  topic: string;
  constraint: string | null;
  cues: string[];
  result: CoachResult | null;
}

export interface UseCoachChatReturn {
  messages: CoachChatMessage[];
  sending: boolean;
  chatError: string | null;
  sendMessage: (rawText: string) => Promise<void>;
  retryLastMessage: () => Promise<void>;
  clearChat: () => void;
  dismissChatError: () => void;
}

function createId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useCoachChat({
  mode,
  topic,
  constraint,
  cues,
  result,
}: UseCoachChatParams): UseCoachChatReturn {
  const [messages, setMessages] = useState<CoachChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const messagesRef = useRef<CoachChatMessage[]>(messages);
  const paramsRef = useRef({ mode, topic, constraint, cues, result });

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    paramsRef.current = { mode, topic, constraint, cues, result };
  }, [mode, topic, constraint, cues, result]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const requestReply = useCallback(async (conversation: CoachChatMessage[]) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setSending(true);
    setChatError(null);

    try {
      const { mode: activeMode, topic: activeTopic, constraint: activeConstraint, cues: activeCues, result: activeResult } =
        paramsRef.current;

      const response = await fetch("/api/coach/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          mode: activeMode,
          topic: activeTopic,
          constraint: activeConstraint,
          cues: activeCues,
          resultSummary: activeResult ? summarizeCoachResult(activeResult) : null,
          messages: conversation.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        reply?: string;
        error?: string;
      };

      if (!response.ok || !data.reply) {
        throw new Error(data.error || "Gagal menerima balasan dari AI Coach.");
      }

      const assistantMsg: CoachChatMessage = {
        id: createId(),
        role: "assistant",
        content: data.reply,
        createdAt: Date.now(),
        kind: "chat",
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      if ((err as { name?: string })?.name === "AbortError") {
        return;
      }
      const message =
        err instanceof Error && err.message
          ? err.message
          : "Tidak bisa menghubungi AI Coach. Coba kirim ulang.";
      setChatError(message);
    } finally {
      if (abortRef.current === controller) {
        setSending(false);
      }
    }
  }, []);

  const sendMessage = useCallback(
    async (rawText: string) => {
      const cleanText = rawText.trim().slice(0, COACH_CHAT_MAX_MESSAGE_CHARS);
      if (!cleanText || sending) return;

      const userMsg: CoachChatMessage = {
        id: createId(),
        role: "user",
        content: cleanText,
        createdAt: Date.now(),
        kind: "chat",
      };

      const nextConversation = [...messagesRef.current, userMsg];
      messagesRef.current = nextConversation;
      setMessages(nextConversation);
      await requestReply(nextConversation);
    },
    [requestReply, sending]
  );

  const retryLastMessage = useCallback(async () => {
    if (sending) return;
    const current = messagesRef.current;
    if (current.length === 0 || current[current.length - 1]?.role !== "user") {
      return;
    }
    await requestReply(current);
  }, [requestReply, sending]);

  const clearChat = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    messagesRef.current = [];
    setMessages([]);
    setChatError(null);
    setSending(false);
  }, []);

  const dismissChatError = useCallback(() => {
    setChatError(null);
  }, []);

  return {
    messages,
    sending,
    chatError,
    sendMessage,
    retryLastMessage,
    clearChat,
    dismissChatError,
  };
}
