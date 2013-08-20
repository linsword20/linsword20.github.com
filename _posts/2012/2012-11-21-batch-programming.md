---
layout: post
title: MS-DOS批处理编程
category: programming
tags: [dos, 批处理]
---
{% include JB/setup %}
## 1.MS-DOS批处理文件
批处理是一种简化的脚本语言，是由DOS或者Windows系统内嵌的命令解释器CMD解释运行.批处理文件或批处理程序是一个包含若干MS-DOS命令的正文文件，扩展名为.BAT。当在命令提示符下敲入批处理程序的名称时，MS-DOS成组执行此批处理程序中的命令。

## 2.特殊标记符
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


## 3.常用命令
echo、@、call、pause、rem是批处理文件最常用的几个命令

### 3.1 注释rem和::
注释命令，类似于在C语言中的/\*-----\*/，它并不会被执行，只是起一个注释的作用，只有在编辑批处理时才会被看到，主要用于方便修改
`::`也可以起到注释的作用，但无论是否启用echo回显，`::`后的命令行都不会被回显，而rem后的字符在开启echo回显时可以被回显（只是不被执行而已）
	
	rem 注释内容
	:: 注释内容

### 3.2 echo
echo表示显示此命令后的字符
	
	echo "Hello World!"

`echo off`表示此语句后所有运行的命令都不显示命令行本身
`@`与`echo off`相象，但它是加在每个命令行的最前面，表示运行时不显示这一行的命令行（只能影响当前行）
常用`@echo off`来关闭批处理程序的回显功能
	
	@echo off

### 3.3 call
call 调用另一个批处理文件（如果不用call而直接调用别的批处理文件，那么执行完那个批处理文件后将无法返回当前文件并执行当前文件的后续命令） 
语法  
  CALL [drive:][path]filename [batch-parameters]  
参数  
  [drive:][path]filename  
  指定要调用的批处理程序的名字及其存放处。文件名必须用.BAT作扩展名。  
  batch-parameters  
  指定批处理程序所需的命令行信息。
	
	rem a.bat
	call test.bat

### 3.4 pause
pause 运行此句会暂停批处理的执行并在屏幕上显示Press any key to continue...的提示，等待用户按任意键后继续

##4.特殊命令
###4.1 if
if 是条件语句，用来判断是否符合规定的条件，从而决定执行不同的命令。 
有三种格式:

4.1.1 if [not] '参数' == '字符串' 待执行的命令  
参数如果等于(not表示不等，下同)指定的字符串，则条件成立，运行命令，否则运行下一句。
	
	if '%1'=='a' format a:
	if not '%1'=='a' format a:
	
if 的命令行帮助中关于此点的描述为:   
IF [NOT] string1==string2 command   
在此有以下几点需要注意:   
  1. 包含字符串的双引号不是语法所必须的, 而只是习惯上使用的一种'防空'字符  
  2. string1 未必是参数, 它也可以是环境变量, 循环变量以及其他字符串常量或变量  
  3. command 不是语法所必须的, string2 后跟一个空格就可以构成一个有效的命令行

4.1.2 if [not] exist [路径]文件名 待执行的命令  
如果有指定的文件，则条件成立，运行命令，否则不运行。

	rem 表示如果存在c:config.sys文件，则显示它的内容。
	if exist c:config.sys type c:config.sys

4.1.3 if errorlevel 待执行的命令  
很多DOS程序在运行结束后会返回一个数字值用来表示程序运行的结果(或者状态)，通过if errorlevel命令可以判断程序的返回值，根据不同的返回值来决定执行不同的命令(返回值必须按照从大到小的顺序排列)。如果返回值等于指定的数字，则条件成立，运行命令，否则运行下一句。
 
	rem 表示如果存在c:config.sys文件，则显示它的内容。
	if errorlevel 2 echo "hello"
 
if errorlevel 比较返回码的判断条件并非等于, 而是大于等于。

当if errorlevel与goto混合使用时,由于 goto 的跳转特性, 由小到大排序会导致在较小的返回码处就跳出,因此返回值必须依照从大到小次序顺序判断。
 
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

而是用使用set作为执行命令时,由于set命令的'重复'赋值特性, 由大到小排序会导致较小的返回码 '覆盖' 较大的返回码.

	if errorlevel 1 set el=1
	if errorlevel 2 set el=2
	if errorlevel 3 set el=3
	if errorlevel 4 set el=4
	if errorlevel 5 set el=5

### 4.2 goto  
批处理文件运行到这里将跳到goto所指定的标号(标号即label，标号用:后跟标准字符串来定义)处，goto语句一般与if配合使用，根据不同的条件来执行不同的命令组。

	goto end
	:end
	echo this is the end

###4.3 choice  
使用此命令可以让用户输入一个字符（用于选择），从而根据用户的选择返回不同的errorlevel，然后于if errorlevel配合，根据用户的选择运行不同的命令。  
choice的命令语法:  
  CHOICE [/C choices] [/N] [/CS] [/T timeout /D choice] [/M text]  
 
	CHOICE /?
	CHOICE /C YNC /M '确认请按 Y，否请按 N，或者取消请按 C。'
	CHOICE /T 10 /C ync /CS /D y
	CHOICE /C ab /M '选项 1 请选择 a，选项 2 请选择 b。'
	CHOICE /C ab /N /M '选项 1 请选择 a，选项 2 请选择 b。'

###4.4 for循环  
对一组文件中的每一个文件执行某个特定命令。  
  FOR %%variable IN (set) DO command [command-parameters] 
 
  %%variable 指定一个单一字母可替换的参数。  
  (set)     指定一个或一组文件。可以使用通配符。  
  command   指定对每个文件执行的命令。  
  command-parameters 为特定命令指定参数或命令行开关。  

	rem 命令行会显示当前目录下所有以bat和txt为扩展名的文件的内容。  
	for %%c in (*.bat *.txt) do type %%c

## 5.常用命令的返回值及其意义
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

* diskcopy  
0 盘拷贝操作成功  
1 非致命盘读/写错  
2 用户通过ctrl-c结束拷贝操作  
3 因致命的处理错误使盘拷贝中止  
4 预置错误阻止拷贝操作 
 
* format  
0 格式化成功  
3 用户通过ctrl-c中止格式化处理  
4 因致命的处理错误使格式化中止  
5 在提示“proceed with format（y/n）?”下用户键入n结束  

* xcopy  
0 成功拷贝文件  
1 未找到拷贝文件  
2 用户通过ctrl-c中止拷贝操作  
4 预置错误阻止文件拷贝操作  
5 拷贝过程中写盘错误  

* chkdsk  
0   未找到错误  
255 找到一个或多个错误 
 
* choice  
0   用户按下ctrl+c/break   
1   用户按下第一个键   
255 检测到命令行中的错误条件   
其它 用户按下的有效字符在列表中的位置 

* defrag  
0   碎片压缩成功  
1   出现内部错误  
2   磁盘上没有空簇。要运行DEFRAG，至少要有一个空簇  
3   用户用Ctrl+C退出了DEFRAG  
4   出现一般性错误  
5   DEFRAG在读簇时遇到错误  
6   DEFRAG在写簇时遇到错误  
7   分配空间有错  
8   内存错  
9   没有足够空间来压缩磁盘碎片  

* deltree  
0   成功地删除一个目录 

* diskcomp  
0   两盘相同  
1   发现不同  
2   按CTRL+C 终止了比较  
3   出现严重错误  
4   出现初始化错误  

* find  
0   查找成功且至少找到了一个匹配的字符串  
1   查找成功但没找到匹配的字符串  
2   查找中出现了错误

* keyb  
0   键盘定义文件装入成功  
1   使用了非法的键盘代码，字符集或语法  
2   键盘定义文件坏或未找到  
4   键盘、监视器通讯时出错  
5   要求的字符集未准备好  

* move  
0   成功地移动了指定的文件  
1   发生了错误  

* replace  
0   REPLACE成功地替换或加入了文件  
1   MS-DOS版本和REPLACE不兼容  
2   REPLACE找不到源文件  
3   REPLACE找不到源路径或目标路径  
5   不能存取要替换的文件  
8   内存不够无法执行REPLACE  
11   命令行句法错误  

* restore  
0   RESTORE成功地恢复了文件  
1   RESTORE找不到要恢复的文件  
3   用户按CTRL+C终止恢复过程  
4   RESTORE因错误而终止  

* scandisk  
0   ScanDisk在它检查的驱动器上未检测到任何错误  
1   由于命令行的语法不对，不能运行ScanDisk  
2   由于内存用尽或发生内部错误，ScanDisk意外终止  
3   用户让ScanDisk中途退出  
4   进行盘面扫描时，用户决定提前退出  
254 ScanDisk找到磁盘故障并已全部校正  
255 ScanDisk找到磁盘故障，但未能全部校正 
 
* setver  
0   SETVER成功地完成了任务  
1   用户指定了一个无效的命令开关  
2   用户指定了一个非法的文件名  
3   没有足够的系统内存来运行命令  
4   用户指定了一个非法的版本号格式  
5   SETVER在版本表中未找到指定的项  
6   SETVER未找到SETVER.EXE文件  
7   用户指定了一个非法的驱动器  
8   用户指定了太多的命令行参数  
9   SETVER检测到丢失了命令行参数  
10   在读SETVER.EXE文件时，SETVER检测到发生错误  
11   SETVER.EXE文件损坏  
12   指定的SETVER.EXE文件不支持版本表  
13   版本表中没有足够的空间存放新的项  
14   在写SETVER.EXE文件时SETVER检测到发生错误