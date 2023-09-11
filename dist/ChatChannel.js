"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const actioncable_1 = require("@rails/actioncable");
class ChatChannel {
    constructor({ apiToken, collectionId, onMessage, host = "www.fireaw.ai", }) {
        this.apiToken = apiToken;
        this.collectionId = collectionId;
        this.channel = "ChatChannel";
        this.onMessage = onMessage;
        this.host = host;
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            this.chat = yield this.createChat();
            // Show the greeting(s)
            this.chat.messages.forEach((message) => this.onMessage(message));
            this.consumer = (0, actioncable_1.createConsumer)(`ws${this.host.startsWith("localhost") ? "" : "s"}://${this.host}/cable`);
            this.subscription = this.consumer.subscriptions.create({
                channel: this.channel,
                id: this.chat.id,
            }, {
                received: (data) => {
                    if (data.message) {
                        this.onMessage(data.message);
                    }
                },
            });
        });
    }
    get apiHost() {
        return `http${this.host.startsWith("localhost") ? "" : "s"}://${this.host}`;
    }
    createChat() {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield fetch(`${this.apiHost}/api/v1/chats`, {
                method: "POST",
                body: JSON.stringify({
                    chat: {
                        collection_id: this.collectionId,
                    },
                }),
                headers: {
                    "Content-Type": "application/json",
                    Authorization: this.apiToken,
                },
            });
            if (res.ok) {
                return yield res.json();
            }
            else {
                throw new Error("Failed to create chat:" + (yield res.text()));
            }
        });
    }
    disconnect() {
        var _a;
        (_a = this.subscription) === null || _a === void 0 ? void 0 : _a.unsubscribe();
    }
    send(message) {
        var _a;
        (_a = this.subscription) === null || _a === void 0 ? void 0 : _a.send({
            command: "message",
            identifier: JSON.stringify({ channel: this.channel, id: this.chat.id }),
            data: message,
        });
    }
    vote(messageId, vote) {
        var _a;
        (_a = this.subscription) === null || _a === void 0 ? void 0 : _a.send({
            command: "vote",
            identifier: JSON.stringify({ channel: this.channel, id: this.chat.id }),
            message_id: messageId,
            vote,
        });
    }
}
exports.default = ChatChannel;
