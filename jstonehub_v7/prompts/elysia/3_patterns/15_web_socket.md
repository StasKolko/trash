# WebSocket

WebSocket is a real-time protocol for communication between your client and server.

Unlike HTTP where our client repeatedly asks the website for information and waits for a reply each time, WebSocket sets up a direct line where our client and server can send messages back and forth directly, making the conversation quicker and smoother without having to start over with each message.

SocketIO is a popular library for WebSocket, but it is not the only one. Elysia uses uWebSocket which Bun uses under the hood with the same API.

To use WebSocket, simply call `Elysia.ws()`:

```ts
import { Elysia } from 'elysia'

new Elysia()
    .ws('/ws', {
        message(ws, message) {
            ws.send(message)
        }
    })
    .listen(3000)
```

## WebSocket Message Validation

Same as normal routes, WebSockets also accept a schema object to strictly type and validate requests.

```ts
import { Elysia, t } from 'elysia'

const app = new Elysia()
    .ws('/ws', {
        // validate incoming message
        body: t.Object({
            message: t.String()
        }),
        query: t.Object({
            id: t.String()
        }),
        message(ws, { message }) {
            // Get schema from `ws.data`
            const { id } = ws.data.query
            ws.send({
                id,
                message,
                time: Date.now()
            })
        }
    })
    .listen(3000)
```

WebSocket schema can validate the following:

- **message** — An incoming message.
- **query** — Query string or URL parameters.
- **params** — Path parameters.
- **header** — Request's headers.
- **cookie** — Request's cookie.
- **response** — Value returned from handler.

By default Elysia will parse incoming stringified JSON message as Object for validation.

## Configuration

You can set Elysia constructor to set the WebSocket value.

```ts
import { Elysia } from 'elysia'

new Elysia({
    websocket: {
        idleTimeout: 30
    }
})
```

Elysia's WebSocket implementation extends Bun's WebSocket configuration, please refer to **Bun's WebSocket documentation** for more information.

The following is a brief configuration from Bun WebSocket:

### perMessageDeflate

`@default false`

Enable compression for clients that support it. By default, compression is disabled.

### maxPayloadLength

The maximum size of a message.

### idleTimeout

`@default 120`

After a connection has not received a message for this many seconds, it will be closed.

### backpressureLimit

`@default 16777216 (16MB)`

The maximum number of bytes that can be buffered for a single connection.

### closeOnBackpressureLimit

`@default false`

Close the connection if the backpressure limit is reached.

---

## Methods

Below are the new methods that are available to the WebSocket route.

### ws

Create a websocket handler.

```ts
import { Elysia } from 'elysia'

const app = new Elysia()
    .ws('/ws', {
        message(ws, message) {
            ws.send(message)
        }
    })
    .listen(3000)
```

**Type:**

```ts
.ws(endpoint: path, options: Partial<WebSocketHandler<Context>>): this
```

- **endpoint** — A path to be exposed as websocket handler
- **options** — Customize WebSocket handler behavior

---

## WebSocketHandler

`WebSocketHandler` extends config from config.

Below is a config which is accepted by `ws`.

### open

Callback function for new websocket connection.

**Type:**

```ts
open(ws: ServerWebSocket<{
    // uid for each connection
    id: string
    data: Context
}>): this
```

### message

Callback function for incoming websocket message.

**Type:**

```ts
message(
    ws: ServerWebSocket<{
        // uid for each connection
        id: string
        data: Context
    }>,
    message: Message
): this
```

`Message` type based on `schema.message`. Default is `string`.

### close

Callback function for closing websocket connection.

**Type:**

```ts
close(ws: ServerWebSocket<{
    // uid for each connection
    id: string
    data: Context
}>): this
```

### drain

Callback function for the server is ready to accept more data.

**Type:**

```ts
drain(
    ws: ServerWebSocket<{
        // uid for each connection
        id: string
        data: Context
    }>,
    code: number,
    reason: string
): this
```

### parse

Parse middleware to parse the request before upgrading the HTTP connection to WebSocket.

### beforeHandle

Before Handle middleware which executes before upgrading the HTTP connection to WebSocket.

Ideal place for validation.

### transform

Transform middleware which executes before validation.

### transformMessage

Like `transform`, but executes before validation of WebSocket message.

### header

Additional headers to add before upgrading connection to WebSocket.