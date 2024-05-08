import { ESDate } from '../util/types';

export const VERSION = '1.0.0';

/**
 * A response from AI. Can be AI reply, OCR, speech to text, etc.
 */
export type AIResponse = {
  /** the document ID for this response */
  docId: string;

  /** type of this AI response. */
  type: 'AI_REPLY' | 'TRANSCRIPT';

  /** The user that requests an AI response */
  userId: string;
  appId: string;

  status: 'LOADING' | 'SUCCESS' | 'ERROR';

  /** AI response text */
  text?: string;

  /** The request to AI endpoint. Just for record, not indexed. */
  request?: string;

  /** Token stats from AI endpoint response */
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };

  createdAt: ESDate;
  updatedAt?: ESDate;
};

export const examples: AIResponse[] = [
  // AI response example
  {
    userId: 'some-user-id',
    appId: 'line-bot',
    docId: '28d15z6t2y499',
    type: 'AI_REPLY',
    status: 'SUCCESS',
    request: `{"model":"gpt-3.5-turbo","messages":[{"role":"system","content":"今天是2023年4月1日。你是協助讀者進行媒體識讀的小幫手。你說話時總是使用台灣繁體中文。有讀者傳了一則網路訊息給你。"},{"role":"user","content":"馬英九的祭文如下\n\n親愛的立安公公：您好！我是英九，您老人家的孫兒，爸爸鶴凌公的長子。"},{"role":"user","content":"請問作為閱聽人，我應該注意這則訊息的哪些地方呢？\n請節錄訊息中需要特別留意的地方，說明為何閱聽人需要注意它，謝謝。"}]}`,
    createdAt: '2023-04-01T22:26:16.225Z',
    usage: {
      promptTokens: 1531,
      totalTokens: 1876,
      completionTokens: 345,
    },
    text: `
1. 資訊來源：這篇訊息的資訊來源需要確認是否可信。例如，作者的身分是否可考，訊息的發佈平台是否可信等。如果無法確認訊息來源，則需要小心評估訊息的可信度。

2. 時間：訊息中提到了目前的日期以及歷史事件，需要注意其是否與實際情況相符。例如，訊息提到的日期是否正確，歷史事件的時間、地點等是否符合事實。
`,
    updatedAt: '2023-04-01T22:26:34.227Z',
  },
  // Transcript example
  {
    userId: 'some-user-id',
    appId: 'line-bot',
    status: 'SUCCESS',
    createdAt: '2023-09-02T16:27:30.167Z',
    type: 'TRANSCRIPT',
    docId: 'video.j4v21_q-3k4sIGXTda6J32MhJRXTIqs9GVCpZBfYdxM',
    text: '鬧大了。俄羅斯在聯合國公開宣稱武力介入日本核污染問題。',
    updatedAt: '2023-09-02T16:27:41.883Z',
  },
];

export default {
  properties: {
    docId: { type: 'keyword' },

    type: { type: 'keyword' },

    userId: { type: 'keyword' },
    appId: { type: 'keyword' },

    status: { type: 'keyword' },

    text: { type: 'text', analyzer: 'cjk_url_email' },

    request: { type: 'keyword', index: false, doc_values: false },

    usage: {
      type: 'object',
      properties: {
        promptTokens: { type: 'long' },
        completionTokens: { type: 'long' },
        totalTokens: { type: 'long' },
      },
    },

    createdAt: { type: 'date' },
    updatedAt: { type: 'date' },
  },
};
