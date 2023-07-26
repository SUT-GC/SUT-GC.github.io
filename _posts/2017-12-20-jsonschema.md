---
layout: post
title: "Json Schema"
description: "我现在想要的，是我未来想要的么？"
categories: [学习]
tags: [jsonschema]
---

* Kramdown table of contents
{:toc .toc}


# 什么是Json Schema

json schema 本身便是json字符串，它用来描述和校验另外的一个json是否正确。 json schema 中提供了可穷举的校验规则（当然，这是基于json的格式是可预见，可穷举的）     

举个简单的例子来真实感受下 jsonschema 和 json 之间的关系:    

json    
```json
{
    "personName": "gc",
    "personAge":23,
    "personTag":"Optimistic",
    "personLatitude": 123.01,
    "personLongitude": 125.12
}
```

json schema    
```json
{
    "$schema": "http://json-schema.org/draft-04/schema#",
    "type":"object",
    "properties":{
        "personName":{
            "type":"string",
            "maxLength":20,
            "minLength":2
        },
        "personAge":{
            "type":"integer",
            "minimum": 20,
            "maximum": 25
        },
        "personTag":{
            "type":"string",
            "enum":["Optimistic","Earnest","Hello","World"]
        },
        "personLatitude":{
            "type":"number"
        },
        "personLongitude":{
            "type":"number"
        }
    }
}
```

> 这里提供一个用json schema 校验 json 的前端界面: [json shema validation](http://json-schema-validator.herokuapp.com/)    

# Json Schema 校验关键字

## 通用关键字

### title

title 必须是一个string，并无实际用途，只是做标注

### description

description 必须是一个string， 无实际用途，标注

### default

default 默认值，当不存在该属性的时候，则默认填充的值

### type

type 必须是 ["integer", "string", "number", "object", "array", "boolean", "null"] 六种类型之一，number 和 integer 的区别在于 number 可以匹配任何数值（可以理解为java中的Double类型），而 integer 只可以匹配整数类型（可以理解为java中的Integer）    

### enum

enum 表示枚举类型，即json中的值必须是enum穷举中的任何一个，往往配合 type 为 ["integer", "number", "string"] 这三个使用，使用方式如下:    

```json
// schema
{
    "type":"object",
    "properties":{
        "myEnum":{
            "type":"string",
            "enum":["ENUM1", "ENUM2", "ENUM3"]
        }
    }
}

// json
{
    "myEnum":"ENUM1" //success
    // "myEnum": "ENUM4"  faile
}
    
```

## Number 类型

> Number 与 Integer 的关键字一样

### multipleOf

nultipleOf 必须是一个Number值（举例为值为a），则json中该字段的值必须是a的倍数    

### maximum

maximum 必须是一个Number值（举例值为a），则json中的该字段的值必须 <= a

### minimum

minimum 必须是一个Number值（举例值为a），则json中的该字段的值必须 >= a

### exclusiveMaximum

exclusiveMaximum 必须是一个boolen值，如果为true，表示 json中的值必须 < maximum

### exclusiveMinimum

exclusiveMinimum 必须是一个boolean值，如果为true，表示 json中的值必须 > minimum

### demo

```json

// json schema
{
    "$schema": "http://json-schema.org/draft-04/schema#",
    "type": "object",
    "properties": {
        "personAge": {
            "type":"integer",
            "maximum": 20,
            "minumum": 2,
            "exclusiveMinimum":true,
            "exclusiveMaxinum":false
        }
    }
}
    

// json value
{
    "personAge": 18 //success  value scope = (2, 20]
}

```

## String 类型

### maxLength

maxLength 必须是一个正整数（举例值为a），则json中的该字段的字符串长度必须 <= a

### minLength

minLength 必须是一个正整数（举例值为a），则json中的该字段的字符串长度必须 >= a

### pattern

pattern 必须是一个字符串，且是一个有效的正则表达式，该表达式必须满足 [ECMA 262] 定义    

### demo

```json

// json schema
{
    "$schema": "http://json-schema.org/draft-04/schema#",
    "type": "object",
    "properties": {
        "personName": {
            "type":"string",
            "maxLength": 20,
            "minLength": 2,
            "pattern": "^g[a-z]*c$"
        }
    }
}

// json value
{
    "personName":"gc" //success
    // failures  ->    "personName":"g"; "personName":"gx"; "personName":"ggggggggggggggggggccc"
}
```

## Arrays 类型

### items

items 表示array中元素的具体类型，json值必须所有的都满足这个类型，才会表示验证成功。

### additionalItems

additionalItems 是否支持添加其他数组项， 校验数组项的时候可以分为两种校验方式    

* 对数组中的每一项按照相同的规则校验    
* 对数组中的不同项按照不同规则校验    

而 additionalItems 就是为了标明这一点，具体见demo

### maxItems

maxItems 最大items长度，必须是正整数  <= 

### minItems

minItems 最小items长度，必须是正整数 <=

### uniqueItems

uniqueItems 是否唯一值，必须是boolean， 如果true，则items内部不允许重复    

### contains

contains 

### demo

* List validation： 对数组中的每一项按照同一个规则校验    

```json
// json schema
{
    "type":"object",
    "properties":{
        "myList":{
            "items":{
                "type":"string",
                "maxLength":10
            },
            "maxItems":3,
            "uniqueItems": true
        }
    }
}

// json value
{
    "myList":["hello", "world", "gc"]
}
```

* Tuple validation: 针对元素在数组中的位置来校验不同规则

```json
// json schema
{
    "type":"object",
    "properties": {
        "myList": {
            "items":[
                {
                    "type":"string"
                },
                {
                    "type":"integer"
                },
                {
                    "type":"boolean"
                }
            ],
            "additionalItems": false
        }
    }
}

// json value
{
    "myList":["gc", 1, true] // success;  ["gc", 1] success; ["gc", 1, true, "gc"] faile
}
```

从上面的比较可以看出相关的差别，注意 additionalItems=false的时候，只能校验真实值比规则少的情况，如果真实值比规则多，则失败（json value 给出了三种情况 = < > )

## Object 类型

### maxProperties

maxProperties 必须是一个正整数（举例a），则json中该字段的属性必须 <= a 个

### minProperties

minProperties 必须是一个正整数（举例a），则json中该字段的属性必须 >= a 个

### required

required 必须是一个list， 表示该object类型的哪些字段是必须的存在且不为null的

### properties

properties 必须是一个object类型，表示着对该object字段的每个属性的jsonchema

### dependencies

dependencies 必须是一个object类型，表示哪些属性的存在必须依赖另外一些属性的存在

### patternProperties

patternProperties 必须是一个object，会判断所有属性名匹配上的都必须满足一定的条件

### additionalProperties

additionalProperties 必须是一个object， 表示json可以出现object未定义，但是满足一定条件的数据

### demo

```json
// json schema
{
    "$schema": "http://json-schema.org/draft-04/schema#",
    "type": "object",
    "properties":{
        "itemName":{
            "type":"string",
            "maxLength": 10
        },
        "itemPrice":{
            "type":"number"
        }
    },
    "required": ["itemPrice"],
    "dependencies": {
        "itemPrice": ["itemName"] // 表示itemPrice存在必须在itemName存在的前提下
    }
}

// json value
{
    "itemName":"1234567890",
    "itemPrice":10
}
```

# 规则

* 字符串定义 [RFC 7159]()
* 正则表达式定义 [ECMA 262]()

# 使用

> 这里提供了kotlin语言的使用姿势，如果想要知道其他语言的使用姿势，请参考官方文档    


**gradle引入相关依赖包**

```gradle
compile("com.github.java-json-tools:json-schema-validator:2.2.8")
```

**schema.json**

```json
{
  "definitions": {},
  "$schema": "http://json-schema.org/draft-06/schema#",
  "type": "object",
  "properties": {
    "item": {
      "type": "object",
      "properties": {
        "itemName": {
          "type": "string",
          "format": "date-time"
        },
        "itemPrice": {
          "type": "number",
          "default": 0
        },
        "itemCount": {
          "type": "integer",
          "default": 0,
          "minimum": 10
        },
        "itemTags": {
          "type": "string",
          "enum": [
            "hello",
            "world"
          ]
        },
        "skus": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "skuName": {
                "type": "string",
                "default": ""
              },
              "skuPrice": {
                "type": "number",
                "default": 0,
                "maximum":20
              }
            }
          }
        }
      }
    }
  }
}
```

**value.json**

```json 
{
  "item": {
    "itemName": "2017-11-12T22:30:20Z",
    "itemPrice": 5.6,
    "itemCount": 11234567890123456789,
    "itemTags": "hello",
    "skus": [
      {
        "skuName": "gc_sku1",
        "skuPrice": 10.2
      },
      {
        "skuName": "gc_sku2",
        "skuPrice": 21
      }
    ]
  }
}
```


**kotlin代码**

```kotlin
package json.schame

import com.fasterxml.jackson.databind.JsonNode
import com.github.fge.jackson.JsonLoader
import com.github.fge.jsonschema.examples.Utils
import com.github.fge.jsonschema.main.JsonSchemaFactory
import entity.ItemDTO

fun main(args: Array<String>) {
    val schemaUrl = ItemDTO::class.java.classLoader.getResource("schema.json")
    val valueUrl = ItemDTO::class.java.classLoader.getResource("value.json")

    val jsonSchemaNone = JsonLoader.fromURL(schemaUrl)
    val jsonValueNone = JsonLoader.fromURL(valueUrl)

    val factory = JsonSchemaFactory.byDefault();
    val jsonSchema = factory.getJsonSchema(jsonSchemaNone);

    println(jsonSchema.validate(jsonValueNone, true))
}
```

> 源码的git地址下面已经给出，更详细的使用请参考源码

# 参考

> 上面所描述的既可以满足基本的json校验，当然也会有更加花哨的玩法，更详细文档下面给出链接     

* [官方文档](http://json-schema.org/latest/json-schema-validation.html#rfc.section.6.1.2)

* [民间文档](http://xaber.co/2015/10/20/JSON-schema-%E4%BD%BF%E7%94%A8%E6%95%99%E7%A8%8B%E6%96%87%E6%A1%A3/)

* [在线校验工具](http://json-schema-validator.herokuapp.com/)

* [JAVA工具包GIT源码](https://github.com/java-json-tools/json-schema-validator)
