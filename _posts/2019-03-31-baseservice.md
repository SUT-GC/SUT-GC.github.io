---
layout: post
title: "你觉得基础服务的代码应该怎么写呢？"
description: "沉淀·不忘初心"
categories: [工作]
tags: [总结]
---

* Kramdown table of contents
{:toc .toc}

# 你觉得基础服务的代码应该怎么写呢？

## 背景

公司微服务化之后，很多大的项目都被拆解成不同模块，这些模块彼此交互，互相依赖，最终一起支撑起线上庞大的业务量。     
       
 ![系统调用链路]({{site.paths.image}}/baseservice01.jpg)

以餐饮平台的店铺领域为Demo，这里用一张图来描述下一个领域内可能拥有的服务模块及其依赖关系， 下面我们来详细的说明下具体模块及承担的角色。     

### 服务分层

根据三层原则将服务分成广义的 API， Business， Data 三层。     

#### API层

DTO为数据传输层， 对于一个领域来说是各种API， 如 界面API， 开放平台API， 其他领域服务API，定时任务API。     

* 界面API： 应对与前端的api服务，与前端界面直接交互， 鉴权，跨域，防爬等手段都做在该服务上。
* 开放平台API：应对与第三方服务， 同样有鉴权，防爬，限流等能力
* 其他领域服务API：即为其他领域的服务，在途中对应为other_service， 这些服务不属于本领域，但因为领域之间相互依赖能力，所以会存在其他领域的服务到自己领域的调用（可能是同步rpc，也可能是异步message）
* 定时任务API：对应图中job_service,  在ci能力全一点的公司，会有任务触发中间件，它负责定时触发配置好的任务，方便管理和监控。具有这个能力的中间件服务称为job_service。

#### Business层

Business层为业务体现层，领域内的具体业务在这一层体现，举个例子：店铺领域接到了一个产品需求，商家把店铺关店的时候要把所有的商品都下线（这个例子不太合理）。 那么关店动作肯定是发生在api层， 可能是页面，可能是开放平台，可能是其他服务做关店操作，但“关店&下线商品”是涉及到两个领域的业务逻辑， 所以要将这个逻辑在写
business这一层。       

#### Data层

Data层是基础服务层，提供基础的数据能力，为上层业务提供能力支持， 数据层为领域内数据操作的原子动作， 在店铺领域，比如开关店，上下线，修改店铺的一个或者几个信息，这一层的服务能力和代码就是本文要探讨的。

#### 说明

上述个模块并不是一定要存在的， 由于公司业务的复杂度和微服务化粒度不同，都会有不同的体现， 但个人认为广义上来说都会存在以上的角色，只不过一个服务可能同时承担两个或两个以上的角色，当然也可能存在多个服务共同承担一个角色。

## 基础服务层能力分析

作为基础服务层提供该领域内核心数据的CRUD原子能力， 但不单单是DB的CRUD，是抽象到一个领域内的操作，这些操作在基本DB的操作上会做一些其他的事情，比如notice，比如change record 的落地，当然也可能会有rpc调用（不推荐）。 

![系统调用链路]({{site.paths.image}}/baseservice02.jpg)

我认为，基础服务可以大致分为 门面 和 核心 两层， 门面层负责对外，核心层负责包装领域的操作。

### 门面

门面层是对外部指定方的能力提供，比如商品领域可以控制店铺营业状态，也只能控制店铺营业状态， 则门店层要对商品透出且仅透出营业状态的控制，这样虽然接入起来麻烦，但使得对不同的领域可以有不同的实现， 使得控制最大化。 不同实现是什么意思呢？ 比如面上商户使用的操作是最大期望成功的，那么可以在面上商户操作的Facade上进行内部重试， 尽可能的降低失败概率，保证用户体验最好。

### 核心

核心层是领域内最大能力的表现，核心层的接口对外透出该领域能提供的最大能力， 比如门店领域， 核心层接口可以更新所有会被更新的字段，门店有 name, address, location, logo, servingTime, servingStatus 等字段，那么核心层接就可以对上面一个或多个字段进行更新。    

核心层接口包装领域内的“原子”操作，这些操作可以分为：执行前，执行，执行后。 

* 执行前： 各种校验，如参数合法性校验， 业务合法性校验（比如更新某个字段的时候必须那个字段有值等）等，业务异常可以在这里抛出。
* 执行：真正DB数据的CRUD，这里理论上不应该抛义务异常，可以抛RuntimeException或者SystemException
* 执行后：这里做执行成功后的一些后事的处理，比如 scene notice，log record，理论上这里不应该抛异常，但如果出现异常可以做一些打点/监控/报警等。（抛异常也没关系，但这样要求执行模块做好幂等，因为底层的异常很可能导致上层服务的重试）


### 说明

门面的接口最终都是调用核心服务提供的接口， 门面的接口实现上可以最对不同调用方独特的逻辑，但不要冗余公共逻辑，公共逻辑应该抽象到核心层。


## 代码怎么写

### 说在前面

下面代码和结构纯属个人见解，并不保证最优结构，可以探讨。

### 代码结构

```text
shop-base
+-- shop-base-inner
	+-- dao
	+-- util
	+-- event
	+-- service
+-- shop-base-api
	+-- facade.api
	     +-- facadeApi1.java
	     +-- facadeApi2.java 
    +-- core.api
	    +-- coreApi1.java
	    +-- coreApi2.java
+-- shop-base-impl
	+-- impl.facade
		+-- facadeApi1Impl.java
		+-- facadeApi2Impl.java
	+-- impl.core
		+-- coreApi1Impl.java
		+-- coreApi2Impl.java
	+-- transformers
	+-- publishers
	+-- validators
	+-- utils
	
```

### 上代码（JAVA）

#### 门面接口

```java
public class ShopInfoForLpdBalanceFacadeSoaServiceImpl implements ShopInfoForLpdBalanceFacadeSoaService {
    @Inject
    // 核心接口
    private ShopInfoSoaServiceImpl shopInfoSoaService;

    /**
     * 关店并上锁
     * @param shopId 店铺id
     * @param blockShop 是否锁店
     * @param busyLevel 营业状态
     * @param userId 操作人id
     * @param remark 备注
     * @param sourceDTO 来源
     * @throws ServiceException 业务异常
     **/
    @Override
    public void closeAndLockShop(long shopId, Boolean blockShop, BusyLevelDTO busyLevel, long userId, String remark, UpdateSourceDTO sourceDTO) throws ServiceException {
        ShopDTO shopDTO = shopInfoSoaService.getBindMaster(shopId);

        if (shopDTO == null) {
            throw MyExceptionFactory.instance(ErrorCode.RESTAURANT_NOT_FOUND);
        }

        if (blockShop == null && busyLevel == null) {
            return;
        }

        // ..... 省略将参数如何转换为核心接口需要参数的代码
        
        // 调用核心接口
        shopInfoSoaService.update(shopId, shopUpdateDTO, userId, remark, sourceDTO);
    }
}
```

对应上面的图，门面接口对外暴露的接入方方便识别的定义，而不是领域内的定义，所以接口使用方只需要关注它想做的事情即可，不需要过度理解具体领域内的东西

#### 核心接口

```java
public interface ShopInfoSoaService {

    /**
     * 查询店铺信息
     * @param shopId 店铺id
     * @return 店铺信息 未查到返回null
     */
    ShopDTO get(long shopId);

    /**
     * 批量查询店铺信息
     * @param shopIds 店铺id列表
     * @return 店铺id:店铺信息 店铺信息未查到，返回null
     */
    Map<Long, ShopDTO> batchGet(@NotNull @Size(min = 1, max = 100) List<Long> shopIds);

    /**
     * Replace店铺信息
     *
     * <p>将店铺信息按照updateDTO进行Replace，如果updateDTO属性为null,则赋予默认值</p>
     *
     * @param shopId 店铺id
     * @param updateDTO 最新信息
     * @param userId 用户id
     * @param remark 备注
     * @param source 更新来源
     * @return 更新之后的店铺信息
     * @throws ServiceException 业务异常
     */
    ShopDTO replace(long shopId, @NotNull ShopUpdateDTO updateDTO, long userId, @NotNull String remark, @NotNull UpdateSourceDTO source) throws ServiceException;

    /**
     * Replace店铺信息
     *
     * <p>将店铺信息按照updateDTO进行Update，如果updateDTO属性为null,则不更新</p>
     *
     * @param shopId 店铺id
     * @param updateDTO 最新信息
     * @param userId 用户id
     * @param remark 备注
     * @param source 更新来源
     * @return 更新之后的店铺信息
     * @throws ServiceException 业务异常
     */
    ShopDTO update(long shopId, @NotNull ShopUpdateDTO updateDTO, long userId, @NotNull String remark, @NotNull UpdateSourceDTO source) throws ServiceException;
}
```

#### Replace和Update之争

是否需要Replace接口要看服务的业务， 一般业务中根本不涉及到Replace，也不建议在服务提供Replace接口，一般只需要 [ADD， UPDATE，DELETE，SELECT,   BATCH_SELECT]

#### UPDATE接口代码

查询接口就没有什么可说的了， 主要是看更新接口

```java
public ShopDTO update(long shopId, @NotNull ShopUpdateDTO updateDTO, long userId, @NotNull String remark, @NotNull UpdateSourceDTO source) throws ServiceException {
    PShopInfo oldInfo = shopInfoService.get(shopId);
    if (oldInfo == null) {
        throw MyExceptionFactory.instance(ErrorCode.INVALID_PARAMETERS, "店铺信息不存在");
    }

    updateDTO.setShopId(shopId);

    // shopInfoService 就是PO Service
    // shopInfoService.setForUpdate 是将OldShopInfo 和 updateDTO结合组装成最终更新到DB中的newShopInfo
    PShopInfo newInfo = shopInfoService.setForUpdate(shopId, oldInfo, shopInfoTransformer.transformShopInfoPO(updateDTO));

    // Validator 进行统筹校验器，对店铺信息进行校验，传入userId, oldInfo, newInfo 是因为有些校验器可能对数值的变化校验，比如某些属性变化不能超过一个范围
    // Validator.of 操作是注册校验器
    // shopInfoValidator 就是一个真正的校验器
    // Validator.validates 是用所有注册的校验器开始进行校验
    Validator.of(shopInfoValidator).validates(userId, oldInfo, newInfo);

    // 校验通过后进行更新
    newInfo = shopInfoService.createOrUpdate(shopId, oldInfo, newInfo);

    // 更新成功后开始处理后事
    // Publisher 是用来监听者模式
    // Publisher.subscribe 注册监听者
    // Publisher.publish 将事件通知所有监听者
    Publisher.subscribe(changeRecordSubscriber, shopInfoChangeMessageNoticeSubscriber, syncAggregateSubscriber)
        .publish(ShopInfoEvent.of(oldInfo, newInfo, userId, enumTransformer.transformUpdateSourcePO(source), remark));

    // 返回更新后的最新值
    return shopInfoTransformer.transformShopInfoDTO(newInfo);
}
```

根据之前的基础服务能力update接口可以划分为三段

* 执行前校验段 `Validator.of(shopInfoValidator).validates(userId, oldInfo, newInfo);` 这样写的好处是，如果增加一个校验者，只需要在of里面插入即可
* 执行段 `shopInfoService.createOrUpdate(shopId, oldInfo, newInfo);` 
* 执行后通知段 `Publisher.subscribe(changeRecordSubscriber, shopInfoChangeMessageNoticeSubscriber)
        .publish(ShopInfoEvent.of(oldInfo, newInfo, userId, enumTransformer.transformUpdateSourcePO(source), remark));` 这段代码里面通知了两个监听者，一个用来发消息，一个用来记录变更日志。

#### Validator

##### 统筹校验器Validator

```java
final public class Validator<T> {

    private List<ValidatorContext<T>> validators = new ArrayList<>();

    public static <T> Validator<T> of(ValidatorContext<T>... args) {
        return new Validator<T>(args);
    }

    private Validator(ValidatorContext<T>... args) {
        if (args != null) {
            for (int i = 0; i < args.length; i++) {
                validators.add(args[i]);
            }
        }
    }

    public void validates(long userId, T origin, T target) throws ServiceException {
        for (ValidatorContext<T> validatorContext : validators) {
            if (!validatorContext.validate(userId, origin, target)) {
                break;
            }
        }
    }
}

```

##### 具体的一个校验器ShopInfoValidator

``` java
public class ShopInfoValidator implements ValidatorContext<PShopInfo> {
    @Override
    public boolean validate(long userId, PShopInfo origin, PShopInfo target) throws ServiceException {
        if (target == null) {
            throw MyExceptionFactory.instance(ErrorCode.INVALID_PARAMETERS, "更新内容不能为NULL");
        }

        Long shopId = target.getShopId();

        if (shopId == null || shopId <= 0L) {
            throw MyExceptionFactory.instance(ErrorCode.INVALID_PARAMETERS, "店铺ID不合法");
        }

        return true;
    }
}
```

#### Publisher

##### 监听者统筹器Publisher

```java
final public class Publisher<T extends BaseEvent> {

    private List<Subscriber<T>> subscribers = new ArrayList<>();

    public static <T extends BaseEvent> Publisher<T> subscribe(Subscriber<T>... args) {
        if (args == null) {
            return new Publisher<T>();
        }

        Publisher<T> result = new Publisher<T>();

        for (int i = 0; i < args.length; i++) {
            result.subscribers.add(args[i]);
        }

        return result;
    }

    public void publish(T event) throws ServiceException {
        for (Subscriber<T> subscriber : subscribers) {
            if (!subscriber.consumer(event)) {
                break;
            }
        }
    }
}
```

##### 基本事件格式 BaseEvent

```java
abstract public class BaseEvent<T> {
    private long shopId;

    private long version;

    private T origin;

    private T target;

    private long userId;

    private String remark;

    private PUpdateSource source;

    private LocalDateTime occurredTime;

    public POperateType operateType() {
        if (this.origin == null && this.target == null) {
            return POperateType.NORMAL;
        }

        if (this.origin == null && this.target != null) {
            return POperateType.CREATE;
        }

        if (this.origin != null && this.target == null) {
            return POperateType.REMOVE;
        }

        if (this.target.diff(this.origin)) {
            return POperateType.UPDATE;
        }

        return POperateType.NORMAL;
    }

    @Data
    public static class PEventContext {

        private String requestId;

        private String appId;
    }

    @AllArgsConstructor
    public static enum POperateType {
        CREATE(100),
        UPDATE(200),
        REMOVE(300),
        NORMAL(400),
        ;

        @Getter
        private int code;
    }

    @AllArgsConstructor
    public static enum PUpdateSource {
        SOURCE1(100),
        SOURCE2(200),
        ;
        @Getter
        private int code;
    }

}
```

##### 店铺具象事件描述 ShopInfoEvent

```java
public class ShopInfoEvent extends BaseEvent<PShopInfo> {

    public static ShopInfoEvent of(PShopInfo oldShopInfo, PShopInfo newShopInfo, long userId, PUpdateSource source, String remark) {
        long shopId = oldShopInfo == null ? newShopInfo.getShopId() : oldShopInfo.getShopId();
        long version = newShopInfo == null ? oldShopInfo.version() : newShopInfo.version();

        LocalDateTime occurredTime = newShopInfo == null ? oldShopInfo.getUpdatedAt() : newShopInfo.getUpdatedAt();

        ShopInfoEvent event = new ShopInfoEvent();

        event.setShopId(shopId);
        event.setVersion(version);
        event.setOrigin(oldShopInfo);
        event.setTarget(newShopInfo);
        event.setUserId(userId);
        event.setRemark(remark);
        event.setSource(source);
        event.setOccurredTime(occurredTime);

        return event;
    }
}
```

#####变更消息通知监听者 ChangeMessageNoticeSubscriber （具体的一个监听者）


```java
public class ChangeMessageNoticeSubscriber implements Subscriber<ShopInfoEvent> {

    @Inject
    // 负责发送MQ的工具类封装
    ShopMessageProducer shopMessageProducer;

    @Inject
    // PO到DTO的对象转换
    ShopInfoTransformer shopInfoTransformer;

    @Inject
    // PO到DTO的枚举转换
    EnumTransformer enumTransformer;

    @Override
    public boolean consumer(ShopInfoEvent event) throws ServiceException {
        if (event == null) {
            return true;
        }

        PShopInfo origin = event.getOrigin();
        PShopInfo target = event.getTarget();

        if (target == null) {
            return true;
        }

        if (target.diff(origin)) {
            sendShopInfoMessage(event, origin, target);
        } else {
            return true;
        }

        return true;
    }

    private void sendShopInfoMessage(ShopInfoEvent event, PShopInfo origin, PShopInfo target) {
        ShopMessageDTO message = new ShopMessageDTO();

        message.setShopId(event.getShopId());
        message.setVersion(event.getVersion());
        message.setOccurredTime(event.getOccurredTime());
        message.setRemark(event.getRemark());
        message.setUserId(event.getUserId());
        message.setSource(enumTransformer.transformUpdateSourceDTO(event.getSource()));

        message.setOrigin(shopInfoTransformer.transformShopInfoDTO(origin));
        message.setTarget(shopInfoTransformer.transformShopInfoDTO(target));

		// 发送mq的消息， message是消息体
        shopMessageProducer.sendShopInfoMessage(message);
    }
}
```

监听者可以很容易的扩展，也可以根据数据做很多事情， 比如服务缓存的刷新等

### 说在后面

上面的代码格式是我们其中一个底层服务中提取出来的， 掩盖/删除了一些具体业务相关的， 但结构一致，写tps在几k左右，代码扩展较容易，还有一些设计上的细节并没有写出来。    

## 总结

这种结构纯属本人个人见解， 是结合近两年工作经验总结出来的。 个人认为代码结构要结合实际背景说才会更加有意义，业务不同，所设计出得服务架构和代码结构也不尽相同。比如商品和店铺的业务场景就不一样， 商品数据量是挑战，几亿，几十亿的商品数据量。 店铺的挑战是qps和扩展上，我们店铺核心服务的qps高峰期有200k左右， 每个月都被要求有几个甚至几十个属性/标签需要扩展，而且在可预见的未来，将会更有甚（扩展性和QPS上后面会有文章更详细的描述），所以店铺和商品的服务设计是完全不一样的。

**基础服务的代码你认为应该怎么写？** 可以说出你的见解， 讨论无边界，设计无最好。
