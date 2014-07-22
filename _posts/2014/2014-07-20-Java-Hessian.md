---
layout: post
title: Binary web service protocol - Hessian
category: programming
description: Hessian学习笔记
tags: 
- Hessian
- Java
- binary
- onhttp
---
{% include JB/setup %}
##**简介**
Hessian是一个轻量级的remoting onhttp工具，使用简单的方法提供了RMI的功能。 相比WebService，Hessian更简单、快捷。采用的是二进制RPC协议，所以它很适合于发送二进制数据.
>Hessian is a simple binary protocol for connecting web services. The com.caucho.hessian.client and com.caucho.hessian.server packages do not require any other Resin classes, so can be used in smaller clients, like applets.

>Because Hessian is a small protocol, J2ME devices like cell-phones can use it to connect to Resin servers. Because it's powerful, it can be used for EJB services.  

##**Demo实现**
###**1 实现步骤**

###**2 服务端代码**
1.代码结构  
![Server端代码结构](/assets/images/hessianServer.jpg "Server端代码结构") 

2.web.xml 配置HessianServlet为调用入口 

	<servlet>  
		<servlet-name>hessianService</servlet-name>
		<servlet-class>com.caucho.hessian.server.HessianServlet</servlet-class>
		<init-param>
			<param-name>service-class</param-name>
			<param-value>info.jason.server.BasicServer</param-value>
		</init-param>
		<load-on-startup>1</load-on-startup>
	</servlet>

	<servlet-mapping>
		<servlet-name>hessianService</servlet-name>
		<url-pattern>/hessianService</url-pattern>
	</servlet-mapping>
3.核心代码  

* BasicAPI.java 定义Server端API接口  

	    package info.jason.server;
    	import java.util.Map;
    
    	public interface BasicAPI
    	{
    		public Map<Object, Object> invoke(String serviceCode, Map<Object, Object> params);
    	}

* BasicServer.java 实现BasicAPI接口，反射动态调用具体ServiceBean  
	
		package info.jason.server;
		import info.jason.service.BaseService;
		import info.jason.util.ServerUtil;
		import java.util.HashMap;
		import java.util.Map;
		
		public class BasicServer implements BasicAPI
		{
			@Override
			public Map<Object, Object> invoke(String serviceName, Map<Object, Object> params)
			{	
				Map<Object, Object> resultMap = new HashMap<Object, Object>();
				if (serviceName == null || serviceName.trim().length() == 0)
				{
					System.out.println("服务名为空");
				}
				
				String beanName = ServerUtil.getServerBean(serviceName);
				if(beanName.trim().length() == 0){
					System.out.println("BeanName为空！");
				}
				try
				{
					Object obj = Class.forName(beanName).newInstance();
					if (obj instanceof BaseService)
					{
						BaseService service = (BaseService) obj;
						resultMap = service.doService(params);
						return resultMap;
					}
				}
				catch (Exception e)
				{
					e.printStackTrace();
				}
				return null;
			}
		}  

4.服务映射  

* servicecode-mapping.xml Server端服务配置文件，将服务名与对应的实现类映射关系配置在该文件，BasicServer类根据该XML获取具体实现类  

		<?xml version="1.0" encoding="UTF-8"?>
		<serivces>
			<serivce>
				<serviceName>helloService</serviceName>
				<serviceBean>info.jason.service.impl.HelloService</serviceBean>
			</serivce>
		</serivces>

5.service代码  

* BaseService.java 定义BaseService接口，具体业务serviceBean需实现该接口   
		
		package info.jason.service;
		import java.util.Map;

		public abstract class BaseService
		{
			public abstract Map<Object, Object> doService(Map<Object, Object> params);
		}  
* HelloService.java Server端具体service类，实现BaseService接口
  
		package info.jason.service.impl;
		
		import info.jason.service.BaseService;
		
		import java.util.HashMap;
		import java.util.Map;
		
		public class HelloService implements BaseService
		{
		
			@Override
			public Map<Object, Object> doService(Map<Object, Object> params)
			{
				Map<Object, Object> resultMap = new HashMap<Object, Object>();
				if (params != null && params.size() > 0)
				{
					resultMap.put("word", "Hello " + params.get("name"));
		
				}
				return resultMap;
			}
		
		} 
6.辅助类  
ServerUtil.java Server端Util类，用于读取配置文件 

		package info.jason.util;
		
		import java.io.File;
		import java.util.HashMap;
		import java.util.Iterator;
		import java.util.Map;
		
		import org.dom4j.Document;
		import org.dom4j.DocumentException;
		import org.dom4j.Element;
		import org.dom4j.io.SAXReader;
		
		public class ServerUtil
		{
			private static final String transMapXmlPath = "/info/jason/config/servicecode-mapping.xml";
		
			/**
			 * 返回service与实现类的映射Map
			 * 
			 * @return
			 */
			@SuppressWarnings("unchecked")
			public static Map<String, String> getServiceMapping()
			{
				Map<String, String> result = new HashMap<String, String>();
		
				String path = ServerUtil.class.getResource("/").getPath();
				SAXReader saxReader = new SAXReader();
				try
				{
					Document document = saxReader
							.read(new File(path + transMapXmlPath));
		
					Element root = document.getRootElement();
					Iterator<Element> iter = root.elementIterator();
		
					while (iter.hasNext())
					{
						Element e = iter.next();
						String serviceName = e.element("serviceName")
							.getData().toString();
						String serviceBean = e.element("serviceBean")
							.getData().toString();
						if (!"".equalsIgnoreCase(serviceName) && 
								!"".equalsIgnoreCase(serviceBean)){
							result.put(serviceName, serviceBean);
						}
					}
		
				}
				catch (DocumentException e)
				{
					e.printStackTrace();
				}
		
				return result;
			}
		
			/**
			 * 获取服务对应实现类
			 * 
			 * @param transcode
			 * @return
			 */
			public static String getServerBean(String serviceName)
			{
				Map<String, String> transcodeMap = getServiceMapping();
				if (transcodeMap != null && transcodeMap.containsKey(serviceName))
				{
					return transcodeMap.get(serviceName);
				}
				return null;
			}
		}
###**3 客户端代码**
1.代码结构  
![Client代码接口](/assets/images/hessianClient.jpg "Client代码接口")   
2.服务调用  
Client.java 客户端用main写一个简单的调用。在调用之前需要把Server端的info.jason.server打成Jar包加入到Client项目的build Path，如果是Java Web项目将Jar放入到lib目录下  

		package info.jason.client;
		
		import info.jason.server.BasicAPI;
		
		import java.net.MalformedURLException;
		import java.util.HashMap;
		import java.util.Map;
		
		import com.caucho.hessian.client.HessianProxyFactory;
		
		public class Client
		{
			public static void main(String[] args) throws MalformedURLException
			{
				//hessian服务的url 其中hessianService是项目名
				String url = "http://127.0.0.1:8080/HessionServer/hessianService";
				//创建HessianProxyFactory实例
				HessianProxyFactory factory = new HessianProxyFactory();
				//获得Hessian服务的远程引用
				try {
					BasicAPI basicAPI = (BasicAPI)factory.create(BasicAPI.class,url);
					Map<Object, Object> params = new HashMap<Object, Object>();
					params.put("name","jason");
					
					System.out.println(basicAPI.invoke("helloService",params).get("word"));
					
				} catch (MalformedURLException e) {
					e.printStackTrace();
				}
			}
		}

##**Hessian机制分析**
Hessian远程访问基于序列化和反序列化的方式，调用远程的时候Hessian把服务端的Java对象转变成字节序列，然后通过Http传输到目标主机，然后按照一定的协议标准进行反序列，从而实现远程调用，并以同样的方式返回数据。

![Hessian机制](/assets/images/hessian.jpg "Hessian机制")  

在web.xml配置文件中，HessianServlet作为处理Servlet，在被调用的时候将info.jason.server.BasicServer对象序列化通过Http发送给Client，HessianServlet关键代码如下:  

	/**
	 * Sets the service class.
	 */
	public void setService(Object service)
	{
	   setHome(service); //将Web.xml中的info.jason.server.BasicServer读入
	}

	public void service(ServletRequest request, ServletResponse response)
	    throws IOException, ServletException
	  {
	    HttpServletRequest req = (HttpServletRequest) request;
	    HttpServletResponse res = (HttpServletResponse) response;
	
	    if (! req.getMethod().equals("POST")) {
	      res.setStatus(500); // , "Hessian Requires POST");
	      PrintWriter out = res.getWriter();
	
	      res.setContentType("text/html");
	      out.println("<h1>Hessian Requires POST</h1>");
	      
	      return;
	    }
	
	    String serviceId = req.getPathInfo();
	    String objectId = req.getParameter("id");
	    if (objectId == null)
	      objectId = req.getParameter("ejbid");
	
	    ServiceContext.begin(req, res, serviceId, objectId);
	
	    try {
	      InputStream is = request.getInputStream();
	      OutputStream os = response.getOutputStream();
	
	      response.setContentType("x-application/hessian");
	
	      SerializerFactory serializerFactory = getSerializerFactory();
	
	      invoke(is, os, objectId, serializerFactory);//调用方法并序列化BasicServer对象
	    } catch (RuntimeException e) {
	      throw e;
	    } catch (ServletException e) {
	      throw e;
	    } catch (Throwable e) {
	      throw new ServletException(e);
	    } finally {
	      ServiceContext.end();
	    }
	  }  
详细代码实现可以参看Hessian源码，总体执行步骤为：  

* 接收输入流，并通过SerializerFactory转化为Hessian特有的Hessian2Input
* 设置输出流，并通过SerializerFactory转化为Hessian特有的Hessian2Output
* 根据配置的接口和实现参数，调用服务，并把结果写入到输出流Hessian2Output中

