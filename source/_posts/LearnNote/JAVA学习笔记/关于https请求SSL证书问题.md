---
title: 关于https请求SSL证书问题
date: 2025-08-06 18:30:00
author: 长白崎
categories:
  - "Java"
tags:
  - "Java"
  - "SSL"
  - "后端"
---

# 关于https请求SSL证书问题

---

## 说明

这个问题是我在公司项目中产品上线遇到的一个问题,其实就是个SSL证书所用算法不安全问题。这个问题发生在公司产品进行支付模块进行回调时HTTP请求发生的，Java 默认的 SSL 安全策略限制了使用不安全的加密算法，而我访问的商户服务器对应所使用的证书使用的是 **SHA1withRSA** 签名算法，这是被认为 **不再安全** 的算法，因此连接被拒绝。

* 从 **Java 8u181** 开始，**SHA-1** 证书默认被禁止用于 TLS 连接（因为存在碰撞攻击风险）。
* 触发了 `checkAlgorithmConstraints` 安全检查，SSL 握手失败。

当时的报错：

```java
javax.net.ssl.SSLHandshakeException: Certificates do not conform to algorithm constraints
	at sun.security.ssl.Alert.createSSLException(Alert.java:131)
	at sun.security.ssl.TransportContext.fatal(TransportContext.java:324)
	at sun.security.ssl.TransportContext.fatal(TransportContext.java:267)
	at sun.security.ssl.TransportContext.fatal(TransportContext.java:262)
	at sun.security.ssl.CertificateMessage$T12CertificateConsumer.checkServerCerts(CertificateMessage.java:654)
	at sun.security.ssl.CertificateMessage$T12CertificateConsumer.onCertificate(CertificateMessage.java:473)
	at sun.security.ssl.CertificateMessage$T12CertificateConsumer.consume(CertificateMessage.java:369)
	at sun.security.ssl.SSLHandshake.consume(SSLHandshake.java:377)
	at sun.security.ssl.HandshakeContext.dispatch(HandshakeContext.java:444)
	at sun.security.ssl.HandshakeContext.dispatch(HandshakeContext.java:422)
	at sun.security.ssl.TransportContext.dispatch(TransportContext.java:182)
	at sun.security.ssl.SSLTransport.decode(SSLTransport.java:152)
	at sun.security.ssl.SSLSocketImpl.decode(SSLSocketImpl.java:1397)
	at sun.security.ssl.SSLSocketImpl.readHandshakeRecord(SSLSocketImpl.java:1305)
	at sun.security.ssl.SSLSocketImpl.startHandshake(SSLSocketImpl.java:440)
	at sun.net.www.protocol.https.HttpsClient.afterConnect(HttpsClient.java:559)
	at sun.net.www.protocol.https.AbstractDelegateHttpsURLConnection.connect(AbstractDelegateHttpsURLConnection.java:197)
	at sun.net.www.protocol.http.HttpURLConnection.getOutputStream0(HttpURLConnection.java:1342)
	at sun.net.www.protocol.http.HttpURLConnection.getOutputStream(HttpURLConnection.java:1317)
	at sun.net.www.protocol.https.HttpsURLConnectionImpl.getOutputStream(HttpsURLConnectionImpl.java:264)
	at org.xxpay.core.common.util.HttpClient.doPost(HttpClient.java:470)
	at org.xxpay.core.common.util.HttpClient.httpsPostMethod(HttpClient.java:403)
	at org.xxpay.core.common.util.HttpClient.callHttps(HttpClient.java:329)
	at org.xxpay.core.common.util.HttpClient.calls(HttpClient.java:244)
	at org.xxpay.core.common.util.HttpClient.callHttpsPost(HttpClient.java:533)
	at org.xxpay.core.common.util.XXPayUtil.call4Post(XXPayUtil.java:153)
	at org.xxpay.pay.mq.Mq4MchNotify.httpPost(Mq4MchNotify.java:57)
	at org.xxpay.pay.mq.Mq4MchPayNotify.receive(Mq4MchPayNotify.java:49)
	at org.xxpay.pay.mq.Mq4MchPayNotify$$FastClassBySpringCGLIB$$9877e83b.invoke(<generated>)
	at org.springframework.cglib.proxy.MethodProxy.invoke(MethodProxy.java:204)
	at org.springframework.aop.framework.CglibAopProxy$CglibMethodInvocation.invokeJoinpoint(CglibAopProxy.java:738)
	at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:157)
	at org.springframework.aop.interceptor.AsyncExecutionInterceptor$1.call(AsyncExecutionInterceptor.java:115)
	at java.util.concurrent.FutureTask.run(FutureTask.java:266)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1149)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:750)
Caused by: java.security.cert.CertificateException: Certificates do not conform to algorithm constraints
	at sun.security.ssl.AbstractTrustManagerWrapper.checkAlgorithmConstraints(SSLContextImpl.java:1429)
	at sun.security.ssl.AbstractTrustManagerWrapper.checkAdditionalTrust(SSLContextImpl.java:1354)
	at sun.security.ssl.AbstractTrustManagerWrapper.checkServerTrusted(SSLContextImpl.java:1298)
	at sun.security.ssl.CertificateMessage$T12CertificateConsumer.checkServerCerts(CertificateMessage.java:638)
	... 32 common frames omitted
Caused by: java.security.cert.CertPathValidatorException: Algorithm constraints check failed on signature algorithm: SHA1withRSA
	at sun.security.provider.certpath.AlgorithmChecker.check(AlgorithmChecker.java:237)
	at sun.security.ssl.AbstractTrustManagerWrapper.checkAlgorithmConstraints(SSLContextImpl.java:1425)
	... 35 common frames omitted
```



这里大部分网上说明的方案是修改Java的`java.security`文件里面的`jdk.certpath.disabledAlgorithms`配置将其限制的算法给删除即可，但是我尝试过后发现并没有任何作用,且这也是一个不太好的措施。

因为这么做会有如下缺点：

a.系统安全级别降低，JDK8对SSL证书的算法安全要求提高很明显是一种更安全的举措
b.运维同志要把线上所有服务器的JDK配置都改掉，更重要的是如果新开服，买了新机器是不是还得改？太麻烦，需要额外维护



所以这里通过查阅相关资料，我发现可以通过修改Http请求时候的配置来进行绕过次审查。但是当我查看对应出问题的Http请求代码的时候发现公司代码之前就已经加过绕过证书的代码

这里我们看一下原本代码是怎么操作的：(`错误解决方法`)

* 首先他是创建了一个类

```java
private static class TrustAnyTrustManager implements X509TrustManager {

     public void checkClientTrusted(X509Certificate[] chain, String authType)
            throws CertificateException {
     }

     public void checkServerTrusted(X509Certificate[] chain, String authType)
            throws CertificateException {
      }

     public X509Certificate[] getAcceptedIssuers() {
          return new X509Certificate[]{};
     }
}
```

* 之后了他在需要http回调请求的代码上面加了如下如下配置：

```java
SSLContext sslContext = SSLContext.getInstance("SSL");
sslContext.init(null, new TrustManager[]{new TrustAnyTrustManager()},new java.security.SecureRandom());
```

这里他是通过实现`X509TrustManager`接口来进行的，这其实就是不生效的原因，通过查询相关文档我们发现，实现此接口的话即使用默认的系统网络库默认的信任管理/校验方案，系统会使用证书链的信任管理策略，所以你越过SSL越过了个寂寞？



## 解决方案

我们先来看看[oracle](https://docs.oracle.com/javase/8/docs/technotes/guides/security/jsse/JSSERefGuide.html#X509ExtendedTrustManager)官方文档的说明。

```
X509ExtendedTrustManager Class
The X509ExtendedTrustManager class is an abstract implementation of the X509TrustManager interface. It adds methods for connection-sensitive trust management. In addition, it enables endpoint verification at the TLS layer.

In TLS 1.2 and later, both client and server can specify which hash and signature algorithms they will accept. To authenticate the remote side, authentication decisions must be based on both X509 certificates and the local accepted hash and signature algorithms. The local accepted hash and signature algorithms can be obtained using the ExtendedSSLSession.getLocalSupportedSignatureAlgorithms() method.

The ExtendedSSLSession object can be retrieved by calling the SSLSocket.getHandshakeSession() method or the SSLEngine.getHandshakeSession() method.

The X509TrustManager interface is not connection-sensitive. It provides no way to access SSLSocket or SSLEngine session properties.

Besides TLS 1.2 support, the X509ExtendedTrustManager class also supports algorithm constraints and SSL layer host name verification. For JSSE providers and trust manager implementations, the X509ExtendedTrustManager class is highly recommended over the legacy X509TrustManager interface.
```

所以正确做法是正确的解决方案应该是实现[X509ExtendedTrustManager](https://docs.oracle.com/javase/8/docs/technotes/guides/security/jsse/JSSERefGuide.html#X509ExtendedTrustManager)

```java
 private static class TrustAnyTrustManager extends X509ExtendedTrustManager {

        @Override
        public void checkClientTrusted(X509Certificate[] x509Certificates, String s, Socket socket) throws CertificateException {

        }

        @Override
        public void checkServerTrusted(X509Certificate[] x509Certificates, String s, Socket socket) throws CertificateException {

        }

        @Override
        public void checkClientTrusted(X509Certificate[] x509Certificates, String s, SSLEngine sslEngine) throws CertificateException {

        }

        @Override
        public void checkServerTrusted(X509Certificate[] x509Certificates, String s, SSLEngine sslEngine) throws CertificateException {

        }

        @Override
        public void checkClientTrusted(X509Certificate[] x509Certificates, String s) throws CertificateException {

        }

        @Override
        public void checkServerTrusted(X509Certificate[] x509Certificates, String s) throws CertificateException {

        }

        @Override
        public X509Certificate[] getAcceptedIssuers() {
            return new X509Certificate[0];
        }
    }
```

然后在需要http请求的地方先进行以下配置后再请求：

```java
SSLContext sslContext = SSLContext.getInstance("SSL");
sslContext.init(null, new TrustManager[]{new TrustAnyTrustManager()},new java.security.SecureRandom());
```

