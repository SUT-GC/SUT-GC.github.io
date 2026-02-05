import coverBg from "@/assets/cover-bg.jpg";
import closingBg from "@/assets/closing-bg.jpg";

export type SlideType =
  | 'title-cover'
  | 'agenda'
  | 'section-divider'
  | 'content'
  | 'closing'
  | 'comparison'
  | 'quote'
  | 'pyramid'
  | 'stats'
  | 'resources'
  | 'cta'
  | 'demo'
  | 'code-example'
  | 'timeline'
  | 'video';

export interface SlideData {
  id: string;
  type: SlideType;
  title: string;
  subtitle?: string;
  points?: string[];
  image?: string;
  extra?: string;
  leftTitle?: string;
  leftPoints?: string[];
  leftIcon?: string;
  rightTitle?: string;
  rightPoints?: string[];
  rightIcon?: string;
  quote?: string;
  quoteCn?: string;
  quoteAuthor?: string;
  pyramidLevels?: { title: string; description: string; icon?: string }[];
  stats?: { value: string; label: string; description?: string }[];
  resources?: { title: string; url: string; description?: string }[];
  code?: string;
  codeLanguage?: string;
  videoUrl?: string;
}

export const slides: SlideData[] = [
  {
    id: "cover",
    type: "title-cover",
    title: "DevOps & Docker",
    subtitle: "shop.ops@ele.me",
    points: ["DevOps 与 Docker 技术分享"],
    image: coverBg
  },
  {
    id: "devops-divider",
    type: "section-divider",
    title: "DevOps",
    points: ["文化 + 过程 + 工具"]
  },
  {
    id: "devops-definition",
    type: "content",
    title: "DevOps = 文化 + 过程 + 工具",
    points: [
      "DevOps 的核心理念",
      "• 开发与运维的协作文化",
      "• 持续集成与持续交付的过程",
      "• 自动化工具链的支撑"
    ]
  },
  {
    id: "conflict",
    type: "comparison",
    title: "开发与运维的冲突",
    leftTitle: "开发",
    leftIcon: "💻",
    leftPoints: [
      "我要改变！",
      "代码在我电脑上跑的好好的啊！"
    ],
    rightTitle: "运维",
    rightIcon: "🔧",
    rightPoints: [
      "我要稳定！",
      "为什么不能提前评估好资源呢！"
    ],
    extra: "QA: ..."
  },
  {
    id: "advantage",
    type: "content",
    title: "DevOps 的优势",
    points: [
      "缩短开发上线周期",
      "减少扯皮沟通成本",
      "上线回滚风险可控"
    ]
  },
  {
    id: "cicd",
    type: "content",
    title: "Agile & CI/CD & DevOps",
    points: [
      "CI/CD = Continuous Integration and Continuous Delivery",
      "• 敏捷开发提供方法论",
      "• CI/CD 提供自动化流程",
      "• DevOps 提供文化与工具整合"
    ]
  },
  {
    id: "docker-divider",
    type: "section-divider",
    title: "Docker",
    points: ["容器化技术"]
  },
  {
    id: "machine-evolution",
    type: "comparison",
    title: "从物理机到容器",
    leftTitle: "物理机",
    leftIcon: "🖥️",
    leftPoints: [
      "部署慢",
      "成本高",
      "资源浪费",
      "难于扩展"
    ],
    rightTitle: "虚拟机",
    rightIcon: "📦",
    rightPoints: [
      "资源利用率高",
      "易扩展",
      "Guest OS 消耗资源大",
      "Dev 和 Ops 矛盾未消除"
    ]
  },
  {
    id: "docker-advantage",
    type: "content",
    title: "Docker 容器",
    points: [
      "启动速度更快",
      "环境一致，编排方便"
    ],
    extra: "容器化是 DevOps 的关键基础设施"
  },
  {
    id: "docker-keywords",
    type: "content",
    title: "Docker 关键概念",
    points: [
      "Image（镜像）",
      "• 只读，环境某个时间点的状态，类比 Java 的 Class",
      "Container（容器）",
      "• 可读可写，是镜像实例化后的结果，类比 Java 的 Object",
      "Volume（数据卷）",
      "• 容器共享的部分，类比 Java 的 static 变量，不会因容器消亡而消亡"
    ]
  },
  {
    id: "devops-docker-divider",
    type: "section-divider",
    title: "DevOps + Docker",
    points: ["实践结合"]
  },
  {
    id: "tools",
    type: "content",
    title: "依赖工具",
    points: [
      "GitLab — 代码仓库",
      "Docker Hub — Docker 仓库",
      "GitLab Runner — GitLab 自带的运行器，结合 CI/CD",
      "Docker — 容器技术"
    ]
  },
  {
    id: "demo-issues",
    type: "content",
    title: "Demo 层面的问题与解决",
    points: [
      "Runner 与 Prod 不是同一台机器",
      "• Runner 只负责生成/记录 Image，开发自行部署",
      "部署机器不只一台",
      "• 使用 Docker Swarm 或 Kubernetes",
      "容器更替时存在服务 down 机",
      "• Docker Stack 的 update 操作支持蓝绿更新"
    ]
  },
  {
    id: "more-divider",
    type: "section-divider",
    title: "More Gameplay",
    points: ["Docker 的更多玩法"]
  },
  {
    id: "orchestration",
    type: "content",
    title: "服务编排",
    points: [
      "Docker Compose",
      "• 按依赖关系启动容器，只支持单机运行",
      "Docker Swarm",
      "• 集成在 Docker 中，无需额外安装，支持集群部署",
      "Kubernetes",
      "• 支持集群部署，功能更丰富"
    ],
    extra: "环境隔离是 Docker 的核心能力之一"
  },
  {
    id: "summary",
    type: "content",
    title: "Summary",
    points: [
      "我对 DevOps 的理解",
      "Docker 在 DevOps 中可以发挥什么样的作用",
      "Docker 能力的简单布道"
    ]
  },
  {
    id: "closing",
    type: "closing",
    title: "THANK YOU",
    points: ["问题？"],
    image: closingBg
  }
];
