---
layout: post
title: "并发函数调用工具类"
description: "记录一些自己觉得可以工具化的代码"
categories: [工作]
tags: [Code]
---

* Kramdown table of contents
{:toc .toc}

# 并发函数调用工具类

## 1 背景

日常代码中，在批量处理一些数据的时候，如果顺序循环操作，会导致时间过长，所以需要并发处理操作。      

比如：上游传入100个goodsId, 需要查询这100个商品的信息，但如果顺序循环查，会导致逻辑处理时间比较高，所以最好并行化，比如拆成10批数据并行，每一批数据内部串行。     

## 2 使用方法

这里直接列出工具类的使用方法，具体工具类的实现代码，贴在最后面。     

### 2.1 场景1: 下游接口形式 a -> A1（入参 单个，返回 单个）

下游接口：    

```java
GoodsInfoDTO queryGoodsInfo(Long goodsId);
```

日常串行 上层调用：    
```java
List<GoodsInfoDTO> goodsInfoDTOList = goodsIdList
    .stream()
    .map(goodsService::queryGoodsInfo)
    .filter(Objects::nonNull)
    .collect(Collectors.toList());
```

使用工具类，改成并行调用：
```java
 List<GoodsInfoDTO> goodsInfoDTOList = ParallelCall
    .factors(goodsIdList)
    .singleCallAndReturnSingle(goodsService::queryGoodsInfo)
    .config(CallConfig.builder().key("queryGoodsInfoParallelCall").poll(RegisteredThreadPool.QUERY_GOODS_INFO).build())
    .run();
```

### 2.2 场景2: 下游接口形式 a -> [A1, A2]（入参 单个，返回 List）

下游接口：    

```java
 List<SkuInfoDTO> queryGoodsSkuInfo(Long goodsId);
```

日常串行 上层调用：    
```java
List<SkuInfoDTO> skuInfoDTOList = goodsIdList
    .stream()
    .map(goodsService::queryGoodsSkuInfo)
    .flatMap(List::stream)
    .collect(Collectors.toList());
```

使用工具类，改成并行调用：
```java
List<SkuInfoDTO> parallelResult = ParallelCall
    .factors(goodsIdList)
    .singleCallAndReturnList(goodsService::queryGoodsSkuInfo)
    .config(CallConfig.builder().timeout(1000).poll(RegisteredThreadPool.QUERY_GOODS_SKU_INFO).build())
    .run();
```

### 2.3 场景3: 下游接口形式 [a, b] -> [A1, A2, B1, B2]（入参 List，返回 List）

下游接口：    

```java
 List<GoodsInfoDTO> batchQueryGoodsInfo(List<Long> goodsIdList);
```

日常串行 上层调用：    
```java
List<GoodsInfoDTO> goodsInfoDTOList = Lists.partition(goodsIdList, 10)
    .stream()
    .map(batch -> goodsService.batchQueryGoodsInfo(batch))
    .flatMap(List::stream)
    .collect(Collectors.toList());
```

使用工具类，改成并行调用：
```java
List<GoodsInfoDTO> parallelResult = ParallelCall
    .factors(goodsIdList)
    .batchCallAndReturnList(batch -> goodsService.queryGoodsSkuInfo(batch))
    .config(CallConfig.builder().timeout(1000).poll(RegisteredThreadPool.QUERY_GOODS_INFO).build())
    .run();
```

### 2.4 场景4: 下游接口形式 [a, b] -> {a: [A1, A2], b: [B1, B2]}（入参 List，返回 Map）

下游接口：    

```java
 Map<Long, List<SkuDTO>> batchQuerySkuInfo(List<Long> goodsIds);
```

日常串行 上层调用：    
```java
Map<Long, List<SkuDTO>> streamResult = new HashMap<>(); 
Lists.partition(goodsIdList, 5).stream()
        .map(batch -> goodsService.batchQuerySkuInfo(batch))
        .forEach(streamResult::putAll);
```

使用工具类，改成并行调用：
```java
Map<Long, List<SkuDTO>> parallelResult =parallelCall
    .factors(goodsIdList)
    .batchCallAndReturnMapList(batch -> ginListService.batchQuerySkuInfo(batch))
    .config(CallConfig.builder().poll(RegisteredThreadPool.QUERY_GOODS_SKU_INFO).build())
    .run();
```

## 3 源代码

### 3.1 RegisteredThreadPool 

```java
public enum RegisteredThreadPool {
    NORMAL_GLOBAL("normal_global", 8, 8, false),
    QUERY_GOODS_SKU_INFO("query_goods_sku_info", 4, 4, true),
    QUERY_GOODS_INFO("query_goods_info", 8, 8, false),
    ;

    private ThreadPoolExecutor threadPoolExecutor;

    private int coreSize;

    private String tag;

    RegisteredThreadPool(String name, int coreSize, int maxSize, boolean abortPolicy) {
        RejectedExecutionHandler rejectedExecutionHandler =
                abortPolicy ? new ThreadPoolExecutor.AbortPolicy() : new ThreadPoolExecutor.CallerRunsPolicy();

        this.threadPoolExecutor = new ThreadPoolExecutor(coreSize, maxSize, 30, TimeUnit.SECONDS,
                new LinkedBlockingQueue<>(1024), new BasicThreadFactory.Builder().namingPattern(name + "-%d").build(),
                rejectedExecutionHandler);
        this.coreSize = coreSize;

        this.tag = String.format("%s-%s-%s-%s", name, coreSize, maxSize, abortPolicy);
    }

    public ThreadPoolExecutor getThreadPoolExecutor() {
        return threadPoolExecutor;
    }

    public int getCoreSize() {
        return coreSize;
    }

    public String getTag() {
        return tag;
    }
}
```

### 3.2 CallConfig

```java

public class CallConfig {

    // 标识符，默认 DEFAULT
    private final String key;

    // 线程池配置
    private final RegisteredThreadPool threadPool;

    // 出现错误，抛出异常, 默认 true
    private final boolean throwExceptionWhenQueryError;

    // 整体超时时间 ms, 默认 1000
    private final long timeout;

    // 并发数量, 默认 coreSize / 2
    private final int parallelSize;

    public int getParallelSize() {
        return this.parallelSize;
    }


    public ThreadPoolExecutor getThreadPool() {
        return threadPool.getThreadPoolExecutor();
    }

    public RegisteredThreadPool registeredInfo() {
        return threadPool;
    }

    public boolean isThrowExceptionWhenQueryError() {
        return throwExceptionWhenQueryError;
    }

    public long getTimeout() {
        return timeout;
    }

    public String getKey() {
        return key;
    }

    public static Builder builder() {
        return new Builder();
    }

    public CallConfig(Builder builder) {
        this.threadPool = builder.threadPool;

        this.throwExceptionWhenQueryError = builder.throwExceptionWhenError;
        this.timeout = builder.timeout;
        this.key = builder.key;
        this.parallelSize = builder.parallelSize;
    }

    public static final class Builder {

        private boolean throwExceptionWhenError;
        private long timeout;
        private RegisteredThreadPool threadPool;
        private String key;
        private int parallelSize;

        private Builder() {
            this.threadPool = RegisteredThreadPool.NORMAL_GLOBAL;

            this.throwExceptionWhenError = true;
            this.timeout = 1000L;
            this.key = "DEFAULT";
            this.parallelSize = this.threadPool.getCoreSize() / 2 + 1;
        }

        public CallConfig build() {
            return new CallConfig(this);
        }

        public Builder poll(RegisteredThreadPool pool) {
            this.threadPool = pool;
            this.parallelSize = this.threadPool.getCoreSize() / 2 + 1;
            return this;
        }

        public Builder timeout(long timeout) {
            this.timeout = timeout;
            return this;
        }

        public Builder key(String key) {
            this.key = key;
            return this;
        }

        public Builder parallelSize(int parallelSize) {
            this.parallelSize = parallelSize;
            return this;
        }

        public Builder throwExceptionWhenError(boolean throwExceptionWhenError) {
            this.throwExceptionWhenError = throwExceptionWhenError;
            return this;
        }

    }
}
```

### 3.3 ParallelCall

```java
public class ParallelCall {

    public static <T> Factor<T> factors(List<T> factors) {
        return new Factor<>(factors);
    }
}
```

### 3.4 Factor

```java
public class Factor<T> {

    private List<T> factors;

    public Factor(List<T> factors) {
        this.factors = factors;
    }


    /**
     * demo:
     * factors: [a, b]
     * algorithm: a -> A1
     * runResult: [a,b] -> [A1, A2]
     */
    public <R> SingleCallAndReturnSingleImpl<T, R> singleCallAndReturnSingle(Function<T, R> algorithm) {
        return new SingleCallAndReturnSingleImpl<>(this.factors, algorithm);
    }

    /**
     * demo:
     * factors: [a, b]
     * algorithm: a -> [A1, A2]
     * runResult: [a,b] -> [A1, A2, B1, B2]
     */
    public <R> SingleCallAndReturnListImpl<T, R> singleCallAndReturnList(Function<T, List<R>> algorithm) {
        return new SingleCallAndReturnListImpl<>(this.factors, algorithm);
    }

    /**
     * demo:
     * factors: [a, b, c, d]
     * algorithm: [a, b] -> [A1, A2, B1, B2]
     * runResult: [a, b, c, d] -> [A1, A2, B1, B2, C1, C2, D1, D2]
     */
    public <R> BatchCallAndReturnListImpl<T, R> batchCallAndReturnList(Function<List<T>, List<R>> algorithm) {
        return new BatchCallAndReturnListImpl<>(this.factors, algorithm);
    }

    /**
     * demo:
     * factors: [a, b, c]
     * algorithm: a -> {a: [A1, A2]}
     * returnResult: [a, b, c] -> {a: [A1, A2], b: [B1, B2], c: [C1, C2]}
     */
    public <R> SingleCallAndReturnMapListImpl<T, R> singleCallAndReturnMapList(Function<T, Map<T, List<R>>> algorithm) {
        return new SingleCallAndReturnMapListImpl<>(this.factors, algorithm);
    }

    /**
     * demo:
     * factors: [a, b, c]
     * algorithm: [a, b] -> {a: [A1, A2], b: [B1, B2]}
     * returnResult: [a, b, c] -> {a: [A1, A2], b: [B1, B2], c: [C1, C2]}
     */
    public <R> BatchCallAndReturnMapListImpl<T, R> batchCallAndReturnMapList(Function<List<T>, Map<T, List<R>>> algorithm) {
        return new BatchCallAndReturnMapListImpl<>(this.factors, algorithm);
    }
}
```

### 3.5 Call

```java
public interface Call<T, R> {

    List<T> partition();

    List<Future<R>> composeFuture();

    R run();
}
```

### 3.6 AbstractCall

```java

public abstract class AbstractCall<T, R> implements Call<List<T>, R> {

    final Logger logger = LoggerFactory.getLogger(getClass());

    List<T> factors;
    CallConfig callConfig;

    @Override
    public List<List<T>> partition() {
        // 计算每一个partition最大多少个元素
        int size = factors.size() / this.callConfig.getParallelSize() + 1;

        // 根据每个partition限制的元素数量，讲factors分组成多个partition
        List<List<T>> partition = Lists.partition(this.factors, size);
        Cat.logMetricForDuration(this.callConfig.getKey(), partition.size());

        return partition;
    }

    @Override
    public List<Future<R>> composeFuture() {
        List<Future<R>> futures = new ArrayList<>();

        for (List<T> ts : partition()) {
            Future<R> future = this.callConfig.getThreadPool().submit(() -> {
                try {
                    return call(ts);
                } catch (Throwable ex) {
                    if (this.callConfig.isThrowExceptionWhenQueryError()) {
                        throw ex;
                    }
                    return null;
                }
            });
            futures.add(future);
        }

        return futures;
    }

    public R run() {
        Transaction transaction = Cat.newTransaction("ParallelCallRun", this.callConfig.getKey());
        try {
            transaction.setStatus(Transaction.SUCCESS);
            return runWrapper();
        } catch (Throwable th) {
            transaction.setStatus(th);
            throw th;
        } finally {
            transaction.complete();
        }
    }

    protected abstract R runWrapper();

    protected abstract R call(List<T> ts);
}

```

### 3.7 AbstractCallAndReturnList

```java
public abstract class AbstractCallAndReturnList<T, R> extends AbstractCall<T, List<R>> {

    @Override
    protected List<R> runWrapper()  {
        List<R> result = new ArrayList<>();
        List<Future<List<R>>> futures = composeFuture();

        for (Future<List<R>> future : futures) {
            try {
                List<R> futureResult = future.get(this.callConfig.getTimeout(), TimeUnit.MILLISECONDS);

                if (null == futureResult) {
                    continue;
                }

                futureResult = futureResult.stream().filter(Objects::nonNull).collect(Collectors.toList());

                if (futureResult.isEmpty()) {
                    continue;
                }

                result.addAll(futureResult);
            } catch (TimeoutException e) {
                String message = String.format("key:%s timeout:%s", this.callConfig.getKey(),
                        this.callConfig.getTimeout());
                ParallelCallTimeoutException exception = new ParallelCallTimeoutException(message, e);

                logger.error(message, exception);

                throw exception;
            } catch (InterruptedException | ExecutionException e) {
                String message = String.format("key:%s thread exception", this.callConfig.getKey());
                ParallelCallThreadException exception = new ParallelCallThreadException(message, e);

                logger.error(message, exception);

                throw exception;
            } catch (Throwable e) {
                logger.error("key:{} call exception", this.callConfig.getKey(), e);
                throw e;
            }
        }

        return result;
    }
}

```

### 3.8 AbstractCallReturnMapList

```java
public abstract class AbstractCallReturnMapList<T, R> extends AbstractCall<T, Map<T, List<R>>> {

    @Override
    protected Map<T, List<R>> runWrapper() {
        Map<T, List<R>> result = new HashMap<>();
        List<Future<Map<T, List<R>>>> futures = composeFuture();

        for (Future<Map<T, List<R>>> future : futures) {
            try {
                Map<T, List<R>> oneR = future.get(this.callConfig.getTimeout(), TimeUnit.MILLISECONDS);

                if (null == oneR || MapUtils.isEmpty(oneR)) {
                    continue;
                }

                result.putAll(oneR);
            } catch (TimeoutException e) {
                String message = String.format("key:%s timeout:%s", this.callConfig.getKey(),
                        this.callConfig.getTimeout());
                ParallelCallTimeoutException exception = new ParallelCallTimeoutException(message, e);

                logger.error(message, exception);

                throw exception;
            } catch (InterruptedException | ExecutionException e) {
                String message = String.format("key:%s thread exception", this.callConfig.getKey());
                ParallelCallThreadException exception = new ParallelCallThreadException(message, e);

                logger.error(message, exception);

                throw exception;
            } catch (Throwable e) {
                logger.error("key:{} call exception", this.callConfig.getKey(), e);
                throw e;
            }
        }

        return result;
    }

}
```

### 3.9 BatchCallAndReturnListImpl

```java
public class BatchCallAndReturnListImpl<T, R> extends AbstractCallAndReturnList<T, R> {

    private Function<List<T>, List<R>> algorithm;

    public BatchCallAndReturnListImpl(List<T> factors, Function<List<T>, List<R>> algorithm) {
        this.factors = factors;
        this.algorithm = algorithm;
    }

    public BatchCallAndReturnListImpl<T, R> config(CallConfig callConfig) {
        this.callConfig = callConfig;
        return this;
    }

    @Override
    protected List<R> call(List<T> ts) {
        return algorithm.apply(ts);
    }
}
```

### 3.10 BatchCallAndReturnMapListImpl

```java
public class BatchCallAndReturnMapListImpl<T, R> extends AbstractCallReturnMapList<T, R> {

    private Function<List<T>, Map<T, List<R>>> algorithm;

    public BatchCallAndReturnMapListImpl(List<T> factors, Function<List<T>, Map<T, List<R>>> algorithm) {
        this.factors = factors;
        this.algorithm = algorithm;
    }

    public BatchCallAndReturnMapListImpl<T, R> config(CallConfig callConfig) {
        this.callConfig = callConfig;
        return this;
    }

    @Override
    protected Map<T, List<R>> call(List<T> ts) {
        return algorithm.apply(ts);
    }

}
```

### 3.11 SingleCallAndReturnListImpl

```java
public class SingleCallAndReturnListImpl<T, R> extends AbstractCallAndReturnList<T, R> {

    private Function<T, List<R>> algorithm;

    public SingleCallAndReturnListImpl(List<T> factors, Function<T, List<R>> algorithm) {
        this.factors = factors;
        this.algorithm = algorithm;
    }

    public SingleCallAndReturnListImpl<T, R> config(CallConfig callConfig) {
        this.callConfig = callConfig;
        return this;
    }

    @Override
    protected List<R> call(List<T> ts) {
        List<R> result = new ArrayList<>();
        for (T t : ts) {
            List<R> apply = algorithm.apply(t);
            result.addAll(apply);
        }

        return result;
    }
}
```

### 3.12 SingleCallAndReturnMapListImpl

```java
public class SingleCallAndReturnMapListImpl<T, R> extends AbstractCallReturnMapList<T, R> {

    private Function<T, Map<T, List<R>>> algorithm;

    public SingleCallAndReturnMapListImpl(List<T> factors, Function<T, Map<T, List<R>>> algorithm) {
        super.factors = factors;
        this.algorithm = algorithm;
    }

    public SingleCallAndReturnMapListImpl<T, R> config(CallConfig callConfig) {
        this.callConfig = callConfig;
        return this;
    }

    @Override
    protected Map<T, List<R>> call(List<T> ts) {
        Map<T, List<R>> result = new HashMap<>();
        for (T t : ts) {
            Map<T, List<R>> tr = algorithm.apply(t);
            result.putAll(tr);
        }

        return result;
    }
}
```

### 3.13 SingleCallAndReturnSingleImpl

```java
public class SingleCallAndReturnSingleImpl<T, R> extends AbstractCallAndReturnList<T, R> {

    private Function<T, R> algorithm;

    public SingleCallAndReturnSingleImpl(List<T> factors, Function<T, R> algorithm) {
        this.factors = factors;
        this.algorithm = algorithm;
    }

    public SingleCallAndReturnSingleImpl<T, R> config(CallConfig callConfig) {
        this.callConfig = callConfig;
        return this;
    }

    @Override
    protected List<R> call(List<T> ts) {
        List<R> result = new ArrayList<>();
        for (T t : ts) {
            R apply = algorithm.apply(t);
            result.add(apply);
        }

        return result;
    }
}
```

### 3.14 ParallelCallThreadException

```java
public class ParallelCallThreadException extends RuntimeException {

    public ParallelCallThreadException() {
    }

    public ParallelCallThreadException(String message) {
        super(message);
    }

    public ParallelCallThreadException(String message, Throwable cause) {
        super(message, cause);
    }
}

```

### 3.15

```java
public class ParallelCallTimeoutException extends RuntimeException {

    public ParallelCallTimeoutException() {
    }

    public ParallelCallTimeoutException(String message) {
        super(message);
    }

    public ParallelCallTimeoutException(String message, Throwable cause) {
        super(message, cause);
    }
}
```