# Fireaw.ai SDK

This is the official SDK for Fireaw.ai. It allows you to chat in real time with websites that you've configured on chat.ai.

## Installation

```bash
npm i --save @fireaw.ai/sdk
```

## Usage

```javascript
import { ChatChannel } from "@fireaw.ai/sdk";

// Create a new chat and start listening for messages using web sockets:
const channel = new ChatChannel({
  // See https://www.fireaw.ai/account to manage your API tokens
  apiToken: "<your api token here>",

  // Copy the collection id from the website view in https://www.fireaw.ai
  collectionId: "<your collection id here>",

  // Will be called each time a new message is received (both user and assistant messages)
  onMessage: (message) => {
    console.log(
      `Received message: id=${message.id}, role=${message.role}, cost=${message.cost}, content=${message.content}`
    );
  },
});

// Send a message to the assistant
channel.send("What kind of products do you have for sale?");
```
