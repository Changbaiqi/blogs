---
title: 关于Linux出现网络接口ens33出现DOWN状态如何解决
date: 2025-06-23 17:07:00
author: 长白崎
categories:
  - "Linux"
tags:
  - "Linux"
---





# 关于Linux出现网络接口ens33出现DOWN状态如何解决

---

这个问题是我在使用Ubuntu学习的时候发生的问题，当时是发现apt install指令无法正常下载，然后使用ip addr指令之后发现网络接口ens33接口状态为down，这很明显非常不对劲，这里的话我是执行如下指令进行恢复的：

```shell
# 先启动ens33网络接口
sudo ip link set ens33 up
# 使用DHCP自动获取IP地址
sudo dhclient ens33
```

执行完成之后我们再使用如下指令检查一下网络接口状态

```shell
ip a s
```

然后我们再使用ping去测试一下网络连接，如果正常，说明就可以了。

