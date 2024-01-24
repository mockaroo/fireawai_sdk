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
    private readonly apiToken;
    private readonly chatbotId;
    private readonly channel;
    private readonly onMessage;
    private readonly host;
    private readonly includeContext;
    chat: any;
    private consumer?;
    private subscription?;
    constructor({ apiToken, chatbotId, onMessage, host, includeContext, }: ChatChannelProps);
    connect(): Promise<void>;
    get apiHost(): string;
    createChat(): Promise<any>;
    disconnect(): void;
    send(message: string): void;
    vote(messageId: string, vote: boolean): void;
}
export {};
