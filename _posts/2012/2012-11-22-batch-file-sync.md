---
layout: post
title: 批处理程序实现文件跨机拷贝
categories: programming
tags: [批处理, copy, 同步]
---

前些日子，我实习的公司需要实现一个服务器双机文件同步的功能，大家都忙着其他事情，秉着多学点东西的心态，就接下了这个活。
公司服务器进行了双机负载均衡，某些文件将平均的分布在两台服务器上，但程序读取这些文件的时候又希望只固定读取一台服务器
上的文件，为此需要将一台服务器上的文件合并到另一台服务器。由于两台服务器使用Windows系统，使用批处理程序跨机拷贝文件的
方式，并且为其配置Job定期运行，实现双机实现文件同步功能。

## 功能详述

编写windows批处理（bat）程序, 实现如下功能:  
1. 定时将服务器A的`c:\project\yyyymmdd`下所有的xml文件同步到服务器B对应目录  
2. 遇到重名的情况，需要对重名的xml文件进行比较，保留较新的一个xml文件  
3. 用job运行此bat程序，间隔为一分钟一次

##实现程序  
###1. 程序file_copy.bat
    
    @echo off

    rem 8个参数
    rem 1.目的IP地址
    rem 2.目的机登录密码
    rem 3.目的机用户名
    rem 4.源文件1
    rem 5.源文件2
    rem 6.目的驱动器
    rem 7.目的路径（不含驱动器）
    rem 8.目的路径2（不含驱动器

    net use \\%1\ipc$ %2 /user:%3
    xcopy %4 \\%1\%6$\%7 /s /e /y /c /k /d
    xcopy %5 \\%1\%6$\%8 /s /e /y /c /k /d
    net use \\%1\ipc$ /delete

	程序功能：实现文件跨机拷贝。
rem为程序注释符，程序13行表示建立IPC直接登陆，16行表示删除连接；
14、15行执行文件复制功能，其中/s表示复制目录和子目录（除了空的），/e表示复制目录和子目录（包括空的），/y 表示取消提示以确认要覆盖现有目标文件，/c  表示即使有错误，也继续复制，/k 表示复制文件，如果源文件具有只读属性，则在目标文件中保留该属性，/d表示只复制那些源时间比目标时间新的文件。


    
###2. 程序main.bat
为了方便服务器参数改变，编写该程序,调用file_copy.bat程序  
假设B服务器IP为192.168.1.2,用户名为username,密码为passwd
    
    rem 8个参数 空格隔开：
    rem 1.目的IP地址
    rem 2.目的机登录密码
    rem 3.目的机用户名
    rem 4.源文件1
    rem 5.源文件2
    rem 6.目的驱动器
    rem 7.目的路径（不含驱动器）
    rem 8.目的路径2（不含驱动器）

    @echo off
    call ./file_copy.bat 192.168.1.2 passwd username c:\project\%date:~0,4%%date:~5,2%%date:~8,2%\*.xml 
    C project\%date:~0,4%%date:~5,2%%date:~8,2%\

程序说明：  
Call为对其他批处理程序调用的命令，第一个参数为file_copy.bat程序文件的绝对路径，
其中%date:~0,4%表示当天日期从0位开始的4位字符串（如当天为2012-11-20，则%date:~0,4%为2012），因此%date:~0,4%%date:~5,2%%date:~8,2%表示当天日期所对应的字符串；
第6个参数C表示目标服务器的C:盘。

## 配置Job
为了满足服务器B以一分钟为周期，获取A服务器中的xml文件，更新到B服务器上，需要每分钟执行批处理程序一次，因此需要为其建立Job，步骤如下（以Win7为例）：  
###1. 在开始菜单，输入“任务计划程序”，运行计划任务程序
![a](/media/images/batch-file-sync/a.png)  
###2. 创建任务，输入名称，描述，选择不管用户是否登录都要运行
![a](/media/images/batch-file-sync/b.png)  
###3. 选择“触发器”标签，新建，按下图修改参数，确定
![a](/media/images/batch-file-sync/c.png)  
###4.选择“操作”标签，新建，添加main.bat批处理程序(路径以实际为准)
![a](/media/images/batch-file-sync/d.png)  
###5. 选择“设置”标签，
![a](/media/images/batch-file-sync/e.png)  

