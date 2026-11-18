import { computed, ref } from "vue";
import { useIntervalFn, useWebSocket } from "@vueuse/core";

export type SocketRole = "web" | "device";

export function useDeviceSocket(initialRole: SocketRole = "web") {
	const role = ref<SocketRole>(initialRole);
	const lastMessage = ref("");

	const proto = location.protocol === "https:" ? "wss:" : "ws:";
	const url = computed(
		() => `${proto}//${location.host}/websocket?role=${role.value}`,
	);

	const { status, send, open } = useWebSocket(url, {
		autoReconnect: true,
		heartbeat: {
			message: "ping",
			responseMessage: "pong",
			pongTimeout: 5000,
			scheduler: (cb) => useIntervalFn(cb, 25000),
		},
		onConnected() {
			lastMessage.value = "";
		},
		onMessage(_, event) {
			if (event.data !== "pong") {
				lastMessage.value = String(event.data);
			}
		},
	});

	return { role, status, lastMessage, connect: open, send };
}
