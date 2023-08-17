---
layout: post
title: "灰度逻辑迁移比对代码工具"
description: "记录一些自己觉得可以工具化的代码"
categories: [工作]
tags: [Code]
---

* Kramdown table of contents
{:toc .toc}


# 灰度逻辑迁移比对代码工具

## 功能

目的是为了在做新老逻辑迁移的时候，能够做到灰度比对，灰度切换，平滑切换。

### 使用Demo

```java
Supplier<Boolean> oldQuery = () -> {return xxx;}
Supplier<Boolean> newQuery = () -> {return xxx;}
return migrateCompareControl.migrate(newQuery, oldQuery, new TypeReference<Boolean>() {}, goodsId, "test", new BooleanCompare());
````

```java
    @Override
    @MethodMigrateAOP(control = MigrateCompareControl.class, targetClass = NewLogicServerImpl.class, targetMethod = "doSomeThingMethod", compare = ResultCompare.class)
    public Result doSomeThingMethod(@MigrateSimpleKey Long goodsId) {
        // do somethings 
        return new Result();
    }
```

## 框架代码

### MethodMigrateAOP

```java
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD})
public @interface MethodMigrateAOP {
    Class<? extends MigrateCompareControl> control();

    Class targetClass();

    String targetMethod();

    Class<? extends BusinessCompare> compare();
}

```

### MigrateCompareControl

```java
public interface MigrateCompareControl {

    <R> R migrate(Supplier<R> newQueryFunc, Supplier<R> oldQueryFunc, TypeReference<R> tr, Long sample,
            String key, BusinessCompare<R> businessCompare);

    <R> R migrateSync(Supplier<R> newQueryFunc, Supplier<R> oldQueryFunc, TypeReference<R> tr, Long sample,
            String key, BusinessCompare<R> businessCompare);
}

@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.PARAMETER})
public @interface MigrateSimpleKey {
}

```

### BusinessCompare

```java

@FunctionalInterface
public interface BusinessCompare<T> {

    boolean compare(T from, T to);

    default <K, V extends BusinessCompare<K>> boolean responseEquals(BaseResponse<K> from, BaseResponse<K> to,
            V businessCompare) {
        if (Objects.isNull(from) || Objects.isNull(to)) {
            if (Objects.nonNull(from) || Objects.nonNull(to)) {
                return false;
            } else {
                return true;
            }
        }

        if (from.isSuccess() && to.isSuccess()) {
            return businessCompare.compare(from.getResult(), to.getResult());
        }

        if (!from.isSuccess() && !to.isSuccess()) {
            return Objects.equals(from.getErrorCode(), to.getErrorCode()) && Objects.equals(from.getErrorMsg(),
                    to.getErrorMsg());
        }

        return false;
    }

    default <K extends Comparable<? super K>, V> boolean listEquals(List<V> aList, List<V> bList,
            Function<V, K> keyExtractor, BusinessCompare<V> businessCompare) {

        if (CollectionUtils.isEmpty(aList) || CollectionUtils.isEmpty(bList)) {
            if (CollectionUtils.isNotEmpty(aList) || CollectionUtils.isNotEmpty(bList)) {
                return false; // 一个为空，一个为非空
            }
        } else if (aList.size() != bList.size()) {
            return false;
        } else {
            Map<K, V> map1 = aList.stream()
                    .collect(Collectors.toMap(keyExtractor, Function.identity(), (v1, v2) -> v2));
            Map<K, V> map2 = bList.stream()
                    .collect(Collectors.toMap(keyExtractor, Function.identity(), (v1, v2) -> v2));
            for (K k : map1.keySet()) {
                if (BooleanUtils.isFalse(businessCompare.compare(map1.get(k), map2.get(k)))) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * 相对宽松的list比对，不在乎list的size是否一致，纯依靠单个元素的比对
     */
    default <K extends Comparable<? super K>, V> boolean listEqualsForLoose(List<V> aList, List<V> bList,
            Function<V, K> keyExtractor, BusinessCompare<V> businessCompare) {

        Map<K, V> map1 = Optional.ofNullable(aList).orElse(new ArrayList<>()).stream()
                .collect(Collectors.toMap(keyExtractor, Function.identity(), (v1, v2) -> v2));
        Map<K, V> map2 = Optional.ofNullable(bList).orElse(new ArrayList<>()).stream()
                .collect(Collectors.toMap(keyExtractor, Function.identity(), (v1, v2) -> v2));
        for (K k : map1.keySet()) {
            if (BooleanUtils.isFalse(businessCompare.compare(map1.get(k), map2.get(k)))) {
                return false;
            }
        }

        return true;
    }

    // K为Number类型才能使用(主要是Long, Integer)
    default <K, V> boolean mapEquals(Map<K, V> a, Map<K, V> b, BusinessCompare<V> businessCompare) {

        if (MapUtils.isEmpty(a) || MapUtils.isEmpty(b)) {
            if (MapUtils.isNotEmpty(a) || MapUtils.isNotEmpty(b)) {
                return false; // 一个为空，一个为非空
            }
        } else if (BooleanUtils.isFalse(Objects.equals(a.keySet(), b.keySet()))) {
            return false;
        } else {
            for (K key : a.keySet()) {
                if (BooleanUtils.isFalse(businessCompare.compare(a.get(key), b.get(key)))) {
                    return false;
                }
            }
        }
        return true;
    }
}

```

### CompareGrayConfig

```java
public interface CompareGrayConfig {

    boolean stopQueryOld(Long sample);

    boolean returnNew(Long sample);

    boolean queryNew(Long sample);

    boolean diffWriteLog(Long sample);
}

```

## 提供默认实现

### MigrateCompareControlAbstract

```java

public abstract class MigrateCompareControlAbstract implements MigrateCompareControl {

    public Logger logger = LoggerFactory.getLogger(this.getClass());

    // ROC 监控名称
    static final String MIGRATE_QUERY_COMPARE_MONITOR_ROC_NAME = "roc-migrateQueryCompare-monitor";

    static final String MIGRATE_QUERY_GRAY_MONITOR_ROC_NAME = "roc-migrateQueryGray-monitor";


    public abstract String getMonitorConvergenceServiceName();

    public abstract ThreadPoolExecutor getCompareThreadPool();

    public abstract CompareGrayConfig getCompareGrayConfig(String key);


    /**
     * 异步比对
     */
    public <R> R migrate(Supplier<R> newQueryFunc, Supplier<R> oldQueryFunc, TypeReference<R> tr, Long sample, String key, BusinessCompare<R> businessCompare) {
        Supplier<R> newQuery = wrapQuery(key, "NewQuery", newQueryFunc);
        Supplier<R> oldQuery = wrapQuery(key, "OldQuery", oldQueryFunc);

        CompareGrayConfig compareGrayConfig = getCompareGrayConfig(key);
        boolean queryNew = Optional.ofNullable(compareGrayConfig).map(c -> c.queryNew(sample)).orElse(false);
        boolean stopQueryOld = Optional.ofNullable(compareGrayConfig).map(c -> c.stopQueryOld(sample)).orElse(false);
        boolean returnNew = Optional.ofNullable(compareGrayConfig).map(c -> c.returnNew(sample)).orElse(false);
        boolean diffWriteLog = Optional.ofNullable(compareGrayConfig).map(c -> c.diffWriteLog(sample)).orElse(true);

        // 使用新接口，同时停止查询旧才真正使用新接口结果，（此时老数据不会继续打热）
        if (queryNew && stopQueryOld) {
            monitorGray(key, "灰度内停止旧接口查询");
            return newQuery.get();
        }
        // 新老逻辑都查询，根据配置返回新结果or老结果。 根据配置执行对比
        else if (queryNew) {
            if (returnNew) {
                monitorGray(key, "灰度内使用新接口返回");
                R newResult = newQuery.get();
                String json = JsonUtils.toJson(newResult);
                getCompareThreadPool().submit(() -> {
                    compareResult(json, tr, oldQuery, true, key, sample, businessCompare, diffWriteLog);
                });
                return newResult;
            } else {
                monitorGray(key, "灰度内使用旧接口返回");
                R oldResult = oldQuery.get();
                String json = JsonUtils.toJson(oldResult);
                getCompareThreadPool().submit(() -> {
                    compareResult(json, tr, newQuery, false, key, sample, businessCompare, diffWriteLog);
                });
                return oldResult;
            }
        }
        // 仅走老逻辑
        else {
            monitorGray(key, "灰度外兜底旧接口返回");
            return oldQuery.get();
        }
    }

    /**
     * 同步比对
     */
    public <R> R migrateSync(Supplier<R> newQueryFunc, Supplier<R> oldQueryFunc, TypeReference<R> tr, Long sample, String key, BusinessCompare<R> businessCompare) {
        Supplier<R> newQuery = wrapQuery(key, "NewQuery", newQueryFunc);
        Supplier<R> oldQuery = wrapQuery(key, "OldQuery", oldQueryFunc);

        CompareGrayConfig compareGrayConfig = getCompareGrayConfig(key);
        boolean queryNew = Optional.ofNullable(compareGrayConfig).map(c -> c.queryNew(sample)).orElse(false);
        boolean stopQueryOld = Optional.ofNullable(compareGrayConfig).map(c -> c.stopQueryOld(sample)).orElse(false);
        boolean returnNew = Optional.ofNullable(compareGrayConfig).map(c -> c.returnNew(sample)).orElse(false);
        boolean diffWriteLog = Optional.ofNullable(compareGrayConfig).map(c -> c.diffWriteLog(sample)).orElse(true);

        // 使用新接口，同时停止查询旧才真正使用新接口结果，（此时老数据不会继续打热）
        if (queryNew && stopQueryOld) {
            monitorGray(key, "灰度内停止旧接口查询");
            return newQuery.get();
        }
        // 新老逻辑都查询，根据配置返回新结果or老结果。 根据配置执行对比
        else if (queryNew) {
            if (returnNew) {
                monitorGray(key, "灰度内使用新接口返回");
                R newResult = newQuery.get();
                String json = JsonUtils.toJson(newResult);
                compareResult(json, tr, oldQuery, true, key, sample, businessCompare, diffWriteLog);
                return newResult;
            } else {
                monitorGray(key, "灰度内使用旧接口返回");
                R oldResult = oldQuery.get();
                String json = JsonUtils.toJson(oldResult);
                compareResult(json, tr, newQuery, false, key, sample, businessCompare, diffWriteLog);
                return oldResult;
            }
        }
        // 仅走老逻辑
        else {
            monitorGray(key, "灰度外兜底旧接口返回");
            return oldQuery.get();
        }
    }


    public boolean isReturnNew(String key, Long sample) {
        CompareGrayConfig compareGrayConfig = getCompareGrayConfig(key);

        boolean queryNew = compareGrayConfig.queryNew(sample);
        boolean stopQueryOld = compareGrayConfig.stopQueryOld(sample);

        // 使用新接口，同时停止查询旧才真正使用新接口结果，（此时老数据不会继续打热）
        if (queryNew && stopQueryOld) {
            return true;
        }
        // 新老逻辑都查询，根据配置返回新结果or老结果。 根据配置执行对比
        else if (queryNew) {
            if (compareGrayConfig.returnNew(sample)) {
                return true;
            } else {
                return false;
            }
        }
        // 仅走老逻辑
        else {
            return false;
        }
    }

    private <R> void compareResult(String returnResultStr, TypeReference<R> returnResultTR, Supplier<R> otherQuery, boolean returnNew, String key, Long sample, BusinessCompare<R> businessCompare, boolean diffWriteLog) {
        try {
            R returnResult = JsonUtils.fromJson(returnResultStr, returnResultTR);
            R otherResult = otherQuery.get();

            boolean cmpResult = businessCompare.compare(returnResult, otherResult);
            if (!cmpResult && diffWriteLog) {
                logger.error("MigrateCompareControl diff returnNew:{}, key:{}, sample:{},\nreturnResult:{},\notherResult:{}", returnNew, key, sample, JsonUtils.toJson(returnResult), JsonUtils.toJson(otherResult));
            }
            monitorCompareResult(key, cmpResult);
        } catch (Exception e) {
            logger.error("MigrateCompareControl diff exception returnNew:{}, key:{}, sample:{}, returnResult:{}", returnNew, key, sample, returnResultStr, e);
        }
    }

    public <R> Supplier<R> wrapQuery(String key, String tag, Supplier<R> query) {
        return () -> {
            String transactionType = "MigrateQueryControl";
            String transactionName = String.format("%s_%s", key, tag);
            Transaction transaction = Cat.newTransaction(transactionType, transactionName);

            try {
                transaction.setStatus(Transaction.SUCCESS);
                return query.get();
            } catch (Throwable e) {
                transaction.setStatus(e);
                throw e;
            } finally {
                transaction.complete();
            }
        };
    }

    public void monitorGray(String key, String desc) {
        Map<String, String> tags = new HashMap<>();

        tags.put("name", "查询迁移请求处理监控");
        tags.put("appName", LeoUtils.getAppName());
        tags.put("key", key);
        tags.put("desc", desc);

        tags.put("platform_service", getMonitorConvergenceServiceName());

        // 2. 打点
        Metrics.logForCount(MIGRATE_QUERY_GRAY_MONITOR_ROC_NAME, 1, tags);
    }

    public void monitorCompareResult(String key, boolean cmpResult) {
        Map<String, String> tags = new HashMap<>();

        tags.put("name", "查询迁移结果比对监控");
        tags.put("appName", LeoUtils.getAppName());
        tags.put("key", key);
        tags.put("cmpResult", String.valueOf(cmpResult));

        tags.put("platform_service", getMonitorConvergenceServiceName());

        // 2. 打点
        Metrics.logForCount(MIGRATE_QUERY_COMPARE_MONITOR_ROC_NAME, 1, tags);
    }
}

```

### DefaultCompareGrayConfig

```java
@data

public class DefaultCompareGrayConfig implements CompareGrayConfig {

    private static final String ALL_SERVICE = "ALL";


    /**
     * 查询新逻辑的灰度，只进行灰度对比
     * 万分制
     */
    private Integer queryNewSampleRatio = 0;

    /**
     * 查询新逻辑的goodsId列表
     */
    private Set<Long> queryNewSampleList = new HashSet<>();

    /**
     * 查询新逻辑的服务列表
     */
    private Set<String> queryNewServiceNameList = new HashSet<>();

    /**
     * 返回新逻辑的灰度
     * 万分制
     * 前提：商品已经进入了查询新逻辑灰度
     */
    private Integer returnNewSampleRatio = 0;

    /**
     * 返回新逻辑的goodsId列表
     * 前提：商品已经进入了查询新逻辑灰度
     */
    private Set<Long> returnNewSampleList = new HashSet<>();

    /**
     * 使用新逻辑返回值的服务列表
     */
    private Set<String> returnNewServiceNameList = new HashSet<>();

    /**
     * 停止查询老逻辑的灰度
     * 万分制
     * 前提：已经进入了查询新逻辑灰度
     * 注意：停止查询之后，商品的不再对比请求结果，返回新逻辑的结果
     */
    private Integer stopQueryOldSampleRatio = 0;

    /**
     * 停止查询老逻辑的灰度
     * 商品灰度
     * 前提：已经进入了查询新逻辑灰度
     * 注意：停止查询之后，商品的不再对比请求结果，返回新逻辑的结果
     */
    private Set<Long> stopQueryOldSamples = new HashSet<>();

    /**
     * 停止查询老逻辑的灰度
     * 服务维度
     * 前提：已经进入了查询新逻辑灰度
     * 注意：停止查询之后，商品的不再对比请求结果，返回新逻辑的结果
     */
    private Set<String> stopQueryOldServiceNameList = new HashSet<>();

    /**
     * 当比对不一致的时候，是否输出日志
     * 如果业务自定义diff的日志，这里避免日志太多，可以关闭统一的diff日志输出
     */
    private Boolean diffWriteLog = true;


    @Override
    public boolean stopQueryOld(Long sample) {
        // 边界判断
        if (Objects.isNull(sample)) {
            return true;
        }

        String serviceName = LeoUtils.getAppName();

        Integer stopQueryOldSampleRatio = getStopQueryOldSampleRatio();
        Set<Long> stopQueryOldSample = getStopQueryOldSamples();
        Set<String> stopQueryOldServiceNameList = getStopQueryOldServiceNameList();

        // 不在灰度中的服务，不进行下面的灰度
        if (!stopQueryOldServiceNameList.contains(serviceName) && !stopQueryOldServiceNameList.contains(ALL_SERVICE)) {
            return false;
        }

        if (Objects.nonNull(stopQueryOldSampleRatio) && stopQueryOldSampleRatio >= 0) {
            if (sample % 10000 < stopQueryOldSampleRatio) {
                return true;
            }
        }

        if (CollectionUtils.isNotEmpty(stopQueryOldSample)) {
            if (stopQueryOldSample.contains(sample)) {
                return true;
            }
        }

        return false;
    }

    @Override
    public boolean returnNew(Long sample) {
        // 边界判断
        if (Objects.isNull(sample)) {
            return false;
        }

        String serviceName = LeoUtils.getAppName();

        Integer returnNewSampleRatio = getReturnNewSampleRatio();
        Set<Long> returnNewSampleList = getReturnNewSampleList();
        Set<String> returnNewServiceNameList = getReturnNewServiceNameList();

        // 不在灰度中的服务，不进行下面的灰度
        if (!returnNewServiceNameList.contains(serviceName) && !returnNewServiceNameList.contains(ALL_SERVICE)) {
            return false;
        }

        if (Objects.nonNull(returnNewSampleRatio) && returnNewSampleRatio >= 0) {
            if (sample % 10000 < returnNewSampleRatio) {
                return true;
            }
        }

        if (CollectionUtils.isNotEmpty(returnNewSampleList)) {
            if (returnNewSampleList.contains(sample)) {
                return true;
            }
        }

        return false;
    }

    @Override
    public boolean queryNew(Long sample) {
        // 边界判断
        if (Objects.isNull(sample)) {
            return false;
        }
        String serviceName = LeoUtils.getAppName();

        Integer queryNewSampleRatio = getQueryNewSampleRatio();
        Set<Long> queryNewSampleList = getQueryNewSampleList();
        Set<String> queryNewServiceNameList = getQueryNewServiceNameList();

        // 不在灰度中的服务，不进行下面的灰度
        if (!queryNewServiceNameList.contains(serviceName) && !queryNewServiceNameList.contains(ALL_SERVICE)) {
            return false;
        }

        if (Objects.nonNull(queryNewSampleRatio) && queryNewSampleRatio >= 0) {
            if (sample % 10000 < queryNewSampleRatio) {
                return true;
            }
        }

        if (CollectionUtils.isNotEmpty(queryNewSampleList)) {
            if (queryNewSampleList.contains(sample)) {
                return true;
            }
        }

        return false;
    }

    @Override
    public boolean diffWriteLog(Long sample) {
        return Optional.ofNullable(this.getDiffWriteLog()).orElse(true);
    }
}

```

### DefaultMigrateCompareControl

```java

public class DefaultMigrateCompareControl extends MigrateCompareControlAbstract {

    public String getGrayLeoKey() {
        return "migrate.select.query.control";
    }

    private ThreadPoolExecutor compareThreadPool = new ThreadPoolExecutor(
            64,
            64,
            60,
            TimeUnit.SECONDS,
            new LinkedBlockingQueue<>(1024),
            new ThreadPoolExecutor.DiscardPolicy()
    );

    private Map<String, DefaultCompareGrayConfig> defaultCompareGrayConfigMap = new HashMap<>();

    @PostConstruct
    public void init() {
        initializeGrayControlLO();

        ConfigCache.getInstance().addChange((k, v) -> {
            if (getGrayLeoKey().equals(k)) {
                initializeGrayControlLO();
            }
        });
    }

    private void initializeGrayControlLO() {
        String value = LeoUtils.getProperty(getGrayLeoKey());
        if (StringUtils.isNotBlank(value)) {
            this.defaultCompareGrayConfigMap = JsonUtils.fromJson(value,
                    new TypeReference<Map<String, DefaultCompareGrayConfig>>() {
                    });
        }

        if (null == this.defaultCompareGrayConfigMap) {
            logger.error("DefaultCompareGrayConfig leo value invalid value:{}", value);
            this.defaultCompareGrayConfigMap = new HashMap<>();
        }

        logger.info("DefaultCompareGrayConfig set new value: {}", JsonUtils.toJson(this.defaultCompareGrayConfigMap));
    }


    @Override
    public String getMonitorConvergenceServiceName() {
        return "test";
    }

    @Override
    public ThreadPoolExecutor getCompareThreadPool() {
        return compareThreadPool;
    }

    @Override
    public CompareGrayConfig getCompareGrayConfig(String key) {
        return this.defaultCompareGrayConfigMap.get(key);
    }
}

```

### MethodMigrateAspect

```java

@Aspect
@Component
@Order(1) // 要求 迁移灰度的切面包在方法的最外层（默认切面优先级 是 int.max)
public class MethodMigrateAspect {
    private static final Logger LOGGER = LoggerFactory.getLogger(MethodMigrateAspect.class);

    final private Map<String, MigrateCompareControl> migrateCompareControlMap = new ConcurrentHashMap<>();
    final private Map<Class, Object> classMapBean = new ConcurrentHashMap<>();

    @Around(value = "@annotation(com.yiran.service.libra.common.logiccompare.aop.MethodMigrateAOP)")
    public Object process(ProceedingJoinPoint pjp) throws Throwable {
        // 应急开关
        Boolean totalSwitch = LeoUtils.getBooleanProperty("methodMigrateAspect.total.switch", true);
        if (BooleanUtils.isFalse(totalSwitch)) {
            monitor("totalSwitch", "TotalSwitchClosed");
            return pjp.proceed();
        }

        // 准备数据
        Object[] args = pjp.getArgs();
        MethodSignature signature = (MethodSignature) pjp.getSignature();

        String fromClassSimpleName = signature.getMethod().getDeclaringClass().getSimpleName();
        String fromMethodName = signature.getMethod().getName();
        Type genericReturnType = signature.getMethod().getGenericReturnType();
        Annotation[][] parameterAnnotations = signature.getMethod().getParameterAnnotations();
        String controlKey = String.format("%s.%s", fromClassSimpleName, fromMethodName);

        MethodMigrateAOP annotation = signature.getMethod().getAnnotation(MethodMigrateAOP.class);
        Class[] parameterTypes = signature.getParameterTypes();

        Class<? extends MigrateCompareControl> controlClass = annotation.control();
        Class<? extends BusinessCompare> compareUtil = annotation.compare();
        Class<?> targetClass = annotation.targetClass();
        String targetMethod = annotation.targetMethod();

        MigrateCompareControl control = findMigrateControl(controlKey, controlClass);
        if (null == control) {
            // 如果没有找到切换的控制中心, 正常执行逻辑
            monitor(controlKey, "MigrateControlNotFound");
            return pjp.proceed();
        }

        Object targetClassBean = findTargetClassBean(targetClass);
        if (null == targetClassBean) {
            // 如果没有找到目标类的bean，正常执行逻辑
            monitor(controlKey, "TargetBeanNotFound");
            return pjp.proceed();
        }

        Long simpleKey = findSimpleKey(args, parameterAnnotations);
        if (null == simpleKey) {
            // 没有找到灰度的Key
            monitor(controlKey, "SimpleKeyNotFound");
            return pjp.proceed();
        }

        try {
            Supplier<Object> oldQuery = () -> {
                try {
                    return pjp.proceed();
                } catch (Throwable e) {
                    throw new MethodMigrateException("老逻辑执行失败", e);
                }
            };

            Supplier<Object> newQuery = () -> {
                Method method = null;
                try {
                    method = targetClass.getDeclaredMethod(targetMethod, parameterTypes);
                } catch (NoSuchMethodException e) {
                    throw new MethodMigrateException("新逻辑Bean未找到", e);
                }

                Object newResult = null;
                try {
                    newResult = method.invoke(targetClassBean, args);
                } catch (Throwable e) {
                    throw new MethodMigrateException("新逻辑调用失败", e);
                }

                return newResult;
            };

            TypeReference<Object> typeRef = new TypeReference<Object>() {
                @Override
                public Type getType() {
                    // 这里不管 TypeReference 上的范型是什么类型，真正用的都是 genericReturnType
                    // genericReturnType 不会吞掉范型里面的类型，比如 List<GoodsActivityDetailDTO>, class 给的是 List.class, genericReturnType 给的是List<GoodsActivityDetailDTO>
                    return genericReturnType;
                }
            };

            return control.migrate(newQuery, oldQuery, typeRef, simpleKey, controlKey, compareUtil.newInstance());
        } catch (Throwable e) {
            // 如果中间异常了，这里再走一遍老逻辑，然后返回
            LOGGER.error("MethodMigrateAspect run migrate exception", e);
            monitor(controlKey, "UnknownException");
            return pjp.proceed();
        }
    }

    private Long findSimpleKey(Object[] args, Annotation[][] parameterAnnotations) {
        for (int i = 0; i < args.length; i++) {
            Annotation[] parameterAnnotation = parameterAnnotations[i];
            for (Annotation annotation : parameterAnnotation) {
                if (annotation instanceof MigrateSimpleKey) {
                    return NumberUtils.objectToLong(args[i]);
                }
            }
        }

        return null;
    }

    private Object findTargetClassBean(Class targetClass) {
        Object bean = this.classMapBean.get(targetClass);
        if (null != bean) {
            return bean;
        }

        bean = ApplicationContextHolder.getBeanNotNull(targetClass);
        this.classMapBean.put(targetClass, bean);

        return bean;
    }

    private MigrateCompareControl findMigrateControl(String controlKey, Class<? extends MigrateCompareControl> controlClass) {
        MigrateCompareControl migrateCompareControl = this.migrateCompareControlMap.get(controlKey);
        if (null != migrateCompareControl) {
            return migrateCompareControl;
        }

        migrateCompareControl = ApplicationContextHolder.getBeanNotNull(controlClass);
        this.migrateCompareControlMap.put(controlKey, migrateCompareControl);

        return migrateCompareControl;
    }

    private void monitor(String key, String desc) {
        Cat.logEvent("MethodMigrateAOP", desc, "Error", String.format("%s_%s", key, desc));
    }

}

```