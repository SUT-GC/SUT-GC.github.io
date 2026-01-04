---
layout: post
title: '从 ADB 到 AutoGLM，从手机到浏览器，深入理解 AI 如何"看懂"并"操控"图形界面'
description: 'GUI Agent 技术全景：从 ADB 到 AutoGLM，深入解析 AI 如何通过视觉语言模型操控手机、浏览器和桌面的图形界面'
categories: ["技术", "AI"]
tags: ["GUI Agent", "AutoGLM", "ADB", "VLM", "人工智能", "自动化", "大模型"]
---

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700&family=JetBrains+Mono:wght@400;500&family=Playfair+Display:wght@700&display=swap" rel="stylesheet">

<style>
    :root {
        --bg-primary: #0a0a0f;
        --bg-secondary: #12121a;
        --bg-card: #1a1a24;
        --bg-card-hover: #222230;
        --text-primary: #e8e8ed;
        --text-secondary: #9898a8;
        --text-muted: #686878;
        --accent-cyan: #00d4ff;
        --accent-purple: #a855f7;
        --accent-green: #22c55e;
        --accent-orange: #f97316;
        --accent-pink: #ec4899;
        --border-color: #2a2a3a;
        --gradient-1: linear-gradient(135deg, #00d4ff 0%, #a855f7 100%);
        --gradient-2: linear-gradient(135deg, #22c55e 0%, #00d4ff 100%);
        --gradient-3: linear-gradient(135deg, #f97316 0%, #ec4899 100%);
    }

    .gui-agent-wrapper * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    .gui-agent-wrapper {
        font-family: 'Noto Sans SC', -apple-system, BlinkMacSystemFont, sans-serif;
        background: var(--bg-primary);
        color: var(--text-primary);
        line-height: 1.8;
        overflow-x: hidden;
        margin: -20px;
        padding: 0;
    }

    /* Animated Background */
    .gui-agent-wrapper .bg-grid {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image:
            linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px);
        background-size: 60px 60px;
        pointer-events: none;
        z-index: 0;
    }

    .gui-agent-wrapper .floating-orb {
        position: fixed;
        border-radius: 50%;
        filter: blur(80px);
        opacity: 0.3;
        pointer-events: none;
        z-index: 0;
    }

    .gui-agent-wrapper .orb-1 {
        width: 400px;
        height: 400px;
        background: var(--accent-cyan);
        top: 10%;
        left: -10%;
        animation: gui-float 20s ease-in-out infinite;
    }

    .gui-agent-wrapper .orb-2 {
        width: 300px;
        height: 300px;
        background: var(--accent-purple);
        top: 60%;
        right: -5%;
        animation: gui-float 25s ease-in-out infinite reverse;
    }

    .gui-agent-wrapper .orb-3 {
        width: 250px;
        height: 250px;
        background: var(--accent-green);
        bottom: 10%;
        left: 30%;
        animation: gui-float 18s ease-in-out infinite;
    }

    @keyframes gui-float {
        0%, 100% { transform: translate(0, 0) rotate(0deg); }
        25% { transform: translate(30px, -30px) rotate(5deg); }
        50% { transform: translate(-20px, 20px) rotate(-5deg); }
        75% { transform: translate(10px, 40px) rotate(3deg); }
    }

    /* Container */
    .gui-agent-wrapper .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 24px;
        position: relative;
        z-index: 1;
    }

    /* Hero Section */
    .gui-agent-wrapper .hero {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        padding: 60px 24px;
    }

    .gui-agent-wrapper .hero-badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: rgba(0, 212, 255, 0.1);
        border: 1px solid rgba(0, 212, 255, 0.3);
        padding: 8px 20px;
        border-radius: 30px;
        font-size: 14px;
        color: var(--accent-cyan);
        margin-bottom: 32px;
        animation: gui-fadeInUp 0.8s ease;
    }

    .gui-agent-wrapper .hero-badge::before {
        content: '';
        width: 8px;
        height: 8px;
        background: var(--accent-cyan);
        border-radius: 50%;
        animation: gui-pulse 2s infinite;
    }

    @keyframes gui-pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.5; transform: scale(1.2); }
    }

    .gui-agent-wrapper .hero h1 {
        font-family: 'Playfair Display', serif;
        font-size: clamp(48px, 8vw, 96px);
        font-weight: 700;
        line-height: 1.1;
        margin-bottom: 24px;
        background: var(--gradient-1);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: gui-fadeInUp 0.8s ease 0.2s backwards;
    }

    .gui-agent-wrapper .hero-subtitle {
        font-size: clamp(18px, 2.5vw, 24px);
        color: var(--text-secondary);
        max-width: 700px;
        margin-bottom: 48px;
        animation: gui-fadeInUp 0.8s ease 0.4s backwards;
    }

    .gui-agent-wrapper .hero-stats {
        display: flex;
        gap: 48px;
        flex-wrap: wrap;
        justify-content: center;
        animation: gui-fadeInUp 0.8s ease 0.6s backwards;
    }

    .gui-agent-wrapper .stat-item {
        text-align: center;
    }

    .gui-agent-wrapper .stat-value {
        font-size: 48px;
        font-weight: 700;
        background: var(--gradient-1);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    .gui-agent-wrapper .stat-label {
        font-size: 14px;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 2px;
    }

    @keyframes gui-fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    /* Navigation */
    .gui-agent-wrapper .nav {
        position: sticky;
        top: 0;
        background: rgba(10, 10, 15, 0.9);
        backdrop-filter: blur(20px);
        border-bottom: 1px solid var(--border-color);
        z-index: 100;
        padding: 16px 0;
    }

    .gui-agent-wrapper .nav-inner {
        display: flex;
        justify-content: center;
        gap: 8px;
        flex-wrap: wrap;
    }

    .gui-agent-wrapper .nav-link {
        padding: 10px 20px;
        color: var(--text-secondary);
        text-decoration: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.3s ease;
    }

    .gui-agent-wrapper .nav-link:hover {
        color: var(--text-primary);
        background: var(--bg-card);
    }

    .gui-agent-wrapper .nav-link.active {
        color: var(--accent-cyan);
        background: rgba(0, 212, 255, 0.1);
    }

    /* Section */
    .gui-agent-wrapper section {
        padding: 100px 0;
    }

    .gui-agent-wrapper .section-header {
        text-align: center;
        margin-bottom: 64px;
    }

    .gui-agent-wrapper .section-tag {
        display: inline-block;
        font-size: 12px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 3px;
        color: var(--accent-cyan);
        margin-bottom: 16px;
    }

    .gui-agent-wrapper .section-title {
        font-size: clamp(32px, 5vw, 48px);
        font-weight: 700;
        margin-bottom: 16px;
    }

    .gui-agent-wrapper .section-desc {
        font-size: 18px;
        color: var(--text-secondary);
        max-width: 600px;
        margin: 0 auto;
    }

    /* Cards */
    .gui-agent-wrapper .card-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: 24px;
    }

    .gui-agent-wrapper .card {
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: 16px;
        padding: 32px;
        transition: all 0.4s ease;
        position: relative;
        overflow: hidden;
    }

    .gui-agent-wrapper .card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: var(--gradient-1);
        opacity: 0;
        transition: opacity 0.3s ease;
    }

    .gui-agent-wrapper .card:hover {
        background: var(--bg-card-hover);
        transform: translateY(-4px);
        border-color: rgba(0, 212, 255, 0.3);
    }

    .gui-agent-wrapper .card:hover::before {
        opacity: 1;
    }

    .gui-agent-wrapper .card-icon {
        width: 56px;
        height: 56px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        margin-bottom: 20px;
    }

    .gui-agent-wrapper .card-icon.cyan { background: rgba(0, 212, 255, 0.15); }
    .gui-agent-wrapper .card-icon.purple { background: rgba(168, 85, 247, 0.15); }
    .gui-agent-wrapper .card-icon.green { background: rgba(34, 197, 94, 0.15); }
    .gui-agent-wrapper .card-icon.orange { background: rgba(249, 115, 22, 0.15); }
    .gui-agent-wrapper .card-icon.pink { background: rgba(236, 72, 153, 0.15); }

    .gui-agent-wrapper .card h3 {
        font-size: 20px;
        font-weight: 600;
        margin-bottom: 12px;
    }

    .gui-agent-wrapper .card p {
        color: var(--text-secondary);
        font-size: 15px;
    }

    /* Architecture Diagram */
    .gui-agent-wrapper .architecture {
        background: var(--bg-secondary);
        border-radius: 24px;
        padding: 48px;
        margin: 48px 0;
        border: 1px solid var(--border-color);
    }

    .gui-agent-wrapper .arch-title {
        text-align: center;
        font-size: 24px;
        font-weight: 600;
        margin-bottom: 40px;
    }

    .gui-agent-wrapper .arch-flow {
        display: flex;
        flex-direction: column;
        gap: 24px;
        max-width: 800px;
        margin: 0 auto;
    }

    .gui-agent-wrapper .arch-row {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 16px;
        flex-wrap: wrap;
    }

    .gui-agent-wrapper .arch-box {
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        padding: 16px 24px;
        text-align: center;
        min-width: 150px;
        transition: all 0.3s ease;
    }

    .gui-agent-wrapper .arch-box:hover {
        border-color: var(--accent-cyan);
        transform: scale(1.02);
    }

    .gui-agent-wrapper .arch-box.highlight {
        border-color: var(--accent-cyan);
        background: rgba(0, 212, 255, 0.1);
    }

    .gui-agent-wrapper .arch-box-label {
        font-size: 12px;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 4px;
    }

    .gui-agent-wrapper .arch-box-title {
        font-weight: 600;
        font-size: 16px;
    }

    .gui-agent-wrapper .arch-arrow {
        font-size: 24px;
        color: var(--accent-cyan);
    }

    .gui-agent-wrapper .arch-arrow-down {
        text-align: center;
        font-size: 32px;
        color: var(--accent-cyan);
    }

    /* Code Block */
    .gui-agent-wrapper .code-block {
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        overflow: hidden;
        margin: 24px 0;
    }

    .gui-agent-wrapper .code-header {
        background: var(--bg-card);
        padding: 12px 20px;
        display: flex;
        align-items: center;
        gap: 8px;
        border-bottom: 1px solid var(--border-color);
    }

    .gui-agent-wrapper .code-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
    }

    .gui-agent-wrapper .code-dot.red { background: #ff5f56; }
    .gui-agent-wrapper .code-dot.yellow { background: #ffbd2e; }
    .gui-agent-wrapper .code-dot.green { background: #27ca40; }

    .gui-agent-wrapper .code-title {
        margin-left: auto;
        font-size: 13px;
        color: var(--text-muted);
        font-family: 'JetBrains Mono', monospace;
    }

    .gui-agent-wrapper .code-content {
        padding: 20px;
        overflow-x: auto;
    }

    .gui-agent-wrapper .code-content pre {
        font-family: 'JetBrains Mono', monospace;
        font-size: 14px;
        line-height: 1.7;
        color: var(--text-secondary);
        margin: 0;
        background: transparent;
    }

    .gui-agent-wrapper .code-comment { color: #6a737d; }
    .gui-agent-wrapper .code-keyword { color: var(--accent-purple); }
    .gui-agent-wrapper .code-string { color: var(--accent-green); }
    .gui-agent-wrapper .code-function { color: var(--accent-cyan); }

    /* Table */
    .gui-agent-wrapper .table-wrapper {
        overflow-x: auto;
        margin: 24px 0;
    }

    .gui-agent-wrapper table {
        width: 100%;
        border-collapse: collapse;
        background: var(--bg-card);
        border-radius: 12px;
        overflow: hidden;
    }

    .gui-agent-wrapper th, .gui-agent-wrapper td {
        padding: 16px 20px;
        text-align: left;
        border-bottom: 1px solid var(--border-color);
    }

    .gui-agent-wrapper th {
        background: var(--bg-secondary);
        font-weight: 600;
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: var(--text-muted);
    }

    .gui-agent-wrapper td {
        font-size: 15px;
    }

    .gui-agent-wrapper tr:last-child td {
        border-bottom: none;
    }

    .gui-agent-wrapper tr:hover td {
        background: var(--bg-card-hover);
    }

    /* Comparison */
    .gui-agent-wrapper .comparison-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 24px;
        margin-top: 48px;
    }

    .gui-agent-wrapper .comparison-card {
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: 16px;
        overflow: hidden;
    }

    .gui-agent-wrapper .comparison-header {
        padding: 24px;
        text-align: center;
        border-bottom: 1px solid var(--border-color);
    }

    .gui-agent-wrapper .comparison-header h3 {
        font-size: 24px;
        font-weight: 700;
        margin-bottom: 8px;
    }

    .gui-agent-wrapper .comparison-header p {
        color: var(--text-muted);
        font-size: 14px;
    }

    .gui-agent-wrapper .comparison-header.phone {
        background: linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%);
    }

    .gui-agent-wrapper .comparison-header.browser {
        background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(0, 212, 255, 0.1) 100%);
    }

    .gui-agent-wrapper .comparison-header.desktop {
        background: linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%);
    }

    .gui-agent-wrapper .comparison-body {
        padding: 24px;
    }

    .gui-agent-wrapper .comparison-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 16px;
    }

    .gui-agent-wrapper .comparison-item:last-child {
        margin-bottom: 0;
    }

    .gui-agent-wrapper .comparison-icon {
        width: 24px;
        height: 24px;
        border-radius: 6px;
        background: rgba(34, 197, 94, 0.2);
        color: var(--accent-green);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        flex-shrink: 0;
    }

    .gui-agent-wrapper .comparison-text {
        font-size: 14px;
        color: var(--text-secondary);
    }

    /* Timeline */
    .gui-agent-wrapper .timeline {
        position: relative;
        padding-left: 40px;
        margin: 48px 0;
    }

    .gui-agent-wrapper .timeline::before {
        content: '';
        position: absolute;
        left: 15px;
        top: 0;
        bottom: 0;
        width: 2px;
        background: var(--border-color);
    }

    .gui-agent-wrapper .timeline-item {
        position: relative;
        margin-bottom: 40px;
    }

    .gui-agent-wrapper .timeline-item::before {
        content: '';
        position: absolute;
        left: -33px;
        top: 4px;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: var(--accent-cyan);
        border: 3px solid var(--bg-primary);
    }

    .gui-agent-wrapper .timeline-date {
        font-size: 14px;
        color: var(--accent-cyan);
        font-weight: 500;
        margin-bottom: 8px;
    }

    .gui-agent-wrapper .timeline-title {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 8px;
    }

    .gui-agent-wrapper .timeline-desc {
        color: var(--text-secondary);
        font-size: 15px;
    }

    /* Projects Grid */
    .gui-agent-wrapper .projects-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 20px;
    }

    .gui-agent-wrapper .project-card {
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        padding: 24px;
        transition: all 0.3s ease;
    }

    .gui-agent-wrapper .project-card:hover {
        border-color: var(--accent-cyan);
        transform: translateY(-2px);
    }

    .gui-agent-wrapper .project-name {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .gui-agent-wrapper .project-tag {
        font-size: 11px;
        padding: 2px 8px;
        border-radius: 4px;
        background: rgba(34, 197, 94, 0.2);
        color: var(--accent-green);
    }

    .gui-agent-wrapper .project-desc {
        font-size: 14px;
        color: var(--text-secondary);
        margin-bottom: 16px;
    }

    .gui-agent-wrapper .project-link {
        font-size: 13px;
        color: var(--accent-cyan);
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 4px;
    }

    .gui-agent-wrapper .project-link:hover {
        text-decoration: underline;
    }

    /* Info Box */
    .gui-agent-wrapper .info-box {
        background: rgba(0, 212, 255, 0.1);
        border-left: 4px solid var(--accent-cyan);
        border-radius: 0 12px 12px 0;
        padding: 20px 24px;
        margin: 24px 0;
    }

    .gui-agent-wrapper .info-box.warning {
        background: rgba(249, 115, 22, 0.1);
        border-left-color: var(--accent-orange);
    }

    .gui-agent-wrapper .info-box-title {
        font-weight: 600;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .gui-agent-wrapper .info-box p {
        color: var(--text-secondary);
        font-size: 15px;
    }

    /* Footer */
    .gui-agent-wrapper footer {
        background: var(--bg-secondary);
        border-top: 1px solid var(--border-color);
        padding: 48px 0;
        text-align: center;
    }

    .gui-agent-wrapper footer p {
        color: var(--text-muted);
        font-size: 14px;
    }

    .gui-agent-wrapper footer a {
        color: var(--accent-cyan);
        text-decoration: none;
    }

    .gui-agent-wrapper footer a:hover {
        text-decoration: underline;
    }

    /* Section Title */
    .gui-agent-wrapper .projects-section-title {
        font-size: 20px;
        margin-bottom: 24px;
        color: var(--accent-cyan);
    }

    .gui-agent-wrapper .projects-section-title.green {
        color: var(--accent-green);
    }

    .gui-agent-wrapper .projects-section-title.orange {
        color: var(--accent-orange);
    }

    .gui-agent-wrapper .projects-section-title.purple {
        color: var(--accent-purple);
    }

    /* Responsive */
    @media (max-width: 768px) {
        .gui-agent-wrapper .hero-stats {
            gap: 32px;
        }

        .gui-agent-wrapper .stat-value {
            font-size: 36px;
        }

        .gui-agent-wrapper .architecture {
            padding: 24px;
        }

        .gui-agent-wrapper .arch-row {
            flex-direction: column;
        }

        .gui-agent-wrapper .arch-arrow {
            transform: rotate(90deg);
        }
    }

    /* Scroll animations */
    .gui-agent-wrapper .fade-in {
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.6s ease;
    }

    .gui-agent-wrapper .fade-in.visible {
        opacity: 1;
        transform: translateY(0);
    }
</style>

<div class="gui-agent-wrapper">
    <div class="bg-grid"></div>
    <div class="floating-orb orb-1"></div>
    <div class="floating-orb orb-2"></div>
    <div class="floating-orb orb-3"></div>

    <!-- Hero -->
    <header class="hero">
        <div class="hero-badge">
            <span>2026 技术全景</span>
        </div>
        <h1>GUI Agent</h1>
        <p class="hero-subtitle">
            从 ADB 到 AutoGLM，从手机到浏览器，深入理解 AI 如何"看懂"并"操控"图形界面
        </p>
        <div class="hero-stats">
            <div class="stat-item">
                <div class="stat-value">3</div>
                <div class="stat-label">应用场景</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">10+</div>
                <div class="stat-label">开源项目</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">1</div>
                <div class="stat-label">核心范式</div>
            </div>
        </div>
    </header>

    <!-- Navigation -->
    <nav class="nav">
        <div class="container">
            <div class="nav-inner">
                <a href="#core" class="nav-link active">核心原理</a>
                <a href="#adb" class="nav-link">ADB 详解</a>
                <a href="#autoglm" class="nav-link">AutoGLM</a>
                <a href="#scenarios" class="nav-link">三大场景</a>
                <a href="#projects" class="nav-link">开源项目</a>
            </div>
        </div>
    </nav>

    <!-- Core Principle -->
    <section id="core">
        <div class="container">
            <div class="section-header fade-in">
                <span class="section-tag">核心范式</span>
                <h2 class="section-title">一个公式理解 GUI Agent</h2>
                <p class="section-desc">无论是手机、浏览器还是桌面，所有 GUI Agent 都遵循同一个核心循环</p>
            </div>

            <div class="architecture fade-in">
                <h3 class="arch-title">🔄 截图 → 理解 → 决策 → 执行 → 循环</h3>
                <div class="arch-flow">
                    <div class="arch-row">
                        <div class="arch-box">
                            <div class="arch-box-label">步骤 1</div>
                            <div class="arch-box-title">📸 截图</div>
                        </div>
                        <span class="arch-arrow">→</span>
                        <div class="arch-box highlight">
                            <div class="arch-box-label">步骤 2</div>
                            <div class="arch-box-title">🧠 VLM 理解</div>
                        </div>
                        <span class="arch-arrow">→</span>
                        <div class="arch-box">
                            <div class="arch-box-label">步骤 3</div>
                            <div class="arch-box-title">🎯 输出动作</div>
                        </div>
                    </div>
                    <div class="arch-arrow-down">↓</div>
                    <div class="arch-row">
                        <div class="arch-box">
                            <div class="arch-box-label">步骤 4</div>
                            <div class="arch-box-title">⚡ 执行操作</div>
                        </div>
                        <span class="arch-arrow">→</span>
                        <div class="arch-box">
                            <div class="arch-box-label">步骤 5</div>
                            <div class="arch-box-title">🔁 重新截图</div>
                        </div>
                        <span class="arch-arrow">→</span>
                        <div class="arch-box">
                            <div class="arch-box-label">循环</div>
                            <div class="arch-box-title">直到完成</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card-grid">
                <div class="card fade-in">
                    <div class="card-icon cyan">👁️</div>
                    <h3>视觉感知层</h3>
                    <p>通过截图获取当前界面状态，视觉语言模型（VLM）识别 UI 元素、按钮、输入框、文字等内容</p>
                </div>
                <div class="card fade-in">
                    <div class="card-icon purple">🧠</div>
                    <h3>规划决策层</h3>
                    <p>理解用户意图，将复杂任务拆解为步骤，根据当前界面状态决定下一步操作</p>
                </div>
                <div class="card fade-in">
                    <div class="card-icon green">🔧</div>
                    <h3>工具执行层</h3>
                    <p>将决策转化为具体操作指令，通过 ADB / Playwright / 系统 API 执行点击、滑动、输入等动作</p>
                </div>
            </div>

            <div class="info-box fade-in">
                <div class="info-box-title">💡 关键洞察</div>
                <p>这个范式的核心价值在于：<strong>不依赖任何 App 的内部 API</strong>，纯粹通过"看"界面来操作。这意味着它可以适用于任何图形界面，包括那些没有开放 API 的封闭系统。</p>
            </div>
        </div>
    </section>

    <!-- ADB Section -->
    <section id="adb" style="background: var(--bg-secondary);">
        <div class="container">
            <div class="section-header fade-in">
                <span class="section-tag">底层工具</span>
                <h2 class="section-title">ADB：Android 的"后门"</h2>
                <p class="section-desc">Android Debug Bridge 是 Google 官方提供的调试工具，也是手机 Agent 的执行基础</p>
            </div>

            <div class="card-grid">
                <div class="card fade-in">
                    <div class="card-icon orange">📱</div>
                    <h3>什么是 ADB？</h3>
                    <p>ADB（Android Debug Bridge）是 Android 开发者调试工具，允许电脑通过 USB 或 WiFi 与手机通信，执行各种操作命令</p>
                </div>
                <div class="card fade-in">
                    <div class="card-icon cyan">🎮</div>
                    <h3>能做什么？</h3>
                    <p>模拟人手操作：点击、滑动、长按、输入文字、按物理键（返回、Home）、截图、录屏、安装应用等</p>
                </div>
                <div class="card fade-in">
                    <div class="card-icon green">🔓</div>
                    <h3>如何开启？</h3>
                    <p>手机进入开发者模式（连续点击版本号 7 次），开启 USB 调试，用数据线连接电脑即可</p>
                </div>
            </div>

            <div class="code-block fade-in">
                <div class="code-header">
                    <span class="code-dot red"></span>
                    <span class="code-dot yellow"></span>
                    <span class="code-dot green"></span>
                    <span class="code-title">ADB 常用命令</span>
                </div>
                <div class="code-content">
<pre><span class="code-comment"># 检查已连接设备</span>
<span class="code-function">adb</span> devices

<span class="code-comment"># 点击屏幕坐标 (500, 800)</span>
<span class="code-function">adb</span> shell input <span class="code-keyword">tap</span> <span class="code-string">500 800</span>

<span class="code-comment"># 滑动：从 (100,500) 滑到 (100,100)</span>
<span class="code-function">adb</span> shell input <span class="code-keyword">swipe</span> <span class="code-string">100 500 100 100</span>

<span class="code-comment"># 输入文字（仅支持英文）</span>
<span class="code-function">adb</span> shell input <span class="code-keyword">text</span> <span class="code-string">"hello"</span>

<span class="code-comment"># 按返回键</span>
<span class="code-function">adb</span> shell input keyevent <span class="code-keyword">KEYCODE_BACK</span>

<span class="code-comment"># 按 Home 键</span>
<span class="code-function">adb</span> shell input keyevent <span class="code-keyword">KEYCODE_HOME</span>

<span class="code-comment"># 截图并保存到电脑</span>
<span class="code-function">adb</span> shell screencap <span class="code-string">/sdcard/screenshot.png</span>
<span class="code-function">adb</span> pull <span class="code-string">/sdcard/screenshot.png</span></pre>
                </div>
            </div>

            <div class="info-box warning fade-in">
                <div class="info-box-title">⚠️ ADB 的局限</div>
                <p>ADB 本身是"盲"的，只能执行命令（如点击坐标 500,800），但不知道那个位置是什么。这就是为什么需要 VLM 来"看"屏幕——<strong>ADB 是手，VLM 是眼睛和大脑</strong>。</p>
            </div>

            <div class="table-wrapper fade-in">
                <table>
                    <thead>
                        <tr>
                            <th>AutoGLM 操作</th>
                            <th>对应 ADB 命令</th>
                            <th>说明</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><code>Tap</code></td>
                            <td><code>adb shell input tap x y</code></td>
                            <td>点击指定坐标</td>
                        </tr>
                        <tr>
                            <td><code>Swipe</code></td>
                            <td><code>adb shell input swipe x1 y1 x2 y2</code></td>
                            <td>从起点滑到终点</td>
                        </tr>
                        <tr>
                            <td><code>Long Press</code></td>
                            <td><code>adb shell input swipe x y x y 1000</code></td>
                            <td>原地滑动1秒实现长按</td>
                        </tr>
                        <tr>
                            <td><code>Type</code></td>
                            <td><code>adb shell am broadcast -a ADB_INPUT_TEXT</code></td>
                            <td>通过 ADB Keyboard 输入中文</td>
                        </tr>
                        <tr>
                            <td><code>Back</code></td>
                            <td><code>adb shell input keyevent KEYCODE_BACK</code></td>
                            <td>按返回键</td>
                        </tr>
                        <tr>
                            <td><code>Home</code></td>
                            <td><code>adb shell input keyevent KEYCODE_HOME</code></td>
                            <td>回到桌面</td>
                        </tr>
                        <tr>
                            <td><code>Launch</code></td>
                            <td><code>adb shell monkey -p 包名 ...</code></td>
                            <td>启动应用</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </section>

    <!-- AutoGLM Section -->
    <section id="autoglm">
        <div class="container">
            <div class="section-header fade-in">
                <span class="section-tag">核心项目</span>
                <h2 class="section-title">Open-AutoGLM 深度解析</h2>
                <p class="section-desc">智谱 AI 开源的手机 Agent 框架，让 AI 像人一样操作手机</p>
            </div>

            <div class="timeline fade-in">
                <div class="timeline-item">
                    <div class="timeline-date">2024年10月</div>
                    <div class="timeline-title">AutoGLM 首次发布</div>
                    <div class="timeline-desc">业界首个能够在真实设备上稳定完成完整操作链的 AI Agent</div>
                </div>
                <div class="timeline-item">
                    <div class="timeline-date">2024年11月</div>
                    <div class="timeline-title">历史性时刻</div>
                    <div class="timeline-desc">AutoGLM 完成人类历史上首个 AI 自动化发送"红包"，通过银行界面一步步点击完成</div>
                </div>
                <div class="timeline-item">
                    <div class="timeline-date">2025年</div>
                    <div class="timeline-title">AutoGLM 2.0 发布</div>
                    <div class="timeline-desc">引入 MobileRL、ComputerRL、AgentRL 算法，验证强化学习的 Scaling Laws</div>
                </div>
                <div class="timeline-item">
                    <div class="timeline-date">2025年12月</div>
                    <div class="timeline-title">Open-AutoGLM 开源</div>
                    <div class="timeline-desc">完整开源手机 Agent 框架和 AutoGLM-Phone-9B 模型</div>
                </div>
            </div>

            <div class="architecture fade-in">
                <h3 class="arch-title">📐 AutoGLM 架构设计</h3>
                <div class="arch-flow">
                    <div class="arch-row">
                        <div class="arch-box">
                            <div class="arch-box-label">部署位置</div>
                            <div class="arch-box-title">☁️ 云端 / 服务器</div>
                        </div>
                    </div>
                    <div class="arch-arrow-down">↓ API 调用</div>
                    <div class="arch-row">
                        <div class="arch-box highlight">
                            <div class="arch-box-label">视觉语言模型</div>
                            <div class="arch-box-title">🧠 AutoGLM-Phone-9B</div>
                        </div>
                    </div>
                    <div class="arch-arrow-down">↓ 返回动作指令</div>
                    <div class="arch-row">
                        <div class="arch-box">
                            <div class="arch-box-label">运行位置</div>
                            <div class="arch-box-title">💻 用户电脑</div>
                        </div>
                    </div>
                    <div class="arch-arrow-down">↓ ADB 命令</div>
                    <div class="arch-row">
                        <div class="arch-box">
                            <div class="arch-box-label">被控设备</div>
                            <div class="arch-box-title">📱 Android 手机</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="info-box fade-in">
                <div class="info-box-title">📍 重要说明：模型不在手机上！</div>
                <p>AutoGLM-Phone-9B 是一个 9B 参数的视觉语言模型，需要约 20GB 显存。它运行在服务器或云端，<strong>手机只是被控端</strong>，只需开启 USB 调试和安装 ADB Keyboard。</p>
            </div>

            <div class="code-block fade-in">
                <div class="code-header">
                    <span class="code-dot red"></span>
                    <span class="code-dot yellow"></span>
                    <span class="code-dot green"></span>
                    <span class="code-title">模型输出格式</span>
                </div>
                <div class="code-content">
<pre><span class="code-comment">&lt;!-- 模型的输出包含思考过程和动作指令 --&gt;</span>

<span class="code-keyword">&lt;think&gt;</span>
当前在系统桌面，需要先启动小红书应用
<span class="code-keyword">&lt;/think&gt;</span>

<span class="code-keyword">&lt;answer&gt;</span>
<span class="code-function">do</span>(action=<span class="code-string">"Launch"</span>, app=<span class="code-string">"小红书"</span>)
<span class="code-keyword">&lt;/answer&gt;</span>

<span class="code-comment">&lt;!-- 下一步 --&gt;</span>

<span class="code-keyword">&lt;think&gt;</span>
小红书已打开，现在需要点击搜索框
<span class="code-keyword">&lt;/think&gt;</span>

<span class="code-keyword">&lt;answer&gt;</span>
<span class="code-function">do</span>(action=<span class="code-string">"Tap"</span>, element=<span class="code-string">[500, 100]</span>)
<span class="code-keyword">&lt;/answer&gt;</span></pre>
                </div>
            </div>

            <div class="card-grid">
                <div class="card fade-in">
                    <div class="card-icon purple">🔬</div>
                    <h3>关键技术洞察</h3>
                    <p>规划（Planning）和定位（Grounding）需要分离优化——规划追求灵活性，定位追求准确性，两者有不同的训练目标</p>
                </div>
                <div class="card fade-in">
                    <div class="card-icon green">📊</div>
                    <h3>性能表现</h3>
                    <p>在 AndroidLab 上达到 36.2% 成功率，在常用中文 App 上达到 89.7% 成功率，支持 50+ 款主流应用</p>
                </div>
                <div class="card fade-in">
                    <div class="card-icon cyan">🔧</div>
                    <h3>本质是 Function Calling</h3>
                    <p>Tap、Swipe 等操作就像给 LLM 定义的 Tools，模型决定调用哪个工具和参数，Agent 代码负责执行</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Three Scenarios -->
    <section id="scenarios" style="background: var(--bg-secondary);">
        <div class="container">
            <div class="section-header fade-in">
                <span class="section-tag">应用场景</span>
                <h2 class="section-title">三大 GUI Agent 场景</h2>
                <p class="section-desc">同一个核心范式，不同的执行层实现</p>
            </div>

            <div class="comparison-grid fade-in">
                <!-- Phone -->
                <div class="comparison-card">
                    <div class="comparison-header phone">
                        <h3>📱 手机 Agent</h3>
                        <p>Android / iOS / 鸿蒙</p>
                    </div>
                    <div class="comparison-body">
                        <div class="comparison-item">
                            <span class="comparison-icon">✓</span>
                            <span class="comparison-text"><strong>执行层：</strong>ADB (Android) / WebDriverAgent (iOS) / HDC (鸿蒙)</span>
                        </div>
                        <div class="comparison-item">
                            <span class="comparison-icon">✓</span>
                            <span class="comparison-text"><strong>代表项目：</strong>Open-AutoGLM</span>
                        </div>
                        <div class="comparison-item">
                            <span class="comparison-icon">✓</span>
                            <span class="comparison-text"><strong>典型操作：</strong>Tap、Swipe、Type、Launch、Back</span>
                        </div>
                        <div class="comparison-item">
                            <span class="comparison-icon">✓</span>
                            <span class="comparison-text"><strong>特点：</strong>需要开启开发者模式，手机只是被控端</span>
                        </div>
                        <div class="comparison-item">
                            <span class="comparison-icon">✓</span>
                            <span class="comparison-text"><strong>应用：</strong>自动点外卖、发消息、刷视频、抢票</span>
                        </div>
                    </div>
                </div>

                <!-- Browser -->
                <div class="comparison-card">
                    <div class="comparison-header browser">
                        <h3>🌐 浏览器 Agent</h3>
                        <p>Chrome / Firefox / WebKit</p>
                    </div>
                    <div class="comparison-body">
                        <div class="comparison-item">
                            <span class="comparison-icon">✓</span>
                            <span class="comparison-text"><strong>执行层：</strong>Playwright / Selenium / CDP</span>
                        </div>
                        <div class="comparison-item">
                            <span class="comparison-icon">✓</span>
                            <span class="comparison-text"><strong>代表项目：</strong>Browser-Use、Playwright MCP</span>
                        </div>
                        <div class="comparison-item">
                            <span class="comparison-icon">✓</span>
                            <span class="comparison-text"><strong>典型操作：</strong>Click、Type、Scroll、Navigate</span>
                        </div>
                        <div class="comparison-item">
                            <span class="comparison-icon">✓</span>
                            <span class="comparison-text"><strong>特点：</strong>可用 DOM 结构辅助定位，不完全依赖视觉</span>
                        </div>
                        <div class="comparison-item">
                            <span class="comparison-icon">✓</span>
                            <span class="comparison-text"><strong>应用：</strong>自动填表、数据采集、网页测试</span>
                        </div>
                    </div>
                </div>

                <!-- Desktop -->
                <div class="comparison-card">
                    <div class="comparison-header desktop">
                        <h3>🖥️ 桌面 Agent</h3>
                        <p>Windows / macOS / Linux</p>
                    </div>
                    <div class="comparison-body">
                        <div class="comparison-item">
                            <span class="comparison-icon">✓</span>
                            <span class="comparison-text"><strong>执行层：</strong>PyAutoGUI / 系统 API / Virtual Display</span>
                        </div>
                        <div class="comparison-item">
                            <span class="comparison-icon">✓</span>
                            <span class="comparison-text"><strong>代表项目：</strong>Claude Computer Use</span>
                        </div>
                        <div class="comparison-item">
                            <span class="comparison-icon">✓</span>
                            <span class="comparison-text"><strong>典型操作：</strong>Mouse Move、Click、Keyboard、Screenshot</span>
                        </div>
                        <div class="comparison-item">
                            <span class="comparison-icon">✓</span>
                            <span class="comparison-text"><strong>特点：</strong>纯视觉驱动，需要沙盒环境保证安全</span>
                        </div>
                        <div class="comparison-item">
                            <span class="comparison-icon">✓</span>
                            <span class="comparison-text"><strong>应用：</strong>操作 Office、IDE、任意桌面软件</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="table-wrapper fade-in" style="margin-top: 48px;">
                <table>
                    <thead>
                        <tr>
                            <th>对比项</th>
                            <th>手机 Agent</th>
                            <th>浏览器 Agent</th>
                            <th>桌面 Agent</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>截图方式</strong></td>
                            <td>adb screencap</td>
                            <td>page.screenshot()</td>
                            <td>系统截图 API</td>
                        </tr>
                        <tr>
                            <td><strong>元素定位</strong></td>
                            <td>纯视觉 + 坐标</td>
                            <td>DOM / 选择器 / 视觉</td>
                            <td>纯视觉 + 坐标</td>
                        </tr>
                        <tr>
                            <td><strong>点击执行</strong></td>
                            <td>adb shell input tap</td>
                            <td>element.click()</td>
                            <td>pyautogui.click()</td>
                        </tr>
                        <tr>
                            <td><strong>中文输入</strong></td>
                            <td>需要 ADB Keyboard</td>
                            <td>原生支持</td>
                            <td>系统输入法</td>
                        </tr>
                        <tr>
                            <td><strong>安全性</strong></td>
                            <td>需开发者权限</td>
                            <td>相对安全</td>
                            <td>建议沙盒环境</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </section>

    <!-- Projects -->
    <section id="projects">
        <div class="container">
            <div class="section-header fade-in">
                <span class="section-tag">生态全景</span>
                <h2 class="section-title">开源项目一览</h2>
                <p class="section-desc">GUI Agent 领域的主要开源项目和工具</p>
            </div>

            <h3 class="projects-section-title">📱 手机端</h3>
            <div class="projects-grid fade-in">
                <div class="project-card">
                    <div class="project-name">
                        Open-AutoGLM
                        <span class="project-tag">官方开源</span>
                    </div>
                    <p class="project-desc">智谱 AI 的手机 Agent 框架，支持 50+ 中文应用，包含完整模型权重</p>
                    <a href="https://github.com/zai-org/Open-AutoGLM" target="_blank" class="project-link">GitHub →</a>
                </div>
            </div>

            <h3 class="projects-section-title green" style="margin-top: 48px;">🌐 浏览器端</h3>
            <div class="projects-grid fade-in">
                <div class="project-card">
                    <div class="project-name">
                        Browser-Use
                        <span class="project-tag">热门</span>
                    </div>
                    <p class="project-desc">让网站对 AI Agent 友好的框架，支持多种 LLM 提供商</p>
                    <a href="https://github.com/browser-use/browser-use" target="_blank" class="project-link">GitHub →</a>
                </div>
                <div class="project-card">
                    <div class="project-name">
                        Playwright MCP
                    </div>
                    <p class="project-desc">微软官方的 MCP 服务器，让 LLM 通过结构化数据控制浏览器</p>
                    <a href="https://github.com/microsoft/playwright-mcp" target="_blank" class="project-link">GitHub →</a>
                </div>
                <div class="project-card">
                    <div class="project-name">
                        Nanobrowser
                    </div>
                    <p class="project-desc">开源 Chrome 扩展，多 Agent 协作完成复杂网页任务</p>
                    <a href="https://github.com/nanobrowser/nanobrowser" target="_blank" class="project-link">GitHub →</a>
                </div>
                <div class="project-card">
                    <div class="project-name">
                        Skyvern-AI
                    </div>
                    <p class="project-desc">通过视觉语言模型自动化浏览器工作流的框架</p>
                    <a href="https://github.com/Skyvern-AI/skyvern" target="_blank" class="project-link">GitHub →</a>
                </div>
                <div class="project-card">
                    <div class="project-name">
                        Steel Browser
                    </div>
                    <p class="project-desc">面向 AI Agent 的开源浏览器 API，电池全装型解决方案</p>
                    <a href="https://github.com/steel-dev/steel-browser" target="_blank" class="project-link">GitHub →</a>
                </div>
                <div class="project-card">
                    <div class="project-name">
                        Index
                    </div>
                    <p class="project-desc">SOTA 开源浏览器 Agent，支持结构化输出和高级可观测性</p>
                    <a href="https://github.com/lmnr-ai/index" target="_blank" class="project-link">GitHub →</a>
                </div>
            </div>

            <h3 class="projects-section-title orange" style="margin-top: 48px;">🖥️ 桌面端</h3>
            <div class="projects-grid fade-in">
                <div class="project-card">
                    <div class="project-name">
                        Claude Computer Use
                        <span class="project-tag">Anthropic</span>
                    </div>
                    <p class="project-desc">Anthropic 官方的桌面控制能力，通过截图 + 鼠标键盘操作完成任务</p>
                    <a href="https://docs.claude.com/en/docs/agents-and-tools/tool-use/computer-use-tool" target="_blank" class="project-link">文档 →</a>
                </div>
                <div class="project-card">
                    <div class="project-name">
                        OpenInterpreter
                    </div>
                    <p class="project-desc">开源 CLI Agent，可以写代码、执行命令、控制浏览器</p>
                    <a href="https://github.com/OpenInterpreter/open-interpreter" target="_blank" class="project-link">GitHub →</a>
                </div>
            </div>

            <h3 class="projects-section-title purple" style="margin-top: 48px;">🔧 底层工具</h3>
            <div class="projects-grid fade-in">
                <div class="project-card">
                    <div class="project-name">Playwright</div>
                    <p class="project-desc">微软出品的浏览器自动化框架，支持 Chromium、Firefox、WebKit</p>
                    <a href="https://github.com/microsoft/playwright" target="_blank" class="project-link">GitHub →</a>
                </div>
                <div class="project-card">
                    <div class="project-name">Selenium</div>
                    <p class="project-desc">老牌浏览器自动化工具，支持多语言，生态成熟</p>
                    <a href="https://www.selenium.dev/" target="_blank" class="project-link">官网 →</a>
                </div>
                <div class="project-card">
                    <div class="project-name">ADB Keyboard</div>
                    <p class="project-desc">让 ADB 支持中文输入的特殊输入法</p>
                    <a href="https://github.com/senzhk/ADBKeyBoard" target="_blank" class="project-link">GitHub →</a>
                </div>
            </div>
        </div>
    </section>

    <!-- Summary -->
    <section style="background: var(--bg-secondary);">
        <div class="container">
            <div class="section-header fade-in">
                <span class="section-tag">总结</span>
                <h2 class="section-title">核心要点回顾</h2>
            </div>

            <div class="card-grid">
                <div class="card fade-in">
                    <div class="card-icon cyan">1️⃣</div>
                    <h3>统一范式</h3>
                    <p>所有 GUI Agent 都遵循「截图 → VLM 理解 → 输出动作 → 执行 → 循环」的核心模式</p>
                </div>
                <div class="card fade-in">
                    <div class="card-icon purple">2️⃣</div>
                    <h3>工具抽象</h3>
                    <p>Tap、Click、Type 等操作本质是给模型定义的 Tools，类似 Function Calling</p>
                </div>
                <div class="card fade-in">
                    <div class="card-icon green">3️⃣</div>
                    <h3>分层架构</h3>
                    <p>VLM 在云端负责理解和决策，Agent 代码在本地负责截图和执行</p>
                </div>
                <div class="card fade-in">
                    <div class="card-icon orange">4️⃣</div>
                    <h3>场景适配</h3>
                    <p>手机用 ADB，浏览器用 Playwright，桌面用 PyAutoGUI，执行层可替换</p>
                </div>
                <div class="card fade-in">
                    <div class="card-icon pink">5️⃣</div>
                    <h3>未来方向</h3>
                    <p>端侧模型、多模态融合、安全机制是 GUI Agent 的重要演进方向</p>
                </div>
            </div>

            <div class="info-box fade-in" style="margin-top: 48px;">
                <div class="info-box-title">🚀 开始探索</div>
                <p>现在你已经理解了 GUI Agent 的核心原理！可以从 Open-AutoGLM（手机）或 Browser-Use（浏览器）开始实践，体验 AI 操控图形界面的魅力。</p>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer>
        <div class="container">
            <p>GUI Agent 技术全景 © 2026 | 持续更新中</p>
            <p style="margin-top: 12px;">
                <a href="https://github.com/zai-org/Open-AutoGLM">Open-AutoGLM</a> ·
                <a href="https://github.com/browser-use/browser-use">Browser-Use</a> ·
                <a href="https://docs.claude.com/en/docs/agents-and-tools/tool-use/computer-use-tool">Claude Computer Use</a>
            </p>
        </div>
    </footer>
</div>

<script>
// Scroll animations
document.addEventListener('DOMContentLoaded', function() {
    const fadeElements = document.querySelectorAll('.gui-agent-wrapper .fade-in');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    fadeElements.forEach(el => observer.observe(el));

    // Navigation active state
    const navLinks = document.querySelectorAll('.gui-agent-wrapper .nav-link');
    const sections = document.querySelectorAll('.gui-agent-wrapper section[id]');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (scrollY >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });
});
</script>
