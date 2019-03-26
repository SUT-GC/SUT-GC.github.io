---
layout: post
title: "剑指Offer笔记<JAVA版>（二）"
description: "剑指Offer笔记<JAVA版>（二）"
categories: [面试]
tags: [java]
---

* Kramdown table of contents
{:toc .toc}

# 1.3.4 知道链表头结点，从尾到头打印链表

```java
package Chapter2;

import Chapter1.Node;
import Chapter1.TheKNumInLast;

public class PrintListFromEnd {
    public static void printListFromEnd(Node list){
        if(list == null){
            return;
        }
        printListFromEnd(list.next);
        System.out.println(list.getValue());
    }
    public static void main(String[] args) {
        Node list = TheKNumInLast.createList(20);
        printListFromEnd(list);
    }

}

```

# 1.3.5 先根遍历，中根遍历，后根遍历 二叉树并且 循环+递归两种方式

```java
//二叉树节点class
public class BinaryTreeNode {
    private int value;
    public BinaryTreeNode leftNode;
    public BinaryTreeNode rightNode;
    
    public void setValue(int v){
        this.value = v;
    }
    public int getValue(){
        return this.value;
    }

}

//创建二叉树
public class BinaryTree {
    public static BinaryTreeNode treeRoot;
    static{
        treeRoot = new BinaryTreeNode();
        treeRoot.setValue(1);
        
        treeRoot.leftNode = new BinaryTreeNode();
        treeRoot.leftNode.setValue(2);
        
        treeRoot.rightNode = new BinaryTreeNode();
        treeRoot.rightNode.setValue(3);
        
        treeRoot.leftNode.leftNode = new BinaryTreeNode();
        treeRoot.leftNode.leftNode.setValue(4);
        treeRoot.leftNode.rightNode = new BinaryTreeNode();
        treeRoot.leftNode.rightNode.setValue(5);
        
        treeRoot.rightNode.leftNode = new BinaryTreeNode();
        treeRoot.rightNode.leftNode.setValue(6);
        treeRoot.rightNode.rightNode = new BinaryTreeNode();
        treeRoot.rightNode.rightNode.setValue(7);
    }
}

//创建带访问次数控制code的节点包装类
//此类为 后根遍历 循环方法提供帮助， 与别的遍历方法无关 
package Chapter2;

public class BinaryTreeNodeCode{
    private BinaryTreeNode binaryTreeNode;
    private int code;
    
    public BinaryTreeNodeCode( BinaryTreeNode binaryTreeNode,int code){
        this.binaryTreeNode = binaryTreeNode;
        this.code = code;
    }

    public int getCode() {
        return code;
    }

    public void setCode(int code) {
        this.code = code;
    }

    public BinaryTreeNode getBinaryTreeNode() {
        return binaryTreeNode;
    }
    
    
}


//开始进行遍历操作
import java.util.ArrayList;
import java.util.LinkedList;

public class BinaryTreeOprate {
    public static void printTreeFirstRoot(BinaryTreeNode treeRoot){
        if(treeRoot == null){
            return;
        }
        System.out.println(treeRoot.getValue());
        printTreeFirstRoot(treeRoot.leftNode);
        printTreeFirstRoot(treeRoot.rightNode);
    }
    public static void printTreeSecoundRoot(BinaryTreeNode treeRoot){
        if(treeRoot == null){
            return;
        }
        printTreeSecoundRoot(treeRoot.leftNode);
        System.out.println(treeRoot.getValue());
        printTreeSecoundRoot(treeRoot.rightNode);
    }
    public static void printTreeThiredRoot(BinaryTreeNode treeRoot){
        if(treeRoot == null){
            return;
        }
        printTreeThiredRoot(treeRoot.leftNode);
        printTreeThiredRoot(treeRoot.rightNode);
        System.out.println(treeRoot.getValue());
    }
    public static void printTreeFirstRootFor(BinaryTreeNode treeRoot){
        if(treeRoot == null){
            return;
        }
        LinkedList<BinaryTreeNode> treeNodeStack = new LinkedList<>();
        treeNodeStack.push(treeRoot);
        while(!treeNodeStack.isEmpty()){
            BinaryTreeNode treeNode = treeNodeStack.getLast();
            treeNodeStack.removeLast();
            System.out.println(treeNode.getValue());
            if(treeNode.rightNode != null){
                treeNodeStack.addLast(treeNode.rightNode);
            }
            if(treeNode.leftNode != null){
                treeNodeStack.addLast(treeNode.leftNode);
            }
            
            
        }
    }
    public static void printTreeSecoundRootFor(BinaryTreeNode treeRoot){
        if(treeRoot == null){
            return;
        }
        LinkedList<BinaryTreeNode> treeNodeStack = new LinkedList<>();
        treeNodeStack.addLast(treeRoot);
        while(!treeNodeStack.isEmpty()){
            if(treeNodeStack.getLast().leftNode != null){
                treeNodeStack.addLast(treeNodeStack.getLast().leftNode);
            }else{
                BinaryTreeNode treeNode = treeNodeStack.getLast();
                System.out.println(treeNode.getValue());
                if(treeNode.rightNode != null){
                    treeNodeStack.addLast(treeNode.rightNode);
                }
            }
            
        }
    }
    /*
     * 规定访问一个节点 所做事情代表的 号码
     * 1 入栈（入栈之后，此节点代码为 1
     * 2 访问左右子节点（如果代码是1， 则下一步进行 访问左右子节点，刷代码为2）
     * 3 弹出并且输出 （如果代码是2 则下一步该进行弹出栈，并且输出值）
     */
    public static void printTreeThiredRootFor(BinaryTreeNode treeRoot) throws Exception{
        if(treeRoot == null){
            return;
        }
        LinkedList<BinaryTreeNodeCode> treeNodeStack = new LinkedList<>();
        treeNodeStack.addLast(new BinaryTreeNodeCode(treeRoot, 1));
        while(!treeNodeStack.isEmpty()){
            //如果栈顶元素的code == 1
            //把栈顶元素的code set成2
            //把栈顶元素的right节点入栈（！=null的话）并设置code=1
            //把栈顶元素的left节点入栈 （！=null的话）并设计code=1
            
            if(treeNodeStack.getLast().getCode() == 1){
                //获取栈顶的元素
                BinaryTreeNodeCode treeNodeCode = treeNodeStack.getLast();
                //因为这是第二次访问，所以置为2
                treeNodeCode.setCode(2);
                //将栈顶的元素左右子树入栈，并且设置code=1
                if(treeNodeCode.getBinaryTreeNode().rightNode != null){
                    treeNodeStack.addLast(new BinaryTreeNodeCode(treeNodeCode.getBinaryTreeNode().rightNode, 1));
                }
                if(treeNodeCode.getBinaryTreeNode().leftNode != null){
                    treeNodeStack.addLast(new BinaryTreeNodeCode(treeNodeCode.getBinaryTreeNode().leftNode, 1));
                }
                
            //如果code == 2
            //则将栈顶元素的值输出并且弹出
            }else if(treeNodeStack.getLast().getCode() == 2){
                System.out.println(treeNodeStack.getLast().getBinaryTreeNode().getValue());
                treeNodeStack.removeLast();
            }else{
                throw new Exception("出现code ！= 1  && ！= 2");
            }
            
        }
    }
    public static void main(String[] args) throws Exception {
        BinaryTreeNode treeRoot = BinaryTree.treeRoot;
        System.out.println("======先根遍历===递归=====");
        printTreeFirstRoot(treeRoot);
        System.out.println("======先根遍历===循环=====");
        printTreeFirstRootFor(treeRoot);
        System.out.println("======中根遍历===递归=====");
        printTreeSecoundRoot(treeRoot);
        System.out.println("======中根遍历===循环=====");
        printTreeSecoundRoot(treeRoot);
        System.out.println("======后根遍历===递归=====");
        printTreeThiredRoot(treeRoot);
        System.out.println("======后根遍历===循环=====");
        printTreeThiredRootFor(treeRoot);
    }
}

/////////运行结果////////////////
/*
======先根遍历===递归=====
1
2
4
5
3
6
7
======先根遍历===循环=====
1
2
4
5
3
6
7
======中根遍历===递归=====
4
2
5
1
6
3
7
======中根遍历===循环=====
4
2
5
1
6
3
7
======后根遍历===递归=====
4
5
2
6
7
3
1
======后根遍历===循环=====
4
5
2
6
7
3
1

*/
```


# 1.3.6  用两个栈实现队列的add与remove（“添加”与“读取队列头，并删除”的两个功能

```java
package Chapter2;

import java.util.LinkedList;
import java.util.Queue;
import java.util.Stack;

public class QueueAndStack {
    private static Stack<Integer> stack1 = new Stack<>();
    private static Stack<Integer> stack2 = new Stack<>();
    private static LinkedList<Integer> queue1 = new LinkedList<>();
    private static LinkedList<Integer> queue2 = new LinkedList<>();
    
    /*
     * 将两个stack实现成一个queue
     */
    //stack1 用来print
    //stack2 用来add
    //每次print完毕都要将数据从stack1转移到stack2中
    public static void addQueueByStack(int num){
        stack2.push(num);
    }
    public static int removeQueueByStack() throws Exception{
        if(stack2.isEmpty()){
            throw new Exception("the stack is empty !");
        }else{
            //将stack1 清空并且将stack2中的数据转移到stack1中
            stack1.clear();
            while(!stack2.isEmpty()){
                stack1.push(stack2.pop());
            }
            int top = stack1.pop();
            //清空stack2并且将stack1中剩余的数据转移到stack2中
            stack2.clear();
            while(!stack1.isEmpty()){
                stack2.push(stack1.pop());
            }
            return top;
        }
    }
    
    /*
     * 用两个queue实现一个stack
     * queue1 
     * queue2
     * 当push数据的时候，queue1将数据全部按照队列的方式转移到queue2,
     * 然后将数据加入queue1
     * 然后将数据按照队列的方式从queue2转移回queue1
     * 
     * 当pop的时候，直接读取queue1队列即可
     */
    public static void pushStackByQueue(int num){
        queue2.clear();
        while(!queue1.isEmpty()){
            queue2.addLast(queue1.removeFirst());
        }
        queue1.addLast(num);
        while(!queue2.isEmpty()){
            queue1.addLast(queue2.removeFirst());
        }
        queue2.clear();
    }
    public static int popStackByQueue() throws Exception{
        if(queue1.isEmpty()){
            throw new Exception("this stack is empty !");
        }else{
            return queue1.removeFirst();
        }
    }
    public static void main(String[] args) throws Exception {
        System.out.println("====下面是队列的输出=====");
        addQueueByStack(1);
        addQueueByStack(2);
        addQueueByStack(3);
        addQueueByStack(4);
        addQueueByStack(5);
        System.out.println(removeQueueByStack());
        System.out.println(removeQueueByStack());
        System.out.println(removeQueueByStack());
        System.out.println(removeQueueByStack());
        System.out.println(removeQueueByStack());
        
        System.out.println("====下面是栈的输出======");
        pushStackByQueue(1);
        pushStackByQueue(2);
        pushStackByQueue(3);
        pushStackByQueue(4);
        pushStackByQueue(5);
        System.out.println(popStackByQueue());
        System.out.println(popStackByQueue());
        System.out.println(popStackByQueue());
        System.out.println(popStackByQueue());
        System.out.println(popStackByQueue());
        System.out.println(popStackByQueue());
    }
}

/////////======下面是输出========
/*
====下面是队列的输出=====
1
2
3
4
5
====下面是栈的输出======
5
4
3
2
1
Exception in thread "main" java.lang.Exception: this stack is empty !
    at Chapter2.QueueAndStack.popStackByQueue(QueueAndStack.java:64)
    at Chapter2.QueueAndStack.main(QueueAndStack.java:93)

*/
```

# 1.3.6 实现快速排序

```java

import java.util.Arrays;

public class QuickSort {
    public static void swap(int[] arr, int i, int j){
        int k = arr[i];
        arr[i] = arr[j];
        arr[j] = k;
    }
    public static void sort(int[] arr,int start, int end){
        if(start >= end){
            return;
        }
        int key = arr[start];
        int i = start+1;
        int j = end;
        for(;i<j;){
            if(arr[i] < key && arr[j] >= key){
                i++;
            }else if(arr[i] >= key && arr[j] >= key){
                j--;
            }else if(arr[i] < key && arr[j] < key){
                i++;
            }else if(arr[i] >= key && arr[j] < key){
                swap(arr,i,j);
                j--;
            }
        }
        if(arr[i] >= key){
            i--;
            swap(arr,start,i);
        }else{
            swap(arr,start,i);
        }
        sort(arr,start,i-1);
        sort(arr,i+1,end);
        
    }
    public static void main(String[] args) {
        int[] a = {4,1,2,7,4,3,9,0,2};
        sort(a, 0, a.length-1);
        System.out.println(Arrays.toString(a));
    }

}

```

> **插入排序思想**：每一次都将key插入到已经排序好的序列
> 初始：5 4 8 1 6 9 7
> 第一：5 4 9 1 6 9 7（key = 5）经过第一轮，5已经是排序好的序列了，key = 4
> 第二：4 5 9 1 6 9 7（key = 2）经过第二轮，4 5已经排序好了，key = 9
> .......以此类推

>**选择排序思想**：每次都选择最小的数放在最前面
>初始：5 4 8 1 6 9 7
>第一：1 5 4 8 6 9 7 选择1 并且把1放在最前面，然后看 5 4 8 6 9 7 这个序列，再选择最小的放在前面。
>第二：1 4 5 8 6 9 7
>.......以此类推

# 1.3.7 归并排序

```java
package Chapter2;

import java.util.Arrays;

public class MergeSort {
    public static void sort(int[] arr, int start, int end){
        if(start >= end){
            return;
        }
        int q = (start+end)/2;
        sort(arr,start,q);
        sort(arr,q+1,end);
        merge(arr, start, q, end);
    }
    public static void merge(int[] arr, int start, int q, int end){
        int[] temp = new int[end-start+1];
        int i = start;
        int j = q+1;
        for(;i<=q && j<=end;){
            if(arr[i] <= arr[j]){
                temp[i-start+(j-(q+1))] = arr[i];
                i++;
            }
            if(arr[i] > arr[j]){
                temp[i-start+(j-(q+1))] = arr[j];
                j++;
            }
        }
        while(i <= q){
            temp[i-start+(j-(q+1))] = arr[i];
            i++;
        }
        while(j <= end){
            temp[i-start+(j-(q+1))] = arr[j];
            j++;
        }
        for(int k = start; k <= end; k++){
            arr[k] = temp[k-start];
        }
    }
    public static void main(String[] args) {
        int[] a = {5,4,5,8,6,4,1,3,9,7};
        sort(a, 0, a.length-1);
        System.out.println(Arrays.toString(a));
    }

}

```
# 1.3.8 利用二进制位运算
**（1）统计 一个数的二进制里有多少个 1 **
**（2）统计 两个十进制数的二进制位有多少位不一样**

```java
package Chapter2;

public class Sum1 {
    //设置一个判断数，一直向左移位
    public static int sumOf1First(int num){
        int count = 0;
        int flag = 1;
        while(flag != 0){
            if((num & flag) != 0)
                count ++;
            flag = flag << 1;
        }
        return count;
    }
    //num & (num-1) 可以去掉num最右面的1
    public static int sumOf1Secound(int num){
        int count = 0;
        while(num != 0){
            count++;
            num = num & (num-1);
        }
        return count;
    }
    //判断两个数的二进制有几位不一样
    public static int sumDiffPos(int num1, int num2){
        int num = num1 ^ num2;
        return sumOf1Secound(num);
    }
    public static void main(String[] args) {
        System.out.println(sumOf1First(9));
        System.out.println(sumOf1Secound(9));
        System.out.println(sumDiffPos(9, 8));
    }

}
////////======输出=========
/*
2
2
1
*/
```

# 1.3.9 实现函数double doublePower(double base, int expoent) 求base的expoent次方， 不用函数库，不考虑大数问题.

```javas
package Chapter2;

public class DoublePow {
    public static double doublePower(double base, int expoent) throws Exception{
        if(base == 0.0){
            if(expoent < 0){
                throw new Exception("the base and the expoent can't all < 0");
            }else{
                return 1;
            }
        }
        if(expoent == 0){
            return 1;
        }
        double result = 1.0;
        if(expoent < 0){
//          result = doublePowerPositive(base, -expoent);
            result = doublePowerPositiveREC(base, expoent);
            result = 1/result;
        }else{
            result = doublePowerPositiveREC(base, expoent);
//          result = doublePowerPositive(base, expoent);
        }
        return result;
    }
    //第一个算子
    //仅仅是用循环进行乘积运算，效率不高
    private static double doublePowerPositive(double base, double expoent){
        double result = 1.0;
        for(int i = 0; i < expoent; i++){
            result *= base;
        }
        return result;
    }
    //第二个算子
    //用方程 a(n) = a(n/2)*a(n/2) n是偶数
    //     a(n) = a((n-1)/2)*a((n-1)/2)*a n是奇数
    public static double doublePowerPositiveREC(double base, int expoent){
        if(expoent == 1){
            return base;
        }
        if(expoent == 0){
            return 1;
        }
        double result = doublePowerPositiveREC(base, expoent/2);
        result *= result;
        if((expoent & 1) == 1){
             result *= base;
        }
        return result;
    }
    public static void main(String[] args) {
        try {
            System.out.println(doublePower(3.0, 2));
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

```

# 1.3.10 打印1到最大的n位数（大数）

```java
package Chapter2;

import java.util.Arrays;

public class PrintOneToMaxNumOfN {
    public static void printOneToMaxN(int n){
        int[] number = new int[n+1];
        for(int i = 0; i <= n; i++){
            number[i] = 0;
        }
        while(!increase(number)){
            printBigNum(number);
        }
    }
    private static boolean increase(int[] number) {
        boolean overflow = false;
        int nSum = 0;
        int carry = 0;
        
        for(int i = number.length-1; i >=0; i--){
            nSum = number[i]+carry;
            if(i == (number.length-1)){
                nSum++;
            }
            if(nSum >= 10){
                carry = 1;
                nSum -= 10;
            }else{
                carry = 0;
            }
            number[i] = nSum;
        }
        if(number[0] > 0){
            overflow = true;
        }
        return overflow;
    }
    private static void printBigNum(int[] number) {
        boolean flag = false;
        for(int i = 1; i < number.length; i++){
            if(number[i] != 0)
                flag = true;
            if(flag)
                System.out.print(number[i]);
        }
        System.out.println();
    }
    public static void main(String[] args) {
        printOneToMaxN(2);
    }

}
/////====运行结果=====
/*
1
2
3
4
5
6
7
8
9
10
11
12
13
14
.....
*/
```
# 1.3.11 知道链表头和链表中的一个节点，用O(1)的复杂度将这个节点从链表中删除。

```java
package Chapter3;

import Chapter1.Node;
import Chapter1.TheKNumInLast;

public class DeleteANode {
    public static void deleteANode(Node root, Node node){
        if(root==null || node==null)
            return;
        if(node == root){
            root = null;
            node = null;
            return;
        }
        if(node.next == null){
            Node nowNode = root;
            while(nowNode!=null){
                if(nowNode.next == node){
                    nowNode.next = null;
                }
                nowNode = nowNode.next;
            }
            return;
        }
        Node nextNode = node.next;
        node.setValue(nextNode.getValue());
        node.next = nextNode.next;
        nextNode = null;
    }
    public static void main(String[] args) {
        Node nodeList = TheKNumInLast.createList(10);
        Node aNode = null;
        Node head = nodeList;
        while(head != null){
            if(head.getValue() == 6){
                aNode = head.next;
            }
            head = head.next;
        }
        deleteANode(nodeList, aNode);
        TheKNumInLast.printList(nodeList);
    }
}

//=======输出========
/*
1
2
3
4
5
6
8
9
10

*/
```

# 1.3.12 交换数组中的奇数，偶数，将偶数排在前面，奇数排在后面。（程序代码可复用）

```java
package Chapter3;

import java.util.Arrays;

interface SwapFactor<T>{
    public boolean isSwap(T t);
}
class ParitySwap implements SwapFactor<Integer>{
    public boolean isSwap(Integer num){
        if(((int)num & 1) == 0){
            return true;
        }
        return false;
    }
    
}
public class SwapArray<T>{
    private SwapFactor swapFactor = null;
    private T[] arr;
    public SwapArray(SwapFactor swapFactor, T[] arr){
        this.swapFactor = swapFactor;
        this.arr = arr;
    }
    public void swapArray() throws Exception{
        if(arr == null)
            throw new Exception("the array is empty");
        int i = 0;
        int j = arr.length-1;
        while(i < j){
            if(swapFactor.isSwap(arr[i]) && swapFactor.isSwap(arr[j])){
                i++;
            }else if(!swapFactor.isSwap(arr[i]) &&!swapFactor.isSwap(arr[j])){
                j--;
            }else if(swapFactor.isSwap(arr[i]) && !swapFactor.isSwap(arr[j])){
                i++;
            }else{
                T temp = arr[i];
                arr[i] = arr[j];
                arr[j] = temp;
                i++;
            }
            
        }
    }
    private void swap(T a, T b){
        T temp = a;
        a = b;
        b = temp;
    }
    public static void main(String[] args) {
        Integer[] arr = {1,2,3,4,5,6,7,8,9};
        SwapFactor swapFactor = new ParitySwap();
        SwapArray<Integer> swapArray = new SwapArray<>(swapFactor, arr);
        try {
            swapArray.swapArray();
        } catch (Exception e) {
            e.printStackTrace();
        }
        for(int each: arr){
            System.out.print(each+" ");
        }
        System.out.println();
    }

}

```

# 1.3.13 翻转链表
```java
package Chapter3;

import Chapter1.Node;
import Chapter1.TheKNumInLast;

public class ReverseList {
    public static Node reverseList(Node root) throws Exception{
        Node reverseHead = null;
        Node nowNode = root;
        Node prevNode = null;
        while(nowNode != null){
            Node nextNode = nowNode.next;
            if(nextNode == null)
                reverseHead = nowNode;
            nowNode.next = prevNode;
            
            prevNode = nowNode;
            nowNode = nextNode;
        }
        return reverseHead;
        
    }
    public static void main(String[] args) {
        Node list = TheKNumInLast.createList(10);
        try {
            Node reserveList = reverseList(list);
            TheKNumInLast.printList(reserveList);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

```

# 1.3.14 合并两个链表

```java
package Chapter3;

import Chapter1.Node;
import Chapter1.TheKNumInLast;

public class MergeTwoList {

    public static Node mergeTwoList(Node root1, Node root2){
        Node head = null;
        if(root1 == null && root2 == null)
            return null;
        if(root1 == null )
            return root2;
        if(root2 == null)
            return root1;
        if(root1.getValue() > root2.getValue()){
            head = root2;
            head.next = mergeTwoList(root1, root2.next);
        }else{
            head = root1;
            head.next = mergeTwoList(root1.next, root2);
        }
        return head;
    }
    public static void main(String[] args) {
        Node root1 = TheKNumInLast.createList(10);
        Node root2 = TheKNumInLast.createList(10);
        Node root = mergeTwoList(root1, root2);
        TheKNumInLast.printList(root);
    }

}

```
# 1.3.15 判断一个二叉树是否是另一个二叉树的子树

```java
package Chapter3;

import Chapter1.Node;
import Chapter2.BinaryTreeNode;

public class ChildOfBinaryTree {
    
    public static boolean isChildOfBinaryTree(BinaryTreeNode childRoot, BinaryTreeNode fatherRoot){
        boolean result = false;
        if(childRoot != null && fatherRoot != null){
            if(childRoot.getValue() == fatherRoot.getValue())
                result = isChildRootOfFatherRoot(childRoot, fatherRoot);
            if(!result)
                result = isChildOfBinaryTree(childRoot, fatherRoot.leftNode);
            if(!result)
                result = isChildOfBinaryTree(childRoot, fatherRoot.rightNode);
        }
        return result;
    }
    private static boolean isChildRootOfFatherRoot(BinaryTreeNode childRoot, BinaryTreeNode fatherRoot){
        if(childRoot == null)
            return true;
        if(fatherRoot == null)
            return false;
        if(childRoot.getValue() != fatherRoot.getValue())
            return false;
        return isChildRootOfFatherRoot(childRoot.leftNode, fatherRoot.leftNode) &&
                isChildRootOfFatherRoot(childRoot.rightNode, fatherRoot.rightNode);
    }
    public static void main(String[] args) {
        BinaryTreeNode treeFather = null;
        BinaryTreeNode treeChild = null;
        //父类书初始化
        treeFather = new BinaryTreeNode();
        treeFather.setValue(1);
        
        treeFather.leftNode = new BinaryTreeNode();
        treeFather.leftNode.setValue(2);
        
        treeFather.rightNode = new BinaryTreeNode();
        treeFather.rightNode.setValue(3);
        
        treeFather.leftNode.leftNode = new BinaryTreeNode();
        treeFather.leftNode.leftNode.setValue(4);
        treeFather.leftNode.rightNode = new BinaryTreeNode();
        treeFather.leftNode.rightNode.setValue(5);
        
        treeFather.rightNode.leftNode = new BinaryTreeNode();
        treeFather.rightNode.leftNode.setValue(6);
        treeFather.rightNode.rightNode = new BinaryTreeNode();
        treeFather.rightNode.rightNode.setValue(7);
    
        //子类树初始化
        treeChild = new BinaryTreeNode();
        treeChild.setValue(2);
        
        treeChild.leftNode = new BinaryTreeNode();
        treeChild.leftNode.setValue(4);
        
        treeChild.rightNode = new BinaryTreeNode();
        treeChild.rightNode.setValue(5);
        System.out.println(ChildOfBinaryTree.isChildOfBinaryTree(treeChild, treeFather));
    }

}

```
# 1.3.16 镜像二叉树

```java
package Chapter3;

import java.util.function.BinaryOperator;

import Chapter1.TheKNumInLast;
import Chapter2.BinaryTreeNode;
import Chapter2.BinaryTreeOprate;

public class ImageBinaryTree {
    public static void imageTree(BinaryTreeNode root){
        if(root == null)
            return;
        BinaryTreeNode temp = root.leftNode;
        root.leftNode = root.rightNode;
        root.rightNode = temp;
        
        imageTree(root.leftNode);
        imageTree(root.rightNode);
    }
    public static void main(String[] args) {
        BinaryTreeNode treeFather = null;
        //二叉树构建
        treeFather = new BinaryTreeNode();
        treeFather.setValue(1);
        
        treeFather.leftNode = new BinaryTreeNode();
        treeFather.leftNode.setValue(2);
        
        treeFather.rightNode = new BinaryTreeNode();
        treeFather.rightNode.setValue(3);
        
        treeFather.leftNode.leftNode = new BinaryTreeNode();
        treeFather.leftNode.leftNode.setValue(4);
        treeFather.leftNode.rightNode = new BinaryTreeNode();
        treeFather.leftNode.rightNode.setValue(5);
        
        treeFather.rightNode.leftNode = new BinaryTreeNode();
        treeFather.rightNode.leftNode.setValue(6);
        treeFather.rightNode.rightNode = new BinaryTreeNode();
        treeFather.rightNode.rightNode.setValue(7);
    
        imageTree(treeFather);
        BinaryTreeOprate.printTreeFirstRoot(treeFather);
    }
}


//=======输出========
/*
1
3
7
6
2
5
4
*/
```

# 1.3.17 顺时针打印数组

```java
package Chapter3;

public class ClockwiseArray {

    public static void printClockwiseArray(int[][] arr){
        if(arr == null)
            return;
        int weight = arr[0].length-1;
        int height = arr.length-1;
        
        int w = weight;
        int h = height;
        
        while(w > (weight/2) && h > (height/2)){
            for(int i = weight-w; i <= w; i++){
                System.out.print(arr[height-h][i]+" ");
            }
            for(int j = (height-h+1); j <= (h-1); j++){
                System.out.print(arr[j][w]+" ");
            }
            for(int i = w; i >= (weight-w); i--){
                System.out.print(arr[h][i]+" ");
            }
            for(int j = (h-1); j >= (height-h+1); j--){
                System.out.print(arr[j][weight-w]+" ");
            }
//          System.out.println("w = "+w);
//          System.out.println("h = "+h);
            w = w-1;
            h = h-1;
        }
        if(weight > height){
            for(int i = (weight-w); i <= (w); i++)
            {
                System.out.print(arr[h][i]+" ");
            }
        }
        if(height >= weight){
            for(int i = (height-h); i <= (h); i++)
            {
                System.out.print(arr[i][w]+" ");
            }
        }
    }
    public static void main(String[] args) {
        int[][] arr = {
                {1,2,3,4,50},
                {5,6,7,8,60},
                {9,10,11,12,70}
        };
        printClockwiseArray(arr);
    }

}

//====输出=====
/*
1 2 3 4 50 60 70 12 11 10 9 5 6 7 8 
*/
```

> 博客迁移自 [GC-CSDN](http://blog.csdn.net/GC_chao)