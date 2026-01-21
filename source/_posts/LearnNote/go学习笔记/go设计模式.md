---
title: go设计模式
date: 2025-12-24 09:46:09
author: 长白崎
categories:
  - "Go"
tags:
  - "Go"
---
# go设计模式


---

## 1. Factory 工厂

### 场景

根据配置创建不同实现：例如存储（内存/文件/S3）、AI provider（OpenAI/豆包/DeepSeek）等。

### 代码
```go
package factory

import (
	"errors"
	"fmt"
	"sync"
)

type Storage interface {
	Put(key, val string) error
	Get(key string) (string, error)
}

type MemoryStorage struct {
	mu sync.RWMutex
	m  map[string]string
}

func NewMemoryStorage() *MemoryStorage {
	return &MemoryStorage{m: map[string]string{}}
}
func (s *MemoryStorage) Put(key, val string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.m[key] = val
	return nil
}
func (s *MemoryStorage) Get(key string) (string, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	v, ok := s.m[key]
	if !ok {
		return "", errors.New("not found")
	}
	return v, nil
}

type FileStorage struct {
	// demo：只展示结构；真实会有文件路径、序列化等
	path string
}

func NewFileStorage(path string) *FileStorage { return &FileStorage{path: path} }
func (s *FileStorage) Put(key, val string) error {
	return fmt.Errorf("write to file %s: %s=%s (demo)", s.path, key, val)
}
func (s *FileStorage) Get(key string) (string, error) {
	return "", fmt.Errorf("read from file %s key=%s (demo)", s.path, key)
}

// Simple Factory
func NewStorage(kind string) (Storage, error) {
	switch kind {
	case "memory":
		return NewMemoryStorage(), nil
	case "file":
		return NewFileStorage("./data.txt"), nil
	default:
		return nil, fmt.Errorf("unknown storage kind: %s", kind)
	}
}
```

### 用法

```go
s, _ := factory.NewStorage("memory")
_ = s.Put("hello", "world")
v, _ := s.Get("hello")
println(v)
```

---

## 2. Abstract Factory 抽象工厂

### 场景

一整套组件一起切换：不同云厂商（对象存储 + 队列 + 数据库），不同 UI 主题等。

### 代码

```go
package abstractfactory

import "fmt"

type ObjectStore interface{ PutObject(name string) error }
type Queue interface{ Publish(topic string, msg []byte) error }
type DB interface{ Exec(sql string) error }

// 抽象工厂：生产一套“产品族”
type CloudFactory interface {
	ObjectStore() ObjectStore
	Queue() Queue
	DB() DB
}

// ====== AWS 实现（demo）======
type awsObjectStore struct{}
func (o awsObjectStore) PutObject(name string) error { fmt.Println("aws s3 put:", name); return nil }

type awsQueue struct{}
func (q awsQueue) Publish(topic string, msg []byte) error { fmt.Println("aws sqs pub:", topic, string(msg)); return nil }

type awsDB struct{}
func (d awsDB) Exec(sql string) error { fmt.Println("aws rds exec:", sql); return nil }

type AWSFactory struct{}
func (AWSFactory) ObjectStore() ObjectStore { return awsObjectStore{} }
func (AWSFactory) Queue() Queue             { return awsQueue{} }
func (AWSFactory) DB() DB                   { return awsDB{} }

// ====== Aliyun 实现（demo）======
type aliyunObjectStore struct{}
func (o aliyunObjectStore) PutObject(name string) error { fmt.Println("aliyun oss put:", name); return nil }

type aliyunQueue struct{}
func (q aliyunQueue) Publish(topic string, msg []byte) error { fmt.Println("aliyun mq pub:", topic, string(msg)); return nil }

type aliyunDB struct{}
func (d aliyunDB) Exec(sql string) error { fmt.Println("aliyun rds exec:", sql); return nil }

type AliyunFactory struct{}
func (AliyunFactory) ObjectStore() ObjectStore { return aliyunObjectStore{} }
func (AliyunFactory) Queue() Queue             { return aliyunQueue{} }
func (AliyunFactory) DB() DB                   { return aliyunDB{} }
```

### 用法

```go
var f abstractfactory.CloudFactory = abstractfactory.AWSFactory{} // 一行切换整套
_ = f.ObjectStore().PutObject("a.png")
_ = f.Queue().Publish("events", []byte("hi"))
_ = f.DB().Exec("select 1")
```

---

## 3. Builder / Functional Options 构建器

### 场景

构造参数很多、默认值多、可选项多：HTTP Client、业务 SDK、机器人配置。

> Go 最常用写法：**Functional Options**（比传统 Builder 更地道）

### 代码

```go
package options

import (
	"net/http"
	"time"
)

type Client struct {
	baseURL string
	timeout time.Duration
	retry   int
	http    *http.Client
}

type Option func(*Client)

func WithBaseURL(u string) Option {
	return func(c *Client) { c.baseURL = u }
}
func WithTimeout(d time.Duration) Option {
	return func(c *Client) {
		c.timeout = d
		c.http.Timeout = d
	}
}
func WithRetry(n int) Option {
	return func(c *Client) { c.retry = n }
}

func NewClient(opts ...Option) *Client {
	c := &Client{
		baseURL: "https://example.com",
		timeout: 10 * time.Second,
		retry:   0,
		http:    &http.Client{Timeout: 10 * time.Second},
	}
	for _, opt := range opts {
		opt(c)
	}
	return c
}
```

### 用法

```go
c := options.NewClient(
	options.WithBaseURL("https://api.xxx.com"),
	options.WithTimeout(3*time.Second),
	options.WithRetry(2),
)
_ = c
```

---

## 4. Singleton 单例

### 场景

全局唯一：日志器、配置加载器、连接池（注意测试难度/全局状态污染）。

### 代码（sync.Once）

```go
package singleton

import (
	"log"
	"os"
	"sync"
)

type Logger struct{ *log.Logger }

var (
	once sync.Once
	ins  *Logger
)

func GetLogger() *Logger {
	once.Do(func() {
		ins = &Logger{Logger: log.New(os.Stdout, "[app] ", log.LstdFlags|log.Lshortfile)}
	})
	return ins
}
```

### 用法

```go
singleton.GetLogger().Println("hello")
```

---

## 5. Adapter 适配器

### 场景

第三方库接口与你项目不一致：你希望统一成 `Send(ctx, msg)`，但第三方只有 `Do(req)`。

### 代码

```go
package adapter

import (
	"context"
	"fmt"
)

type Sender interface {
	Send(ctx context.Context, msg string) error
}

// 第三方库（不可改）
type ThirdPartyClient struct{}
func (c *ThirdPartyClient) Do(payload []byte) error {
	fmt.Println("third-party do:", string(payload))
	return nil
}

// Adapter：把第三方适配成你的接口
type ThirdPartyAdapter struct {
	c *ThirdPartyClient
}

func NewThirdPartyAdapter(c *ThirdPartyClient) *ThirdPartyAdapter {
	return &ThirdPartyAdapter{c: c}
}

func (a *ThirdPartyAdapter) Send(ctx context.Context, msg string) error {
	_ = ctx // demo
	return a.c.Do([]byte(msg))
}
```

### 用ive：用法

```go
s := adapter.NewThirdPartyAdapter(&adapter.ThirdPartyClient{})
_ = s.Send(context.Background(), "hi")
```

---

## 6. Decorator / Middleware 装饰器

### 场景

给服务叠加能力：日志、指标、鉴权、限流、缓存。
本质就是 **“在接口外面再包一层”**（Go middleware 的核心）。

### 代码

```go
package decorator

import (
	"context"
	"fmt"
	"time"
)

type Service interface {
	Handle(ctx context.Context, input string) (string, error)
}

type BaseService struct{}
func (BaseService) Handle(ctx context.Context, input string) (string, error) {
	return "ok:" + input, nil
}

// Logging Decorator
type Logging struct{ next Service }
func (l Logging) Handle(ctx context.Context, input string) (string, error) {
	start := time.Now()
	out, err := l.next.Handle(ctx, input)
	fmt.Println("log cost:", time.Since(start), "err:", err)
	return out, err
}

// Timeout Decorator（示例：这里只做演示结构）
type Timeout struct{ next Service; d time.Duration }
func (t Timeout) Handle(ctx context.Context, input string) (string, error) {
	ctx, cancel := context.WithTimeout(ctx, t.d)
	defer cancel()
	return t.next.Handle(ctx, input)
}

// 组装器：链式包装（很常见）
type Wrap func(Service) Service

func WithLogging() Wrap {
	return func(s Service) Service { return Logging{next: s} }
}
func WithTimeout(d time.Duration) Wrap {
	return func(s Service) Service { return Timeout{next: s, d: d} }
}
func Build(base Service, wraps ...Wrap) Service {
	s := base
	for i := len(wraps) - 1; i >= 0; i-- {
		s = wraps[i](s)
	}
	return s
}
```

### 用法

```go
svc := decorator.Build(
	decorator.BaseService{},
	decorator.WithLogging(),
	decorator.WithTimeout(200*time.Millisecond),
)
out, _ := svc.Handle(context.Background(), "hello")
println(out)
```

---

## 7. Proxy 代理

### 场景

控制访问：缓存、权限、熔断、延迟加载。
和装饰器很像，但 Proxy 更强调“控制访问/保护对象”。

### 代码（缓存代理）

```go
package proxy

import (
	"errors"
	"sync"
)

type UserRepo interface {
	GetUserName(id int64) (string, error)
}

type DBRepo struct{}
func (DBRepo) GetUserName(id int64) (string, error) {
	if id == 0 { return "", errors.New("invalid id") }
	return "user-from-db", nil
}

type CacheRepo struct {
	next  UserRepo
	mu    sync.RWMutex
	cache map[int64]string
}

func NewCacheRepo(next UserRepo) *CacheRepo {
	return &CacheRepo{next: next, cache: map[int64]string{}}
}

func (c *CacheRepo) GetUserName(id int64) (string, error) {
	c.mu.RLock()
	if v, ok := c.cache[id]; ok {
		c.mu.RUnlock()
		return v, nil
	}
	c.mu.RUnlock()

	v, err := c.next.GetUserName(id)
	if err != nil { return "", err }

	c.mu.Lock()
	c.cache[id] = v
	c.mu.Unlock()
	return v, nil
}
```

---

## 8. Facade 外观

### 场景

把复杂子系统封装成简单 API：支付/风控/通知/记账等。

### 代码

```go
package facade

import "fmt"

type Risk struct{}
func (Risk) Check(orderID string) error { fmt.Println("risk check:", orderID); return nil }

type Charge struct{}
func (Charge) Pay(orderID string) error { fmt.Println("charge pay:", orderID); return nil }

type Ledger struct{}
func (Ledger) Record(orderID string) error { fmt.Println("ledger record:", orderID); return nil }

type Notify struct{}
func (Notify) Send(orderID string) error { fmt.Println("notify:", orderID); return nil }

// Facade：对外只暴露 Pay()
type PaymentFacade struct {
	r Risk
	c Charge
	l Ledger
	n Notify
}

func NewPaymentFacade() *PaymentFacade {
	return &PaymentFacade{r: Risk{}, c: Charge{}, l: Ledger{}, n: Notify{}}
}

func (p *PaymentFacade) Pay(orderID string) error {
	if err := p.r.Check(orderID); err != nil { return err }
	if err := p.c.Pay(orderID); err != nil { return err }
	if err := p.l.Record(orderID); err != nil { return err }
	return p.n.Send(orderID)
}
```

---

## 9. Strategy 策略

### 场景

同一个目标，多种算法可替换：调度、评分、路由、排序。

### 代码（调度策略）

```go
package strategy

import (
	"math/rand"
	"sync/atomic"
	"time"
)

type Picker interface {
	Pick(nodes []string) string
}

type RandomPicker struct{}
func (RandomPicker) Pick(nodes []string) string {
	rand.Seed(time.Now().UnixNano())
	return nodes[rand.Intn(len(nodes))]
}

type RoundRobin struct{ idx uint64 }
func (r *RoundRobin) Pick(nodes []string) string {
	i := atomic.AddUint64(&r.idx, 1)
	return nodes[int(i)%len(nodes)]
}

type Scheduler struct{ p Picker }
func NewScheduler(p Picker) *Scheduler { return &Scheduler{p: p} }
func (s *Scheduler) Next(nodes []string) string { return s.p.Pick(nodes) }
```

### 用法

```go
nodes := []string{"a","b","c"}
s1 := strategy.NewScheduler(strategy.RandomPicker{})
println(s1.Next(nodes))

s2 := strategy.NewScheduler(&strategy.RoundRobin{})
println(s2.Next(nodes))
```

---

## 10. Observer 发布订阅

### 场景

组件解耦：事件驱动（消息事件、订单事件、机器人事件）。
Go 常见实现：**channel 广播 / event bus**。

### 代码（轻量 EventBus）

```go
package observer

import (
	"context"
	"sync"
)

type Event struct {
	Topic string
	Data  any
}

type Bus struct {
	mu   sync.RWMutex
	subs map[string][]chan Event
}

func NewBus() *Bus {
	return &Bus{subs: map[string][]chan Event{}}
}

func (b *Bus) Subscribe(topic string, buf int) <-chan Event {
	ch := make(chan Event, buf)
	b.mu.Lock()
	b.subs[topic] = append(b.subs[topic], ch)
	b.mu.Unlock()
	return ch
}

func (b *Bus) Publish(e Event) {
	b.mu.RLock()
	chs := append([]chan Event(nil), b.subs[e.Topic]...)
	b.mu.RUnlock()

	for _, ch := range chs {
		// 避免阻塞：满了就丢（也可以改成 select + timeout）
		select {
		case ch <- e:
		default:
		}
	}
}

func (b *Bus) Consume(ctx context.Context, ch <-chan Event, fn func(Event)) {
	for {
		select {
		case <-ctx.Done():
			return
		case e := <-ch:
			fn(e)
		}
	}
}
```

---

## 11. Command 命令

### 场景

把请求封装为命令：可注册、可排队、可扩展（CLI、管理指令、机器人命令）。

### 代码（命令注册表）

```go
package command

import (
	"context"
	"fmt"
)

type Command interface {
	Name() string
	Execute(ctx context.Context, args []string) error
}

type Registry struct {
	cmds map[string]Command
}
func NewRegistry() *Registry { return &Registry{cmds: map[string]Command{}} }

func (r *Registry) Register(c Command) {
	r.cmds[c.Name()] = c
}
func (r *Registry) Run(ctx context.Context, name string, args []string) error {
	c, ok := r.cmds[name]
	if !ok { return fmt.Errorf("unknown command: %s", name) }
	return c.Execute(ctx, args)
}

// 示例命令
type Help struct{}
func (Help) Name() string { return "help" }
func (Help) Execute(ctx context.Context, args []string) error {
	fmt.Println("available: help, ping (demo)")
	return nil
}
```

---

## 12. State 状态机

### 场景

流程驱动：订单/任务/会话。
重点：**限制非法状态转移**。

### 代码（订单状态）

```go
package state

import "fmt"

type Status string

const (
	Created Status = "created"
	Paid    Status = "paid"
	Shipped Status = "shipped"
	Done    Status = "done"
)

type Order struct {
	ID     string
	Status Status
}

func (o *Order) Pay() error {
	if o.Status != Created {
		return fmt.Errorf("cannot pay when status=%s", o.Status)
	}
	o.Status = Paid
	return nil
}

func (o *Order) Ship() error {
	if o.Status != Paid {
		return fmt.Errorf("cannot ship when status=%s", o.Status)
	}
	o.Status = Shipped
	return nil
}

func (o *Order) Finish() error {
	if o.Status != Shipped {
		return fmt.Errorf("cannot finish when status=%s", o.Status)
	}
	o.Status = Done
	return nil
}
```

---

## 13. Chain of Responsibility 责任链

### 场景

规则链/审批流/过滤器：黑名单 → 频控 → 额度 → 通过。

### 代码

```go
package chain

import "fmt"

type Context struct {
	UserID int64
	Score  int
}

type Handler interface {
	SetNext(Handler)
	Handle(*Context) error
}

type Base struct{ next Handler }
func (b *Base) SetNext(n Handler) { b.next = n }
func (b *Base) Next(c *Context) error {
	if b.next == nil { return nil }
	return b.next.Handle(c)
}

// 黑名单
type Blacklist struct{ Base; blocked map[int64]bool }
func NewBlacklist(blocked map[int64]bool) *Blacklist { return &Blacklist{blocked: blocked} }
func (h *Blacklist) Handle(c *Context) error {
	if h.blocked[c.UserID] {
		return fmt.Errorf("blocked user: %d", c.UserID)
	}
	return h.Next(c)
}

// 分数门槛
type ScoreGate struct{ Base; min int }
func NewScoreGate(min int) *ScoreGate { return &ScoreGate{min: min} }
func (h *ScoreGate) Handle(c *Context) error {
	if c.Score < h.min {
		return fmt.Errorf("score too low: %d < %d", c.Score, h.min)
	}
	return h.Next(c)
}

// 组装
func BuildChain(hs ...Handler) Handler {
	for i := 0; i < len(hs)-1; i++ {
		hs[i].SetNext(hs[i+1])
	}
	return hs[0]
}
```

### 用法

```go
bl := chain.NewBlacklist(map[int64]bool{2: true})
sg := chain.NewScoreGate(60)
root := chain.BuildChain(bl, sg)

err := root.Handle(&chain.Context{UserID: 1, Score: 80}) // ok
println(err == nil)
```

---

# 练习建议（让你真的“会用”）

把这些模式串成一个小项目（很适合你做的群聊机器人）：

* **Factory + Options**：初始化机器人（不同平台适配器、超时、重试）
* **Adapter**：把 OneBot/NapCat 的消息结构适配成统一 `Message` 接口
* **Observer**：EventBus 分发事件（message/join/leave）
* **Strategy**：回复策略（冷淡/活跃/仅@回复）
* **State**：会话状态（沉默/插话/闲聊/严肃）
* **Decorator**：日志/限流/敏感词过滤装饰链
* **Command**：`/help` `/mute` `/stats`
* **Chain**：风控/规则链（黑名单、频控、相似度过滤）
