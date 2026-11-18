import { DurableObject } from "cloudflare:workers";

type Role = "device" | "web";

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);

		if (url.pathname == "/websocket") {
			const upgradeHeader = request.headers.get("Upgrade");
			if (!upgradeHeader || upgradeHeader !== "websocket") {
				return new Response("Expected Upgrade: websocket", { status: 426 });
			}
			if (request.method !== "GET") {
				return new Response("Expected GET method", { status: 400 });
			}

			// Get (or lazily create on first request) the Durable Object instance named "default"
			const stub = env.WEBSOCKET_HIBERNATION_SERVER.getByName("default");
			return stub.fetch(request);
		}

		// We expect to have request about websocket and reject others.
		return new Response(null, { status: 404 });
	},
} satisfies ExportedHandler<Env>;

export class WebSocketHibernationServer extends DurableObject {
	sessions: Map<WebSocket, { id: string; role: Role }>;

	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
		this.sessions = new Map();

		// Get all WebSocket connections from the Durable Object
		this.ctx.getWebSockets().forEach((ws) => {
			const attachment = ws.deserializeAttachment() as {
				id: string;
				role: Role;
			};
			if (attachment) {
				this.sessions.set(ws, { ...attachment });
			}
		});

		// Sets an application level auto response that does not wake hibernated WebSockets
		this.ctx.setWebSocketAutoResponse(
			new WebSocketRequestResponsePair("ping", "pong"),
		);
	}

	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url);
		const role: Role =
			url.searchParams.get("role") === "device" ? "device" : "web";

		const webSocketPair = new WebSocketPair();
		const [client, server] = Object.values(webSocketPair);
		this.ctx.acceptWebSocket(server);

		const meta = { id: crypto.randomUUID(), role };
		// This is necessary to restore the state of the connection when the Durable Object wakes up.
		server.serializeAttachment(meta);

		// Add the WebSocket connection to the map of active sessions
		this.sessions.set(server, meta);

		return new Response(null, {
			status: 101,
			webSocket: client,
		});
	}

	async webSocketMessage(ws: WebSocket, message: ArrayBuffer | string) {
		const sender = this.sessions.get(ws);
		if (!sender) return;

		const targetRole: Role = sender.role === "device" ? "web" : "device";
		this.sessions.forEach((session, connectedWs) => {
			if (session.role === targetRole) {
				try {
					connectedWs.send(message);
				} catch {
					this.sessions.delete(connectedWs);
				}
			}
		});
	}

	async webSocketClose(ws: WebSocket, code: number, reason: string) {
		ws.close(code, reason);
		this.sessions.delete(ws);
	}

	async webSocketError(ws: WebSocket) {
		this.sessions.delete(ws);
	}
}
