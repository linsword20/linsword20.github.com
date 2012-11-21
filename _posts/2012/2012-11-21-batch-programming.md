---
layout: post
title: MS-DOS批处理编程
categories:
- Programming
tags:
- dos
- bat
---

##1.MS-DOS批处理文件
批处理是一种简化的脚本语言，是由DOS或者Windows系统内嵌的命令解释器CMD解释运行.批处理文件或批处理程序是一个包含若干MS-DOS命令的正文文件，扩展名为.BAT。当在命令提示符下敲入批处理程序的名称时，MS-DOS成组执行此批处理程序中的命令。

##2.特殊标记符
DOS命令行或批处理程序中的经常会见到的特殊标记符

* CR(0D)--------命令行结束符
* Escape(1B)----ANSI转义字符引导符
* Space(20)	----常用的参数界定符
* Tab(09); = ----不常用的参数界定符
* \+       	----------------COPY命令文件连接符
* ?         --------	--------文件通配符
* ''         -----------------字符串界定符
* |         --------	---------命令管道符
* < > >>     ----------文件重定向符
* @         --------	-------命令行回显屏蔽符
* /         --------	--------参数开关引导符
* :         --------	---------批处理标签引导符
* %         	-------------批处理变量引导符


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

##4.特殊命令
###4.1 if
if 是条件语句，用来判断是否符合规定的条件，从而决定执行不同的命令。 
有三种格式:

4.1.1 if [not] '参数' == '字符串' 待执行的命令  
参数如果等于(not表示不等，下同)指定的字符串，则条件成立，运行命令，否则运行下一句。

{% highlight objc %}
if '%1'=='a' format a:
if not '%1'=='a' format a:
{% endhighlight %}

if 的命令行帮助中关于此点的描述为:   
IF [NOT] string1==string2 command   
在此有以下几点需要注意:   
1. 包含字符串的双引号不是语法所必须的, 而只是习惯上使用的一种'防空'字符  
2. string1 未必是参数, 它也可以是环境变量, 循环变量以及其他字符串常量或变量  
3. command 不是语法所必须的, string2 后跟一个空格就可以构成一个有效的命令行



4.1.2 if [not] exist [路径]文件名 待执行的命令  
如果有指定的文件，则条件成立，运行命令，否则不运行。

{% highlight objc %} 
rem 表示如果存在c:config.sys文件，则显示它的内容。
if exist c:config.sys type c:config.sys
{% endhighlight %}



4.1.3 if errorlevel 待执行的命令  
很多DOS程序在运行结束后会返回一个数字值用来表示程序运行的结果(或者状态)，通过if errorlevel命令可以判断程序的返回值，根据不同的返回值来决定执行不同的命令(返回值必须按照从大到小的顺序排列)。如果返回值等于指定的数字，则条件成立，运行命令，否则运行下一句。

{% highlight objc %} 
rem 表示如果存在c:config.sys文件，则显示它的内容。
if errorlevel 2 echo "hello"
{% endhighlight %}  
 
if errorlevel 比较返回码的判断条件并非等于, 而是大于等于。

* 当if errorlevel与goto混合使用时,由于 goto 的跳转特性, 由小到大排序会导致在较小的返回码处就跳出,因此返回值必须依照从大到小次序顺序判断。

{% highlight objc %} 
@echo off
choice /C dme /M 'defrag,mem,end'
if errorlevel 3 goto end
if errorlevel 2 goto mem
if errorlevel 1 goto defrag
:defrag
c:dosdefrag
goto end
:mem
mem
goto end
:end
echo good bye
{% endhighlight %}

* 而是用使用set作为执行命令时,由于set命令的'重复'赋值特性, 由大到小排序会导致较小的返回码 '覆盖' 较大的返回码.

{% highlight objc %} 
if errorlevel 1 set el=1
if errorlevel 2 set el=2
if errorlevel 3 set el=3
if errorlevel 4 set el=4
if errorlevel 5 set el=5
{% endhighlight %}

###4.2 goto  
批处理文件运行到这里将跳到goto所指定的标号(标号即label，标号用:后跟标准字符串来定义)处，goto语句一般与if配合使用，根据不同的条件来执行不同的命令组。

{% highlight objc %} 
goto end
:end
echo this is the end
{% endhighlight %}

###4.3 choice  
使用此命令可以让用户输入一个字符（用于选择），从而根据用户的选择返回不同的errorlevel，然后于if errorlevel配合，根据用户的选择运行不同的命令。  
choice的命令语法:  
CHOICE [/C choices] [/N] [/CS] [/T timeout /D choice] [/M text]  

{% highlight objc %} 
CHOICE /?
CHOICE /C YNC /M '确认请按 Y，否请按 N，或者取消请按 C。'
CHOICE /T 10 /C ync /CS /D y
CHOICE /C ab /M '选项 1 请选择 a，选项 2 请选择 b。'
CHOICE /C ab /N /M '选项 1 请选择 a，选项 2 请选择 b。'
{% endhighlight %}

###4.4 for循环  
对一组文件中的每一个文件执行某个特定命令。  
FOR %%variable IN (set) DO command [command-parameters] 
 
%%variable 指定一个单一字母可替换的参数。  
(set)     指定一个或一组文件。可以使用通配符。  
command   指定对每个文件执行的命令。  
command-parameters 为特定命令指定参数或命令行开关。  

{% highlight objc %} 
rem 命令行会显示当前目录下所有以bat和txt为扩展名的文件的内容。  
for %%c in (*.bat *.txt) do type %%c
{% endhighlight %}