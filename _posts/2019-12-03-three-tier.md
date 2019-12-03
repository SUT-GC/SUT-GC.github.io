---
layout: post
title: "可扩展的三层代码设计"
description: "加油"
categories: [工作]
tags: [code]
---

* Kramdown table of contents
{:toc .toc}

# 可扩展的三层代码设计

![代码分层]({{site.paths.image}}/三层架构.jpg)

这次我们根据上面的图，来谈谈一个SOA服务的代码怎么分层才能做到维护起来如丝般顺滑，下面我们一层一层的说。    

* Soa Service层

SOA层是对外暴露的API层，来表现一些服务能力，打个比方，一个商户服务，可以修改店铺的营业时间，修改营业状态，修改店铺属性等等，这些基础能力的SOA接口则在SOA层暴露出来。

* Soa Facade Service层

这个叫Facade Soa也好，叫Biz Soa也好，如果是针对某些特定的方做的一些能力的聚合，则使用Facade会更好一些，比如店铺有针对营销的一些接口，并且做了一些裁剪，捆绑，包装等等，则可以抽象出一个 
ShopForPromotionFacadeSoa；如果是做一些逻辑上的定制，比如关店并且上锁，可以在ShopForLpdBalanceBizSoa接口里面暴露这个功能，所以具体是Facade还是Biz都是根据实际的功能来命名的，但总的来说，不管是Facade还是Biz，都是对基本Soa的细化，欢聚话说，基本Soa接口是对Facade和Biz的抽象。

> 综上， Soa和Soa Facade都可以安排在一个叫soa的包里面。当然肯定还有个对应的impl包

* Domain Service 层

Domain Service层是对具体业务领域的更近一次的抽象，更加接近于业务领域的原子接口，注意，这是业务领域的原子接口，比如Redis缓存，比如MQ消息发送，比如DB的数据操作，比如其他RPC信息的封装，DomainService接口接收和返回的是BO/Entity。

* Repository Service 层

仓库层，这个仓库是对底层基础设施的封装，比如DB，Redis，Rpc，Es等等... 仓库层对外接收和透出的是BO/Entity， 包括异常，也应该是屏蔽了底层第三方异常。

* Tunnel Service 层

通道层， 通道层是真正操作DB，Redis，Rpc等基础设施层，这里面透出的可以是第三方的DTO，可以是PO，可以是第三方的Exception

> 综上     
> Domain Service 和 Repository Service 这些可以安排在一个叫做 core 的包里面     
> Tunnel Service 可以安排在一个叫 common 的包里面

* 其他

如图，DomainService 从始至终都只有BO/Entity 在里面流转， soa impl包里面有BO/Entity 到 DTO 的Transformer， Repository 里面有 PO/第三方DTO到 BO/Entity 的Transformer...


