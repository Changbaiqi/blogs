---
title: 百度Apollo
date: 2026-02-20 17:58:49
author: 长白崎
categories:
  - "AI"
    "Apollo"
tags:
  - "AI"
    "Apollo"
---



# 百度Apollo

## 1 关于

Baidu Apollo(阿波罗)是百度发布的自动驾驶计划，包括开放平台及企业版解决方案。Apollo开放平台面向所有开发者提供最开放、完整、安全的自动驾驶开源平台。



## 2 准备工作

在正式安装Apollo或C有e人RT之前，需要先准备基础环境，基础环境主要包含如下内容：

1.安装Ubuntu Linux

2.安装NVIDIA GPU驱动(可选)；

3.安装docker；

4.安装NVIDIA Container Toolkit。

具体的安装流程可以参考[Apollo官方安装向导](https://github.com/ApolloAuto/apollo/blob/master/docs/%E5%AE%89%E8%A3%85%E6%8C%87%E5%8D%97/Installation%20Guide.md)



## Cyber RT安装

### 拉取Apollo源码

克隆 Apollo源码仓库:

```shell
git clone https://github.com/ApolloAuto/apollo.git
```

GitHub在国内访问速度可能很慢，可以使用Gitee替代:

```shell
git clone https://gitee.com/ApolloAuto/apollo.git
```



### 启动Apollo Docker 开发容器

进入到Apollo源码根目录，执行下述命令以启动Apollo Dock测人开发容器：

```shell
./docker/scripts/dev_start.sh
```

如果只是使用Cyber RT可以执行:

```shell
./docker/scripts/cyber_start.sh
```

或(国内建议选择此项,速度更快):

```shell
./docker/scripts/cyber_start.sh -g cn
```



### 进入Apollo Docker开发容器

启动Apollo Docker 开发容器后，执行下述命令进入容器:

```shell
./docker/scripts/dev_into.sh
```

如果只是使用Cyber RT可以执行:

```shell
./docker/scripts/cyber_into.sh
```

可以发现，进入容器后终端信息发生了相应变化，后面的操作将在容器中进行。



### 在容器中构建Apollo

进入Apollo Docker 开发容器后，在容器终端中执行下述命令构建Apollo:

```shell
./apollo.sh build
```

如果只是使用Cyber RT可以执行:

```shell
./apollo.sh build cyber
```

> `注`:如果报无权限相关异常，在命令前加sudo即可，如遇其他错误，重新执行命令直至成功。



## 测试

测试前准备:

默认情况下，cyber的日志信新城是写出到磁盘文件，而不会在终端输出，为了方便查看运行结果，我们需要修改cyber的配置文件，使其能够将日志信息输出在终端，具体操作如下：

1.打开配置文件

```shell
vi cyber/setup.bash
```

2.修改并退出编辑器

文件中参数GLOG_alsologtostderr的默认值为0，需要修改1

```shell
export GLOG_alsologtostderr=1
```

3.重新加载配置文件

```shell
source cyber/setup.bash
```



## 递归神经网络

Apollo中使用RNN来预测车辆的目标车道。它为车道序列提供一个RNN模型，为障碍物提供另一个RNN模型，连接这两个RNN的输出，并且将它们的输出输入到另一个神经网络，该网络会估算每个车道序列的概率，具有最高概率的序列就是预测目标车辆将遵循的序列。

