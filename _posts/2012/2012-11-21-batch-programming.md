---
layout: post
title: MS-DOS批处理编程
categories: Programming
tags: [dos, bat]
---

* MS-DOS批处理文件
* 特殊标记符
* 常用命令
* 特殊命令
* 几个常用命令的返回值及其代表的意义

---
##1.MS-DOS批处理文件
批处理是一种简化的脚本语言，是由DOS或者Windows系统内嵌的命令解释器CMD解释运行.批处理文件或批处理程序是一个包含若干MS-DOS命令的正文文件，扩展名为.BAT。当在命令提示符下敲入批处理程序的名称时，MS-DOS成组执行此批处理程序中的命令。

##2.特殊标记符
DOS命令行或批处理程序中的经常会见到的特殊标记符

* CR(0D)命令行结束符
* Escape(1B)ANSI转义字符引导符
* Space(20)常用的参数界定符
* Tab(09); = 不常用的参数界定符
* \+COPY命令文件连接符
* ?文件通配符
* ''字符串界定符
* |命令管道符
* < > >> 文件重定向符
* @ 命令行回显屏蔽符
* / 参数开关引导符
* : 批处理标签引导符
* % 批处理变量引导符


##3.常用命令
echo、@、call、pause、rem是批处理文件最常用的几个命令

###3.1 注释rem、::
注释命令，类似于在C语言中的/*-----*/，它并不会被执行，只是起一个注释的作用，只有在编辑批处理时才会被看到，主要用于方便修改

{% hightlight objc %}
rem 注释内容
{% endhighlight %}

::也可以起到注释的作用，但无论是否启用echo回显，::后的命令行都不会被回显，而rem后的字符在开启echo回显时可以被回显（只是不被执行而已）

{% hightlight objc %}
rem 注释内容
:: 注释内容
{% endhighlight %}


###3.2 echo
echo表示显示此命令后的字符

{% highlight objc %}
echo "Hello World!"
{% endhighlight %}

echo off表示此语句后所有运行的命令都不显示命令行本身
@与echo off相象，但它是加在每个命令行的最前面，表示运行时不显示这*一行*的命令行（只能影响当前行）
常用`@echo off`来关闭批处理程序的回显功能

{% highlight objc %}
@echo off
{% endhighlight %}

###3.3 call
call 调用另一个批处理文件（如果不用call而直接调用别的批处理文件，那么执行完那个批处理文件后将无法返回当前文件并执行当前文件的后续命令）
语法
  CALL [drive:][path]filename [batch-parameters]
参数
[drive:][path]filename
  指定要调用的批处理程序的名字及其存放处。文件名必须用.BAT作扩展名。
batch-parameters
  指定批处理程序所需的命令行信息。

{% highlight objc %}
rem a.bat
call test.bat
{% endhighlight %}

###3.4 pause
pause 运行此句会暂停批处理的执行并在屏幕上显示Press any key to continue...的提示，等待用户按任意键后继续



###4.2 goto  
批处理文件运行到这里将跳到goto所指定的标号(标号即label，标号用:后跟标准字符串来定义)处，goto语句一般与if配合使用，根据不同的条件来执行不同的命令组。

{% highlight objc %} 
goto end
:end
echo this is the end
{% endhighlight %}


##5.几个常用命令的返回值及其代表的意义  
* backup  
0 备份成功  
1 未找到备份文件  
2 文件共享冲突阻止备份完成  
3 用户用ctrl-c中止备份  
4 由于致命的错误使备份操作中止  

* diskcomp  
0 盘比较相同  
1 盘比较不同  
2 用户通过ctrl-c中止比较操作  
3 由于致命的错误使比较操作中止  
4 预置错误中止比较  