# Bazel使用基础学习

---



## Bazel简介

Bazel是google研发的一款开源构建和测试工具，是一种简单、易读的构建工具。Bazel支持多种编程语言的项目，并针对多个平台构建输出。



**特点**

Bazel具有以下优势:

* **高级构建语言**。Bazel使用一种抽象的、人类可读的语言在高语义级别上描述项目的构建属性。与其他工具不同，Bazel在库、二进制文件、脚本和数据集的概念上运行，使您免于编写对编译器和链接器等工具的单独调用的复杂性。
* **Bazel既快速又可靠**。Bazel会缓存之前完成的所有工作，并跟踪对文件内容和构建命令所做的更改。这样，Bazel就能知道何时需要重新构建某些内容，并且仅重新构建。如需进一步加快构建速度，您可以将项目设置为以高度并行且增量的方式进行构建。
* **Bazel是多平台应用**。Bazel 可在 Linux、macOS和Windows 上运行。Bazel 可以在同一个项自中为多个平台（包括桌面设备、服务器和移动设备）构建二进制文件和可部署软件包。
* **Bazel 可以扩缩**。在处理具有 10 万多个源文件的 build 时，Bazel 能够保持敏捷性。它可与数以万计的代码库和用户群进行协作。



## Bazel基本使用流程

---

在Apollo的Docker容器中已经安装了Bazel，所以我们直接使用即可，Bazel的使用也比较简单，大致流程如下：

1.新建project目录，project目录下新建文件WORKSPACE；

2.新建包，在包下新建BUILD文件；

3.包中编写源文件；

4.编辑BUILD文件；

5.编译；

6.执行。

准备工作：在/apollo/cyber目录下新建demo_base_bazel目录，后续关于bazel实现都存储在该目录中。



## 使用例子

### C++实现

1.新建project目录

在demo_base_bazel目录下新建目录pro1_helloworld，再在pro1_helloworld目录下新建WORKSPACE文件。

2.新建包目录

pro1_helloworld目录下新建demo_pkg目录，该目录下新建BUILD文件。

3.新建源文件

在demo_pkg目录下新建c++源文件hello_world.cc,编写内容如下：

```c++
#include<iostream>
using namespace std;

int main(int argc,char const *argv[]){
    cout<< "hello world"<<endl;
    return 0;
}
```

4.编辑BUILD文件
编辑BUILD文件，编写内容如下:

```bazel
cc_binary(
	name = "hello",
	srcs = ["hello_world.cc"]
)
```

参数：

* name 可执行文件
* srcs 源文件

5.编译

终端下先进入项目目录，也即pro1_helloworld,常用编译方式有两种。

编译方式1：

```shell
bazel build //demo_pkg/...
```

上述命令是指编译demo_pkg包下的所有程序，“//”指代项目根目录（也即pro1_helloworld),或者也可以不使用“//”。

编译方式2：

```shell
bazel build //demo_pkg:hello
```

上述命令是指编译demo_pkg包下名为hello(语法格式为“包名:目标名”)的程序。

6.执行

编译完成后，在pro1_helloworld目中，会生成一些中间文件，其中bazel-bin中有对应的可执行文件，运行该文件即可，常用执行方式有两种：

执行方式1：

```shell
./bazel-bin/demo_pkg/hello
```

执行方式2：

```shell
bazel run demo_pkg:hello
```

运行结果：在终端输出文本hello world。

> 两种执行方式比较，方式1只是执行，后者既编译又执行



### Python实现

详细可参考C++，只是将编写C++代码替换成了Python代码，并且BUILD文件如下：

```BUILD
py_binary(
	name = "hello_world",
	srcs = ["hello_world.py"]
)
```

`注：`C++中name可以不和文件名保持一致，但是Python则必须要和文件名一致（排除后缀）



## Bazel使用之库依赖

### 编写被依赖库实现

首先需要实现被依赖的库的相关文件。

1.新建project目录

在demo_base_bazel目录下新建目录pro2_lib，再在pro2_lib目录下新建WORKSPACE文件。

2.新建包目录

在pro2_lib目录下新建demo_lib目录，该目录下新建BUILD文件。

3.新建头文件与源文件

在demo_lib目录下新建C++头文件hello_great.h,编写内容如下：

```c++
#ifndef LIB_HELLO_GREAT_H
#define LIB_HELLO_FREAT_H

#include <string>
std::string get_great(const std::string& name);

#endif
```

在demo_lib目录下新建C++头文件hello_great.cc，编写内容如下：

```c++
#include "helllo_great.h"

std::string get_great(const std::string& name){
    return "hello" + name;
}
```

4.编辑BUILD文件

编辑BUILD文件，编写内容如下：

```BUILD
cc_library(
	name = "hello_great",
	srcs = ["hello_great.cc"],
	hdrs = ["hello_great.h"],
)
```

参数：

* name 库文件
* srcs 源文件
* hdrs 头文件

5.编译

终端下进入pro2_lib目录，执行：

```shell
bazel build //demo_lib/...
```

或

```shell
bazel build //demo_lib:hello_great
```

在当前项目的bazel-bin/demo_lib目录下将生成相关的库文件。



### 同包下的库依赖

1.编写C++源文件

承上，在demo_lib目录中新建hello_world.cc，需要包含hello_great.h并调用头文件中的get_great函数，内容如下：

```C++
#include <iostream>
#include "hello_great.h"
using namespace std;
int main(int argc,char const *argv[]){
    cout << get_great("bazel lib") << endl;
    return 0;
}
```

2. 编辑BUILD文件

在BUILD文件中追加内容如下：

```bazel
cc_binary(
	name = "hello_world",
	srcs = ["hello_world.cc"],
	deps = [":hello_great"],
	
)
```

参数：

* deps 依赖项



## 跨包库依赖

1.新建包

基于上面同包的教程上进行，在pro2_lib下新建包：demo_main，包下新建BUILD文件。

2.新建C++源文件

在包demo_main中新建hello_world.cc文件，需要包含hello_great.h并调用头文件中的get_great函数，内容如下：

```c++
#include <iostream>
#include "demo_lib/hello_great.h"
using namespace std;
int main(int argc, char const *argv[]) {
    cout << get_great("bazel lib") <<endl;
    return 0;
}
```

3.编辑BUILD文件

BUILD文件内容如下：

```bazel
cc_binary(
	name = "hello_world",
	srcs = ["hello_world.cc"],
	deps = ["//demo_lib:hello_great"],
)
```

另外，还需要为demo_lib包添加可访问权限，否则会导致编译失败，修改demo_lib/BULD文件。

方式1：在demo_lib/BUILD文件中添加函数：

```bazel
package(default_visibility = ["//visibility:public"])
```

方式2：修改cc_library函数内容如下：

```bazel
cc_library(
	name = "hello_great",
	srcs = ["hello_great.cc"],
	hdrs = ["hello_great.h"],
	visibility = ["//demo_main:__pkg__"]
)
```

参数：

* visibility设置可见度（权限）

4.编译

终端下进入pro2_lib目录，执行命令：

```shell
bazel build //demo_main/...
```

或

```shell
bazel build //demo_main:hello_world
```

5.执行

执行命令：

```shell
./bazel-bin/demo_main/hello_world
```

或

```shell
bazel run //demo_main:hello_world
```

终端将输出文本：hello bazel lib。
