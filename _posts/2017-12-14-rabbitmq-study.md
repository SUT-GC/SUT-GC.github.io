---
layout: post
title: "RabbitMQ学习"
description: "一切都不是困难，只要有充足的执行力！"
categories: [学习]
tags: [RabbitMQ]
---

* Kramdown table of contents
{:toc .toc}

# AMQP    

## AMQP

高级消息协议， 消息代理 FROM 消息生产者 GET 消息 GIVE TO 消息消费者 BY 路由规则    

## AMQP 0-9-1

AMQP 0-9-1 工作流程：消息生产者将消息发给交换机，交换机再根据路由规则，将消息发给消息消费者。    

* 发布者 可以在消息上指定各种消息属性，有些属性可以被消息代理使用， 有些则会透传给消息消费者。     

* AMQP 模型为了尽可能保证消息到达，具有ACK机制，当消息发给消费者之后，等待消费者发出ACK动作表明消息接收到，这个可以是自动的也可以由处理消息的应用的开发者执行。当“消息确认”被启用的时候，消息代理不会完全将消息从队列中删除，直到它收到来自消费者的确认回执。    

* 队列，交换机和绑定统称为AMQP实体    

* AMQP 是一个可编程的协议， 某种意义上说AMQP的实体和路由规则是由应用本身定义的，而不是由消息代理定义。包括像声明队列和交换机，定义他们之间的绑定，订阅队列等等关于协议本身的操作。    

## 交换机

交换机是用来发消息的AMQP的实体，交换机拿到一个消息之后会把消息发给 >= 0 个队列，至于使用哪种路由算法，则由交换机类型和被绑定的规则决定，下面是四种交换机：    

* 直连交换机（DIRCET） `'' or 'amq.direct'`    
* 扇形交换机（FOUNT） `amq.fanout`     
* 主题交换机（TOPIC） `amq.topic`     
* 头交换机  （HEADER）`amq.match`     

除了交换机类型之外，声明交换机的时候还可以指定一些属性:    
* Name
* Durablity
* Auto-delete
* Argument

交换机可以有两个状态：持久（durable）、暂存（transient）。持久化的交换机会在消息代理（broker）重启后依旧存在，而暂存的交换机则不会（它们需要在代理再次上线后重新被声明）。然而并不是所有的应用场景都需要持久化的交换机。     

## 默认交换机    

默认交换机是消息代理默认生成的一个没有名字的直连交换机，它有一个特殊的属性使得它对于简单应用特别有用处：那就是每个新建队列（queue）都会自动绑定到默认交换机上，绑定的路由键（routing key）名称与队列名称相同。     

🌰 当你声明了一个名为"search-indexing-online"的队列，AMQP代理会自动将其绑定到默认交换机上，绑定（binding）的路由键名称也是为"search-indexing-online"。因此，当携带着名为"search-indexing-online"的路由键的消息被发送到默认交换机的时候，此消息会被默认交换机路由至名为"search-indexing-online"的队列中。换句话说，默认交换机看起来貌似能够直接将消息投递给队列，尽管技术上并没有做相关的操作。    

### Demo

**消息接受者**    

```python
import pika
import time

credentials = pika.PlainCredentials('guest', 'guest')
connection = pika.BlockingConnection(pika.ConnectionParameters(host='localhost', port=5672,  credentials=credentials))
channel = connection.channel()


# 生命Q
queue_result = channel.queue_declare(queue='demo_default_q')
queue = queue_result.method.queue

def callback(ch, method, properties, body):
    time.sleep(1)
    print method
    print properties
    print body


# 接受消息, 指定接受的队列
channel.basic_consume(callback,
                      queue=queue,
                     )


print 'start consuming'

channel.start_consuming()
```

**消息发送者**     

```python
#!/usr/bin/env python
import pika
import time

# 链接rabbitmq
credentials = pika.PlainCredentials('guest', 'guest')
connection = pika.BlockingConnection(pika.ConnectionParameters(host='localhost', port=5672,  credentials=credentials))
channel = connection.channel()

body = "hello world"


# exchange = '' 表示使用默认交换机，往默认交换机上发消息，并且带着routingkey
channel.basic_publish(exchange='',
                      routing_key='demo_default_q',
                      body=body)

print 'send success, body :%s' % body

connection.close()
```


## 直连交换机    

直连交换机是根据消息携带的路由键将消息发给同名的队列，直连交换机是处理单播路由的    

* 将一个队列绑定到一个交换机上，并赋予该绑定一个与队列名字同样的路由键    

* 当带着R路由键的消息发给直连交换机之后，交换机会将这个消息路由给同样为R的队列    

>直连交换机经常用来循环分发任务给多个工作者（workers）。当这样做的时候，我们需要明白一点，在AMQP 0-9-1中，消息的负载均衡是发生在消费者（consumer）之间的，而不是队列（queue）之间。

### demo

**消息接受者**

```python
import pika
import time

credentials = pika.PlainCredentials('guest', 'guest')
connection = pika.BlockingConnection(pika.ConnectionParameters(host='localhost', port=5672,  credentials=credentials))
channel = connection.channel()

# 声明一个直连交换机E
channel.exchange_declare(exchange='demo_exchange_direct', exchange_type='direct')
# 声明一个Q
channel.queue_declare(queue='demo_direct_q')

def callback(ch, method, properties, body):
    time.sleep(1)
    print body

# 将E和Q绑定
channel.queue_bind(exchange='demo_exchange_direct', queue='demo_direct_q')

# 这个Q接受消息，不带routingkey，因为直连交换机会将Q和key同名
channel.basic_consume(callback,
                      queue='demo_direct_q',
                     )


print 'start consuming'

channel.start_consuming()
```

**消息发送者**

```python
#!/usr/bin/env python
import pika
import time

credentials = pika.PlainCredentials('guest', 'guest')
connection = pika.BlockingConnection(pika.ConnectionParameters(host='localhost', port=5672,  credentials=credentials))
channel = connection.channel()

# 声明一个直连交换机E
channel.exchange_declare(exchange='demo_exchange_direct', exchange_type='direct')

# 由于往直连交换机带rutingkey发送消息，会被自动转发给 与该E绑定的且与routingkey同名的Q
body = "hello world"
channel.basic_publish(
                      exchange='demo_exchange_direct',
                      routing_key='demo_direct_q',
                      body=body)

print 'send success, body :%s' % body

connection.close()
```

> AMQP的Q和E和绑定调理很清晰的， 我大致梳理一下思路:      
> 1. 消息发送者        
> 1.1 声明一个交换机E     
> 1.2 向这个交换机发送带routingkey的消息     
> 
> 2 消息接受者       
> 2.1 声明一个交换机E    
> 2.2 声明一个队列Q    
> 2.3 将这个Q和E绑定 (如果不显式绑定一个Q和E, 则Q默认绑定到默认交换机)    
> 2.4 接受Q过来的消息（可以带routingkey, 也可以不带)        
> 
> ⚠️ 当不显示声明一个交换机E的时候，可以使用rabbitMQ默认提供的几个交换机，当不显式将Q和E绑定起来的话，则会默认将Q绑定到明为`''`的E上     

![rabbitMQ]({{site.paths.image}}/rabbitMQ.png)    

## 扇行交换机    

扇形交换机 将消息发送到绑定该交换机上的所有队列，而不在意路由键，当消息发给队列的时候，会copy消息发给所有队列。    



🌰消息队列，交换机，绑定关系    

```
my-exchange ---my-routing-key1--- my-queue1    
            +--my-routing-key2--- my-queue2    
            +--my-routing1-key1-- my-queue3    
```

给 my-exchange, my-routing-key\* 发消息，my-queue1 和 my-queue2 会收到，my-quque3 收不到    

### demo

**消息接受者**

```python
import pika
import time

credentials = pika.PlainCredentials('guest', 'guest')
connection = pika.BlockingConnection(pika.ConnectionParameters(host='localhost', port=5672,  credentials=credentials))
channel = connection.channel()

exchange_result = channel.exchange_declare(exchange='demo_exchange_fanout', exchange_type='fanout')
queue_result = channel.queue_declare(queue='demo_fanout_q')

print exchange_result
print exchange_result.method

queue = queue_result.method.queue

def callback(ch, method, properties, body):
    time.sleep(1)
    print body


channel.queue_bind(exchange='demo_exchange_fanout', queue='demo_fanout_q')

channel.basic_consume(callback,
                      queue='demo_fanout_q',
                     )


print 'start consuming'

channel.start_consuming()
```

**消息发送者**

```python
#!/usr/bin/env python
import pika
import time

credentials = pika.PlainCredentials('guest', 'guest')
connection = pika.BlockingConnection(pika.ConnectionParameters(host='localhost', port=5672,  credentials=credentials))
channel = connection.channel()

channel.exchange_declare(exchange='demo_exchange_fanout', exchange_type='fanout')


body = "hello world"

channel.basic_publish(
                      exchange='demo_exchange_fanout',
                      routing_key='',
                      body=body)

print 'send success, body :%s' % body

connection.close()

```

> ⚠️ 可以把接受者启动多个不同名的队列，这样发送者发送消息，将会全部送达给绑定该E的消息接受者，而不关心routingkey     

## 主题交换机    

主题交换机 将带着路由键的消息发给 交换机和队列且路由键匹配的绑定上     

### demo 


**消息接受者**

```python
import pika
import time

credentials = pika.PlainCredentials('guest', 'guest')
connection = pika.BlockingConnection(pika.ConnectionParameters(host='localhost', port=5672,  credentials=credentials))
channel = connection.channel()

exchange_result = channel.exchange_declare(exchange='demo_exchange_topic', exchange_type='topic')
queue_result = channel.queue_declare(queue='demo_topic_q')

def callback(ch, method, properties, body):
    time.sleep(1)
    print body


channel.queue_bind(exchange='demo_exchange_topic', queue='demo_topic_q', routing_key='demo.*')

channel.basic_consume(callback,
                      queue='demo_topic_q',
                      no_ack=True
                     )


print 'start consuming'

channel.start_consuming()

```

**消息发送者**

```python
#!/usr/bin/env python
import pika
import time

credentials = pika.PlainCredentials('guest', 'guest')
connection = pika.BlockingConnection(pika.ConnectionParameters(host='localhost', port=5672,  credentials=credentials))
channel = connection.channel()

channel.exchange_declare(exchange='demo_exchange_topic', exchange_type='topic')


body = "hello world"

channel.basic_publish(
                      exchange='demo_exchange_topic',
                      routing_key='demo.topic',
                      body=body)

print 'send success, body :%s' % body

connection.close()

```

> ⚠️ 消息接受者 的 routing_key 必须是 `.` 分割， 可以用 `*`代表一个任意单词， `#`代表0个或者多个单词 (ps 当然用 除了`.`之外的其他字符表示routing_key也可以，但是都不会在 `*/#`上起作用)    


> 小提示:     
> * 如果不知道python具体接口和文档， 使用help(model) 即可，比如 help(pika)    

## 头交换机

头交换机使用多个消息属性来代替路由键建立路由规则。通过判断消息头的值能否与指定的绑定相匹配来确立路由规则.     

头交换机可以视为直连交换机的另一种表现形式。头交换机能够像直连交换机一样工作，不同之处在于头交换机的路由规则是建立在头属性值之上，而不是路由键。路由键必须是一个字符串，而头属性值则没有这个约束，它们甚至可以是整数或者哈希值（字典）等    



# 参考文档

> [RabbitMQ GitBook 文档](http://rabbitmq.mr-ping.com/)    




