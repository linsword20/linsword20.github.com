---
layout: post
title: 浅析Java类加载器
categories: programming
description: Java类加载器原理学习笔记
tags: 
- 父亲委托机制
- 类加载器
- Java
---

##**简介**
 在编写java代码的时候经常会遇到java.lang.ClassNotFoundExcetpion，它涉及到了java的类加载器概念。类加载器（ClassLoader）是 Java中的一个很重要的概念，它负责加载 Java 类的字节代码到 Java 虚拟机中，是java技术体系中比较核心的部分。虽然我们很多时候并不需要直接与类加载器打交道，不过如果对类加载器背后的机理有一定的了解，在调试ClassNotFoundException和 NoClassDefFoundError等异常的时候就容易多了，也有助于我们更好的了解JVM。

##**1 Java类加载器体系结构** 
###Java类加载器分类 
Java中的类加载器可以分为两类，一种是Java虚拟机自带类加载器，另一种是有开发人员编写的用户自定义类加载器。其中Java虚拟机自带类加载器有以下三个： 

>*  引导类加载器（bootstrap class loader）：它用来加载 Java 的核心库，是用原生代码（c++）来实现的，并不继承自 java.lang.ClassLoader。 
*  扩展类加载器（extensions class loader）：它用来加载 Java 的扩展库。Java 虚拟机的实现会提供一个扩展库目录。该类加载器在此目录里面查找并加载 Java 类。
*  系统类加载器（system class loader）：它根据 Java 应用的类路径（CLASSPATH）来加载 Java 类。一般来说，Java 应用的类都是由它来完成加载的。
可以通过 ClassLoader.getSystemClassLoader()来获取它。 

	//TestClassLoader.java
	package info.jason.classloader;
	class A
	{}
	public class TestClassLoader
	{
		public static void main(String[] args) throws Exception
		{
			//引导类加载器负责加载Java核心库
			//输出：null 
			//引导类加载器不是Java实现，所以为null
			System.out.println(Class.forName("java.lang.String").
					getClassLoader());			
			//自定义类A由系统类加载器加载
			//输出：sun.misc.Launcher$AppClassLoader@1e3118a
			System.out.println(Class.forName("info.jason.classloader.A").
					getClassLoader());
		}
	} 

	

通过继承 java.lang.ClassLoader类的方式，用户可以实现自定义类加载器，以满足一些特殊的需求。 
###类加载器的树状组织结构
除了引导类加载器之外，所有的类加载器都有一个父类加载器。对于系统提供的类加载器来说，系统类加载器的父类加载器是扩展类加载器，而扩展类加载器的父类加载器是引导类加载器；对于开发人员编写的类加载器来说，其父类加载器是加载此类加载器 Java 类的类加载器。因为类加载器 Java 类如同其它的 Java 类一样，也是要由类加载器来加载的。一般来说，开发人员编写的类加载器的父类加载器是系统类加载器。类加载器通过这种方式组织起来，形成树状结构。树的根节点就是引导类加载器。图 1中给出了一个典型的类加载器树状组织结构示意图，其中的箭头指向的是父类加载器。

![图1](/media/images/classloader.jpg)  
<center>图1</center> 
##**2 Java类加载器的父亲委托机制（Parent Delegation）** 
在父亲委托机制中，各个类加载器按照父子关系形成书树形结构，除了引导类加载器之外，其余类加载器有且只有一个父加载器。通俗的讲，就是某个特定的类加载器在接到加载类的请求时，首先将加载任务委托给父类加载器，依次递归，如果父类加载器可以完成类加载任务，就成功返回；只有父类加载器无法完成此加载任务时，才自己去加载。 如果某个类加载器能够加载一个类，那么该类加载器就称为定义类加载器；定义类加载器及其所有子类加载器都被称作初始类加载器。

ClassLoader的loadClass()代码分析: 

	// 检查类是否已被装载
	Class c = findLoadedClass(name);
	if (c == null ) {
		 // 指定类未被装载过
		 try {
			 if (parent != null ) {
				 // 如果父类加载器不为空， 则委派给父类加载
				 c = parent.loadClass(name, false );
			 } else {
				 // 如果父类加载器为空， 则委派给启动类加载加载
				 c = findBootstrapClass0(name);
			 }
		 } catch (ClassNotFoundException e) {
			 // 启动类加载器或父类加载器抛出异常后， 当前类加载器将其
			 // 捕获， 并通过findClass方法， 由自身加载
			 c = findClass(name);
		 }
	} 

##**3 自定义的类加载器** 
###用户自定义类加载器TestClassLoader
	//TestClassLoader.java
	import java.io.ByteArrayOutputStream;
	import java.io.File;
	import java.io.FileInputStream;
	import java.io.InputStream;
	
	public class TestClassLoader extends ClassLoader
	{
		private String name; // 类加载器的名字
		private String path; // 加载类的路径
		public TestClassLoader(String name){
			super(); // 让系统类加载器成为该类加载器的父加载器
			this.name = name;
		}
		public TestClassLoader(ClassLoader parent, String name){
			super(parent); // 显式指定该类加载器的父加载器
			this.name = name;
		}
		@Override
		public String toString(){
			return this.name;
		}
		public void setPath(String path){
			this.path = path;
		}
		@Override
		public Class<?> findClass(String name) throws ClassNotFoundException{
			byte[] data = this.loadClassData(name);
			return this.defineClass(name, data, 0, data.length);
		}
		//将class文件读入字节数组
		private byte[] loadClassData(String name){
			InputStream is = null;
			byte[] data = null;
			ByteArrayOutputStream baos = null;
			try{
				this.name = this.name.replace(".", "\\");
				is = new FileInputStream(new File(path + name + ".class"));
				baos = new ByteArrayOutputStream();
				int ch = 0;
				while (-1 != (ch = is.read())){
					baos.write(ch);
				}
				data = baos.toByteArray();
			}
			catch (Exception ex){
				ex.printStackTrace();
			}
			finally{
					try{
						is.close();
						baos.close();
					}
					catch (Exception ex){
						ex.printStackTrace();
					}
			}
			return data;
		}
	} 
###普通自定义类

	//A.java
	public class A
	{
		public A(){
			System.out.println("A is loaded by: " + 
			this.getClass().getClassLoader());
		}
	} 
###测试类

	//TestClass.java
	public class TestClass
	{
		public static void main(String[] args) throws Exception
		{
			//获得自定义类加载器loader1
			TestClassLoader loader1 = new TestClassLoader("loader1");
			
			//设置loader1加载路径为c:\\classloader\\loader1\\
			loader1.setPath("c:\\classloader\\loader1\\");
			
			//获得自定义类加载器loader1
			TestClassLoader loader2 = new TestClassLoader(loader1, "loader2");
			
			//设置loader1加载路径为c:\\classloader\\loader2\\
			loader2.setPath("c:\\classloader\\loader2\\");
			
			//使用loader1加载
			test(loader1);
		
			//使用loader1加载
			test(loader2);			
		}
		public static void test(ClassLoader loader) throws Exception
		{
			Class<?> clazz = loader.loadClass("A");
			clazz.newInstance();
		}
	}

###测试运行结果分析
将上述代码编译后得到的class文件拷贝到c:\\classloader\\，主要将A.class文件放入loader1和loader2目录下 

1.运行`Java TestClassr`，结果为：

	A is loaded by: loader1
	A is loaded by: loader1
说明A类由自定义加载器所加载。 

2.运行`java -cp .;c:\classloader\loader1 TestClass`，表示修改系统classpath路径为当前目录和c:\classloader\loader1目录，则执行结果为：

	A is loaded by: sun.misc.Launcher$AppClassLoader@513cf0
	A is loaded by: sun.misc.Launcher$AppClassLoader@513cf0 
即由系统类加载器负责加载。 
 
3.若再定义类B：

	class B
	{
		public B(){
			System.out.println("B is loaded by: " + this.getClass().getClassLoader());
		}
	}
修改TestClass加载部分代码为

	//使用loader1加载A
	loader1.loadClass("A").newInstance();
	//使用loader2加载B
	loader2.loadClass("B").newInstance();

将A.class、B.class分别放到loader1、loader2中，执行`java -cp .;c:\classloader\loader2 TestClass`,结果为：

	A is loaded by: loader1
	B is loaded by: sun.misc.Launcher$AppClassLoader@513cf0
结果说明了，加载A类，loader1委托给父亲加载，均不能加载，最后由loader1加载，而loader2委托给系统类加载器的时候，可以加载，所有类B有系统类加载器加载。

##**4 类加载器与 Web 容器** 

> 对于运行在 Java EE容器中的 Web 应用来说，类加载器的实现方式与一般的 Java 应用有所不同。不同的 Web
> 容器的实现方式也会有所不同。以 Apache Tomcat 来说，每个 Web
> 应用都有一个对应的类加载器实例。该类加载器也使用代理模式，所不同的是它是首先尝试去加载某个类，如果找不到再代理给父类加载器。这与一般类加载器的顺序是相反的。这是
> Java Servlet 规范中的推荐做法，其目的是使得 Web 应用自己的类的优先级高于 Web
> 容器提供的类。这种代理模式的一个例外是：Java 核心库的类是不在查找范围之内的。这也是为了保证 Java 核心库的类型安全。
> 绝大多数情况下，Web 应用的开发人员不需要考虑与类加载器相关的细节。 

下面给出几条简单的原则： 

> - 每个 Web 应用自己的 Java类文件和使用的库的 jar 包，分别放在 WEB-INF/classes和WEB-INF/lib目录下面。 

> - 多个应用共享的 Java类文件和 jar 包，分别放在 Web 容器指定的由所有 Web应用共享的目录下面。 

> - 当出现找不到类的错误时，检查当前类的类加载器和当前线程的上下文类加载器是否正确。