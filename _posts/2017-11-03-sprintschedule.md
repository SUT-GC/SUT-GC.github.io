---
layout: post
title: "SpringBoot 创建定时任务"
description: "我生来贫穷，却觉得一切都可能拥有"
categories: [学习]
tags: [spring boot]
---

* Kramdown table of contents
{:toc .toc}


# SprintBoot实现定时任务

## TestApplication.kt

```kotlin
@SpringBootApplication
@EnableScheduling //此注解表示自动配置定时任务
@ComponentScan("schedule")
open class TestApplication {
}

fun main(args: Array<String>) {
    SpringApplication.run(TestApplication::class.kotlin, *args)
}
```

## TestSchedule.kt

```kotlin
@Component
class Job {
    @Scheduled(cron = "\${job.one.cron}")
    fun run1() {
        repeat(10) {

            println("${Thread.currentThread().name} job1 hello")
            Thread.sleep(1000);
        }

    }

    @Scheduled(cron = "\${job.two.cron}")
    fun run2() {
        repeat(10) {
            println("${Thread.currentThread().name} job2 hello")
            Thread.sleep(1000);
        }
    }
}
```

## application.properties

```kotlin
job.one.cron=* * * * * ?
job.two.cron=* * * * * ?
```

## 输出

```kotlin
pool-1-thread-1 job1 hello
pool-1-thread-1 job1 hello
pool-1-thread-1 job1 hello
pool-1-thread-1 job1 hello
pool-1-thread-1 job1 hello
pool-1-thread-1 job1 hello
pool-1-thread-1 job1 hello
pool-1-thread-1 job1 hello
pool-1-thread-1 job1 hello
pool-1-thread-1 job1 hello
pool-1-thread-1 job2 hello
pool-1-thread-1 job2 hello
pool-1-thread-1 job2 hello
pool-1-thread-1 job2 hello
pool-1-thread-1 job2 hello
pool-1-thread-1 job2 hello
pool-1-thread-1 job2 hello
pool-1-thread-1 job2 hello
pool-1-thread-1 job2 hello
pool-1-thread-1 job2 hello
``` 

## 总结

上面的代码可以实现定时任务：每秒运行    

**但有个问题便是，默认为单线程执行所有的任务，这样可能达不到实际定时的效果**

## 多线程执行

如果想要多线程执行定时任务，可以配置一个线程池，这样定时任务就会去线程池中拿线程执行定时任务了     

我们把Application代码改一下:     

```kotlin
@SpringBootApplication
@EnableScheduling
@ComponentScan("schedule")
@Import(ScheduleConfig::class)
open class TestApplication {
}

fun main(args: Array<String>) {
    SpringApplication.run(TestApplication::class.java, *args)
}
```

并且添加一个ScheduleConfig配置代码

```kotlin
class ScheduleConfig : SchedulingConfigurer {
    override fun configureTasks(taskRegistrar: ScheduledTaskRegistrar?) {
        taskRegistrar?.setScheduler(Executors.newScheduledThreadPool(10))
    }
}
```

运行效果：     

```kotlin
pool-1-thread-1 job2 hello
pool-1-thread-2 job1 hello
pool-1-thread-2 job1 hello
pool-1-thread-1 job2 hello
pool-1-thread-2 job1 hello
pool-1-thread-1 job2 hello
pool-1-thread-2 job1 hello
pool-1-thread-1 job2 hello
pool-1-thread-2 job1 hello
pool-1-thread-1 job2 hello
pool-1-thread-2 job1 hello
pool-1-thread-1 job2 hello
pool-1-thread-2 job1 hello
pool-1-thread-1 job2 hello
pool-1-thread-2 job1 hello
pool-1-thread-1 job2 hello
pool-1-thread-2 job1 hello
pool-1-thread-1 job2 hello
pool-1-thread-2 job1 hello
```

由输出，我们看出，确实由多个线程执行了定时任务。     


# Scheduled

我们来看下这个注解可以方什么东西进去：    

```java
public @interface Scheduled {

	/**
	 * A cron-like expression, extending the usual UN*X definition to include
	 * triggers on the second as well as minute, hour, day of month, month
	 * and day of week.  e.g. {@code "0 * * * * MON-FRI"} means once per minute on
	 * weekdays (at the top of the minute - the 0th second).
	 * @return an expression that can be parsed to a cron schedule
	 * @see org.springframework.scheduling.support.CronSequenceGenerator
	 */
	String cron() default "";

	/**
	 * A time zone for which the cron expression will be resolved. By default, this
	 * attribute is the empty String (i.e. the server's local time zone will be used).
	 * @return a zone id accepted by {@link java.util.TimeZone#getTimeZone(String)},
	 * or an empty String to indicate the server's default time zone
	 * @since 4.0
	 * @see org.springframework.scheduling.support.CronTrigger#CronTrigger(String, java.util.TimeZone)
	 * @see java.util.TimeZone
	 */
	String zone() default "";

	/**
	 * Execute the annotated method with a fixed period in milliseconds between the
	 * end of the last invocation and the start of the next.
	 * @return the delay in milliseconds
	 */
	long fixedDelay() default -1;

	/**
	 * Execute the annotated method with a fixed period in milliseconds between the
	 * end of the last invocation and the start of the next.
	 * @return the delay in milliseconds as a String value, e.g. a placeholder
	 * @since 3.2.2
	 */
	String fixedDelayString() default "";

	/**
	 * Execute the annotated method with a fixed period in milliseconds between
	 * invocations.
	 * @return the period in milliseconds
	 */
	long fixedRate() default -1;

	/**
	 * Execute the annotated method with a fixed period in milliseconds between
	 * invocations.
	 * @return the period in milliseconds as a String value, e.g. a placeholder
	 * @since 3.2.2
	 */
	String fixedRateString() default "";

	/**
	 * Number of milliseconds to delay before the first execution of a
	 * {@link #fixedRate()} or {@link #fixedDelay()} task.
	 * @return the initial delay in milliseconds
	 * @since 3.2
	 */
	long initialDelay() default -1;

	/**
	 * Number of milliseconds to delay before the first execution of a
	 * {@link #fixedRate()} or {@link #fixedDelay()} task.
	 * @return the initial delay in milliseconds as a String value, e.g. a placeholder
	 * @since 3.2.2
	 */
	String initialDelayString() default "";

}
```

* `cron` cron表达式
* `zone` cron表达式使用的时区，默认是local zone
* `fixedDelay` 每次任务启动时的间隔时间
* `fixedDelayString` 与`fixedDelay` 一样，不过这个是string
* `fixedRate` 上次任务结束后间隔多少时间再启动下一次任务，这样避免前一个任务尚未结束又启动下一个任务
* `fixedRateString` 同理
* `initialDelay` 程序启动后至任务首次执行时的间隔
* `initialDelayString` 同理

# Cron 表达式

cron 表达式有六个区域（5个空格）或者 七个区域（6个空格）

`Seconds Minutes Hours DayofMonth Month DayofWeek`
多少秒  多少分  多少时  一个月第几天  第几个月  一周第几天
`Seconds Minutes Hours DayofMonth Month DayofWeek Year`
多少秒  多少分  多少时  一个月第几天  第几个月  一周第几天 几几年

* `seconds`: `, - / * [0-59]`
* `minutes`: `, - / * [0-59]`
* `hours`: `, - / * [0-23]`
* `dayofmonth`: `, - / * ? L W C [0-31]`
* `month`: `, - / * [1-12/JAN-DEC]`
* `dayofweek`: `, - / * ? L C # [1-12/SUN-SAT]``
* `year` : `, - / * [1970-2099]`


* `*` 表示任意值 `* * * * * ?` 每秒都执行一次
* `?` 表示任意值，只能用在dayofmonth/dayofweek中，因为这两个值是互相影响的，比如`0 0 0 3 * ?`代表每个月的第三天触发
* `-` 表示范围值 `0 5-10 * * * ?` 表示任何时间的5分-10分，每分钟触发一次
* `/` 表示开始时间，和相隔时间  `* 5/10 * * * ?` 表示每小时 5，15，25，35，45，55 各触发一次
* `,` 表示枚举 `0 1,15 * * * ?` 表示每小时第1分和第5分触发一次
* `L` 表示最后一个 `0 0 0 3L * ?` 表示每年最后一个月的第三天触发
* `W` 有效工作日 `0 0 0 ? * LW` 表示每个月的最后一周的周五触发
* `#` 用于确定每个月第几个星期几 `0 0 0 ? * 4#2` 表示每个月的第二个星期三触发


在网上找了些例子，供大家熟悉    

```
0 0 10,14,16 * * ? 每天上午10点，下午2点，4点
0 0/30 9-17 * * ?   朝九晚五工作时间内每半小时
0 0 12 ? * WED 表示每个星期三中午12点 
"0 0 12 * * ?" 每天中午12点触发 
"0 15 10 ? * *" 每天上午10:15触发 
"0 15 10 * * ?" 每天上午10:15触发 
"0 15 10 * * ? *" 每天上午10:15触发 
"0 15 10 * * ? 2005" 2005年的每天上午10:15触发 
"0 * 14 * * ?" 在每天下午2点到下午2:59期间的每1分钟触发 
"0 0/5 14 * * ?" 在每天下午2点到下午2:55期间的每5分钟触发 
"0 0/5 14,18 * * ?" 在每天下午2点到2:55期间和下午6点到6:55期间的每5分钟触发 
"0 0-5 14 * * ?" 在每天下午2点到下午2:05期间的每1分钟触发 
"0 10,44 14 ? 3 WED" 每年三月的星期三的下午2:10和2:44触发 
"0 15 10 ? * MON-FRI" 周一至周五的上午10:15触发 
"0 15 10 15 * ?" 每月15日上午10:15触发 
"0 15 10 L * ?" 每月最后一日的上午10:15触发 
"0 15 10 ? * 6L" 每月的最后一个星期五上午10:15触发 
"0 15 10 ? * 6L 2002-2005" 2002年至2005年的每月的最后一个星期五上午10:15触发 
"0 15 10 ? * 6#3" 每月的第三个星期五上午10:15触发
```


# 参考

> [Spring 定时任务(Schedule) 和线程](https://unmi.cc/spring-schedule-runner-threads/)     
> [spring cron表达式](http://www.blogjava.net/hao446tian/archive/2012/02/13/369872.html)     
