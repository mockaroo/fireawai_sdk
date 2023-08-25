type Message = {
    id: string;
    content: string;
    role: string;
    created_at: string;
    tokens: number;
    cost: number;
};
type ChatChannelProps = {
    apiToken: string;
    collectionId: string;
    onMessage: (message: Message) => void;
    host?: string;
};
export default class ChatChannel {
    private readonly apiToken;
    private readonly collectionId;
    private readonly channel;
    private readonly onMessage;
    private readonly host;
    private chat;
    private consumer?;
    private subscription?;
    constructor({ apiToken, collectionId, onMessage, host, }: ChatChannelProps);
    connect(): Promise<void>;
    get apiHost(): string;
    createChat(): Promise<any>;
    disconnect(): void;
    send(message: string): void;
}
export {};
