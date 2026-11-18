<script setup lang="ts">
import { ref } from "vue";
import { useDeviceSocket } from "../composables/useDeviceSocket";

const { role, status, lastMessage, connect, send } = useDeviceSocket();
const draft = ref("");

function sendDraft() {
	const msg = draft.value.trim();
	if (!msg) return;
	send(msg);
	draft.value = "";
}
</script>

<template>
	<main class="page">
		<h1>ambad</h1>

		<div class="row role-bar">
			<span>Role:</span>
			<button :class="{ active: role === 'web' }" @click="role = 'web'">
				web
			</button>
			<button :class="{ active: role === 'device' }" @click="role = 'device'">
				device
			</button>
			<span class="status">({{ status }})</span>
		</div>

		<pre class="box">{{ lastMessage || "(no message yet)" }}</pre>

		<div class="row">
			<input
				v-model="draft"
				placeholder="Type message..."
				@keyup.enter="sendDraft"
			/>
			<button :disabled="status !== 'OPEN'" @click="sendDraft">Send</button>
			<button v-if="status === 'CLOSED'" @click="connect()">Reconnect</button>
		</div>
	</main>
</template>

<style scoped>
.page {
	max-width: 600px;
	margin: 48px auto;
	padding: 20px;
}

.role-bar {
	align-items: center;
	margin-top: 12px;
}

.status {
	color: #aaa;
	font-size: 0.9rem;
}

.box {
	margin: 16px 0;
	padding: 14px;
	background: #1c1c1c;
	border: 1px solid #333;
	border-radius: 8px;
}

.row {
	display: flex;
	gap: 8px;
	flex-wrap: wrap;
}

input {
	flex: 1;
	min-width: 180px;
	padding: 8px 12px;
	border: 1px solid #444;
	border-radius: 6px;
	background: #181818;
	color: #eee;
}

button {
	padding: 8px 14px;
	border: 0;
	border-radius: 6px;
	background: #333;
	color: #eee;
	font-weight: 600;
	cursor: pointer;
}

button.active {
	background: #2ed573;
	color: #111;
}

button:disabled {
	opacity: 0.4;
	cursor: not-allowed;
}
</style>
