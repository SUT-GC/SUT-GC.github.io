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
    title: "门店运营组",
    subtitle: "压力平衡调控系统",
    points: ["门店 LPD 相关分享"],
    image: coverBg
  },
  {
    id: "background-divider",
    type: "section-divider",
    title: "背景介绍",
    points: ["为什么需要压力平衡？"]
  },
  {
    id: "why-balance",
    type: "content",
    title: "为什么能压力平衡？",
    points: [
      "隐藏各类活动",
      "增加配送费",
      "缩小配送范围",
      "关闭店铺"
    ],
    extra: "只管平台配送的店，目标是减少店铺订单"
  },
  {
    id: "contract",
    type: "content",
    title: "契约承诺",
    points: [
      "支持约 400次/s 的调控吞吐量",
      "上游保证调控-取消顺序的前提下支持策略覆盖",
      "执行结果友好反馈"
    ]
  },
  {
    id: "challenges",
    type: "content",
    title: "隐藏关卡",
    points: [
      "日常报表 ⭐",
      "保证调控 ⭐⭐",
      "系统压力 ⭐⭐⭐",
      "保证取消 ⭐⭐⭐⭐",
      "吞吐量大 ⭐⭐⭐⭐⭐"
    ]
  },
  {
    id: "design-divider",
    type: "section-divider",
    title: "方案设计",
    points: ["从简单到系统"]
  },
  {
    id: "solution-1",
    type: "code-example",
    title: "方案1：循环调用",
    code: `def apply(shop_ids, strategy):
    result = {}
    for shop_id in shop_ids:
        result[shop_id] = executeApplyStrategy(shop_id, strategy)
    return result

def cancel(shop_ids, strategy):
    result = {}
    for shop_id in shop_ids:
        result[shop_id] = executeCancelStrategy(shop_id, strategy)
    return result`,
    codeLanguage: "python",
    extra: "最简单的实现方式"
  },
  {
    id: "solution-1-problems",
    type: "content",
    title: "方案1的问题",
    points: [
      "吞吐量小",
      "交互不友好",
      "无法称作系统"
    ],
    extra: "Are you kidding me?!"
  },
  {
    id: "solution-2-divider",
    type: "section-divider",
    title: "方案2：压力平衡 1.0",
    points: ["真正的系统化方案"]
  },
  {
    id: "lifecycle",
    type: "content",
    title: "生命周期",
    points: [
      "数据来源",
      "• 服务包签约",
      "数据维护/消费",
      "• 维护：Melody、Xy",
      "• 消费：主搜(search、rank)、导购、交易订单",
      "数据消亡",
      "• 服务包签约"
    ]
  },
  {
    id: "chain-store",
    type: "content",
    title: "连锁店信息",
    points: [
      "层级结构"
    ]
  },
  {
    id: "redundant-info",
    type: "content",
    title: "冗余信息",
    extra: "由于某些数据以前是在门店运营，现在被单独拆分到其他领域",
    points: [
      "POI 信息",
      "品牌信息",
      "品类信息",
      "资质信息",
      "部分交易相关信息"
    ]
  },
  {
    id: "architecture-divider",
    type: "section-divider",
    title: "架构图",
    points: ["业务架构 & 系统架构"]
  },
  {
    id: "team",
    type: "content",
    title: "人员结构",
    points: [
      "开发（暂时）",
      "• 勾超、程光庆、马腾跃、邵忆乐、茹俊江",
      "测试",
      "• 周茹姨、武贯兰",
      "产品",
      "• 高婕、刘畅、费梦燕"
    ]
  },
  {
    id: "closing",
    type: "closing",
    title: "谢谢",
    points: ["问题？"],
    image: closingBg
  }
];
