---
layout: post
title: "Elasticsearch 干货篇"
description: "一切那么相似，却又不同"
categories: [学习]
tags: [elasticsearch]
---

* Kramdown table of contents
{:toc .toc}

# Elasticsearch 是什么

Elasticsearch（下面简称ES）是对Lucene进行倒排索引的建立，并且对其封装，最终达到分布式，高可用效果的工具。它是一个 **分布式的文档存储引擎** 和 **分布式的搜索引擎和分析引擎**    

以物理维度可分为：     

* 集群（cluster）
* 节点（node）
* 分片 (shard)
	* 主分片（primary shard）
	* 从分片（replace shard）

以逻辑维度可分为：     

* 索引（index）
* 类型（type）
* 文档（document）

> primary shard 在集群启动的时候便指定好，且不能修改，默认为5, 且会根据动态增加机器的数量而自动负载分配。      
> primary shard 不能和自己的 replace shard 在同一个node上，可以与其他primary shard的replace shard在一个分片上，同时也推荐这么做，为了让每个机器都均衡读写压力，避免浪费资源     


# Api

> 这里对基本的Api进行了一些简单说明，并附上例子

## GET

### /_cat/health?v

显示集群健康状态     

```
epoch      timestamp cluster       status node.total node.data shards pri relo init unassign pending_tasks max_task_wait_time active_shards_percent
1509879042 18:50:42  elasticsearch yellow          1         1      1   1    0    0        1             0                  -                 50.0%
```

> * green primary shard 和 replace shard 都处于可用状态
> * yello 不是所有的replace shard 都处于可用状态
> * red 不是所有的primary shard 都处于可用状态

### /_cat/indices?v

显示集群中的索引      

```
health status index   uuid                   pri rep docs.count docs.deleted store.size pri.store.size
yellow open   .kibana pZ5JQLabQeezCesSaH5EYQ   1   1          1            0      3.1kb          3.1kb
```

### /myindex/mytype/1

查询id为1的document

### /_mget

request

```
GET /_mget
{
  "docs":[
    {
      "_index":"myindex",
      "_type":"mytype",
      "_id":1
    },
    {
      "_index":"ecommerce",
      "_type":"product",
      "_id":1
    }
  ]
}
```

```
GET /myindex/mytype/_mget
{
  "ids":[1,2]
}
```

> mget 只能对id进行查询

### /myindex/mytype/_search

#### 查询所有

request: 

```
{
  "query":{
    "match_all": {}
  }
}
```

response:

```
{
  "took": 4,
  "timed_out": false,
  "_shards": {
    "total": 5,
    "successful": 5,
    "failed": 0
  },
  "hits": {
    "total": 2,
    "max_score": 1,
    "hits": [
      {
        "_index": "myindex",
        "_type": "mytype",
        "_id": "5",
        "_score": 1,
        "_source": {
          "name": "nb",
          "chinese": "四头牛",
          "age": 20,
          "address": "北京市 北京大学 计算机专业",
          "friends": [
            {
              "name": "gc"
            },
            {
              "name": "cwen"
            }
          ]
        }
      },
      {
        "_index": "myindex",
        "_type": "mytype",
        "_id": "1",
        "_score": 1,
        "_source": {
          "name": "gc",
          "chinese": "竹轩小超",
          "friends": [
            {
              "name": "f1"
            },
            {
              "name": "f2"
            }
          ]
        }
      }
    ]
  }
}
```

> * took：耗费了几毫秒
> * timed_out：是否超时，这里是没有
> * _shards：数据拆成了5个分片，所以对于搜索请求，会打到所有的primary shard（或者是它的某个replica shard也可以）
> * hits.total：查询结果的数量，2个document
> * hits.max_score：score的含义，就是document对于一个search的相关度的匹配分数，越相关，就越匹配，分数也高
> * hits.hits：包含了匹配搜索的document的详细数据

#### 指定查询条件并排序,分页,指定显示字段

request:

```
{
  "query":{
    "match":{
      "school":"sut"
    }
  },
  "sort":[
    {
      "age":{
        "order":"desc"
      }
    }
  ],
  "from":0,
  "size":2,
  "_source":[
      "friends.name", "name"
    ]
}
```

response:

```
{
  "took": 20,
  "timed_out": false,
  "_shards": {
    "total": 5,
    "successful": 5,
    "failed": 0
  },
  "hits": {
    "total": 2,
    "max_score": null,
    "hits": [
      {
        "_index": "myindex",
        "_type": "mytype",
        "_id": "1",
        "_score": null,
        "_source": {
          "name": "gc",
          "friends": [
            {
              "name": "f1"
            },
            {
              "name": "f2"
            }
          ]
        },
        "sort": [
          23
        ]
      },
      {
        "_index": "myindex",
        "_type": "mytype",
        "_id": "5",
        "_score": null,
        "_source": {
          "name": "nb",
          "friends": [
            {
              "name": "gc"
            },
            {
              "name": "cwen"
            }
          ]
        },
        "sort": [
          20
        ]
      }
    ]
  }
}
```

#### Query Filter

requst:

```
{
  "query":{
    "bool":{
      "must":{
        "match":{
          "name":"gc"
        }
      },
      "filter":{
        "range":{
          "age":{
            "gt":10
          }
        }
      }
    }
  }
}
```

response:

```
{
  "took": 36,
  "timed_out": false,
  "_shards": {
    "total": 5,
    "successful": 5,
    "failed": 0
  },
  "hits": {
    "total": 1,
    "max_score": 0.2876821,
    "hits": [
      {
        "_index": "myindex",
        "_type": "mytype",
        "_id": "1",
        "_score": 0.2876821,
        "_source": {
          "name": "gc",
          "chinese": "竹轩小超",
          "friends": [
            {
              "name": "f1"
            },
            {
              "name": "f2"
            }
          ],
          "age": 23,
          "school": "sut"
        }
      }
    ]
  }
}
```

#### Full Text Search

全文检索

request:

```
{
  "query": {
    "match": {
      "name": "gc world"
    }
  }
}
```

response:

```
{
  "took": 2,
  "timed_out": false,
  "_shards": {
    "total": 5,
    "successful": 5,
    "failed": 0
  },
  "hits": {
    "total": 2,
    "max_score": 0.5063205,
    "hits": [
      {
        "_index": "myindex",
        "_type": "mytype",
        "_id": "2",
        "_score": 0.5063205,
        "_source": {
          "name": "gc hello world",
          "chinese": "竹轩小超 你好 世界",
          "friends": [
            {
              "name": "gc"
            },
            {
              "name": "f2"
            }
          ],
          "age": 22,
          "school": "sut"
        }
      },
      {
        "_index": "myindex",
        "_type": "mytype",
        "_id": "1",
        "_score": 0.2876821,
        "_source": {
          "name": "gc",
          "chinese": "竹轩小超",
          "friends": [
            {
              "name": "f1"
            },
            {
              "name": "f2"
            }
          ],
          "age": 23,
          "school": "sut"
        }
      }
    ]
  }
}
```

> 请注意 gc world 召回的内容有 gc & gc hello world, 相关解释 可以看下面 “小知识-全文检索模式召回的内容可能包括什么”

#### Parse Search

短语检索

request:

```
{
  "query": {
    "match_phrase": {
      "name": "gc hello"
    }
  }
}
```

response:

```
{
  "took": 6,
  "timed_out": false,
  "_shards": {
    "total": 5,
    "successful": 5,
    "failed": 0
  },
  "hits": {
    "total": 1,
    "max_score": 0.5063205,
    "hits": [
      {
        "_index": "myindex",
        "_type": "mytype",
        "_id": "2",
        "_score": 0.5063205,
        "_source": {
          "name": "gc hello world",
          "chinese": "竹轩小超 你好 世界",
          "friends": [
            {
              "name": "gc"
            },
            {
              "name": "f2"
            }
          ],
          "age": 22,
          "school": "sut"
        }
      }
    ]
  }
}
```

#### High Light Search

request:

```
{
  "query": {
    "match": {
      "name": "gc"
    }
  },
  "highlight": {
    "fields": {
      "name":{}
    }
  }
}
```

response:

```
{
  "took": 44,
  "timed_out": false,
  "_shards": {
    "total": 5,
    "successful": 5,
    "failed": 0
  },
  "hits": {
    "total": 2,
    "max_score": 0.2876821,
    "hits": [
      {
        "_index": "myindex",
        "_type": "mytype",
        "_id": "1",
        "_score": 0.2876821,
        "_source": {
          "name": "gc",
          "chinese": "竹轩小超",
          "friends": [
            {
              "name": "f1"
            },
            {
              "name": "f2"
            }
          ],
          "age": 23,
          "school": "sut"
        },
        "highlight": {
          "name": [
            "<em>gc</em>"
          ]
        }
      },
      {
        "_index": "myindex",
        "_type": "mytype",
        "_id": "2",
        "_score": 0.25316024,
        "_source": {
          "name": "gc hello world",
          "chinese": "竹轩小超 你好 世界",
          "friends": [
            {
              "name": "gc"
            },
            {
              "name": "f2"
            }
          ],
          "age": 22,
          "school": "sut"
        },
        "highlight": {
          "name": [
            "<em>gc</em> hello world"
          ]
        }
      }
    ]
  }
}
```

------------------------------

## PUT

### /myindex?pretty

创建myindex索引       

```
health status index    uuid                   pri rep docs.count docs.deleted store.size pri.store.size
yellow open   myindex tnti6_VoTH65oFWCElVd2w   5   1          0            0       650b           650b
yellow open   .kibana  pZ5JQLabQeezCesSaH5EYQ   1   1          1            0      3.1kb          3.1kb
```

> 默认5个primary shard， 每个primary shard带1个replace shard

### /myindex/mytype/1

创建/更新 id为1 的document （id可以省略，会根据全局唯一id算法生成uuid）      

body     

```
{
  "name":"gc",
  "chinese":"小超",
  "friends":[
    {
      "name":"f1"
    },
    {
      "name":"f2"
    }
  ]
}
```

result      

```
{
  "_index": "myindex",
  "_type": "mytype",
  "_id": "1",
  "_version": 1,
  "result": "updated",
  "_shards": {
    "total": 2,
    "successful": 1,
    "failed": 0
  },
  "created": false
}
```

> es会自动建立index和type，不需要提前创建，而且es默认会对document每个field都建立倒排索引，让其可以被搜索     
> 当document存在的时候进行更新/不存在的时候进行创建 **更新的时候必须传入所有的字段（全量更新）**    
> 如果只更新某一字段，用post /myindex/mytype/id

### /myindex/mytype/1/_created

会强制创建，如果存在id为1的数据，则报错


------------------------------


## POST

### /myindex/mytype/id/_update

部分字段更新

requst：      

```
Post /myindex/mytype/1/_update
{
  "doc":{
    "chinese":"竹轩小超"
  }
}
```

result:      

```
{
  "_index": "myindex",
  "_type": "mytype",
  "_id": "1",
  "_version": 9,
  "found": true,
  "_source": {
    "name": "gc",
    "chinese": "竹轩小超",
    "friends": [
      {
        "name": "f1"
      },
      {
        "name": "f2"
      }
    ]
  }
}
```

### /_bulk


可以批量进行增删改操作, 除了delete，其他action都必须存在两行json      

request

```
{ "delete": { "_index": "test_index", "_type": "test_type", "_id": "3" }} 
{ "create": { "_index": "test_index", "_type": "test_type", "_id": "12" }}
{ "test_field":    "test12" }
{ "index":  { "_index": "test_index", "_type": "test_type", "_id": "2" }}
{ "test_field":    "replaced test2" }
{ "update": { "_index": "test_index", "_type": "test_type", "_id": "1", "_retry_on_conflict" : 3} }
{ "doc" : {"test_field2" : "bulk test1"} }
```

response

```
{
  "took": 1566,
  "errors": true,
  "items": [
    {
      "delete": {
        "found": false,
        "_index": "test_index",
        "_type": "test_type",
        "_id": "3",
        "_version": 1,
        "result": "not_found",
        "_shards": {
          "total": 2,
          "successful": 1,
          "failed": 0
        },
        "status": 404
      }
    },
    {
      "create": {
        "_index": "test_index",
        "_type": "test_type",
        "_id": "12",
        "_version": 1,
        "result": "created",
        "_shards": {
          "total": 2,
          "successful": 1,
          "failed": 0
        },
        "created": true,
        "status": 201
      }
    },
    {
      "index": {
        "_index": "test_index",
        "_type": "test_type",
        "_id": "2",
        "_version": 1,
        "result": "created",
        "_shards": {
          "total": 2,
          "successful": 1,
          "failed": 0
        },
        "created": true,
        "status": 201
      }
    },
    {
      "update": {
        "_index": "test_index",
        "_type": "test_type",
        "_id": "1",
        "status": 404,
        "error": {
          "type": "document_missing_exception",
          "reason": "[test_type][1]: document missing",
          "index_uuid": "ukj3IsGUStWwrJdgTFbqug",
          "shard": "3",
          "index": "test_index"
        }
      }
    }
  ]
}
```

> * 不会某一个因为错误而终端操作      
> * delete 不需要两行命令      
> * update 是强部分更新，id不存在则报错      
> * create 是强创建，id存在则报错     
> * index 如果id存在则全量更新，如果id不存在则创建      
> * bulk 存在最佳的size大小，需要压测决定     

------------------------------

## DELETE

### /myindex?pretty

删除myindex      

### /myindex/mytype/1

删除id为1的document      

> Delete 操作并不是立刻将数据做物理删除，会把数据打删除标签，当数据积累到一定数量的时候，在物理删除（打删除标签的数据不会复制到replace上去，也不会被查询出来）

------------------------------

# 配置

# 小知识

## _score 的分数是怎么算出来的

在 Elasticsearch 中, 标准的算法是 Term Frequency/Inverse Document Frequency, 简写为 TF/IDF       

* Term Frequency

某单个关键词(term) 在某文档的某字段中出现的频率次数, 显然, 出现频率越高意味着该文档与搜索的相关度也越高        

具体计算公式是 tf = sqrt(termFreq)    

* Inverse document frequency

某个关键词(term) 在索引(单个分片)之中出现的频次. 出现频次越高, 这个词的相关度越低.      

具体计算公式是 idf = 1 + ln(maxDocs/(docFreq + 1))    

* Field-length Norm

字段长度, 这个字段长度越短, 那么字段里的每个词的相关度也就越大. 某个关键词(term) 在一个短的句子出现, 其得分比重比在一个长句子中出现要来的高.      

具体计算公式是 norm = 1/sqrt(numFieldTerms)     

* Score =  tf * idf * norm (可以自定义权重)

## 全文检索模式召回的内容可能包括什么

在做全文检索的时候，会有如下几步操作：      

1. 增加新的document的时候，会对text内容进行分词处理      
2. 用分好的词对text内容做倒排索引      
3. 在对某个字符串A做全文检索的时候，先对字符串做分词梳理      
4. 如果倒排索引对应的document包含A的一个分词，则这个倒排索引对应的文档将会被召回      


## 一个节点可以充当什么角色

* 主节点

控制Elasticsearch集群，负责集群中的操作，比如创建/删除一个索引，跟踪集群中的节点，分配分片到节点。主节点处理集群的状态并广播到其他节点，并接收其他节点的确认响应。
每个节点都可以通过设定配置文件elasticsearch.yml中的node.master属性为true(默认)成为主节点。对于大型的生产集群来说，推荐使用一个专门的主节点来控制集群，该节点将不处理任何用户请求。

* 数据节点

数据节点：持有数据和倒排索引。默认情况下，每个节点都可以通过设定配置文件elasticsearch.yml中的node.data属性为true(默认)成为数据节点。如果我们要使用一个专门的主节点，应将其node.data属性设置为false。

* 客户端节点

如果我们将node.master属性和node.data属性都设置为false，那么该节点就是一个客户端节点，扮演一个负载均衡的角色，将到来的请求路由到集群中的各个节点。
Elasticsearch集群中作为客户端接入的节点叫协调节点。协调节点会将客户端请求路由到集群中合适的分片上。对于读请求来说，协调节点每次会选择不同的分片处理请求，以实现负载均衡。     

如果不去专门设置客户端节点，则每个节点都是一个客户端节点，即每个节点都负责着发布请求的工作      

## 当进行写操作的时候，ES都发生了什么事情

Elasticsearch集群中的每个节点都包含了改节点上分片的元数据信息。协调节点(默认)使用文档ID参与计算，以便为路由提供合适的分片。Elasticsearch使用MurMurHash3函数对文档ID进行哈希，其结果再对分片数量取模，得到的结果即是索引文档的分片。      

当分片所在的节点接受到来自协调节点的请求后，会将该请求写入translog, 并且将文档更新如内存缓存，主节点更新成功后，并发将请求打入其replace shard，并且将translog同步到replace shard，最后客户端才会收到相应。      

内存缓冲会被周期性刷新(默认是1秒)，内容将被写到文件系统缓存的一个新段上。虽然这个段并没有被同步(fsync)，但它是开放的，内容可以被搜索到。      

每30分钟，或者当translog很大的时候，translog会被清空，文件系统缓存会被同步。这个过程在Elasticsearch中称为冲洗(flush)。在冲洗过程中，内存中的缓冲将被清除，内容被写入一个新段。段的fsync将创建一个新的提交点，并将内容刷新到磁盘。旧的translog将被删除并开始一个新的translog。      

由上面的操作，则可以将磁盘写入频率降低，并且不保证数据丢失（因为可以回滚translog)

# 经验

