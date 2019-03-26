---
layout: post
title: "KMP 算法"
description: "当初坚持的，因为某些原因退缩了，现在是否能继续坚持"
categories: [学习]
tags: [algorithm]
---

* Kramdown table of contents
{:toc .toc}

# 背景

身为一个笨拙的程序员, 最近一直在刷leetcode, leetcode 的[第28题目](https://leetcode.com/problems/implement-strstr/description/) 题目是这样的:    

实现strStr(string haystack, string needle)函数， 函数会接受两个参数, 判断needle是否为haystack的子串， 如果是，则返回needle的首字母在haystack中的索引，如果否，则返回 -1      

# 解决办法    

## 办法 1    

最容易想到的就是暴力解决（这个也许是人们惯用的思维方式， 遇到问题， 要想个通用的办法， 一般第一个想到的就是尽可能的模拟人的思维方式， 即 模拟 or 暴力 解决)     

```javascript
var isStr = function(haystack, hayIndex, needle) {
    console.log(haystack, hayIndex, needle)
    if (needle === "") {
        return true
    }

    if (hayIndex >= haystack.length) {
        return false
    }

    if (haystack.length - hayIndex < needle.length) {
        return false
    }

    for (let i = hayIndex; i < haystack.length; i++) {
        if (i - hayIndex >= needle.length) {
            break
        }

        if (haystack[i] !== needle[i - hayIndex]) {
            return false
        }
    }

    return true
}

var strStr = function(haystack, needle) {

    if (needle === "") {
        return 0
    }

    if (haystack === "") {
        return -1
    }

    if (needle.length > haystack.length) {
        return -1
    }

    let findIndex = -1
    
    for (let hayIndex = 0; hayIndex < haystack.length; hayIndex ++) {
        if (isStr(haystack, hayIndex, needle)) {
            findIndex = hayIndex
            break
        }
    }

    return findIndex
};
```

暴力解决是ok的。但是效率会比较差， 上面代码的时间复杂度为 O(m * n)     

## 办法 2

稍微往深了想一想，就能想到优化的地方， 比如 下面这种情况就不需要进行比对了。    

```
haystack:   a b c d e f g h
needle  :           l m b o p
```     

当 needle[0] 与 haystack[i] 进行比较的时候, 如果 len(needle) > len(haystack) - i + 1 的时候，就不需要继续匹配了。    

顺便再利用下string的分割方法， 可以将代码写为:     


```javascript
let strStr = function(haystack, needle) {
    if (needle === "") {
        return 0
    }

    if (haystack === "" || needle.length > haystack.length) {
        return -1
    }

    for (let hayIndex = 0; hayIndex + needle.length <= haystack.length; hayIndex ++) {
        sub = haystack.substring(hayIndex, hayIndex + needle.length)
        if (sub === needle) {
            return hayIndex
        }
    }

    return -1
}
```    

时间复杂度 变成了 O(len(haystack) - len(needle))*len(haystack) 暂且算为 O(n-m)*m, 确实比上面的算法 少了m*m的 复杂度      

## 办法 3

这个办法就是我在网上查的了， 人家大佬们就是比我这种人强， 能想出那么牛逼的办法，把时间复杂度降低到了 O(n), 严格来说是 O(2*m) + O(n)     

这个办法就是KMP算法。 KMP的算法宗旨是 再不回溯haystack的位置情况下找出问题的解决办法      

下面我们举个例子    

```
hasytack:   a g c d a g c e a 
needle  :   a g c e
```

当比对到 d != e 的时候，使用KMP算法可以快速移动needle, 使得一下子就成为以下状态     


```
hasytack:   a g c d a g c e a 
needle  :         a g c e
```

我们可以把移动抽象成一个函数出来，写出来的代码效果应该是这样的:    

```javascript

var next = function(needle, j) {
    // 巴拉巴拉
}

var strStr = function(haystack, needle) {
    let i = 0
    let j = 0
    while(i < haystack.length && j < needle.length) {
        if (haystack[i] === needle[j]) {
            i ++
            j ++
        } else {
            j = next(needle, j)
        }
    }

    if (j == needle.length) {
        return i - j
    }

    return -1
}
```

所以最终就是要想怎么解决`next`函数的问题。。。。     

先抛开next函数不谈， 我们继续讨论 `当比对到 d != e 的时候，使用KMP算法可以快速移动needle, 使得一下子就成为以下状态` 这句话    

假设 haystack[i] != needle[j] ,则 肯定有 haystack[i-j] ~ haystack[i-1] === needle[0] ~ needle[j-1]       

假设 needle中存在一个位置k, 使得 needle[0] ~ needle[k] === haystack[i-1-k] ~ haystack[i-1], 则needle[0] ~ needle[k]一定和needle[j-1-k]~needle[j-1] 相等，即 needle[0]~needle[k] === needle[i-1-k]~needle[j-1]      

所以只要知道这个k值， 就可以把needle串向后移动k个那么长， 也就是把j像前移动j-k的位置，便是j的新位置。     

计算needle穿的k值如下:    

```javascript
var calculateK = function(needle){
    var result = new Array()
    result[0] = 0

    for(let i = 1; i < needle.length; i++) {
        // k 是子串的长度
        let k = result[i-1]

        while (needle[k] != needle[i] && k != 0) {
            k = result[k-1]
        }

        if (needle[k] == needle[i]) {
            result[i] = k+1
        } else {
            result[i] = 0
        }
    }

    return result
}
```

我们把上面两个算法整合一下，结果是 

```javascript
var calculateK = function(needle){
    var result = new Array()
    result[0] = 0

    for(let i = 1; i < needle.length; i++) {
        // k 是子串的长度
        let k = result[i-1]

        while (needle[k] != needle[i] && k != 0) {
            k = result[k-1]
        }

        if (needle[k] == needle[i]) {
            result[i] = k+1
        } else {
            result[i] = 0
        }
    }

    return result
}

var strStr = function(haystack, needle) {
    let i = 0
    let j = 0
    next = calculateK(needle)

    while(i < haystack.length && j < needle.length) {
        if (haystack[i] === needle[j]) {
            i ++
            j ++
        } else if (j === 0){
            i ++
        } else {
            j = next[j - 1]
        }
    }

    if (j == needle.length) {
        return i - j
    }

    return -1
}
```



# 参考资料

> [KMP算法的前缀next数组最通俗的解释，如果看不懂我也没辙了](https://blog.csdn.net/yearn520/article/details/6729426)      
> [从头到尾彻底理解KMP](https://blog.csdn.net/v_july_v/article/details/7041827)      
> [字符串匹配的KMP算法](http://www.ruanyifeng.com/blog/2013/05/Knuth%E2%80%93Morris%E2%80%93Pratt_algorithm.html)      