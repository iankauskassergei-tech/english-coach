'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const CONVERSATION_TOPICS = [
  'Describe your ideal remote work setup and why it helps you stay productive.',
  'Talk about a challenging project you worked on and how you handled it.',
  'What are the pros and cons of working from home versus working in an office?',
  'Explain a technical concept you recently learned to someone non-technical.',
  'Discuss how you prioritize tasks when you have multiple deadlines.',
  'Describe a time you had to communicate bad news to a teammate or client.',
  'What skills do you think are most important for a successful remote career?',
  'Talk about a book, podcast, or article that influenced your professional growth.',
  'How do you handle misunderstandings in written communication (Slack, email)?',
  'Describe your morning routine and how it prepares you for the workday.',
  'What would you do in your first 90 days at a new company?',
  'Discuss a hobby you enjoy and how it relates to skills you use at work.',
  'How do you stay motivated when working on a long, repetitive task?',
  'Talk about a cultural difference you noticed while working with international teams.',
  'If you could change one thing about how teams collaborate remotely, what would it be?',
];

type SpeechRecognitionConstructor = new () => SpeechRecognition;

function getSpeechRecognition(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null;

  const win = window as Window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };

  return win.SpeechRecognition ?? win.webkitSpeechRecognition ?? null;
}

function pickRandomTopic(exclude?: string): string {
  const pool =
    exclude && CONVERSATION_TOPICS.length > 1
      ? CONVERSATION_TOPICS.filter((topic) => topic !== exclude)
      : CONVERSATION_TOPICS;

  return pool[Math.floor(Math.random() * pool.length)];
}

const OLLAMA_API_URL = 'http://138.124.58.254:11434/api/generate';
const OLLAMA_MODEL = 'llama3.2:1b';

async function getOllamaHttpErrorMessage(response: Response): Promise<string> {
  let detail = '';

  try {
    const body = (await response.json()) as { error?: string };
    if (body.error) {
      detail = `: ${body.error}`;
    }
  } catch {
    // Response body may not be JSON.
  }

  switch (response.status) {
    case 400:
      return `Bad request (400)${detail}`;
    case 404:
      return `Model not found (404)${detail}. Ensure ${OLLAMA_MODEL} is installed on the server.`;
    case 429:
      return 'Too many requests (429). Please try again shortly.';
    case 500:
      return `Server error (500)${detail}`;
    case 502:
      return 'Bad gateway (502). The AI server may be restarting.';
    case 503:
      return 'Service unavailable (503). The AI server is temporarily overloaded.';
    case 504:
      return 'Gateway timeout (504). The model took too long to respond.';
    default:
      return `Request failed with HTTP ${response.status}${detail}`;
  }
}

export function SpeakingPractice() {
  const [topic, setTopic] = useState(() => pickRandomTopic());
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isRecordingRef = useRef(false);
  const transcriptRef = useRef('');
  const interimRef = useRef('');
  const abortControllerRef = useRef<AbortController | null>(null);
  const skipOllamaOnEndRef = useRef(false);

  useEffect(() => {
    setIsSupported(getSpeechRecognition() !== null);
  }, []);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      abortControllerRef.current?.abort();
    };
  }, []);

  const sendToOllama = useCallback(async (prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed) return;

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setAiLoading(true);
    setAiError(null);
    setAiResponse('');

    try {
      const response = await fetch(OLLAMA_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          prompt: trimmed,
          stream: false,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(await getOllamaHttpErrorMessage(response));
      }

      const data = (await response.json()) as { response?: string };

      if (controller.signal.aborted) return;

      if (!data.response?.trim()) {
        throw new Error('The AI server returned an empty response.');
      }

      setAiResponse(data.response.trim());
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      if (controller.signal.aborted) return;

      const message =
        err instanceof TypeError
          ? 'Could not connect to the AI server. Check that Ollama is running and reachable.'
          : err instanceof Error
            ? err.message
            : 'Failed to get AI response.';

      setAiError(message);
    } finally {
      if (!controller.signal.aborted) {
        setAiLoading(false);
      }
    }
  }, []);

  const finalizeTranscript = useCallback(() => {
    const pendingInterim = interimRef.current;
    if (pendingInterim) {
      const finalized = transcriptRef.current + pendingInterim;
      transcriptRef.current = finalized;
      interimRef.current = '';
      setTranscript(finalized);
      setInterimTranscript('');
      return finalized;
    }

    setInterimTranscript('');
    return transcriptRef.current;
  }, []);

  const stopRecording = useCallback(() => {
    isRecordingRef.current = false;
    setIsRecording(false);
    recognitionRef.current?.stop();
  }, []);

  const startRecording = useCallback(() => {
    const SpeechRecognitionAPI = getSpeechRecognition();
    if (!SpeechRecognitionAPI) {
      setIsSupported(false);
      setError('Speech recognition is not supported in this browser. Try Chrome or Edge.');
      return;
    }

    setError(null);
    setTranscript('');
    setInterimTranscript('');
    setAiResponse('');
    setAiError(null);
    transcriptRef.current = '';
    interimRef.current = '';
    abortControllerRef.current?.abort();

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let finalText = '';
      let interimText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;

        if (result.isFinal) {
          finalText += text;
        } else {
          interimText += text;
        }
      }

      if (finalText) {
        setTranscript((prev) => {
          const updated = prev + finalText;
          transcriptRef.current = updated;
          return updated;
        });
      }

      interimRef.current = interimText;
      setInterimTranscript(interimText);
    };

    recognition.onerror = (event) => {
      if (event.error === 'aborted') return;

      const message =
        event.error === 'not-allowed'
          ? 'Microphone access was denied. Please allow microphone permissions.'
          : `Speech recognition error: ${event.error}`;

      setError(message);
      stopRecording();
    };

    recognition.onend = () => {
      if (isRecordingRef.current) {
        try {
          recognition.start();
        } catch {
          stopRecording();
        }
        return;
      }

      const finalText = finalizeTranscript();
      if (!skipOllamaOnEndRef.current) {
        void sendToOllama(finalText);
      }
      skipOllamaOnEndRef.current = false;
    };

    recognitionRef.current = recognition;
    isRecordingRef.current = true;
    setIsRecording(true);

    try {
      recognition.start();
    } catch {
      setError('Could not start recording. Please try again.');
      stopRecording();
    }
  }, [finalizeTranscript, sendToOllama, stopRecording]);

  const generateNewTopic = useCallback(() => {
    skipOllamaOnEndRef.current = true;
    stopRecording();
    setTranscript('');
    setInterimTranscript('');
    setAiResponse('');
    setAiError(null);
    setError(null);
    transcriptRef.current = '';
    interimRef.current = '';
    abortControllerRef.current?.abort();
    setTopic((current) => pickRandomTopic(current));
  }, [stopRecording]);

  const displayText = transcript + interimTranscript;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="text-center py-10 px-6">
        <p className="text-sm font-medium text-[var(--text-secondary)] mb-3">
          Your conversation topic
        </p>
        <p className="text-lg md:text-xl font-semibold leading-relaxed text-[var(--text-primary)]">
          {topic}
        </p>
      </Card>

      <div className="flex justify-center gap-3">
        <Button
          size="lg"
          onClick={startRecording}
          disabled={!isSupported || isRecording}
        >
          Start Recording
        </Button>
        <Button
          size="lg"
          variant="danger"
          onClick={stopRecording}
          disabled={!isRecording}
        >
          Stop
        </Button>
      </div>

      {isRecording && (
        <p className="text-center text-sm text-[var(--accent)] animate-pulse">
          Listening...
        </p>
      )}

      {!isSupported && (
        <p className="text-center text-sm text-[var(--error)]">
          Speech recognition is not supported in this browser. Try Chrome or Edge.
        </p>
      )}

      {error && (
        <p className="text-center text-sm text-[var(--error)]">{error}</p>
      )}

      <Card>
        <p className="text-sm font-medium text-[var(--text-secondary)] mb-3">
          What you said
        </p>
        {displayText ? (
          <p className="text-sm md:text-base leading-relaxed text-[var(--text-primary)] whitespace-pre-wrap">
            {transcript}
            {interimTranscript && (
              <span className="text-[var(--text-muted)]">{interimTranscript}</span>
            )}
          </p>
        ) : (
          <p className="text-sm text-[var(--text-muted)]">
            Your speech will appear here after you start recording.
          </p>
        )}
      </Card>

      {(aiLoading || aiResponse || aiError) && (
        <Card>
          <p className="text-sm font-medium text-[var(--text-secondary)] mb-3">
            AI Response
          </p>
          {aiLoading && (
            <p className="text-sm text-[var(--text-muted)] animate-pulse">
              Analyzing your speech...
            </p>
          )}
          {aiError && (
            <p className="text-sm text-[var(--error)]">{aiError}</p>
          )}
          {!aiLoading && aiResponse && (
            <p className="text-sm md:text-base leading-relaxed text-[var(--text-primary)] whitespace-pre-wrap">
              {aiResponse}
            </p>
          )}
        </Card>
      )}

      <div className="flex justify-center">
        <Button size="lg" variant="secondary" onClick={generateNewTopic}>
          Generate New Topic
        </Button>
      </div>

      <Card>
        <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-2">
          Speaking tips
        </h3>
        <ul className="text-sm text-[var(--text-muted)] space-y-1 list-disc list-inside">
          <li>Speak for 1–2 minutes without stopping.</li>
          <li>Use linking words: however, moreover, on the other hand.</li>
          <li>End with a short summary or personal opinion.</li>
        </ul>
      </Card>
    </div>
  );
}
