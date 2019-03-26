---
layout: post
title: "Elasticsearch 学习笔记"
description: "Elasticsearch 学习笔记"
categories: [学习]
tags: [elasticsearch]
---

* Kramdown table of contents
{:toc .toc}

# elasticsearch 学习笔记

## 1 基本概念

### 1.1 接近实时（NRT）

Elasticsearch 是一个接近实时的搜索平台，从索引一个文档到这个文档被搜索到有一个很小的延迟（通常是1s）

### 1.2 集群（Cluster）

一个集群就是由一个节点组织在一起，他们共同持有你全部的数据，并且一起提供索引与搜索功能。一个集群由一个唯一的名字标识，一个节点通常指定某个集群的名字来加入这个集群。

> 一个集群中只包含一个节点是合法的。另外你可以拥有多个集群，以名字划分

### 1.3 节点（Node）

一个节点直观点说就是一个集群中的一台服务器，作为集群的一部分，它存储你的数据，参与集群的索引和搜索功能。它也是用一个名字来标识的。默认情况下，这个名字是随机的Marvel角色的名字，这个名字会在节点启动的时候被分配。
一个节点可以通过配置集群名称的方式加入一个指定的集群，默认情况下，每个节点都会被加入名叫"elasticsearch"的集群当中。

### 1.4 索引（Index）

一个索引就是一个拥有相似特征的文档集合。比如说学生数据索引，订单数据索引。一个索引由一个名字来标识（必须全是小写字母），并且当我们对这个索引中的文档进行搜索，更新，删除的时候都会用到这个名字。在一个集群中，你能够创建任意多的索引。

### 1.5 类型（Type）

在一个索引中，你可以指定多个类型。一个类型是索引的一个逻辑上的分类，通常会以一组相同字段的文档定义一个类型。比如我们要设计一个博客系统，那么这个博客系统就是一个索引，博客系统中的用户数据定义一个类型，博客数据可以定义一个类型。

### 1.6 文档（Document）

一个文档是一个可以被索引的基础信息单元，比如我们可以拥有一个客户文档，产品文档，订单文档，文档以json的形式存储。在一个index/type中可以有多个文档，但是注意，一个文档物理上存在于一个索引中，但是文档必须被索引／赋予一个索引的type

### 1.7 分片和复制 （Shards and Replicas）

一个索引可以存储超出单个节点硬件限制的大量数据。比如一个具有10亿文档的索引占据1TB的磁盘空间，但是任何一个节点都不能提供这么大的存储空间，为了解决这个问题，Elasticsearch提供了将索引划分成多个分片的能力。当创建索引的时候，可以指定创建多少分片数量。每个分片本身也是一个具有功能完善并且独立的“索引”。

分片之所以重要，主要原因有：

* 允许水平分割／扩展容量
* 允许在分片之上进行分布式，并行操作，提高性能／吞吐量

在网络环境里，某个分片完全有可能处于离线活着消失的状态，故障转移机制是非常重要的，因此Elasticsearch 允许我们创建分片的一份活着多份拷贝，这叫复制。

复制重要的原因：

* 高可用
* 搜索可以在所有的复制上并行操作，复制可以扩展搜索量

默认情况下，Es(Elasticsearch的简称）为我们每个索引创建5个主分片和一个复制，这就意味着集群中至少有两个节点，索引会将有5个主分片和另外5个复制分片，也就是一个索引一共有10个分片。

> ps 这里索引，类型，文档，分片复制的概念可能有点模糊的同学，我可以举一个相似的🌰    
> 
> ES        ---- >       Mysql
> Index     ---- >       database
> Type      ---- >       table
> Document  ---- >       table.rows
> Shards    ---- >       sharding
> Replicas  ---- >       master and slave
>   
> 仅仅是做概念上的理解帮助，两者并不是一种东西


---

## 2. 安装

Elasticsearch 需要 java7以及以上版本

用下面的命令下载 Elasticsearch 1.4.2 tar 包

 ```
 curl -L -O https://download.elasticsearch.org/elasticsearch/elasticsearch/elasticsearch-1.4.2.tar.gz
 ```

将其解压并且启动单个节点的集群

```
tar -xvf elasticsearch-1.4.2.tar.gz
cd elasticsearch-1.4.2/bin
./elasticsearch
```

我们可以覆盖集群或者节点的名字启动

```
./elasticsearch --cluster.name my_cluster_name --node.name my_node_name
```

默认情况下，Elasticsearch使用9200来提供REST API 的访问，如果有必要，这个端口是可以被配置的

其二进制文件也可以从 [官网](https://www.elastic.co/downloads/elasticsearch)

---

## 3 操作集群

### 3.1 rest 接口

现在我们已经有一个正常运行的节点（和集群），下一步就是要去理解如果与其通信。幸运的是，ES提供了非常全面强大的REST API, 利用这个REST API 可以与集群交互，下面我们搞点事情。

### 3.2 集群健康

我们使用Curl或者任何一个可以创建HTTP/REST调用的工具来使用该功能

命令

GET `localhost:9200/_cat/health?v` 

响应

```
epoch      timestamp cluster       status node.total node.data shards pri relo init unassign 
1489252285 02:11:25  elasticsearch green           1         1      0   0    0    0        0 
```

> 下面默认此格式（上一个是请求，下一个是响应) ⚠️


我们查到集群名字是"elasticsearch",状态green

* green 一切正常（集群功能齐全）
* yello 所有数据是可用的，但是某些复制没有分配（功能齐全）
* red 由于某些原因，数据不可用

上面的响应中，可以看出 一个集群，一个节点，没有分片，由于我们默认配置，所以es使用`多播`的发现其他节点。

### 3.3 列出所有节点

GET `localhost:9200/_cat/nodes?v`

```
host      ip        heap.percent ram.percent load node.role master name    
localhost 127.0.0.1           10          90 0.15 d         *      Vulture 
```


### 3.4 列出所有索引

GET `localhost:9200/_cat/indices?v`

```
health index pri rep docs.count docs.deleted store.size pri.store.size
```

没有索引

### 3.5 创建索引

PUT `localhost:9200/test?pretty` 

```json
{
  "acknowledged" : true
}
```

> pretty 美丽的用json打印返回

GET `localhost:9200/_cat/indices?v`

```
health status index pri rep docs.count docs.deleted store.size pri.store.size 
yellow open   test    5   1          0            0       575b           575b
```

> yellow 代表没有复制，因为默认情况下，ES会分配一个复制，但是现在只有一个节点，所以复制用不了

### 3.5 索引一个文档

因为如果索引一个文档，必须有个类型(Type),我们把一个学生信息索引入test

PUT `localhost:9200/test/student/1`

```
curl -i -X PUT \
   -H "Content-Type:application/json" \
   -d \
'{
  "name":"igouc"
}' \
 'http://localhost:9200/test/student/1'
```

```json
{
    "_index": "test",
    "_type": "student",
    "_id": "1",
    "_version": 1,
    "created": true
}
```

> 1 代表id为 1

索引这个文档

GET `localhost:9200/test/student/1?pretty`

```json
{
    "_index": "test",
    "_type": "student",
    "_id": "1",
    "_version": 1,
    "found": true,
    "_source":{
        "name": "igouc"
    }
}
```

除了found字段-（指明我们找到了一个ID为1的文档）和_source字段（返回我们前一步中索引的完整JSON文档）之外，没有什么特别之处。

### 3.6 删除一个文档

* 删除索引 `curl -XDELETE 'localhost:9200/test?pretty'`

```json
{
  "acknowledged" : true
}
```

* 删除类型 `curl -XDELETE 'localhost:9200/test/student?pretty'`

```json
{
  "acknowledged" : true
}
```

* 删除文档 `curl -XDELETE 'localhost:9200/test/student/1?pretty'`

```json
{
  "name": "igouc"
}
```

### 3.7 访问格式

仔细研究以上的命令，我们可以发现访问Elasticsearch中数据的一个模式。这个模式可以被总结为：

```
<REST Verb> <Node>:<Port>/<Index>/<Type>/<ID>
```

---

## 4 修改数据

Elasticsearch提供了近乎实时的数据操作和搜索功能。默认情况下，从你索引/更新/删除你的数据动作开始到它出现在你的搜索结果中，大概会有1秒钟的延迟。这和其它的SQL平台不同，它们的数据在一个事务完成之后就会立即可用。

### 4.1 索引／替换文档

```
curl -i -X PUT \
   -H "Content-Type:application/json" \
   -d \
'{
  "name":"igouc4"
}' \
 'http://localhost:9200/test/student/1?pretty'
```

```json
{
    "_index": "test",
    "_type": "student",
    "_id": "1",
    "_version": 2,
    "created": false
}
```

> 注意created == false

GET `localhost:9200/test/student/1`

```json
{
    "_index": "test",
    "_type": "student",
    "_id": "1",
    "_version": 2,
    "found": true,
    "_source":{
        "name": "igouc4"
    }
}
```

如果不指定最后的id，则会自动分配id，注意要用POST⚠️

```
curl -i -X POST \
   -H "Content-Type:application/json" \
   -d \
'{
  "name":"igouc5"
}' \
 'http://localhost:9200/test/student/?pretty'
```

```json
{
    "_index": "test",
    "_type": "student",
    "_id": "AVq-d-gpHptku1SmEgQL",
    "_version": 1,
    "created": true
}
```

> 此时的id是随机的

### 4.2 更新文档

```
curl -i -X POST \
   -H "Content-Type:application/json" \
   -d \
'{
  "doc":{"name":"igouc6"}
}' \
 'http://localhost:9200/test/student/1/_update?pretty'
```

```json
{
    "_index": "test",
    "_type": "student",
    "_id": "1",
    "_version": 4
}
```

GET `localhost:9200/test/student/1?pretty`

```json
{
    "_index": "test",
    "_type": "student",
    "_id": "1",
    "_version": 4,
    "found": true,
    "_source":{
       "name": "igouc6"
    }
}
```

> 更新文档，Elasticsearch先删除旧文档，然后再索引更新的新文档。且用POST

更新也可以通过使用简单的脚本来进行

```
curl -i -X POST \
   -H "Content-Type:application/json" \
   -d \
'{
  "script":"ctx._source.name += 2"
}' \
 'http://localhost:9200/test/student/1/_update?pretty'
```

```
{
    "_index": "test",
    "_type": "student",
    "_id": "1",
    "_version": 5
}
```

GET `localhost:9200/test/student/1?pretty`

```json
{
    "_index": "test",
    "_type": "student",
    "_id": "1",
    "_version": 5,
    "found": true,
    "_source":{
        "name": "igouc62"
    }
}
```

### 4.3 删除数据

删除文档是非常直观的

DELETE `localhost:9200/test/student/1?pretty`

```json
{
    "found": true,
    "_index": "test",
    "_type": "student",
    "_id": "1",
    "_version": 6
}
```

指定删除条件

```
curl -i -X DELETE \
   -H "Content-Type:application/json" \
   -d \
'{
  "query": { "match": { "name": "igouc2" } }
}' \
 'http://localhost:9200/test/student/_query?pretty'
```

```
{
    "_indices":{
        "test":{
            "_shards":{
                "total": 5,
                "successful": 5,
                "failed": 0
            }
        }
    }
}
```

### 4.4 批处理

下面两个仅仅是指令，没有响应

```
curl -XPOST 'localhost:9200/customer/external/_bulk?pretty' -d '
{"index":{"_id":"1"}}
{"name": "John Doe" }
{"index":{"_id":"2"}}
{"name": "Jane Doe" }
'
```

```
curl -XPOST 'localhost:9200/customer/external/_bulk?pretty' -d '
{"update":{"_id":"1"}}
{"doc": { "name": "John Doe becomes Jane Doe" } }
{"delete":{"_id":"2"}}
'
```

>bulk API按顺序执行这些动作。如果其中一个动作因为某些原因失败了，它将会继续处理后面的动作。当bulk API返回时，它将提供每个动作的状态（按照同样的顺序），所以你能够看到某个动作成功与否。⚠️


## 5 操作数据

我们有两种基本的搜索方式：

* REST请求 URI中发送请求参数
* REST请求 将请求参数放在请求体中

下面 我们仅仅使用一次 将请求参数放入URI中，其余都将参数放入请求体，以便美观

GET `localhost:9200/bank/_search?q=*$pretty`

```
{
  "took" : 9,
  "timed_out" : false,
  "_shards" : {
    "total" : 5,
    "successful" : 5,
    "failed" : 0
  },
  "hits" : {
    "total" : 1000,
    "max_score" : 1.0,
    "hits" : [ {
      "_index" : "bank",
      "_type" : "account",
      "_id" : "4",
      "_score" : 1.0,
      "_source":{"account_number":4,"balance":27658,"firstname":"Rodriquez","lastname":"Flores","age":31,"gender":"F","address":"986 Wyckoff Avenue","employer":"Tourmania","email":"rodriquezflores@tourmania.com","city":"Eastvale","state":"HI"}
    }, {
      "_index" : "bank",
      "_type" : "account",
      "_id" : "9",
      "_score" : 1.0,
      "_source":{"account_number":9,"balance":24776,"firstname":"Opal","lastname":"Meadows","age":39,"gender":"M","address":"963 Neptune Avenue","employer":"Cedward","email":"opalmeadows@cedward.com","city":"Olney","state":"OH"}
    }, {
      "_index" : "bank",
      "_type" : "account",
      "_id" : "11",
      "_score" : 1.0,
      "_source":{"account_number":11,"balance":20203,"firstname":"Jenkins","lastname":"Haney","age":20,"gender":"M","address":"740 Ferry Place","employer":"Qimonk","email":"jenkinshaney@qimonk.com","city":"Steinhatchee","state":"GA"}
    }, {
      "_index" : "bank",
      "_type" : "account",
      "_id" : "16",
      "_score" : 1.0,
      "_source":{"account_number":16,"balance":35883,"firstname":"Adrian","lastname":"Pitts","age":34,"gender":"F","address":"963 Fay Court","employer":"Combogene","email":"adrianpitts@combogene.com","city":"Remington","state":"SD"}
    },
  .
  .
  .
  .
}
```


我们看看这个请求的响应体

* took 这个查询所消耗的时间（ms）
* timed_out 是否超时
* _shards 指出了多少分片被搜索了，同时也指出了成功／失败的分片数量
* hits 搜索结果
* hits.total 匹配查询条件的文档的总数目
* hits.hits 真正的搜索结果数组（默认是前10个文档）
* _score 匹配度，得分越高，相关性越大
* 


如果我们是使用请求体的话，应该这样：

```
POST localhost:9200/bank/_search?pretty

body:
{
  "query":{"match_all":{}}
}
```

我们来分析下这个请求体

* query 高速我们定义请求体
* match_all 高速我们想要运行的查询类型

当然除了上面的参数，还可以指定返回的条数（默认10条）

```
POST localhost:9200/bank/_search?pretty

body:
{
  "query":{"match_all":{}},
  "from":10,
  "size":1
}

```

上面的这条表示从第10条查询1条

```
POST localhost:9200/bank/_search?pretty

body:
{
  "query":{"match_all":{}},
  "sort":{"account_number":{"order":"desc"}}
}
```

现在我们已经接触了一些简单的搜索语句，下面我们执行一些特殊的搜索

默认情况下，都是返回所有的字段，我们下面可以 用`_source`指定返回的字段

```
POST localhost:9200/bank/_search?pretty

body
{
  "query":{"match_all":{}},
  "_source":["account_number", "balance", "firstname"]
}
```

现在让我们进入到查询部分。之前，我们学习了match_all查询是怎样匹配到所有的文档的。现在我们介绍一种新的查询，叫做match查询，这可以看成是一个简单的字段搜索查询（比如对某个或某些特定字段的搜索）

下面这个例子返回账户编号为 20 的文档：

```
POST localhost:9200/bank/_search?pretty

body:
{
  "query":{"match":{"account_number":999}}
}
```

下面这个例子返回地址中包含词语(term)“mill”的所有账户：

```
curl -XPOST 'localhost:9200/bank/_search?pretty' -d '
{
  "query": { "match": { "address": "mill" } }
}'
```

下面这个例子返回地址中包含词语“mill” 或者“lane” 的账户：

```
curl -XPOST 'localhost:9200/bank/_search?pretty' -d '
{
  "query": { "match": { "address": "mill lane" } }
}'
```

下面这个例子是match的变体（match_phrase），它会去匹配短语“mill lane”：

```
curl -XPOST 'localhost:9200/bank/_search?pretty' -d '
{
  "query": { "match_phrase": { "address": "mill lane" } }
}'
```

现在，让我们介绍一下布尔查询。布尔查询允许我们利用布尔逻辑将较小的查询组合成较大的查询。

现在这个例子组合了两个match查询，这个组合查询返回包含“mill” 和“lane” 的所有的账户

```
curl -XPOST 'localhost:9200/bank/_search?pretty' -d '
{
  "query": {
    "bool": {
      "must": [
        { "match": { "address": "mill" } },
        { "match": { "address": "lane" } }
      ]
    }
  }
}'
```

在上面的例子中，bool must语句指明了，对于一个文档，所有的查询都必须为真，这个文档才能够匹配成功。

相反的， 下面的例子组合了两个match查询，它返回的是地址中包含“mill” 或者“lane”的所有的账户:

```
curl -XPOST 'localhost:9200/bank/_search?pretty' -d '
{
  "query": {
    "bool": {
      "should": [
        { "match": { "address": "mill" } },
        { "match": { "address": "lane" } }
      ]
    }
  }
}'
```

在上面的例子中bool should语句指明，对于一个文档，查询列表中，只要有一个查询匹配，那么这个文档就被看成是匹配的。

现在这个例子组合了两个查询，它返回地址中既不包含“mill”，同时也不包含“lane”的所有的账户信息：

```
curl -XPOST 'localhost:9200/bank/_search?pretty' -d '
{
  "query": {
    "bool": {
      "must_not": [
        { "match": { "address": "mill" } },
        { "match": { "address": "lane" } }
      ]
    }
  }
}'
```

在上面的例子中，bool must_not语句指明，对于一个文档，查询列表中的的所有查询都必须都不为真，这个文档才被认为是匹配的。

我们可以在一个bool查询里一起使用must、should、must_not。 此外，我们可以将bool查询放到这样的bool语句中来模拟复杂的、多层级的布尔逻辑。

下面这个例子返回40岁以上并且不生活在ID（aho）的人的账户：

```
curl -XPOST 'localhost:9200/bank/_search?pretty' -d '
{
  "query": {
    "bool": {
      "must": [
        { "match": { "age": "40" } }
      ],
      "must_not": [
        { "match": { "state": "ID" } }
      ]
    }
  }
}'

```

Elasticsearch中的所有的查询都会触发相关度得分的计算。对于那些我们不需要相关度得分的场景下，Elasticsearch以过滤器的形式提供了另一种查询功能。过滤器在概念上类似于查询，但是它们有非常快的执行速度，这种快的执行速度主要有以下两个原因：

* 过滤器不会计算相关度的得分，所以它们在计算上更快一些
* 过滤器可以被缓存到内存中，这使得在重复的搜索查询上，其要比相应的查询快出许多。

为了理解过滤器，我们先来介绍“被过滤” 的查询，这使得你可以将一个查询（如match_all,match，bool等）和一个过滤器结合起来。作为一个例子，我们介绍一下范围过滤器，它允许我们通过一个区间的值来过滤文档。这通常被用在数字和日期的过滤上。

这个例子使用一个被过滤的查询，其返回值是存款在20000到30000之间（闭区间)的所有账户。换句话说，我们想要找到存款大于等于20000并且小于等于30000的账户。

```
curl -XPOST 'localhost:9200/bank/_search?pretty' -d '
{
  "query": {
    "filtered": {
      "query": { "match_all": {} },
      "filter": {
        "range": {
          "balance": {
            "gte": 20000,
            "lte": 30000
          }
        }
      }
    }
  }
}'
```

分析上面的例子，被过滤的查询包含一个match_all查询（查询部分）和一个过滤器（filter部分）。我们可以在查询部分中放入其他查询，在filter部分放入其它过滤器。 在上面的应用场景中，由于所有的在这个范围之内的文档都是平等的（或者说相关度都是一样的）， 没有一个文档比另一个文档更相关，所以这个时候使用范围过滤器就非常合适了

通常情况下，要决定是使用过滤器还是使用查询，你就需要问自己是否需要相关度得分。如果相关度是不重要的，使用过滤器，否则使用查询。如果你有SQL背景，查询和过滤器 在概念上类似于SELECT WHERE语句，一般情况下过滤器比查询用得更多。

除了match_all, match, bool,filtered和range查询，还有很多其它类型的查询/过滤器，我们这里不会涉及。由于我们已经对它们的工作原理有了基本的理解，将其应用到其它类型的查询、过滤器上也不是件难事。

我们可以在es上做聚合操作：

聚合提供了分组并统计数据的能力。理解聚合的最简单的方式是将其粗略地等同为SQL的GROUP BY和SQL聚合函数。在Elasticsearch中，你可以在一个响应中同时返回命中的数据和聚合结果。你可以使用简单的API同时运行查询和多个聚合并一次返回，这避免了来回的网络通信，是非常强大和高效的。

作为开始的一个例子，我们按照state分组，并按照州名的计数倒序排序：

```
curl -XPOST 'localhost:9200/bank/_search?pretty' -d '
{
  "size": 0,
  "aggs": {
    "group_by_state": {
      "terms": {
        "field": "state"
      }
    }
  }
}'
```

注意我们将size设置成 0，这样我们就可以只看到聚合结果了，而不会显示命中的结果。

在先前聚合的基础上，现在这个例子计算了每个州的账户的平均存款（还是按照账户数量倒序排序的前10个州）：

```
curl -XPOST 'localhost:9200/bank/_search?pretty' -d '
{
  "size": 0,
  "aggs": {
    "group_by_state": {
      "terms": {
        "field": "state"
      },
      "aggs": {
        "average_balance": {
          "avg": {
            "field": "balance"
          }
        }
      }
    }
  }
}'
```

注意， 我们把average_balance聚合嵌套在了group_by_state聚合之中。这是所有聚合的一个常用模式。你可以在任意的聚合之中嵌套聚合，这样就可以从你的数据中抽取出想要的结果。

在前面的聚合的基础上，现在让我们按照平均余额进行排序：

```
curl -XPOST 'localhost:9200/bank/_search?pretty' -d '
{
  "size": 0,
  "aggs": {
    "group_by_state": {
      "terms": {
        "field": "state",
        "order": {
          "average_balance": "desc"
        }
      },
      "aggs": {
        "average_balance": {
          "avg": {
            "field": "balance"
          }
        }
      }
    }
  }
}'
```


##s 6 搜索API

搜索API允许开发者执行搜索查询，返回匹配的搜索结果。这样既可以通过查询字符串，也可以通过查询实体实现。

### 6.1 多索引类型

所有的搜索API都可以跨多个类型使用，也可以通过多索引语法跨索引使用，例如，我们可以搜索twitter索引的跨类型的所有的文档。

`GET http://localhost:9200/twittper/_search?q=user:ki`

我们也可以带上特定搜索的type：

`GET htto://localhost:9200/twittper/type1,type2/_search?q=user:ki`

我们也可以夸index搜索

`GET http://localhost:9200/type1,type2/twitter/_search?q=user:ki`

我们可以用`_all`来充当所有的占位符

`GET http://localhost:9200/_all/twitter/_search?q=user:ki`

或者省略`_all`

`GET http://localhost:9200/twitter/_search?q=user:ki`

### 6.2 URL搜索

一个搜索可以用uri来执行，用这种方法进行搜索，并不是所有的选项都是暴露出来的，下面我们记录这些参数

|Name|Description|
|:---|:----------|
|q|表示查询|
|df|在查询中，当没有定义字段的前缀的情况下的默认字段前缀|
|analyzer|当分析查询字符串时，分析器的名字|
|explain|对于命中，会得到一个命中解释|
|_source|将其设置为false，查询就会放弃检索_source字段。你也可以通过设置_source_include和_source_exclude检索部分文档|
|fields|  命中的文档返回的字段|
|sort|排序执行。可以以fieldName、fieldName:asc或者fieldName:desc的格式设置。fieldName既可以是存在的字段，也可以是_score字段。可以有多个sort参数|
|track_scores|当排序的时候，将其设置为true，可以返回相关度得分|
|timeout|默认没有timeout|
|from|默认0|
|size|默认10|
|search_type|搜索操作执行的类型，有dfs_query_then_fetch, dfs_query_and_fetch, query_then_fetch, query_and_fetch, count, scan几种，默认是query_then_fetch|
|lowercase_expanded_terms|terms是否自动小写，默认是true|
|analyze_wildcard|  是否分配通配符和前缀查询，默认是false|

### 6.3 请求体搜索

有搜索DSL的搜索请求可以被执行

#### 6.3.1 查询

精准匹配

```json
{
  "query":{
    "term":{
      "shop_name":"测试"
    }
  }
}
```

模糊匹配(表达式匹配)

```json
{
  "query":{
    "match":{
      "shop_name":"测试"
    }
  }
}
```

#### 6.3.2 from／size

```json
{
  "query":{
    "term":{
      "shop_name":"test"
    }
  },
  "from":0,
  "size":100
}
```

#### 6.3.3 排序

```json
{
  "query":{
    "term":{
      "shop_name":"test"
    }
  },
  "sort":[{"age":"asc"},{"_score":"desc"}]
}
```

#### 6.3.4 排序值

es支持通过数组数组或者多值字段排序
mode选项控制 用多值字段的什么值来排序

* min 最小值
* max 最大值
* sum 和 （仅用数值）
* avg 平均值（仅用数值）

```json
{
  "query":{
    "term":{
      "shop_name":"test"
    }
  },
  "sort":[
    {"price":{"order":"desc", "mode":"avg"}}
  ]
}
```


#### 6.3.5 缺失字段的处理方式

`missing` 参数指缺失字段的处理方式:"missing":"_last"/"missing":"true"

```json
{
    "sort" : [
        { "price" : {"missing" : "_last"} },
    ],
    "query" : {
        "term" : { "user" : "kimchy" }
    }
}
```

#### 6.3.6 地理位置排序

通过_geo_distance排序。

```json
{
    "sort" : [
        {
            "_geo_distance" : {
                "pin.location" : [-70, 40],
                "order" : "asc",
                "unit" : "km",
                "mode" : "min",
                "distance_type" : "sloppy_arc"
            }
        }
    ],
    "query" : {
        "term" : { "user" : "kimchy" }
    }
}
```

* distance_type：怎样计算距离可以有sloppy_arc(默认),arc（更精确但是显著变慢）,plane(最快)

地理距离排序支持的排序mode有max，min和avg。

### 6.4 source过滤

用于控制_source字段的返回。默认情况下，操作返回_source字段的内容，除非你用到了fields参数，或者_source被禁用了。你能够通过_source参数关掉_source检索。

```json
{
    "_source": false,
    "query" : {
        "term" : { "user" : "kimchy" }
    }
}
```

_source也接受一个或者多个通配符模式控制返回值。

```json
{
  "_source":"obj.*",
  "query" : {
    "term" : { "user" : "kimchy" }
  }
}
```

or

```json
{
    "_source": [ "obj1.*", "obj2.*" ],
    "query" : {
        "term" : { "user" : "kimchy" }
    }
}
```


_source里面也可以有include/exclude

```json
{
  "query":{
    "term":{"shop_name":"test"}
  },
  "_source":{
    "include":["object.*", "a.*"],
    "exclude":["object1.*"]
  }
}
```

### 6.5 字段

es允许选择性地加载文档特定的存储字段。

```json
{
    "fields" : ["user", "postDate"],
    "query" : {
        "term" : { "user" : "kimchy" }
    }
}
```

如果fields数组为空，那么就只会返回_id和_type字段。

### 6.6 分数

```json
{
    "min_score": 0.5,
    "query" : {
        "term" : { "user" : "kimchy" }
    }
}
```

返回的文档的得分小于min_score。

## 7 java API

ES可以在多个地方用到 java client

* 在集群中执行标准的index, delete, get, search
* 在集群中执行管理任务
* 当你要运行嵌套在你的应用程序中的Elasticsearch的时候或者当你要运行单元测试或者集合测试的时候，启动所有节点

获得一个Client是非常容易的，最通用的步骤如下所示：

* 创建一个嵌套的节点，充当集群的一个节点
* 从这个嵌套的节点请求一个Client

另外一种方式是创建一个TransportClient来连接集群。

重要提示： 客户端和集群端推荐使用相同的版本，如果版本不同，可能会出现一些不兼容的问题。


> 博客迁移自 [GC-CSDN](http://blog.csdn.net/GC_chao/article/details/61523751)

