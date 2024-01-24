import { Consumer, Subscription, createConsumer } from "@rails/actioncable";

type Message = {
  /**
   * The internal id of the message
   */
  id: string;

  /**
   * The message text
   */
  content: string;

  /**
   * Whether the message was sent by the user or the assistant
   */
  role: "user" | "assistant";

  /**
   * The utc timestamp when the message was created
   */
  created_at: string;

  /**
   * The number of tokens the message costs
   */
  tokens: number;

  /**
   * The estimated cost of the message in USD
   */
  cost: number;

  /**
   * True when all content has been received, otherwise false
   */
  finished: boolean;

  /**
   * The document chunks that were retreived and injected into the user prompt as "{{docs}}".
   * This is only present when the message is an assistant message, finished is true, and
   * the ChatChannel was created with the includeConyext option set to true.
   */
  context: string;
};

type ChatChannelProps = {
  apiToken: string;
  chatbotId: string;
  onMessage: (message: Message) => void;
  host?: string;
  includeContext?: boolean;
};

export default class ChatChannel {
  private readonly apiToken: string;
  private readonly chatbotId: string;
  private readonly channel: string;
  private readonly onMessage: (message: Message) => void;
  private readonly host: string;
  private readonly includeContext: boolean;

  chat: any;
  private consumer?: Consumer;
  private subscription?: Subscription<any>;

  constructor({
    apiToken,
    chatbotId,
    onMessage,
    host = "www.fireaw.ai",
    includeContext = false,
  }: ChatChannelProps) {
    this.apiToken = apiToken;
    this.chatbotId = chatbotId;
    this.channel = "ChatChannel";
    this.onMessage = onMessage;
    this.host = host;
    this.includeContext = includeContext;
  }

  async connect() {
    this.chat = await this.createChat();

    // Show the greeting(s)
    this.chat.messages.forEach((message: Message) => this.onMessage(message));

    this.consumer = createConsumer(
      `ws${this.host.startsWith("localhost") ? "" : "s"}://${this.host}/cable`
    );

    this.subscription = this.consumer.subscriptions.create(
      {
        channel: this.channel,
        id: this.chat.id,
      },
      {
        received: (data: any) => {
          if (data.message) {
            this.onMessage(data.message);
          }
        },
      }
    );
  }

  get apiHost() {
    return `http${this.host.startsWith("localhost") ? "" : "s"}://${this.host}`;
  }

  async createChat() {
    const res = await fetch(`${this.apiHost}/api/v1/chats`, {
      method: "POST",
      body: JSON.stringify({
        chat: {
          collection_id: this.chatbotId,
          include_context: this.includeContext,
        },
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: this.apiToken,
      },
    });

    if (res.ok) {
      return await res.json();
    } else {
      throw new Error("Failed to create chat:" + (await res.text()));
    }
  }

  disconnect() {
    this.subscription?.unsubscribe();
  }

  send(message: string) {
    this.subscription?.send({
      command: "message",
      identifier: JSON.stringify({ channel: this.channel, id: this.chat.id }),
      data: message,
    });
  }

  vote(messageId: string, vote: boolean) {
    this.subscription?.send({
      command: "vote",
      identifier: JSON.stringify({ channel: this.channel, id: this.chat.id }),
      message_id: messageId,
      vote,
    });
  }
}
