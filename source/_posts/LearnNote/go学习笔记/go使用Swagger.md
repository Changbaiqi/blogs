---
title: go使用Swagger
date: 2026-01-02 13:14:54
author: 长白崎
categories:
  - "GO"
tags:
  - "Swagger"
---



# go使用Swagger

## 1 安装Swagger依赖

```shell
go get -u github.com/swaggo/swag/cmd/swag
go install github.com/swaggo/swag/cmd/swag
```

```shell

go get -u github.com/swaggo/gin-swagger #如果配合gin则添加
go get -u github.com/swaggo/files
go get -u github.com/alecthomas/template
```

## 2 如何使用Swagger

### 2.1 初始化文档

使用`swag CLI`生成文档，可使用下面指令生成Swagger文档（默认是生成docs.go、swagger.json和swagger.yaml文件）

```shell
swag init
```

`注意：`使用init之后一定要记得之后再router对应代码文件中导入生成的docs目录比如`import _ "user_service/docs"`

### `swag init` 常用选项

| 选项                     | 说明                                                         | 默认值      |
| ------------------------ | ------------------------------------------------------------ | ----------- |
| `--generalInfo, -g`      | 指定包含通用 API 信息的 Go 文件路径                          | `main.go`   |
| `--dir, -d`              | 指定解析的目录                                               | `./`        |
| `--exclude`              | 排除解析的目录（多个目录用逗号分隔）                         | 空          |
| `--propertyStrategy, -p` | 结构体字段命名规则（`snakecase`、`camelcase`、`pascalcase`） | `camelcase` |
| `--output, -o`           | 输出文件目录（`swagger.json`、`swagger.yaml` 和 `docs.go`）  | `./docs`    |
| `--parseVendor`          | 是否解析 `vendor` 目录中的 Go 文件                           | 否          |
| `--parseDependency`      | 是否解析依赖目录中的 Go 文件                                 | 否          |
| `--parseInternal`        | 是否解析 `internal` 包中的 Go 文件                           | 否          |
| `--instanceName`         | 设置文档实例名称                                             | `swagger`   |



### 2.2 格式化Swagger注解

使用`swag fmt`命令可以格式化项目中的Swagger注释，确保注释符合规范：

```shell
swag fmt
```

## 3 Swagger 注释格式

Swagger 使用声明式注释来定义 API 的元信息。以下是常用注释及其说明：

### 3.1 通用 API 信息

通常在 `main.go` 中定义，用于描述整个 API 的基本信息：

```go
// @title Swagger Example API
// @version 1.0
// @description This is a sample server celler server.
// @termsOfService http://swagger.io/terms/
// @contact.name API Support
// @contact.url http://www.swagger.io/support
// @contact.email support@swagger.io
// @license.name Apache 2.0
// @license.url http://www.apache.org/licenses/LICENSE-2.0.html
// @host localhost:8080
// @BasePath /api/v1
// @schemes http https
```

### 3.2 API 路由注释

在具体路由处理函数上方添加注释，定义该接口的行为：

```go
// GetPostById
// @Summary 获取文章信息
// @Produce json
// @Param id path string true "文章ID"
// @Success 200 {object} Post "成功返回文章信息"
// @Failure 400 {string} string "请求参数错误"
// @Router /post/{id} [get]
func GetPostById(c *gin.Context) {
    // 函数实现
}
```



### 3.3 示例项目代码

以下是一个完整的示例，展示如何在 Gin 项目中集成 Swagger：

```go
package main

import (
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	"strconv"
	_ "swagger/docs" // 导入生成的 Swagger 文档
)

// Post 文章结构体
type Post struct {
	ID          int64  `json:"id"`
	Title       string `json:"title"`
	Content     string `json:"content"`
	Description string `json:"description"`
}

func main() {
	r := gin.Default()
	r.GET("/post/:id", GetPostById)
	// 配置 Swagger 路由
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	r.Run(":8080")
}

// GetPostById 获取文章信息
// @Summary 获取文章信息
// @Produce json
// @Param id path string true "文章ID"
// @Success 200 {object} Post "成功返回文章信息"
// @Failure 400 {string} string "请求参数错误"
// @Router /post/{id} [get]
func GetPostById(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.String(400, err.Error())
		return
	}
	c.JSON(200, Post{
		ID:          id,
		Title:       "codepzj",
		Content:     "测试",
		Description: "测试",
	})
}
```

## 4 生成并访问文档

1. 运行 `swag init` 生成文档。
2. 启动项目：`go run main.go`。
3. 在浏览器中访问`http://localhost:8080/swagger/index.html`，即可查看交互式 API 文档。