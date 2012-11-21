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



##3.常用命令
echo、@、call、pause、rem是批处理文件最常用的几个命令



###4.2 goto  
批处理文件运行到这里将跳到goto所指定的标号(标号即label，标号用:后跟标准字符串来定义)处，goto语句一般与if配合使用，根据不同的条件来执行不同的命令组。

{% highlight objc %} 
goto end
:end
echo this is the end
{% endhighlight %}