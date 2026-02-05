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
    title: "Kotlin",
    subtitle: "Thorough",
    points: ["Kotlin 语言深入分享"],
    image: coverBg
  },
  {
    id: "agenda",
    type: "agenda",
    title: "Outlook",
    points: [
      "Class & Object",
      "Annotation & Reflex"
    ]
  },
  {
    id: "class-object-divider",
    type: "section-divider",
    title: "Class & Object",
    points: ["类与对象"]
  },
  {
    id: "class-object-content",
    type: "content",
    title: "Class & Object",
    points: [
      "class, properties",
      "• 类定义与属性声明",
      "extension, delegation, aggregation",
      "• 扩展函数、委托模式、聚合",
      "generics",
      "• 泛型与类型参数"
    ]
  },
  {
    id: "annotation-reflex-divider",
    type: "section-divider",
    title: "Annotation & Reflex",
    points: ["注解与反射"]
  },
  {
    id: "annotation-reflex-content",
    type: "content",
    title: "Annotation & Reflex",
    points: [
      "annotation",
      "• 注解的定义与使用",
      "reflex",
      "• 反射机制与运行时类型信息"
    ]
  },
  {
    id: "next-divider",
    type: "section-divider",
    title: "Next",
    points: ["下一步探索"]
  },
  {
    id: "cooperation",
    type: "content",
    title: "Kotlin Cooperation",
    points: [
      "with Java",
      "• Kotlin 与 Java 的互操作",
      "with JavaScript",
      "• Kotlin/JS 编译目标",
      "with Script",
      "• Kotlin 脚本化使用"
    ]
  },
  {
    id: "closing",
    type: "closing",
    title: "Thanks",
    points: ["All the Best"],
    image: closingBg
  }
];
