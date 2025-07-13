---
title: Go项目模块划分
date: 2025-07-13 13:44:00
author: 长白崎
categories:
  - "go"
tags:
  - "go"
---

# Go项目模块划分

## 1 基础包结构

一个基本的Go模块的所有代码都位于项目的根目录中。该项目一般仅仅包含一个模块，而该模块又仅仅包含一个包。该包名与模块名称的最后一个路径部分相匹配。对于一个只需要一个Go文件的得长简单的包，项目结构如下：

```
project-root-directory/
	go.mod
	modname.go
	modname_test.go
```



如果说你的项目是需要上传Github仓库的（例如地址为：github.com/Changbaiqi/go-project)，那么在go.mod文件中的模块行为应该写成`module github.com/Changbaiqi/go-project`

在对应代码文件中，通过以下方式申明了该包：

```go
package go-project
// ... 你的代码
```

这样用户就可以用这个包了，只需要在他们项目GO代码中通过以下方式导入即可：

```go
import "github.com/Changbaiqi/go-project"
```

一个go语言包可以被拆分成多个文件，这些文件都位于同一个目录中，例如：

```
project-root-directory/
	go.mod
	auth.go
	auth_test.go
	client.go
	main.go
```



在上面文件结构中，main.go文件中包含有`func main`这个函数，这里main.go文件的命名只是一个惯例，其实可以命名成其他文件，比如`ccc.go`。

假设此目录已上传至Github仓库（地址为github.com/Changbaiqi/go-project)，那么在go.mod文件中的模块应该写为：

```go
module github.com/Changbaiqi/go-project
```

并且用户能够通过一下方式将其拉取到自己的项目当中：

```shell
$ go install github.com/Changbaiqi/go-project@latest
```



## 2 项目中支持的包和指令

一些复杂项目中，比如需要提供外部API接口供给开发者调用这些，可能会代码进行模块化拆分，将其放入辅助包中以实现模块化。期初，建议将此类代码放置在一个名为“internal”的目录中；这样可以避免其他人在引用我们模块的时候引用到我们不想对外开放的代码，从而限制其在外部使用中的应用范围。由于其他项目无法从我们的`内部目录`(非internal)中导入代码，因此我们可以很好的重构其对外暴露接口中深层次的底层代码，这样就不会影响外部用户的调用以及布局。其项目包结构如下：

```
project-root-directory/
	internal/
		auth/
			auth.go
			auth_test.go
		hash/
			hash.go
			hash_test.go
	go.mod
	modname.go
	modname_test.go
```

“modname.go”文件声明了“modname” 这个包，而“auth.go”文件则声明了“auth” 这个包，以此类推。“modname.go”可以像下面这
样导入“auth”包：

```go
import "github.com/Changbaiqi/go-project/internal/auth"
```

在内部目录中带有支持包的命令的布局非常相似，除了根目录中的文件声明package main。



## 3 多包

一个模块可以由多个可导入的包组成；每个包都有自己的目录，并且可以分层结构。

下面是一个示例项目结构：

```
project-root-directory/
	go.mod
	modname.go
	modname_test.go
	auth/
		auth.go
		auth_test.go
		token/
			token.go
			token_test.go
	hash/
		hash.go
	internal/
		trace/
			trace.go
```

作为提醒，我们假定在go.mod中的module行为内容为：

```
module github.com/Changbaiqi/modname
```

这个modname包位于根目录下，它声明了“modename”这个包，并且用户可以通过以下方式导入它：

```go
import "github.com/Changbaiqi/modname"
```

用户可以通过下面方式导入子包：

```go
import "github.com/Changbaiqi/modname/auth"
import "github.com/Changbaiqi/modname/auth/token"
import "github.com/Changbaiqi/modname/hash"
```

位于“internal/trace”目录下的包追踪信息无法在本模块之外被导入。建议竟可能将包信息保留在“internal”目录中。



## 4 多指令



## Web项目

```
project-root-directory/
	go.mod
	internal/
		auth/
			...
		metrics/
			...
		model/
			...
	cmd/
		api-server/
			main.go
		metrics-analyzer/
			main.go
		...
	... the project's other directories with non-Go code
```

