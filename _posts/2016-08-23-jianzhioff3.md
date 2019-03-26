---
layout: post
title: "剑指Offer笔记<JAVA版>（三）"
description: "剑指Offer笔记<JAVA版>（三）"
categories: [面试]
tags: [java]
---

* Kramdown table of contents
{:toc .toc}

# 1.3.18 定义一个栈的数据结构，实现min（找出栈中最小的元素），pop，add函数，并且要求三个函数的时间复杂度都是O（1）

```javas
package Chapter4;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedList;

public class HasMinFStack {
    LinkedList<Integer> minStack = null;
    LinkedList<Integer> stack = null;
    public HasMinFStack(){
        minStack = new LinkedList<>();
        stack = new LinkedList<>();
    }
    public void add(int num){
        if(minStack.isEmpty() && stack.isEmpty()){
            stack.addLast(num);
            minStack.addLast(num);
        }else{
            stack.add(num);
            if(minStack.getLast() >= num){
                minStack.addLast(num);
            }else{
                minStack.addLast(minStack.getLast());
            }
        }
    }
    public int pop() throws Exception{
        if(!stack.isEmpty() && !minStack.isEmpty()){
            minStack.removeLast();
            return stack.removeLast();
        }else{
            throw new Exception("this stack is empty");
        }
    }
    public int getMin() throws Exception{
        if(!minStack.isEmpty()){
            return minStack.getLast();
        }else{
            throw new Exception("this stack is empty");
        }
    }
}

```
测试类
```java
package test.Chapter4;

import static org.junit.Assert.*;

import org.junit.Test;

import Chapter4.HasMinFStack;

public class HasMinFStackTest {

    @Test
    public void test() {
        HasMinFStack hasMinFStack = new HasMinFStack();
        hasMinFStack.add(10);
        hasMinFStack.add(2);
        hasMinFStack.add(5);
        hasMinFStack.add(1);
        hasMinFStack.add(1);
        hasMinFStack.add(3);
        hasMinFStack.add(4);
        try {
            System.out.println("min = "+hasMinFStack.getMin());
            System.out.println("pop = "+hasMinFStack.pop());
            System.out.println("pop = "+hasMinFStack.pop());
            System.out.println("pop = "+hasMinFStack.pop());
            System.out.println("min = "+hasMinFStack.getMin());
            System.out.println("pop = "+hasMinFStack.pop());
            System.out.println("min = "+hasMinFStack.getMin());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

}
//====输出======
/*
min = 1
pop = 4
pop = 3
pop = 1
min = 1
pop = 1
min = 2
*/
```

# 1.3.19  输入两个整数序列，第一个序列表示栈的压入顺序，请判断第二个序列是否是第一个序列的弹出顺序。

```java
package Chapter4;

import java.util.LinkedList;

public class IsTrueOrder {
    private static LinkedList<Integer> stack = new LinkedList<>();
    
    public static boolean isTrueOrder(int[] pushOrder, int[] popOrder){
        boolean result = false;
        if(pushOrder == null || popOrder == null)
            return result;
        stack.clear();
        int i = 0;
        int j = 0;
        //第一步，一开始是空栈，所以先把第一个出栈元素（包括）之前的元素都入栈，并且把i指到入栈顺序的下一个位置。
        //push: 1,2,3,4,5
        //pop: 4,5,3,2,1
        //stack: 1,2,3,4   push[i] = 5  pop[j] = 4
        for(;i<pushOrder.length; i++){
            stack.addLast(pushOrder[i]);
            if(pushOrder[i] == popOrder[j]){
                i++;
                break;
            }
        }
        //2 如果push还没有全部入栈，则将push想办法全部入栈
        //  2.1 当然，在这部分：
        //      如果栈顶元素与pop[j]的元素相同，则移除栈顶元素 j++ 
        //      如果栈顶元素与pop[j]的元素不同，则把push还没有入栈的元素（所以上面进行了i++）一直入栈，直到栈顶元素与pop[j]元素相同
        //  一直循环2.1步
        //执行完这步，就会将push全部入栈
        while(i < pushOrder.length){
            if(stack.getLast() == popOrder[j]){
                stack.removeLast();
                j++;
            }else{
                for(;i<pushOrder.length; i++){
                    stack.addLast(pushOrder[i]);
                    if(pushOrder[i] == popOrder[j]){
                        i++;
                        break;
                    }
                }
            }
        }
        //检查栈是不是为空，如果不为空，则判断栈顶与pop[j]是否相同，如果相同:j++，栈弹出之后再判断栈顶与pop[j]是否相同，直到不同return flase 或者栈空return true
        while(!stack.isEmpty()){
            if(stack.getLast() == popOrder[j]){
                stack.removeLast();
                j++;
            }else{
                result = false;
                break;
            }
        }
        if(stack.isEmpty()){
            result = true;
        }
        return result; 
    }
}
```
测试类
```java
package test.Chapter4;

import static org.junit.Assert.*;

import org.junit.Test;

import Chapter4.IsTrueOrder;

public class IsTrueOrderTest {

    @Test(timeout=2000)
    public void test() {
        int[] pushOrder = {1,2,3,4,5};
        int[] popOrder = {4,5,3,2,1};
        int[] popOrder2 = {4,3,5,1,2};
        assertEquals(true, IsTrueOrder.isTrueOrder(pushOrder, popOrder));
        assertEquals(false, IsTrueOrder.isTrueOrder(pushOrder, popOrder2));
    }

}

```


# 1.3.20 输入一个二叉树和一个整数，打印出二叉树中某一路径所以节点的和等于该整数的路径。

```java
//测试用例
package test.Chapter4;

import static org.junit.Assert.*;

import org.junit.Before;
import org.junit.Test;

import Chapter2.BinaryTreeNode;
import Chapter4.PathSum;

public class PathSumTest {
    private BinaryTreeNode root = null;
    @Before
    public void initBinaryTree(){
        root = new BinaryTreeNode();
        root.setValue(10);
        
        root.leftNode = new BinaryTreeNode();
        root.leftNode.setValue(5);
        root.rightNode = new BinaryTreeNode();
        root.rightNode.setValue(12);

        root.leftNode.leftNode = new BinaryTreeNode();
        root.leftNode.leftNode.setValue(4);
        root.leftNode.rightNode = new BinaryTreeNode();
        root.leftNode.rightNode.setValue(7);
    }
    @Test
    public void test() {
        PathSum.PathSumToANum(22, root);
    }

}



//========================================

//实现代码
package Chapter4;

import java.util.ArrayList;

import Chapter2.BinaryTreeNode;
import Chapter2.BinaryTreeNodeCode;

public class PathSum {
    public static void PathSumToANum(int num, BinaryTreeNode root){
        ArrayList<BinaryTreeNodeCode> stack = new ArrayList<>();
        if(root != null){
            stack.add(new BinaryTreeNodeCode(root, 1));
        }
        while(!stack.isEmpty()){
            BinaryTreeNodeCode peek = stack.get(stack.size()-1);
            if(peek.getCode() == 1){
                peek.setCode(2);
                if(peek.getBinaryTreeNode().leftNode != null){
                    stack.add(new BinaryTreeNodeCode(peek.getBinaryTreeNode().leftNode, 1));
                }
            }else if(peek.getCode() == 2){
                peek.setCode(3);
                if(peek.getBinaryTreeNode().rightNode != null){
                    stack.add(new BinaryTreeNodeCode(peek.getBinaryTreeNode().rightNode, 1));
                }
            }else{
                int sum = 0;
                for(BinaryTreeNodeCode node:stack){
                    sum += node.getBinaryTreeNode().getValue();
                }
                if(sum == num){
                    for(BinaryTreeNodeCode node:stack){
                        System.out.print(node.getBinaryTreeNode().getValue()+" ");
                    }
                    System.out.println();
                }
                    
                stack.remove(stack.size()-1);
                
            }
        }
        
    }
}

```

# 1.3.21 复杂链表的复制
```java
//================测试用例=================
package test.Chapter4;

import static org.junit.Assert.*;

import org.junit.Before;
import org.junit.Test;

import Chapter4.CloneComplexList;
import Chapter4.ComplexNode;

public class ComplexNodeTest {
    private ComplexNode oldNode = null;
    @Before
    public void initOldNode(){
        oldNode = new ComplexNode();
        oldNode.setValue(1);
        
        oldNode.next = new ComplexNode();
        oldNode.next.setValue(2);
        
        oldNode.next.next = new ComplexNode();
        oldNode.next.next.setValue(3);
        oldNode.sibling = oldNode.next.next;
        
        oldNode.next.next.next = new ComplexNode();
        oldNode.next.next.next.setValue(4);
        oldNode.next.next.next.sibling = oldNode.next;
        
        //1 -> 2 -> 3 -> 4
        //1 -> 3
        //4 -> 2
    }
    @Test(timeout=2000)
    public void test() {
        ComplexNode newRoot = CloneComplexList.cloneComplexList(oldNode);
        System.out.println(oldNode.next == newRoot.next);
        ComplexNode nowNewNode = newRoot;
        ComplexNode nowOldNode = oldNode;
        
        System.out.println("====== new List ======");
        while(nowNewNode != null){
            System.out.println(nowNewNode+" ; "+nowNewNode.sibling);
            nowNewNode = nowNewNode.next;
        }
        System.out.println("====== old List ======");
        while(nowOldNode != null){
            System.out.println(nowOldNode+" ; "+nowOldNode.sibling);
            nowOldNode = nowOldNode.next;
        }
    }

}


//=================输出==================
map : Chapter4.ComplexNode@44287d38----Chapter4.ComplexNode@4aef9bcd
map : Chapter4.ComplexNode@4ed01648----Chapter4.ComplexNode@bd291f6
map : Chapter4.ComplexNode@c94ec09----Chapter4.ComplexNode@3a933fa5
map : Chapter4.ComplexNode@743f1ce9----Chapter4.ComplexNode@6bfd6eb9
false
====== new List ======
Chapter4.ComplexNode@4aef9bcd ; Chapter4.ComplexNode@3a933fa5
Chapter4.ComplexNode@bd291f6 ; null
Chapter4.ComplexNode@3a933fa5 ; null
Chapter4.ComplexNode@6bfd6eb9 ; Chapter4.ComplexNode@bd291f6
====== old List ======
Chapter4.ComplexNode@44287d38 ; Chapter4.ComplexNode@c94ec09
Chapter4.ComplexNode@4ed01648 ; null
Chapter4.ComplexNode@c94ec09 ; null
Chapter4.ComplexNode@743f1ce9 ; Chapter4.ComplexNode@4ed01648


//=================实现代码 （第一种方法） ===============
package Chapter4;

import java.util.HashMap;
import java.util.Map;

import Chapter1.Node;

public class CloneComplexList {
    public static Node cloneList(Node root){
        if(root == null){
            return null;
        }
        
        Node newRoot = new Node();
        
        Node nowNewNode = newRoot;
        Node nowOldNode = root;
        
        while(nowOldNode != null){
            nowNewNode.setValue(nowOldNode.getValue());
            
            nowOldNode = nowOldNode.next;
            if(nowOldNode != null){
                nowNewNode.next = new Node();
                nowNewNode = nowNewNode.next;
            }
        }
        
        return newRoot;
    }
    
    public static ComplexNode cloneComplexList(ComplexNode root){
        if(root == null){
            return null;
        }
        ComplexNode newRoot = new ComplexNode();
        Map<ComplexNode, ComplexNode> nodeMap = new HashMap<>();
        
        /*
         * 先复制基础链表节点
         */
        {
            
            ComplexNode nowNewNode = newRoot;
            ComplexNode nowOldNode = root;
            
            while(nowOldNode != null){
                nowNewNode.setValue(nowOldNode.getValue());
                System.out.println("map : "+nowOldNode+"----"+nowNewNode);
                nodeMap.put(nowOldNode, nowNewNode);
                
                nowOldNode = nowOldNode.next;
                if(nowOldNode != null){
                    nowNewNode.next = new ComplexNode();
                    nowNewNode = nowNewNode.next;
                }
            }
        }
        
        //开始复制复杂节点
        {
            ComplexNode nowOldNode = root;
            ComplexNode nowNewNode = newRoot;
            while(nowOldNode != null){
                if(nowOldNode.sibling != null){
                    nowNewNode.sibling = nodeMap.get(nowOldNode.sibling);
                }
                nowOldNode = nowOldNode.next;
                nowNewNode = nowNewNode.next;
            }
        }
        
        return newRoot;
    }
}

```

# 1.3.22 将二叉排序树转换成双向链表

```java
//===========测试用例===========
package test.Chapter4;

import static org.junit.Assert.*;

import org.junit.Before;
import org.junit.Test;

import Chapter2.BinaryTreeNode;
import Chapter4.BinarySortTree;
import Chapter4.TwowayNode;

public class TwowayNodeTest {
    private BinaryTreeNode root;
    @Before
    public void initSortedBinaryTree(){
        root = new BinaryTreeNode();
        root.setValue(10);
        
        root.leftNode = new BinaryTreeNode();
        root.leftNode.setValue(6);
        root.rightNode = new BinaryTreeNode();
        root.rightNode.setValue(14);
        
        root.leftNode.leftNode = new BinaryTreeNode();
        root.leftNode.leftNode.setValue(4);
        root.leftNode.rightNode = new BinaryTreeNode();
        root.leftNode.rightNode.setValue(8);
        root.rightNode.leftNode = new BinaryTreeNode();
        root.rightNode.leftNode.setValue(12);
        root.rightNode.rightNode = new BinaryTreeNode();
        root.rightNode.rightNode.setValue(16);
        
    }
    @Test
    public void test() {
        BinaryTreeNode listHead = BinarySortTree.ConverByTreeRoot(root);
        System.out.println("head : "+listHead);
        while(listHead!=null){
            System.out.println(listHead+":"+listHead.getValue()+" ; "+listHead.leftNode+" ; "+listHead.rightNode);
            listHead = listHead.rightNode;
        }
    }

}


//===============输出结果================
head : Chapter2.BinaryTreeNode@4d405ef7
Chapter2.BinaryTreeNode@4d405ef7:4 ; null ; Chapter2.BinaryTreeNode@6193b845
Chapter2.BinaryTreeNode@6193b845:6 ; Chapter2.BinaryTreeNode@4d405ef7 ; Chapter2.BinaryTreeNode@2e817b38
Chapter2.BinaryTreeNode@2e817b38:8 ; Chapter2.BinaryTreeNode@6193b845 ; Chapter2.BinaryTreeNode@c4437c4
Chapter2.BinaryTreeNode@c4437c4:10 ; Chapter2.BinaryTreeNode@2e817b38 ; Chapter2.BinaryTreeNode@433c675d
Chapter2.BinaryTreeNode@433c675d:12 ; Chapter2.BinaryTreeNode@c4437c4 ; Chapter2.BinaryTreeNode@3f91beef
Chapter2.BinaryTreeNode@3f91beef:14 ; Chapter2.BinaryTreeNode@433c675d ; Chapter2.BinaryTreeNode@1a6c5a9e
Chapter2.BinaryTreeNode@1a6c5a9e:16 ; Chapter2.BinaryTreeNode@3f91beef ; null


//=================实现代码===================
package Chapter4;

import Chapter2.BinaryTreeNode;

public class BinarySortTree {
    public static BinaryTreeNode ConverByTreeRoot(BinaryTreeNode root){
        
        BinaryTreeNode lastNodeInList = null;
        lastNodeInList = conver(root, lastNodeInList);
        
        BinaryTreeNode headRoot = lastNodeInList;
        while(headRoot != null && headRoot.leftNode != null){
            headRoot = headRoot.leftNode;
        }
        return headRoot;
    }
    /*
     * 为什么要返回lastNodeInList：
     *  因为java在传递参数的时候是复制机制
     *  又因为传递的是引用，所以在栈中复制了另外一个引用B，跟实参A指向一个堆内存
     *  当B进行移动的时候，A是不移动的，所以函数里B的移动不能影响A
     *  所以每次都将移动的B重新传递给A
     */
    private static BinaryTreeNode conver(BinaryTreeNode root, BinaryTreeNode lastNodeInList){
        if(root == null){
            return null;
        }
        BinaryTreeNode currentNode = root;
        if(currentNode.leftNode != null){
            lastNodeInList = conver(currentNode.leftNode, lastNodeInList);
        }
        
        currentNode.leftNode = lastNodeInList;
        if(lastNodeInList != null)
            lastNodeInList.rightNode = currentNode;
        lastNodeInList = currentNode;
        
        if(currentNode.rightNode != null){
            lastNodeInList = conver(currentNode.rightNode, lastNodeInList);
        }
        
        return lastNodeInList;
    }
}

```

# 1.3.23 输入一个字符串，打印出该字符串中字符的所有排列

```java
//===========测试用例============
package test.Chapter4;

import static org.junit.Assert.*;

import org.junit.Test;

import Chapter4.SortString;

public class SortStringTest {

    @Test
    public void test() {
        SortString.sortString("abc");
    }

}


//===========输出==============
abc
acb
cab
cba
abc
acb


//==========实现代码============
package Chapter4;

public class SortString {
    public static void sortString(String str){
        if(str == null){
            return;
        }
        char[] chars = str.toCharArray();
        printString(chars, 0);
    }
    private static void printString(char[] chars, int pos){
        if(pos == chars.length){
            System.out.println(new String(chars));
            return;
        }
        for(int i = pos; i < chars.length; i++){
            char temp = chars[pos];
            chars[pos] = chars[i];
            chars[i] = temp;
            printString(chars, pos+1);
        }
    }
}

```

# 1.3.24 找出数组中出现次数超过一半的数字

```java
package Chapter5;

public class FindMoreNum {
    public static int findNumGrowMoreHalf(int[] nums) throws Exception{
        if(nums == null){
            throw new Exception("the nums can't == null");
        }
        int key = nums[0];
        int count = 1;
        for(int i = 1; i < nums.length; i++){
            if(nums[i] != key){
                count--;
            }
            if(count == 0){
                key = nums[i];
                count = 1;
            }
        }
        return key;
    }
    public static void main(String[] args) {
        int[] t1 = {1,2,3,2,2,2,5,4,2};
        int[] t2 = {1,1,1,1,2,2,2,2,2};
        int[] t3 = {1,2,1,2,1,2,1,2,1};
        int[] t4 = null;
        try {
            System.out.println(findNumGrowMoreHalf(t1));
            System.out.println(findNumGrowMoreHalf(t2));
            System.out.println(findNumGrowMoreHalf(t3));
            System.out.println(findNumGrowMoreHalf(t4));
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

//======输出=======
2
2
1
```

# 1.3.25 找出最小的K个数
```java
package Chapter5;

import java.util.Comparator;
import java.util.TreeSet;

public class FindMinimumK {
    /*
    本方法用java提供的TreeSet实现，TreeSet默认使用红黑树实现（存数是有序的），所以添加，删除，查找一个节点复杂度是O（logn） 所以整个代码的复杂度就是klogn
    */
    public static void findMininumKNums(int[] nums, int k){
        TreeSet<Integer> treeSet = new TreeSet<>();
        
        for(int n:nums){
            treeSet.add(n);
        }
        
        for(int i = 0; i < k; i++)
            System.out.println(treeSet.pollFirst());
    }
    public static void main(String[] args) {
        int[] a = {4,5,1,6,2,7,3,8};
        findMininumKNums(a, 3);
    }
}

//====输出=======
/*
1
2
3
*/
```
# 1.3.26 输入一个正整数数组，把数组里的所有数字拼接成一个数，打印出能拼接出的所有数字钟最小的一个

```java
package Chapter5;

import java.util.Arrays;
import java.util.Comparator;

public class SortnumsToMininum {
    public static void printTheMinOrder(Integer[] args) throws Exception{
        if(args == null){
            throw new Exception("the parameter can's be null");
        }
        Integer[] temp = Arrays.copyOf(args, args.length);
        Arrays.sort(temp, new Comparator<Integer>() {
            public int compare(Integer o1, Integer o2) {
                int a = Integer.parseInt(o1+""+o2);
                int b = Integer.parseInt(o2+""+o1);
                if(a > b){
                    return 1;
                }else if(a < b){
                    return -1;
                }else{
                    return 0;
                }
            };
        });
        for(int num:temp){
            System.out.print(num);
        }
        System.out.println();
    }
    public static void main(String[] args) {
        Integer[] num = {321,32,3};
        Integer[] num2 = {3,321,32};
        Integer[] num3 = {3,2,1};
        try {
            printTheMinOrder(num);
            printTheMinOrder(num2);
            printTheMinOrder(num3);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
//=======输出=======
/*
321323
321323
123
*/
```


> 博客迁移自 [GC-CSDN](http://blog.csdn.net/GC_chao)
