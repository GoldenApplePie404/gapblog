---
title: "Godot从安装到卸载——Godot学习笔记"
img_dir: godot-notes
cover: /images/posts/godot-notes/fm.webp
date: 2025-07-29 00:17:37
categories: [["教程"], ["计算机"]]
tags: ["Godot", "教程", "游戏开发", "笔记", "计算机"]
---
游戏引擎就像一座"虚拟世界工厂"。本篇从游戏引擎概念讲起，带你认识开源轻量的 Godot：节点树架构、类 Python 的 GDScript 语法，以及从官网/Steam 安装到上手开发的完整学习笔记。

<!-- more -->


## **前言**

游戏引擎（Game Engine）是一套为游戏开发设计的综合性软件框架，它整合了图形渲染、物理模拟、音频处理、动画系统、输入控制等核心功能模块，并提供了可视化编辑工具和脚本接口。

简单来说，游戏引擎就像一个“虚拟世界工厂”，开发者无需从零编写代码，而是通过组合引擎提供的工具和组件，快速搭建游戏场景、设计角色行为、实现交互逻辑，最终将创意转化为可运行的游戏。

常用的游戏引擎有Unity、Unreal、Godot、Cocos等，其中Godot凭借其独特的开源属性和轻量化设计，逐渐成为独立开发者和小型团队的首选。

Godot不仅支持Windows、macOS、Linux等主流桌面操作系统，还覆盖了Android、iOS等移动平台，甚至能将游戏导出为HTML5格式嵌入网页，实现“即点即玩”的浏览器体验。同时它采用节点树（Node-Tree）架构，将游戏对象拆解为可复用的功能模块（如精灵、碰撞体、脚本），通过拖拽组合即可构建复杂交互；其自研的GDScript语言语法简洁，与Python高度相似，大幅降低了编程学习成本；而且，Godot完全免费且开源，没有商业授权限制，开发者可以自由修改引擎源码，甚至将其用于商业项目而无须担心版权风险。

## 一、安装Godot

安装Godot的方式很简单，直接在浏览器里搜索“godot”，我们可以直接在[Godot官网](https://godotengine.org/zh-cn/)下载，根据系统选择 Windows/macOS/Linux 的稳定版或实验版下载，也可通过 Steam 平台搜索安装（但需注意 Steam 版仅默认支持 GDScript 语言，官网版则额外提供 C# 等选项）。

在这里我选用的是Godot4.4.1（无C#）以及windows系统，也就是说接下来所有的代码都仅涉及GDScript语言。不过不管从哪下载的，基本大差不差。

安装完毕后，打开Godot，在出现的界面中找到创建，以此来创建我们的第一个项目。

![](/images/posts/godot-notes/godot1.webp)

## 二、认识Godot

### （一）主界面

完成项目创建后，我们将正式进入 Godot 编辑器的核心工作界面——此前显示的项目列表仅是入口，此刻才是开发的主舞台。接下来，让我们一同探索一下这个界面。

![](/images/posts/godot-notes/godot2-1024x544.webp)

整个界面分成了六大板块：顶栏菜单（①）、场景节点列表（②）、文件系统（③）、游戏场景（④）、底部面板（⑤）、检查器（⑥）。

#### **① 顶栏菜单**

左侧整合了 场景（Scene）、项目（Project）、调试（Debug） 等核心功能入口；中间区域通过 2D/3D 按钮 快速切换场景模式，Script 标签页 为脚本编辑区，Game 标签页 则是实时预览游戏运行的窗口，而 AssetLib 提供了丰富的官方资源与社区插件库。右侧集中了 运行项目（F5）、仅运行当前场景（F6）、Movie Maker 动画录制 等快捷控制按钮。

#### ② 场景节点列表（Scene Tree）

以树状结构展示当前场景的所有节点，支持通过拖拽调整层级关系（父子节点），右键菜单可快速完成节点创建、删除、复制或重命名操作，清晰呈现游戏对象的组织架构。

#### ③ 文件系统（FileSystem）

直观呈现项目文件夹结构，包含 场景文件（.tscn）、脚本文件（.gd/.cs）、素材资源（图片/音频/模型） 等，支持通过拖拽直接导入外部文件或右键新建资源。

#### ④ 游戏场景视图（2D/3D Viewport）

实时渲染当前编辑的场景，支持鼠标拖拽移动视角、滚轮缩放、右键旋转（3D模式），配合 网格对齐（Snap） 和 变换工具（移动/旋转/缩放），可精准调整对象位置与布局。

#### ⑤ 底部面板

输出日志（Output）：显示编译警告、错误信息及自定义打印内容。

调试控制台（Debugger）：实时监控变量值、性能数据，支持断点调试。

动画编辑器（Animation）：若选中动画节点，此处会显示关键帧轨道。

#### ⑥ 检查器（Inspector）

以属性表格形式展示当前选中节点的详细参数，包括 变换属性（位置/旋转/缩放）、材质渲染设置、脚本变量 等，支持直接修改数值或通过下拉菜单选择预设选项。

### （二）**关键概念**

#### 1.场景（Scene）

在 Godot 中，场景（Scene） 是游戏开发的核心模块化工具——它允许你将角色、武器、UI菜单、建筑甚至整个关卡等元素封装为独立的 .tscn 文件，像搭积木一样自由组合。每个场景可包含节点树、脚本逻辑和资源，支持复用（同一敌人场景用于多个关卡）、嵌套（将武器作为角色场景的子节点）和动态加载（按需实例化大型场景），让开发更高效且结构清晰。  
比如创建一个冒险游戏，可先创建独立的「敌人」场景（含移动逻辑和外观节点），再制作「武器」场景（带攻击检测与特效），最后在「玩家」场景中将武器嵌套为子节点，并在「关卡」场景中动态加载多个敌人实例——修改敌人场景参数即可全局更新所有关卡中的敌人行为，无需重复调整。

#### 2.节点（Node）

在 Godot 中，场景（Scene） 由一个或多个节点（Node） 构成，节点（Node） 是构成游戏的最小功能单元，每个节点负责单一任务（如显示图像、播放声音或检测碰撞）。节点通过树状层级组合成场景——父节点带动子节点移动，子节点继承父节点属性。

例如，制作一个会射击的敌人：用 CharacterBody2D 节点处理移动——添加 Sprite2D 节点显示敌人外观——嵌套 Area2D 节点作为子弹发射点——通过脚本让 Area2D 定时生成子弹节点。

以下则是一些基础节点（按功能分类）

#### **（1）基础结构节点**

- Node

所有场景对象的基类，支持信号（Signal）和组（Group）机制。

关键方法：\_ready()（初始化）、\_process(delta)（每帧逻辑）。

- Node2D

2D 场景对象的基类，提供位置、旋转、缩放等属性。

子类示例：CharacterBody2D（物理角色）、Area2D（区域检测）、StaticBody2D（静态碰撞体）。

- Node3D

3D 场景对象的基类，支持 3D 空间变换。

子类示例：CharacterBody3D、Area3D、MeshInstance3D（3D 模型渲染）。

- CanvasItem

2D 渲染对象的基类（继承自 Node2D），提供材质、可见性控制。

子类：Control（UI 基类）、Sprite2D（2D 精灵）、TileMap（瓦片地图）。

- Control

UI 控件基类，支持锚点（Anchor）和布局容器。

常用子类：Button（按钮）、Label（文本）、LineEdit（输入框）、HBoxContainer（水平布局）。

#### （2）**物理与碰撞节点**

- CharacterBody2D/3D

需手动控制移动的物理体，支持碰撞检测和滑动。

关键方法：move\_and\_slide()（2D）、move\_and\_collide()（3D）。

- RigidBody2D/3D

受物理引擎控制的刚体，支持力、重力、碰撞响应。

信号：body\_entered（碰撞进入）、area\_entered（区域进入）。

- StaticBody2D/3D

静态碰撞体，用于场景中的固定障碍物。

- CollisionShape2D/3D

定义物理体的碰撞形状（矩形、圆形、凸多边形等）。

- Area2D/3D

检测进入/离开区域的物体，可修改局部物理属性（如重力）。

#### **（3）动画与状态机**

- AnimatedSprite2D

逐帧动画播放，支持精灵表（Sprite Frames）资源。

方法：play()（播放动画）、frame（当前帧索引）。

- AnimationPlayer

关键帧动画编辑器，可动画化任意节点的属性（如位置、透明度）。

- AnimationTree

高级动画状态机，支持混合（Blend）、过渡（Transition）和反向运动学（IK）。

- StateMachine（自定义）

通过脚本实现的状态机模式，常用于角色行为控制（如空闲、奔跑、攻击状态切换）。

#### **（4）UI 与交互**

- Button

可点击按钮，支持按下/悬停状态和信号（pressed、released）。

- TextureRect

显示纹理的 UI 控件，支持平铺（Tile）、缩放（Stretch）等模式。

- CanvasLayer

独立渲染层，常用于 HUD 或暂停菜单（不受场景摄像机影响）。

- Popup

弹出窗口基类，支持模态（Modal）和非模态对话框。

#### **（5）特效与粒子**

- CPUParticles2D/3D

CPU 粒子系统，支持发射率、生命周期、颜色渐变等参数。

- GPUParticles2D/3D

GPU 加速粒子系统，性能更高但兼容性较低。

- Light2D/3D

光源节点，支持方向光（DirectionalLight）、点光（PointLight）等。

#### **（6）音频节点**

- AudioStreamPlayer

播放全局音频（无空间定位）。

- AudioStreamPlayer2D/3D

空间化音频，音量随距离衰减（适用于环境音效、角色语音）。

#### **（7）网络与多人游戏**

- NetworkedMultiplayerENet

基于 ENet 协议的多人游戏同步节点，支持可靠/不可靠消息传输。

- WebSocketClient/Server

实现 WebSocket 通信，用于网页端多人交互。

#### **（8）导航与寻路**

- NavigationAgent2D/3D

智能寻路代理，需配合 NavigationRegion2D 使用。

- NavigationRegion2D/3D

可遍历区域，需在编辑器中烘焙导航网格。

#### 3.场景树（Scene Tree）

在 Godot 中，游戏的所有场景都汇集在场景树（Scene Tree）中——它字面意义上是一棵由嵌套场景构成的层级树。由于每个场景本身已是由节点（Node）组成的树状结构，当场景被实例化或嵌套时，场景树本质上仍是节点的聚合，但这种层级关系为开发者提供了更直观的抽象视角：

例如，当你在场景树中看到：

```
「玩家」场景（含角色动画、武器子场景）  
└─ 「剑」场景（含碰撞体、攻击特效）  
「关卡」场景（含地形、门、敌人）  
└─ 「木门」场景（含物理材质、开关交互）
```

这种结构让你无需纠结底层节点的复杂连接，而是直接通过场景的语义化名称（如“玩家”“木门”）管理游戏对象——修改“木门”场景的打开逻辑时，所有关卡中实例化的木门都会自动更新。这种“场景即对象”的设计，让角色、武器、UI等模块的迭代与复用变得像操作文件夹一样简单。

#### 4.信号（Signal）

在 Godot 中，信号（Signal） 是节点间通信的“事件总线”，让对象无需直接引用彼此也能响应交互。它像游戏中的“广播系统”：当特定事件发生（如按钮被点击、角色受伤、碰撞触发），节点会发出信号，其他节点通过“订阅”这些信号来执行对应逻辑。

Godot 的信号机制让游戏开发更灵活：节点通过发出信号（如按钮的 pressed）与其他对象解耦通信，无需硬编码关联；内置大量实用信号（如碰撞检测、动画结束），还支持自定义信号（如 enemy\_defeated）实现特定逻辑；典型应用包括点击按钮加载关卡、进入区域触发音效、击败敌人更新UI等场景。

## 三、GDScript

Godot 引擎支持四种官方编程语言：GDScript 简单易上手，适合快速开发；C# 功能强大，面向对象特性出色；借助 GDExtension 技术，C 和 C++ 也能用于开发，能应对高性能需求场景。此外，社区还有不少其他语言可用，但这四种是官方主推的。

在一个项目里，多种语言能混合使用。比如团队开发时，可用 GDScript 快速编写游戏逻辑，再用 C# 或 C++ 实现复杂算法提升性能；也能只用 GDScript 或 C# 完成全部开发，具体看项目和团队情况。不过，介于我是在 Steam 平台用 的Godot ，它默认只有 GDScript，所以本节主要讲 GDScript。

GDScript 是专为 Godot 引擎打造的面向对象指令式编程语言，由游戏开发者精心设计，能大幅节省游戏代码编写时间。它特性丰富：语法简洁使代码文件轻量易维护；编译与加载速度极快，提升开发专注度；和编辑器深度集成，编写节点、信号等元素时能智能补全代码；内置向量与变换类型，高效处理线性代数计算；支持多线程，性能媲美静态类型语言；无垃圾回收机制，引擎默认用引用计数管理内存，开发者也可手动控制；采用渐进类型系统，变量默认动态类型且支持类型提示强检查；用缩进划分代码块，外观似 Python 但原理不同，其设计融合了 Squirrel、Lua、Python 等多种语言优点。

接下来，我们简要介绍 GDScript 的基础使用方法。首先打开 Godot 编辑器，在文件系统面板中右键点击空白处，选择 "新建脚本"，这样就完成了第一个脚本文件的创建。接着，在场景编辑器的节点列表中添加一个基础节点（例如 2D 场景的根节点 Node2D），选中该节点后，在右侧的 检查器 面板中找到 Script 属性，点击加载按钮并选择我们刚才创建的脚本文件，此时脚本就与 Node2D 节点成功绑定了。最后，在脚本编辑器中输入以下代码：

```
extends Node2D  # 挂载到任意 Node2D 节点，使其继承
 
func _ready():    # 内置的初始化函数
    print("Hello, world!")  # 节点首次进入场景树时打印
```

完成脚本编写后，记得保存当前场景（Ctrl+S 或点击菜单栏的 场景 → 保存场景）。接着点击编辑器顶栏的 运行按钮（位于右侧调试工具栏的三角形图标），或直接按下快捷键 F5 启动项目。此时观察编辑器底部的 输出面板（Output），如果看到打印的 "Hello world!" 字样，就说明你的第一个 GDScript 脚本已成功运行！

如你所见，GDScript 虽与 Python 语法高度相似——简洁的缩进、动态类型和易读的代码风格让开发者倍感亲切，但它专为 Godot 引擎量身打造，融入了 @export 属性可视化、signal 事件系统等游戏开发核心功能，既保留了 Python 的轻量灵活，又成为操控 Godot 节点的“专属利器”。

现在，我们来看一段GDScript的代码：

```
# "#" 为注释
# 在 Godot 中，一个 .gd 文件就是一个类（Class）

# （可选）为脚本指定一个图标，在编辑器选择节点时会显示这个图标
@icon("res://path/to/optional/icon.svg")  # 替换成实际图标路径

# （可选）自定义类名，这样其他脚本可以通过这个名称引用它
class_name MyClass  # 定义后可在其他地方用 `var obj = MyClass.new()` 创建实例

# 继承（Inheritance）：表示这个类是基于某个父类扩展的
extends BaseClass  # BaseClass 可以是 Godot 内置类（如 Node、Sprite2D）或其他自定义类

# ==================== 成员变量（类的属性） ====================
# 普通变量声明
var a = 5           # 整型变量，默认值为 5
var s = "Hello"     # 字符串变量
var arr = [1, 2, 3] # 数组（列表）

# 字典（键值对）的两种声明方式
var dict = {"key": "value", 2: 3}  # 标准字典语法
var other_dict = {key = "value", other_key = 2}  # 更简洁的语法（键自动转为字符串）

# 类型声明（Type Hints）
var typed_var: int       # 声明为整型（但运行时仍可赋其他值，除非启用严格模式）
var inferred_type := "String"  # ":=" 会自动推断类型为字符串

# ==================== 常量（不可修改的值） ====================
const ANSWER = 42          # 常量，命名通常全大写
const THE_NAME = "Charly"  # 字符串常量

# ==================== 枚举（Enum） ====================
# 匿名枚举（值默认从 0 开始递增）
enum {UNIT_NEUTRAL, UNIT_ENEMY, UNIT_ALLY}  # 值分别为 0, 1, 2

# 命名枚举（可自定义值）
enum Named {
    THING_1,          # 默认 0
    THING_2,          # 默认 1
    ANOTHER_THING = -1 # 手动赋值为 -1
}

# ==================== 内置向量类型 ====================
var v2 = Vector2(1, 2)   # 二维向量（常用于 2D 坐标/方向）
var v3 = Vector3(1, 2, 3) # 三维向量（用于 3D）

# ==================== 函数（方法）定义 ====================
# 定义一个函数，接收三个参数
func some_function(param1, param2, param3):
    # 函数内部的常量（只在当前函数内有效）
    const local_const = 5

    # 条件判断
    if param1 < local_const:  # 如果 param1 小于 5
        print(param1)        # 打印 param1 的值
    elif param2 > 5:         # 否则如果 param2 大于 5
        print(param2)
    else:                   # 其他情况
        print("Fail!")      # 打印失败信息

    # for 循环（遍历 0~19）
    for i in range(20):
        print(i)            # 打印当前循环的数字

    # while 循环（当 param2 不为 0 时循环）
    while param2 != 0:
        param2 -= 1         # 每次循环 param2 减 1

    # match 匹配（类似其他语言的 switch）
    match param3:
        3:                  # 如果 param3 等于 3
            print("param3 is 3!")
        _:                  # _ 表示默认情况（类似 default）
            print("param3 is not 3!")

    # 局部变量（只在函数内有效）
    var local_var = param1 + 3
    return local_var        # 返回计算结果

# ==================== 函数重写与父类调用 ====================
# 如果父类有同名函数，可以用 super 调用父类的实现
func something(p1, p2):
    super(p1, p2)  # 调用父类的 something(p1, p2)

# 也可以指定调用父类的某个函数
func other_something(p1, p2):
    super.something(p1, p2)  # 等价于上一行的写法

# ==================== 内部类（嵌套类） ====================
# 在类内部定义的另一个类
class Something:
    var a = 10  # 内部类的属性

# ==================== 构造函数（初始化时自动调用） ====================
func _init():
    print("Constructed!")  # 当这个类被实例化时会自动打印
    
    # 创建内部类的实例
    var lv = Something.new()
    print(lv.a)  # 打印内部类的属性 a（输出 10）
```

如果你有一点编程基础，或者Python基础，你可以在上面那一串代码中看到很多熟悉的面孔，没错，GDScript就是这样，它保留了 Python 的简洁性（如 if/for/match 控制流、字典/数组声明），同时扩展了游戏开发核心功能，包括内置的 Vector2/3 向量类型、enum 枚举、signal 事件系统，以及 \_ready()、\_process(delta) 等引擎生命周期钩子；通过 extends 实现节点继承、class\_name 自定义类，配合 @export 导出变量直接在编辑器中调试，让有 Python 基础的开发者能快速上手游戏逻辑开发，无需额外学习复杂框架。

如果想学习更多有关GDScript的内容，可以直接查阅[Godot的文档](https://docs.godotengine.org/zh-cn/4.x/tutorials/scripting/index.html)。同时，Godot官网还提供了GDScript自学的网页：[Learn to Code From Zero with Godot](https://gdquest.github.io/learn-gdscript/?ref=godot-docs)。~~说不定以后我会更新一篇有关GDScript的文章。~~

## 四、**第一个游戏**

### 1.准备&初识

在开启首个游戏开发前，提前备好贴图、模型、音乐、字体等素材至关重要。获取素材主要有三种路径：资源站直取最快捷，像[Kenney](https://kenney.nl/)、[OpenGameArt](https://opengameart.org/)、[itch](https://itch.io/)等平台提供大量免费资源，虽风格可能需妥协但能快速搭建原型；原创自制最契合创意，但需掌握美术建模或音乐创作技能，适合有基础的开发者深耕独特风格；AI智能生成则代表未来趋势，通过各类AI工具生成你需要的东西，即使零基础也能快速获得定制化素材。不过，三种方式可灵活组合，理想情况下，咱们可以先用资源站素材验证玩法，再用AI优化部分素材，最终通过原创素材打磨精品细节。

游戏有了素材只是第一步，想让它们动起来还得靠代码赋予“生命”。 下面我们通过一个简单例子，看看代码是怎么让素材“活”过来的。

先新建个项目，在场景里加个 Sprite2D 节点，选中它后，在右侧检查器找到 Texture 属性，把图片拖进去（比如项目自带的 icon.svg，也就是Godot的图标），直接从文件夹里选图拖到属性框就能用。  
然后右键 Sprite2D 节点新建脚本，贴上下面这段代码（注释里写了每部分的作用）：

```
extends Sprite2D # 继承Sprite2D节点

# 定义旋转速度（角度/秒）
var rotation_speed = 90.0  

# 每帧调用，实现旋转
func _process(delta):
    # delta 是上一帧到当前帧的时间（秒），用于保持速度稳定
    rotate(deg_to_rad(rotation_speed * delta))  # 将角度转为弧度后旋转
```

接下来调整节点位置：点击顶栏菜单切换到 2D视图，把 Sprite2D 节点拖到游戏窗口正中央（默认会在左上角）。最后保存场景（Ctrl+S），点击运行按钮。如果图片开始旋转，说明代码生效了。恭喜你，现在你已经掌握了用代码让游戏素材动起来的最基础方法！

### 2.Ping Pong Game

现在我们正式开启首个游戏的开发之旅，选择以乒乓球游戏作为演示案例。该游戏的规则简洁明了：两名玩家分别操控一个乒乓球拍，通过移动球拍使乒乓球落入对方的区域，若成功则己方得分。

在开发前，我们需要明确游戏所需的核心元素。其一，乒乓球是关键元素之一，需具备物理属性（如弹力、速度等），以模拟真实运动效果；其二，玩家的乒乓球拍同样不可或缺，需包含碰撞检测等物理属性，以实现乒乓球的反弹机制；其三，游戏边界用于约束乒乓球的运动范围，防止其超出屏幕界面；其四，需设计得分机制，当乒乓球落入对方区域（如球拍后方特定范围）时触发得分判定；最后，还需构建用户界面（UI），用于实现暂停、重置游戏以及实时显示比分等功能。

#### （一）游戏边界

![](/images/posts/godot-notes/godot3.webp)

首先，在新建的项目中，我们要先设置好游戏边界。添加一个名为“walls”的 `Node2D` 节点，接着在“walls”节点下添加两个 `StaticBody2D` 节点，分别命名为“top”和“bottom”，并在“top”“bottom”节点下各添加一个 `CollisionShape2D` 节点。然后，再添加两个 `Area2D` 节点，分别命名为“LeftGoal”和“RightGoal”，并为这两个 `Area2D` 节点各自添加一个 `CollisionShape2D` 节点。完成这些操作后，你的场景列表应如左图所示（需注意节点之间的父子关系，例如，“walls”节点的子节点有“top”“bottom”等，“LeftGoal”节点的子节点有对应的 `CollisionShape2D` 节点 ）。

你肯定已经留意到，部分节点的右侧出现了警告标志。这其实是因为你尚未为这些节点设置必要的属性。要知道，`CollisionShape2D` 节点必须指定 `Shape` 属性才行。你可以先选中出现警告的 `CollisionShape2D` 节点，接着查看右侧的检查器面板，在其中找到 “`Shape`” 属性，然后为它添加一个 `RectangleShape2D` 形状。添加完成后，在 2D 编辑界面的左上角，你会看到一个方形的 2D 形状生成出来。此时，你只需通过拖拽、缩放操作，将这个方形调整到合适的位置和大小就可以了。对于其他有类似警告的节点，处理方式也是一样的。完成所有节点的调整后，场景效果应如下图所示：

![](/images/posts/godot-notes/godot4-1024x598.webp)

至此，该场景创建完毕，你可以将其保存并命名为**`game.tscn`**。*其实，你还可以为左右两侧边界分别添加一个 `StaticBody2D` 节点，用于实现乒乓球的反弹效果，这样游戏就能持续运行（若不添加其他终止条件，一方得分后球仍会回弹）。不过要注意，`Area2D` 的 `CollisionShape2D` 区域必须比 `StaticBody2D` 的 `CollisionShape2D` 区域稍大一些（或稍微露出一点点），以确保能正常触发区域检测。*

#### （二）球拍&球

接下来，咱们着手创建球拍场景，整个过程十分简单。在场景编辑界面的顶部工具栏中找到“`+`”（添加新场景），点击它来创建一个新的场景。在新创建的场景里，添加一个 `CharacterBody2D` 节点，并将其命名为“Paddle”。接着，为“Paddle”节点添加两个子节点，一个是 `Sprite2D` 节点，用于显示球拍的贴图；另一个是 `CollisionShape2D` 节点，用于实现碰撞检测功能。

之后，使用画图工具随意绘制一个矩形图形，并为其填充上合适的颜色，以此作为球拍贴图的素材。将绘制好的图片拖入 Godot 的文件系统面板中，Godot 会自动完成导入操作。然后，在场景编辑界面选中 `Sprite2D` 节点，在右侧的检查器面板中找到“`Texture`”属性，将刚刚导入的图片添加到该属性中。

另外，千万别忘了设置 `CollisionShape2D` 节点的“`Shape`”属性。通常情况下，这个碰撞形状的大小和轮廓要与球拍贴图的形状和大小大致相符。完成上述所有设置后，将这个场景保存为“**`Paddle.tscn`**”。

至此，球拍场景就创建完成了。按照同样的方法和思路，你还可以顺利创建出乒乓球场景（保存为“**`ball.tscn`**”）。

#### （三）初步合并

到目前为止，你的 Godot 项目中已经存在三个场景文件，分别是“`game.tscn`”“**`paddle.tscn`**”和“**`ball.tscn`**”。现在，咱们回到“game.tscn”场景。在场景编辑界面的节点列表里，创建一个新的 Node2D 节点。此时，这个新节点还是“wall”（Node2D）节点的子节点之一。接着，用鼠标右键单击这个新创建的 `Node2D` 节点，在弹出的菜单中选择“设为场景根节点”。这样一来，“**`game.tscn`**”场景的根节点就变成了这个 `Node2D` 节点，我们将其命名为“Game”，让它作为整个游戏的主节点。

随后，把之前保存好的“**`paddle.tscn`**”和“**`ball.tscn`**”直接拖放到 2D 场景编辑界面中。由于游戏设有两个玩家，所以需要拖入两个“**`paddle.tscn`**”场景实例。没错，这就是实例化场景的显著优势，它能够让我们反复利用已有的素材，极大地节省了重复性的工作。不过，你可能会发现实例化后的场景不会直接显示其内部的子节点内容。要是想对这些子节点进行修改，还得回到原始的“**`paddle.tscn`**”或“**`ball.tscn`**”场景中进行编辑。但从另一个角度看，在团队协作开发时，这种方式可以很方便地将游戏的不同开发任务分配给各个成员。  
在此过程中，你不妨为游戏添加一个背景（使用 `Sprite2D` 节点），操作方式与之前添加其他元素类似，直接将其拖入场景即可。不过，你可能会遇到背景图覆盖所有场景元素的问题，这是因为 `Sprite2D` 节点的渲染层级高于其他节点。此时需要调整场景树结构——在 Godot 中，节点列表中越靠上的层级越低（即优先渲染下方节点），因此需将背景节点移动至列表最上方，使其成为根节点的直接子节点（注意保持背景与其他元素的层级关系）。你可以通过直接拖拽节点，或选中后按住 Ctrl 键并按 ↑ 方向键来调整顺序，直至背景显示在合适位置。

经过一番合理的放置和调整后，你应该能够在场景中呈现出如下所示的布局：

![](/images/posts/godot-notes/godot5.webp)

#### （四）脚本

##### （1）乒乓球脚本

回到乒乓球的场景（ball.tscn），为此场景的根节点添加一个脚本（ball.gd），并在里面写入：

```
# 继承 CharacterBody2D，适用于无重力的自定义物理运动
extends CharacterBody2D

# 可调节的导出变量：球的速度（默认400）
@export var speed: float = 400

# 球的初始移动方向（默认向右）
var direction: Vector2 = Vector2.RIGHT

# 场景加载时自动调用
func _ready():
    restart()  # 初始化球的位置和速度

# 重置球的位置和随机方向（用于开始或重置游戏）
func restart():
    position = Vector2(480, 300)  # 屏幕中心位置（根据项目实际分辨率调整）
    
    # 随机初始方向（±0.2弧度，约±11.5度），避免纯水平运动
    direction = Vector2.RIGHT.rotated(randf_range(-0.2, 0.2))
    velocity = direction * speed  # 计算初始速度向量

# 每帧处理物理运动（delta参数未使用，因move_and_slide已考虑帧时间）
func _physics_process(delta):
    # 移动并检测碰撞，返回值表示是否发生碰撞
    var collision = move_and_slide()
    
    # 如果发生碰撞
    if collision:
        # 获取碰撞点的法线向量（垂直于碰撞表面的方向）
        var collider_normal = get_slide_collision(0).get_normal()
        
        # 计算反弹方向：原方向关于法线的反射向量
        direction = direction.bounce(collider_normal)
        
        # 限制反弹角度的X分量，避免完全水平或垂直运动（增强可玩性）
        direction.x = clamp(direction.x, -0.7, 0.7)
        # 重新归一化方向向量（保持长度为1，避免clamp影响速度大小）
        direction = direction.normalized()
        
        # 更新速度（保持恒定速度，不受反弹影响）
        velocity = direction * speed
```

运行游戏后，你能看到小球在屏幕内移动，并且当它碰到我们之前设置过 CollisionShape2D 的区域时，会按照物理规则反弹。

##### （2）球拍/玩家脚本

现在，我们把目光聚焦到主场景（game.tscn）下的两个子场景（节点）——Paddle（由第一个 paddle.tscn 实例化而成）和 Paddle2（由第二个 paddle.tscn 实例化而成）。很明显，我们需要为这两个球拍添加通过按键控制移动的逻辑。

在编写脚本之前，得先为这个项目设置好按键映射。在 Godot 编辑器顶部工具栏左侧，依次点击“项目”→“项目设置”，在弹出的新窗口中找到“输入映射”选项。接着，添加 4 个新动作，分别命名为“p1\_up”“p1\_down”“p2\_up”“p2\_down”。然后，为每个动作添加对应的事件（点击动作右侧的“+”），将“p1\_up”映射到 W 键，“p1\_down”映射到 S 键，“p2\_up”映射到上方向键，“p2\_down”映射到下方向键。也就是说，玩家 1 使用 W 键和 S 键来控制球拍的上下移动，玩家 2 则使用上方向键和下方向键进行操作。

接下来，咱们要为两个 paddle 场景添加脚本。由于两个球拍的控制方式类似，代码逻辑结构基本相同，只是需要替换关键的动作映射。下面以其中一个球拍为例展示代码，你可以参照这个例子轻松写出第二个球拍的控制逻辑。为第一个球拍（Paddle）添加脚本，代码如下：

```
# 继承 CharacterBody2D 类，使该节点具备物理相关的属性和方法
extends CharacterBody2D

# 使用 @export 修饰符将 speed 变量暴露在编辑器中，方便直接调整速度值，默认值为 300
@export var speed: float = 300

# _physics_process 函数会在每一帧的物理更新阶段被调用，delta 参数表示上一帧到当前帧的时间间隔
func _physics_process(delta):
    # 初始化速度向量为零，确保每一帧开始时速度重置
    self.velocity = Vector2.ZERO
    
    # 输入检测部分
    # 检查玩家 1 的向上移动按键（对应之前设置的 "p1_up" 动作，实际映射为 W 键）是否被按下
    if Input.is_action_pressed("p1_up"):   # p1_up -> W
        # 若按下，则在速度向量的 y 轴（垂直方向）上减去 speed 值，实现向上移动
        self.velocity.y -= speed
    # 检查玩家 1 的向下移动按键（对应之前设置的 "p1_down" 动作，实际映射为 S 键）是否被按下
    if Input.is_action_pressed("p1_down"): # p1_down -> S
        # 若按下，则在速度向量的 y 轴（垂直方向）上加上 speed 值，实现向下移动
        self.velocity.y += speed
    
    # 调用 move_and_slide() 方法，根据当前 velocity 的值移动角色，并自动处理碰撞
    move_and_slide()
```

对于第二个球拍（Paddle2），只需将代码中的动作映射替换为对应的“p2\_up”和“p2\_down”即可，这样，两个球拍就分别可以通过不同的按键进行控制移动了。

*此时，如果你细心，你能够在下方调试器中看到警告信息：  
The parameter "delta" is never used in the function "\_physics\_process()". If this is intended, prefix it with an underscore: "\_delta".  
这是因为delta 是上一帧到当前帧的时间间隔（秒），通常用于帧率无关的运动计算（比如 position += speed \* delta）。如果你定义了 delta 但没在函数里用它，GDScript 会认为你可能忘记使用它，或者参数名写错了。为了明确表示“这个参数是我故意不用的”，GDScript 推荐用 \_delta 命名。当然，你可以选择忽略。*

##### （3）分数系统

接下来，我们要着手编写加分机制的脚本了。还记得之前创建的那两个 Area2D 节点吗？它们的作用就是进行区域检测。我们可以通过编写脚本，让乒乓球进入 Area2D 所设定的区域时，触发加分逻辑。

具体操作如下：先选中其中一个 `Area2D` 节点，例如 LeftGoal（这是左边玩家需要防守的区域，同时也是右边玩家的得分区）。在右侧的节点面板中，找到 `body_entered(body: Node2D)` 信号（此信号用于区域检测，当有物体进入该区域时，就会触发这个信号）。你可以右键点击该信号并选择“连接”，或者直接双击它。随后会弹出一个新窗口（连接信号到方法），在“连接到脚本”一栏中，选择乒乓球节点对应的脚本。对于后面的接收方法，你可以自行简单命名。点击“连接”后，你会在 ball.gd（乒乓球脚本）的最后几行看到如下代码被自动添加进去：

```
func _on_left_goal_body_entered(body: Node2D) -> void:
    pass # Replace with function body.
```

现在，你需要修改这个函数，比如先简单添加一个print()语句来调试输出（比如`print(“player_2 +1”)`，记得把`pass`移除）。运行后，当球移动到左方时，输出台会输出player\_2 +1。

不过，在实际运行游戏时，你可能会遇到这样的问题：游戏一开始，控制台就立刻输出两次（或者3次） player\_2 +1 的加分信息，而此时乒乓球明明还没有进入相关得分区域。这背后的原因其实与场景中的碰撞体设置有关。

具体来说，如果你在设置 wall 相关的 `StaticBody2D`（比如 top 和 bottom 的墙体）时，它们的 `CollisionShape2D` 子节点与 `Area2D`（即 RightGoal 和 LeftGoal）的 CollisionShape2D 节点发生了位置重叠，那么 `_on_left_goal_body_entered(body: Node2D)` 函数就会错误地检测到 top 和 bottom 的 `StaticBody2D` 进入得分区域。这是因为 `StaticBody2D` 节点同样继承自 `Node2D`，具备碰撞检测的属性（事实上你可以在添加节点时看到节点与节点之间的父子关系，子节点一定包含父节点的某些属性），以至于先触发了2次（或者3次）函数。

为了解决这个问题，我们可以在`_on_left_goal_body_entered(body: Node2D)`中加入条件判断：

```
func _on_left_goal_body_entered(body: Node2D) -> void:
    if body is CharacterBody2D:
        print("player_2 +1")
```

相同的步骤，你可以完成RightGoal区域信号的连接。接下来，我们需要做一个真正的分数系统。回到主场景的根节点（game.tscn-->Game(Node2D)）,为其添加一个脚本（game.gd），并在里面写入：

```
extends Node2D

var player_1_score: int = 0
var player_2_score: int = 0
 
func add_score(player_id: int):
    if player_id == 1:
        player_1_score += 1
    elif player_id == 2:
        player_2_score += 1
    print("Score: Player 1 = ", player_1_score, ", Player 2 = ", player_2_score)
```

接下来，我们回到 ball.gd 脚本，需在原有的两个区域检测函数中调用 `add_score()` 方法，此方法可通过传入参数为对应玩家加分。为获取游戏主节点引用，可在脚本开头添加 `@onready var game: Node2D = $".."` ，或在 Godot 编辑器中长按场景根节点拖拽至脚本变量声明处并按住 Ctrl 键自动生成该代码。

随后，在 `_on_left_goal_body_entered()` 函数内调用 `game.add_score(2)` 为玩家 2 加分，在 `_on_right_goal_body_entered()` 函数内调用 `game.add_score(1)` 为玩家 1 加分。完成这些修改后，ball.gd 脚本的相关部分便会具备正确的加分逻辑。

```
extends CharacterBody2D

@export var speed: float = 400

var direction: Vector2 = Vector2.RIGHT
# 获取父节点
@onready var game: Node2D = $".."

func _ready():
    restart()  

# 重置球的位置和速度
func restart():
    position = Vector2(480, 300) 
    direction = Vector2.RIGHT.rotated(randf_range(-0.2, 0.2))  # 随机调整方向
    velocity = direction * speed  # 根据方向和速度计算球的移动速度

# 物理处理函数，每帧调用
func _physics_process(_delta):
    var collision = move_and_slide()  # 移动球并检测碰撞
    
    if collision:
        var collider_normal = get_slide_collision(0).get_normal()  # 获取碰撞法线
        direction = direction.bounce(collider_normal)  # 根据碰撞法线反弹方向
        direction.x = clamp(direction.x, -0.7, 0.7)  # 限制方向的X分量
        direction = direction.normalized()  # 归一化方向
        velocity = direction * speed  # 更新速度

# 当球进入左侧得分区时调用
func _on_left_goal_body_entered(body: Node2D) -> void:
    if body is CharacterBody2D:  
        print("player_2 +1") 
        game.add_score(2)  # 调用游戏逻辑增加得分

# 当球进入右侧得分区时调用
func _on_right_goal_body_entered(body: Node2D) -> void:
    if body is CharacterBody2D:  
        print("player_1 +1")  
        game.add_score(1)
```

运行一下，每当球进入到对面的得分区，你可以看到输出台会输出Score: Player 1 = 1, Player 2 = 0之类的。不过，这样我们只能通过输出台看到玩家的分数，因此我们需要一个能够直接显示在游戏界面内的方式来显示各玩家分数。

回到游戏主场景（game.tscn），在后面添加2个label节点用于显示分数，顺便命名为p1\_score和p2\_score。接着选择`label`节点，在右侧的检查器中找到`Theme Overrides`（主题覆盖）属性，找到`Font Size`（字体大小）并修改成50px。然后将这两个`label`节点拖拽至合适的位置。

接着回到game.gd脚本中，进行如下修改：

```
extends Node2D

var player_1_score: int = 0
var player_2_score: int = 0

# 声明变量并赋值（从子节点中选取）
@onready var p_1_score: Label = $p1_score
@onready var p_2_score: Label = $p2_score

# 初始化
func _ready() -> void:
    # 初始化p1_score和p2_score（label）节点的内容
    p_1_score.text = "0"
    p_2_score.text = "0"
    
    
func add_score(player_id: int):
    if player_id == 1:
        player_1_score += 1
        p_1_score.text = str(player_1_score) # 修改p1_score节点的text（文本）属性的内容
    elif player_id == 2:
        player_2_score += 1
        p_2_score.text = str(player_2_score)
   #print("Score: Player 1 = ", player_1_score, ", Player 2 = ", player_2_score)
```

运行后，只要得分了，就能在相应的地方显示。

#### （五）玩家界面

玩家界面（Player Interface，简称 UI）是游戏中与玩家直接交互的视觉和功能系统的集合，用于展示信息、接收输入并增强沉浸感。由于我们这个游戏并不涉及复杂的UI系统，所以我们就简单的为其添加一个暂停菜单吧。

首先，我们来创建一个新场景，以 Panel 节点作为根节点，并将其命名为“ui.tscn”。接着，向该场景中添加两个 Button 节点。对于 Panel 节点，你可以在检查器中对其样式进行适当调整（Button 节点同理），同时，别忘了在两个 Button 节点的 text 属性中分别输入“重置”和“继续”的文本提示。适当调节一下位置，最后保存场景。

然后，你需要将ui.tscn场景拖入至主场景的合适位置，如下图所示：

![](/images/posts/godot-notes/godot6-1024x544.webp)

接下来，我们需要写一个脚本用于实现界面交互的逻辑（包括界面的换出、按钮的逻辑）。为之前ui.tscn场景的panel节点创建一个脚本“ui.gd”，接着写入：

```
extends Panel

@onready var reset_button = $reset  # 获取重置按钮的引用
@onready var continue_button = $continue  # 获取继续按钮的引用

func _ready():
    hide()  # 隐藏面板
    mouse_filter = MOUSE_FILTER_STOP  # 阻止鼠标事件穿透
    process_mode = Node.PROCESS_MODE_ALWAYS  # 设置处理模式为始终处理
    reset_button.pressed.connect(reset_game)  # 连接重置按钮的按下事件到reset_game函数
    continue_button.pressed.connect(continue_game)  # 连接继续按钮的按下事件到continue_game函数

# 输入检测
func _input(event):
    if event is InputEventKey and event.pressed and event.keycode == KEY_ESCAPE:
        if visible:
            continue_game()
        else:
            show()
            get_tree().paused = true
# 重置游戏
func reset_game():
    get_tree().paused = false
    get_tree().reload_current_scene()  # 重新加载当前场景

# 继续游戏
func continue_game():
    hide()
get_tree().paused = false
```

需要说明的是，将 process\_mode 设置为 Node.PROCESS\_MODE\_ALWAYS 这一操作十分关键。若缺少这一设置，就会出现召唤出的界面内按钮无法响应点击事件的情况。这是因为在按下 Esc 键时，会执行 get\_tree().paused = true，导致整个游戏场景树被暂停，此时就连按钮的逻辑也被暂停了，所以按钮无法响应操作，因此必须对其进行特殊处理。

## 五、游戏开发技巧

### （一）动作帧序列图

在许多游戏中，玩家操控的人物通常包含多个动作动画，比如站立、走路、跑步、攻击等。这些动作并非独立存在，而是通过**动作帧序列图**串联成流畅的动态表现。简单来说，帧序列图就像一本按顺序翻页的漫画书，每一页对应一个关键动作帧，当快速连续播放时，就能呈现出连贯的动画效果。

什么是动作帧序列图？你可以把它想象成“动画时间轴”，将角色不同姿势的图像（或骨骼动画数据）按时间顺序排列。在Godot 中，这些帧序列会被整合到动画系统里，通过代码或事件触发切换。接下来我们来实战一下。先在godot中创建一个CharacterBody2D节点，并为其依次添加CollisionShape2D和AnimatedSprite2D子节点，其中AnimatedSprite2D是我们需要重点关注的。选中AnimatedSprite2D，并在右侧的检查器中找到Animation下的Sprite Frames属性，新建一个SpriteFrames，在底部面板，你可以看到：

![](/images/posts/godot-notes/image-2.webp)

现在找一个**动作帧序列图**，它应该长这样：

![](/images/posts/godot-notes/image-3.webp)

如你所见，这个动画帧序列面板中展示了角色不同动作的帧排列，当前已包含站立、走路、攻击等基础动作。现在需要在SpriteFrames资源中新建一个名为"idle"的站立动画：点击面板左上角的"新建动画"按钮创建空序列，接着选择"从精灵表中添加帧"选项。在弹出的精灵表编辑器中，你可以通过拖拽边框精确裁剪每帧图像区域，按住Shift键可批量选择连续帧图片，确认后这些帧将自动填充到时间轴上。完成添加后记得在右侧属性面板调整"每秒帧数(FPS)"参数控制播放速度，还可以通过勾选"循环播放"选项让角色保持自然呼吸动画效果。

![](/images/posts/godot-notes/image-4.webp)

接下来就是利用脚本让角色能够真正动起来（你需要依次添加按键映射以及相关的动画）：

```
extends CharacterBody2D

@onready var animated_sprite_2d: AnimatedSprite2D = $AnimatedSprite2D

# 移动参数
const MAX_SPEED = 100.0
const ACCELERATION = 1000.0
const FRICTION = 5000.0

func _physics_process(delta: float) -> void:
    # 输入处理
    var input_vector = Vector2(
        Input.get_action_strength("move_right") - Input.get_action_strength("move_left"),
        Input.get_action_strength("move_down") - Input.get_action_strength("move_up")
    )
    
    # 移动逻辑
    if input_vector != Vector2.ZERO:
        velocity = velocity.move_toward(input_vector.normalized() * MAX_SPEED, ACCELERATION * delta)

        animated_sprite_2d.flip_h = input_vector.x > 0
    else:
        velocity = velocity.move_toward(Vector2.ZERO, FRICTION * delta)
    
    move_and_slide()
    update_animation()

func update_animation() -> void:
    if velocity.length() > 5:
        animated_sprite_2d.play("walk")
    else:
        animated_sprite_2d.play("idle")
```

### （二）瓦片集

瓦片集（TileSet）是游戏开发中用于构建2D场景的核心资源，它将多个小尺寸图像（瓦片）集合到一个资源文件中，通过重复使用这些瓦片拼接出大型、复杂的地图或场景。

瓦片集通过将小尺寸瓦片整合为统一资源，大幅减少内存占用并优化加载速度，同时支持自动拼接与碰撞检测等智能化功能，使场景设计更加直观灵活；其分层渲染与动态修改能力不仅简化了复杂地图的构建流程，还能在运行时实现场景的实时交互与调整，结合跨平台兼容性，瓦片集最终为开发者提供了从资源管理到场景呈现的全流程优化方案，成为2D游戏开发中不可或缺的高效技术手段。

接下来我们尝试在Godot中利用瓦片集来创建一个场景。首先你需要准备好一个瓦片集图片，接着在场景树里添加一个TileMapLayer节点，在检查器里找到Tile Set属性，添加一个TileSet,然后在底部面板的TileSet中添加瓦片集图片，并创建图块。随后在底部面板中选择TileMap，然后选择图块进行绘制。

在绘制游戏地图场景时，需根据具体视角类型灵活调整图层排列策略：以第三人称俯视视角游戏为例，基础底层元素（如草地）应置于场景树根节点位置，确保其处于最底层；树、墙、花、石头等中层元素则需创建新节点作为草地的子节点，置于其次……这一过程中需严格遵循场景树节点的层级顺序，通过合理的图层管理实现视觉效果的正确叠加与交互逻辑的精准呈现。

![](/images/posts/godot-notes/image-5.webp)

在完成地图场景绘制后，实际运行时可能出现玩家角色无故穿透障碍物（如树、石头等）的现象，这通常是由于未正确配置物理碰撞层导致的。

其实我们可以直接在TileMapLayer节点内为相应的图块设置物理碰撞层。首先，在检查器中找到Tile Set属性下的Physics Layer，点击添加元素。然后回到底部面板的TileSet，找到绘制——选择属性编辑器——物理层，选择相应的图库进行物理层的绘制：

![](/images/posts/godot-notes/image-6.webp)

在示例的第三人称俯视视角2D游戏中，我只绘制了整棵树的树基部分。这是因为当角色移动到树后时，需要呈现"被树干遮挡"的视觉效果——但从游戏合理性考虑，角色不应被树基（贴近地面的部分）阻挡移动路径。而且，为实现分层遮挡效果，还需要调整瓦片集的Z索引设置——具体操作路径为：在TileSet编辑器中选择对应图块，找到渲染中的Z索引参数并设置较大数值。又或者是，在绘制里，选择渲染中的Z索引，设置数字后直接对着相应的图块绘制即可。这样设置的原因是：要让树干和树叶的渲染层级高于角色，确保它们始终显示在角色前方，从而形成自然的遮挡关系。现在，大功告成，你可以直接在你的游戏场景里绘制设置好的瓦片集了。

### （三）信号

在 Godot 中，信号（Signal） 是节点间通信的“事件总线”，让对象无需直接引用彼此也能响应交互。它像游戏中的“广播系统”：当特定事件发生（如按钮被点击、角色受伤、碰撞触发），节点会发出信号，其他节点通过“订阅”这些信号来执行对应逻辑。

Godot 的信号机制让游戏开发更灵活：节点通过发出信号（如按钮的 pressed）与其他对象解耦通信，无需硬编码关联；内置大量实用信号（如碰撞检测、动画结束），还支持自定义信号（如 enemy\_defeated）实现特定逻辑；典型应用包括点击按钮加载关卡、进入区域触发音效、击败敌人更新UI等场景。现在，我们通过一个游戏暂停菜单的示例来演示信号机制的实际应用。在大多数游戏中，UI系统通常包含多层交互菜单，每个菜单项都对应着特定的功能逻辑。以我们创建的暂停菜单为例：该界面通过两个功能按钮实现核心交互——"继续"按钮用于恢复游戏进程，而"重开"按钮则会触发游戏重新加载（在节点树中我还加入了AudioStreamPlayer节点用于音效）：

![](/images/posts/godot-notes/image-7.webp)

为这个场景绑定一个脚本，并添加以下代码：

```
extends Node2D

@onready var continue_button: Button = $control/continue/button
@onready var reset_button: Button = $control/Reset/Button
@onready var pause_menu: Node2D = $"."
@onready var animation_player: AnimationPlayer = $AnimationPlayer2
@onready var btn_sfx: AudioStreamPlayer = $btn_sfx
@onready var menu_in_sfx: AudioStreamPlayer = $menu_in_sfx

var is_menu_active := false

func _ready() -> void:
    # 设置菜单节点始终处理输入
    pause_menu.process_mode = Node.PROCESS_MODE_ALWAYS
    
    # 初始化时隐藏菜单
    pause_menu.hide()

func _input(event: InputEvent) -> void:
    if event is InputEventKey and event.keycode == KEY_ESCAPE and event.pressed:
        toggle_menu()
        get_viewport().set_input_as_handled()

func toggle_menu() -> void:
    if is_menu_active:
        animation_player.play("menu_out")
        await animation_player.animation_finished
        pause_menu.hide()
        get_tree().paused = false
    else:
        get_tree().paused = true
        pause_menu.show()
        animation_player.play("menu_in")
        menu_in_sfx.play()
        await animation_player.animation_finished
        continue_button.grab_focus()
    
    is_menu_active = not is_menu_active

func _on_continue_button_pressed() -> void:
    print('继续游戏')
    btn_sfx.play()
    toggle_menu()

func _on_reset_button_pressed() -> void:
    print("重置游戏")
    
    get_tree().paused = false
    ScoreManager.score = 0
    btn_sfx.play()
    get_tree().reload_current_scene()
```

接下来进行信号绑定的具体操作：在节点树中选中"继续游戏"按钮节点，在右侧Inspector面板的Node选项卡下找到pressed()信号，右键选择"连接"（Connect）。在弹出的连接对话框中，将目标节点指定为场景根节点PauseMenu（该节点需已附加脚本），此时系统默认会生成一个名为\_on\_button\_pressed的空方法。但因为我们已预先在PauseMenu脚本中定义了\_on\_continue\_button\_pressed()方法来专门处理继续游戏逻辑，所以应手动选择这个现有方法进行绑定。确认后，当玩家点击按钮时，按钮的pressed()信号将通过引擎自动传递至PauseMenu脚本，并触发对应的\_on\_continue\_button\_pressed()方法执行游戏恢复逻辑。

![](/images/posts/godot-notes/image-8.webp)

在上面的示例中，我们仅仅使用的是按钮节点的一个预设信号pressed()进行逻辑的串联，但其实，我们还可以在godot里自定义一个信号，需要时发射它，让其他节点监听并响应。

……………………

***未完待续……***
