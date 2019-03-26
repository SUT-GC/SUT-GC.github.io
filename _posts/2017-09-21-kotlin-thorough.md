---
layout: post
title: "Kotlin 分享 笔记(二)"
description: "kotlin 学习分享"
categories: [学习]
tags: [kotlin]
---

* Kramdown table of contents
{:toc .toc}

# Kotlin 分享 笔记（二）

上次，我们对kotlin进行了整体的介绍，并且对kotlin基本的语法如变量，函数等都有了大致的了解，这次我们将会了解下kotlin对类与对象的支持，kotlin是如何使用注解，反射等相关工具的。

## Class & Object

### 构造函数

在kotlin中，我们定义类是非常方便的

```kotlin
final class Demo public constructor(name: String, address: String) {
    init {
        val name = name
    }
    val address = address
}
```

* 在kotlin中，class或interface 默认是final类型的，即不可以被继承或实现的
* kotlin中，构造函数可以存在一个主构造函数和多个次构造函数，如果类中存在主构造函数，则次构造函数必须直接或者间接的委托给主构造函数
* 主构造函数中的参数只能用在初始化块`init`和类体中
* 如果一个类没有声明主构造函数活着次构造函数，将会默认提供一个不带参数的主构造函数
* 如果在主构造函数上存在描述符，将必须显示写出`constructor`关键字
* 类的构造函数默认是public修饰的
* 如果主构造函数中声明的参数使用`var / val`关键字，则该参数将成为该类的属性

经过上面几点，我们可以将这个`Demo`类改写成👇代码

```kotlin
class Demo(val name: String, val address: String)
```

⚠️ 次构造函数的参数不允许用 `val / var` 关键字描述, 因为只是型参, 如👇代码是错误的

```kotlin
class Demo{
    constructor(val name:String){ //这是次构造函数，次构造函数也要用constructor关键字
        // 编译错误，不可以用`val`
    }
}
```

创建类的实例 `val demo = Demo("gc","china")` kotlin 去掉了new 关键字

### 属性和方法

与java一样，我们可以在类中定义方法和属性，同时他们都是默认final关键字描述的，即不可继承的

```kotlin
class Demo(name: String) {
    final val name = name // 可以不写final
    final fun function(): String = name // 可以不写final
}
```

与java不一样的是，kotlin为我们默认提供属性的getter,setter

```kotlin
val demo = Demo("gc")
demo.name // 即默认调用getter
```

当然，我们可以为属性自定义getter, setter *val 定义的属性不允许自定义setter方法*

```kotlin
class Demo(name: String) {
    var name: String = name
        get() = "hello ${field}"
        set(value) {
            field = "hello ${value}"
        }
}
```

这里要注意几个地方:

* `field` 被称为该属性的幕后字段，为什么我们在get方法中返回的是`field`而不是`name`呢？因为如果我们返回`name`，则又会调用`name`属性的get方法，如此递归到栈溢出，`field`仅仅是存储`name`的值，不包装get/set
* set中的value参数是自定义的，不过通常用`value` ， set中参数没有类型，get中没有返回值，因为这些都可以在属性上得知

### 接口

kotlin 中的接口与java相似，不过kotlin中提供了更丰富的接口功能，它允许接口定义属性，但接口中的属性不能保存状态，也不应该保存状态，所以接口中的属性不能初始化且不能使用`背后字段`

```kotlin
interface Demo {
    val name: String

    val address: String
        get() = "hello"

    fun function1(): String {
        return address
    }

    fun function2()
}
```

### 抽象类

kotlin中的抽象类与java一致

```kotlin
abstract class DemoII {
    // 与java一致
}
```

### 数据类

kotlin 提供了数据类的概念，简化代码(与java中@Data的作用一致)

```kotlin
data class Demo(val name: String, val address: String)

fun main(args: Array<String>) {
    val demo = Demo("gc", "china")
    //生成toString
    println(demo.toString())
    //生成component
    val (name, address) = demo
    println("name: ${name}, address: ${address}")
    //生成copy 深度拷贝
    val demoI = demo.copy(name = "gc2")
    println(demoI.toString())
}

/* out
Demo(name=gc, address=china)
name: gc, address: china
Demo(name=gc2, address=china)
*/
```

### 嵌套类

```kotlin
class Demo{
    private val name:String = "gc"
    class Demo1{
        println(name) //ERROR
        fun foo() = "gc"
    }
}

val demo1 = Demo.Demo1().foo()
```

嵌套类中，里面的类不可以访问外面的变量或方法

### 内部类

```kotlin
class Demo{
    private val name:String = "gc"
    inner class Demo1{
        println(name) //ok
        fun foo() = "gc"
    }
}

val demo1 = Demo().Demo1().foo() //这里与嵌套类也不一样
```

### 枚举类

```kotlin
enum class Demo(val name:String){
    GC("gc")
}
```

### 伴生对象

因为kotlin中没有static关键字, 如果想要实现对应的效果，可以使用半生对象，初始化时机也与static一致

```kotlin
class Demo{
    companion object Factory{ //可以省略对象名 Factory
        fun create(): Demo = Demo()
    }
}

// val demo = Demo.create()
```

### 单例类

```kotlin
object DemoUtil {
    fun isValidId(id: Long?) = id?.let { id > 0 } ?: false
}

// DemoUtil.isValidId(10)
```

在kotlin中，这种定义也叫做对象声明，当且仅当使用这个对象中的方法或者属性时候初始化（单例模式中的懒汉模式）

### 继承

kotlin中的继承与java最大的区别是 koltin支持多继承    

* 如果父类中没有构造函数(包括主构造和次构造)，则子类中继承的时候调用父类的空构造函数

```kotlin
open class Demo {
       
}

class DemoI : Demo() {

}
```

> 当然，接口没有构造函数，所以可以这么写

```kotlin
interface Demo {

}

class DemoI : Demo {

}
```

* 如果父类中存在构造函数，且子类中不存在主构造函数，则次构造函数必须显示使用`super`关键字

```kotlin
class Demo(name:String){

}

class DemoI : Demo{
    constructor(name:String, address:String) : super(name){

    }
}
```

* 子类覆盖父类中的方法必须用 `override`  关键字显示声明

```kotlin
open class Demo {
    open fun function() = "hello world"
}

class DemoI : Demo() {
    override fun function() = "hahaha"
}
```

* 属性与方法 同样可以被继承， 但要注意的是 一个 val 标注的属性不可以被 var 标注的属性重写，反之可以

* kotlin 中多继承是被允许的，如果想要调用某一父类指定的方法，可以使用super<*> 关键字

```kotlin
open class DemoI {
    open fun function() = "hello world"
}

open class DemoII {
    open fun function() = "hello china"
}

class Demo : DemoI(), DemoII(){
    override fun function() {
        return super<DemoI>.function() + super<DemoII>.function()
    }
}
```

### 组合

```kotlin
class Demo {
    fun function(){
        println("hello world")
    }
}

class DemoI(val demo:Demo){
    fun function(){
        demo.function()
    }
}
```

### 委托

kotlin 原声支持类，方法，属性委托, 这里暂时只会提到类委托

```kotlin
interface Projector {
    fun show(content:String)
}

class SonyProjector: Projector {
    override fun show(content:String){
        println ("sony show ${content}")
    }
}

class Computor (projector: Projector): Projector by projector // 这里发生了委托

fun main(args: Array<String>) {
    val sonyProjector: Projector = SonyProjector()
    val computor: Computor = Computor(sonyProjector)
    computor.show("hello worlds")

    println(Computor::class)
}
```

### 继承，组合，委托

对于这三种类与类之间的组装形式，网上有很多人去争辩哪个更优于哪个，我个人认为三者之间没有优劣，仅仅是场景不同的产物。    

继承很明显的存在于亲子之间的关系，比如父亲和孩子，鸟与麻雀之间的关系，这种是无论是具有血缘关系的直系亲属还是生物之间的进化，都可以用继承关系描述；组合则强调的是整体与部分的关系，比如车和轮胎，车和车坐等，大物品是由小物品组装起来的，用组合相对较好；而委托则更注重行为上，比如电脑与投影仪，电脑是个体，投影仪也是个体，两个既没有进化关系，也没有组装关系（并不是缺了投影仪，电脑不能工作），电脑只会把显示任务委托给投影仪。    

其实代码中的世界与人类世界一样，比如继承，组装，委托，比如工厂模式，订阅者模式，这些无不是在人类社会进化总结出来最终映射到代码世界的， 所以说，人类世界中的规律如果很好的应用在写代码上，也就不用费尽心机的去研究什么解耦了，因为现在这个社会便是最好解耦的结果。    

## 泛型

koltin 对泛型的支持比java更为方便，虽然两者对泛型都是做类型擦除操作，但kotlin无论是在语法上还是在语义上都比java更加人性化

### 为什么要存在类型擦除

原因也和大多数的Java让人不爽的点一样——兼容性。由于泛型并不是从Java诞生就存在的一个特性，而是等到SE5才被加入的，所以为了兼容之前并未使用泛型的类库和代码，不得不让编译器擦除掉代码中有关于泛型类型信息的部分，这样最后生成出来的代码其实是『泛型无关』的，我们使用别人的代码或者类库时也就不需要关心对方代码是否已经『泛化』，反之亦然。    

在编译器层面做的这件事（擦除具体的类型信息），使得Java的泛型先天都存在一个让人非常难受的缺点：

**在泛型代码内部，无法获得任何有关泛型参数类型的信息**    

### 容器类的协变与逆变

无论是在java还是在kotlin中, `Object obj = new String("gc")` 是合法的，但是`String str = new Object()` 是非法的，也就是说用父类去装子类的实例是没有问题的，但反之却不行。且这是可以被理解的。    

在java中， `ArrayList<Object> l = new ArrayList<String>()` 是不被编译通过的，因为 ``ArrayList<Object>` 并非 `ArrayList<String>` 的父类。    

但这便不被某些人理解， 👇代码来表明这为什么不被允许:    

```java
ArrayList<Object> objects = new ArrayList<String>();
for (Object object : objects) {
    object = new Integer(1);
}
```

如果 `ArrayList<Object>` 是 `ArrayList<String>` 的父类，就会出现上面的代码而且被编译通过，这是很危险的事情, 且与数组协变造成的危险一样大。

所以在java中，我们要这样来解决上面的问题， 但是要以牺牲修改容器内容为代价。

```java
ArrayList<? extends Object> objects = new ArrayList<String>();
objects.add(new String("gc")); // 对其写入的时候异常
```

如果想要一个对应 写操作 的协变    

```java
ArrayList<? supper String> objects = new ArrayList<Object>();
objects.add(new String("gc"));
String s = objects.get(0);// 但读却同样被牺牲
```

因为java的类型擦除，java在编译阶段对泛型做了强有力的校验，而这种校验导致我们不得不加入通配符并且符合操作规格来进行代码编写

```java
class A<T> {
    private T l = null;

    public A(T l) {
        this.l = l;
    }

    public T getContent() {
        return l;
    }
}

public class Main {
    public static void main(String[] args) {
        /*
         * 这里我们写的类虽然只进行的读操作，但是在调用的时候也不能将 A<String> 附值给 A<Object>
         */
        A<? extends Object> a = new A<String>("gc"); 
    }
}
```


我们看下kotlin的代码:    

```kotlin
interface Source<out T>

fun function(arg: Source<String>) {
    val a : Source<Any> = arg
}
```

kotlin 在泛型上对于类型擦除的检查与java做了不同方向上的处理，koltin 去除了 在定义变量的时候使用通配符 `?` 的方法，增加了声明处泛型的方法，如果在使用在变量的时候仅仅是安全的get操作，那么可以在改变量的声明处增加`out`关键字处理，由此得到的好处是 `Source<Any>` 是`Source<String>` 的父类。

## 注解 & 反射

### 注解

kotlin 中注解 与 java 注解100%兼容， 语法上也一致

```kotlin

@Target(AnnotationTarget.CLASS, AnnotationTarget.FUNCTION,
        AnnotationTarget.VALUE_PARAMETER, AnnotationTarget.EXPRESSION)
@Retention(AnnotationRetention.SOURCE)
@MustBeDocumented
annotation class Fancy

```

使用注解也与java类似

```kotlin

@Fancy class Foo {
    @Fancy fun baz(@Fancy foo: Int): Int {
        return (@Fancy 1)
    }
}

```


### 反射

kotlin 的反射和java 的也很类似，不同的是 kotlin::class 获取的是kotlin提供的类 KClass 类型，java.getClass() 获取的是java的类，当然 kotlin::class.java 也能获取到同样的结果

其他的知识点同java的知识点， 我们看段个小demo  

这个demo的要实现的功能：

* 读取项目根目录下的文件内容，将文件中的内容通过一定规格映射给对应的类

注解类:

```kotlin
@Target(AnnotationTarget.PROPERTY)
@Retention
annotation class MyAnno(val fileName: String = "application.properties", val propertyName: String)
```

解析类:

```kotlin
class AnnoExpres(val obj: Any) {
    init {

    }

    fun expression() {
        val clazz = obj.javaClass.kotlin
        clazz.memberProperties.forEach { property ->
            val mutableProp = try {
                property as KMutableProperty<*>
            } catch (e: Exception) {
                null
            } ?: return@forEach


            val propertyName = mutableProp.name
            val propertyType = mutableProp.returnType.toString().removePrefix("kotlin.")

            mutableProp.annotations.forEach {
                if (it is MyAnno) {
                    when (propertyType) {
                        "String" -> mutableProp.setter.call(obj, getFileContent(it.fileName)[propertyName] ?: "")
                        "Int" -> mutableProp.setter.call(obj, getFileContent(it.fileName)[propertyName]?.toInt() ?: 0)
                        "Boolean" -> mutableProp.setter.call(obj, getFileContent(it.fileName)[propertyName]?.toBoolean() ?: false)
                    }
                }
            }
        }
    }

    private fun getFileContent(fileName: String): Map<String, String> {
        val lines = InputStreamReader(AnnoExpres::class.java.classLoader.getResourceAsStream(fileName)).readLines()

        return lines.filter {
            !StringUtils.isEmpty(it)
        }.filter {
            !it.startsWith("#")
        }.map {
            it.split("=")[0] to if (it.split("=").size > 1) it.split("=")[1] else ""
        }.toMap()
    }
```

model类:

```kotlin
/*
 * 通过注解，我们知道 读取application.properties文件，并且将对应的字段映射到对应的属性上
 */
class User {
    @MyAnno(propertyName = "name") var name: String = ""
    @MyAnno(propertyName = "age") var age: Int = 0
    @MyAnno(propertyName = "man") var man: Boolean = false

    override fun toString(): String {
        return "User(name='$name', age=$age, man='$man')"
    }
}
```

Main:

```kotlin
fun main(args: Array<String>) {
    val user = User()
    val anno = AnnoExpres(user)
    anno.expression()
    println(user)
}
```

application.properties 文件内容:

```kotlin
# test
name="zhangjie"
age=23
man=true
```

下面是运行结果 

```kotlin
    User(name='"zhangjie"', age=23, man='true')
```


## 总结

随着对kotlin的深入， 越来越感觉kotlin像是java的语法糖，也可能是因为初学者的原因，对kotlin的设计理念还不了解，不过既然java与kotlin都可以起到相同的作用，实现相同的东西，就算是语法糖，我们为什么不适用更方便简洁的语法糖呢？ 我也打算在日常代码中加入对kotlin的使用，但也不会放弃对java的深入，因为她们都跑在JVM上～   


下面我们看一段用kotlin写出来的代码，只看外观和写作感受来讲的话，不觉得很爽么？


```kotlin
import com.example.html.* // 具体的声明参见下文

fun result(args: Array<String>) =
    html {
        head {
            title {+"XML encoding with Kotlin"}
        }
        body {
            h1 {+"XML encoding with Kotlin"}
            p  {+"this format can be used as an alternative markup to XML"}

            // 一个元素, 指定了属性, 还指定了其中的文本内容
            a(href = "http://kotlinlang.org") {+"Kotlin"}

            // 混合内容
            p {
                +"This is some"
                b {+"mixed"}
                +"text. For more see the"
                a(href = "http://kotlinlang.org") {+"Kotlin"}
                +"project"
            }
            p {+"some text"}

            // 由程序生成的内容
            p {
                for (arg in args)
                    +arg
            }
        }
    }
```
