---
layout: post
title: "Spring-Boot + RabbitMQ"
description: "Sprintboot 和 RabbitMQ 集成 学习笔记"
categories: [学习]
tags: [RabbitMQ, SprintBoot]
---

* Kramdown table of contents
{:toc .toc}

# Spring-Boot 使用RabbitMQ

## 1.安装&运行 rabbitmq

* 安装服务器 :`brew install rabbitmq`
* 运行Server:`rabbitmq-server`

安装完之后:    

* 应用端口:15672
* 服务端口:5672

> 如果没有此命令，可以去`/usr/local/Cellar/rabbitmq/3.6.6`目录下找rabbitmq-server命令（具体目录，安装的时候会有）    
> 参考 [rabbitmq 安装与配置](https://github.com/judasn/Linux-Tutorial/blob/master/RabbitMQ-Install-And-Settings.md)

---

## 2. 搭建环境

### 2.1 引入包

`compile('org.springframework.boot:spring-boot-starter-amqp')`

### 2.2 建立接收者

```java
import java.util.concurrent.CountDownLatch;
import org.springframework.stereotype.Component;

@Component
public class Receiver {

    private CountDownLatch latch = new CountDownLatch(1);

    public void receiveMessage(String message) {
        System.out.println("Received <" + message + ">");
        latch.countDown();
    }

    public CountDownLatch getLatch() {
        return latch;
    }
}

```

### 2.3 建立监听者

```java
import com.igouc.receiveMQ.Receiver;
import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.listener.SimpleMessageListenerContainer;
import org.springframework.amqp.rabbit.listener.adapter.MessageListenerAdapter;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class ConfigMq {
    final static String QueueName = "test-rmq";
    final static String ExchangeName = "test";

    @Bean
    Queue queue(){
        return new Queue(QueueName, false);
    }

    @Bean
    TopicExchange exchange(){
        return new TopicExchange(ExchangeName);
    }

    @Bean
    Binding binding(Queue queue, TopicExchange topicExchange){
        return BindingBuilder.bind(queue).to(topicExchange).with(ExchangeName);
    }

    @Bean
    MessageListenerAdapter listenerAdapter(Receiver receiver) {
        return new MessageListenerAdapter(receiver, "receiveMessage");
    }

    @Bean
    SimpleMessageListenerContainer container(ConnectionFactory connectionFactory,
                                             MessageListenerAdapter listenerAdapter) {
        SimpleMessageListenerContainer container = new SimpleMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);
        container.setQueueNames(QueueName);
        container.setMessageListener(listenerAdapter);
        return container;
    }
}
```

### 2.4 建立发送者

```java
import com.igouc.receiveMQ.Receiver;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;

@Component
public class SendMQ implements CommandLineRunner{

    final static String QueueName = "test-rmq";
    final static String ExchangeName = "test";

    @Autowired
    private RabbitTemplate rabbitTemplate;
    @Autowired
    private Receiver receiver;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("start send message ....");
        rabbitTemplate.convertAndSend(QueueName, "Hello From SendMQ"); //像
        receiver.getLatch().await(10000, TimeUnit.MILLISECONDS);
    }
}
```

---

## 3. rabbitmq 中文文档：

[RabbitMQ中文](http://rabbitmq.mr-ping.com/)

> 博客迁移自 [GC-CSDN](http://blog.csdn.net/gc_chao/article/details/60468431)