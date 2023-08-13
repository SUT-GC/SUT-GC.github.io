---
layout: post
title: "统一缓存查询框架"
description: "统一缓存查询框架"
categories: [工作]
tags: [Code]
---

* Kramdown table of contents
{:toc .toc}


# 统一缓存查询框架

**使用代码**

```java
    @Override
    public List<GoodsActivityGroupDTO> cacheQueryGoodsActivityGroups(Long goodsId, List<Long> activityGroupIds) {
        return batchQuery(BatCacheConstants.CACHE_PREFIX_GOODS_ACTIVITY_GROUP, // 标记
                activityGroupIds, CacheKeyGenerator::genGoodsActivityGroupCacheKey, // cache key 生成规则
                CacheValueSerialize::serializeGoodsActivityGroup, CacheValueSerialize::deSerializeGoodsActivityGroup // 序列化反序列方式
                , missIds -> { // miss 之后 查询数据的逻辑
                    List<GoodsActivityGroupDTO> groups = goodsActivityDBV2.batchQueryGoodsActivityGroup(goodsId, missIds);
                    return Optional.ofNullable(groups).orElse(new ArrayList<>()).stream().collect( Collectors.toMap(GoodsActivityGroupDTO::getActivityGroupId, Function.identity(), (v1, v2) -> v2));
                });
    }
```

**实现代码** 



```java

public class CacheQuery {

    private Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    private BatTemplate newBatTemplate;

    /**
     * 批量查询数据（包装了 从缓存查询，miss之后从DB查询等逻辑）
     *
     * @param tag             标记（用作打点）
     * @param idList          实体ID列表
     * @param keyGenerator    缓存key 生成器
     * @param serialize       序列化方式
     * @param deSerialize     反序列化方式
     * @param missGetFunction miss 之后的操作逻辑
     */
    <T, M> List<T> batchQuery(String tag,
            List<M> idList, Function<M, String> keyGenerator,
            Function<T, String> serialize, Function<String, T> deSerialize,
            Function<List<M>, Map<M, T>> missGetFunction) {
        List<T> result = new ArrayList<>();

        // 没有id，直接返回
        if (CollectionUtils.isEmpty(idList)) {
            return result;
        }

        // 映射id成缓存的: key: id
        Map<String, M> keyMapId = idList.stream()
                .collect(Collectors.toMap(keyGenerator, Function.identity(), (v1, v2) -> v2));

        // 查缓存
        int size = keyMapId.size();
        String[] cacheKeys = keyMapId.keySet().toArray(new String[size]);
        List<KeyValue<String, String>> keyValueList = newBatTemplate.mget(cacheKeys);

        List<M> hitCacheIds = new ArrayList<>(); // 记录命中缓存的id
        List<M> missCacheIds = new ArrayList<>(); // 记录未命中缓存的id

        // 将缓存中存在的数据 反序列化成对象，存到结果里面
        // 将缓存中不存在的数据 整理成 missCacheId
        for (KeyValue<String, String> keyValue : keyValueList) {
            String cacheKey = keyValue.getKey();
            M groupId = keyMapId.get(cacheKey);

            if (!keyValue.hasValue()) {
                missCacheIds.add(groupId);
            } else {
                hitCacheIds.add(groupId);
                T cached = deSerialize.apply(keyValue.getValue());
                result.add(cached);
            }
        }

        // 如果存在 没有缓存的id，查询 missGetFunction ，之后再把查询到的结果缓存起来
        if (CollectionUtils.isNotEmpty(missCacheIds)) {
            // 查"DB"
            Map<M, T> dbValues = missGetFunction.apply(missCacheIds);
            if (MapUtils.isNotEmpty(dbValues)) { // DB查到结果且不为null，将结果存到返回值中
                dbValues.forEach((k, v) -> {
                    if (null != v) {
                        result.add(v);
                    }
                });
            }

            if (MapUtils.isNotEmpty(dbValues)) { // DB查到结果且不为null，将结果存到Cache中
                Map<String, String> kv = new HashMap<>();
                for (Entry<M, T> entry : dbValues.entrySet()) {
                    if (null == entry.getValue()) {
                        continue;
                    }

                    kv.put(keyGenerator.apply(entry.getKey()), serialize.apply(entry.getValue()));
                }
                Boolean success = newBatTemplate.execute(action -> {
                    BatPipeline pipelined = action.pipelined();
                    kv.forEach((k, v) -> pipelined.set(k, v, Builder.ex(BatCacheConstants.COMMON_EXPIRE_TIME)));
                    return pipelined.sync();
                });

                if (!success) {
                    logger.error("Bat exec pipelined error", new LibraBatException("bat pipeline exec error"));
                }
            }
        }

        // 打点
        String type = String.format("Cache-%s", tag);
        if (hitCacheIds.size() > 0) {
            Cat.logEvent(type, "hit", Transaction.SUCCESS, null, hitCacheIds.size());
        }
        if (missCacheIds.size() > 0) {
            Cat.logEvent(type, "miss", Transaction.SUCCESS, null, missCacheIds.size());
        }

        return result;
    }

    <T, M> T query(String tag,
            M id, Function<M, String> keyGenerator,
            Function<T, String> serialize, Function<String, T> deSerialize,
            Function<M, T> missGetFunction) {
        // 映射id成缓存的: key: id
        String cacheKey = keyGenerator.apply(id);

        // 打点
        String type = String.format("Cache-%s", tag);

        // 查缓存
        String cacheValue = newBatTemplate.get(cacheKey);

        // 将缓存中存在的数据 反序列化成对象，直接返回
        if (StringUtils.isNotBlank(cacheValue)) {
            Cat.logEvent(type, "hit", Transaction.SUCCESS, null, 1);
            return deSerialize.apply(cacheValue);
        }

        // 如果存在 没有缓存的id，查询 missGetFunction ，之后再把查询到的结果缓存起来
        T dbValue = missGetFunction.apply(id);
        Cat.logEvent(type, "miss", Transaction.SUCCESS, null, 1);

        if (null != dbValue) {
            newBatTemplate.set(cacheKey, serialize.apply(dbValue), Builder.ex(BatCacheConstants.COMMON_EXPIRE_TIME));
        }

        return null;
    }

    <M> void clear(String tag, M id, Function<M, String> keyGenerator) {
        // 映射id成缓存的: key: id
        String cacheKey = keyGenerator.apply(id);

        newBatTemplate.expire(cacheKey, 1);

        // 打点
        String type = String.format("Cache-%s", tag);
        Cat.logEvent(type, "delete", Transaction.SUCCESS, null, 1);
    }
}

```