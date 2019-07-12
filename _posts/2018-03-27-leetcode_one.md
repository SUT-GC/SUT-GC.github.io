---
layout: post
title: "LeetCode 1 7 9 13 14"
description: "一切又重新开始，像第一次那样"
categories: [LeetCode]
tags: [algorithm]
---

* Kramdown table of contents
{:toc .toc}

# 1 Two Sum

```javascript
var twoSum = function(nums, target) {
    result = [];

    loop_out:
    for(var i = 0; i < nums.length; i++){
        for(var j = 0; j < nums.length; j++){
            if(j === i){
                continue;
            }

            if((nums[i] + nums[j]) === target){
                result[0] = i;
                result[1] = j;
                break loop_out;
            }
        }
    }
    return result;
};

(function(){
    numbers = [3,2,4]
    target = 6
    result = twoSum(numbers, target)
    console.log(result)
})()

```

> 第一题一般都是比较简单的， 但简单归简单， 容易犯“经验错误”， 由于轻视了这道题， 所以第一次思路竟然去给数组排序，哎～    
> 下面附上在Discuss中找到的O(n)的算法

```java
public int[] twoSum(int[] numbers, int target) {
    int[] result = new int[2];
    Map<Integer, Integer> map = new HashMap<Integer, Integer>();
    for (int i = 0; i < numbers.length; i++) {
        if (map.containsKey(target - numbers[i])) {
            result[1] = i + 1;
            result[0] = map.get(target - numbers[i]);
            return result;
        }
        map.put(numbers[i], i + 1);
    }
    return result;
}
```

# 7 Reverse Integer

```javascript
/**
 * @param {number} x
 * @return {number}
 */
var reverse = function(x) {
    xStr = x.toString();
    
    resultStr = '';

    if(xStr[0] === '-'){
        resultStr += '-';
    }

    var notZero = false
    for(var i=xStr.length-1; i >= 0; i--){
        if(xStr[i] === '-'){
            continue
        }

        if(xStr[i] !==  '0'){
            notZero = true
        }

        if(!notZero){
            continue
        }

        resultStr += xStr[i]
    }
   resultInt = Number(resultStr) 

   if(resultInt > 2147483647 || resultInt < -2147483648){
       resultInt = 0
   }

   return resultInt
};
```

> 这个题我是当作模拟题来做的，但是看了Discuss里大神的写法，才知道 % 才是王道     
> 科普一个知识 `-1 % 10 == -1`  `-123 % 10 == -3` 

```java
public int reverse(int x) {
    long rev= 0;
    while( x != 0){
        rev= rev*10 + x % 10;
        x= x/10;
        if( rev > Integer.MAX_VALUE || rev < Integer.MIN_VALUE)
            return 0;
    }
    return (int) rev;
}
```

# 9 Palindrome Number 

```javascript
/**
 * @param {number} x
 * @return {boolean}
 */
var isPalindrome = function(x) {
    if(x !== 0 && x % 10 === 0){
        return false
    }
    var revX = 0
    while(x > revX){
        revX = 10 * revX + x % 10
        x = x / 10
        x = Number.parseInt(x)
    }    

    if(x === revX || x === Number.parseInt(revX / 10)){
        return true
    }else{
        return false
    }
};
```

> 这个题是确定一个数字是否是回文数， 其实有两种思路：    
> * 一种是将整数转换成字符串进行比对
> * 一种是用取mod的方法反转整数，当然不需要全部反转，只需要当 反转之后的数 >= 剩余的数即可
> * 反转结果有几种 :    
> 2. 1221 -> 12 and 12    
> 3. 12321 -> 12 and 123    
> 所以要有 `(x === revX || x === Number.parseInt(revX / 10))` ps: 因为javascript没有像java那种整数除法截断的特性，所以用 Number.parseInt 来强制转换为整数        
> 特别注意 0, 10的倍数等    

# 13 Roman to Integer

```javascript
/**
 * @param {string} s
 * @return {number}
 */

var romanToInt = function(s) {
    singleDigit = {'I':1, 'II':2, 'III':3, 'IV':4, 'V':5, 'VI':6, 'VII':7, 'VIII':8, 'IX':9}
    tenDigit = {'X':10, 'XX':20, 'XXX':30, 'XL':40, 'L':50, 'LX':60, 'LXX':70, 'LXXX':80, 'XC':90}
    hundredsDigit = {'C':100, 'CC':200, 'CCC':300, 'CD':400, 'D':500, 'DC':600, 'DCC':700, 'DCCC':800, 'CM':900}
    thousandDigit = {'M':1000, 'MM':2000, 'MMM':3000}

    var resultNumber = 0

    var addNumber = 0
    var deleteRomanIndex = 0
    for(var key in thousandDigit){
        if(s.startsWith(key)){
            addNumber = thousandDigit[key] 
            deleteRomanIndex = key.length
        }
    }

    resultNumber += addNumber
    s = s.substr(deleteRomanIndex)

    var addNumber = 0
    var deleteRomanIndex = 0
    for(var key in hundredsDigit){
        if(s.startsWith(key)){
            addNumber = hundredsDigit[key] 
            deleteRomanIndex = key.length
        }
    }

    resultNumber += addNumber
    s = s.substr(deleteRomanIndex)

    var addNumber = 0
    var deleteRomanIndex = 0
    for(var key in tenDigit){
        if(s.startsWith(key)){
            addNumber = tenDigit[key] 
            deleteRomanIndex = key.length
        }
    }

    resultNumber += addNumber
    s = s.substr(deleteRomanIndex)
             

    var addNumber = 0
    for(var key in singleDigit){
        if(s.startsWith(key)){
            addNumber = singleDigit[key] 
            deleteRomanIndex = key.length
        }
    }

    resultNumber += addNumber
    return resultNumber 
      
};

```

> 比较蠢，没想到什么太好的想法，把各位都枚举出来     
> 膜拜一下大神的想法吧     

```java
public int romanToInt(String s) {
     int sum=0;
    if(s.indexOf("IV")!=-1){sum-=2;}
    if(s.indexOf("IX")!=-1){sum-=2;}
    if(s.indexOf("XL")!=-1){sum-=20;}
    if(s.indexOf("XC")!=-1){sum-=20;}
    if(s.indexOf("CD")!=-1){sum-=200;}
    if(s.indexOf("CM")!=-1){sum-=200;}
    
    char c[]=s.toCharArray();
    int count=0;
    
   for(;count<=s.length()-1;count++){
       if(c[count]=='M') sum+=1000;
       if(c[count]=='D') sum+=500;
       if(c[count]=='C') sum+=100;
       if(c[count]=='L') sum+=50;
       if(c[count]=='X') sum+=10;
       if(c[count]=='V') sum+=5;
       if(c[count]=='I') sum+=1;
       
   }
   
   return sum;
    
}
```

# 14 Longest Common Prefix

```javascript
/**
 * @param {string[]} strs
 * @return {string}
 */
var longestCommonPrefix = function(strs) {
    var commonPrefix = ""
    outLoop:
    for(var i = 0; i < 1000; i++){
        oneIndexCommon = ""
        for(var j = 0; j < strs.length; j++){
            if(strs[j].length <= i){
                break outLoop
            }
            if(j === 0){
                oneIndexCommon = strs[j][i]
            }else{
                if(strs[j][i] !== oneIndexCommon){
                    break outLoop
                }
            }   
        }
        commonPrefix += oneIndexCommon
    }

    return commonPrefix
};
```

> 当作模拟题做的，一个人工找公共前缀的方法, 看了下大神们的解题思路，发现倒着找真的是很容易呀~    

```java
public String longestCommonPrefix(String[] strs) {
    if(strs == null || strs.length == 0)    return "";
    String pre = strs[0];
    int i = 1;
    while(i < strs.length){
        while(strs[i].indexOf(pre) != 0)
            pre = pre.substring(0,pre.length()-1);
        i++;
    }
    return pre;
}
```
