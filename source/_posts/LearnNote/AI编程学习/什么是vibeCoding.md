---
title: 什么是Vibe Coding
date: 2026-01-18 18:05:00
author: 长白崎
categories:
  - "AI"
tags:
  - "AI"
---

# 什么是VibeCoding


# 📘 什么是 **Vibe Coding？**

👉 **Vibe Coding** （中文常译为 “氛围编码” 或 “沉浸式 AI 编程”）是：

> **用自然语言来驱动 AI 生成完整软件，而不是自己逐行写代码的编程方式。**

📌 它的核心不是你敲多少代码，而是**怎么和 AI 对话，让 AI 按计划帮你生成代码。**

---

## 🧠 图解：Vibe Coding 与传统编程的区别

![Image](https://substackcdn.com/image/fetch/%24s_%21F31O%21%2Cf_auto%2Cq_auto%3Agood%2Cfl_progressive%3Asteep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F3e8398cc-f2c9-4c04-b3a1-37437dd3d82a_1888x1054.png)

![Image](https://techconglobal.com/wp-content/uploads/2025/07/497d7694-a1b7-4b53-b679-08f796bb6300_1920x813-1.webp)

![Image](https://miro.medium.com/v2/resize%3Afit%3A1400/0%2Aqmvgf9cnirxM3gzA.png)

| 传统编程    | Vibe Coding   |
| ------- | ------------- |
| 人写代码    | 人说需求 → AI 写代码 |
| 关注语法    | 关注目标与功能       |
| 人自己实现逻辑 | AI 自动实现逻辑     |
| 练习语言细节  | 练习想法表达        |

---

# 🧠 Vibecoding 的核心理念

**Vibe Coding 并不只是让 AI 写代码**，它是一套完整的 **AI + 人 协作开发流程**：

1️⃣ **先让 AI 写文档（规划）**

2️⃣ 再确认技术栈与执行计划

3️⃣ 按计划逐步让 AI 写代码

也就是说，不再是 “抛需求 → AI 乱写 → 你修复”，
而是：

📌 **抛需求 → AI 生成项目设计文档 → 确认方案 → AI 按计划写代码 → 你测试/确认** 

---

## 🧠 为什么要先写文档？

👉 文章中提出：

> **不要让 AI 失控；先把项目上下文固定下来，再让 AI 生成代码，这样项目不会混乱。** 

这样做的好处：

✅ AI 清楚整个项目结构
✅ 它生成的代码一致、不乱
✅ 避免后来 AI 自由发挥写出不可维护的代码

---

# 🛠 Vibe Coding 简单流程（像玩游戏一样）

下面是一个 beginner 版实操流程：

---

## 1️⃣ 👇 第一步：定义需求

你对 AI 说（用自然语言描述）：

> “我要写一个能显示当前时间的网页。”

AI 会问你一些基础问题，比如：

* 你想用什么语言？
* 是否需要按钮？
* 需要风格（美观/简约）？

---

## 2️⃣ ✏️ 让 AI 先写 **设计文档**

比方说它生成的内容：

```
# 需求文档
功能：显示当前当地时间
技术栈：HTML + JavaScript
页面结构：
- 时间框
- 一个刷新按钮
```

这就像一个说明书。

这是文章中推荐的步骤——

> **先文档，再编码**

---

## 3️⃣ 🛠 让 AI 按计划写代码

AI 根据设计文档生成代码：

```html
<!DOCTYPE html>
<html>
  <body>
    <h1 id="time"></h1>
    <button onclick="showTime()">刷新时间</button>

    <script>
      function showTime() {
        document.getElementById("time").innerText = new Date().toLocaleTimeString();
      }
      showTime();
    </script>
  </body>
</html>
```

你只需运行，看看效果是否正确。

---

## 4️⃣ 🔁 反馈 + 完善

AI 生成代码之后：

* 如果你想要更好看的样式
* 或增加倒计时/时区支持

你直接对 AI 说：

> “请加个美观样式并支持 24 小时制。”

AI 再给你新的代码。

---

# 🧾 简单理解的特点（用最简单的话）

| 特点          | 注释                                |
| ----------- | --------------------------------- |
| 人更多是描述需求    | 人说“我要这个功能”，AI 负责实现                |
| 代码由 AI 生成   | 人不是敲代码，而是说代码要做什么                  |
| 重复循环反馈      | 生成 → 运行 → 修改 → 生成                 |
| 规划优先，不是盲目生成 | 先定义架构和文档再编码（文章重点） |

---

# ⚠️ Vibecoding 不是万能的

虽然很好玩，但也有实际挑战：

❗ AI 写出来代码可能不够完美

❗ 需要你理解需求本身

❗ 对复杂系统仍需要工程经验

❗ 不能完全替代工程师（尤其是大项目） 
