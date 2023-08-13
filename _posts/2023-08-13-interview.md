---
layout: post
title: "八股文（持续更新中）"
description: "八股文（持续更新中）"
categories: [面试]
tags: [总结]
---

* Kramdown table of contents
{:toc .toc}


# 八股文整理

## 1 编程语言
### 1.1 Java

* 引用类型
  * 强引用（正常GC）
  * 软引用（内存不够的时候强制GC）
  * 弱引用（每次都强制GC）
  * 虚引用（正常引用不到）

* 多线程相关
  * volatile（保证内存可见性，保证操作原子性，禁止指令重排序）
  * CAS（java native 方法）
  * synchronize（对象头monitor属性，可重入）
  * Lock（volatile states + AQS双端队列，state记录资源是否被锁住，aqs记录等待的线程）

* IO模型
  * BIO（等着完成）
  * NIO（定期询问）
  * AIO（被通知）

* 内存模型
  * 程序计数器（记录当前代码执行到了哪一行）
  * 堆（分配的对象的地方）
  * 方法区（常量池，静态变量等）
  * 虚拟机栈（方法调用栈）
  * 本地方法栈（本地方法调用栈）

* 垃圾回收
  * 识别对象可回收算法
    * 引用计数（会出现循环引用的问题）
    * 根指针
  * 垃圾回收算法
    * 标记清除算法
    * 标记压缩算法
    * 复制算法
  * 分代回收
    * 新生带（复制算法）
    * 老年代（CMS：标记清除/标记压缩）

* 实现原理
  * HashMap（默认capacity=16, 负载因子0.75, 数组：hash值映射 + 链表：冲突之后。当链表长度 >8 之后，转换成 红黑树）

## 2 存储

### 2.1 Mysql

* 范式
  * 第一范式：列不可再拆分
  * 第二范式：根据主键，能找到非主键
  * 第三范式：不能根据非主键，找到主键

* ACID
  * 原子性（要么都做，要么都不做）
  * 一致性（事务提交的数据，可以查得到）
  * 隔离性（事务与事务之间是有隔离的）
  * 持久性（事务提交之后，就算机器宕机也没事）
  
* 隔离级别
  * 读未提交（问题：脏读，不可重复读，幻读）
  * 读已提交（问题：不可重复读，幻读）
  * 可重复读（问题：幻读）
  * 串行
  
* 日志
  - binlog
    + 在Server层面实现，跟存储引擎没关系
    + 分成逻辑日志（记录写操作的SQL）和物理日志（记录数据页的变化）两种
    + 只有已经提交的事务才会有binlog
    + 应用场景包括：主从复制、数据恢复
    + 日志格式包括：
      * SBR：基于SQL的复制，缺点是有些数据字段变更不是SQL上明确的，一些内置函数，SBR是记录不到的。
      * RBR：基于行的复制，缺点是当做DDL或者批量操作的时候日志量过多。
      * MIXED：一般使用SBR，当遇到SBR记录不了的地方，切换成RBR。
    + 日志的刷盘时机：
      * 0 系统自动判断
      * 1 每次事务提交都会刷盘
      * n 提交n次事务之后刷盘
  - redo log
    + 目的是避免每次DB操作都写随机读写数据页导致效率低下
    + 用了redolog之后，每次操作DB都先顺序写redolog 和 undolog，写完之后默认事务提交成功
    + 写redolog和undolog也会有logbuffer和logfile，可以开启写完logbuffer就flush到logfile，也可以定时（每秒）写logbuffer到logfile
  - undo log
    + 记录数据的逻辑变化，每次dml都会记录一条反向dml

* MVVC
  - innodb独有
  - 工作在 读已提交 和 可重复读 两种隔离级别上
  - 每次写事务提交，都会有一个 trx_id 作为自增唯一编号
  - 每次写事务提交，都会有把这一行改变之前的那一行数据的delete字段设置为1，并且再用新的事务id创建一条新纪录
  - 读已提交：每次读数据的时候，都会有个ReadView。
  - 可重复读：事务开启的第一个读，会生成一个ReadView。
  - ReadView只能看到 trx_id <= 自己的编号
  - MVVC的好处就是可以在不加锁的情况下实现事务隔离级别
  
* 索引
  - 索引结构
    + BTree（节点都带数据）
    + B+Tree（只有叶子结点带数据、叶子结点增加双向指针，mysql一个数据页 16k，一个非叶子索引节点16byte）
  - 索引分类
    + 聚簇索引（找到了索引就找到了数据，主键）
    + 辅助索引（找到索引之后，还要找到聚簇索引，才可以找到数据）
    + 联合索引（多个列组成的索引就是联合索引，联合索引是非聚簇索引）
    + 覆盖索引（这个不是索引结构，是查询优化上的名词）

### 2.2 Redis

* 数据结构和实现
  - String：动态字符串（SBS）、字符串安全、最大512M。
  - Hash：压缩链表+字典
  - Set：字典
  - List：双端链表+压缩链表、最多2^31-1个元素
  - ZSet: 512元素以下用ZList，512元素以上用字典+跳表
  - geo
  - bitmap：最大值2^32
  - hyerloglog: 每个key固定12kb, 可统计2^64次方次数，可以做基数统计。

* 数据持久化方案
  - AOF：写过程
  - RDB：写快照
  
* 数据过期策略
  - 定时过期：对每个key都设置一个定时器，消耗CPU。
  - 惰性过期：只有查的时候发现过期才清除，消耗内存。
  - 定期过期：做一个任务，统一定期来单独清除过期的数据，会脏读。
  - 混合版本：定期过期+惰性过期。

* 数据淘汰策略
  - volitile-lru: 过期的数据里面LRU
  - allkey-lru: 所有的key LRU
  - volitile-lfu: 过期的数据里面 LFU
  - allkey-lfu: 所有key LFU
  - volitile-random: 过期的数据里面随机
  - allkey-random: 所有key 随机
  - volitile-ttl: 过期的数据里面，ttl越早的越先淘汰
  - novication: 直接拒绝
  
* 高可用方案
  - 单节点高可用
    + 主从复制（RDB+AOF）
    + 哨兵模式，故障转移
  - 分布式扩容
    + 简单Hash算法（对机器数量hash）
    + 一致性Hash算法（对一个固定的数据hash，数据和主机都会通过hash算法映射到环上。）
    + Slot算法（固定16383个槽，各节点开始分配）

* 缓存使用
  - 缓存击穿（单个key过期，预热解决）
  - 缓存穿透（DB中无数据的key仍然打到DB，设置无效key）
  - 缓存雪崩（ttl随机）
  - 热key（二级缓存）
  
### 2.3 HBase

* 数据模型
  - 命名空间
  - 表名
  - 行
  - 列族
  - 列
  - 单元格

* 架构
  - 底层是HDFS，所以不用关心数据状态层的扩展。
  - HMaster，最上层，不处理读写请求，监控HRegionServer的故障，并将HRegion进行迁移，新HRegion的分配，元数据变更等都在HMaster上进行
  - HRegionServer: 承接HBase 的读写操作，用于存储HRegion，HRegionServer上有一块 BlockCache 用户读缓存
  - HRegion, HBase最小模块，正常一个表会根据rowkey不同的分片规则，分配到不同的HRegion上，HRegion在不同的HRegionServer上有副本和主数据
    + HRegionServer 写数据的时候，只要HLog和HRegion的Memstore写成功，就算成功
    + Memstore 定期/或者存储数据过大, 会将数据刷入StoreFile -> HFile
  - StoreFile 里面有 数据段 和 索引段等，以HFile的形式写在HDFS上。

* 关键操作步骤
  - 写操作
    + 1.写HLog
    + 2.写MemStore
  - 读操作
    + 1.读HRegionServer的BlockCache
    + 2.读HRegio的MemStore和StoreFile
  - Compaction
    + minor 小压缩，只压缩几个小的HFile
    + mijor 大压缩，压缩整个 ColumeFamily 的HFile
  - Split
    + 一个Region默认大小1G, 如果Region太大的话，会split成多个Region

* 高可用
  - 数据高可用: HDFS
  - 服务高可用: WAL + HRegionServer（HRegionServer启动的时候，Region不能用）
  
### 2.4 Zookeeper

* 四种类型的ZNode
  - 持久化目录节点
  - 持久化顺序编号目录节点
  - 临时目录节点
  - 临时顺序编号目录节点

* 保证ACID 
  - 顺序一致性
  - 持久性
  - 原子性
  - 统一视图
  - 实时性

* 集群架构
  - Leader（负责读写）
  - Follower（负责读 + 参与选举）
  - Observer（负责读）

* Leader选举
  - logicClock: 选举轮次
  - state: 状态
  - self_zxid: 自己最大的事务id
  - vote_zxid: 被推举的服务器上保存最大的事务id
  - 选举过程
    + 1.投票给自己
    + 2.向外宣告
    + 3.如果别人的轮次大于自己的轮次，则选别人
    + 4.如果别人的事务id大于自己的事务id，则选别人
    + 5.如果别人的id号大于自己的id号，则选别人
    + 6.统计选票，更改机器状态。

* 核心模式
  - 消息广播模式
    + 类似于两阶段提交，先proposal，再commit
    + 在proposal的时候，只要一半以上的follower ack，就算proposal成功，就开始commit
  - 崩溃恢复模式
    + 保证1: 所有leader commit的事务，follower都必须执行成功。
    + 保证2: 所有leader 没有commit的事务，都丢弃。

* 功能实现
  - 分布式锁
    + 1.在一个目录下创建顺序临时节点。
    + 2.获取这个目录下所有的节点。
    + 3.判断创建的临时节点里面最小的那一个是不是自己创建的。
    + 4.如果是自己创建的，算获取锁成功。
    + 5.如果不是自己创建的，拿到比自己小1的那个节点，作为前驱节点。
    + 6.监听先驱节点是不被干掉了，如果被干掉了，唤醒自己的线程，去尝试获取锁。
  
### 2.5 MQ

* 一些常用的MQ
  - RabbitMQ
  - RocketMQ
  - Kafka
  
* RabbitMQ 组件
  - Producer
  - Consumer
  - Exchange

* Exchange 类型
  - 默认交换机
  - 直连交换机
  - 扇形交换机
  - 主题交换机
  - 头交换机
  
* RabbitMQ 怎么实现事务
  - 生产者
    + confirm机制
      * 开启confirm通道
      * 发送消息
      * 等待exchange的ack（分成轮训、回调两种）
    + select机制
      * txSelect 开启事务
      * 发消息
      * txCommit 提交事务
      * txRollback 回滚事务
      * 原理是rpc通道占有
  - 消费者
    + ack 机制
    
* RabbitMQ 怎么实现延迟队列
  - 1.消息设置TTL
  - 2.不设置消息Consumer
  - 3.消息到达ttl之后转发到死信队列
  - 4.在死信队列设置监听者

* RocketMQ 怎么实现事务
  - 1.发送业务消息（hafl message）
  - 2.执行业务逻辑
  - 3.发送确认消息（commit message）
  - 4.对长时间没有commit的消息执行回调。

### 2.5 ES

* 集群架构
  - master node
    + 有主备
    + 选举 使用node id 字典序列的第一个
  - data node
  - coordinating node

* 操作过程
  - 写操作
    + 1.协调节点找到data node
    + 2.数据写 mem buffer 和 wal
    + 3.定时将 mem buffer 刷入 os file cache
    + 4.定期flush
  - 更新和删除
    + 1.更新和删除都会转换成创建
    + 2.创建新版本数据，老版本设置为del
  - 查询
    + 1.分成query和fetch两部分
    + 2.query: 先协调节点将每个datanode发送query，拿到每个分片的data id和分数
    + 3.fetch: 找到合适的data id，批量查询data node，查询对应的数据
    
## 3 网络

### 3.1 分布式

* 理论
  - CAP
    + C 数据一致性
    + A 可用性
    + P 分区容错性
  - BASE
    + BA 基本可用 
    + S 软状态
    + E 最终一致性

* 算法
  - Paxos
  - Raft
  - 2PC
  - 3PC

* 2PC流程
  - 阶段1: prepare 数据给 所有slave，所有slave 返回yes/no，如果返回no，则第二阶段发出rollback命令，如果 slave 返回no，则不用等master，直接rollback；如果 slave 返回yes，则等待master 的commit，如果长时间没有来，则先询问周边节点，再询问master；如果 master 迟迟没接到 slave的相应，超时rollback
  - 阶段2: commit 命令给 所有slave，所有slave返回success commit，没有的话 rollback了。

* 3PC 流程
  - 阶段1 canCommit
  - 阶段2 preCommit
  - 阶段3 commit

### 3.2 基本知识

* 网络分层
  - 七层（物-数-网-传-会-表-应）
  - 五层（物-数-网-传-应）

* 五层详解
  - 物理层
    + 编码
      * 数字信号到数字信号
        - 非归零编码
        - 归零编码
        - 反向非归零编码
        - 曼彻斯特编码
        - 差分曼彻斯特编码
        - 4B/5B编码
      * 模拟信号到数字信号
        - PCM
    + 调制
      * 数字信号到模拟信号
    + 传输介质
  - 数据链路层
    + 功能
      * 封装成桢
      * 差错控制
      * 流量控制
      * 滑动窗口
        - GBN
        - 选择重传
        - 停止等待
      * 可靠传输
      * 超时重传
    + 通信链路
      * 点对点（PPP）
      * 广播
        - 介质访问控制
          + 静态划分信道
          + 动态划分信道
  - 网络层
    + 路由选择
    + 存储转发
    + 协议
      * IP
      * ARP
      * ICMP
  - 传输层
    + 协议
    + TCP
      * 面向有链接
      * 链接（三次握手）
      * 断开链接（四次挥手）
      * 流量控制实现：接受端在TCP头部返回能接受的最大数据窗口长度
      * 拥塞控制实现：发送窗口个逐渐增大，最终和流量控制中的最大窗口取min
      * 数据粘包：长链接一直在发送数据，数据会被切段/合并，本身TCP数据包中没有总长度字段，只有当前包长度，可以在包的末尾加上特殊字符进行分割，或者报文头部增加包长度字段
    + UDP
      * 面向无连接
  - 应用层
    + 协议实现
      * FTP
      * HTTP
      * SSH
      * DNS
      * SNMP
      * TFTP

* 重点协议
  - HTTPS
    + http + ssl
    + 中介机构（CA）办法证书，CA机构是值得信任的：公钥安装在操作系统中，client 用 证书公钥加密，server 用 私钥解密
  - DNS
    1.  问浏览器缓存
    2. 问本地host配置
    3. 问本地DNS服务器
    4. 问根DNS服务器
    5. 问顶级DNS服务器
    6. 问NameServer服务器

## 4 操作系统

> TODO

## 5 程序设计


### 5.1 设计模式

* 创建相关
  - 工厂方法
  - 抽象工厂
  - 单例
  - 建造者
  - 原型

* 结构相关
  - 适配器
  - 装饰器
  - 代理
  - 外观
  - 桥接
  - 组合
  - 享元

* 行为相关
  - 策略
  - 模版方法
  - 观察者
  - 迭代子
  - 责任链
  - 命令
  - 备忘录
  - 状态
  - 访问者
  - 中介者
  - 解释器

* 设计原则 SOLID
  - 开闭原则
  - 单一指责原则
  - 里氏代换原则
  - 依赖倒转原则
  - 接口隔离原则
  - 最少知道原则
  - 合成复用原则

