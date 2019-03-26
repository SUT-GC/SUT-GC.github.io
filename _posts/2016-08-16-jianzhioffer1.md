---
layout: post
title: "剑指Offer笔记<JAVA版>（一）"
description: "剑指Offer笔记<JAVA版>（一）"
categories: [面试]
tags: [java]
---

* Kramdown table of contents
{:toc .toc}

# 剑指offer笔记（JAVA实现）

## 1  面试流程

### 1.1 star法则

* S: 简单的项目背景，比如项目的规模，开发软件的功能和目标用户
* T: 自己完成的任务，了解好“参与”与“负责”
* A: 为了完成任务，自己做了哪些工作，是怎么做的。可以介绍特点，平台，技术。
* R: 写自己的贡献，比如完成任务的多少，时长，修改了多少bug，做了什么优化。

### 1.2 面试官喜欢针对项目问的问题

* 你在项目中遇到的最大的问题是什么，你是怎么解决的
* 在这个项目中，你学到了什么。
* 什么时候会和其他成员有什么冲突，你是怎么解决的。

### 1.3 面试题

#### 1.3.1 找出一个链表的倒数第k个数

```java
package Chapter1;

class Node{
    private int value;
    public Node next;
    public void setValue(int value){
        this.value = value;
    }
    public int getValue(){
        return this.value;
    }
}
public class TheKNumInLast {
    public static Node createList(int num){
        if(num == 0){
            return null;
        }
        Node head = new Node();
        //切记，只有指针指向对内存才能存在说 head与now同时指向一个内存
        //如果head = null； now = head；now = new Node()
        //这样head与now并不能指向同一块内存，head还是=null
        Node now = head;
        for(int i=1; i<num; i++){
            now.setValue(i);
            now.next = new Node();
            now = now.next;
        }
        now.setValue(num);
        return head;
    }
    
    public static int printList(Node head){
        int count = 0;
        if(head == null){
            System.out.println("this list is empty !");
            return count;
        }
        while(true){
            count ++;
            System.out.println(head.getValue());
            if(head.next == null){
                break;
            }else{
                head = head.next;
            }
        }
        return count;
    }
    
    public static int findK(int k, Node head) throws Exception{
        int kValue = 0;
        if(head == null){
            throw new Exception("传入的链表不能为空");
        }
        if(printList(head) < k){
            throw new Exception("传入的链表长度不足K");
        }
        Node pre = head;
        Node aft = head;
        for(int i = 1; i < k; i++){
            aft = aft.next;
        }
        while(aft.next != null){
            pre = pre.next;
            aft = aft.next;
        }
        kValue = pre.getValue();
        return kValue;
    }
    
    public static void main(String[] args) {
        Node head = createList(15);
        System.out.println(printList(head));
        try {
            System.out.println("the last k max = "+findK(5, head));
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

}

```

#### 1.3.2 四种实现singleton模式

```java
//懒汉模式
class SingletonL{
    private static SingletonL a;
    public static SingletonL getSingletonL(){
        a = new SingletonL();
        return a;
    }
}
//恶汉模式
class SingletonE{
    private static SingletonE a = new SingletonE();
    public static SingletonE getSingletonE(){
        return a;
    }
}
//双重检查模式
class SingletonS{
    private static SingletonS a;
    public static SingletonS getSingletonS(){
        if(a == null){
            synchronized(SingletonE.class){
                if(a == null){
                    a = new SingletonS();
                }
            }
        }
        return a;
    }
}
//使用内部类
class SingletonN{
    private static class Neibu{
        public static SingletonN a = new SingletonN();
    }
    public static SingletonN getSingletonN(){
        return Neibu.a;
    }
}
```

#### 1.3.3 在二维有序数组里查找
```java
| 1 2 8 9     |
| 2 4 9 12    |
| 4 7 10 13   |
| 6 8 11 15   |
| 12 17 19 20 |

在其中查找 7
```

```java
package Chapter2;

public class FindNumIn2 {
    public static int[] findNum(int[][] a, int key){
        int[] pos = {-1,-1};
        if(a == null || a.length == 0){
            return pos;
        }
        
        int lie = a.length;
        int hang = a[0].length;
        int i = hang -1;
        int j = 0;
        for(; i >= 0 && j < lie; ){
            if(key < a[j][i]){
                i--;
                continue;
            }
            if(key > a[j][i]){
                j++;
                continue;
            }
            if(key == a[j][i]){
                pos[0] = j+1;
                pos[1] = i+1;
                break;
            }
        }
        
        return pos;
    }
    public static void main(String[] args) {
        int[][] a = {
                {1,2,8,9},
                {2,4,9,12},
                {4,7,10,13},
                {6,8,11,15},
                {12,17,19,20}
        };
        int[] pos = findNum(a, 7);
        System.out.println("("+pos[0]+" , "+pos[1]+")");
    }
}

```

> 博客迁移自 [GC-CSDN](http://blog.csdn.net/GC_chao/article/details/52224481)