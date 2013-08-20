---
layout: post
title: 域名（Domain Name）网络知识
categories: network
tags:
- Domain
- CNAME
- A记录
jack: <a href="http://weibo.com/u/1978104272">Jack</a>
---

真是不接触不知道，一接触吓一跳！昨晚本来是要告诉{{ page.jack }}怎么为自己的blog绑定独立域名的，结果不幸成了自己的网络知识普及课。
在申请了一个example.info的域名，他希望blog的域名可以是blog.example.info，一下子我也蒙了，下意识感觉应该不可以的，却说不出个所以然来，
枉我还在FNL实验室待着。。。google一番，做了些测试，现总结如下：

##1. 域名
>域名（Domain Name），是由一串用点分隔的名字组成的Internet上某一台计算机或计算机组的名称，
>用于在数据传输时标识计算机的电子方位（有时也指地理位置）。  

以一个常见的域名为例说明，baidu网址是由二部分组成，标号“baidu”是这个域名的主体，
而最后的标号“com”则是该域名的后缀，代表的这是一个com国际域名，是顶级域名。而前面的www.是网络名， 为www的域名。

##2. 域名级别

###“域”&“域名”
首先分清楚两个概念：“域”（Domain）和“域名”（Domain name），在很多场合，这两个概念经常被混用——事实上，也很难不被混用，
但如果要清晰理解域名体系，就要从现在开始注意避免混淆。

>“域名”就是在“域”下面注册的“名字”。

###举例
.com 就是一个“域”，而且是一个顶级域（Top Level Domain），也有人称之为一级域
如果在.com这个“域”中注册一个名字abc，则 abc.com 就是一个“域名”。.com是顶级域，abc.com自然就是顶级域名。
域名系统（Domain Name System, DNS）是树型结构，每一级都可以分杈（注册很多不同的名字）。
请注意，每一级都可以注册很多名字，这意味着 abc.com 这样的“域名”也可以被看作是一个“域”！
如果把 abc.com 视为“域”，它就是个“二级域“，如果我们在 abc.com 这个二级域下在注册一个名字123呢？
那 123.abc.com 自然就是一个“二级域名”，类推，如果把 123.abc.com 看作一个“三级域”，就可以注册一个xxx.123.abc.com 这样的“三级域名”……  

##3. A记录

###定义
A (Address) 记录是用来指定主机名（或域名）对应的IP地址记录。域名绑定A记录就是告诉DNS,当你输入域名的时候给你引导向设置在DNS的A记录所对应的服务器。
把某个主机名指向某个IP地址的过程，就称之为“域名解析”。

###例子
例如www.baidu.com-> 119.75.218.70，访问Baidu的请求就会通过DNS解析到 119.75.218.70，这就是DNS解析最重要的东西。

###主机记录
当 abc.com 作为一个域名时，我们经常看到的 www.abc.com 算是什么？
显然，在此情况下www.abc.com 不能被看作是个二级域名。事实上， www.abc.com是 abc.com 这个域名下的“主机名”，这个主机名通常在解析设置中被指向某个web服务器（主机）的IP地址。
同样，在此情况下，123.abc.com 和 xxx.123.abc.com 也只能被看作是“主机名”，在解析设置中被指向某个主机的IP地址。

##4. CNAME
>CNAME指别名记录也被称为规范名字。这种记录允许您将多个名字映射到同一台计算机。

例如，有一台计算机名为“host.mydomain.com”（A记录）。 它同时提供WWW和MAIL服务，为了便于用户访问服务。
可以为该计算机设置两个别名（CNAME）：WWW和MAIL。 这两个别名的全称就是“www.mydomain.com”和“mail.mydomain.com”。
实际上他们都指向“host.mydomain.com”。

##总结
因此{{ page.jack }}提出的blog.example.info是完全可以的，本站也是这么解决的。只需在DNS服务器设置A记录指向服务器IP，将主机记录设置为`blog`，
blog.example.info就是example.info域下的一台主机的“主机名”。这样域名解析的时候，根据A记录，blog.example.info就会被成功的解析。  
还有一种可行的办法，将主机记录留空（即@），此时再添加一个CNAME，主机记录同样设置为`blog`，记录值为`example.info`，这种情况下解析
blog.example.info的时候，会根据A记录将example.info域解析到对应IP，然后根据CNAME，寻找到blog.example.info主机。比如，你在自己的服务器
（一个公网IP）上有两个网站，希望分别为blog.example.info和code.example.info，就可以使用第二种方法，只需再添加一条CNAME，将主机记录设置为`code`。
