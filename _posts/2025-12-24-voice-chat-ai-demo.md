---
layout: post
title: "语音对话 AI Demo"
description: "基于 Qwen3-Omni 实时语音模型的语音对话体验"
categories: ["技术", "AI"]
tags: ["语音识别", "语音合成", "Qwen", "大模型", "人工智能"]
---

<style>
    .vchat-container {
        max-width: 100%;
        margin: 0 auto;
    }

    .vchat-header {
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        color: white;
        padding: 40px 30px;
        text-align: center;
        border-radius: 16px;
        margin-bottom: 20px;
    }

    .vchat-header h1 {
        font-size: 32px;
        margin-bottom: 10px;
        font-weight: 700;
    }

    .vchat-header p {
        font-size: 16px;
        opacity: 0.9;
    }

    .vchat-app {
        background: #0a0a0f;
        border-radius: 16px;
        padding: 1.5rem;
        min-height: 600px;
        position: relative;
        overflow: hidden;
    }

    .vchat-app .bg-gradient {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background:
            radial-gradient(ellipse at 20% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%);
        pointer-events: none;
        z-index: 0;
    }

    .vchat-app .inner {
        position: relative;
        z-index: 1;
        color: #f1f1f4;
    }

    .vchat-app .app-header {
        text-align: center;
        margin-bottom: 1.5rem;
    }

    .vchat-app .app-header h2 {
        font-size: 1.5rem;
        font-weight: 500;
        background: linear-gradient(135deg, #fff 0%, #a5b4fc 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin-bottom: 0.3rem;
    }

    .vchat-app .app-header p {
        color: #8b8b9e;
        font-size: 0.85rem;
    }

    /* 配置区域 */
    .vchat-config {
        background: #12121a;
        border-radius: 1rem;
        padding: 1.25rem;
        margin-bottom: 1.25rem;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .vchat-config.hidden {
        display: none;
    }

    .vchat-config-title {
        font-size: 0.95rem;
        margin-bottom: 0.75rem;
        color: #f1f1f4;
    }

    .vchat-config-group {
        margin-bottom: 0.75rem;
    }

    .vchat-config-label {
        display: block;
        margin-bottom: 0.3rem;
        color: #8b8b9e;
        font-size: 0.8rem;
    }

    .vchat-config-input {
        width: 100%;
        padding: 0.65rem 0.85rem;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 0.5rem;
        background: rgba(255, 255, 255, 0.05);
        color: #f1f1f4;
        font-size: 0.85rem;
        font-family: monospace;
    }

    .vchat-config-input:focus {
        outline: none;
        border-color: #6366f1;
    }

    .vchat-config-input::placeholder {
        color: #8b8b9e;
        opacity: 0.6;
    }

    .vchat-config-btn {
        width: 100%;
        padding: 0.75rem 1.25rem;
        border: none;
        border-radius: 0.5rem;
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        color: white;
        font-size: 0.95rem;
        cursor: pointer;
        transition: all 0.2s;
        margin-top: 0.4rem;
    }

    .vchat-config-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3);
    }

    .vchat-config-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
    }

    .vchat-config-hint {
        margin-top: 0.75rem;
        font-size: 0.75rem;
        color: #8b8b9e;
    }

    .vchat-config-hint a {
        color: #6366f1;
        text-decoration: none;
    }

    /* 已连接信息 */
    .vchat-connected-bar {
        display: none;
        align-items: center;
        justify-content: space-between;
        background: #12121a;
        border-radius: 0.6rem;
        padding: 0.6rem 0.85rem;
        margin-bottom: 1rem;
        border: 1px solid rgba(34, 197, 94, 0.3);
    }

    .vchat-connected-bar.show {
        display: flex;
    }

    .vchat-connected-bar .info {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        color: #8b8b9e;
        font-size: 0.8rem;
    }

    .vchat-connected-bar .dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #22c55e;
        box-shadow: 0 0 8px #22c55e;
    }

    .vchat-disconnect-btn {
        padding: 0.35rem 0.65rem;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 0.35rem;
        background: transparent;
        color: #8b8b9e;
        font-size: 0.75rem;
        cursor: pointer;
        transition: all 0.2s;
    }

    .vchat-disconnect-btn:hover {
        border-color: #ef4444;
        color: #ef4444;
    }

    /* 状态指示器 */
    .vchat-status-bar {
        display: none;
        align-items: center;
        justify-content: center;
        gap: 0.4rem;
        padding: 0.6rem 1.25rem;
        background: #12121a;
        border-radius: 2rem;
        margin-bottom: 1.25rem;
        border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .vchat-status-bar.show {
        display: flex;
    }

    .vchat-status-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #8b8b9e;
        transition: all 0.3s ease;
    }

    .vchat-status-dot.connected {
        background: #22c55e;
        box-shadow: 0 0 10px #22c55e;
    }

    .vchat-status-dot.speaking {
        background: #f59e0b;
        box-shadow: 0 0 10px #f59e0b;
        animation: vchat-pulse 1s ease infinite;
    }

    @keyframes vchat-pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.7; transform: scale(1.2); }
    }

    .vchat-status-text {
        font-size: 0.8rem;
        color: #8b8b9e;
    }

    /* 对话区域 */
    .vchat-chat-area {
        display: none;
        background: #12121a;
        border-radius: 1rem;
        padding: 1rem;
        margin-bottom: 1.25rem;
        border: 1px solid rgba(255, 255, 255, 0.05);
        overflow-y: auto;
        max-height: 280px;
        min-height: 150px;
    }

    .vchat-chat-area.show {
        display: block;
    }

    .vchat-message {
        margin-bottom: 0.85rem;
        animation: vchat-slideIn 0.3s ease;
    }

    @keyframes vchat-slideIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }

    .vchat-message-label {
        font-size: 0.7rem;
        color: #8b8b9e;
        margin-bottom: 0.2rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .vchat-message-content {
        padding: 0.85rem 1rem;
        border-radius: 0.85rem;
        line-height: 1.5;
        font-size: 0.9rem;
    }

    .vchat-message.user .vchat-message-content {
        background: rgba(99, 102, 241, 0.15);
        border: 1px solid rgba(99, 102, 241, 0.3);
    }

    .vchat-message.ai .vchat-message-content {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .vchat-message.ai .vchat-message-content.streaming::after {
        content: '|';
        animation: vchat-blink 0.8s infinite;
    }

    @keyframes vchat-blink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0; }
    }

    /* 控制区域 */
    .vchat-controls {
        display: none;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
    }

    .vchat-controls.show {
        display: flex;
    }

    /* 麦克风按钮 */
    .vchat-mic-button {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        border: none;
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        box-shadow: 0 4px 30px rgba(99, 102, 241, 0.3);
        position: relative;
    }

    .vchat-mic-button:hover {
        transform: scale(1.05);
        box-shadow: 0 6px 40px rgba(99, 102, 241, 0.4);
    }

    .vchat-mic-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
    }

    .vchat-mic-button.recording {
        animation: vchat-recording-pulse 1.5s ease infinite;
    }

    @keyframes vchat-recording-pulse {
        0%, 100% { box-shadow: 0 4px 30px rgba(99, 102, 241, 0.3); }
        50% { box-shadow: 0 4px 60px rgba(239, 68, 68, 0.5); }
    }

    .vchat-mic-button.recording::before {
        content: '';
        position: absolute;
        width: 120%;
        height: 120%;
        border-radius: 50%;
        border: 2px solid #ef4444;
        animation: vchat-ripple 1.5s ease infinite;
    }

    @keyframes vchat-ripple {
        0% { transform: scale(1); opacity: 0.5; }
        100% { transform: scale(1.5); opacity: 0; }
    }

    .vchat-mic-icon {
        width: 30px;
        height: 30px;
        fill: white;
    }

    /* 波形可视化 */
    .vchat-visualizer {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 3px;
        height: 30px;
    }

    .vchat-visualizer-bar {
        width: 3px;
        height: 8px;
        background: #6366f1;
        border-radius: 2px;
        transition: height 0.1s ease;
    }

    .vchat-visualizer.active .vchat-visualizer-bar {
        animation: vchat-wave 0.5s ease infinite;
    }

    .vchat-visualizer-bar:nth-child(1) { animation-delay: 0s; }
    .vchat-visualizer-bar:nth-child(2) { animation-delay: 0.1s; }
    .vchat-visualizer-bar:nth-child(3) { animation-delay: 0.2s; }
    .vchat-visualizer-bar:nth-child(4) { animation-delay: 0.3s; }
    .vchat-visualizer-bar:nth-child(5) { animation-delay: 0.4s; }

    @keyframes vchat-wave {
        0%, 100% { height: 8px; }
        50% { height: 24px; }
    }

    .vchat-hint {
        color: #8b8b9e;
        font-size: 0.8rem;
        text-align: center;
    }

    /* 错误提示 */
    .vchat-error-toast {
        position: absolute;
        bottom: 1rem;
        left: 50%;
        transform: translateX(-50%);
        background: #ef4444;
        color: white;
        padding: 0.75rem 1.25rem;
        border-radius: 0.6rem;
        display: none;
        animation: vchat-slideUp 0.3s ease;
        z-index: 100;
        font-size: 0.85rem;
    }

    @keyframes vchat-slideUp {
        from { opacity: 0; transform: translate(-50%, 20px); }
        to { opacity: 1; transform: translate(-50%, 0); }
    }

    /* 说明区域 */
    .vchat-info {
        background: #f8f9fa;
        border-radius: 12px;
        padding: 20px;
        margin-top: 20px;
    }

    .vchat-info h3 {
        color: #333;
        margin-bottom: 15px;
        font-size: 18px;
    }

    .vchat-info ul {
        color: #666;
        padding-left: 20px;
    }

    .vchat-info li {
        margin-bottom: 8px;
        line-height: 1.6;
    }

    .vchat-info code {
        background: #e9ecef;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 0.9em;
    }
</style>

<div class="vchat-container">
    <div class="vchat-header">
        <h1>语音对话 AI Demo</h1>
        <p>基于 Qwen3-Omni 实时语音模型，支持连续语音对话</p>
    </div>

    <div class="vchat-app">
        <div class="bg-gradient"></div>
        <div class="inner">
            <div class="app-header">
                <h2>语音对话 AI</h2>
                <p>点击麦克风开始与 AI 对话</p>
            </div>

            <!-- 配置区域 -->
            <div class="vchat-config" id="vchatConfigSection">
                <div class="vchat-config-title">连接配置</div>

                <div class="vchat-config-group">
                    <label class="vchat-config-label">API Key (阿里云百炼平台)</label>
                    <input type="password" class="vchat-config-input" id="vchatApiKeyInput" placeholder="sk-xxxxxxxxxxxxxxxx">
                </div>

                <button class="vchat-config-btn" id="vchatConnectBtn">开始对话</button>

                <p class="vchat-config-hint">
                    API Key 可在 <a href="https://bailian.console.aliyun.com/" target="_blank">阿里云百炼平台</a> 免费获取
                </p>
            </div>

            <!-- 已连接信息 -->
            <div class="vchat-connected-bar" id="vchatConnectedBar">
                <div class="info">
                    <div class="dot"></div>
                    <span id="vchatConnectedInfo">已连接</span>
                </div>
                <button class="vchat-disconnect-btn" id="vchatDisconnectBtn">断开</button>
            </div>

            <div class="vchat-status-bar" id="vchatStatusBar">
                <div class="vchat-status-dot" id="vchatStatusDot"></div>
                <span class="vchat-status-text" id="vchatStatusText">已连接</span>
            </div>

            <div class="vchat-chat-area" id="vchatChatArea">
                <div class="vchat-message ai">
                    <div class="vchat-message-label">AI 助手</div>
                    <div class="vchat-message-content">
                        你好！我是小云，你的 AI 语音助手。点击下方麦克风按钮开始对话吧！
                    </div>
                </div>
            </div>

            <div class="vchat-controls" id="vchatControls">
                <div class="vchat-visualizer" id="vchatVisualizer">
                    <div class="vchat-visualizer-bar"></div>
                    <div class="vchat-visualizer-bar"></div>
                    <div class="vchat-visualizer-bar"></div>
                    <div class="vchat-visualizer-bar"></div>
                    <div class="vchat-visualizer-bar"></div>
                </div>

                <button class="vchat-mic-button" id="vchatMicButton" disabled>
                    <svg class="vchat-mic-icon" viewBox="0 0 24 24">
                        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                        <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                    </svg>
                </button>

                <p class="vchat-hint" id="vchatHint">点击麦克风开始说话</p>
            </div>
        </div>

        <div class="vchat-error-toast" id="vchatErrorToast"></div>
    </div>

    <div class="vchat-info">
        <h3>使用说明</h3>
        <ul>
            <li><strong>获取 API Key</strong>：访问 <a href="https://bailian.console.aliyun.com/" target="_blank">阿里云百炼平台</a>，注册并获取免费的 API Key</li>
            <li><strong>开始对话</strong>：输入 API Key 后点击"开始对话"，然后点击麦克风按钮说话</li>
            <li><strong>语音识别</strong>：AI 会自动检测你的语音开始和结束，无需手动控制</li>
            <li><strong>实时响应</strong>：AI 会以语音方式回复你，同时显示文字转写</li>
        </ul>

        <h3>技术特点</h3>
        <ul>
            <li>使用 <code>Qwen3-Omni-Flash-Realtime</code> 端到端语音大模型</li>
            <li>使用 <code>Qwen3-ASR-Flash-Realtime</code> 实时语音转写</li>
            <li>支持服务端 VAD（语音活动检测）</li>
            <li>WebSocket 实时双向通信</li>
        </ul>
    </div>
</div>

<script>
(function() {
    // 后端 WebSocket 地址
    const WS_URL = 'wss://vchat.nuosheng.cloud/ws';

    // 状态管理
    const state = {
        isConnected: false,
        isRecording: false,
        ws: null,
        apiKey: '',
        audioContext: null,
        mediaStream: null,
        processor: null,
        currentAiMessage: null,
        currentUserMessage: null,
        isAsrDone: true,
        pendingAudio: [],
        pendingTranscript: []
    };

    // DOM 元素
    const el = {
        configSection: document.getElementById('vchatConfigSection'),
        apiKeyInput: document.getElementById('vchatApiKeyInput'),
        connectBtn: document.getElementById('vchatConnectBtn'),
        connectedBar: document.getElementById('vchatConnectedBar'),
        connectedInfo: document.getElementById('vchatConnectedInfo'),
        disconnectBtn: document.getElementById('vchatDisconnectBtn'),
        statusBar: document.getElementById('vchatStatusBar'),
        micButton: document.getElementById('vchatMicButton'),
        statusDot: document.getElementById('vchatStatusDot'),
        statusText: document.getElementById('vchatStatusText'),
        chatArea: document.getElementById('vchatChatArea'),
        controls: document.getElementById('vchatControls'),
        visualizer: document.getElementById('vchatVisualizer'),
        hint: document.getElementById('vchatHint'),
        errorToast: document.getElementById('vchatErrorToast')
    };

    // 音频播放器
    class AudioPlayer {
        constructor() {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
            this.queue = [];
            this.isPlaying = false;
        }

        async play(base64Data) {
            const binaryData = atob(base64Data);
            const bytes = new Uint8Array(binaryData.length);
            for (let i = 0; i < binaryData.length; i++) {
                bytes[i] = binaryData.charCodeAt(i);
            }
            const samples = new Int16Array(bytes.buffer);
            const floatData = new Float32Array(samples.length);
            for (let i = 0; i < samples.length; i++) {
                floatData[i] = samples[i] / 32768.0;
            }
            this.queue.push(floatData);
            if (!this.isPlaying) this.processQueue();
        }

        async processQueue() {
            if (this.queue.length === 0) {
                this.isPlaying = false;
                return;
            }
            this.isPlaying = true;
            const data = this.queue.shift();
            const buffer = this.audioContext.createBuffer(1, data.length, 24000);
            buffer.getChannelData(0).set(data);
            const source = this.audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(this.audioContext.destination);
            source.onended = () => this.processQueue();
            source.start();
        }

        clear() { this.queue = []; }
    }

    const audioPlayer = new AudioPlayer();

    function updateStatus(status, text) {
        el.statusDot.className = 'vchat-status-dot ' + status;
        el.statusText.textContent = text;
    }

    function showError(message) {
        el.errorToast.textContent = message;
        el.errorToast.style.display = 'block';
        setTimeout(() => { el.errorToast.style.display = 'none'; }, 5000);
    }

    function showChatUI() {
        el.configSection.classList.add('hidden');
        el.connectedBar.classList.add('show');
        el.statusBar.classList.add('show');
        el.chatArea.classList.add('show');
        el.controls.classList.add('show');
    }

    function showConfigUI() {
        el.configSection.classList.remove('hidden');
        el.connectedBar.classList.remove('show');
        el.statusBar.classList.remove('show');
        el.chatArea.classList.remove('show');
        el.controls.classList.remove('show');
    }

    function addMessage(type, text, isStreaming = false) {
        const div = document.createElement('div');
        div.className = `vchat-message ${type}`;
        div.innerHTML = `
            <div class="vchat-message-label">${type === 'user' ? '你' : 'AI 助手'}</div>
            <div class="vchat-message-content ${isStreaming ? 'streaming' : ''}">${text}</div>
        `;
        el.chatArea.appendChild(div);
        el.chatArea.scrollTop = el.chatArea.scrollHeight;
        return div;
    }

    function updateAiMessage(text) {
        if (!state.currentAiMessage) {
            state.currentAiMessage = addMessage('ai', text, true);
        } else {
            const content = state.currentAiMessage.querySelector('.vchat-message-content');
            content.textContent += text;
            el.chatArea.scrollTop = el.chatArea.scrollHeight;
        }
    }

    function finishAiMessage() {
        if (state.currentAiMessage) {
            const content = state.currentAiMessage.querySelector('.vchat-message-content');
            content.classList.remove('streaming');
            state.currentAiMessage = null;
        }
    }

    function createUserMessage() {
        state.currentUserMessage = addMessage('user', '...', true);
    }

    function updateUserMessage(text) {
        if (!state.currentUserMessage) {
            state.currentUserMessage = addMessage('user', text, true);
        } else {
            const content = state.currentUserMessage.querySelector('.vchat-message-content');
            content.textContent = text;
            el.chatArea.scrollTop = el.chatArea.scrollHeight;
        }
    }

    function finishUserMessage(text) {
        if (state.currentUserMessage) {
            const content = state.currentUserMessage.querySelector('.vchat-message-content');
            content.textContent = text;
            content.classList.remove('streaming');
            state.currentUserMessage = null;
        }
        state.isAsrDone = true;
        flushPendingData();
    }

    function flushPendingData() {
        while (state.pendingTranscript.length > 0) {
            updateAiMessage(state.pendingTranscript.shift());
        }
        while (state.pendingAudio.length > 0) {
            audioPlayer.play(state.pendingAudio.shift());
        }
    }

    function connect() {
        const apiKey = el.apiKeyInput.value.trim();
        if (!apiKey) {
            showError('请输入 API Key');
            return;
        }

        state.apiKey = apiKey;
        el.connectBtn.disabled = true;
        el.connectBtn.textContent = '连接中...';

        const finalUrl = `${WS_URL}?api_key=${encodeURIComponent(apiKey)}`;
        state.ws = new WebSocket(finalUrl);

        state.ws.onopen = () => {
            localStorage.setItem('vchat_api_key', apiKey);
        };

        state.ws.onmessage = (event) => {
            handleServerMessage(JSON.parse(event.data));
        };

        state.ws.onclose = () => {
            if (state.isConnected) {
                state.isConnected = false;
                showError('连接已断开');
                disconnect();
            } else {
                el.connectBtn.disabled = false;
                el.connectBtn.textContent = '开始对话';
            }
        };

        state.ws.onerror = () => {
            showError('连接失败，请检查网络');
            el.connectBtn.disabled = false;
            el.connectBtn.textContent = '开始对话';
        };
    }

    function disconnect() {
        state.isConnected = false;
        if (state.ws) { state.ws.close(); state.ws = null; }
        stopRecording();
        showConfigUI();
        el.connectBtn.disabled = false;
        el.connectBtn.textContent = '开始对话';
        el.micButton.disabled = true;
    }

    function handleServerMessage(data) {
        switch (data.type) {
            case 'connected':
                state.isConnected = true;
                updateStatus('connected', '已连接');
                el.micButton.disabled = false;
                el.hint.textContent = '点击麦克风开始说话';
                el.connectedInfo.textContent = '已连接到服务器';
                showChatUI();
                break;
            case 'audio':
                if (state.isAsrDone) audioPlayer.play(data.data);
                else state.pendingAudio.push(data.data);
                break;
            case 'transcript':
                if (state.isAsrDone) updateAiMessage(data.text);
                else state.pendingTranscript.push(data.text);
                break;
            case 'user_transcript_delta':
                updateUserMessage(data.text);
                break;
            case 'user_transcript_done':
                finishUserMessage(data.text);
                break;
            case 'speech_started':
                updateStatus('speaking', '正在聆听...');
                el.visualizer.classList.add('active');
                audioPlayer.clear();
                state.isAsrDone = false;
                state.pendingAudio = [];
                state.pendingTranscript = [];
                createUserMessage();
                break;
            case 'speech_stopped':
                updateStatus('connected', 'AI 思考中...');
                el.visualizer.classList.remove('active');
                break;
            case 'response_done':
                updateStatus('connected', '已连接');
                finishAiMessage();
                break;
            case 'error':
                showError(data.message);
                break;
        }
    }

    async function startRecording() {
        try {
            await audioPlayer.audioContext.resume();
            state.mediaStream = await navigator.mediaDevices.getUserMedia({
                audio: { sampleRate: 16000, channelCount: 1, echoCancellation: true, noiseSuppression: true }
            });

            state.audioContext = new AudioContext({ sampleRate: 16000 });
            const source = state.audioContext.createMediaStreamSource(state.mediaStream);
            state.processor = state.audioContext.createScriptProcessor(4096, 1, 1);

            state.processor.onaudioprocess = (e) => {
                if (!state.isRecording) return;
                const inputData = e.inputBuffer.getChannelData(0);
                const pcmData = new Int16Array(inputData.length);
                for (let i = 0; i < inputData.length; i++) {
                    const s = Math.max(-1, Math.min(1, inputData[i]));
                    pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                }
                const base64 = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
                if (state.ws && state.ws.readyState === WebSocket.OPEN) {
                    state.ws.send(JSON.stringify({ type: 'audio', data: base64 }));
                }
            };

            source.connect(state.processor);
            state.processor.connect(state.audioContext.destination);
            state.isRecording = true;
            el.micButton.classList.add('recording');
            el.hint.textContent = '正在录音，再次点击停止';
            el.visualizer.classList.add('active');
        } catch (err) {
            showError('无法访问麦克风，请检查权限设置');
        }
    }

    function stopRecording() {
        state.isRecording = false;
        if (state.processor) { state.processor.disconnect(); state.processor = null; }
        if (state.audioContext) { state.audioContext.close(); state.audioContext = null; }
        if (state.mediaStream) { state.mediaStream.getTracks().forEach(t => t.stop()); state.mediaStream = null; }
        el.micButton.classList.remove('recording');
        el.hint.textContent = '点击麦克风开始说话';
        el.visualizer.classList.remove('active');
    }

    // 事件绑定
    el.connectBtn.addEventListener('click', connect);
    el.disconnectBtn.addEventListener('click', disconnect);
    el.apiKeyInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') connect(); });
    el.micButton.addEventListener('click', () => {
        if (state.isRecording) stopRecording();
        else startRecording();
    });

    // 恢复保存的 API Key
    const savedApiKey = localStorage.getItem('vchat_api_key');
    if (savedApiKey) el.apiKeyInput.value = savedApiKey;

    // 页面关闭清理
    window.addEventListener('beforeunload', () => {
        stopRecording();
        if (state.ws) state.ws.close();
    });
})();
</script>
