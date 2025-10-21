import { ConversationMessage, VoiceState } from '../types';
import { getOpenAIToken } from './api';

/**
 * OpenAI Realtime API Service
 * Handles real-time voice conversations using OpenAI's Realtime API
 */
export class OpenAIRealtimeService {
  private ws: WebSocket | null = null;
  private ephemeralToken: string | null = null;
  private conversationId: string | null = null;
  private transcript: ConversationMessage[] = [];
  private isConnected = false;
  private audioContext: AudioContext | null = null;

  // Event callbacks
  public onTranscriptUpdate?: (transcript: ConversationMessage[]) => void;
  public onVoiceStateChange?: (state: VoiceState) => void;
  public onError?: (error: Error) => void;
  public onAudioResponse?: (audioData: ArrayBuffer) => void;

  private voiceState: VoiceState = {
    isListening: false,
    isProcessing: false,
    isSpeaking: false,
  };

  /**
   * Initialize the service with an ephemeral token
   */
  async initialize(): Promise<void> {
    try {
      console.log('Initializing OpenAI Realtime service...');

      // Get ephemeral token from backend
      const tokenResponse = await getOpenAIToken();
      this.ephemeralToken = tokenResponse.token;

      console.log('Ephemeral token obtained');
    } catch (error) {
      console.error('Failed to initialize OpenAI Realtime service:', error);
      this.handleError(error as Error);
      throw error;
    }
  }

  /**
   * Connect to OpenAI Realtime API via WebSocket
   */
  async connect(): Promise<void> {
    if (!this.ephemeralToken) {
      throw new Error('Service not initialized. Call initialize() first.');
    }

    try {
      console.log('Connecting to OpenAI Realtime API...');

      // Note: The actual WebSocket URL for OpenAI Realtime API
      // This is a placeholder - update with the actual endpoint when available
      const wsUrl = `wss://api.openai.com/v1/realtime?token=${this.ephemeralToken}`;

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = this.handleWebSocketOpen.bind(this);
      this.ws.onmessage = this.handleWebSocketMessage.bind(this);
      this.ws.onerror = this.handleWebSocketError.bind(this);
      this.ws.onclose = this.handleWebSocketClose.bind(this);
    } catch (error) {
      console.error('Failed to connect to OpenAI Realtime API:', error);
      this.handleError(error as Error);
      throw error;
    }
  }

  /**
   * Start a new conversation
   */
  async startConversation(): Promise<void> {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      console.log('Starting conversation...');

      // Initialize audio context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Configure session
      this.sendEvent({
        type: 'session.update',
        session: {
          modalities: ['text', 'audio'],
          instructions:
            'You are a warm, empathetic AI companion for elderly individuals. ' +
            'Your role is to engage in friendly, natural conversation, suggest activities ' +
            'based on their interests, and provide emotional support. Always maintain a ' +
            'warm, caring tone and speak slowly and clearly.',
          voice: 'alloy',
          input_audio_format: 'pcm16',
          output_audio_format: 'pcm16',
          input_audio_transcription: {
            model: 'whisper-1',
          },
          turn_detection: {
            type: 'server_vad',
            threshold: 0.5,
            prefix_padding_ms: 300,
            silence_duration_ms: 200,
          },
          temperature: 0.8,
        },
      });

      this.updateVoiceState({ isListening: true });
    } catch (error) {
      console.error('Failed to start conversation:', error);
      this.handleError(error as Error);
      throw error;
    }
  }

  /**
   * Send audio data to the API
   */
  sendAudio(audioData: ArrayBuffer): void {
    if (!this.isConnected || !this.ws) {
      console.warn('Cannot send audio: not connected');
      return;
    }

    try {
      // Convert audio data to base64
      const base64Audio = this.arrayBufferToBase64(audioData);

      this.sendEvent({
        type: 'input_audio_buffer.append',
        audio: base64Audio,
      });

      this.updateVoiceState({ isProcessing: true });
    } catch (error) {
      console.error('Failed to send audio:', error);
      this.handleError(error as Error);
    }
  }

  /**
   * Send text message
   */
  sendText(text: string): void {
    if (!this.isConnected || !this.ws) {
      console.warn('Cannot send text: not connected');
      return;
    }

    try {
      this.sendEvent({
        type: 'conversation.item.create',
        item: {
          type: 'message',
          role: 'user',
          content: [
            {
              type: 'input_text',
              text,
            },
          ],
        },
      });

      // Add to transcript
      this.addToTranscript('user', text);

      // Request response
      this.sendEvent({
        type: 'response.create',
      });

      this.updateVoiceState({ isProcessing: true });
    } catch (error) {
      console.error('Failed to send text:', error);
      this.handleError(error as Error);
    }
  }

  /**
   * End the current conversation
   */
  async endConversation(): Promise<ConversationMessage[]> {
    console.log('Ending conversation...');

    this.updateVoiceState({
      isListening: false,
      isProcessing: false,
      isSpeaking: false,
    });

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    if (this.audioContext) {
      await this.audioContext.close();
      this.audioContext = null;
    }

    this.isConnected = false;

    return this.transcript;
  }

  /**
   * Get current transcript
   */
  getTranscript(): ConversationMessage[] {
    return this.transcript;
  }

  /**
   * Handle WebSocket open event
   */
  private handleWebSocketOpen(): void {
    console.log('WebSocket connected to OpenAI Realtime API');
    this.isConnected = true;
  }

  /**
   * Handle WebSocket message event
   */
  private handleWebSocketMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data);

      console.log('Received message:', message.type);

      switch (message.type) {
        case 'session.created':
          console.log('Session created:', message.session);
          break;

        case 'conversation.item.created':
          this.handleConversationItemCreated(message);
          break;

        case 'response.audio.delta':
          this.handleAudioDelta(message);
          break;

        case 'response.audio_transcript.delta':
          this.handleAudioTranscriptDelta(message);
          break;

        case 'response.done':
          this.handleResponseDone();
          break;

        case 'input_audio_buffer.speech_started':
          this.updateVoiceState({ isListening: true, isProcessing: false });
          break;

        case 'input_audio_buffer.speech_stopped':
          this.updateVoiceState({ isListening: false, isProcessing: true });
          break;

        case 'error':
          this.handleError(new Error(message.error?.message || 'Unknown error'));
          break;

        default:
          console.log('Unhandled message type:', message.type);
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
      this.handleError(error as Error);
    }
  }

  /**
   * Handle conversation item created
   */
  private handleConversationItemCreated(message: any): void {
    const item = message.item;

    if (item.type === 'message' && item.role === 'assistant') {
      const content = item.content?.[0];
      if (content?.type === 'text') {
        this.addToTranscript('assistant', content.text);
      }
    }
  }

  /**
   * Handle audio delta
   */
  private handleAudioDelta(message: any): void {
    if (message.delta && this.onAudioResponse) {
      // Convert base64 audio to ArrayBuffer
      const audioBuffer = this.base64ToArrayBuffer(message.delta);
      this.onAudioResponse(audioBuffer);

      this.updateVoiceState({ isSpeaking: true, isProcessing: false });
    }
  }

  /**
   * Handle audio transcript delta
   */
  private handleAudioTranscriptDelta(message: any): void {
    if (message.delta) {
      // Update transcript with partial response
      console.log('Partial transcript:', message.delta);
    }
  }

  /**
   * Handle response done
   */
  private handleResponseDone(): void {
    console.log('Response complete');
    this.updateVoiceState({
      isListening: true,
      isProcessing: false,
      isSpeaking: false,
    });
  }

  /**
   * Handle WebSocket error
   */
  private handleWebSocketError(error: Event): void {
    console.error('WebSocket error:', error);
    this.handleError(new Error('WebSocket connection error'));
  }

  /**
   * Handle WebSocket close event
   */
  private handleWebSocketClose(event: CloseEvent): void {
    console.log('WebSocket closed:', event.code, event.reason);
    this.isConnected = false;

    this.updateVoiceState({
      isListening: false,
      isProcessing: false,
      isSpeaking: false,
    });
  }

  /**
   * Send event to WebSocket
   */
  private sendEvent(event: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(event));
    }
  }

  /**
   * Add message to transcript
   */
  private addToTranscript(role: 'user' | 'assistant', content: string): void {
    const message: ConversationMessage = {
      role,
      content,
      timestamp: new Date().toISOString(),
    };

    this.transcript.push(message);

    if (this.onTranscriptUpdate) {
      this.onTranscriptUpdate([...this.transcript]);
    }
  }

  /**
   * Update voice state
   */
  private updateVoiceState(updates: Partial<VoiceState>): void {
    this.voiceState = {
      ...this.voiceState,
      ...updates,
    };

    if (this.onVoiceStateChange) {
      this.onVoiceStateChange({ ...this.voiceState });
    }
  }

  /**
   * Handle error
   */
  private handleError(error: Error): void {
    console.error('OpenAI Realtime service error:', error);

    if (this.onError) {
      this.onError(error);
    }
  }

  /**
   * Convert ArrayBuffer to base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Convert base64 to ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }
}

export default new OpenAIRealtimeService();
