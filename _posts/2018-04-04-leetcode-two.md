---
layout: post
title: "LeetCode 20 21 26 27 28"
description: "一切又重新开始，像第一次那样"
categories: [LeetCode]
tags: [algorithm]
---

* Kramdown table of contents
{:toc .toc}

# 20 Valid Parentheses

```javascript
function Stack() {
    this.size = 0
    this.stackArray = new Array()

    this.push = function (s) {
        this.stackArray.push(s)
        this.size ++
    }

    this.peek = function (s) {
        return this.stackArray[this.size - 1]
    }

    this.pop = function (s) {
        this.size --
        return this.stackArray.pop()
    }

    this.clear = function () {
        this.size = 0
        this.stackArray = new Array()
    }

    this.isEmpty = function () {
        return this.size === 0
    }

    this.getStackSize = function () {
        return this.size
    }

    this.getStackArray = function () {
        return this.stackArray
    }

    this.printStack = function () {
        console.log(this.stackArray)
    }
}

const maps = {
    '}':'{',
    ')':'(',
    ']':'['
}

/**
 * @param {string} s
 * @return {boolean}
 */
var isValid = function(s) {
    var stack = new Stack()
    for(var i = 0; i < s.length; i++) {
        if(stack.isEmpty()) {
            stack.push(s[i])
        }else{
            stackPeek = stack.peek()
            if(stackPeek === maps[s[i]]){
                stack.pop()
            }else{
                stack.push(s[i])
            }
        }
    }

    return stack.isEmpty()
};

result = isValid("([{}]){}")

console.log(result)
```

> 初学javascript，没有找到现成的栈包，自己简单的实现了一个，使用栈做这题很简单    

# 21 Merge Two Sorted Lists

```javascript
/**
 * Definition for singly-linked list.
 */
function ListNode(val) {
    this.val = val;
    this.next = null;
}

function NodeList() {
    this.headNode = null
    this.nowNode = null
    this.size = 0

    this.initByListNode = function (l1) {
        this.headNode = l1
        this.nowNode = this.initNowNode(this.headNode)
        this.size = this.initSize(this.headNode)
    }

    this.initSize = function (l1) {
        var size = 0
        var nowNode = l1
        while(nowNode !== null) {
            size ++
            nowNode = nowNode.next
        }

        return size
    }

    this.initNowNode = function(l1){
        var nowNode = l1
        while (nowNode !== null && nowNode.next !== null){
            nowNode = nowNode.next
        }

        return nowNode
    }

    this.pushNode = function (val) {
        var newNode = new ListNode()
        newNode.val = val
        newNode.next = null

        if(this.size == 0) {
            this.headNode = this.nowNode = newNode
            this.size ++
        }else{
            this.nowNode.next = newNode
            this.nowNode = this.nowNode.next
            this.size ++
        }
    }

    this.pushListNode = function (l) {
        if(this.nowNode === null){
            this.headNode = l.getFirstNode()
            this.nowNode = l.getFirstNode()
        }else{
            this.nowNode.next = l.getFirstNode()
            this.nowNode = l.getNowNode()
        }
        
        this.size += l.getListSize()
    }

    this.printList = function () {
        var printNowNode = this.headNode
        while(printNowNode != null) {
            console.log(printNowNode.val)
            printNowNode = printNowNode.next
        }
    }

    this.getHeadNode = function () {
        return this.headNode
    }

    this.getListSize = function () {
        return this.size
    }

    this.getFirstNode = function () {
        return this.headNode
    }

    this.getNowNode = function () {
        return this.nowNode
    }

    this.getContentToList = function (){
        result = []
        var printNowNode = this.headNode
        while(printNowNode != null) {
            result.push(printNowNode.val)
            printNowNode = printNowNode.next
        }
        return result
    }

    this.popFirstNode = function () {
        var firstNode = this.headNode
        if (this.size !== 0) {
            this.headNode = this.headNode.next
            this.size --
        }

        return firstNode
    }
}

/**
 * @param {ListNode} l1
 * @param {ListNode} l2
 * @return {ListNode}
 */
var mergeTwoLists = function(l1, l2) {
    var resultList = new NodeList()

    var l1NodeList = new NodeList()
    l1NodeList.initByListNode(l1)

    var l2NodeList = new NodeList()
    l2NodeList.initByListNode(l2)

    while(l1NodeList.getFirstNode() !== null && l2NodeList.getFirstNode() !== null) {
        if(l1NodeList.getFirstNode().val <= l2NodeList.getFirstNode().val) {
            resultList.pushNode(l1NodeList.popFirstNode().val)
        }else{
            resultList.pushNode(l2NodeList.popFirstNode().val)
        }
    }

    console.log(l1NodeList.getContentToList(), l2NodeList.getContentToList())
    if(l1NodeList.getListSize() !== 0) {
        resultList.pushListNode(l1NodeList)
    }else if(l2NodeList.getListSize() !== 0) {
        resultList.pushListNode(l2NodeList)
    }

    resultList.printList()
    return resultList.getContentToList()
};

```

> 这个自己封装了个LinkList， 也是处于练手的状态， 不过写出来蛮难看的，来看看大神们对于这个题的解决办法    
> 对于链表的实现，真心想了好久， 总结一下， 至少要有两个节点来创建链表， head, now, 并且初始化 now = head = null; 每次增加一个元素只要看 now节点就可以了。     
> 好牛逼的递归运算.....

```java
public class Solution {
    public ListNode mergeTwoLists(ListNode l1, ListNode l2) {
        if(l1 == null){
            return l2;
        }
        if(l2 == null){
            return l1;
        }
        
        ListNode mergeHead;
        if(l1.val < l2.val){
            mergeHead = l1;
            mergeHead.next = mergeTwoLists(l1.next, l2);
        }
        else{
            mergeHead = l2;
            mergeHead.next = mergeTwoLists(l1, l2.next);
        }
        return mergeHead;
    }
}
```

# 26 Remove Duplicates from Sorted Array

```javascript
var removeOneIndex = function(nums, numsLength, i) {
    if( i >= nums.length - 1){
        return nums.length
    }

    for(i; i+1 < nums.length; i++){
        nums[i] = nums[i+1]
    }

    return numsLength - 1
}

/**
 * @param {number[]} nums
 * @return {number}
 */
var removeDuplicates = function(nums) {
    numsLength = nums.length
    var i = 0
    for(;i < numsLength;){
        if(i === 0){
            i++
            continue
        }

        if(nums[i] === nums[i-1]){
            numsLength = removeOneIndex(nums, numsLength, i-1)
            continue
        }

        i++
    }

    return numsLength
};
```

> 这道题说不允许开额外的空间，即空间为O(1), 但是没有限制时间复杂度， 所以就用 时间换空间 的方法， 手动模拟删除一个数组制定位置上的数字 即 [1,2,3,4,5] 删除index==2 为 [1,2,4,5,5] numsLength = 4 来实现伪删除...    
> 看了大神的Discuss， 我才发现我的笨拙， 一个数组可以当作两个数组来处理， 两个指针分别工作即可

```java
public class Solution {
    public int removeDuplicates(int[] A) {
        if (A == null || A.length == 0) {
            return 0;
        }
        
        int size = 0;
        for (int i = 0; i < A.length; i++) {
            if (A[i] != A[size]) {
                A[++size] = A[i];
            }
        }
        return size + 1;
    }
}
```

# 27 Remove Element

```javascript
/**
 * @param {number[]} nums
 * @param {number} val
 * @return {number}
 */
var removeElement = function(nums, val) {
    var newNumberIndex = 0
    var newNumberLength = 0
    
    for(let i = 0; i < nums.length; i++) {
        if(nums[i] != val) {
            nums[newNumberIndex] = nums[i]
            newNumberIndex ++
            newNumberLength ++
        }
    }

    return newNumberLength
};
```

> 这个与上一题差不多，所以在上一题的教训， 这一题不会再犯了....


# 28 Implement strStr()

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

/**
 * @param {string} haystack
 * @param {string} needle
 * @return {number}
 */
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

> 上面这种解题方法 是我最一开始就想到的解决办法， 属于暴力求解， 从第一个字符开始匹配， 如果匹配的上就继续匹配下一个字符， 如果匹配不上， 就将字符位置向后移动一位之后再次继续从头匹配 复杂度 O(m * n)     
> 提交之后发现超时了， 所以我就知道这个题不是那么简单， 于是我又思考了下， 写出了下面的代码      


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

> 这一趴代码变得如此简单， 思路呢， 就是从把haystack从0位置遍历， 然后从index位置截取needle串那么长， 然后比对截取的串和needle是否一样， 如果一样则返回index， 不一样就继续，直到找到或者 `haystack.length - index < needle.length` 为止 O(m-n)*n       
> 后来在网上查了下，这个又更好的办法 使用KMP算法， 请看我的这篇文章 ![占位]()