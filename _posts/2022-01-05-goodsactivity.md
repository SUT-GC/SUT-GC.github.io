---
layout: post
title: "领域建设：单品活动"
description: "领域建设：单品活动"
categories: [工作]
tags: [SOA]
---

* Kramdown table of contents
{:toc .toc}

# 单品活动-领域建设

## 1. 焦点

梳理电商流程中，单品活动领域相关的内容，以当前公司的「单品活动」领域为基础，概括出如下几点关键内容：

1. 边界
2. 功能
3. 模型
4. 架构

*说明：*        
* 这里不涉及商业、公司机密等相关内容。

## 2. 边界

### 2.1 什么是活动

> 这里只做简单说明，活动涉及的领域比较复杂，会有单独的一篇文章进行梳理。  

电商中的活动，最直接感受，是反应出来的商品价格，商品在日常售卖的价格是 5元，当在某些指定场景 或 时间下，售卖价格是3元。 这里5元就是商品原价，3元就是商品的活动价格。

活动可以是面向B端商家的（曝光，流量），可以是面向C端用户的（降价，补贴），而活动本身的形式又是多样的。这些这里都不做详细梳理，后面会单独写文章。

### 2.2  什么是单品活动

单品，即单个商品。单品活动，即只作用在单个商品上的活动。 

举例1：商品A，日常售卖价格是5元，由于店铺周年庆，推出半价购买的活动，即在店铺周年庆当天，顾客将以2.5元的价格购得。 店铺周年庆当天商品A以半价销售，就是单品活动。

举例2:  商品A，日常售卖价格是5元，由于店铺周年庆，推出1元钱够的活动，仅限10件，先到先得。即在店铺周年庆当天，前十名购买商品A的顾客将以1元的价格购得。 店铺周年庆当天商品A以1元销售10件，也单品活动。

举例3:  商品A，日常销售价格是5元，由于店铺周年庆，推出店铺内消费满10元，可以换购一件商品A，虽然A是0元购买的，但这种活动，就不能说是单品活动，是属于店铺门槛活动，即满足一定门槛之后，可以享受的活动。

举例4:  商品A，日常销售价格是5元，由于店铺周年庆，推出店铺内商品买够4件，商品总价打6折，虽然A可以用3元购得，但也不是单品活动，属于多拼活动-N件M折。

> 后面所有提到的 「活动」，若无特指，都是「单品活动」  

### 2.3 边界

只作用在单个商品上的活动，即不管是单独购买这个商品，还是购买多件商品中包括这件商品，都可以享受一个固定的活动价格，而不会因为购买了其他商品，导致以一个特殊的价格购买这个商品。

单品活动的边界：只作用单个商品，不会与其他商品联动，活动本身附着于该商品上的活动。

## 3 功能

### 3.1 表现形式和价格形式

单品活动的活动形式主要分为：限时活动，限量活动
单品活动的价格形式主要分为：一口价，折扣

限时活动：活动时间有限，在一定时间范围内商品以某个价格（比原价便宜）进行售卖，时间结束后恢复商品本身的售卖价格。

限量活动：活动数量有限，一定数量的商品，以某个价格（比原价便宜）进行售卖，活动数量售罄后，恢复商品本身的售卖价格。

一口价：一口价不是活动形式，是活动价格计算的一种手段，比如商品原价5元，活动一口价3元，即当商品涨价到6元的时候，活动价仍然是3元。

折扣：折扣也是活动价格的计算手段，商品原价5元，折扣6折，此时活动价是3元，当商品涨价到10元，此时活动价是6元，即活动价随着商品价格涨跌而涨跌。

关键字段：
* startTime
* endTime
* discountType
* activityValue

### 3.2 活动库存相关

活动库存，就是商品可以用这个活动价格，售卖多少件。

举例：商品A一共10件库存，原价5元，参加了周年庆活动，以3元的价格，卖5件（店铺可能只能容忍亏损5件），这个5件，就是说明「店铺周年庆」活动库存为 5件。

活动库存有两种形式：

* 锁定库存形式
* 共享库存形式

锁定库存举例：商品A一共10件库存，由于商品报名了「店铺周年庆」活动，要以3元的价格卖5件，那么：A商品只能以5元（原价）卖5件，以3元（活动价）卖5件。5件原价的卖光了，就不能用5元买A商品了（因为只能用3元买参加活动的5件）。

共享库存举例：商品A一共10件库存，由于商品报名了「店铺周年庆」活动，要以3元的价格卖5件，那么：A商品只能以5元（原价）卖5件，以3元（活动价）卖5件。5件原价的卖光了，还可以继续以原价购买，直到商品卖光。

区别：锁定库存的形式，会定死以活动卖多少件，以原价卖多少件；共享库存的形式，会将活动的库存和商品库存共享，是以活动最多购买多少件的意思。

活动库存维度有两种：

* 商品维度
* Sku维度

商品维度举例：商品A一共两个Sku（Sku1 售价10元和Sku2 售价20元），Sku1 5个库存，Sku2 5个库存，由于商品报名了「店铺周年庆」活动， Sku1活动价5元，sku2活动价8元，活动库存一共5个，即无论是买sku1 还是买sku2，如果买够5件之后，活动就会被卖光。

Sku维度举例：商品A一共两个Sku（Sku1 售价10元和Sku2 售价20元），Sku1 5个库存，Sku2 5个库存，由于商品报名了「店铺周年庆」活动， Sku1活动价5元，活动库存3件，sku2活动价8元，活动库存2件。即只能以5元活动价买sku1最多买3件，以8元活动价买sku2最多买2件。 当 sku1 和 sku2 的活动库存都卖光的时候，活动售罄。

优缺点：sku维度的活动库存，控制粒度更细，但更复杂。要考虑商品详情，当sku1的活动售罄，sku2的活动没有售罄，sku1是否可以售卖？ 商品维度的活动库存，不需要考虑这一点（因为商品所有sku都共享同一个活动库存，并不存在单一sku活动售罄的情况） 。商品维度的活动库存可以避免热点sku活动被抢光，但冷门sku活动没有人买，导致活动效果（销量）不理想的情况，可以增加活动的GMV。

关键字段：
* quantity
* soldQuantity
* reserveQuantity
* abandonQuantity

### 3.3 多活动叠加

商品不会只参与一个活动，由于业务的发展，一个商品可能同时参加多个活动，所以，多活动叠加之后，怎么进行最优活动的计算（即活动选价逻辑），是单品活动必须要考虑的事情。

两种策略：
* 价格优先
* 业务优先

价格优先指的是：当商品存在多个活动的时候，哪个活动的价格低，优先选择这个活动，它被用户看见，被用户下单享受该活动价。

思考的点1：如果一个商品多个sku同时参加了两个活动，那怎么定义两个活动谁的价格低就是需要思考的问题，通常可以采用比较两个活动中所参与的sku里面，用价格最低的那个进行比较。比如A活动中Sku1卖4元，Sku2卖20元；B活动中Sku1卖5元，Sku2卖15元。由于A活动最低价是4元，B活动最低价是5元，则A活动整体优先选择，被用户使用。

思考的点2：A活动中Sku1卖4元，Sku2卖20元；B活动中Sku1卖5元，Sku2卖15元。 为什么不能Sku1使用活动A的价格4元，Sku2使用活动B的价格5元？ 答案是：可以，但对商详不友好。因为商详是Goods维度展示的，同一个goods下，假设sku1是展示A活动价格，sku2是展示B活动价格，那如果商详展示活动氛围，应该展示哪个互动的氛围？（活动氛围有助于增强用户活动心智）

> 虽然感觉上，sku1是展示A活动价格，sku2是展示B活动价格（每个sku都是当前参与的所有活动中最低的活动价格），但对用户感知活动，不一定有正向的影响。  

业务优先指的是：当商品存在不同业务报名活动的时候，有的业务话语权比较高，当存在高业务优先级的活动，会优先出高业务优先级的活动（该逻辑跟公司具体业务有关，算是一种扩展能力）。

总体上，单品活动应该支持多活动叠加，可以在多个活动中选择最优活动供用户使用，活动应该是以商品维度进行比对和选择，最终决定整个商品出一个活动供用户使用，而不是在sku维度进行比对和选择。

### 3.5 条件筛选

可能需要针对不同的渠道，不同的人群，进行不同活动价展示/使用。

* 需求: A活动只能被渠道1的人使用，B活动只能被渠道2的人群α使用，C活动可以被所有人使用。

* 选价规则：    
	1. 如果存在渠道人群价，优先出渠道人群价，如果存在多个，按多活动并存的规则出
	2. 如果存在渠道价，再出渠道价，如果存在多个，按多活动并存的价格出
	3. 出其他活动，如果存在多个，按多活动并存的价格出

根据选价规则，模型上要体现出两个属性，一个是 条件类型（如 渠道价，渠道人群价，人群价）等，第二个是 条件参数（如 渠道值在某个范围内才可以）。

根据选价规则，可以看出整体活动过滤规则顺序为：活动通用有效性过滤（如时间，库存） -> 活动特殊条件过滤 -> 多活动并存出价规则

注意1: 过滤特殊条件过滤中有两种方式，一种是排他性的过滤：比如命中A活动后，如果A活动不再符合后面的过滤条件，则用户享受不到该活动，也享受不到其他活动（因为其他活动已经在 拍他性的条件过滤中筛选去掉了）；另一种是不排他性的过滤：比如命中A活动后，如果A活动不再符合后面的过滤条件（即发现用户没有享受任何活动），可以再使用其他活动再走后面的逻辑。     

注意2: 排他性的过滤好处是条件过滤和多活动并存出价代码只走一次。坏处是如果过滤选出了一个活动，当该活动在后面的条件中不满足的时候，就不能再选其他活动了。      

注意3: 将多活动并存出价的逻辑尽可能的简单，不要放置过滤操作，只做比较操作，即如果存在多个活动价的时候，一定会选出一个最终的活动价（这样就可以避免排他性过滤带来的问题）。所以说：边界清晰的重要性。      

问题：所需要的渠道和人群都从哪里来？渠道一般是上游带下来的，人群可以是上游带下来，也可以在条件参数里面冗余人群的查询地址，需要的时候去该地址进行查询。     

关键字段：    
* conditionType
* conditionParams

### 3.6  展示控制

某些页面（商详 / 落地页）需要展示某一个点才能购买的活动，在展示和售卖之间的时间段，称为：预热期（展示不可购买期）。

注意：可能是某些页面需要展示某个活动的预热期，也可能是所有页面都展示活动的预热期，而理论上来说，在该页面，只能存在一个需要展示预热的活动（如果存在多个，将会经过活动选择引擎选出之后，出现奇怪的问题），全页面展示预热 和 特定页面展示预热 也应该互斥。
注意：预热也会有开始前预热和结束后预热，都是为了营造氛围。在展示期的活动应该不可被以活动购买（可能允许原价购买）。

关键字段：      
* preheatPageFrom
* preheatStartTime
* preheatEndTime

### 3.7 购买控制

购买控制比较笼统，不同的业态有不同的玩法，在电商交易链路中下单这一环节，在用户点击支付拉起收银台之前，下单流程中会走一次活动校验，活动校验中可以做一些业态相关的校验规则：    
* 库存
* 活动时间
* 是否是当前最优活动价
* 是否命中活动限购

这里单独说一下活动限购，即用户在一段时间范围内只能以某个活动购买几次的问题。这个周期可能很长（如整个活动生命周期），也可能是一天。活动限购属于活动信息，但判断用户购买这个动作是否命中限购，可以独立成单独的服务，这个服务可以异步冗余活动上的限购信息，也可以根据上游传入活动限购信息（设计不同而已），然后出是否命中限购的结果给上游，这样限购相关的聚合起来，内部做逻辑会比较方便。    

限购演化的复杂一点，可以包括：    
* Sku限购
* Sku限购组
* Goods限购
* Goods限购组
* 单品活动限购
* 单品活动限购组

补充：Sku限购组即把多个Sku应用一个限购策略，比如在一天以内，Sku1或Sku2或Sku3，只能购买一件，无论购买了哪件，都不能购买其他剩余两件Sku，其他Goods限购组和活动限购组同理。    

### 3.8 业务标记

活动信息会有一些特定的标记，这些标记可能会影响选价引擎逻辑，可能什么都不影响，只用来带给下游。这些标记可能是boolean，可能是enum。
 
关键字段：    
* options
* optionsVersion

### 3.9 活动状态机

单品活动本身有着自己的数据状态，状态可以分为主状态和辅状态，主状态主要用作数据筛选使用，辅状态主要用作信息展示使用，每个主状态都会有自己的默认辅状态。

比如：    
1. 预生效（主状态：code 100）
	1. 预生效默认（辅状态：code 101）
2. 生效中（主状态：code 200）
	1. 生效中未到开始时间（辅状态：code 201）
	2. 生效中已到开始时间（辅状态：code 202）
	3. 生效中已售罄待补货（辅状态：code 203）
3. 已废弃（主状态：code 300）
	1. 已废弃被商家删除（辅状态：code 301）
	2. 已废弃被运营删除（辅状态：code 302）
	3. 已废弃被XX系统删除（辅状态：code 303）
4. 已结束（主状态：code 400）
	1. 已结束到结束时间结束（辅状态：code 401）
	2. 已结束售罄结束（辅状态：code 402）
5. 屏蔽中（主状态：code 500）
	1. 屏蔽中被XX系统屏蔽（辅状态：code 501）

状态机流转：    
![](http://int32-blog.oss-cn-beijing.aliyuncs.com/85943F89-4AE7-4264-825F-FA15CB57055E.png)

说明1： 预生效到生效为什么分两步？模仿两阶段提交，预生效到生效本身出错的概率会比较低，创建活动校验逻辑复杂，出错的概率较高。如果流程A和创建活动操作绑定，即只有先创建活动成功后，才能操作流程A，但流程A成功，才能启用活动。 这种就需要先预生效，再启用。（比如报名活动，和上资源位）

关键字段：    
* status
* subStatus

## 4 模型

### 4.1 ER图

![](http://int32-blog.oss-cn-beijing.aliyuncs.com/926287F2-C615-4E7F-A538-5C3491233E97.png)

一个活动会创建一个 `goods_activity_info` 和 多个 `sku_activity_price`.  

### 4.2 goods_activity_info 结构

![](http://int32-blog.oss-cn-beijing.aliyuncs.com/goods_activity_info.png)

### 4.3 sku_activity_price 结构

![](http://int32-blog.oss-cn-beijing.aliyuncs.com/sku_activity_price.png)

## 5 附加能力

一般基础服务（比如商品，活动等），大都具备的三个基础能力是：
* 修改流水
* 操作记录
* 消息通知

流水 和 记录 这里被分成了两类东西，作用也不一样，实现也不同。

### 5.1 流水

类似WAL的效果，跟真正的数据是一个库的，需要做事物，先写数据流水，再做数据更新，如果其中任何一个异常，需要回滚另一个。流水的作用是可以用来做幂等，对操作幂等。每次操作都要有流水id（操作id），写入流水代表本次操作成功，下次用同样的流水id进行操作将不被执行。可执行回滚动作，不过一般用不上回滚，或者回滚会以新的操作来体现。可以根据流水id进行整体链路的数据核对。         

注意1: 流水并不是所有信息都要记录，只关注重要的，需要核对的信息（比如活动价格， 活动状态）。      
注意2: 流水的数据结构的并不一定要跟DB的数据结构一样，比如可以记录（活动创建：仅是个动作）。        
注意3: 流水可以做动作上的幂等，但不能用来做乐观锁等，如果要做乐观锁，还是要使用乐观锁相关方案。     

![](http://int32-blog.oss-cn-beijing.aliyuncs.com/4DD2B6C1-020D-4625-8A29-FE21E47223F6.png)
![](http://int32-blog.oss-cn-beijing.aliyuncs.com/90A30AA8-1FCC-44B2-AAB6-92135C6BAFBF.png)

### 5.2 操作记录 & 消息通知

记录每次操作的结果，比如操作前什么样子，操作后什么样子，谁，什么时候，在哪操作的。记录不需要做事务，不需要阻塞流程。消息通知数据结构和传递的信息跟记录差不多。    

问题1: 记录和消息存储的是DTO还是BO，这个可以考虑下。DTO屏蔽了部分业务数据，反而BO暴露了更多业务数据，都不是很好的方案。亦或是可以独立建设消息/记录的DTO，跟正常业务的DTO隔离。     
问题2: 流水记录可以依赖消息，消息做通知使用，记录可以反过查询，流水记录的存储不需要局限于MySql，可以考虑NoSQL。     

![](http://int32-blog.oss-cn-beijing.aliyuncs.com/0051169C-74BB-4DEF-807D-688B90450C2A.png)

![](http://int32-blog.oss-cn-beijing.aliyuncs.com/E1D3265D-224D-45B8-A18E-99851D496DBC.png)

## 6 系统架构

### 6.1 整体链路交互

![](http://int32-blog.oss-cn-beijing.aliyuncs.com/6DD1879D-582D-4E98-B518-209E0CDEC7FC.png)

单品活动分别面向B端和C端两类。          
* B端：给商家/运营使用，进行单品活动的创建。     
* C端：        
	* 给商品列表，商品详情，下单合同使用，查询当前商品的最优价格。     
	* 给下单校验使用，校验用户使用的活动信息是否合法（比如活动是否结束，库存是否售罄，活动是否可购买）。     

单品活动主要依赖商品服务，有时候还会依赖人群标签等服务（比如某些人可以使用某些活动，通过活动筛选条件实现这种能力）。     

### 6.2 内部选价逻辑

![](http://int32-blog.oss-cn-beijing.aliyuncs.com/7A584A92-BF4C-4DAB-A117-A1B0B784392D.png)

注意1: 在选最优价格之前，将能过滤去掉的都过滤去掉。         

### 6.3 系统物理架构

![](http://int32-blog.oss-cn-beijing.aliyuncs.com/ED7AC2E4-3D3A-45C3-83D3-4FC65D70503C.png)

链路介绍：
1. 管理员后台/研发/运营 查询活动的创建&更新记录。    
2. 商品活动消费活动价变更消息，MQ可以做失败重试。      
3. 将商品活动变更消息加工（也可不加工）写入到ES中，提供搜索查询能力。      
4. 商品活动变更广播变更现场，由于只是广播，可以考虑做异步广播（即失败不阻塞主变更流程）。      
5. 「商品活动Sync Cache For Single」 调用 「商品活动 For single」清理缓存，前提流量不会因为缓存瞬间清除导致穿透且打挂DB。       
6. 「商品活动Cmp Cache For Single」 调用「商品活动 For single」查询缓存信息，并且比对8链路中查出来的数据，如果发现不一致，则调用「商品活动 For single」清理缓存。      
7. 商品活动DB变更广播DTS，「商品活动Cmp Cache For Single」接收到DTS直接清理缓存。      
8. 「商品活动Cmp Cache For Single」直接连商品活动的Slave库扫秒全库，并且调用「商品活动 For single」查询Redis中的数据，并且进行比对。      
9. Redis缓存未命中后，查询DB数据，并且将DB数据设置到Redis中（可以做防穿透措施）。      
10. 读Redis中的数据，这一层也可做本地缓存（针对特别热点数据）。      
11. 商品详情/下单等链路进行查询（QPS较高，对数据延迟不敏感，单商品维度查询）。      
12. 「商品活动Sync Cache For List」发现DB和HBase/Redis中的数据不一致，则查询「商品活动Base」的最新商品维度的数据。      
13. 商家/运营端/B端等 小流量且对数据延迟敏感的操作（创建，更新，更新之后的数据获取等）。      
14. 「商品活动Sync Cache For List」查询商品维度的数据（直接是DB数据）。      
15. 商品活动Base服务写/读 商品活动数据（直接走DB）。      
16. 「商品活动Sync Cache For List」将从「商品活动Base」中查询到的数据直接写入「商品活动For List」的Redis和HBase中。     
17. 「商品活动Cmp Cache For List」将从「商品活动Base」中查询到的最新DB数据写入「商品活动For List」的Redis和HBase中。    
18. 商品活动DB信息变更，发送DTS通知「商品活动Sync Cache For List」。      
19. 「商品活动Cmp Cache For List」扫描全库，和PHbase和Codis的数据进行比对。      
20. 搜/广/推 等超大流量，对数据延迟不敏感，且批量查询，对性能RT有要求的请求。      
21. 商品活动ForList 先走本地缓存查询，本地缓存Miss的话走Redis。      
22. 有些请求对数据延迟要求稍高一些，不走本地缓存，直接走Redis。因为本地缓存的更新是被动的。      
23. Redis数据Miss的时候，穿透到Hbase中。为什么要用HBase？因为HBase容纳数据量特别多，且支持批量查询。   