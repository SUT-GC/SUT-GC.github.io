---
layout: post
title: "由单品活动C端价格计算代码重构引发的思考"
description: "由单品活动C端价格计算代码重构引发的思考"
categories: [工作]
tags: [总结]
---

* Kramdown table of contents
{:toc .toc}


# 由单品活动C端价格计算代码重构引发的思考

## 1 前言

在工作三年的时候，写过一篇思考叫[你觉得基础服务代码应该怎么写](https://int32.me/blog/2019/03/31/baseservice/), 当时我在饿了么店铺中心做开发，是一个纯CRUD服务，所以当时觉得写好店铺中心的代码很简单，无非就是 事前+事中+事后 三板斧。事前校验操作合法性，事中执行核心事务逻辑，事后把杂七杂八跟事务无关的事情做好。那么现在又工作了三年，面对单品活动这种复杂的业务特性，是否有什么新的感悟和想法，都写在这篇思考里。

## 2 什么样的业务代码算是好代码

![]({{site.paths.image}}/20230726/image.png)

抛开服务与服务之间的架构设计，单说一个具体的业务服务内部，我觉得，好的代码从大到小可以分为以下四点： 首先要设计好自己的领域模型；然后规划好服务的代码分层（曾经有过一篇关于代码分层的总结，可以参看：[可扩展的三层代码设计](https://int32.me/blog/2019/12/03/three-tier/) ）；然后在承接业务的时候，逐渐抽象出来的业务逻辑设计；最终落在每个细节点内的好的功能实现。从大到小结合全面结合起来，才算是好的代码设计。

## 3 怎样的设计才算好的业务逻辑设计

这篇思考，主要是结合在单品活动C端业务逻辑代码重构过程，总结出来的一些想法，所以，主要集中在「好的业务逻辑设计」这一个点。

我认为好的业务逻辑设计是以一下几个点作为思考目标的：
1. 代码结构映射业务流程，即出现预期外业务结果的时候，能够立刻定位到代码位置。
2. 需求开发，代码改动影响可评估，即知道改的是整条链路的哪一部分，改动之后会造成什么影响。
3. 多人并行开发新需求过程中冲突尽量少，即尽可能把新功能做成插件式，每个人只是在开发新的插件，重叠的可能性较少。

>  提前说一下，针对「怎样的设计才算好的业务逻辑设计」这个我不是给出最终的答案，而是针对这个问题，引出大家的思考，并且给出我现阶段找到的解决办法。

单品活动领域对C端的功能很简单，简单来说，就是上游给一个商品ID，如果这个商品本身有活动的话，经过单品活动服务之后，会给出这个商品应该给用户 展示/购买 的价格。

但计算价格这个事情本身就不容易，包含着复杂的业务逻辑，比如：
* 不同场景需要用不同的数据源
* 不同人群看到的价格不一样
* 不同实验组看到的价格不一样
* 不同活动类型，价格计算逻辑不一样
* 不同业务，选择最优价的逻辑不一样
* 等等等

如果要按照业务流程来写代码，一个`.java` 文件里面可能要写进去1万行代码。而….重构之前的代码，基本就是按照业务流程和需求文档堆砌出来的。

但其实按照 执行前，执行中，执行后 ，可以分成如下一些逻辑：

![]({{site.paths.image}}/20230726/image%202.png)
总结一下：
1. 主要逻辑可分三大部分：选最优活动之前，选最优活动过程中，选最后活动之后。
2. 选价之前，又可以分为 填充数据 和 修正数据 两部分，这两部分分别根据场景不同也业务身份不同可以路由到不同的修正逻辑上。
3. 选价过程中根据业务身份做不同的最优价格计算逻辑路由。
4. 选价之后 需要 订正数据，组装返回值，对返回值进行合法性校验，并且对返回值进行监控操作等。

下面是简化了一些业务逻辑之后的代码截图（抹除了业务相关信息）：

<img src="{{site.paths.image}}/20230726/image%203.png" width="826">
<img src="{{site.paths.image}}/20230726/image%205.png" width="826">
<img src="{{site.paths.image}}/20230726/image%204.png" width="826">

## 4 总结

* 复杂的业务逻辑并不代表代码会写的很复杂，代码很复杂可能是用了很多 if…else… 导致的。
* 复杂的业务逻辑也会有简单的框架，用分层梳理的方法可能会有收获。比如单品活动领域内：先按照 选最优价之前、选最优价过程中、选最优价之后 分好之后，再细化 选最优价分成几个大步骤，然后这样一层一层的细化。
* 所有的改造都要做到 可灰度、可回滚、可监控、可验证。