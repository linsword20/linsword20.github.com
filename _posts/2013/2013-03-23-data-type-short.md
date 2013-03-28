---
layout: post
title: Float的二进制表示
categories: programming
description: float存储机制笔记 
tags: 
- 浮点型
- float
- C/C++
---
这两天研究《程序员面试宝典》的时候，碰到一道关于C/C++中float的题:  
	
	#include <iostream> 
	#include <stdio.h> 
	#include <string.h> 
	#include <conio.h> 
	using namespace std;  
	int main()  
	{  
		float a = 1.0f;  
		cout << (int)a << endl;  
		cout << &a << endl;  
		cout << (int&)a << endl;  
		cout << boolalpha << ( (int)a == (int&)a ) << endl;        //输出什么？  
		float b = 0.0f;  
		cout << (int)b << endl;  
		cout << &b << endl;  
		cout << (int&)b << endl;  
		cout << boolalpha << ( (int)b == (int&)b ) << endl;        //输出什么？  
		return 0;  
	}
题目本身难度不大，输出结果为`false true`但是题目解析里的一句话:"1.0f在内存中的表示都是0x3f800000"，让我很不解，想要搞懂浮点数float在计算机内部的表示方法。记得寒假看过的网易公开课[编程范式](http://v.163.com/special/opencourse/paradigms.html)里面有讲解过C/C++中的各种数据类型的在内存中的表示方法，可惜已经忘在脑后。So，查阅资料Google了一番，将所得当作学习笔记：  

##1.整数的表示
计算机中是如何存储和表达数字的？对于整数，情况比较简单，直接按照数学中的进制转换方法处理即可，即连续除以2取余。例如`125D=1111101B`,这并不是难点，真正的难点在于小数是如何转换为二进制码（即浮点数）的。从数学的角度来讲，十进制的小数可以转换为二进制小数（整数部分连续除2，小数部分连续乘2），例如125.125D=1111101.001B，但问题在于计算机根本就不认识小数点“.”，更不可能认识1111101.001B。那么计算机是如何处理小数的呢？  

##2.小数的表示
小数在计算机中以浮点数的形式表示，浮点数在计算机中的表示是基于科学计数法（Scientific Notation）的，我们知道32767这个数用科学计数法可以写成3.2767×104，3.2767称为尾数（Mantissa，或者叫Significand），4称为指数（Exponent）。浮点数在计算机中的表示与此类似，只不过基数（Radix）是2而
不是10。  
二进制浮点数是以符号数值表示法的格式存储——最高有效位被指定为符号位(sign bit)；“指数部份”，即次高有效的e个比特，存储指数部分；最后剩下的f个低有效位的比特，存储“尾数”(significand)的小数部份（在非规约形式下整数部份默认为0，其他情况下一律默认为1）。对于32bit的float为例，最高有效位为符号位（0/1），指数部分为8bit，剩下的23bit存储小数部分。
![Imgur](/media/images/float.jpg)   

##3.指数偏移
指数偏移值(exponent bias)，是指浮点数表示法中的指数域的编码值为指数的实际值加上某个固定的值，IEEE754标准规定该固定值为 2e-1 - 1[2]，其中的e为存储指数的比特的长度。

以单精度浮点数为例，它的指数域是8个比特，所以指数域可以表示的范围是(0~255)，即相当于整数部分的范围为(1~2<sup>255</sup>),为了提高精度，可以存储足够小的数，所以加上一个偏移值，根据IEEE754标准固定偏移值是2<sup>8-1</sup> - 1 = 128−1 = 127. 单精度浮点数的指数部分实际取值是从-127到128。例如指数实际值为-100,在单精度浮点数中的指数域编码值为27， 即27 = -100 + 127.

采用指数的实际值加上固定的偏移值的办法表示浮点数的指数，好处是可以用长度为e个比特的无符号整数来表示所有的指数取值，这使得两个浮点数的指数大小的比较更为容易。
 
##4.转换规则
还是以125.125作为例子，具体阐述单精度浮点数float的转换规则：  
  
1.将(125.125)<sub>10</sub>转换为二进制表示形式(1111101.001)<sub>2</sub>  

2.将(1111101.001)<sub>2</sub>转化为二进制科学计数表示：  
(1111101.001)<sub>2</sub> = (1111101.001)<sub>2</sub> × 2<sup>0</sup> = (1.111101001)<sub>2</sub> × 2<sup>6</sup> = (1 + 0.111101001) × 2<sup>6</sup>  

3.可以得到，符号位为0，尾数的小数部分为111101001，指数为6(即110)，加上偏移值127为133（10000101）  

4.最终，(125.125)<sub>10</sub>的浮点数表示为`0 10000101 11110100100000000000000`  

##5.非规约形式的浮点数 
>如果浮点数的指数部分的编码值是0，尾数的最高有效位（即整数字）也是0，那么这个浮点数将被称为非规约形式的浮点数。IEEE 754标准规定：非规约形式的浮点数的指数偏移值比规约形式的浮点数的指数偏移值大1. 例如，最小的规约形式的单精度浮点数的指数部分编码值为1，指数的实际值为-126；而非规约的单精度浮点数的指数域编码值为0，对应的指数实际值也是-126而不是-127。实际上非规约形式的浮点数仍然是有效可以使用的，只是它们的绝对值已经小于所有的规约浮点数的绝对值；即所有的非规约浮点数比规约浮点数更接近0。规约浮点数的尾数大于等于1且小于2，而非规约浮点数的尾数小于1且大于0.  

##编程中需要特别注意的有两点：

1.浮点数都是带符号的，不存在unsigned double和unsigned float；

2.两个浮点数之间不能用==来判断是否相等，因为浮点数是对实数的近似，所以计算机中两个浮点数不可能完全相等，最多也只能保证其差值小于用户规定的误差限度。

##总结
回过头来看原来的程序:  
	float a = 1.0f;   		//1.0f为0x3f800000  
	/*(int)a强制类型转换后为1，而(int&)a将a以int的格式读出为
	2^30-2^23=1065353216,显然两者不相等*/  
	cout << boolalpha << ( (int)a == (int&)a ) << endl;       

	float b = 0.0f;        //0.0f为0x00000000  
	//两者都等于0，所以相等 
	cout << boolalpha << ( (int)b == (int&)b ) << endl;           