---
layout: post
title: "接到一个新需求应该怎么做？(V1.0)"
description: "接到一个新需求应该怎么做？(V1.0)"
categories: [思考]
tags: [总结]
---


* Kramdown table of contents
{:toc .toc}

# 接到一个新需求应该怎么做？(V1.0)

## 1 背景
在做业务研发的时候，经常会接到一些 产品需求/技术需求, 无论需求大小，都需要一套可以重复使用的方法论，来保证整个项目的正常交付，这篇思考就是总结梳理抽象出这么一套方法论。     

> 从毕业工作到现在，没有真正思考过这类问题，一直觉得我的工作就是每天都有新的挑战（这也许是我能持续在这个行业工作的原因），但最近思考了下：难道真的每次都是“新挑战“？在这中一定存在者解决问题的方法论，而本篇文章目的就是总结出一个「当接到一个新的需求时，怎么做？」这个问题的方法论。

> v1.0 是版本，意思是后面还会有更高的版本，记录者关于这个问题，新的总结和思考。     

## 2 思考方向
我觉得可以大致分为两个方向：（1）项目管理方向。（2）技术实现方向。      
顾名思义，项目管理是为了保障整个项目能够顺利执行交付；技术实现是为了保障交付需求的质量。接下来我们一个一个的分析。     

## 3 项目管理
前两天看到了一篇文章[关于开放协作的一些思考](https://int32.me/blog/2023/08/14/opencollaboration/)，看完之后就在想在一个互联网公司有没有可以从中借鉴的地方，发现其实互联网公司项目管理制度跟开源社区的项目管理有一些相似性（准确的说，开源社区的项目管理挑战性更大）。    
参考 [关于开放协作的一些思考](https://int32.me/blog/2023/08/14/opencollaboration/) 中的RACI模型，我觉得可以分成如下几个阶段。    

### 3.1 明确参与人员
这个需求需要哪些人参与进来，可能有本团队的人，也可能需要其他团队的人一起协助一起做。比如：正常需求可能需要后端团队，前端团队，测试团队，产品团队等 相关人参与，具体需要哪些领域团队的人参与进来，要仔细明确下来。     

### 3.2 明确人员分工
参考[关于开放协作的一些思考](https://int32.me/blog/2023/08/14/opencollaboration/)里面的RACI模型，这里面需要      
（1）明确这个项目的主要负责人，即A这个角色。     
（2）明确参与到这个项目里每个团队的对接人，即R和R的Leader。      
（3）明确遇到问题可以咨询的人，不一定在参与人员名单中：比如技术架构专家，即C这个角色。      
（4）明确哪些人是需要被通知进度的，比如技术/产品老板，比如各个团队的leader，即I这个角色。    

### 3.3 明确里程碑
在需求迭代的过程中，应该不能只有一个交付时间，比如：小需求应该有个开发完成时间，联调时间，提测时间，测试开始时间，测试完成时间，产品验收时间，代码上线时间等。           

大需求可能会有更细化的小功能迭代时间，最好设置一些明确工作进度的里程碑，这个里程碑是要根据参与人员：至少是R的leader和A讨论出来的（有一定的信服力），并且同步公开到整个项目组里面的。     

### 3.4 进度汇报和问题反馈与解决
首先，整个项目要在关键时间点汇报进度，关键时间点不仅仅是里程碑上定好的时间点，更要有周期性的时间点：比如 每日 或者 每三天 或者 每周 定期汇报当前进度，汇报内容包括当前处于里程碑的哪一部分，距离下一个里程碑是否能够正常交付，如果不能正常交付，遇到了什么问题，问题的解决方案大概是怎么样的，预计交付的时间点是什么时候。这一阶段主打一个真实，公开。当遇到问题的时候，可以咨询RACI中C的角色，并对讨论内容和解决方案进行记录，并公开在整个项目的文档空间里面。     

> 这里比较关键的一点是问题反馈和解决需要记录 和 信息的公开，比如：要公开参与人员的变更、公开里程碑的调整、可以说所有一切不符合预期的变更最好记录并公开出来。       

## 4 技术实现

技术实现是为了能够让项目保质保量的按时交付，它没有明确的方法论，只有个大体的方向，而且可操作空间比较大，我们从一个较全面角度来看。     
大致可以分为下面几个步骤：    

1. 需求分析
2. 功能的基本设计
3. 优化
4. 保障
5. 提效

### 4.1 需求分析
需求分析的产出目标是：     
1. 明确产品新增加的功能点是什么。
2. 明确产品需求的合理性。
3. 明确需求涉及到的团队。
4. 明确相关的团队做什么事情。
   需求分析可能需要做下面几个事情
5. 罗列需求点：并且和需求提出者进行沟通，最终确认功能点没有遗漏。
6. 明确每个团队内部需要提供的能力：这个放在需求分析阶段的目的是有可能需求点由于团队与团队之前的扯皮而流产。

 
### 4.2 功能基本设计
假如我们是实现大需求中一部分功能的小团队。在明确我这个团队需要提供的能力之后，需要做的就是这些能力的实现。    

在思考做能力实现的时候，如果摸不到头绪，可以遵循三步走策略（1）功能的基本设计；（2）功能再优化；（3）功能稳定性保障；这个小模块主要集中在第一步：功能的基本设计上。     

功能的基本设计自底向上大致分为：     
1. 模型设计 (模型设计可以学习《领域驱动设计DDD》相关的资料。)
2. 存储选型 (这里存储选型一般持久化核心存储推荐 mysql)
3. 逻辑代码实现 (我之前在 [单品活动-C端价格计算代码重构引发的思考](https://int32.me/blog/2023/07/20/goodsactivity/) 里面思考了下 [什么样的业务代码算是好代码](https://int32.me/blog/2023/07/20/goodsactivity/#heading-2-%E4%BB%80%E4%B9%88%E6%A0%B7%E7%9A%84%E4%B8%9A%E5%8A%A1%E4%BB%A3%E7%A0%81%E7%AE%97%E6%98%AF%E5%A5%BD%E4%BB%A3%E7%A0%81) 里也提到了，自底向上大概分成四部分（1） 好的模型设计；（2）好的代码分层；（3）好的业务逻辑设计；（4）好的功能实现。)

当然，仅仅做功能的基本实现是不够的，因为业务体量的不同，可能对领域提供的功能性能有一定的要求，比如电商C端的服务功能基本都是要求高QPS，高性能，所以下一步就是做逻辑优化。    

### 4.3 优化

优化的方向也不是无迹可寻的，有一些成熟的架构可以借鉴。    

1. 如果能力特征是面向B端和C端的，B端重逻辑和多写操作，C端轻逻辑和多读操作，那可以将B端和C端进行CQRS架构改造，我之前做了几次B端和C端的CQRS拆分，可以参考下 ：[店铺架构CQRS改造](https://int32.me/blog/2019/07/30/shopcqrs/) 和 [单品活动-C端架构演进和稳定性建设](https://int32.me/blog/2023/07/06/goodsactivity/)
2. 如果能力特征是面向复杂搜索的，那可以朝着下面两个方向进行优化
   1. 将搜索能力托管给ES存储（大数据量，对响应要求不是特别高）
   2. 将数据内存化，之后结合 lucene 提供搜索能力（数据量不大，但是对响应要求特别高）
3. 如果正常结构化数据，但是对rt要求比较高的，可以借助redis做一层缓存
4. 如果对图关系比较敏感的，可以借助图数据库，比如：HugeGraph/Neo4j/GDB(阿里云)/BGraph(百度云)。
5. 如果具有时许特点并且进行时序统计的，可以借助主流的TSDB


总结一下，优化大概的方向是：在核心存储是mysql的前提下，针对不同场景的特征，选择一套针对性的存储组件，然后在做数据查询链路上加一层缓存设计。    

### 4.4 保障

每个项目对保障的要求级别是不一样的，比如有的项目只是个临时项目，出现问题对整个业务影响不大，甚至可以在出现问题的时候摘除此项目，即这种项目是可以降级的，这种保障级别就比较小，在保障上就不需要过多花费精力。如果项目是关键链路上且不能降级的（比如电商领域的商品中心），这种就需要在保障上多花费一些“成本”，而这些“成本”往往都是值得的。

> 从历史经历中得到的教训：在一个业务正常发展的公司，核心服务出现稳定性故障，造成的损失，往往比这个核心服务所使用的资源成本多的多。

保障大体可分为三个方向：
1. 服务稳定性保障
2. 数据一致性保障
3. 逻辑准确性保障

下面，逐一介绍下这三个方向可以做的事情。

**（1）服务稳定性保障**

往往可以通过这几个手段来提高服务的可用性和稳定性（从小到大，从简单到复杂）：（1）限流熔断。（2）数据冗余。（3）责任拆分。（4）异地多活。    

* 熔断限流：基本的保障手段，建议每个需要进行保障的能力都要具备。当流量超过服务能提供能力的一定限制时，对超过的量进行阻断。
* 数据冗余：最简单的数据冗余是将持久化的数据冗余到内存中（比如本机内存、Redis缓存等），在这里要注意：缓存雪崩、缓存击穿、缓存穿透、热点缓存等相关问题，在缓存的使用方法上，后面会单独写一篇文章进行总结。
* 责任拆分：比如CQRS的架构改造（感兴趣的可以看这篇文章 [店铺架构CQRS改造](https://int32.me/blog/2019/07/30/shopcqrs/) ），责任拆分的同时，一般会掺杂数据冗余一起操作。
* 异地多活：这种模式一般分为读多活和读写多活，需要公司的运维团队一起支持。

**（2）数据一致性保障**

当做数据冗余的时候，就会出现数据副本，而保障副本和主数据的最终一致性是主要目标。    

做数据一致性的时候，可以从 *发现数据不一致* 和 *恢复到数据一致* 两个角度来思考。如何发现数据不一致呢？可以采用扫描最近变化的数据，进行多数据源的比对。也可以采用对变更方的消息通知进行延迟之后，进行多数据源的比对。而发现数据不一致之后，也可以使用这种机制进行多数据源的最终一致性同步，以某一个数据源为准，将数据同步给其他数据源。如果出现大量数据不一致的问题，也要有手段针对性的全量数据触发这种数据同步。     

最终数据一致性可以是较实时的（在电商场景中，比如是秒级别的），也可以是准实时的（比如是分钟级），还可以是不实时的（比如是天级别），推荐这三种手段都做。     

**（3）逻辑准确性保障**

如何发现逻辑错误？这里不负责任的做法是通过业务/用户的反馈，但我们希望研发是第一批知道出了问题的人，所以要对功能做不同维度的监控，这里监控不单单是结果层面的，也要有过程层面的，研发要对每一项监控指标敏感。打个比方：如果你在做一个支付系统，不单单要监控支付成功、支付失败，还要监控微信支付成功、失败，支付宝支付成功、失败，支付金额在 0～10元档的，10～100元档的 等等。要求保障级别越高的功能，监控维度就要越全面。    

上面说的都是发生了逻辑问题之后才被研发感知到，而我们要尽可能把发现问题的阶段前移到功能上线之前。单靠覆盖性测试可能会达到一定的保障效果，但由于测试样本是人准备的，无法保证人不会犯错误，所以建议在覆盖性测试之后，也要走一遍线上的流量验证，最简单的做法是对线上代码执行的过程数据进行保存，并将数据回放到开发代码里，验证结果是否一致。（这类系统有很多相关文章，可以在网上搜索关键词：流量回放系统）      

### 4.5 提效

功能顺利上线，做完一定的稳定性保障之后，接下来可以做一些锦上添花的事情，目标是为了提高研发的开发、查问题的效率，解放研发自身。比如做一些业务工具开放给产品或业务，或者在代码运行过程层面做一些数据快照并持久化起来，帮助研发自身查问题等等，这里根据不同的业务可想想的空间比较大，不做方向上的限制。

## 5 总结

![图片](https://int32-blog.oss-cn-beijing.aliyuncs.com/%E6%96%B0%E9%9C%80%E6%B1%82.png)

这里是V1版本的导图，后面会持续不断完善出新的版本。