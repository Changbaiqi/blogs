---
title: ROS2入门教程笔记
date: 2025-08-21 09:28:49
author: 长白崎
categories:
  - "AI"
    "ROS"
tags:
  - "AI"
    "ROS"
---



# ROS2入门教程笔记

## 1. ROS2安装与配置

### 1.1 添加ROS2软件源

> **注意**：以下命令中的`foxy`关键字对应Ubuntu 20.04 (Focal Fossa)版本，不同Ubuntu版本需使用对应的ROS2发行版名称

```bash
# 安装依赖工具
sudo apt update && sudo apt install curl gnupg lsb-release

# 添加ROS2 GPG密钥
sudo curl -sSL https://raw.githubusercontent.com/ros/rosdistro/master/ros.key -o /usr/share/keyrings/ros-archive-keyring.gpg

# 配置软件源（自动识别Ubuntu版本）
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/ros-archive-keyring.gpg] http://packages.ros.org/ros2/ubuntu $(source /etc/os-release && echo $UBUNTU_CODENAME) main" | sudo tee /etc/apt/sources.list.d/ros2.list > /dev/null

# 更新软件源
sudo apt update
```

### 1.2 安装ROS2（以Foxy为例）

```bash
# 安装桌面版（包含GUI工具、库和示例）
sudo apt install ros-foxy-desktop

# 配置环境变量（自动加载ROS2环境）
echo "source /opt/ros/foxy/setup.bash" >> ~/.bashrc
source ~/.bashrc
```

---

## 2. ROS2基础操作

### 2.1 话题通信示例——控制海龟

```bash
# 启动海龟仿真器
ros2 run turtlesim turtlesim_node

# 发布速度指令控制海龟移动
ros2 topic pub --rate 1 /turtle1/cmd_vel geometry_msgs/msg/Twist "{linear: {x: 2.0, y: 0.0, z: 0.0}, angular: {x: 0.0, y: 0.0, z: 1.8}}"
```

### 2.2 服务通信示例——生成新海龟

```bash
# 调用生成海龟的服务
ros2 service call /spawn turtlesim/srv/Spawn "{x: 2, y: 2, theta: 0.2, name: 'abc'}"

# 说明：name留空''将自动生成如'turtlesim1'的默认名称
```

### 2.3 数据记录与回放

```bash
# 记录话题数据（Ctrl+C停止记录）
ros2 bag record /turtle1/cmd_vel

# 回放数据
ros2 bag play <记录数据目录>
```

---

## 3. 工作空间与功能包

### 3.1 工作空间结构
```
dev_ws/                 # 工作空间根目录
├── src/               # 源代码空间
├── build/             # 编译空间
├── install/           # 安装空间
└── log/               # 日志空间
```

### 3.2 创建工作空间

```bash
# 创建工作空间目录
mkdir -p ~/dev_ws/src
cd ~/dev_ws/src

# 克隆示例代码
git clone https://gitee.com/guyuehome/ros2_21_tutorials.git

# 检查依赖并自动安装
rosdepc install -i --from-path src --rosdistro foxy -y

# 编译工作空间
cd ~/dev_ws
colcon build

# 设置环境变量（每次新终端需执行）
source install/local_setup.bash
```

### 3.3 创建功能包

```bash
cd ~/dev_ws/src

# 创建C++功能包
ros2 pkg create --build-type ament_cmake learning_pkg_c

# 创建Python功能包
ros2 pkg create --build-type ament_python learning_pkg_python
```

---

## 4. 话题通信编程

### 4.1 发布者实现

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class PublisherNode(Node):
    def __init__(self, name):
        super().__init__(name)
        # 创建发布者（消息类型、话题名、队列长度）
        self.pub = self.create_publisher(String, "chatter", 10)
        # 创建定时器（周期0.5秒）
        self.timer = self.create_timer(0.5, self.timer_callback)
        
    def timer_callback(self):
        msg = String()
        msg.data = 'Hello World'
        self.pub.publish(msg)
        self.get_logger().info('Publishing: "%s"' % msg.data)

def main(args=None):
    rclpy.init(args=args)
    node = PublisherNode("topic_helloworld_pub")
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()
```

### 4.2 订阅者实现

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
                                                                                                                                                                                                                                                                                                                                                                                                  
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class SubscriberNode(Node):
    def __init__(self, name):
        super().__init__(name)
        # 创建订阅者
        self.sub = self.create_subscription(
            String, "chatter", self.listener_callback, 10)

    def listener_callback(self, msg):
        self.get_logger().info('I heard: "%s"' % msg.data)

def main(args=None):
    rclpy.init(args=args)
    node = SubscriberNode("topic_helloworld_sub")
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()
```

---

## 5. 服务通信

### 5.1 服务查询与调用

```bash
# 查看服务类型
ros2 service type /服务名称

# 调用服务
ros2 service call /服务名称 服务类型 "{参数}"
```

---

## 6. 通信接口

### 6.1 接口查看命令

```bash
# 查看接口定义
ros2 interface show geometry_msgs/msg/Twist

# 查看功能包中的接口
ros2 interface package learning_interface
```

---

## 7. Action通信

```bash
# 发送动作目标（带反馈）
ros2 action send_goal /turtle1/rotate_absolute turtlesim/action/RotateAbsolute "{theta: 3.14}" --feedback

# 查看动作列表
ros2 action list

# 查看动作信息
ros2 action info /动作名称
```

---

## 8. 参数系统

### 8.1 参数操作命令

```bash
# 查看参数列表
ros2 param list

# 获取参数值
ros2 param get turtlesim background_b

# 设置参数值
ros2 param set turtlesim background_b 10

# 查看参数描述
ros2 param describe turtlesim background_b

# 导出参数到文件
ros2 param dump turtlesim > turtlesim.yaml

# 从文件加载参数
ros2 param load turtlesim < turtlesim.yaml
```

### 8.2 参数编程示例

```python
import rclpy
from rclpy.node import Node

class ParameterNode(Node):
    def __init__(self, name):
        super().__init__(name)
        self.timer = self.create_timer(2, self.timer_callback)
        # 声明参数并设置默认值
        self.declare_parameter('robot_name', 'mbot')

    def timer_callback(self):
        # 读取参数
        robot_name = self.get_parameter('robot_name').value
        
        self.get_logger().info('Hello %s!' % robot_name)
        
        # 设置参数
        new_param = rclpy.parameter.Parameter(
            'robot_name', 
            rclpy.Parameter.Type.STRING, 
            'mbot'
        )
        self.set_parameters([new_param])
```

---

## 9. DDS通信机制

### 9.1 QoS策略示例

```bash
# 发布话题（Best Effort模式）
ros2 topic pub /chatter std_msgs/msg/Int32 "data: 42" --qos-reliability best_effort

# 订阅话题（需匹配QoS策略）
ros2 topic echo /chatter --qos-reliability best_effort

# 查看话题详细信息
ros2 topic info /chatter --verbose
```

---

## 10. Launch启动文件

### 10.1 Python格式Launch文件示例

```python
import os
from ament_index_python.packages import get_package_share_directory
from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    # 获取配置文件路径
    rviz_config = os.path.join(
        get_package_share_directory('learning_launch'),
        'rviz',
        'turtle_rviz.rviz'
    )

    return LaunchDescription([
        Node(
            package='rviz2',
            executable='rviz2',
            name='rviz2',
            arguments=['-d', rviz_config]
        )
    ])

# 启动命令
# ros2 launch <包名> <launch文件>
```

---

## 11. TF坐标变换

### 11.1 海龟跟随示例

```bash
# 安装依赖
sudo apt install ros-foxy-turtle-tf2-py ros-foxy-tf2-tools
sudo pip3 install transforms3d

# 启动跟随示例
ros2 launch turtle_tf2_py turtle_tf2_demo.launch.py

# 控制海龟移动
ros2 run turtlesim turtle_teleop_key

# 查看TF树
ros2 run tf2_tools view_frames

# 查询坐标变换
ros2 run tf2_ros tf2_echo turtle2 turtle1
```

### 11.2 跟随核心逻辑

```python
try:
    # 获取当前时间
    now = rclpy.time.Time()
    # 监听坐标变换
    trans = self.tf_buffer.lookup_transform(
        to_frame_rel,
        from_frame_rel,
        now)
    
    # 根据角度计算角速度
    msg.angular.z = scale_rotation_rate * math.atan2(
        trans.transform.translation.y,
        trans.transform.translation.x)
    
    # 根据距离计算线速度
    msg.linear.x = scale_forward_speed * math.sqrt(
        trans.transform.translation.x ** 2 +
        trans.transform.translation.y ** 2)
        
except TransformException as ex:
    self.get_logger().info(f'Transform failed: {ex}')
```

---

## 12. URDF机器人建模

### 12.1 URDF基本结构

```
robot
├── link                # 连杆（刚体部分）
│   ├── visual         # 可视化属性
│   ├── collision      # 碰撞属性
│   └── inertial       # 惯性属性
└── joint              # 关节
    ├── parent         # 父连杆
    └── child          # 子连杆
```

### 12.2 URDF查看工具

```bash
# 生成模型结构图
urdf_to_graphviz mbot_base.urdf

# 打开文件管理器查看生成的PDF
nautilus .
```

### 12.3 XACRO优化版本

```xml
<!-- 定义常量 -->
<xacro:property name="M_PI" value="3.14159"/>

<!-- 使用数学计算 -->
<origin xyz="0 ${(motor_length+wheel_length)/2} 0" rpy="${M_PI/2} 0 0"/>

<!-- 定义宏 -->
<xacro:macro name="wheel" params="prefix reflect">
    <link name="${prefix}_wheel">
        ...
    </link>
</xacro:macro>

<!-- 调用宏 -->
<wheel prefix="left" reflect="1"/>
<wheel prefix="right" reflect="-1"/>

<!-- 包含其他文件 -->
<xacro:include filename="$(find mbot_description)/urdf/mbot_base_gazebo.xacro"/>
```

---

## 13. Gazebo仿真

### 13.1 安装与启动

```bash
# 安装Gazebo
sudo apt install ros-foxy-gazebo-*

# 启动Gazebo
ros2 launch gazebo_ros gazebo.launch.py

# 虚拟机中需关闭硬件加速（可选）
echo "export SVGA_VGPU10=0" >> ~/.bashrc
```

### 13.2 传感器仿真配置

```xml
<!-- 摄像头配置 -->
<sensor name="camera" type="camera">
    <camera>
        <horizontal_fov>1.3962634</horizontal_fov>
        <image>
            <width>640</width>
            <height>480</height>
        </image>
    </camera>
    <plugin name="camera_controller" filename="libgazebo_ros_camera.so">
        <ros>
            <namespace>/</namespace>
            <remapping>~/image_raw:=image_raw</remapping>
        </ros>
        <camera_name>camera</camera_name>
    </plugin>
</sensor>
```

### 13.3 启动仿真

```bash
# 加载URDF模型到Gazebo
ros2 launch learning_gazebo load_urdf_into_gazebo.launch.py

# 键盘控制移动
ros2 run teleop_twist_keyboard teleop_twist_keyboard

# 查看Gazebo话题
gz topic -l
```

---

## 14. Rviz可视化

```bash
# 启动Rviz
ros2 run rviz2 rviz2

# 指定配置文件启动
ros2 run rviz2 rviz2 -d <配置文件路径>
```

### Rviz vs Gazebo对比

| 特性     | Rviz          | Gazebo   |
| -------- | ------------- | -------- |
| 核心功能 | 数据可视化    | 物理仿真 |
| 数据来源 | 实际/回放数据 | 仿真计算 |
| 物理引擎 | 无            | 有       |
| 主要用途 | 调试、监控    | 算法测试 |

---

## 15. RQT工具集

```bash
# 安装
sudo apt install ros-foxy-rqt

# 启动
rqt
```

常用插件：
- **rqt_graph**：节点关系图
- **rqt_console**：日志查看器
- **rqt_plot**：数据曲线绘制
- **rqt_bag**：数据包管理

---

## 16. 学习资源推荐

### ROS2官方资源
- [ROS2官方文档](https://docs.ros.org/)
- [ROS2 GitHub仓库](https://github.com/ros2)

### 自动驾驶相关
- [Autoware](https://autoware.org/) - 自动驾驶开源框架
- [Autoware.Auto](https://autowarefoundation.gitlab.io/autoware.auto/AutowareAuto/) - 新一代Autoware

### 视频教程
- [ROS2入门教程 - YouTube](https://www.youtube.com/playlist?list=PLL57Sz4fhxLpCXgN0lvCF7aHAlRA5FoFr)

---

## 版本对照表

| Ubuntu版本    | ROS2发行版 |
| ------------- | ---------- |
| 20.04 (Focal) | Foxy       |
| 22.04 (Jammy) | Humble     |
| 24.04 (Noble) | Jazzy      |

> **注意**：本文档以ROS2 Foxy为例，如使用其他版本，请相应替换命令中的`foxy`关键字
