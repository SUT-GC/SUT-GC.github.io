---
layout: post
title: "简单的服务重试降级架子"
description: "坚持住"
categories: [工作]
tags: [SOA]
---

* Kramdown table of contents
{:toc .toc}

# 简单的服务重试降级架子

## 背景

在微服务架构中，这种 `A --调用--> B` 的服务调用链路再常见不过。 当 `A` 服务调用 `B` 服务的时候经常由于一些原因（比如B服务异常宕机等）导致`B`服务暂时不可用。 而为了保护`A`服务，避免发生大规模“雪崩”、“连锁反应”等问题，基本的SOA框架（spring cloud、dubbo、pylon）等都会提供 心跳检查、熔断(分为客户端熔断 or 服务端熔断)、降级(pylon貌似只有服务端降级)。但是这些框架为了更好的适用与所有绝大多数场景，所以会相应的摒弃一些不通用的东西。     

## 问题

当 `A`服务调用`B`服务，不能保证`B`服务100%可用， 也不能保证到`B`的网络100%可达，拿`shop.core_service`这个服务举例，调用营销查询配送补贴的接口 QPS 在高峰期将近30K，平均相应时间在10ms以内    

![t]({{site.paths.image}}/retry-1.png)

![t]({{site.paths.image}}/retry-2.png)

但是在这30K的调用里面，存在300内的 timeout 请求（客户端限制服务端相应时间不能超过300ms，超过即超时），看下最大响应时间 发现最大值为5.322s。    

这个接口的影响是：如果一次调用超时，便可能造成用户下的这一单不享受商家设置的配送费补贴（前提是下单页面调用这个接口且这家店在此时有商家补贴活动）。  这种损失无论发生在哪位用户上都会造成不良体验。    

> 前两天听到个有趣的故事也分享下：一个制造军用降落伞的公司，制造工艺非常精细，检查制度非常严格，已经将标品的合格率提高到了99.99%，几乎无法再次提高。 军方跟降落伞公司的CEO说：“我知道你们99.99%的合格率已经非常高了，但是这也就说明我们10000个将士跳伞，就会有1个将士牺牲，这个代价是很严重的”。CEO摇了摇头：“sorry sir我们已经近了最大的努力！你要理解我们，再工艺中出现丁点偏差都会造成降落伞不合格，99.99%已经是世界上最高的合格率了，真的没有办法再提高了”。将军想了想，叹了口气说：“哎，好吧，我也理解你们，以后的采购合同还会跟你们继续保持，不过我要在合同上加一条，每次你们公司交货的时候都要从这批货中随机挑选出10个降落伞来，让top10的高管亲自跳伞验收下，然后我们再收这批货”。结果三个月之后，这家公司降落伞的合格率达到了100%。    

## 办法

在无法保证服务100%可用的情况下，怎么做到降低失败率呢？ 可能有很多种方法，我选择的是：`快速失败重试`。    

我们计算下`A`调用`B`的服务不可用率是 0.001% ( 300/30K 得出),  如果服务调用失败的时候重试3次，则 服务不可用率即为 0.001% * 0.001% * 0.001%。    

但是单纯的重试也会带来一些问题:    

* 比如降低`A`服务的整体性能，最差情况下本来调用`B` 服务最多在300ms就会有返回（异常也是返回），即`A`服务处理一次请求最消耗500ms，单线程1s可以处理2个请求，一台机器上假设可以最多处理1k个线程的情况，即`A`服务接口的QPS == 2K, 100台机器最高QPS==200K, 当失败重试三次的时候， 整体的接口性能会降低到200/3 K上。怎么解决？ 缩短`A`调用`B`的超时时间，把这个时间推荐设置为 `B`接口平均相应时间 `upper 99线*3（具体情况具体分析）`比如把上面查询补贴的接口超时时间设置为50ms，重试3次，最坏情况才损耗150ms，服务不可用率降低到了0.001% * 0.001% * 0.001%，却还能提高QPS到200K*2。就算把超时时间调整到100ms，整体服务的接口性能也不会降低     

* 加了重试还会有个问题，如果`B`服务挂掉了，对`B`服务的压力会暴增3倍（如果重试三次的话）这样`A`就要做好直接降级`B`的准备，做到一键降级。    


## 使用姿势

根据相关业务和部门的技术栈用到了Huskar+Vine写了个简单的重试架子，先看使用姿势，后面上源码    

### callAndFallBack

**支持FallBack的调用姿势**    

```java
public class TestCallUtil extends ComponentTest {

    @Inject
    private ErsClient ersClient;

    @Inject
    private Logger logger;

    public void testCallAndFallBack() {
        Restaurant result = CallServiceWrapper.callAndFallBack(
            new CallServiceInterfaceContext<Restaurant>() {
                @Override
                public Restaurant run() throws Exception {
	                // 必须实现，B服务的接口调用
                    return ersClient.get(969343L);
                }

                @Override
                public String key() {
	                // 做服务降级可以使用的key
	                // 必须实现
                    return "ElemeRestaurantService#get";
                }

                @Override
                public Restaurant fallBack() {
	                // 如果客户端把服务端降级掉，会直接走到fallBack里面
	                // 如果客户端重试次数达到最大但是仍然失败，会到fallback里面
					// 可以不Override， 默认返回null
                    return new Restaurant();                 
                }

                @Override
				public int callMaxCount() {
					// 最大调用次数
					// 可以不Override，默认1
			       return 1;
			    }

                @Override			
			    public int silenceMaxCount() {
				    // 最大沉默次数 当调用次数 > 该值的时候 会触发silenceMaxHook函数，可以在silenceMaxHook里面做监控or打点
				    // 可以不Override，默认1
			        return 1;
			    }

                @Override			
			    public boolean alwaysMiddleHook() {
				    // 当调用次数 > 最大沉默次数的时候，是否超过的部分总是触发silenceMaxHook
				    // 可以不Override，默认false（只触发一次）			    
			        return false;
			    }

                @Override
                public void callMaxHook(int maxCount) {
	                // 如果调用达到了最大次数且仍然仍然失败，会触发这个方法，主要用来打点or日志来做监控
					// 可以不Override， 默认什么都不做
                    logger.info("最大调用次数:" + maxCount);
                }

                @Override
                public void silenceMaxHook(int nowCount) {
	                // 可容忍调用的最大次数
	                // 比如允许调用最大次数5次，但是超过3次的已经是属于极端case了，想要感知超过三次的有多少，便可以在这里打点or日志
	                // 可以不Override， 默认什么都不做
                    logger.info("可忍受的最大次数:" + nowCount);
                }

                @Override
                public void downgradeCompleteHook(Restaurant result) {
	                // 如果链路走了fallback，完成fallback之后会将fallback的返回结果传入这个方法里，方便监控，打日志等
	                // 可以不Override， 默认什么都不做
                    logger.info("降级完成钩子:" + result);
                }

                @Override
                public void exceptionHook(Exception e) {
	                // 如果出现Exception，则会call一次这个接口，并且将异常信息丢进来，方便打日志
	                // 可以不Override， 默认什么都不做
                    logger.error("Exception 钩子", e.getMessage());
                }

                @Override
                public void serviceExceptionHook(ServiceException e) {
	                // 如果出现ServiceException，则会call一次这个接口，并且将异常信息丢进来，方便打日志
	                // 可以不Override， 默认什么都不做
                    logger.error("ServiceException 钩子", e.getMessage());
                }

                @Override
                public void callCompleteHook(Restaurant result) {
	                // 如果调用成功，会将返回返回结果先丢到这里来，方便打日志
	                // 可以不Override， 默认什么都不做
                    logger.info("调用完成钩子:" + result);
                }
            });
    }
}
```

上面的代码便完成了一次服务重试 和 降级配置机制，上面把所有的可Override接口全部Orverride了， 下面给一个简单的，可以满足基本需求的实现方法    

```java
public class TestCallUtil extends ComponentTest {

    @Inject
    private ErsClient ersClient;

    @Inject
    private Logger logger;

    public void testCallAndFallBack() {
        Restaurant result = CallServiceWrapper.callAndFallBack(
            new CallServiceInterfaceContext<Restaurant>() {
                @Override
                public Restaurant run() throws Exception {
	                // 必须实现，B服务的接口调用
                    return ersClient.get(969343L);
                }

                @Override
                public String key() {
	                // 做服务降级可以使用的key
	                // 必须实现
                    return "ElemeRestaurantService#get";
                }

                @Override
                public Restaurant fallBack() {
	                // 如果客户端把服务端降级掉，会直接走到fallBack里面
	                // 如果客户端重试次数达到最大但是仍然失败，会到fallback里面
					// 可以不Override， 默认返回null
                    return new Restaurant();                 
                }
            });
    }
}
```

这样写的话很简单，基本满足需求： 接口可降级，降级后or超过最大调用次数会走fallback方法，如果你懒一些的话 fallback都可以省略，因为fallback默认返回null。    

看第二段代码是不是比较好奇，最大重试次数和最大可容忍次数都没有Override，都走默认1的话岂不是没有什么作用？ No， 因为你Override了key()方法，他将帮你做到灵活配置， 只需要在Huskar的**Config**上面配置：     

![t2]({{site.paths.image}}/retry-3.png)

而且是随时可以改变，不需要reroll服务哦～ 不过考虑config里面的东西不太可能经常变，所以也可以适当的优化下面的源码，使其在服务初始化的时候加载一次，这样就不用每次都拉huskar config了（这也是为什么我把降级操作从config里面拆出来的一个原因）     

另外一个比较方便的地方在于服务降级，肯定也是要可配置的，由于饿了么huskar switch比较适合做开关，所以我并没有把降级开关也配置在huskar config的json里面，而是单独拎出来到switch里面了，配置如图。0 为降级，100 为不降级    



![t3]({{site.paths.image}}/retry-4.png)


具体的读取配置逻辑是这样的： 在huskar中配置了的优先读取huskar配置，没有配置的读代码Override，如果连Override都没有，那就走默认值啦。不过强烈建议走huskar，不要Hard Code。     

* 1 写好run()    
* 2 写好key() 注意不要在string里面写`$`符号，写了的话也会自动将`$`转换为`#`，避免和饿了么Soa框架pylon的接口降级冲突    
* 3 写好fallback()    

做好上面三步之后，便可以很愉快的在客户端把服务端的接口做重试 or  降级（这是客户端降掉服务端，pylon可不支持哦～，也可能是我代码没找到）。    

> ⚠️ 一定要注意，业务里面有些接口是不能降级的，要评估好！    


下面给个线上的代码Demo    


```java
public List<ReduceDeliveryFeeRespDto> getShopProductPromotionWithUserInfoCanDowngrade(DeliveryFeeCalculateResultDTO calculateResult, ShopDTO shopDTO) {
    List<ReduceDeliveryFeeRespDto> result = new ArrayList<>();

    CartInfoReqDto cartInfoReqDto = new CartInfoReqDto();
    cartInfoReqDto.setRestaurant_id(calculateResult.getShopId());
    cartInfoReqDto.setStandardId(calculateResult.getProductId());

    ReduceDeliveryFeeRespDto reduceDeliveryFeeRespDto = calculateReduceDeliveryFee(cartInfoReqDto);

    if (reduceDeliveryFeeRespDto != null) {
        result.add(reduceDeliveryFeeRespDto);
    }

    return result;
}


private ReduceDeliveryFeeRespDto calculateReduceDeliveryFee(CartInfoReqDto request) {
    if (request == null) {
        return null;
    }

    ReduceDeliveryFeeRespDto result = CallServiceWrapper.callAndFallBack(
        new CallServiceInterfaceContext<ReduceDeliveryFeeRespDto>() {

            @Override
            public ReduceDeliveryFeeRespDto run() throws Exception {
                return marketingActivityPromotionService.calculateReduceDeliveryFee(request);
            }

            @Override
            public String key() {
                return "MarketingActivityPromotionService#calculateReduceDeliveryFee";
            }

            @Override
            public ReduceDeliveryFeeRespDto fallBack() {
                return null;
            }

            @Override
            public void serviceExceptionHook(me.ele.contract.exception.ServiceException e) {
                logger.error(String.format(
                    "MarketingActivityPromotionService.calculateReduceDeliveryFee ServiceException, request:%s",
                    VJson.writeAsString(request)), e);
            }

            @Override
            public void exceptionHook(Exception e) {
                logger.error(String.format(
                    "MarketingActivityPromotionService.calculateReduceDeliveryFee Exception, request:%s",
                    VJson.writeAsString(request)), e);
            }

            @Override
            public void downgradeCompleteHook(ReduceDeliveryFeeRespDto result) {
                Trace.newCounter("calculate-downgrade")
                    .addTag("source", "marketing")
                    .addTag("method", "calculate-reduce-delivery-fee")
                    .once();
            }

            @Override
            public void silenceMaxHook(int nowCount) {
                Trace.newCounter("call-silence")
                    .addTag("class", "MarketingActivityPromotionService")
                    .addTag("method", "calculateReduceDeliveryFee")
                    .addTag("count", nowCount + "")
                    .once();
            }
        });

    return result;
}
```
### call

**不做FallBack的调用**    

这个与callAndFallBack的区别就是当发生降级操作 or 重试达到调用上限后不会调用fallback函数，直接抛Exception出来。    

* 降级后的Exception就是 `new Exception(String.format("%s已经降级", key()))`    
* 重试无效后的Exception就是最后失败时run方法抛出来的Exception    

使用代码基本没有变     
```java
public void testCall() {
        try {
            Restaurant result = CallServiceWrapper.call( //就这里不一样
                new CallServiceInterfaceContext<Restaurant>() {
                    @Override
                    public Restaurant run() throws Exception {
                        logger.info("ers.get" + 969343L);
                        throw new Exception("fuck Exception");
                    }

                    @Override
                    public String key() {
                        return "ElemeRestaurantService#get";
                    }

                    @Override
                    public Restaurant fallBack() {
                        return new Restaurant();
                    }

                    @Override
                    public void callMaxHook(int maxCount) {
                        logger.info("最大调用次数:" + maxCount);
                    }

                    @Override
                    public void silenceMaxHook(int nowCount) {
                        logger.info("当前调用次数:" + nowCount + ", 已经不能忍受");
                    }

                    @Override
                    public void downgradeCompleteHook(Restaurant result) {
                        logger.info("降级完成钩子:" + result);
                    }

                    @Override
                    public void exceptionHook(Exception e) {
                        logger.error("Exception 钩子", e.getMessage());
                    }

                    @Override
                    public void serviceExceptionHook(ServiceException e) {
                        logger.error("ServiceException 钩子", e.getMessage());
                    }

                    @Override
                    public void callCompleteHook(Restaurant result) {
                        logger.info("调用完成钩子:" + result);
                    }
                });
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
```

### callNotCoverServiceException

顾名思义，不去重试ServiceException，如果出新ServiceException，直接中断重试，抛出异常。 其他Exception会继续retry，直到达到retry最大值，将最后一次触发得到的异常抛出来。     
如果接口被降级，则抛一个`new ServiceException(String.format("%s已经降级", serviceInterfaceContext.key()));`， **不会走到fallback里面**    

使用姿势：    

```java
public void testCallNotCoverServiceException() {
        try {
            Restaurant result = CallServiceWrapper.callNotCoverServiceException(
                new CallServiceInterfaceContext<Restaurant>() {
                    @Override
                    public Restaurant run() throws Exception {
                        logger.info("ers.get" + 969343L);
                        throw new ServiceException("fuck Service Exception");
                    }

                    @Override
                    public String key() {
                        return "ElemeRestaurantService#get";
                    }

                    @Override
                    public Restaurant fallBack() {
                        return new Restaurant();
                    }

                    @Override
                    public void callMaxHook(int maxCount) {
                        logger.info("最大调用次数:" + maxCount);
                    }

                    @Override
                    public void silenceMaxHook(int nowCount) {
                        logger.info("当前调用次数:" + nowCount + ", 已经不能忍受");
                    }

                    @Override
                    public void downgradeCompleteHook(Restaurant result) {
                        logger.info("降级完成钩子:" + result);
                    }

                    @Override
                    public void exceptionHook(Exception e) {
                        logger.error("Exception 钩子", e.getMessage());
                    }

                    @Override
                    public void serviceExceptionHook(ServiceException e) {
                        logger.error("ServiceException 钩子", e.getMessage());
                    }

                    @Override
                    public void callCompleteHook(Restaurant result) {
                        logger.info("调用完成钩子:" + result);
                    }
                });
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
```

### callNotCoverServiceExceptionAndFallBack

这个就是 不去覆盖ServiceException，但是当出现 其他Exception的时候会做重试，直到重试到最大值后 调用fallback。    

当触发接口降级的时候也是调用fallback，并不抛异常    

使用姿势：    

```java
public void testCallNotCoverServiceExceptionAndFallBack() {
        try {
            Restaurant result = CallServiceWrapper.callNotCoverServiceExceptionAndFallBack(
                new CallServiceInterfaceContext<Restaurant>() {
                    @Override
                    public Restaurant run() throws Exception {
                        logger.info("ers.get" + 969343L);
                        throw new ServiceException("fuck Service Exception");
                    }

                    @Override
                    public String key() {
                        return "ElemeRestaurantService#get";
                    }

                    @Override
                    public Restaurant fallBack() {
                        return new Restaurant();
                    }

                    @Override
                    public void callMaxHook(int maxCount) {
                        logger.info("最大调用次数:" + maxCount);
                    }

                    @Override
                    public void silenceMaxHook(int nowCount) {
                        logger.info("当前调用次数:" + nowCount + ", 已经不能忍受");
                    }

                    @Override
                    public void downgradeCompleteHook(Restaurant result) {
                        logger.info("降级完成钩子:" + result);
                    }

                    @Override
                    public void exceptionHook(Exception e) {
                        logger.error("Exception 钩子", e.getMessage());
                    }

                    @Override
                    public void serviceExceptionHook(ServiceException e) {
                        logger.error("ServiceException 钩子", e.getMessage());
                    }

                    @Override
                    public void callCompleteHook(Restaurant result) {
                        logger.info("调用完成钩子:" + result);
                    }
                });
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
```

## 源码

源码很简单，各位将代码贴到自己项目里面，可以定制化的修改开发：

### CallServiceInterfaceContext

```java
import me.ele.config.HuskarHandle;
import me.ele.contract.exception.ServiceException;
import me.ele.napos.vine.common.json.VJson;

import javax.validation.constraints.NotNull;

public abstract class CallServiceInterfaceContext<T> {
    /**
     * 真正的接口调用，比如实现
     */
    public abstract T run() throws Exception;

    /**
     * huskar key，为null的话会默认不使用
     */
    public abstract String key();

    /**
     * 降级处理
     */
    public T fallBack() {
        return null;
    }

    /**
     * 接口调用次数最大值
     * <p>
     * return 1: 只允许接口调用一次，就算是这次失败了也不回继续调用
     * return n (n>1): 允许接口调用n次，如果第1次失败了，还可以重试n-1次
     */
    public int callMaxCount() {
        return 1;
    }

    /**
     * 可容忍最大调用次数
     * <p>
     * return 1: 当调用服务接口次数超过1, 则超过1的调用触发silenceMaxHook
     * return n: 当调用服务接口次数超过n, 则超过n的调用触发silenceMaxHook
     * <p>
     * 注意当silenceMaxCount>=callMaxCount的时候, 将永远不会触发silenceMaxHook
     */
    public int silenceMaxCount() {
        return 1;
    }

    /**
     * 当调用次数 > 可容忍值后是否总是触发 silenceMaxHook
     * <p>
     * return false: 超过的部分只会触发一次silenceMaxHook
     * return true: 超过的部分总是触发silenceMaxHook
     */
    public boolean alwaysMiddleHook() {
        return false;
    }


    /**
     * 重试达到最大值后call back
     * @param maxCount 调用最大值
     */
    public void callMaxHook(int maxCount) {

    }

    /**
     * 超过可容忍最大调用次数 call back
     * @param nowCount 调用当前次数
     */
    public void silenceMaxHook(int nowCount) {

    }

    /**
     * 降级完成
     * @param result 如果调用fallBack，则会将fallBack返回值当作result参数
     */
    public void downgradeCompleteHook(T result) {

    }

    /**
     * 服务异常钩子
     */
    public void serviceExceptionHook(ServiceException e) {

    }

    /**
     * 异常钩子
     * @param e 异常信息
     */
    public void exceptionHook(Exception e) {

    }

    /**
     * 服务调用完成钩子
     * @param result 服务调用结果
     */
    public void callCompleteHook(T result) {

    }

    /**
     * 获取huskar key
     */
    public final String huskarKey() {
        // 将所有的$转换成#，避免跟pylon降级冲突
        return key() == null ? "" : key().replaceAll("\\$", "#");
    }

    /**
     * 降级
     * <p>
     * return true: 开启降级
     * return false: 关闭降级
     */
    public final boolean downgrade() {
        // huskar switch 中 huskarkey的值 < 50, 则降级掉
        int value = HuskarHandle.get().getMySwitch().getInt(huskarKey(), 100);

        return value < 50;
    }

    /**
     * 调用服务配置
     * 1. 可以根据 huskarKey 配置在huskar config上
     * 2. 如果huskar中读取不到或者读取错误, 则使用 Override callMaxCount,silenceMaxCount,alwaysMiddleHook
     */
    public final CallServiceInterfaceConfig config() {
        String huskarValue = "";
        if (huskarKey() == null || huskarKey().trim().isEmpty()) {
            huskarValue = "";
        } else {
            huskarValue = HuskarHandle.get().getMyConfig().getProperty(huskarKey(), "");
        }

        CallServiceInterfaceConfig callServiceInterfaceConfig = CallServiceInterfaceConfig.getInstanceByJsonString(huskarValue);
        if (callServiceInterfaceConfig == null) {
            callServiceInterfaceConfig = CallServiceInterfaceConfig.getInstanceByValue(callMaxCount(), silenceMaxCount(), alwaysMiddleHook());
        }

        return callServiceInterfaceConfig;
    }

    protected static class CallServiceInterfaceConfig{
        private int callMaxCount = 1;
        private int silenceMaxCount = 1;
        private boolean alwaysMiddleHook = false;

        private void setCallMaxCount(int callMaxCount) {
            this.callMaxCount = callMaxCount;
        }

        private void setSilenceMaxCount(int silenceMaxCount) {
            this.silenceMaxCount = silenceMaxCount;
        }

        private void setAlwaysMiddleHook(boolean alwaysMiddleHook) {
            this.alwaysMiddleHook = alwaysMiddleHook;
        }

        protected int getCallMaxCount() {
            return callMaxCount;
        }

        protected int getSilenceMaxCount() {
            return silenceMaxCount;
        }

        protected boolean isAlwaysMiddleHook() {
            return alwaysMiddleHook;
        }

        private static CallServiceInterfaceConfig getInstanceByJsonString(String jsonString) {
            if (jsonString == null || jsonString.isEmpty()) {
                return null;
            } else {
                try {
                    return VJson.read(jsonString, CallServiceInterfaceConfig.class);
                } catch (Exception e) {
                    return null;
                }
            }
        }

        private static CallServiceInterfaceConfig getInstanceByValue(int callMaxCount, int silenceMaxCount, boolean alwaysMiddleHook) {
            CallServiceInterfaceConfig callServiceInterfaceConfig = new CallServiceInterfaceConfig();
            callServiceInterfaceConfig.setCallMaxCount(callMaxCount);
            callServiceInterfaceConfig.setSilenceMaxCount(silenceMaxCount);
            callServiceInterfaceConfig.setAlwaysMiddleHook(alwaysMiddleHook);

            return callServiceInterfaceConfig;
        }
    }
}

```

### CallServiceWrapper

```java
import me.ele.contract.exception.ServiceException;

public abstract class CallServiceWrapper {
    /**
     * 0 降级开关关闭，服务正常响应，正常返回
     * 1 降级开关关闭，服务异常，走重试逻辑，重试达到最大值走fallback&hook
     * 2 降级开关打开，走fallback&hook
     */
    public static <T> T callAndFallBack(CallServiceInterfaceContext<T> serviceInterfaceContext) {
        if (serviceInterfaceContext.downgrade()) {

            // 接口被降级，则直接callBack，并且触发downgradeCompleteHook
            T callBackResult = serviceInterfaceContext.fallBack();
            serviceInterfaceContext.downgradeCompleteHook(callBackResult);

            return callBackResult;
        }

        boolean middleHook = false;
        CallServiceInterfaceContext.CallServiceInterfaceConfig config = serviceInterfaceContext.config();

        for (int i = 1; i <= config.getCallMaxCount(); i++) {
            try {
                T callResult = serviceInterfaceContext.run();
                serviceInterfaceContext.callCompleteHook(callResult);

                return callResult;
            } catch (ServiceException e) {
                serviceInterfaceContext.serviceExceptionHook(e);
            } catch (Exception e) {
                serviceInterfaceContext.exceptionHook(e);
            }

            // 当调用次数超过可容忍次数后时候触发silenceMaxHook
            if (i > config.getSilenceMaxCount() && !middleHook) {
                serviceInterfaceContext.silenceMaxHook(i);
                // 没有打开alwaysMiddleHook的话 只触发一次middleHook
                if (!config.isAlwaysMiddleHook()) {
                    middleHook = true;
                }
            }
        }

        // 重试次数达到 retryMaxCount 则触发retryMaxHook
        serviceInterfaceContext.callMaxHook(serviceInterfaceContext.callMaxCount());

        // 重试最大 调用fallBack
        T callBackResult = serviceInterfaceContext.fallBack();
        serviceInterfaceContext.downgradeCompleteHook(callBackResult);

        return callBackResult;
    }

    /**
     * 0 降级开关关闭，服务正常响应，正常返回
     * 1 降级开关关闭，服务异常走重试逻辑，重试满只会抛最后一次重试的异常
     * 2 降级开关打开，抛接口已降级异常
     */
    public static <T> T call(CallServiceInterfaceContext<T> serviceInterfaceContext) throws Exception {
        if (serviceInterfaceContext.downgrade()) {

            // 接口被降级，直接抛Exception
            // 这里downgradeCompleteHook传入null， 因为没有结果也没有什么可以传入的
            serviceInterfaceContext.downgradeCompleteHook(null);
            throw new Exception(String.format("%s已经降级", serviceInterfaceContext.huskarKey()));
        }

        boolean middleHook = false;
        Exception exception = null;
        CallServiceInterfaceContext.CallServiceInterfaceConfig config = serviceInterfaceContext.config();

        for (int i = 0; i <= config.getCallMaxCount(); i++) {
            try {
                T callResult = serviceInterfaceContext.run();
                serviceInterfaceContext.callCompleteHook(callResult);

                return callResult;
            } catch (ServiceException e) {
                serviceInterfaceContext.serviceExceptionHook(e);
                exception = e;
            } catch (Exception e) {
                serviceInterfaceContext.exceptionHook(e);
                exception = e;
            }

            // 当调用次数超过可容忍次数后时候触发silenceMaxHook
            if (i > config.getSilenceMaxCount() && !middleHook) {
                serviceInterfaceContext.silenceMaxHook(i);
                // 没有打开alwaysMiddleHook的话 只触发一次middleHook
                if (!config.isAlwaysMiddleHook()) {
                    middleHook = true;
                }
            }
        }

        // 重试次数达到 retryMaxCount 则触发retryMaxHook
        serviceInterfaceContext.callMaxHook(config.getCallMaxCount());

        // 抛出最有一次异常信息
        throw exception == null ? new Exception("无异常信息") : exception;
    }

    /**
     * 0 降级开关关闭，服务正常响应，正常返回
     * 1 降级开关关闭，ServiceException 直接抛，Exception走重试，重试满了抛Exception
     * 2 降级开关打开，抛接口已经降级的ServiceException
     */
    public static <T> T callNotCoverServiceException(CallServiceInterfaceContext<T> serviceInterfaceContext) throws Exception {
        if (serviceInterfaceContext.downgrade()) {

            // 接口被降级，直接抛Exception
            // 这里downgradeCompleteHook传入null， 因为没有结果也没有什么可以传入的
            serviceInterfaceContext.downgradeCompleteHook(null);
            throw new ServiceException(String.format("%s已经降级", serviceInterfaceContext.huskarKey()));
        }

        boolean middleHook = false;
        Exception exception = null;
        CallServiceInterfaceContext.CallServiceInterfaceConfig config = serviceInterfaceContext.config();

        for (int i = 0; i <= config.getCallMaxCount(); i++) {
            try {
                T callResult = serviceInterfaceContext.run();
                serviceInterfaceContext.callCompleteHook(callResult);

                return callResult;
            } catch (ServiceException e) {
                serviceInterfaceContext.serviceExceptionHook(e);
                throw e;
            } catch (Exception e) {
                serviceInterfaceContext.exceptionHook(e);
                exception = e;
            }

            // 当调用次数超过可容忍次数后时候触发silenceMaxHook
            if (i > config.getSilenceMaxCount() && !middleHook) {
                serviceInterfaceContext.silenceMaxHook(i);
                // 没有打开alwaysMiddleHook的话 只触发一次middleHook
                if (!config.isAlwaysMiddleHook()) {
                    middleHook = true;
                }
            }
        }

        // 重试次数达到 retryMaxCount 则触发retryMaxHook
        serviceInterfaceContext.callMaxHook(serviceInterfaceContext.callMaxCount());

        // 抛出最后一次异常信息
        throw exception == null ? new ServiceException("无异常信息") : exception;
    }

    /**
     * 0 降级开关关闭，服务正常响应，正常返回
     * 1 降级开关关闭，ServiceException 直接抛，Exception走重试，重试满了走 ballback&hook
     * 2 降级开关打开，直接走 fallback&hook
     */
    public static <T> T callNotCoverServiceExceptionAndFallBack(CallServiceInterfaceContext<T> serviceInterfaceContext) throws Exception {
        if (serviceInterfaceContext.downgrade()) {

            // 接口被降级，则直接callBack，并且触发downgradeCompleteHook
            T callBackResult = serviceInterfaceContext.fallBack();
            serviceInterfaceContext.downgradeCompleteHook(callBackResult);

            return callBackResult;
        }

        boolean middleHook = false;
        CallServiceInterfaceContext.CallServiceInterfaceConfig config = serviceInterfaceContext.config();

        for (int i = 0; i <= config.getCallMaxCount(); i++) {
            try {
                T callResult = serviceInterfaceContext.run();
                serviceInterfaceContext.callCompleteHook(callResult);

                return callResult;
            } catch (ServiceException e) {
                serviceInterfaceContext.serviceExceptionHook(e);
                throw e;
            } catch (Exception e) {
                serviceInterfaceContext.exceptionHook(e);
            }

            // 当调用次数超过可容忍次数后时候触发silenceMaxHook
            if (i > config.getSilenceMaxCount() && !middleHook) {
                serviceInterfaceContext.silenceMaxHook(i);
                // 没有打开alwaysMiddleHook的话 只触发一次middleHook
                if (!config.isAlwaysMiddleHook()) {
                    middleHook = true;
                }
            }
        }

        // 重试次数达到 retryMaxCount 则触发retryMaxHook
        serviceInterfaceContext.callMaxHook(serviceInterfaceContext.callMaxCount());

        // 重试最大 调用fallBack
        T callBackResult = serviceInterfaceContext.fallBack();
        serviceInterfaceContext.downgradeCompleteHook(callBackResult);

        return callBackResult;
    }
}

```
