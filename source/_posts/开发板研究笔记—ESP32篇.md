---
title: "开发板研究笔记—ESP32篇"
img_dir: esp32-notes
cover: /images/posts/esp32-notes/fm.png
date: 2024-07-24 13:03:52

categories: ["开发板"]
tags: ["ESP32", "Micropython", "开发板"]
---

## **前言**

继ESP8266后我又整了一块ESP32的板子。通过查阅资料可以发现，ESP32和ESP8266都是流行的物联网（IoT）微控制器，它们共同的特点在于都支持Wi-Fi通信，能够连接到无线网络进行数据传输。两者都拥有丰富的开源资源，支持开发者进行二次开发和定制，广泛应用于物联网、智能家居、嵌入式系统等领域。且都支持C/C++和MicroPython语言。

ESP32以其高性能著称，采用双核处理器，具备强大的计算能力和多任务处理能力。它集成了丰富的外设接口和更多的GPIO引脚，支持多种通信协议（包括蓝牙），并具备低功耗设计和较高的安全性。然而，相比ESP8266，ESP32的成本较高，不过俗话说的好，一分钱一分货，面对这种情况得按需选择。

可以说，ESP32就是ESP8266的升级版。那么在此文中，我会继续分享一些ESP32的有趣项目，当然还是得叠个甲：本人并非专业人士，接下来的内容仅供参考。而且毕竟是笔记，难免有copy的部分。

## 一、**开发环境搭建**

基于之前对 ESP8266 的研究经验，接下来我打算分别用 MicroPython 和 C/C++ 这两种语言来开发 ESP32 项目。听说 ESP32 还能支持 Lua、JavaScript 等其他编程语言，不过我对它们了解不多，所以还是以 MicroPython 和 C 语言为主进行开发。言归正传，和开发 ESP8266 时一样，咱们首先要安装一个能用来编写程序的集成开发环境（IDE）。

### **1.MicroPython**

可支持MicroPython开发的IDE有[****Mu Editor****](https://codewith.mu/)、[****uPyCraft IDE****](https://dfrobot.gitbooks.io/upycraft/content/)、[****Thonny IDE****](https://thonny.org/)以及[**MicroIDE**](https://microide.com/)等。这里依然推荐[**Thonny**](https://thonny.org/)，因为它操作十分简单，容易上手。当然，使用其它工具也是可以的，甚至是[**Visual Studio Code**](https://code.visualstudio.com/)，只不过你需要额外加装合适的插件才行（如[**RT-Thread**](https://www.rt-thread.org/)、[****Pymakr****](https://marketplace.visualstudio.com/items?itemName=pycom.Pymakr)）。

以Thonny为例，选择[**合适的版本**](https://doc.itprojects.cn/A0001.micropython.esp32/02.download/03.thonny/thonny-4.0.1.exe)下载后按照正常安装流程安装软件。接着下载适配ESP32的[**MicroPython**](https://micropython.org/download/ESP32_GENERIC/)，它是一个后缀为bin的文件。同时你还得下载并安装ESP32的串口通信的[**驱动程序**](https://doc.itprojects.cn/A0001.micropython.esp32/02.download/02.driver/esp32usbDriver.zip)，以便计算机能够识别和读写ESP32（不过一般情况下，电脑系统都会自带）。到这里，前期准备工作就完成了。

接下来是配置IDE，打开Thonny，在顶栏菜单找到运行—配置解释器，在打开的窗口配置好ESP32解释器和端口，接下来点击安装MicroPython。安装完成出现Done的字样后说明安装成功。

![](/images/posts/esp32-notes/esp32_1.png)

刷新完成后会出现以下界面（如果没有显示文件列表，则需要在视图中勾选“文件”）：

![](/images/posts/esp32-notes/esp32_3.png)

到这里，整个开发环境已经搭建完毕，点击新建，创建一个新的文件。

### 2.**C/C++**

对于C/C++，其实乐鑫官方就给出了一个开发的工具框架：[**ESP-IDF**](https://docs.espressif.com/projects/esp-idf/zh_CN/stable/esp32/get-started/index.html)，但它配置起来有点复杂，所以这边推荐新手友好的[**Arduino IDE**](https://www.arduino.cc/)，不过你需要注意，因为ESP-IDF是官方的工具，所以它能够很快适配 ESP32 的新特性和功能更新，但Arduino就很难保证同步了。

接下来我们正式进入Arduino的安装环节。首先，找一个适合你电脑系统的版本[**下载**](https://www.arduino.cc/en/software/)下来。下载好之后，就按照平常安装软件的步骤，一步步操作就行，没什么特别的难度。

安装好 Arduino IDE （写当前内容时的版本为2.3.6）后，双击打开它，进入配置环节。软件界面打开后，在菜单栏里找到“文件”，再点击“首选项”。接下来，你会看到一个设置页面，在“项目文件夹地址”这一栏，要填入一个你觉得合适的文件夹路径。这个文件夹可重要啦，以后你所有的项目都会存放在这里。它就像是一个“大仓库”，里面会包含各种项目相关的内容，比如各种库文件、配置文件，还有你编写的主程序代码等等；接着在“开发板管理地址”填入以下内容：[**https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package\_esp32\_index.json**](https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json)

它是 Arduino IDE 获取 ESP32 开发板支持包的关键资源定位符。点击确定完成这一步的操作。

![](/images/posts/esp32-notes/arduino1.png)

接下来找到工具->开发板：“……”->开发板管理器（或者左侧竖栏从上往下数第二个图标），搜索“esp32”，找到esp32 by Espressif Systems安装。安装完成后，将你的ESP32开发板连接至电脑，然后在顶栏第二栏菜单中选择你的端口和开发板，在本例中选择的是COM5-ESP32 Dev Module。

![](/images/posts/esp32-notes/arduino2.png)

至此，ArduinoIDE安装并配置完毕。

## **二、了解开发板的结构**

![](/images/posts/esp32-notes/esp32_2.png)

如图是我自己购买的**ESP-WROOM-32**开发板的实物图，可以看到它的结构和搭载ESP8266的NodeMCU大差不差。但仍然有些细节要注意。首先，你会发现我的ESP32上搭载的串口硬件与之前的ESP8266不一样，这是因为我的ESP32采用的是CH9102X串口芯片，而之前ESP8266的是CH340，理论来说CH9102X要比CH340传输速度会更快，~~所以搭载CH9102X串口芯片的板子要比搭载CH340的要贵一点~~。

ESP32主芯片（其实应该称其为ESP32模组，因为已经封装起来了）里就藏有ESP32芯片、Flash芯片和一些基础的外围电路（由晶振、电容、电阻等构成）；再往外看，就是一些我们能看得到的电路，这些电路分为电源稳压、数据传输、硬件保护等部分。

顺便注意一下，下面的文本里基本都是基于我购买的这款来写的，同时请注意接下来说的“ESP32”均默认代表ESP-WROOM-32（特别说明除外）。

### **ESP32的硬件设施及特点：**

- **双核CPU**：ESP32采用双核Xtensa 32-bit LX6 CPU，每个核心均可独立控制或上电，时钟频率可调范围从80 MHz到240 MHz，提供强大的处理能力。
- **低功耗设计：**ESP32具备低功耗模式，包括深度睡眠模式，其睡眠电流小于5µA，非常适合电池供电的设备。此外，它还配备了一个低功耗协处理器，可以在CPU断电时监测外设状态或模拟量变化。

#### 无线通信

- **Wi-Fi**：支持802.11 b/g/n协议，最大传输速率可达150 Mbps，通过路由器可直接连接互联网，支持STA/AP/STA+AP模式。
- **蓝牙**：集成传统蓝牙和低功耗蓝牙BLE，可用于连接手机、耳机、广播BLE Beacon等。

#### 外设接口

- **存储接口**：SD卡接口、高速SDIO/SPI。
- **通信接口**：UART（通用异步收发传输器）、I2S（用于音频数据传输的总线标准）、I2C（两线式串行总线）、SPI（串行外设接口）、以太网接口等。
- **电源接口：**通常包括USB供电接口和排针供电接口。USB供电接口可以通过USB线连接到电脑或其他USB电源设备，为开发板提供5V电源。排针供电接口则可以通过外接电源模块为开发板提供更高电压的电源
- **GPIO（通用输入输出）引脚：**ESP32开发板提供了大量的GPIO引脚，这些引脚可以配置为输入或输出模式，用于连接各种外部设备和传感器。
- **ADC（模数转换器）和DAC（数模转换器）：**ESP32开发板内置ADC和DAC模块，可以将模拟信号转换为数字信号或将数字信号转换为模拟信号，从而支持模拟信号的采集和输出。
- **PWM（脉冲宽度调制）：**ESP32开发板支持PWM输出，可以通过调整PWM信号的占空比来控制外部设备的运行状态。

#### 按钮

**①EN按钮（复位按钮）**

**作用：**EN按钮主要用于复位ESP32模块。当按下此按钮时，ESP32模块会进行复位操作，重启其运行的系统或程序。这对于在开发过程中需要重置设备到初始状态或解决一些运行时出现的问题非常有用。

**应用场景：**在调试程序时，如果程序出现死循环或不可预料的错误，可以通过按下EN按钮来重启ESP32，从而恢复到初始状态，便于重新加载程序或进行进一步的调试。在需要重新启动设备以应用新的设置或配置时，也可以使用EN按钮进行复位操作。

**②BOOT按钮（下载/启动配置按钮）**

**作用：**BOOT按钮在ESP32的启动和固件下载过程中起着关键作用。通过特定的操作（如同时按下BOOT和EN按钮），可以将ESP32置于特定的启动模式（如固件下载模式），从而允许通过串口等方式向ESP32下载新的固件或程序。

**应用场景：**在开发新程序或更新现有程序时，需要先将ESP32置于固件下载模式。这通常通过同时按下BOOT和EN按钮（有时还需要保持BOOT按钮按下直到开始下载）来实现。在需要恢复ESP32到出厂设置或刷写底层固件时，也可能需要进入固件下载模式。

#### 硬件内存

- ROM： 448 KB（用于启动和运行）
- SRAM：520 KB（用于数据和指令）
- RTC 快速 SRAM：8 KB（用于从深度睡眠模式启动 RTC 期间的数据存储和主 CPU）
- RTC 慢速 SRAM：8KB（用于深度睡眠模式下的协处理器访问）
- eFuse：1 Kb（其中 256 位用于系统（MAC 地址和芯片配置），其余 768 位保留用于客户应用，包括 Flash-Encryption 和 Chip-ID）
- 嵌入式闪存：通过 ESP32-D2WD 和 ESP32-PICO-D4 上的 IO16、IO17、SD\_CMD、SD\_CLK、SD\_DATA\_0 和 SD\_DATA\_1 内部连接的闪存。0 MiB（ESP32-D0WDQ6、ESP32-D0WD 和 ESP32-S0WD 芯片）；2 MiB （ESP32-D2WD 芯片）；4 MiB（ESP32-PICO-D4 SiP 模组）

#### 接口概览

- 18 个模数转换器 （ADC） 通道
- 3 个 SPI 接口
- 3 个 UART 接口
- 2 个 I2C 接口
- 16 个 PWM 输出通道
- 2 个数模转换器 （DAC）
- 2 个 I2S 接口
- 10 个电容式感应 GPIO

##### **1、仅输入引脚**

GPIO 34 ~ GPIO 39 没有内部上拉或下拉电阻，它们只能用作输入，不能用作输出。

##### **2、SPI闪存**

GPIO 6 ~ GPIO 11 连接到 ESP-WROOM-32 芯片上的集成 SPI 闪存，不建议用于其他用途。

##### **3、电容式触摸 IO**

ESP32 具有 10 个内置电容式触摸传感器。它们可以感知任何带有电荷的东西的变化，可以检测用手指触摸GPIO时引起的变化。这些引脚可以集成到电容焊盘中取代机械按钮，也可用于 ESP32 从深度睡眠中唤醒。

T0 （GPIO 4）、T1 （GPIO 0）、T2 （GPIO 2）、T3 （GPIO 15）、T4 （GPIO 13）、T5 （GPIO 12）、T6 （GPIO 14）、T7 （GPIO 27）、T8 （GPIO 33）、T9 （GPIO 32）

##### **4、ADC**

ESP32 具有 18 x 12 位 ADC 输入通道，12位分辨率可以获得从 0 到 4095 的模拟读数，其中 0 对应 0V，4095 对应 3.3V。还可以在代码和ADC范围上设置通道的分辨率。

注意：ADC 引脚没有线性行为；使用 Wi-Fi 时不能使用 ADC2 引脚。

ADC1\_CH0 （GPIO 36）  
ADC1\_CH1 （GPIO 37）  
ADC1\_CH2 （GPIO 38）  
ADC1\_CH3 （GPIO 39）  
ADC1\_CH4 （GPIO 32）  
ADC1\_CH5 （GPIO 33）  
ADC1\_CH6 （GPIO 34）  
ADC1\_CH7 （GPIO 35）  
ADC2\_CH0 （GPIO 4）  
ADC2\_CH1 （GPIO 0）  
ADC2\_CH2 （GPIO 2）  
ADC2\_CH3 （GPIO 15）  
ADC2\_CH4 （GPIO 13）  
ADC2\_CH5 （GPIO 12）  
ADC2\_CH6 （GPIO 14）  
ADC2\_CH7 （GPIO 27）  
ADC2\_CH8 （GPIO 25）  
ADC2\_CH9 （GPIO 26）

##### **5、DAC**

ESP32 上有 2 x 8 位 DAC 通道，用于将数字信号转换为模拟电压信号输出。

DAC1 （GPIO25）、DAC2 （GPIO26）

##### **6、RTC GPIO**

当 ESP32 处于深度睡眠状态时，可以使用路由到 RTC 低功耗子系统的 GPIO。当超低功耗 （ULP） 协处理器运行时，这些 RTC GPIO 可用于将 ESP32 从深度睡眠中唤醒。

RTC\_GPIO0 （GPIO36）  
RTC\_GPIO3 （GPIO39）  
RTC\_GPIO4 （GPIO34）  
RTC\_GPIO5 （GPIO35）  
RTC\_GPIO6 （GPIO25）  
RTC\_GPIO7 （GPIO26）  
RTC\_GPIO8 （GPIO33）  
RTC\_GPIO9 （GPIO32）  
RTC\_GPIO10 （GPIO4）  
RTC\_GPIO11 （GPIO0）  
RTC\_GPIO12 （GPIO2）  
RTC\_GPIO13 （GPIO15）  
RTC\_GPIO14 （GPIO13）  
RTC\_GPIO15 （GPIO12）  
RTC\_GPIO16 （GPIO14）  
RTC\_GPIO17 （GPIO27）

##### **7、PWM**

ESP32 LED PWM 控制器具有 16 个独立通道，可配置为生成具有不同属性的 PWM 信号。所有可以用作输出的引脚都可以用作PWM引脚（GPIO 34至39不能产生PWM）。

设置PWM信号，需要定义信号频率、占空比、PWM通道、要输出信号的 GPIO。

##### **8、I2C**

ESP32 有两个 I2C 通道，任何引脚都可以设置为 SDA 或 SCL。ESP32 与 Arduino IDE 配合使用时默认的 I2C 引脚为：GPIO 21 （SDA）、GPIO 22 （SCL）。

如果想使用其他引脚，调用：Wire.begin(SDA, SCL);

##### **9、SPI**

默认 SPI 的引脚映射为：

| SPI | MOSI | MISO | CLK | CS |
| --- | --- | --- | --- | --- |
| VSPI | GPIO 23 | GPIO 19 | GPIO 18 | GPIO 5 |
| HSPI | GPIO 13 | GPIO 12 | GPIO 14 | GPIO 15 |

##### **10、Strapping**

Strapping 引脚用于将 ESP32 置于引导加载程序或闪烁模式。大多数内置 USB/串口的开发板上，无需担心这些引脚的状态。但如果外围设备连接到这些引脚，则在代码烧录、刷新固件或复位开发板时可能会遇到问题。

GPIO 0（必须为低电平才能进入启动模式）  
GPIO 2（启动期间必须为浮动或低电平）  
GPIO 4  
GPIO 5（启动期间必须为高电平）  
GPIO 12（启动期间必须为低电平）  
GPIO 15（启动期间必须为高电平）

##### **12、高电平 Boot 引脚**

一些 GPIO 在启动或复位时将其状态改为高电平或输出 PWM，如果外设连接到这些 GPIO，在 ESP32 复位或启动时可能出现问题。

GPIO 1  
GPIO 3  
GPIO 5  
GPIO 6 ~ GPIO 11（集成 SPI 闪存）  
GPIO 14  
GPIO 15

##### **13、EN引脚**

EN 是 3.3V 稳压的使能引脚。使用被拉起，接地禁用稳压。

#### 接口参考图

![](/images/posts/esp32-notes/esp32_5.png)
![](/images/posts/esp32-notes/esp32_6.png)

### 术语解释：

**ADC（模拟数字转换器，Analog-to-Digital Converter）：**ADC是一种将模拟信号（如温度、压力、声音等连续变化的物理量）转换为数字信号（离散的二进制数）的电路或设备。它广泛应用于各种需要数字化模拟信号的场合，如数据采集、信号处理等。

**DAC（数字模拟转换器，Digital-to-Analog Converter）：**DAC与ADC相反，它将数字信号转换为模拟信号。DAC常用于音频、视频和其他模拟信号重建的场合，如数字音频播放、数字信号处理后的模拟输出等。

**UART（通用异步收发传输器，Universal Asynchronous Receiver/Transmitter）：**UART是一种用于串行通信的接口标准，它允许设备之间以异步方式传输数据。UART通信通常用于低速、短距离的数据传输，如微控制器与其他外设之间的通信。

**I2C（两线式串行总线，Inter-Integrated Circuit）：**I2C是一种用于连接低速外设的串行通信协议，它使用两根线（数据线SDA和时钟线SCL）进行数据传输。I2C具有简单、高效的特点，广泛应用于微控制器与各种传感器、存储器等外设之间的通信。

**I2S（集成音频接口，Inter-IC Sound）：**I2S是一种用于音频数据传输的串行通信协议，它支持高速、双向、多通道的数据传输。I2S常用于数字音频设备之间的连接，如数字音频播放器、音频解码器等。

**SPI（串行外设接口，Serial Peripheral Interface）：**SPI是一种高速、全双工的同步串行通信 协议，它使用四根线（MISO、MOSI、SCK、CS）进行数据传输。SPI广泛应用于微控制器与各种外设（如存储器、显示器、传感器等）之间的通信。

**TCP（传输控制协议，Transmission Control Protocol）：**TCP是一种面向连接的、可靠的、基于字节流的传输层通信协议。TCP在IP协议的基础上提供了面向连接的、可靠的传输服务，它广泛应用于互联网中的各种数据传输场景。

**UDP（用户数据报协议，User Datagram Protocol）：**UDP是一种无连接的、不可靠的、基于报文的传输层通信协议。UDP在IP协议的基础上提供了简单的、面向报文的传输服务，它通常用于对实时性要求较高、但对可靠性要求不高的数据传输场景，如视频流、语音通信等。

*对于http和mqtt在后面会有介绍，因此在此不多做赘述。*

### 拓：ESP32系列

ESP32芯片截止到2024年11月有5个系列：

ESP32由ESP32-P 系列、ESP32-S 系列、ESP32-C 系列、ESP32-H 系列、ESP32 系列构成。其中，ESP32-P目前只有ESP32-P4；ESP32-H只有ESP32-H2；ESP32-S分为S3和S2两个小系列；ESP32-C系列分为C6、C5、C3、C2、C61五个小系列。不同系列的芯片它的各个功能和参数不同，你可以根据的你的项目需求选择合适的型号。比如如果你想整一些低成本，简单轻便的项目，你可以选择ESP32-C系列；而如果你要在ESP32开发有关人工智能的项目，那么首先推荐ESP32-S3，因为ESP32-S3在普通ESP32芯片的基础上增添了向量指令以加速神经网络计算和信号处理，是AIoT项目的不二之选……

有时你可以看到ESP32型号上会带有WROOM或WROVER的表示，这代表的是ESP32模组的官方封装方式，而不同封装方式又有不同的参数系列，如ESP32-WROOM-32D（左图）、ESP32-WROOM-32U（右图），由图可见，它们虽然使用的芯片一样，封装也大差不差，但仍存在一些细节，不难发现，ESP32-WROOM-32D有一个板载天线，而ESP32-WROOM-32U没有但ESP32-WROOM-32U有一个天线座子，可供连接外部天线。

虽然二者都往外扩展了天线，但如果你要以此类封装来设计一个完整的PCB，那可需要看情况了，因为为了防止外部电路的信号影响ESP32-WROOM-32D的板载天线，你需要在设计PCB的时候将有板载天线的区域挖空，不过这个涉及ESP32的硬件设计，更多信息可以查阅官方给的[硬件设计文档](https://docs.espressif.com/projects/esp-hardware-design-guidelines/zh_CN/latest/esp32/index.html)。

![](/images/posts/esp32-notes/esp32wroom32-1024x347.png)
下面的表格就汇总了各个系列的主要参数：

|  |  |  |  |  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ESP32系列 | ESP32芯片 | 芯片核数 | WIFI | 蓝牙 | 单核时钟 | 封装 | 引脚数量 | RAM/ROM | FLASH(MB) | PSRAM |
| ESP32-P4 | ESP32-P4NRW16 | 双/单 | - | - |  | QFN10X10 | 104引脚 | 128 KB HP ROM，16 KB LP ROM，768 KB HP L2MEM，32 KB LP SRAM，8 KB TCM | N/A | 16 |
| ESP32-P4NRW32 | 双/单 | - | - |  | QFN10X10 | 104引脚 | 128 KB HP ROM，16 KB LP ROM，768 KB HP L2MEM，32 KB LP SRAM，8 KB TCM | N/A | 32 |
| ESP32-S3系列 | ESP32-S3 | 双 | √ | √ | 240 | QFN7X7 | 56引脚 | 32 KB ROM，512 KB SRAM, 16 KB RTC SRAM | N/A | N/A |
| ESP32-S3R2 | 双 | √ | √ | 240 | QFN7X7 | 56引脚 | 32 KB ROM，512 KB SRAM, 16 KB RTC SRAM | N/A | 2 |
| ESP32-S3R8 | 双 | √ | √ | 240 | QFN7X7 | 56引脚 | 32 KB ROM，512 KB SRAM, 16 KB RTC SRAM | N/A | 8 |
| ESP32-S3R8V | 双 | √ | √ | 240 | QFN7X7 | 56引脚 | 32 KB ROM，512 KB SRAM, 16 KB RTC SRAM | N/A | 8 |
| ESP32-S3FN8 | 双 | √ | √ | 240 | QFN7X7 | 56引脚 | 32 KB ROM，512 KB SRAM, 16 KB RTC SRAM | 8 | N/A |
| ESP32-S3FH4R2 | 双 | √ | √ | 240 | QFN7X7 | 56引脚 | 32 KB ROM，512 KB SRAM, 16 KB RTC SRAM | 4 | 2 |
| ESP32-S3-PICO-1 | ESP32-S3-PICO-1-N8R2 | 双 | √ | √ | 240 | LGA 7x7 | 56引脚 | 32 KB ROM，512 KB SRAM, 16 KB RTC SRAM | 8 | 2 Quad |
| ESP32-S3-PICO-1-N8R8 | 双 | √ | √ | 240 | LGA 7x7 | 56引脚 | 32 KB ROM，512 KB SRAM, 16 KB RTC SRAM | Quad | 8 Octal |
| ESP32-S2 | ESP32-S2 | 单 | √ | - | 240 | QFN7X7 | 56引脚 | 128 KB ROM, 320 KB SRAM, 16 KB RTC SRAM | N/A | N/A |
| ESP32-S2R2 | 单 | √ | - | 240 | QFN7X7 | 56 | 128 KB ROM, 320 KB SRAM, 16 KB RTC SRAM | N/A | 2 |
| ESP32-S2F | ESP32-S2FH2 | 单 | √ | - | 240 | QFN7X7 | 56 | 128 KB ROM, 320 KB SRAM, 16 KB RTC SRAM | 2 | N/A |
| ESP32-S2FH4 | 单 | √ | - | 240 | QFN7X7 | 56 | 128 KB ROM, 320 KB SRAM, 16 KB RTC SRAM | 4 | N/A |
| ESP32-S2FN4R2 | 单 | √ | - | 240 | QFN7X7 | 56 | 128 KB ROM, 320 KB SRAM, 16 KB RTC SRAM | 4 | 2 |
| ESP32-C5 | ESP32-C5N | 单 | √ | √ | 160 | QFN6X6 | 48引脚 | 320 KB ROM, 384 KB HP SRAM, 16 KB LP SRAM | - | N/A |
| ESP32-C5NR4 | 单 | √ | √ | 160 | QFN6X6 | 48引脚 | 320 KB ROM, 384 KB HP SRAM, 16 KB LP SRAM | - | 4 |
| ESP32-C3 | ESP32-C3 | 单 | √ | - | 160 | QFN5X5 | 32引脚 | 400 KB RAM, 384 KB ROM, 8 KB RTC SRAM | N/A | N/A |
| ESP32-C3FH4 | 单 | √ | √ | 160 | QFN5X5 | 32引脚 | 400 KB RAM, 384 KB ROM, 8 KB RTC SRAM | 4 |  |
| ESP32-C3FH4X | 单 | √ | √ | 160 | QFN5X5 | 32引脚 | 400 KB RAM, 384 KB ROM, 8 KB RTC SRAM | 4 |  |
| ESP32-C3FN4 (EOL) | 单 | √ | √ | 160 | QFN5X5 | 32引脚 | 400 KB RAM, 384 KB ROM, 8 KB RTC SRAM | 4 |  |
| ESP8685 | ESP8685H4 | 单 | √ | - | 160 | QFN4X4 | 28引脚 | 32 KB ROM，512 KB SRAM, 16 KB RTC SRAM | 4 | N/A |
| ESP32-C2 | ESP8684H2 | 单 | √ | √ | 120 | QFN4X4 | 24引脚 | 576 KB ROM, 272 KB SRAM | 2 | N/A |
| ESP8684H4 | 单 | √ | √ | 120 | QFN4X4 | 24引脚 | 576 KB ROM, 272 KB SRAM | 4 | N/A |
| ESP32-H | ESP32-H2 | 单 | - | √ | 96 | QFN4X4 | 32引脚 | 320 KB SRAM, 128 KB ROM, 4 KB LP Memor√ | 2or4 | N/A |
| ESP32 | ESP32-D0WD-V3 | 双 | √ | √ | 80-240 | QFN5X5 | 48引脚 | 520 KB SRAM 448 KB ROM 16 KB RTC SRAM | N/A | N/A |
| ESP32-D0WDR2-V3 | 双 | √ | √ | 80-240 | QFN5X5 | 48引脚 | 520 KB SRAM 448 KB ROM 16 KB RTC SRAM | N/A | 2 |
| ESP32-U4WDH | 双 | √ | √ | 80-240 | QFN5X5 | 48 | 520 KB SRAM 448 KB ROM 16 KB RTC SRAM | 4 | N/A |
| ESP32-PICO-V3 | 双 | √ | √ | 80-240 | LGA 7X7 | 48 | 448 KB ROM 520 KB SRAM 16 KB RTC SRAM | 4 | N/A |
| ESP32-PICO-V3-02 | 双 | √ | √ | 80-240 | LGA 7X7 | 48 | 448 KB ROM 520 KB SRAM 16 KB RTC SRAM | 8 | 2 |
| ESP32-PICO-D4 | 双 | √ | √ | 80-240 | LGA 7X7 | 48 | 448 KB ROM 520 KB SRAM 16 KB RTC SRAM | 4 | N/A |
| ESP32-D0WD推荐使用升级版本 →ESP32-D0WD-V3 / ESP32-U4WDH | 双 | √ | √ | 80-240 | QFN5X5 | 48 | 520 KB SRAM 448 KB ROM 16 KB RTC SRAM | N/A | N/A |
| ESP32-D0WDQ6-V3推荐使用升级版本 →ESP32-D0WD-V3 / ESP32-U4WDH | 双 | √ | √ | 80-240 | QFN6X6 | 48 | 520 KB SRAM 448 KB ROM 16 KB RTC SRAM | N/A | N/A |
| ESP32-D0WDQ6推荐使用升级版本 →ESP32-D0WD-V3 / ESP32-U4WDH | 双 | √ | S 520 KB SRAM 448 KB ROM 16 KB RTC SRAM | 80-240 | QFN6X6 | 48 | 520 KB SRAM 448 KB ROM 16 KB RTC SRAM | N/A | N/A |
| ESP32-S0WD推荐使用升级版本 →ESP32-D0WD-V3 / ESP32-U4WDH | 单 | √ | S 520 KB SRAM 448 KB ROM 16 KB RTC SRAM | 80-240 | QFN5X5 | 48 | 520 KB SRAM 448 KB ROM 16 KB RTC SRAM | N/A | N/A |

*表格仅供参考，部分数据待求证*

更多相关内容，你可以查看相关[文章](https://blog.51cto.com/u_14731/10917585)，对于ESP32各个系列的信息汇总，你可以直接查看[乐鑫官方](https://www.espressif.com.cn/zh-hans)的文档（在官方网站找“硬件”菜单就可以查询了）。

## **项目开发**——MicroPython篇

### 开机自动运行程序

在ESP8266的研究笔记中我曾提及了boot.py文件用于初始化的功能，但在后续查阅资料的过程中，我发现除了初始化自动生成的boot.py还有一个（需要我们自行创建）名为main.py的文件。

ESP32开机自动运行程序有两个，一个是boot.py另一个是main.py。在MicroPython的运行环境中，boot.py和main.py是两个关键文件，它们在ESP32启动时的执行顺序和作用不同。

#### **1. boot.py**

**作用****：**

boot.py是开发板在每次启动时（包括从深度睡眠中唤醒后）自动执行的文件。它主要用于设置一些基本的初始化参数，比如连接到Wi-Fi网络、设置系统时间、初始化硬件等。通过在boot.py中编写代码，可以确保每次设备启动时都能自动执行这些初始化操作，无需用户手动干预。其主要作用包括：

- 初始化设置：进行设备的基本初始化设置，例如配置引脚、电源管理、时钟设置等。
- 网络配置：配置WiFi或其他网络连接，设置静态IP地址等。
- 外设初始化：初始化外设，如I2C、SPI、UART等。
- 日志设置：设置调试信息输出方式，是否启用REPL（Read-Eval-Print Loop）等。

**特点**：

1. **通常只包含一次性的设置代码，比如网络连接、硬件初始化等。**
2. **可以在其中调用其他模块或函数来完成初始化任务。**
3. **一旦执行完毕，boot.py就会结束，然后开发板会寻找并执行main.py文件。**

#### **2. main.py**

**作用**

main.py是开发板在boot.py执行完毕后自动执行的文件。它通常包含应用程序的主要逻辑代码，比如处理用户输入、控制GPIO引脚、读取传感器数据等。main.py是用户编写自定义代码的主要场所，用于实现具体的业务逻辑和功能。其主要作用包括：

- 应用逻辑：执行主要功能代码，如传感器数据采集、控制输出设备、数据处理等。
- 任务调度：管理和调度不同任务的执行。
- 事件处理：响应用户输入或外部事件（如定时器中断、网络请求等）。

**特点**

1. **包含应用程序的主体逻辑代码。**
2. **可以是一个循环执行的程序，用于持续监听事件、处理数据等。**
3. **可以调用外部库或模块来扩展功能。**
4. **如果main.py不存在，开发板在boot.py执行完毕后可能会进入REPL模式（如果启用了的话），允许用户通过串行接口直接输入Python代码进行测试和调试。**

#### 总结图表

|  | boot.py | main.py |
| --- | --- | --- |
| 作用 | 设备启动时自动执行的初始化脚本 | 初始化后执行的应用程序主体逻辑 |
| 内容 | 一次性设置代码，如网络连接、硬件初始化等 | 应用程序的主体逻辑代码，如控制 GPIO、读取传感器等 |
| 特点 | 执行后结束，不持续运行 | 可循环执行，持续监听事件、处理数据等 |
| 执行时机 | 设备每次启动时（包括从深度睡眠中唤醒后） | boot.py 执行完毕后 |

### **程序示例**

在前文我们也说过，能在ESP8266上运行的程序基本都能在ESP32上运行。所以之前在ESP8266研究笔记中出现的示例代码咱可以直接复制到ESP32上使用。对于micropython的使用，你可以参考MicroPython官方给出的[文档](http://docs.micropython.org/en/latest/index.html)。

#### **点灯程序**

由于ESP32上蓝色LED的引脚连接被调整（即接线互换），因此需要对原先编写的代码进行相应修改。

```python
from machine import Pin
import time
led = Pin(2,Pin.OUT)
while True:
    led.value(0)
    print("灭")
    time.sleep(1)
    led.value(1)
    print("亮")
    time.sleep(1)
```

**1.****导入必要的库:**

**`from machine import Pin`:** 从machine模块中导入Pin类。machine模块是MicroPython的一部分，用于控制硬件，如GPIO引脚、I2C、SPI等。这里我们主要使用Pin类来操作GPIO引脚。

**`import time`:** 导入Python的time模块，以便使用其中的sleep函数来控制程序中的延时。

**2.****配置LED引脚:**

**`led = Pin(2, Pin.OUT)`:** 创建一个Pin对象led，并将其与设备的GPIO引脚2相关联。Pin.OUT表示该引脚被配置为输出模式，即用于向外部设备（如LED灯）发送信号。

**3.****设置循环以控制LED闪烁:**

**`while True`:**使用一个无限循环来控制LED的闪烁。这个循环会一直执行，直到设备被断电或程序被强制停止。

**3.1****控制LED熄灭:**

**`led.value(0)`:** 将led引脚的电平设置为0（低电平）。对于大多数LED电路，低电平意味着LED熄灭。

**`print("灭")`:** 在控制台上打印“灭”，以表明LED当前的状态。

**`time.sleep(1)`:** 使程序暂停执行1秒。这个延时使得LED的闪烁可以被人类肉眼观察到。

**3.2****控制LED点亮:**

**`led.value(1)`:** 将led引脚的电平设置为1（高电平）。对于大多数LED电路，高电平意味着LED点亮。

**`print("亮")`:** 在控制台上打印“亮”，以表明LED当前的状态。

**`time.sleep(1)`:** 使程序再次暂停执行1秒，然后回到循环的开始，继续控制LED的熄灭。

如果你能看见板子上LED闪烁，则说明运行成功。同时，你利用面包板、杜邦线等材料，将另一个LED接入D2引脚（正极）、负极连接GND引脚，你会发现这个LED也会跟着同步闪烁，因为这个LED和板子上的LED是同一个引脚上的。将正负极对调（记得更换接线至3.3v引脚），你可以发现当板子led亮时，外接的LED灭，反之，板子上led灭时，外接的led亮。

我们已经学会了如何使用代码轻松地控制ESP32上的LED灯。那么，接下来一个自然的问题是：如何扩展这种控制，让ESP32能够响应外部硬件（如按钮）的操作，从而实现对已连接设备的更灵活控制呢？

要实现这一目标，我们需要编写代码来检测外部硬件（如按钮）的状态，并根据该状态来控制LED的亮灭。以下是一个示例代码，展示了如何通过ESP32的GPIO引脚读取按钮状态，并根据按钮的按下与否来控制LED的亮灭：

```python
import machine
import time

# 设置LED引脚为输出模式
led_pin = 2
led = machine.Pin(led_pin, machine.Pin.OUT)

# 设置按键引脚为输入模式，并启用内部上拉电阻
button_pin = 0
button = machine.Pin(button_pin, machine.Pin.IN, machine.Pin.PULL_UP)

# 初始状态：LED熄灭
led.value(0)

try:
    while True:
        # 检查按键状态
        if not button.value():  # 按键被按下，value()返回False
            print("按键被按下，点亮LED")
            led.value(1)  # 点亮LED
            # 等待一段时间以消抖（可选）
            time.sleep(0.2)
        else:
            print("按键未按下，熄灭LED")
            led.value(0)  # 熄灭LED
        # 可选：在循环中添加一些延迟，以减少CPU占用
        time.sleep(0.1)

except KeyboardInterrupt:
    # 当用户按下Ctrl+C时，执行清理工作
    led.value(0)  # 确保LED熄灭
    print("程序已中断，LED已熄灭")
```

运行后，你只需要在GPIO4与GND之间连接一个按钮就行，按下去的一瞬间，ESP32上的LED会被点亮。接下来我们升级一下这段代码，让按键按下去的时候led（常）亮，再按一次，则熄灭：

```python
import machine
import time

led_pin = 2
led = machine.Pin(led_pin, machine.Pin.OUT)

button_pin = 4
button = machine.Pin(button_pin, machine.Pin.IN, machine.Pin.PULL_UP)

# 初始状态：LED熄灭
led_state = 0  # 0表示LED熄灭，1表示LED点亮

try:
    while True:
        # 检查按键状态
        if not button.value(): 
            print("按键被按下，切换LED状态")
            led_state = 1 - led_state  # 切换LED状态
            if led_state == 1:
                led.value(1) 
                print("LED已点亮")
            else:
                led.value(0)
                print("LED已熄灭")
            time.sleep(0.2)
        time.sleep(0.1)

except KeyboardInterrupt:
    # 当用户按下Ctrl+C时，执行清理工作
    led.value(0)  # 确保LED熄灭
    print("程序已中断，LED已熄灭")
```

#### **呼吸灯**

呼吸灯是指灯光在相关电子元件的控制之下完成由亮到暗的逐渐变化，感觉好像是人在呼吸。对于ESP32开发板来说，我们可以利用上面的PWM实现这一功能。

PWM（Pulse Width Modulation）简称脉宽调制，是利用微处理器的数字输出来对模拟电路进行控制的一种非常有效的技术，广泛应用在测量、通信、工控等方面。对于PWM，你需要知道这些概念：

**PWM频率**：指1秒钟内信号从高电平到低电平再回到高电平的次数，即一个周期内信号变化的次数。单位通常为Hz（赫兹）。

**PWM周期**：PWM周期是信号完成一个完整的高电平到低电平再回到高电平所需的时间。它与频率是倒数关系，即T = 1/f，其中T是周期，f是频率。

**占空比**：占空比是一个脉冲周期内，高电平的时间与整个周期时间的比例，通常以百分比或小数表示。计算公式：占空比(%) = (高电平时间/周期时间) × 100%。

下面的代码正好可以实现呼吸灯的效果：

```
# 导入必要的库
from machine import Pin, PWM  
import utime  
  
led_pin = Pin(2, Pin.OUT)      # 创建Pin对象并赋值  
pwm = PWM(led_pin, freq=500)   # 创建PWM对象并赋值，设置频率为500
    
def breath_led():  
    while True:  
        # 模拟吸气（亮度增加）
        for duty in range(0, 1024, 32):   # 逐渐增加PWM信号的占空比
            pwm.duty(duty)                # 调用以设置PWM信号的当前占空比
            utime.sleep_ms(40)            # 设置延迟时间
          
        # 模拟呼气（亮度减少）  
        for duty in range(1023, -1, -32):   
            pwm.duty(duty)  
            utime.sleep_ms(40)  
  
breath_led()
```

首先导入了必要的库，并尝试将GPIO引脚2配置为输出模式，然后创建了一个PWM对象来控制该引脚。定义了一个breath\_led函数，该函数包含一个无限循环，用于通过逐渐增加（吸气）然后错误地尝试减少到负数（呼气）PWM占空比来模拟LED的亮度变化。在吸气阶段，占空比从0增加到1023，每次增加32，并在每次设置占空比后暂停40毫秒以产生平滑效果。

*温馨提示：准备运行第二个程序时，记得先关闭前一个程序的运行，接着按下EN按钮以刷新，然后再写入第二个程序，这样更不容易出错。*

#### **HTTP服务器**

HTTP（HyperText Transfer Protocol），即超文本传输协议，是互联网上应用最为广泛的一种网络协议。HTTP是万维网（World Wide Web）交换信息的基础，它允许将超文本标记语言（HTML）文档、图片、音频、视频等超文本数据从Web服务器传送到Web浏览器。

HTTP服务器是一种运行在服务器上的软件，它负责接收来自客户端（如Web浏览器）的请求，解析这些请求，然后返回对应的网页资源（如HTML文档、图片等）作为响应。简而言之，HTTP服务器就是提供网站内容给用户的服务器。

利用下面的代码可以让你的ESP32开发板运行一个简单的http服务器：

```python
import network  
import socket  
  
# 配置网络参数  
ssid = ''  
password = ''  
  
# 连接到WiFi网络  
sta_if = network.WLAN(network.STA_IF)  
sta_if.active(True)  
sta_if.connect(ssid, password)  
  
while not sta_if.isconnected():  
    pass  
  
print('网络已连接，IP地址：', sta_if.ifconfig()[0])  
  
# 创建socket  
addr = ('', 80)
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)  
s.bind(addr)  
s.listen(1)  
  
def http_response(client_socket, status_line, headers, content=""):  
    client_socket.sendall(b'HTTP/1.1 ' + status_line.encode() + b'\r\n')  
    for header in headers:  
        client_socket.sendall(header.encode() + b'\r\n')  
    client_socket.sendall(b'\r\n')  
    client_socket.sendall(content.encode())  
  
try:  
    while True:  
        print('等待连接...')  
        client_socket, addr = s.accept()  
        print('连接自:', addr)  
        request = client_socket.recv(1024)  
        print('收到请求:', request.decode())  
  
        # 简单的请求处理（仅支持GET /）  
        if request.startswith(b'GET / HTTP/1.1'):  
            status_line = '200 OK'  
            headers = [  
                'Content-Type: text/html',  
                'Connection: close'  
            ]  
            content = '''<!DOCTYPE html>  
            <html>  
            <head>  
                <title>ESP32 HTTP Server</title>  
            </head>  
            <body>  
                <h1>Hello from ESP32!</h1>  
            </body>  
            </html>  
            '''  
            http_response(client_socket, status_line, headers, content)  
  
        client_socket.close()  
  
except KeyboardInterrupt:  
    s.close()  
    print('服务器已关闭')
```

这段代码首先导入了network和socket模块，用于配置和建立网络连接。它设置了WiFi网络的SSID和密码，并尝试连接到该网络。一旦连接成功，它会打印出设备的IP地址。接下来，它创建了一个socket对象，监听所有网络接口上的80端口（HTTP的标准端口），并准备接受客户端的连接。定义了一个http\_response函数，用于向客户端发送HTTP响应。在主循环中，服务器会不断等待客户端的连接，一旦有连接请求，它会接收并打印出客户端的请求。如果请求是GET /（即请求根目录），服务器会发送一个包含简单HTML页面的HTTP 200 OK响应。如果用户在运行服务器时按下Ctrl+C，服务器会捕获这个信号，关闭socket并打印出“服务器已关闭”。你可以根据具体情况修改html部分以满足你的需要。

当你看到控制台输出“网络已连接，IP地址："192.168.32.45等待连接...”的提示时，说明程序运行成功并且成功联网。需要注意的是由于当前版本的ESP32不能连接5G路由器，不过我们可以将自己的手机开热点让ESP32链接。在同一网络下，任何设备只要在浏览器输入IP就能正常访问，当你看到网页出现**Hello from ESP32!**，说明连接成功。

升级一下上述代码，我们添加一个指示灯的功能：当正在连接网络时，LED闪烁；当成功连上网络时，LED保持常亮。

```python
import network  
import socket  
import time  
import machine  

  
# 配置网络参数  
ssid = ''  
password = ''  

# LED连接的GPIO引脚编号
led_pin = 2 

# 设置LED引脚为输出模式
led = machine.Pin(led_pin, machine.Pin.OUT)

# 连接到WiFi网络  
sta_if = network.WLAN(network.STA_IF)  
sta_if.active(True)  
sta_if.connect(ssid, password)  
  
while not sta_if.isconnected():
    led.on()  # 打开LED
    time.sleep(0.5)  # 等待0.5秒
    led.off()  # 关闭LED
    time.sleep(0.5)  # 等待0.5秒 
led.on()  # 打开LED
print('网络已连接，IP地址：', sta_if.ifconfig()[0])  
  
# 创建socket  
addr = ('', 80)  # 监听所有可用的网络接口上的80端口  
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)  
s.bind(addr)  
s.listen(1)  
  
def http_response(client_socket, status_line, headers, content=""):
    # 发送HTTP状态行
    client_socket.sendall(b'HTTP/1.1 ' + status_line.encode() + b'\r\n')
    # 遍历headers列表，逐个发送header
    for header in headers:
        client_socket.sendall(header.encode() + b'\r\n')
    # 发送一个空行，表示headers部分结束
    client_socket.sendall(b'\r\n')
    # 发送响应内容
    client_socket.sendall(content.encode())  
  
try:  
    while True:  
        print('等待连接...')  
        client_socket, addr = s.accept()  
        print('连接自:', addr)  
        request = client_socket.recv(1024)  
        print('收到请求:', request.decode())  
  
        # 简单的请求处理（仅支持GET /）  
        if request.startswith(b'GET / HTTP/1.1'):  
            status_line = '200 OK'  
            headers = [  
                'Content-Type: text/html',  
                'Connection: close'  
            ]  
            content = '''<!DOCTYPE html>  
            <html>  
            <head>  
                <title>ESP32 HTTP Server</title>  
            </head>  
            <body>  
                <h1>Hello from ESP32!</h1>  
            </body>  
            </html>  
            '''  
            http_response(client_socket, status_line, headers, content)  
  
        client_socket.close()  
  
except KeyboardInterrupt:  
    s.close()  
    led.off()  
    print('服务器已关闭')
```

我们还可以利用HTTP服务器处理函数http\_response根据客户端发送的HTTP请求来更改LED的状态，并返回相应的HTTP响应。从而实现网页远程控制LED。

```python
import network  
import socket  
import machine  
  
# 配置LED引脚  
led = machine.Pin(2, machine.Pin.OUT)  
  
# 配置网络参数  
ssid = ''  
password = ''  
  
# 连接到WiFi网络  
sta_if = network.WLAN(network.STA_IF)  
sta_if.active(True)  
sta_if.connect(ssid, password)  
  
# 等待网络连接  
while not sta_if.isconnected():  
    pass  
  
print('网络已连接，IP地址：', sta_if.ifconfig()[0])  
  
# HTML页面内容  
HTML_CONTENT = """  
<!DOCTYPE html>  
<html>  
<head>  
    <title>LED Control</title>  
    <script>  
        function toggleLED(state) {  
            var xhr = new XMLHttpRequest();  
            xhr.open('GET', '/' + state, true);  
            xhr.onreadystatechange = function () {  
                if (xhr.readyState == 4 && xhr.status == 200) {  
                    document.getElementById('ledStatus').innerText = xhr.responseText;  
                }  
            };  
            xhr.send();  
        }  
    </script>  
</head>  
<body>  
    <h1>LED Control</h1>  
    <button onclick="toggleLED('on')">Turn LED On</button>  
    <button onclick="toggleLED('off')">Turn LED Off</button>  
    <p id="ledStatus">LED is OFF</p>  
</body>  
</html>  
"""  
  
# HTTP服务器处理函数  
def http_response(client_socket, request):  
    request = request.decode()  
    if request.startswith('GET /on HTTP/1.1'):  
        led.value(1)  # 打开LED  
        response = 'HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\n\r\nLED is ON'  
    elif request.startswith('GET /off HTTP/1.1'):  
        led.value(0)  # 关闭LED  
        response = 'HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\n\r\nLED is OFF'  
    elif request.startswith('GET / HTTP/1.1'):  
        response = 'HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n\r\n' + HTML_CONTENT  
    else:  
        response = 'HTTP/1.1 404 Not Found\r\n\r\nNot Found'  
  
    client_socket.sendall(response.encode())  
    client_socket.close()  
  
# 创建socket并监听  
addr = ('', 80)  # 监听所有传入连接，端口80  
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)  
s.bind(addr)  
s.listen(1)  
  
print('\nHTTP服务器启动，等待连接...')  
  
try:  
    while True:  
        client_socket, addr = s.accept()  
        print('\n连接自:', addr)  
        request = client_socket.recv(4096)  # 增加缓冲区大小以容纳整个HTTP请求  
        if request:  
            http_response(client_socket, request)  
  
except KeyboardInterrupt:  
    s.close()  
    print('\n\n\n\n服务器已关闭')
```

在这一节的最后，我会分享一个有趣的网页井字棋小游戏，在经典井字棋玩法的基础上，我额外加入了新的机制：当下到第四步棋时，会清除第一步的棋，以此类推，丰富了井字棋的玩法。同时我也设计了网页的样式，让网页看起来更美观（发热警告x）。

参考代码

```python
import network  
import socket  
import time  
import machine  

  
# 配置网络参数  
ssid = ''  
password = ''  

# LED连接的GPIO引脚编号
led_pin = 2 

# 设置LED引脚为输出模式
led = machine.Pin(led_pin, machine.Pin.OUT)

# 连接到WiFi网络  
sta_if = network.WLAN(network.STA_IF)  
sta_if.active(True)  
sta_if.connect(ssid, password)  
  
while not sta_if.isconnected():
    led.on()  # 打开LED
    time.sleep(0.5)  # 等待0.5秒
    led.off()  # 关闭LED
    time.sleep(0.5)  # 等待0.5秒 
led.on()  # 打开LED
print('网络已连接，IP地址：', sta_if.ifconfig()[0])  
  
# 创建socket  
addr = ('', 80)  # 监听所有可用的网络接口上的80端口  
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)  
s.bind(addr)  
s.listen(1)  
  
def http_response(client_socket, status_line, headers, content=""):
    # 发送HTTP状态行
    client_socket.sendall(b'HTTP/1.1 ' + status_line.encode() + b'\r\n')
    # 遍历headers列表，逐个发送header
    for header in headers:
        client_socket.sendall(header.encode() + b'\r\n')
    # 发送一个空行，表示headers部分结束
    client_socket.sendall(b'\r\n')
    # 发送响应内容
    client_socket.sendall(content.encode())  
  
try:  
    while True:  
        print('等待连接...')  
        client_socket, addr = s.accept()  
        print('连接自:', addr)  
        request = client_socket.recv(1024)  
        print('收到请求:', request.decode())  
  
        # 简单的请求处理（仅支持GET /）  
        if request.startswith(b'GET / HTTP/1.1'):  
            status_line = '200 OK'  
            headers = [  
                'Content-Type: text/html',  
                'Connection: close'  
            ]  
            content = '''
<!DOCTYPE html>
<html lang='en'>  
<head>  
<meta charset='UTF-8'>  
<meta name='viewport' content='width=device-width, initial-scale=1.0'>  
<title>Tic-Tac-Toe Game with Removal</title>  
<style>
    body { display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f0f0f0;  margin: 0;  font-family: Arial, sans-serif;  }  
    .game-container { background-color: #c5ffc4; border: 2px solid #ff9a67; padding: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);text-align: center;  }  
    .board {  display: grid;  grid-template-columns: repeat(3, 100px);  grid-template-rows: repeat(3, 100px);  gap: 10px;  margin-top: 20px;  }  
    .cell {  width: 100px;  height: 100px;  background-color: #c2ffff;  display: flex;  align-items: center;  justify-content: center;  font-size: 60px;  border: 2px solid #ffa5e1;  cursor: pointer;  }  
    h1 { margin-top: 0;color: rgb(92, 56, 255); }  
    button {margin-top: 20px;padding: 10px 20px;font-size: 16px;cursor: pointer;background-color: #ffbf48;color: #ff5e5e;font-weight: bold;border: none;border-radius: 5px;} 
    button:hover {background-color: #ffac12;color: #ff4545;  }
    #reset-alert {display: none;position: fixed;top: 20px;left: 50%;transform: translateX(-50%);padding: 10px 20px;background-color: #f9f2e7;color: #ad8305;border: 1px \solid #ffd700;border-radius: 5px;z-index: 1000;}  
</style>  
</head>
<body>  
<div class='game-container'>  
    <h1>Tic-Tac-Toe Game</h1>  
    <div class='board' id='board'></div>  
    <button onclick='resetGame()'>Reset Game</button>  
    <div id='reset-alert'>Game has been reset!</div>  
</div>   
<script>
    const board = document.getElementById('board');  
    const cells = [];  
    const resetAlert = document.getElementById('reset-alert');  
    let currentPlayer = 'X';  
    let gameActive = true;  
   let playerMoves = { X: [], O: [] };  
    function createBoard() {  
        for (let i = 0; i < 9; i++) {  
            const cell = document.createElement('div');  
            cell.classList.add('cell');  
            cell.addEventListener('click', () => placeStone(cell));  
            board.appendChild(cell);  
            cells.push(cell);  
        }  
    }   
    function placeStone(cell) {  
        if (cell.textContent === '' && gameActive) {  
            cell.textContent = currentPlayer;  
            cell.classList.add(currentPlayer);  
            playerMoves[currentPlayer].push(cell);    
            if (playerMoves[currentPlayer].length > 3) {  
                removeStone(playerMoves[currentPlayer].shift());  
            }   
            checkWin(cell);  
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';  
        }  
    }  
    function removeStone(cell) {  
        cell.textContent = '';  
        cell.classList.remove('x', 'o');  
    }  
    function checkWin(cell) {  
        const index = cells.indexOf(cell);  
        const row = Math.floor(index / 3);  
        const col = index % 3;   
        if (cells[row * 3].textContent === currentPlayer && cells[row * 3 + 1].textContent === currentPlayer && cells[row * 3 + 2].textContent === currentPlayer) {  
            gameActive = false;  
            alert(`${currentPlayer} wins!`);  
            return;  
        }    
        if (cells[col].textContent === currentPlayer && cells[col + 3].textContent === currentPlayer && cells[col + 6].textContent === currentPlayer) {  
            gameActive = false;  
            alert(`${currentPlayer} wins!`);  
            return;  
        }   
        if (cells[0].textContent === currentPlayer && cells[4].textContent === currentPlayer && cells[8].textContent === currentPlayer) {  
          gameActive = false;  
          alert(`${currentPlayer} wins!`);  
            return;  
        }  
        if (cells[2].textContent === currentPlayer && cells[4].textContent === currentPlayer && cells[6].textContent === currentPlayer) {  
            gameActive = false;  
            alert(`${currentPlayer} wins!`); 
            return;  
        }  
    }  
    function resetGame() {  
        cells.forEach(cell => {  
            cell.textContent = '';  
            cell.classList.remove('x', 'o');  
        });  
        playerMoves.X = [];  
        playerMoves.O = [];  
        currentPlayer = 'X';  
        gameActive = true;  
        resetAlert.style.display = 'block';  
        setTimeout(() => resetAlert.style.display = 'none', 2000);  
    }    
    createBoard();  
</script>  
</body>  
</html> 
            '''  
            http_response(client_socket, status_line, headers, content)  
  
        client_socket.close()  
  
except KeyboardInterrupt:  
    s.close()  
    led.off()  
    print('服务器已关闭')
```

***注：在连接ESP32设备至WiFi时，请注意该设备的版本目前不支持5G频段，推荐选用2.4G频段或手机热点。若需查找2.4G频段的WiFi账号和密码，请按以下步骤操作：  
1. 找到路由器本体，注意查看其上的标签，上面印有管理员的用户名和密码。  
2.接着，在同一网络环境下，使用浏览器访问路由器的管理地址（通常也在路由器标签上）。  
3.在弹出的登录界面，输入之前记录的管理员用户名和密码进行登录。  
4.登录成功后，进入路由器设置页面，我们就可以在其中找到并查看包括2.4G频段在内的各频段WiFi的账号和密码信息。***

#### **ESP32-WIFI**

我们可以利用代码设置ESP32为WiFi接入点模式（Access Point, AP），将ESP32当作一个网络发射端。以下是基础代码：

```python
import network

def wifi_ap_start(ssid, password):
    wlan = network.WLAN(network.AP_IF) 
    if not wlan.active(True):
        print("Could not activate AP mode")
        return
    
    wlan.config(essid=ssid, password=password)
    print("Access Point started with SSID: %s" % ssid)

wifi_ap_start('ESP32_WIFI', '12345678')
```

这段代码首先导入了`network`模块，然后定义了一个名为`wifi_ap_start`的函数，该函数接受两个参数：ssid（服务集标识符，即WiFi网络的名称）和password（WiFi网络的密码）。

在函数内部，它首先通过`network.WLAN(network.AP_IF)`创建了一个WLAN对象，并指定为接入点接口。接着，它使用`wlan.active(True)`尝试激活WiFi接入点模式。如果激活失败，则打印错误信息并返回。

如果接入点模式成功激活，则使用`wlan.config(essid=ssid, password=password)`来配置WiFi网络的名称（SSID）和密码。最后，它打印一条消息，表明接入点已成功启动，并显示了配置的SSID。

在代码的最后部分，调用了wifi\_ap\_start函数，并传入了'ESP32\_WIFI'作为SSID和'12345678'作为密码，以启动一个名为'ESP32\_WIFI'的WiFi接入点。

 简单来说这段代码用于在ESP32上启动一个名为'ESP32\_WIFI'的WiFi接入点，并设置其密码为'12345678'。你可以在网络搜索中找到名为'ESP32\_WIFI'的WiFi并连接。

我们将其升级一下，使ESP32无需连接任何网络热点，直接作为发射端来提供网页服务。以下是示例代码（结合了前面的网页控制LED程序）：

```python
import network
import usocket as socket
from machine import Pin

# 设置LED引脚
LED_PIN = 2
led = Pin(LED_PIN, Pin.OUT)

# 设置WiFi接入点的SSID和密码
SSID = 'ESP32_WIFI'
PASSWORD = '12345678'

# 简单的HTML内容
HTML_CONTENT = """
<!DOCTYPE html>
<html>
<head>
    <title>ESP32 WiFi AP</title>
</head>
<body>
    <h1>Welcome to ESP32 WiFi AP</h1>
    <p>LED is currently: <span id="ledStatus">OFF</span></p>
    <button onclick="toggleLED('on')">Turn LED On</button>
    <button onclick="toggleLED('off')">Turn LED Off</button>
    <script>
        function toggleLED(state) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', '/' + state, true);
            xhr.send();
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    document.getElementById('ledStatus').innerText = xhr.responseText.toUpperCase();
                }
            };
        }
    </script>
</body>
</html>
"""

def wifi_ap_start(ssid, password):
    wlan = network.WLAN(network.AP_IF)  # 使用 AP_IF 而不是 MODE_AP
    if not wlan.active(True):
        print("Could not activate AP mode")
        return

    wlan.config(essid=ssid, password=password)
    print("Access Point started with SSID: %s" % ssid)

    # 等待连接
    while not wlan.isconnected():
        pass

    print('Network config:', wlan.ifconfig())

def http_response(client_socket, request):
    request = request.decode()
    if request.startswith('GET /on HTTP/1.1'):
        led.value(1)  # 打开LED
        response = 'HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\n\r\nLED is ON'
    elif request.startswith('GET /off HTTP/1.1'):
        led.value(0)  # 关闭LED
        response = 'HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\n\r\nLED is OFF'
    elif request.startswith('GET / HTTP/1.1'):
        response = 'HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n\r\n' + HTML_CONTENT
    else:
        response = 'HTTP/1.1 404 Not Found\r\n\r\nNot Found'

    client_socket.sendall(response.encode())
    client_socket.close()

# 启动WiFi AP
wifi_ap_start(SSID, PASSWORD)

# 创建HTTP服务器
addr = ('', 80)  # 监听所有传入连接，端口80
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.bind(addr)
s.listen(5)

print('HTTP server started')

while True:
    client_socket, addr = s.accept()
    print('Client connected from', addr)
    client_request = client_socket.recv(1024)
    if client_request:
        http_response(client_socket, client_request)
```

#### **点亮屏幕**

如何点亮一块屏幕？首先得要将屏幕与设备正确的连接起来，硬件接口就像是设备和屏幕之间的桥梁。ESP32用GPIO引脚连上屏幕，并通过SPI或I2C协议来传送数据。这些协议能确保数据快速、准确地从ESP32传到屏幕上。

接着就要进行数据传输。ESP32要组织好每个像素的颜色和亮度信息，也就是像素数据，然后按照屏幕的分辨率和颜色格式发送出去。它还会在内存里准备一个区域，叫帧缓冲区，用来存一整幅图像的数据。ESP32不断更新这个区域的内容，并发送给屏幕，这样我们就能看到动态的图像了。

最后，运用屏幕显示技术让图像出现在屏幕上。LCD屏幕是通过控制液晶分子来改变光的透过率，而OLED屏幕则是用电场让有机材料发光。不管是哪种屏幕，都需要ESP32发送驱动信号来控制每个像素的显示状态。同时，ESP32还要按照屏幕的刷新率持续发送新的图像数据，这样屏幕上的图像才能保持流畅。

##### 0.96英寸OLED屏幕

![](/images/posts/esp32-notes/esp32_8.png)

如左图是一块0.96英寸（指的是对角线尺寸）OLED（有机发光二极管）屏幕，分辨率为128x64像素。通过观察你可以看到在这一块OLED屏幕上，有GND、VDD、SCK、SDA四个引脚。GND引脚用于接地，确保电路稳定；VDD引脚提供工作电压；SCK引脚作为串行时钟，在数据传输过程中，SCK引脚会按照一定的频率产生时钟信号，控制数据在SDA引脚上的传输速度。；SDA引脚传输数据，在数据传输过程中，SDA引脚会根据SCK引脚提供的时钟信号，逐位地传输数据。

接线环节：GND-GND，VDD-3.3v，SCK-D4，SDA-D5.你可以根据需要变更SCK与SDA的引脚，同时别忘记要在代码上进行修改。

程序环节：在写正式程序时，我们需要导入一个ssd1306.py库，用于驱动：

```
#MicroPython SSD1306 OLED driver, I2C and SPI interfaces created by Adafruit

import time
import framebuf

# register definitions
SET_CONTRAST        = const(0x81)
SET_ENTIRE_ON       = const(0xa4)
SET_NORM_INV        = const(0xa6)
SET_DISP            = const(0xae)
SET_MEM_ADDR        = const(0x20)
SET_COL_ADDR        = const(0x21)
SET_PAGE_ADDR       = const(0x22)
SET_DISP_START_LINE = const(0x40)
SET_SEG_REMAP       = const(0xa0)
SET_MUX_RATIO       = const(0xa8)
SET_COM_OUT_DIR     = const(0xc0)
SET_DISP_OFFSET     = const(0xd3)
SET_COM_PIN_CFG     = const(0xda)
SET_DISP_CLK_DIV    = const(0xd5)
SET_PRECHARGE       = const(0xd9)
SET_VCOM_DESEL      = const(0xdb)
SET_CHARGE_PUMP     = const(0x8d)

class SSD1306:
    def __init__(self, width, height, external_vcc):
        self.width = width
        self.height = height
        self.external_vcc = external_vcc
        self.pages = self.height // 8
        # Note the subclass must initialize self.framebuf to a framebuffer.
        # This is necessary because the underlying data buffer is different
        # between I2C and SPI implementations (I2C needs an extra byte).
        self.poweron()
        self.init_display()

    def init_display(self):
        for cmd in (
            SET_DISP | 0x00, # off
            # address setting
            SET_MEM_ADDR, 0x00, # horizontal
            # resolution and layout
            SET_DISP_START_LINE | 0x00,
            SET_SEG_REMAP | 0x01, # column addr 127 mapped to SEG0
            SET_MUX_RATIO, self.height - 1,
            SET_COM_OUT_DIR | 0x08, # scan from COM[N] to COM0
            SET_DISP_OFFSET, 0x00,
            SET_COM_PIN_CFG, 0x02 if self.height == 32 else 0x12,
            # timing and driving scheme
            SET_DISP_CLK_DIV, 0x80,
            SET_PRECHARGE, 0x22 if self.external_vcc else 0xf1,
            SET_VCOM_DESEL, 0x30, # 0.83*Vcc
            # display
            SET_CONTRAST, 0xff, # maximum
            SET_ENTIRE_ON, # output follows RAM contents
            SET_NORM_INV, # not inverted
            # charge pump
            SET_CHARGE_PUMP, 0x10 if self.external_vcc else 0x14,
            SET_DISP | 0x01): # on
            self.write_cmd(cmd)
        self.fill(0)
        self.show()

    def poweroff(self):
        self.write_cmd(SET_DISP | 0x00)

    def contrast(self, contrast):
        self.write_cmd(SET_CONTRAST)
        self.write_cmd(contrast)

    def invert(self, invert):
        self.write_cmd(SET_NORM_INV | (invert & 1))

    def show(self):
        x0 = 0
        x1 = self.width - 1
        if self.width == 64:
            # displays with width of 64 pixels are shifted by 32
            x0 += 32
            x1 += 32
        self.write_cmd(SET_COL_ADDR)
        self.write_cmd(x0)
        self.write_cmd(x1)
        self.write_cmd(SET_PAGE_ADDR)
        self.write_cmd(0)
        self.write_cmd(self.pages - 1)
        self.write_framebuf()

    def fill(self, col):
        self.framebuf.fill(col)

    def pixel(self, x, y, col):
        self.framebuf.pixel(x, y, col)

    def scroll(self, dx, dy):
        self.framebuf.scroll(dx, dy)

    def text(self, string, x, y, col=1):
        self.framebuf.text(string, x, y, col)

class SSD1306_I2C(SSD1306):
    def __init__(self, width, height, i2c, addr=0x3c, external_vcc=False):
        self.i2c = i2c
        self.addr = addr
        self.temp = bytearray(2)
        # Add an extra byte to the data buffer to hold an I2C data/command byte
        # to use hardware-compatible I2C transactions.  A memoryview of the
        # buffer is used to mask this byte from the framebuffer operations
        # (without a major memory hit as memoryview doesn't copy to a separate
        # buffer).
        self.buffer = bytearray(((height // 8) * width) + 1)
        self.buffer[0] = 0x40  # Set first byte of data buffer to Co=0, D/C=1
        self.framebuf = framebuf.FrameBuffer1(memoryview(self.buffer)[1:], width, height)
        super().__init__(width, height, external_vcc)

    def write_cmd(self, cmd):
        self.temp[0] = 0x80 # Co=1, D/C#=0
        self.temp[1] = cmd
        self.i2c.writeto(self.addr, self.temp)

    def write_framebuf(self):
        # Blast out the frame buffer using a single I2C transaction to support
        # hardware I2C interfaces.
        self.i2c.writeto(self.addr, self.buffer)

    def poweron(self):
        pass

class SSD1306_SPI(SSD1306):
    def __init__(self, width, height, spi, dc, res, cs, external_vcc=False):
        self.rate = 10 * 1024 * 1024
        dc.init(dc.OUT, value=0)
        res.init(res.OUT, value=0)
        cs.init(cs.OUT, value=1)
        self.spi = spi
        self.dc = dc
        self.res = res
        self.cs = cs
        self.buffer = bytearray((height // 8) * width)
        self.framebuf = framebuf.FrameBuffer1(self.buffer, width, height)
        super().__init__(width, height, external_vcc)

    def write_cmd(self, cmd):
        self.spi.init(baudrate=self.rate, polarity=0, phase=0)
        self.cs.high()
        self.dc.low()
        self.cs.low()
        self.spi.write(bytearray([cmd]))
        self.cs.high()

    def write_framebuf(self):
        self.spi.init(baudrate=self.rate, polarity=0, phase=0)
        self.cs.high()
        self.dc.high()
        self.cs.low()
        self.spi.write(self.buffer)
        self.cs.high()

    def poweron(self):
        self.res.high()
        time.sleep_ms(1)
        self.res.low()
        time.sleep_ms(10)
        self.res.high()
```

然后你就可以创建一个新文件用于编写主体程序。示例如下：

```python
from machine import Pin, I2C

#OLED=....
i2c = I2C(scl=Pin(4), sda=Pin(5))
from ssd1306 import SSD1306_I2C 
OLED= SSD1306_I2C(128, 64, i2c)

#fonts=....
fonts= {
    0xe59bbe:   # 图
    [0x80,0xBF,0xA0,0xAF,0xA8,0xAB,0xAA,0xAB,0xA8,0xAF,0xA0,0xBF,0x80,0xFF,0x00,0x00,
     0x00,0xFE,0x02,0xFA,0x0A,0xEA,0x2A,0xAA,0x2A,0xEA,0x0A,0xFA,0x02,0xFE,0x00,0x00],
     
    0xe5bc80:   # 开
    [0x00,0x00,0x00,0x00,0x00,0x3F,0x08,0x08,0x7F,0x08,0x10,0x10,0x60,0x00,0x00,0x00,
     0x00,0x00,0x00,0x00,0x00,0xE0,0x40,0x40,0xF8,0x40,0x40,0x40,0x40,0x00,0x00,0x00],  
    
    0xe58f91:   # 发
    [0x00,0x00,0x00,0x00,0x24,0x44,0x7F,0x08,0x0F,0x14,0x22,0x43,0x9C,0x00,0x00,0x00,
    0x00,0x00,0x00,0x00,0x40,0x20,0xF8,0x00,0xE0,0x20,0x40,0x80,0x70,0x00,0x00,0x00], 
    
    0xe69dbf:   # 板
    [0x00,0x00,0x00,0x00,0x23,0x7C,0x24,0x27,0x7D,0xA4,0x24,0x24,0x2B,0x00,0x00,0x00,
     0x00,0x00,0x00,0x00,0xF0,0x00,0x00,0xF0,0x10,0xA0,0x40,0xA0,0x10,0x00,0x00,0x00],  
}

#函数部分
def chinese(ch_str, x_axis, y_axis): 
   offset_ = 0 
   for k in ch_str: 
       code = 0x00  # 将中文转成16进制编码 
       data_code = k.encode("utf-8")
       code |= data_code[0] << 16
       code |= data_code[1] << 8
       code |= data_code[2]
       byte_data = fonts[code]
       for y in range(0, 16):
           a_ = bin(byte_data[y]).replace('0b', '')
           while len(a_) < 8:
               a_ = '0'+ a_
           b_ = bin(byte_data[y+16]).replace('0b', '')
           while len(b_) < 8:
               b_ = '0'+ b_
           for x in range(0, 8):
               OLED.pixel(x_axis + offset_ + x,    y+y_axis, int(a_[x]))   
               OLED.pixel(x_axis + offset_ + x +8, y+y_axis, int(b_[x]))   
       offset_ += 16

OLED.text('Hello!', 0, 0)
OLED.text('ESP32', 0, 15)
chinese('开发板',40,10)
chinese('图',90,10)
OLED.show()
```

如果屏幕上能正常显示下面的内容，则说明运行成功:

`Hello!  
ESP32开发板 [图像]`

对于`OLED.text(‘<文本>’, <x>, <y>)`，<文本>填入英文或者英文符号，否则会在屏幕上出现乱码；不过我们有方法显示中文甚至一个特殊符号。

首先，你需要利用[这个网站](http://www.mytju.com/classcode/tools/encode_utf8.asp)查询汉字所对应的16进制编码。在这个示例中，只有“开发板”三个字是中文，所以我们通过查询可以得到它们的16进制编码：e5bc80（开）、e58f91（发）、e69dbf（板），这些编码对应的是`fonts={}`中的自定义显示的内容的前缀。

接下来是生成对应的图案，也就是fonts={}中方括号对应的内容。我们需要[图像设计软件](https://doc.itprojects.cn/A0001.micropython.esp32/02.download/05.software/128x64ziku.rar)将一个文字或者图案转换为这一系列的编码。打开这里所提供的字库设计软件，首先按照图示进行配置：

![](/images/posts/esp32-notes/esp32_9.png)

在主界面选择模式—字符模式，同时你可以将字体修改成微软雅黑，当然设置字体看你个人选择，随后在下面的输入框内输入文字，点击生成字模，这样你就可以看到这三个字对应的图案数据。将其复制进font={}内。

```
fonts= {
    0x<文字16进制编码>: 
    [<图案编码数据>],
    0x<文字16进制编码>: 
    [<图案编码数据>],  
    ……  
}
```

![](/images/posts/esp32-notes/esp32_10.png)

最后你就可以在代码中通过添加`chinese('<文字>',<x>,<y>)`进行显示。

##### **TFT1.3屏幕**

TFT(Thin Film Transistor)指的是该屏幕的材质（薄膜晶体管），1.3指的是屏幕的尺寸（1.3英寸）。这类液晶显示屏分辨率通常为240x240像素，与0.96OLED屏幕不同的是，TFT屏幕是可以显示丰富的彩色的，适用于显示高质量图像。下图是我购买的一块TFT1.3屏幕：

![](/images/posts/esp32-notes/esp32_11.png)

VCC：电源正极，提供3.3V或5V工作电压。  
GND：地线，提供电路的公共参考电位点。  
SDA：数据线，用于传输像素数据到屏幕。  
SCL：时钟线，提供时钟信号以同步数据的传输。  
RES：复位引脚，用于重置屏幕到初始状态。  
DC：数据/命令选择引脚，指示当前传输的是数据还是命令。  
BLK：背光控制引脚，用于控制屏幕的背光亮度。

要想让这一块屏幕亮起来并显示点什么，可比前面的OLED复杂多了，首先整个程序分为3个部分：st7789驱动库（用于配合st7789显示屏控制芯片）、字体库（用于显示基础的英文字母，如果可以，你还可以加入中文，但是需要特殊方式转化）、主程序（让屏幕显示出内容）

首先请通过链接直接安装好[st7789驱动库和字体库](/images/posts/esp32-notes/tft1.3.zip)（因为这俩玩意代码太多了，直接copy过来直接帮我水了快5000字了），然后在创建一个新的程序用来写主程序：

```python
import time
from machine import Pin, SoftSPI
import st7789 as st7789
import vga2_bold_16x32 as font

def main1():
    # 创建SoftSPI对象(SCK对应SCL，MOSI对应SDA)
    spi = SoftSPI(baudrate=60000000, polarity=1, phase=0, sck=Pin(18), mosi=Pin(23), miso=Pin(19))

    # 创建ST7789对象
    tft = st7789.ST7789(
        spi,
        240,
        240,
        #（reset就是RST）
        reset=Pin(15, Pin.OUT),
        dc=Pin(2, Pin.OUT),
        cs=Pin(4, Pin.OUT),
        backlight=Pin(21, Pin.OUT),
        rotation=0)

    '''定义颜色'''

    red = st7789.color565(255, 0, 0)
    blue = st7789.color565(0, 0, 255)
    white = st7789.color565(255, 255, 255)
    blue_background = st7789.color565(0, 255, 128) 

    # 清屏
    # 清除屏幕内容
    tft.fill(0)

    # 在屏幕上显示"hello world"，颜色为红色
    tft.text(font, "Hello World", 30, 50, red)
    time.sleep(1)  # 等待1秒

    # 再次清除屏幕内容
    tft.fill(0)

    tft.text(font, "A TFT1.3 Screen", 0, 50, blue)
    time.sleep(1) 

    # 清除屏幕内容，并设置背景色为蓝色
    tft.fill(blue_background)
    time.sleep(1)
    
    tft.fill(0)
    white = st7789.color565(255, 255, 255)
    time.sleep(1)

main1()
```

成功运行后，会先显示Hello World，接着显示A TFT1.3 Screen，然后会将整个屏幕填充为淡绿色，最后清屏。

***未完待续....***

#### **蓝牙通信**

ESP32的蓝牙功能是其强大的无线通信能力之一，广泛应用于各种物联网场景中，通过蓝牙连接，ESP32可以实现与其他设备的无线通信和数据交互，为各种应用场景提供便捷和高效的解决方案。ESP32支持双模蓝牙，即同时支持经典蓝牙（Bluetooth Classic）和蓝牙低功耗（Bluetooth Low Energy，简称BLE）。

我们可以通过代码让ESP32开发板成为一个蓝牙服务端。以下是示例代码：

```
# 导入模块
from machine import Pin
from machine import Timer
from time import sleep_ms
import bluetooth

# 定义全局变量
BLE_MSG = ""

class ESP32_BLE():
    def __init__(self, name):
        
        self.led = Pin(2, Pin.OUT)
        self.timer1 = Timer(0)
        self.name = name
        
        self.ble = bluetooth.BLE()
        self.ble.active(True)
        self.ble.config(gap_name=name)
        self.disconnected()
        self.ble.irq(self.ble_irq)
        self.register()
        self.advertiser()

    def connected(self):
        self.led.value(1)
        self.timer1.deinit()

    def disconnected(self):        
        self.timer1.init(period=1000, mode=Timer.PERIODIC, callback=lambda t: self.led.value(not self.led.value()))
        #self.led.value(0)

    def ble_irq(self, event, data):
        global BLE_MSG
        #_IRQ_CENTRAL_CONNECT 蓝牙终端链接了此设备
        if event == 1:
            self.connected()
        #_IRQ_CENTRAL_DISCONNECT 蓝牙终端断开此设备
        elif event == 2:
            self.advertiser()
            self.disconnected()
        #_IRQ_GATTS_WRITE 蓝牙终端向ESP32发送数据，接收数据处理
        elif event == 3:  
            buffer = self.ble.gatts_read(self.rx)
            BLE_MSG = buffer.decode('UTF-8').strip()
            print("接收到其他蓝牙终端发来的数据:",BLE_MSG)
            
    def register(self):        
        service_uuid = '6E400001-B5A3-F393-E0A9-E50E24DCCA9E'
        reader_uuid = '6E400002-B5A3-F393-E0A9-E50E24DCCA9E'
        sender_uuid = '6E400003-B5A3-F393-E0A9-E50E24DCCA9E'
        services = (
            (
                bluetooth.UUID(service_uuid),
                (
                    (bluetooth.UUID(sender_uuid), bluetooth.FLAG_NOTIFY),
                    (bluetooth.UUID(reader_uuid), bluetooth.FLAG_WRITE),
                )
            ),
        )
        ((self.tx, self.rx,), ) = self.ble.gatts_register_services(services)

    def send(self, data):
        self.ble.gatts_notify(0, self.tx, data + '\n')

    def advertiser(self):
        name = bytes(self.name, 'UTF-8')
        adv_data = bytearray('\x02\x01\x02', 'UTF-8') + bytearray((len(name) + 1, 0x09), 'UTF-8') + name
        self.ble.gap_advertise(100, adv_data)
        print(adv_data)
        print("\r\n")

def main(BLE_NAME):
    global BLE_MSG
    #调用BLE 设置ESP32被发现的蓝牙名称 名称为主程序传参传入
    ble = ESP32_BLE(BLE_NAME)
    #蓝牙指示灯(板载蓝色LED)，当ESP32设备未被连接，则周期闪烁；若被连接，则常亮
    led = Pin(2, Pin.OUT)

    while True:
        #使用测试数据需要符合 r#hello
        if BLE_MSG.split("#")[0] == 'r':
            #打印获取到的数据
            print(BLE_MSG)
            # 清空接收的数据
            BLE_MSG = ""
        sleep_ms(100)

if __name__ == "__main__":
    main("ESP32")
```

成功运行代码后，手机端使用蓝牙调试助手连接蓝牙设备（名称为：ESP32），未连接成功时LED指示灯闪烁，连接成功后LED指示灯常亮，此时写入数据如：r#hello，ESP32接收到后会在Shell终端中输出对应的数据。  
**如何使用蓝牙调试助手：**打开程序，点击左上角三个横杠打开左侧菜单，点击Devices，在Bluetooth LE中点击右上角的SCAN扫码附近的蓝牙设备（记得把蓝牙打开），出现ESP32时，点击连接。蓝牙调试控制台出现Connected则说明连接成功。你可以在下面的输入框输入任意文字，在IDE控制台中就会接收到相应的文字。

![](/images/posts/esp32-notes/esp32_12.png)

#### MQTT

MQTT（Message Queuing Telemetry Transport）是一种轻量级的消息传输协议，专为小型设备、低带宽、高延迟或不可靠的网络环境设计。它广泛应用于物联网（IoT）中，以实现设备间的通信和数据交换。

MQTT分为客户端、服务端。每个客户端可以接收数据（订阅）、发送数据（发布），每个消息都由主题+消息内容组成。假设我们有4个`客户端（a、b、c、d）`和1个`服务端`，这4个客户端都已经通过网络连接上了服务端。假如`客户端a`向服务器订阅了一个主题为`abc`的信息，那么当服务器接收到来自任何一个`客户端（b/c/d）`的消息时，只要这个消息的主题是`abc`，那么服务器就会将这个消息发送给`客户端a`同理，如果除了`客户端a`之外还有其它的`客户端（b/c）`也订阅了`abc`这个主题，那么服务器也会同时将这个消息送给`客户端b`、`客户端c`。

在本小节，我会尝试创建一个MQTT服务器，并且利用ESP32连接，实现PC、ESP32消息互通。首先，我们要创建一个MQTT服务器，你可以选择在自己的电脑本地创建，也可以利用云资源进行部署。在这里我用云资源演示。

我推荐[EMQX](https://www.emqx.com/zh)，打开网站注册/登录账号后，选择一个合适的产品进行云资源部署，这里以专有版云服务为例，按照指引部署即可，实在不行可以查看他们站内的[文档](https://docs.emqx.com/zh/cloud/latest/)，非常详细。当你创建完一个MQTT云服务器后，请切换到该服务器的控制台界面，找到“连接信息”，这一栏包含了连接地址和各种端口。为了测试，你需要在控制台内添加几个客户端认证用户。

接下来为了测试连接情况，我们需要创建一系列的客户端（至少2个），分别在ESP32和电脑上运行。电脑上你可以选择利用EMQX内的客户端资源，EMQX站内提供了各种编程语言的客户端开发教程，你也可以选择使用现成的MQTT客户端工具：[MQTTX](https://mqttx.app/zh)。MQTTX提供了一个可视化的操作界面，让MQTT调试变得更简单便捷。如果要MQTT服务端，我推荐[GMQT](https://goflys.cn/gmqt)。

下载并安装好MQTTX后，打开程序在出现的窗口找到“General”一栏开始信息填写。Name只是一个区分名，对MQTT的连接影响不是很大；Client ID是你的自定义名称，它用于在MQTT消息中区分不同用户，类似聊天昵称；Host部分则需要在后边一栏填入刚刚在MQTT服务器控制台记下的连接地址；Port代表的是连接端口，默认为1883。对于其它内容和细节，你可以查阅[相关文档](https://mqttx.app/zh/docs)。

填入完信息后，点击右上角的Connect，当提示Connected时说明连接成功。这时候你需要在左边找到New Subscription并点击它以订阅一个话题。这个话题你可以类比成一个聊天群的群名（或群号），我们可以通过这个聊天群名进行消息发送和接收。订阅就相当于加群，接下来你可以在不同的客户端上用这个“群”来聊天了。

现在我们来到ESP32上，利用代码在ESP32上创建一个MQTT客户端，首先你得要有一个名为[umqtt.py](https://github.com/micropython/micropython-lib/tree/master/micropython/umqtt.simple)的前置库:

```python
import socket
import struct
from binascii import hexlify

class MQTTException(Exception):
    pass

class MQTTClient:
    def __init__(
        self,
        client_id,
        server,
        port=0,
        user=None,
        password=None,
        keepalive=0,
        ssl=None,
    ):
        if port == 0:
            port = 8883 if ssl else 1883
        self.client_id = client_id
        self.sock = None
        self.server = server
        self.port = port
        self.ssl = ssl
        self.pid = 0
        self.cb = None
        self.user = user
        self.pswd = password
        self.keepalive = keepalive
        self.lw_topic = None
        self.lw_msg = None
        self.lw_qos = 0
        self.lw_retain = False

    def _send_str(self, s):
        self.sock.write(struct.pack("!H", len(s)))
        self.sock.write(s)

    def _recv_len(self):
        n = 0
        sh = 0
        while 1:
            b = self.sock.read(1)[0]
            n |= (b & 0x7F) << sh
            if not b & 0x80:
                return n
            sh += 7

    def set_callback(self, f):
        self.cb = f

    def set_last_will(self, topic, msg, retain=False, qos=0):
        assert 0 <= qos <= 2
        assert topic
        self.lw_topic = topic
        self.lw_msg = msg
        self.lw_qos = qos
        self.lw_retain = retain

    def connect(self, clean_session=True):
        self.sock = socket.socket()
        addr = socket.getaddrinfo(self.server, self.port)[0][-1]
        self.sock.connect(addr)
        if self.ssl:
            self.sock = self.ssl.wrap_socket(self.sock, server_hostname=self.server)
        premsg = bytearray(b"\x10\0\0\0\0\0")
        msg = bytearray(b"\x04MQTT\x04\x02\0\0")

        sz = 10 + 2 + len(self.client_id)
        msg[6] = clean_session << 1
        if self.user:
            sz += 2 + len(self.user) + 2 + len(self.pswd)
            msg[6] |= 0xC0
        if self.keepalive:
            assert self.keepalive < 65536
            msg[7] |= self.keepalive >> 8
            msg[8] |= self.keepalive & 0x00FF
        if self.lw_topic:
            sz += 2 + len(self.lw_topic) + 2 + len(self.lw_msg)
            msg[6] |= 0x4 | (self.lw_qos & 0x1) << 3 | (self.lw_qos & 0x2) << 3
            msg[6] |= self.lw_retain << 5

        i = 1
        while sz > 0x7F:
            premsg[i] = (sz & 0x7F) | 0x80
            sz >>= 7
            i += 1
        premsg[i] = sz

        self.sock.write(premsg, i + 2)
        self.sock.write(msg)
        # print(hex(len(msg)), hexlify(msg, ":"))
        self._send_str(self.client_id)
        if self.lw_topic:
            self._send_str(self.lw_topic)
            self._send_str(self.lw_msg)
        if self.user:
            self._send_str(self.user)
            self._send_str(self.pswd)
        resp = self.sock.read(4)
        assert resp[0] == 0x20 and resp[1] == 0x02
        if resp[3] != 0:
            raise MQTTException(resp[3])
        return resp[2] & 1

    def disconnect(self):
        self.sock.write(b"\xe0\0")
        self.sock.close()

    def ping(self):
        self.sock.write(b"\xc0\0")

    def publish(self, topic, msg, retain=False, qos=0):
        pkt = bytearray(b"\x30\0\0\0")
        pkt[0] |= qos << 1 | retain
        sz = 2 + len(topic) + len(msg)
        if qos > 0:
            sz += 2
        assert sz < 2097152
        i = 1
        while sz > 0x7F:
            pkt[i] = (sz & 0x7F) | 0x80
            sz >>= 7
            i += 1
        pkt[i] = sz
        # print(hex(len(pkt)), hexlify(pkt, ":"))
        self.sock.write(pkt, i + 1)
        self._send_str(topic)
        if qos > 0:
            self.pid += 1
            pid = self.pid
            struct.pack_into("!H", pkt, 0, pid)
            self.sock.write(pkt, 2)
        self.sock.write(msg)
        if qos == 1:
            while 1:
                op = self.wait_msg()
                if op == 0x40:
                    sz = self.sock.read(1)
                    assert sz == b"\x02"
                    rcv_pid = self.sock.read(2)
                    rcv_pid = rcv_pid[0] << 8 | rcv_pid[1]
                    if pid == rcv_pid:
                        return
        elif qos == 2:
            assert 0

    def subscribe(self, topic, qos=0):
        assert self.cb is not None, "Subscribe callback is not set"
        pkt = bytearray(b"\x82\0\0\0")
        self.pid += 1
        struct.pack_into("!BH", pkt, 1, 2 + 2 + len(topic) + 1, self.pid)
        # print(hex(len(pkt)), hexlify(pkt, ":"))
        self.sock.write(pkt)
        self._send_str(topic)
        self.sock.write(qos.to_bytes(1, "little"))
        while 1:
            op = self.wait_msg()
            if op == 0x90:
                resp = self.sock.read(4)
                # print(resp)
                assert resp[1] == pkt[2] and resp[2] == pkt[3]
                if resp[3] == 0x80:
                    raise MQTTException(resp[3])
                return

    # Wait for a single incoming MQTT message and process it.
    # Subscribed messages are delivered to a callback previously
    # set by .set_callback() method. Other (internal) MQTT
    # messages processed internally.
    def wait_msg(self):
        res = self.sock.read(1)
        self.sock.setblocking(True)
        if res is None:
            return None
        if res == b"":
            raise OSError(-1)
        if res == b"\xd0":  # PINGRESP
            sz = self.sock.read(1)[0]
            assert sz == 0
            return None
        op = res[0]
        if op & 0xF0 != 0x30:
            return op
        sz = self._recv_len()
        topic_len = self.sock.read(2)
        topic_len = (topic_len[0] << 8) | topic_len[1]
        topic = self.sock.read(topic_len)
        sz -= topic_len + 2
        if op & 6:
            pid = self.sock.read(2)
            pid = pid[0] << 8 | pid[1]
            sz -= 2
        msg = self.sock.read(sz)
        self.cb(topic, msg)
        if op & 6 == 2:
            pkt = bytearray(b"\x40\x02\0\0")
            struct.pack_into("!H", pkt, 2, pid)
            self.sock.write(pkt)
        elif op & 6 == 4:
            assert 0
        return op

    # Checks whether a pending message from server is available.
    # If not, returns immediately with None. Otherwise, does
    # the same processing as wait_msg.
    def check_msg(self):
        self.sock.setblocking(False)
        return self.wait_msg()
```

参考[EMQX的文档](https://docs.emqx.com/zh/cloud/latest/connect_to_deployments/esp32_with_micropython.html)，可以跟着教程创建一个名为wifi.py的前置库，用于网络连接：

```python
import network
import time

def connect():
	ssid = 'NAME OF YOUR WIFI NETWORK'
	password = 'PASSWORD OF YOUR WIFI NETWORK'
	wlan = network.WLAN(network.STA_IF)
	wlan.active(True)
	wlan.connect(ssid, password)
	while wlan.isconnected() == False:
		print('Waiting for connection...')
		time.sleep(1)
	print('Connected on {ip}'.format(ip = wlan.ifconfig()[0]))
```

到这里，所有准备工作已经做完了，接下来在ESP32上创建一个MQTT客户端：

```python
import json
import random
import ssl
import time
import wifi

from umqtt import MQTTClient

SERVER = ""   # 连接地址
PORT = 1883  # 连接端口
CLIENT_ID = 'micropython-client-{id}'.format(id=random.getrandbits(8))  # 客户端标识
USERNAME = ''   # 用户名/账号
PASSWORD = ''   # 用户秘密
TOPIC = ""  # 订阅的话题

def on_message(topic, msg):
    # 从主题接收到的消息为 {payload}，主题是 {topic}
    print("Received '{payload}' from topic '{topic}'\n".format(
        # 解码消息内容为字符串
        payload = msg.decode(), 
        # 解码主题内容为字符串
        topic = topic.decode()))

def connect():
    # 创建一个MQTT客户端对象
    client = MQTTClient(CLIENT_ID, SERVER, PORT, USERNAME, PASSWORD)
    # 连接MQTT服务器
    client.connect()
    # 打印连接成功的消息
    print('Connected to MQTT Broker "{server}"'.format(server = SERVER))
    # 返回已连接的MQTT客户端对象
    return client

def subscribe(client):
    # 设置回调函数为on_message
    client.set_callback(on_message)
    # 订阅主题TOPIC
    client.subscribe(TOPIC)

def loop_publish(client):
    # 初始化消息计数为0
    msg_count = 0
    # 无限循环
    while True:
        # 创建一个字典，包含键'msg'和对应的值msg_count
        msg_dict = {
            'msg': msg_count
        }
        # 将字典转换为JSON格式的字符串
        msg = json.dumps(msg_dict)
        # 使用client的publish方法发布消息到指定主题
        result = client.publish(TOPIC, msg)
        # 打印发送的消息和主题
        print("Send '{msg}' to topic '{topic}'".format(msg=msg, topic=TOPIC))
        # 等待接收消息
        client.wait_msg()
        # 消息计数加1
        msg_count += 1
        # 等待1秒
        time.sleep(1)

def run():
    # 连接WiFi
    wifi.connect()
    # 建立客户端连接
    client = connect()
    # 订阅消息
    subscribe(client)
    # 循环发布消息
    loop_publish(client)

if __name__ == "__main__":
    run()
```

上述代码运行成功后，会周期性地发布消息。接下来我们根据这个代码的原理创建一个类似于聊天机器人的程序，并让它在ESP32上运行。

```python
import json
import random
import time
import machine
import wifi
from umqtt import MQTTClient

SERVER = ""   # 连接地址
PORT = 1883  # 连接端口
CLIENT_ID = 'micropython-client-{id}'.format(id=random.getrandbits(8))  # 客户端标识
USERNAME = ''   # 用户名/账号
PASSWORD = ''   # 用户秘密
TOPIC = ""  # 订阅的话题

led = machine.Pin(2, machine.Pin.OUT)  # 初始化LED引脚
client = None

def on_message(topic, msg):
    global client
    # 打印从指定主题接收到的消息
    print("Received '{payload}' from topic '{topic}'".format(payload=msg.decode(), topic=topic.decode()))
    # 将接收到的消息解码为字符串
    message = msg.decode()
    # 初始化响应字符串
    response = ""
    # 根据接收到的消息内容执行相应的操作
    if message == '你好':
        # 如果消息内容为'你好'，则设置响应字符串为'Hello,I'm ESP32.'
        response = "Hello,I'm ESP32."
    elif message == '打开LED':
        # 如果消息内容为'打开LED'，则调用led_on()函数打开LED灯，并设置响应字符串为'LED is ON!'(下面的部分以此类推)
        led_on()
        response = 'LED is ON!'
    elif message == '关闭LED':
        led_off()
        response = 'LED is OFF!'
    elif message == 'LED闪烁':
        led_blink()
        response = 'LED is Blinking!'
    # 如果response不为空，则发送MQTT消息
    if response:  # 如果response不为空，则发送MQTT消息
        # 调用publish()函数发送MQTT消息
        publish(client, response)

def connect():
    client = MQTTClient(CLIENT_ID, SERVER, PORT, USERNAME, PASSWORD)
    client.connect()
    print('Connected to MQTT Broker "{server}"'.format(server=SERVER))
    publish(client, "ESP32: Online Mode.")
    return client

def subscribe(client):
    client.set_callback(on_message)
    client.subscribe(TOPIC)

def publish(client, message):
    #msg = json.dumps({'esp32_msg': message})
    result = client.publish(TOPIC, message)
    print("Sent '{msg}' to topic '{topic}'".format(msg=message, topic=TOPIC))

# 点亮LED的函数
def led_on():
    led.value(1)
    print('LED is on')
# 关闭LED的函数
def led_off():
    led.value(0)
    print('LED is off')
# LED闪烁的函数
def led_blink():
    print('LED is blinking')
    for _ in range(5):
        led.value(1)
        time.sleep(0.5)
        led.value(0)
        time.sleep(0.5)

def run():
    global client
    wifi.connect()
    client = connect()
    subscribe(client)
    while True:
        try:
            client.wait_msg()  # 持续监听MQTT消息
        except OSError as e:
            print("An OSError occurred: {}".format(e))
            # 尝试重新连接
            client.disconnect()
            time.sleep(5)  # 等待一段时间后重试
            client = connect()
            subscribe(client)

if __name__ == "__main__":
    run()
```

成功运行后，ESP32会根据你发送的关键词消息进行相应的操作，比如你发送打开LED时，开发板上的LED就会点亮，同时会在控制台和MQTT服务器上发送相应的信息提示。

#### **传感器**系列

##### **数字温度传感器（DS18B20）:**

DS18B20是一款常用的高精度的单总线数字温度测量芯片。具有体积小，硬件开销低，抗干扰能力强，精度高的特点。其测温范围为-55℃到+125℃，在-10℃到+85℃范围内误差为±0.4°。供电电压在2.5V~5.5V之间。

DS18B20返回的16位二进制数代表此刻探测的温度值，其高五位代表正负。如果高五位全部为1，则代表返回的温度值为负值。如果高五位全部为0，则代表返回的温度值为正值。后面的11位数据代表温度的绝对值，将其转换为十进制数值之后，再乘以0.0625即可获得此时的温度值。

![](/images/posts/esp32-notes/ds18b20.png)

将传感器正负极分别连接至ESP32的VIN与GND引脚，将DQ连接至任意一个GPIO引脚，比如D13。接下来就是写代码获取传感器的数据就行。不过micropython自带一个DS18B20库，并有相对应的API（来自[文档](#onewire-driver)），所以我们可以直接利用这个库写程序。下面是示例代码：

```python
from machine import Pin
import onewire, ds18x20
import time

# 初始化DS18X20温度传感器
ds_pin = Pin(13)
ds_sensor = ds18x20.DS18X20(onewire.OneWire(ds_pin))

def read_ds_sensor():
    """
    读取DS18X20温度传感器的温度值。
    返回:
        float: 返回检测到的温度值，四舍五入到小数点后两位。
               如果没有检测到有效的温度，则返回None。
    """
    roms = ds_sensor.scan()  # 扫描设备
    print('发现设备:', roms)
    ds_sensor.convert_temp()  # 开始温度转换
    for rom in roms:
        temp = ds_sensor.read_temp(rom)  # 读取温度
        if isinstance(temp, float):  # 确保读取到的是有效的浮点数温度值
            return round(temp, 2)  # 返回四舍五入后的温度值
    # 如果没有检测到有效的温度，则返回None

# 无限循环，每秒读取并打印温度值
while True:
    temp = read_ds_sensor()  # 读取温度值
    if temp is not None:  # 如果读取到了有效的温度值，则打印出来
        print(temp)
    else:  # 如果没有读取到有效的温度值，则打印提示信息
        print("未检测到有效的温度值。")
    time.sleep(1)  # 每次读取后暂停1秒
```

运行后会看到控制台每隔1s发送一次温度数据，如果程序运行的同时你将传感器断开，程序会马上报错终止。接下来我们做进一步的升级：比如我将温度数据利用一个网页来显示，将上面的代码与http服务器的代码相结合就是我们想要的了。

```python
import machine
import onewire, ds18x20
import time
import network
import usocket

# 初始化DS18X20温度传感器
ds_pin = machine.Pin(13)
ds_sensor = ds18x20.DS18X20(onewire.OneWire(ds_pin))

# 读取DS18X20温度传感器的温度值
def read_ds_sensor():
    roms = ds_sensor.scan()
    ds_sensor.convert_temp()
    for rom in roms:
        temp = ds_sensor.read_temp(rom)
        if isinstance(temp, float):
            return round(temp, 2)
    return None

# 设置ESP32为AP模式
def setup_ap_mode(ssid, password):
    wlan = network.WLAN(network.AP_IF)
    wlan.active(True)
    wlan.config(essid=ssid, password=password)
    while not wlan.active():
        pass
    print('AP模式已启动，SSID:', ssid)

# Web服务器处理函数
def web_server(port=80):
    s = usocket.socket(usocket.AF_INET, usocket.SOCK_STREAM)
    s.bind(('', port))
    s.listen(5)
    print('Web服务器已启动，端口:', port)
    
    while True:
        conn, addr = s.accept()
        print('客户端连接:', addr)
        request = conn.recv(1024)
        response = create_http_response(read_ds_sensor())
        conn.sendall(response)
        conn.close()

# 创建HTTP响应
def create_http_response(temp):
    if temp is not None:
        http_header = b"HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n\r\n"
        html_body = f"<html><body><h1>当前温度: {temp}°C</h1></body></html>"
        response = http_header + html_body.encode()
    else:
        http_header = b"HTTP/1.1 500 Internal Server Error\r\nContent-Type: text/html\r\n\r\n"
        html_body = "<html><body><h1>温度读取错误</h1></body></html>"
        response = http_header + html_body.encode()
    return response

# 主程序
def main():
    ssid = 'ESP32-Temperature'
    password = 'password123'
    setup_ap_mode(ssid, password)
    web_server(8080)

if __name__ == "__main__":
    main()
```

首先配置ESP32为无线接入点（AP）模式，并设置特定的SSID和密码，以便其他设备可以连接到这个WiFi网络。然后，它启动一个Web服务器，监听特定端口上的连接请求。当有客户端连接到服务器时，代码会读取温度传感器的当前值，并创建一个HTTP响应，将温度信息以HTML格式发送给客户端。

当你的设备连接上一个名为“ESP32-Temperature”的网络时，在浏览器输入地址192.168.4.1:8080后就能在出现的网页上看到温度传感器的数据了。由于此段代码比较简单，想要更新网页上的温度数据还得不断的刷新网页。

##### 温湿度传感器（DHT11）：

![](/images/posts/esp32-notes/dht11.png)

DHT11是一款有已校准数字信号输出的温湿度传感器。 其精度湿度±5%RH， 温度±2℃，量程湿度5~95%RH， 温度-20~+60℃。它采用了单线制串行接口，这使得系统集成变得非常简单和快捷。DHT11的每个传感器都在非常精确的湿度校验室中进行校准，并将校准系数以程序的形式存储在OTP内存中，使得传感器在检测信号的处理过程中能够调用这些校准系数。

图片展示的就是一个DHT11传感器的模块，只有三个引脚的它可以很方便的与开发板连接。与前面的DS18B20一样，连接的时候正极对VIN，负极对GND，数据输出（中间的那个）对任意一个GPIO引脚（本例用D13）。很巧的是，micropython自带一个dht库用于驱动DHT11 传感器，示例代码如下：

```python
from machine import Pin
import dht
import time

# 设置DHT11传感器连接的GPIO引脚
dht_pin = Pin(15, Pin.IN)

# 初始化DHT11传感器对象
dht11 = dht.DHT11(dht_pin)

while True:
    try:
        # 读取传感器数据
        dht11.measure()
        
        # 获取温度和湿度值
        temp = dht11.temperature()
        hum = dht11.humidity()
        
        # 打印温度和湿度到控制台
        print("Temperature: %.0f °C" % temp)
        print("Humidity: %.0f %%" % hum)
    except OSError as e:
        # 如果读取失败，打印错误信息
        print("Failed to read sensor, try again!")
        print(e)
    
    # 等待一段时间再次读取，这里设置为1秒
    time.sleep(1)
```

接下来我们继续拓展这个代码。在前文中我们利用OLED来显示文字，那么我们可以将这串代码升级成可在OLED屏幕上实时显示读数。对于屏幕的接线：GND-GND，VDD-3.3v，SCK-D4，SDA-D5；DHT11传感器的接线：+对VIN，-对GND（换一个接），数据输出接D13。连接后将下列代码导入进开发板。

```python
from machine import Pin, I2C
from ssd1306 import SSD1306_I2C 
import dht
import time

# 设置DHT11传感器连接的GPIO引脚
dht_pin = Pin(13, Pin.IN)

# 初始化DHT11传感器对象
dht11 = dht.DHT11(dht_pin)

#OLED=....
i2c = I2C(scl=Pin(4), sda=Pin(5))
OLED= SSD1306_I2C(128, 64, i2c)

#fonts=....
fonts= {
    0xe6b8a9:   # 温
    [0x00,0x23,0x12,0x12,0x83,0x42,0x42,0x13,0x10,0x27,0xE4,0x24,0x24,0x24,0x2F,0x00,
    0x00,0xF8,0x08,0x08,0xF8,0x08,0x08,0xF8,0x00,0xFC,0xA4,0xA4,0xA4,0xA4,0xFE,0x00],
     
    0xe5baa6:   # 度
    [0x01,0x00,0x3F,0x22,0x22,0x3F,0x22,0x22,0x23,0x20,0x2F,0x24,0x42,0x41,0x86,0x38,
     0x00,0x80,0xFE,0x20,0x20,0xFC,0x20,0x20,0xE0,0x00,0xF0,0x10,0x20,0xC0,0x30,0x0E],  
    
    0xe6b9bf:   # 湿
    [0x00,0x27,0x14,0x14,0x87,0x44,0x44,0x17,0x11,0x21,0xE9,0x25,0x23,0x21,0x2F,0x00,
     0x00,0xF8,0x08,0x08,0xF8,0x08,0x08,0xF8,0x20,0x20,0x24,0x28,0x30,0x20,0xFE,0x00],
    
    0xe28483:     # ℃
    [0x00,0x00,0x00,0x38,0x2B,0x14,0x08,0x18,0x18,0x18,0x18,0x08,0x0C,0x07,0x00,0x00,
    0x00,0x00,0x00,0x08,0xF8,0x18,0x08,0x00,0x00,0x00,0x00,0x08,0x18,0xE0,0x00,0x00],
    
    0xe59bbe:     # %
    [0x00,0x00,0x1E,0x12,0x12,0x1E,0x00,0x00,0x01,0x03,0x06,0x0C,0x18,0x00,0x00,0x00,
    0x00,0x00,0x04,0x0C,0x18,0x30,0x60,0xC0,0x80,0x3C,0x24,0x24,0x3C,0x00,0x00,0x00],
    
}

#函数部分
def chinese(ch_str, x_axis, y_axis): 
   offset_ = 0 
   for k in ch_str: 
       code = 0x00  # 将中文转成16进制编码 
       data_code = k.encode("utf-8")
       code |= data_code[0] << 16
       code |= data_code[1] << 8
       code |= data_code[2]
       byte_data = fonts[code]
       for y in range(0, 16):
           a_ = bin(byte_data[y]).replace('0b', '')
           while len(a_) < 8:
               a_ = '0'+ a_
           b_ = bin(byte_data[y+16]).replace('0b', '')
           while len(b_) < 8:
               b_ = '0'+ b_
           for x in range(0, 8):
               OLED.pixel(x_axis + offset_ + x,    y+y_axis, int(a_[x]))   
               OLED.pixel(x_axis + offset_ + x +8, y+y_axis, int(b_[x]))   
       offset_ += 16

# 主循环，不断读取传感器数据并更新OLED显示
while True:
    try:
        # 读取传感器数据
        dht11.measure()
        temp = dht11.temperature()
        hum = dht11.humidity()
        
        # 清空OLED屏幕
        OLED.fill(0)
        OLED.text("-----------------",0,0)
        OLED.text("|Sensor:DHT11  |",0,5)
        OLED.text("-----------------",0,10)        
        # 在OLED上显示温度和湿度
        chinese('温度', 25, 20)
        OLED.text('%.0f' % temp, 65, 25)  # 显示温度值
        chinese('℃', 85, 20)  # 显示温度单位
        
        chinese('湿度', 25, 40)
        OLED.text('%.0f' % hum, 65, 45)  # 显示湿度值
        chinese('图', 85, 42)  # 显示湿度单位

        # 更新OLED屏幕显示
        OLED.show()
        
    except OSError as e:
        # 如果读取失败，打印错误信息（可选：也可以在OLED上显示错误信息）
        OLED.fill(0)  # 清空屏幕
        OLED.text("[ERROR]",0,5)
        OLED.text("Failed to read ", 0, 15)  # 显示消息
        OLED.text("sensor!",0,25)
        OLED.show()  # 更新屏幕显示
        print("Failed to read sensor, try again!")
        print(e)
    
    # 等待一段时间再次读取，这里设置为1秒
    time.sleep(1)
```

关于正负极接线也不是强制要求要分开连接，屏幕和传感器的正负极都可以连接至ESP32上的同一VCC和GND上。其实你还可以通过外部电源对二者供电，只要这个电源能够驱动传感器或者屏幕，一般在3.3v~5v。但是，需要注意的是，虽然传感器和ESP32使用不同的电源，但它们的地线（GND）应该是共用的，以确保它们之间的电平参考是一致的。如果不这样做，可能会导致数据传输不稳定或其他不可预测的问题。最后只需将传输数据的引脚与ESP32连接就行（如DHT11的数据输出，OLED屏幕的SCK和SDA）。

##### 高精度温湿度传感器（AHT20）

![](/images/posts/esp32-notes/aht20.png)

AHT20是一款性能优越、易于集成的温湿度传感器，相比于DHT11，AHT20的精度更高，量程更广，稳定性高而且体积小，可作为DHT11的替代。它能够满足多种高精度应用场景的需求。其小巧的体积和低功耗特点使其非常适合在空间受限和电池供电的设备中使用。

AHT20基于热敏电阻和电容式湿度传感器的原理进行工作。热敏电阻能够感应温度的变化，而电容式湿度传感器则能够感应空气中的湿度。当温度变化时，热敏电阻的阻值会发生变化，从而引起电压的变化；而当湿度变化时，电容式湿度传感器的电容值也会发生变化，从而引起频率的变化。这两个信号经过AHT20内部的电路处理后，通过I2C接口输出数字信号。

接下来我们要利用micropython代码写一个能读取AHT20数据的程序。首先，你需要在ESP32上下载一个能够驱动并识别AHT20的库(axtx0.py)：

```
# The MIT License (MIT)
#
# Copyright (c) 2020 Kattni Rembor for Adafruit Industries
# Copyright (c) 2020 Andreas Bühl
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
# THE SOFTWARE.
"""
MicroPython driver for the AHT10 and AHT20 Humidity and Temperature Sensor
Author(s): Andreas Bühl, Kattni Rembor
"""
 
import utime
from micropython import const
 
 
class AHT10:
    """Interface library for AHT10/AHT20 temperature+humidity sensors"""
 
    AHTX0_I2CADDR_DEFAULT = const(0x38)  # Default I2C address
    AHTX0_CMD_INITIALIZE = 0xE1  # Initialization command
    AHTX0_CMD_TRIGGER = const(0xAC)  # Trigger reading command
    AHTX0_CMD_SOFTRESET = const(0xBA)  # Soft reset command
    AHTX0_STATUS_BUSY = const(0x80)  # Status bit for busy
    AHTX0_STATUS_CALIBRATED = const(0x08)  # Status bit for calibrated
 
    def __init__(self, i2c, address=AHTX0_I2CADDR_DEFAULT):
        utime.sleep_ms(20)  # 20ms delay to wake up
        self._i2c = i2c
        self._address = address
        self._buf = bytearray(6)
        self.reset()
        if not self.initialize():
            raise RuntimeError("Could not initialize")
        self._temp = None
        self._humidity = None
 
    def reset(self):
        """Perform a soft-reset of the AHT"""
        self._buf[0] = self.AHTX0_CMD_SOFTRESET
        self._i2c.writeto(self._address, self._buf[0:1])
        utime.sleep_ms(20)  # 20ms delay to wake up
 
    def initialize(self):
        """Ask the sensor to self-initialize. Returns True on success, False otherwise"""
        self._buf[0] = self.AHTX0_CMD_INITIALIZE
        self._buf[1] = 0x08
        self._buf[2] = 0x00
        self._i2c.writeto(self._address, self._buf[0:3])
        self._wait_for_idle()
        if not self.status & self.AHTX0_STATUS_CALIBRATED:
            return False
        return True
 
    @property
    def status(self):
        """The status byte initially returned from the sensor, see datasheet for details"""
        self._read_to_buffer()
        return self._buf[0]
 
    @property
    def relative_humidity(self):
        """The measured relative humidity in percent."""
        self._perform_measurement()
        self._humidity = (
            (self._buf[1] << 12) | (self._buf[2] << 4) | (self._buf[3] >> 4)
        )
        self._humidity = (self._humidity * 100) / 0x100000
        return self._humidity
 
    @property
    def temperature(self):
        """The measured temperature in degrees Celcius."""
        self._perform_measurement()
        self._temp = ((self._buf[3] & 0xF) << 16) | (self._buf[4] << 8) | self._buf[5]
        self._temp = ((self._temp * 200.0) / 0x100000) - 50
        return self._temp
 
    def _read_to_buffer(self):
        """Read sensor data to buffer"""
        self._i2c.readfrom_into(self._address, self._buf)
 
    def _trigger_measurement(self):
        """Internal function for triggering the AHT to read temp/humidity"""
        self._buf[0] = self.AHTX0_CMD_TRIGGER
        self._buf[1] = 0x33
        self._buf[2] = 0x00
        self._i2c.writeto(self._address, self._buf[0:3])
 
    def _wait_for_idle(self):
        """Wait until sensor can receive a new command"""
        while self.status & self.AHTX0_STATUS_BUSY:
            utime.sleep_ms(5)
 
    def _perform_measurement(self):
        """Trigger measurement and write result to buffer"""
        self._trigger_measurement()
        self._wait_for_idle()
        self._read_to_buffer()
 
 
class AHT20(AHT10):
    AHTX0_CMD_INITIALIZE = 0xBE  # Calibration command
```

然后就可以使用相关函数进行数据的读取了，按照下面代码的指示连接好传感器（一定一定一定不要接错，尤其是正负极，如果接错的话可能会直接把传感器烧坏）。如果能在控制台看到相关输出的数据就说明运行成功：

```python
from machine import Pin,SPI,I2C,PWM
from ahtx0 import AHT20
import time
 
# 初始化
i2c = I2C(1,scl = Pin(25),sda = Pin(26),freq = 400_000)
aht = AHT20(i2c)
 
def ahtxx():
    # 获取温度
    temp = aht.temperature
    # 获取湿度
    humi = aht.relative_humidity
 
    print("温度= %.2f ℃"%(temp))
    print("湿度= %.2f %s" %(humi,'%'))
    
    time.sleep(0.1)
    
def main():
    while True:
        ahtxx()
    
if __name__ == "__main__":
    main()
```

##### 温湿度+气压海拔传感器（AHT20+BMP280）

![](/images/posts/esp32-notes/aht20bmp280-1024x1020.png)

BMP280是一款由博世公司推出的高精度、小体积、超低功耗的数字气压传感器。它可以测量环境温度和大气压强，广泛应用于各种需要精确测量气压和温度的场合。BMP280的工作原理主要基于压阻式传感器技术。传感器内部有一个微小的压阻传感器和一个温度传感器。当气压或温度发生变化时，这些传感器会产生相应的电信号。

具体来说，压阻传感器由一系列微小的电阻组成，当气压变化时，这些电阻会随之发生变化。通过测量这些电阻的变化，BMP280可以精确地计算出气压的变化。同时，温度传感器用于测量环境温度，以便对气压测量进行温度补偿，从而提高测量精度。

市面上有一款将AHT20+BMP280集成在一起的传感器，咱们可以直接使用4个引脚来控制它们。

在前面AHT20的基础上，我们还需要添加一个BMP280的库（bmp280.py）：

```python
from micropython import const
from machine import I2C
 
class BMP280():
    
    def __init__(self, i2c,address = None):
        self.i2c = i2c
        self.address = address
        
        self.tb = bytearray(1)
        self.rb = bytearray(1)
        
        self.dig_T1 = self.get2Reg(0x88)
        self.dig_T2 = self.short(self.get2Reg(0x8A))
        self.dig_T3 = self.short(self.get2Reg(0x8C))
        self.dig_P1 = self.get2Reg(0x8E)
        self.dig_P2 = self.short(self.get2Reg(0x90))
        self.dig_P3 = self.short(self.get2Reg(0x92))
        self.dig_P4 = self.short(self.get2Reg(0x94))
        self.dig_P5 = self.short(self.get2Reg(0x96))
        self.dig_P6 = self.short(self.get2Reg(0x98))
        self.dig_P7 = self.short(self.get2Reg(0x9A))
        self.dig_P8 = self.short(self.get2Reg(0x9C))
        self.dig_P9 = self.short(self.get2Reg(0x9E))
        
        self.mode = 3
        self.osrs_p = 3
        self.osrs_t = 1
        self.setReg(0xF4, 0x2F)
        self.setReg(0xF5, 0x0C)
        self.filter = 3
        self.T = 0
        self.P = 0
        self.version = '1.0'
        
    def    short(self,    dat):
        if dat > 32767:
            return dat - 65536
        else:
            return dat
 
    # set reg
    def    setReg(self, reg, dat):
        self.tb[0] = dat
        self.i2c.writeto_mem(self.address, reg, self.tb)
 
    # get reg
    def    getReg(self, reg):
        self.i2c.readfrom_mem_into(self.address, reg, self.rb)
        return self.rb[0]
 
    # get two reg
    def    get2Reg(self, reg):
        return self.getReg(reg) + self.getReg(reg+1) * 256
 
    def get(self):
        adc_T = (self.getReg(0xFA)<<12) + (self.getReg(0xFB)<<4) + (self.getReg(0xFC)>>4)
        var1 = (((adc_T>>3)-(self.dig_T1<<1))*self.dig_T2)>>11
        var2 = (((((adc_T>>4)-self.dig_T1)*((adc_T>>4) - self.dig_T1))>>12)*self.dig_T3)>>14
        t = var1+var2
        self.T = ((t * 5 + 128) >> 8)/100
        var1 = (t>>1) - 64000
        var2 = (((var1>>2) * (var1>>2)) >> 11 ) * self.dig_P6
        var2 = var2 + ((var1*self.dig_P5)<<1)
        var2 = (var2>>2)+(self.dig_P4<<16)
        var1 = (((self.dig_P3*((var1>>2)*(var1>>2))>>13)>>3) + (((self.dig_P2) * var1)>>1))>>18
        var1 = ((32768+var1)*self.dig_P1)>>15
        if var1 == 0:
            return  # avoid exception caused by division by zero
        adc_P = (self.getReg(0xF7)<<12) + (self.getReg(0xF8)<<4) + (self.getReg(0xF9)>>4)
        p=((1048576-adc_P)-(var2>>12))*3125
        if p < 0x80000000:
            p = (p << 1) // var1
        else:
            p = (p // var1) * 2
        var1 = (self.dig_P9 * (((p>>3)*(p>>3))>>13))>>12
        var2 = (((p>>2)) * self.dig_P8)>>13
        self.P = p + ((var1 + var2 + self.dig_P7) >> 4)
        return [self.T, self.P]
 
    # get Temperature in Celsius
    def getTemp(self):
        self.get()
        return self.T
 
    # get Pressure in Pa
    def getPress(self):
        self.get()
        return self.P
 
    # Calculating absolute altitude
    def    getAltitude(self):
        return 44330*(1-(self.getPress()/101325)**(1/5.255))
 
    # sleep mode
    def poweroff(self):
        self.setReg(0xF4, 0)
 
    # normal mode
    def poweron(self):
        self.setReg(0xF4, 0x2F)
```

---

接着编写传感器运行的主程序：

```
# AHT20+BMP280温度+湿度+气压+海拔测量
from machine import Pin, I2C
from ahtx0 import AHT20
from bmp280 import BMP280
import time

i2c = I2C(0, scl=Pin(4), sda=Pin(5), freq=800_000)
bmp = BMP280(i2c, 0x77)
aht = AHT20(i2c, 0x38)

def display():
    try:
        """BMP280压力传感器信息"""
        temp = bmp.getTemp()
        press = bmp.getPress()
        altitude = bmp.getAltitude()
        print("===============================")
        print(f"压力: {press:.2f} Pa")
        print(f"BMP280温度: {temp:.2f} ℃")
        #海拔测量待验证，仅供参考
        #print(f"海拔: {altitude:.2f} m")
        """AHT20传感器信息"""
        humidity = aht.relative_humidity
        temperature = aht.temperature
        print(f"AHT20湿度: {humidity:.2f} %")
        print(f"AHT20温度: {temperature:.2f} ℃")
        print("===============================")
        
    except RuntimeError:
        print("传感器异常！")

def main():
    for i in i2c.scan():
        print("%#x" % i)
        
    while True:
        display()
        time.sleep(2)  

if __name__ == "__main__":
    main()
```

这样你就可以一次性获取温度、湿度、气压的值了。需要注意的是，虽然我们可以根据这几个数据来计算海拔高度，但这个海拔高度会随着各种环境因素的影响而影响，因此可能不准确，所以将其注释掉了。

##### 超声波测距（HC-SR04）

![](/images/posts/esp32-notes/hcsr04.png)

**HC-SR04**是一个超声波测距模块，通过发出超声波然后接收超声波，利用这个往返时间算出距离的模块。

首先该模块有四个口VCC、Gnd、Trig、Echo。在模块工作的时候，先要给Trig口拉高电平至少10us，然后Echo口会返回一个高电平信号，同时发射超声波。在HC-SR04接收到发出去反射回来的声波后，会给一个低电平。至此，一次检测就完成了。我们可以用定时器在发射声波时开始计数，等到接收声波后，停止计数。这样我们就有了时间。但是这个是往返时间，我们要除2，声音的传播速度时340m/s(这里暂时不考虑其他因素的影响)。有了时间和速度，路程就可以算出来了。接下来就是用代码实现这个过程了：

```python
import machine
from machine import Pin, I2C
import utime
#from ssd1306 import SSD1306_I2C

def getDistance(trigger, echo):
    # 将触发引脚拉低，然后暂停2微秒，以确保其未激活
    trigger.value(0)
    utime.sleep_us(2)
    # 在将触发器引脚拉低之前，将触发器引脚拉高5微秒
    # 这将从超声波传感器发送一个短脉冲，然后关闭该脉冲
    trigger.value(1)
    utime.sleep_us(5)
    trigger.value(0)
    # 创建一个while循环以检查回波引脚。
    # 如果没有收到回波脉冲，则更新变量，使其包含以微秒为单位的时间戳。
    while echo.value() == 0:
        signal_off = utime.ticks_us()
    # 若收到了回波则开始另一个while循环，不断将当前时间戳（以微秒为单位）存储到signal_on变量中直至回波结束
    while echo.value() == 1:
        signal_on = utime.ticks_us()
    # 计算从超声波脉冲发出到返回的总时间
    time_passed = signal_on - signal_off
    # 将总时间乘以声速(343.2m/s，即0.0343cm/μs)，该方程的乘积除以2，得到目标距离(厘米)。
    distance = (time_passed * 0.0343) / 2
    return distance

# 创建触发信号管脚对象
trigger = Pin(13, Pin.OUT)
# 创建返回信号管脚对象
echo = Pin(12, Pin.IN)

# 初始化OLED显示屏
#i2c = I2C(scl=Pin(4), sda=Pin(5))
#OLED= SSD1306_I2C(128, 64, i2c)

# 循环不断测量距离
while True:
    distance = getDistance(trigger, echo)
         
    # 打印距离到控制台
    print("Distance:", distance, "CM")
    
    # 将距离显示在OLED上
    #OLED.fill(0)
    #OLED.text("Distance: ", 0, 0)
    #OLED.text('{:.2f}'.format(distance), 70, 0)
    #OLED.text(" CM", 90, 0)
    #OLED.show()
   
    utime.sleep(0.08)
```

上述代码你可以将有关OLED屏幕的部分的代码注释给去除，这样的话就可以在OLED屏幕上实时显示距离了。需要注意的是，超声波测距传感器虽然可以让我们很轻松的通过代码精确测量大范围距离，但也存在些缺陷。由于是基于超声波测距的原理，传感器很容易受到环境温度（声速随温度变化）、测量角度（传感器有一个相对狭窄的测量束角，通常约为15度，这意味着它可能无法检测到与其不正对的物体）、噪声（其他声源可能干扰传感器的信号）、表面特性敏感性（某些类型的表面，如吸声材料，可能吸收超声波信号，导致测量不准确）等因素的影响。

##### 光照强度传感器（BH1750）

![](/images/posts/esp32-notes/bh1750-1024x763.png)

光照强度是一种物理术语，指单位面积上所接受可见光的光通量。简称照度 ，单位勒克斯（Lux或lx）。用于指示光照的强弱和物体表面积被照明程度的量。

BH1750是一种数字式光照强度传感器，其工作原理基于光敏电阻和数字转换器。传感器内部包含一个光敏电阻，其电阻值随着环境光照强度的变化而变化。BH1750还内置了一个模拟电路，主要用于将光敏电阻的变化转换为电压信号。此外，BH1750还内置了一个12位的模数转换器（ADC），用于将模拟电路输出的电压信号转换为数字信号。

接下来就是写代码环节。要使用BH1750,首先得装一个库（bh1750.py）:

```
"""
bh1750.py
Micropython BH1750 ambient light sensor driver.
"""

from utime import sleep_ms

class BH1750():
    """Micropython BH1750 ambient light sensor driver."""

    PWR_OFF = 0x00
    PWR_ON = 0x01
    RESET = 0x07

    # modes
    CONT_LOWRES = 0x13
    CONT_HIRES_1 = 0x10
    CONT_HIRES_2 = 0x11
    ONCE_HIRES_1 = 0x20
    ONCE_HIRES_2 = 0x21
    ONCE_LOWRES = 0x23

    # default addr=0x23 if addr pin floating or pulled to ground
    # addr=0x5c if addr pin pulled high
    def __init__(self, bus, addr=0x23):
        self.bus = bus
        self.addr = addr
        self.off()
        self.reset()

    def off(self):
        """Turn sensor off."""
        self.set_mode(self.PWR_OFF)

    def on(self):
        """Turn sensor on."""
        self.set_mode(self.PWR_ON)

    def reset(self):
        """Reset sensor, turn on first if required."""
        self.on()
        self.set_mode(self.RESET)

    def set_mode(self, mode):
        """Set sensor mode."""
        self.mode = mode
        self.bus.writeto(self.addr, bytes([self.mode]))

    def luminance(self, mode):
        """Sample luminance (in lux), using specified sensor mode."""
        # continuous modes
        if mode & 0x10 and mode != self.mode:
            self.set_mode(mode)
        # one shot modes
        if mode & 0x20:
            self.set_mode(mode)
        # earlier measurements return previous reading
        sleep_ms(24 if mode in (0x13, 0x23) else 180)
        data = self.bus.readfrom(self.addr, 2)
        factor = 2.0 if mode in (0x11, 0x21) else 1.0
        return (data[0]<<8 | data[1]) / (1.2 * factor)
```

接着调用这个库，写主程序（基本就是**导入库-定引脚-取读数**这个流程）：

```
"""
bh1750光强传感器
"""
from machine import Pin, SoftI2C
from bh1750 import BH1750
import time

# Initialize I2C communication (ESP32)
i2c = SoftI2C(scl=Pin(4), sda=Pin(5), freq=400000)

# Initialize I2C communication (ESP8266)
# i2c = SoftI2C(scl=Pin(4), sda=Pin(5), freq=400000)

# Create BH1750 object
light_sensor = BH1750(bus=i2c, addr=0x23)

while True:
    time.sleep(1)
    lux = light_sensor.luminance(BH1750.CONT_HIRES_1)
    print("Luminance: {:.2f} lux".format(lux))
```

##### 运动传感器（MPU6050）

![](/images/posts/esp32-notes/mpu6050.png)

MPU6050是一款集成3轴陀螺仪和3轴加速度计的6轴运动处理传感器，支持±2g至±16g的加速度量程和最高±2000°/秒的陀螺仪量程。它通过I2C接口与微控制器通信，可广泛应用于姿态检测和运动追踪等消费电子产品中。  
**加速度计**根据牛顿第二定律（F=ma）工作，通过测量物体受力来计算加速度。在MPU6050中，它用小块质量和弹簧来测加速度。物体加速时，质量块因惯性会移动，这移动被转成电信号。

**陀螺仪**则基于角动量守恒，测物体旋转速度来得知其姿态。当物体旋转时，振荡器产生与旋转速度相关的力，然后将这种力转化为电信号。

加速度计在静止时准确，可测倾斜角度，但运动时就不准了。而陀螺仪测的是旋转速度，积分后可得角度，静止时可能因噪音有误差，但运动时仍准确。也就是说，**加速度计具有静态稳定性，陀螺仪具有动态稳定性。**两者各有优缺点，结合使用，互补滤波，就能更稳定地知道物体的姿态了。

**引脚功能：**

- VCC：电源正极，为模块提供工作所需的电能。
- GND：电源负极，接地，确保电路的正常工作。
- SCL：I2C通信的时钟线，用于同步数据传输的速率。
- SDA：I2C通信的数据线，用于在主设备和从设备之间传输数据。
- INT：中断引脚，用于输出中断信号，当MPU6050检测到特定事件时，可以通过该引脚输出中断信号。
- AD0：地址选择引脚，用于设置I2C从设备的地址，控制MPU6050的I2C地址。
- XDA/XCL：用于外接电磁传感器，如磁力计，组成九轴传感器，提供额外的数据输入以提高数据稳定性。

接下来我们利用MPU6050和0.96英寸OLED屏幕，来整一个实时获取传感器各轴加速度的值和角速度的值。在写主程序之前，我们需要为ESP32加装一个可用于处理分析MPU6050传回数据的库(mpu6050.py)：

```python
import machine

class accel():
    def __init__(self, i2c, gr,addr=0x68):
        self.iic = i2c
        self.addr = addr
        # 陀螺仪量程设置：
        # 寄存器地址   写入数据    量程
        # 0x1b          0x00      ±250°/s
        # 0x1b          0x08      ±500°/s
        # 0x1b          0x10      ±1000°/s
        # 0x1b          0x18      ±2000°/s   
        # 加速度计量程设置：
        # 寄存器地址   写入数据    量程
        # 0x1c          0x00      ±2G
        # 0x1c          0x08      ±4G
        # 0x1c          0x10      ±8G
        # 0x1c          0x18      ±16G
        #设置加速度倍率
        self.temp = bytearray(2)
        self.temp[0]=0x1C
        self.temp[1]=8*gr
        self.iic.writeto(self.addr, self.temp)        
        #a = self.iic.readfrom_mem(self.addr, 0x1C, 1)
        #print(a)
        
        #向0x6B寄存器写入0
        #表示开始数据传输
        self.temp[0] = 0x6B  # Co=1, D/C#=0
        self.temp[1] = 0
        self.iic.writeto(self.addr, self.temp)
    def set_gyro_range(self, gr):
        """
        设置陀螺仪量程。
        参数gr：
            0: ±250°/s
            1: ±500°/s
            2: ±1000°/s
            3: ±2000°/s
        """
        self.temp = bytearray(2)
        self.temp[0] = 0x1B  # 陀螺仪量程设置寄存器地址
        if gr == 0:
            self.temp[1] = 0x00  # ±250°/s
        elif gr == 1:
            self.temp[1] = 0x08  # ±500°/s
        elif gr == 2:
            self.temp[1] = 0x10  # ±1000°/s
        elif gr == 3:
            self.temp[1] = 0x18  # ±2000°/s
        else:
            raise ValueError("Invalid gyro range value. Use 0, 1, 2, or 3.")
        self.iic.writeto(self.addr, self.temp)
        
    def get_raw_values(self):
        a = self.iic.readfrom_mem(self.addr, 0x3B, 14)
        return a

    def get_ints(self):
        b = self.get_raw_values()
        c = []
        for i in b:
            c.append(i)
        return c

    def bytes_toint(self, firstbyte, secondbyte):
        if not firstbyte & 0x80:
            return firstbyte << 8 | secondbyte
        return - (((firstbyte ^ 255) << 8) | (secondbyte ^ 255) + 1)

    def get_values(self):
        raw_ints = self.get_raw_values()
        vals = {}
        vals["AcX"] = self.bytes_toint(raw_ints[0], raw_ints[1])
        vals["AcY"] = self.bytes_toint(raw_ints[2], raw_ints[3])
        vals["AcZ"] = self.bytes_toint(raw_ints[4], raw_ints[5])
        vals["Tmp"] = self.bytes_toint(raw_ints[6], raw_ints[7]) / 340.00 + 36.53
        vals["GyX"] = self.bytes_toint(raw_ints[8], raw_ints[9])
        vals["GyY"] = self.bytes_toint(raw_ints[10], raw_ints[11])
        vals["GyZ"] = self.bytes_toint(raw_ints[12], raw_ints[13])
        return vals  # returned in range of Int16
        # -32768 to 32767

    def val_test(self):  # ONLY FOR TESTING! Also, fast reading sometimes crashes IIC
        from time import sleep
        while 1:
            print(self.get_values())
            sleep(0.05)
```

---

接下来就根据这个库来写一段代码，请根据下面的代码正确连接好OLED屏幕和MPU6050传感器：

```python
from machine import Pin, I2C
import utime
from ssd1306 import SSD1306_I2C
import mpu6050 

# 初始化I2C0接口，用于与OLED屏幕通信
sda = Pin(5)
scl = Pin(4)
i2c0 = I2C(0, sda=sda, scl=scl, freq=400000)
oled = SSD1306_I2C(128, 64, i2c0)

# 初始化I2C1接口，用于与MPU6050传感器通信（只用到了SCL和SDA引脚）
sda1 = Pin(27)
scl1 = Pin(14)
i2c1 = I2C(1, sda=sda1, scl=scl1, freq=400000)  # 注意修改了I2C的频率以匹配常见设置

# 设置MPU6050的加速度计和陀螺仪量程，并获取对应的灵敏度
accel_range_mapping = {0: 16384.0, 1: 8192.0, 2: 4096.0, 3: 2048.0}  # 加速度计量程映射
gyro_range_mapping = {0: 131.0, 1: 65.5, 2: 32.8, 3: 16.4}  # 陀螺仪量程映射

accel_range = 0  # 加速度计量程设置，可以根据需要修改
gyro_range = 0  # 陀螺仪量程设置，可以根据需要修改

mpu = mpu6050.accel(i2c1, accel_range)
mpu.set_gyro_range(gyro_range)

accel_scale = accel_range_mapping[accel_range]  # 根据量程获取加速度计灵敏度
gyro_scale = gyro_range_mapping[gyro_range]  # 根据量程获取陀螺仪灵敏度

# 无限循环，不断读取传感器数据并更新OLED屏幕显示
while True:
    values = mpu.get_values()  # 读取MPU6050的当前值
    
    # 计算加速度和角速度，使用动态获取的灵敏度进行转换
    acX = values['AcX'] / accel_scale
    acY = values['AcY'] / accel_scale
    acZ = values['AcZ'] / accel_scale
    gyX = values['GyX'] / gyro_scale
    gyY = values['GyY'] / gyro_scale
    gyZ = values['GyZ'] / gyro_scale
    
    # 清空OLED屏幕的内容
    oled.fill(0)
    
    # 在OLED屏幕上显示加速度计和陀螺仪的当前值
    oled.text("AccX: {:.2f}g".format(acX), 0, 0)
    oled.text("AccY: {:.2f}g".format(acY), 0, 10)
    oled.text("AccZ: {:.2f}g".format(acZ), 0, 20)
    oled.text("GyroX: {:.2f}dps".format(gyX), 0, 30)
    oled.text("GyroY: {:.2f}dps".format(gyY), 0, 40)
    oled.text("GyroZ: {:.2f}dps".format(gyZ), 0, 50)
    
    oled.show()
    utime.sleep(0.05)  # 延时以降低更新频率，可以根据需要调整
```

运行成功后OLED屏幕会实时显示3个方向上的加速度值和角速度值。需要注意的是，如果运动太过于剧烈而超过了传感器的量程，可能会导致程序报错。

很好，我们已经可以通过代码获取加速度和角速度的值了，那么我们不妨假设一下，如果将此类设备通过蓝牙与计算机连接，通过运动传感参数来控制计算机游戏中人物的行为，将会带来怎样全新的游戏体验呢？

想象一下，你手中握着一个小巧的设备，它不断捕捉着你的动作，并将这些数据实时传输给计算机。在游戏中，你不再仅仅是通过键盘和鼠标来操控角色，而是可以通过自己的实际动作来让角色做出各种复杂的动作和反应，增加玩家的沉浸感。

##### 颜色传感器（TCS3472）

![](/images/posts/esp32-notes/tcs3472-1006x1024.png)

TCS3672颜色传感器是一种用于测量环境颜色信息的设备。它通常包含一个或多个LED光源和一个光电探测器。当LED光源照射到物体表面时，物体会根据自身的颜色特性反射出特定波长的光线。这些反射光线随后被TCS3672中的光电探测器接收，并转换成电信号。这些电信号随后被送到内部的电路进行处理（放大、滤波、数字化等处理），通过特定的颜色识别算法（如RGB算法、HSV算法等）对物体的颜色进行准确识别和分析。

TCS3672颜色传感器可以输出RGB（红、绿、蓝）三个通道的颜色数据，同时还兼备了色温、色度、光照强度的测量。**色温**是光源颜色温度的一个指标，用来描述光源的冷暖特性。色温的单位是开尔文（K），低色温的光源（如2700K左右）被认为是暖色调，产生温暖、舒适的感觉，常用于家庭照明和营造温馨氛围。高色温的光源（如6500K以上）被认为是冷色调，产生清凉、明亮的感觉，常用于需要清晰视觉和专注的场合，如办公室和教室。

**色度**则用来描述光源或物体颜色的饱和度或纯度。在颜色学中，色度通常与色相和饱和度一起使用，用于区分和描述不同的颜色。色度高的颜色表示颜色更加纯净、饱和，而色度低的颜色则显得柔和、不饱和。

接下来我们就利用TCS3472传感器来获取测试物体的颜色，并尝试将这个颜色代入进一个RGB灯珠，也就是说，测试物体是什么颜色的，RGB灯珠就显示什么颜色。

首先，我们需要加装一个TCS3572的驱动库（tcs35725.py）：

```python
from machine import I2C
import time
import ustruct
 
const = lambda x:x
 
_COMMAND_BIT = const(0x80)
_REGISTER_ENABLE = const(0x00)
_REGISTER_ATIME = const(0x01)
_REGISTER_AILT = const(0x04)
_REGISTER_AIHT = const(0x06)
_REGISTER_ID = const(0x12)
_REGISTER_APERS = const(0x0c)
_REGISTER_CONTROL = const(0x0f)
_REGISTER_SENSORID = const(0x12)
_REGISTER_STATUS = const(0x13)
_REGISTER_CDATA = const(0x14)
_REGISTER_RDATA = const(0x16)
_REGISTER_GDATA = const(0x18)
_REGISTER_BDATA = const(0x1a)
_ENABLE_AIEN = const(0x10)
_ENABLE_WEN = const(0x08)
_ENABLE_AEN = const(0x02)
_ENABLE_PON = const(0x01)
 
_GAINS = (1, 4, 16, 60)
_CYCLES = (0, 1, 2, 3, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60)
 
class TCS34725:
    def __init__(self, i2c, address=None):
        self.i2c = i2c
        self.address = address
        self._active = False
        self.integration_time(2.4)
        sensor_id = self.i2c.scan()[0]
        if sensor_id not in (0x29,0x10):
            raise RuntimeError("wrong sensor id 0x{:x}".format(sensor_id))
 
    def _register8(self, register, value=None):
        register |= _COMMAND_BIT
        if value is None:
            return self.i2c.readfrom_mem(self.address, register, 1)[0]
        data = ustruct.pack('<B', value)
        self.i2c.writeto_mem(self.address, register, data)
 
    def _register16(self, register, value=None):
        register |= _COMMAND_BIT
        if value is None:
            data = self.i2c.readfrom_mem(self.address, register, 2)
            return ustruct.unpack('<H', data)[0]
        data = ustruct.pack('<H', value)
        self.i2c.writeto_mem(self.address, register, data)
 
    def active(self, value=None):
        if value is None:
            return self._active
        value = bool(value)
        if self._active == value:
            return
        self._active = value
        enable = self._register8(_REGISTER_ENABLE)
        if value:
            self._register8(_REGISTER_ENABLE, enable | _ENABLE_PON)
            time.sleep_ms(3)
            self._register8(_REGISTER_ENABLE,
                enable | _ENABLE_PON | _ENABLE_AEN)
        else:
            self._register8(_REGISTER_ENABLE,
                enable & ~(_ENABLE_PON | _ENABLE_AEN))
 
    def sensor_id(self):
        return self.i2c.scan()[0]
 
    def integration_time(self, value=None):
        if value is None:
            return self._integration_time
        value = min(614.4, max(2.4, value))
        cycles = int(value / 2.4)
        self._integration_time = cycles * 2.4
        return self._register8(_REGISTER_ATIME, 256 - cycles)
 
    def gain(self, value):
        if value is None:
            return _GAINS[self._register8(_REGISTER_CONTROL)]
        if value not in _GAINS:
            raise ValueError("gain must be 1, 4, 16 or 60")
        return self._register8(_REGISTER_CONTROL, _GAINS.index(value))
 
    def _valid(self):
        return bool(self._register8(_REGISTER_STATUS) & 0x01)
 
    def read(self, raw=False):
        was_active = self.active()
        self.active(True)
        while not self._valid():
            time.sleep_ms(int(self._integration_time + 0.9))
        data = tuple(self._register16(register) for register in (
            _REGISTER_RDATA,
            _REGISTER_GDATA,
            _REGISTER_BDATA,
            _REGISTER_CDATA,
        ))
        self.active(was_active)
        if raw:
            return data
        return self._temperature_and_lux(data)
 
    def _temperature_and_lux(self, data):
        r, g, b, c = data
        x = -0.14282 * r + 1.54924 * g + -0.95641 * b
        y = -0.32466 * r + 1.57837 * g + -0.73191 * b
        z = -0.68202 * r + 0.77073 * g +  0.56332 * b
        d = x + y + z
        n = (x / d - 0.3320) / (0.1858 - y / d)
        cct = 449.0 * n**3 + 3525.0 * n**2 + 6823.3 * n + 5520.33
        return cct, y
 
    def threshold(self, cycles=None, min_value=None, max_value=None):
        if cycles is None and min_value is None and max_value is None:
            min_value = self._register16(_REGISTER_AILT)
            max_value = self._register16(_REGISTER_AILT)
            if self._register8(_REGISTER_ENABLE) & _ENABLE_AIEN:
                cycles = _CYCLES[self._register8(_REGISTER_APERS) & 0x0f]
            else:
                cycles = -1
            return cycles, min_value, max_value
        if min_value is not None:
            self._register16(_REGISTER_AILT, min_value)
        if max_value is not None:
            self._register16(_REGISTER_AIHT, max_value)
        if cycles is not None:
            enable = self._register8(_REGISTER_ENABLE)
            if cycles == -1:
                self._register8(_REGISTER_ENABLE, enable & ~(_ENABLE_AIEN))
            else:
                self._register8(_REGISTER_ENABLE, enable | _ENABLE_AIEN)
                if cycles not in _CYCLES:
                    raise ValueError("invalid persistence cycles")
                self._register8(_REGISTER_APERS, _CYCLES.index(cycles))
 
    def interrupt(self, value=None):
        if value is None:
            return bool(self._register8(_REGISTER_STATUS) & _ENABLE_AIEN)
        if value:
            raise ValueError("interrupt can only be cleared")
        self.i2c.writeto(self.address, b'\xe6')
 
    def html_rgb(data):
        r, g, b, c = data
        red = pow((int((r/c) * 256) / 255), 2.5) * 255
        green = pow((int((g/c) * 256) / 255), 2.5) * 255
        blue = pow((int((b/c) * 256) / 255), 2.5) * 255
        return red, green, blue
 
    def html_hex(data):
        r, g, b = html_rgb(data)
        return "{0:02x}{1:02x}{2:02x}".format(int(r),int(g),int(b))
```

---

然后再写一段代码用于获取传感器数据：

```python
import neopixel
from machine import Pin, I2C
from tcs34725 import TCS34725  
import time

# 创建I2C对象
i2c = I2C(0, scl=Pin(5), sda=Pin(4), freq=400_000)

# 创建TCS34725颜色识别模块对象
tcs = TCS34725(i2c, 0x29)

# 初始化NeoPixel
LED_PIN = 48  
LED_NUM = 30  
LED = neopixel.NeoPixel(pin=Pin(LED_PIN), n=LED_NUM, timing=1)

# 创建RGB颜色计算函数
def get_rgb():
    try:
        red, green, blue, colour = tcs.read(True)  # 读取颜色值

        if colour != 0:  #
            Red = int((red / colour) * 255)  
            Green = int((green / colour) * 255)  
            Blue = int((blue / colour) * 255)  
            print('Red:', Red, 'Green:', Green, 'Blue:', Blue)
            return Red, Green, Blue  # 返回RGB值
        else:
            return 0, 0, 0
    except:
        print("数据异常！")
        raise

# 主程序入口
def main():
    while True:
        red, green, blue = get_rgb()
        for i in range(LED_NUM):
            LED[i] = (red, green, blue)
        LED.write()
        time.sleep(0.1)  

# 运行主程序
main()
```

运行程序后，你可以随意选取一个颜色鲜艳的物体，直接将其放置在传感器前进行识别。如果一切顺利，RGB灯珠将尝试展示与物体相对应的颜色。然而，需要注意的是，RGB灯珠所显示的颜色可能会比物体的实际颜色略淡且更亮，这是由于我们的代码仅获取了物体的RGB值，而忽略了色温、色度以及光照强度等其他因素。此外，由于这段代码的限制，RGB灯珠对物体颜色的响应并非完全实时，存在一定的延迟。

***Ps：其实写这段代码时我是利用*ESP32-S3-DevKitC-1*来测试的，*这块板子*上自带一个RGB灯珠，且被安排到了48号引脚，所以代码中的LED\_PIN 设置为了48。***

##### 电流/电压传感器（INA219）

![](/images/posts/esp32-notes/ina219-1024x900.png)

INA219是一款零漂移双向电流/功率监测计。该器件可以监测分流器电压降和总线电源电压，转换次数和滤波选项可以通过编程设定。可编程校准值与内部乘法器相结合，支持直接读取电流值（单位：安培A）。通过附加乘法寄存器可计算功率（单位：瓦W）。

INA219经常用作电子设备的状态检测，比如在必要的设备里植入这样的传感器，可以让我们方便的获取设备运行的信息（电流、功率等）。接下来我们尝试利用代码来获取电压与电流值。

在主程序开始之前，你需要在ESP32上下载好INA219的驱动库。

```
# The MIT License (MIT)
#
# Copyright (c) 2017 Dean Miller for Adafruit Industries
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
# THE SOFTWARE.
"""
`adafruit_ina219`
====================================================

CircuitPython/MicroPython driver for the INA219 current sensor.

* Author(s): Dean Miller
"""

from micropython import const
# from adafruit_bus_device.i2c_device import I2CDevice

__version__ = "0.0.0-auto.0"
__repo__ = "https://github.com/robert-hh/INA219.git"

# Bits
# pylint: disable=bad-whitespace
_READ = const(0x01)

# Config Register (R/W)
_REG_CONFIG = const(0x00)
_CONFIG_RESET = const(0x8000)  # Reset Bit

_CONFIG_BVOLTAGERANGE_MASK = const(0x2000)  # Bus Voltage Range Mask
_CONFIG_BVOLTAGERANGE_16V = const(0x0000)  # 0-16V Range
_CONFIG_BVOLTAGERANGE_32V = const(0x2000)  # 0-32V Range

_CONFIG_GAIN_MASK = const(0x1800)     # Gain Mask
_CONFIG_GAIN_1_40MV = const(0x0000)   # Gain 1, 40mV Range
_CONFIG_GAIN_2_80MV = const(0x0800)   # Gain 2, 80mV Range
_CONFIG_GAIN_4_160MV = const(0x1000)  # Gain 4, 160mV Range
_CONFIG_GAIN_8_320MV = const(0x1800)  # Gain 8, 320mV Range

_CONFIG_BADCRES_MASK = const(0x0780)   # Bus ADC Resolution Mask
_CONFIG_BADCRES_9BIT = const(0x0080)   # 9-bit bus res = 0..511
_CONFIG_BADCRES_10BIT = const(0x0100)  # 10-bit bus res = 0..1023
_CONFIG_BADCRES_11BIT = const(0x0200)  # 11-bit bus res = 0..2047
_CONFIG_BADCRES_12BIT = const(0x0400)  # 12-bit bus res = 0..4097

_CONFIG_SADCRES_MASK = const(0x0078)              # Shunt ADC Res. &  Avg. Mask
_CONFIG_SADCRES_9BIT_1S_84US = const(0x0000)      # 1 x 9-bit shunt sample
_CONFIG_SADCRES_10BIT_1S_148US = const(0x0008)    # 1 x 10-bit shunt sample
_CONFIG_SADCRES_11BIT_1S_276US = const(0x0010)    # 1 x 11-bit shunt sample
_CONFIG_SADCRES_12BIT_1S_532US = const(0x0018)    # 1 x 12-bit shunt sample
_CONFIG_SADCRES_12BIT_2S_1060US = const(0x0048)   # 2 x 12-bit sample average
_CONFIG_SADCRES_12BIT_4S_2130US = const(0x0050)   # 4 x 12-bit sample average
_CONFIG_SADCRES_12BIT_8S_4260US = const(0x0058)   # 8 x 12-bit sample average
_CONFIG_SADCRES_12BIT_16S_8510US = const(0x0060)  # 16 x 12-bit sample average
_CONFIG_SADCRES_12BIT_32S_17MS = const(0x0068)    # 32 x 12-bit sample average
_CONFIG_SADCRES_12BIT_64S_34MS = const(0x0070)    # 64 x 12-bit sample average
_CONFIG_SADCRES_12BIT_128S_69MS = const(0x0078)   # 128 x 12-bit sample average

_CONFIG_MODE_MASK = const(0x0007)  # Operating Mode Mask
_CONFIG_MODE_POWERDOWN = const(0x0000)
_CONFIG_MODE_SVOLT_TRIGGERED = const(0x0001)
_CONFIG_MODE_BVOLT_TRIGGERED = const(0x0002)
_CONFIG_MODE_SANDBVOLT_TRIGGERED = const(0x0003)
_CONFIG_MODE_ADCOFF = const(0x0004)
_CONFIG_MODE_SVOLT_CONTINUOUS = const(0x0005)
_CONFIG_MODE_BVOLT_CONTINUOUS = const(0x0006)
_CONFIG_MODE_SANDBVOLT_CONTINUOUS = const(0x0007)

# SHUNT VOLTAGE REGISTER (R)
_REG_SHUNTVOLTAGE = const(0x01)

# BUS VOLTAGE REGISTER (R)
_REG_BUSVOLTAGE = const(0x02)

# POWER REGISTER (R)
_REG_POWER = const(0x03)

# CURRENT REGISTER (R)
_REG_CURRENT = const(0x04)

# CALIBRATION REGISTER (R/W)
_REG_CALIBRATION = const(0x05)
# pylint: enable=bad-whitespace

def _to_signed(num):
    if num > 0x7FFF:
        num -= 0x10000
    return num

class INA219:
    """Driver for the INA219 current sensor"""
    def __init__(self, i2c_device, addr=0x40):
        self.i2c_device = i2c_device

        self.i2c_addr = addr
        self.buf = bytearray(2)
        # Multiplier in mA used to determine current from raw reading
        self._current_lsb = 0
        # Multiplier in W used to determine power from raw reading
        self._power_lsb = 0

        # Set chip to known config values to start
        self._cal_value = 4096
        self.set_calibration_32V_2A()

    def _write_register(self, reg, value):
        self.buf[0] = (value >> 8) & 0xFF
        self.buf[1] = value & 0xFF
        self.i2c_device.writeto_mem(self.i2c_addr, reg, self.buf)

    def _read_register(self, reg):
        self.i2c_device.readfrom_mem_into(self.i2c_addr, reg & 0xff, self.buf)
        value = (self.buf[0] << 8) | (self.buf[1])
        return value

    @property
    def shunt_voltage(self):
        """The shunt voltage (between V+ and V-) in Volts (so +-.327V)"""
        value = _to_signed(self._read_register(_REG_SHUNTVOLTAGE))
        # The least signficant bit is 10uV which is 0.00001 volts
        return value * 0.00001

    @property
    def bus_voltage(self):
        """The bus voltage (between V- and GND) in Volts"""
        raw_voltage = self._read_register(_REG_BUSVOLTAGE)

        # Shift to the right 3 to drop CNVR and OVF and multiply by LSB
        # Each least signficant bit is 4mV
        voltage_mv = _to_signed(raw_voltage >> 3) * 4
        return voltage_mv * 0.001

    @property
    def current(self):
        """The current through the shunt resistor in milliamps."""
        # Sometimes a sharp load will reset the INA219, which will
        # reset the cal register, meaning CURRENT and POWER will
        # not be available ... athis by always setting a cal
        # value even if it's an unfortunate extra step
        self._write_register(_REG_CALIBRATION, self._cal_value)

        # Now we can safely read the CURRENT register!
        raw_current = _to_signed(self._read_register(_REG_CURRENT))
        return raw_current * self._current_lsb

    def set_calibration_32V_2A(self):  # pylint: disable=invalid-name
        """Configures to INA219 to be able to measure up to 32V and 2A
            of current. Counter overflow occurs at 3.2A.

           ..note :: These calculations assume a 0.1 shunt ohm resistor"""
        # By default we use a pretty huge range for the input voltage,
        # which probably isn't the most appropriate choice for system
        # that don't use a lot of power.  But all of the calculations
        # are shown below if you want to change the settings.  You will
        # also need to change any relevant register settings, such as
        # setting the VBUS_MAX to 16V instead of 32V, etc.

        # VBUS_MAX = 32V    (Assumes 32V, can also be set to 16V)
        # VSHUNT_MAX = 0.32 (Assumes Gain 8, 320mV, can also be
        #                    0.16, 0.08, 0.04)
        # RSHUNT = 0.1      (Resistor value in ohms)

        # 1. Determine max possible current
        # MaxPossible_I = VSHUNT_MAX / RSHUNT
        # MaxPossible_I = 3.2A

        # 2. Determine max expected current
        # MaxExpected_I = 2.0A

        # 3. Calculate possible range of LSBs (Min = 15-bit, Max = 12-bit)
        # MinimumLSB = MaxExpected_I/32767
        # MinimumLSB = 0.000061              (61uA per bit)
        # MaximumLSB = MaxExpected_I/4096
        # MaximumLSB = 0,000488              (488uA per bit)

        # 4. Choose an LSB between the min and max values
        #    (Preferrably a roundish number close to MinLSB)
        # CurrentLSB = 0.0001 (100uA per bit)
        self._current_lsb = .1  # Current LSB = 100uA per bit

        # 5. Compute the calibration register
        # Cal = trunc (0.04096 / (Current_LSB * RSHUNT))
        # Cal = 4096 (0x1000)

        self._cal_value = 4096

        # 6. Calculate the power LSB
        # PowerLSB = 20 * CurrentLSB
        # PowerLSB = 0.002 (2mW per bit)
        self._power_lsb = .002  # Power LSB = 2mW per bit

        # 7. Compute the maximum current and shunt voltage values before
        #    overflow
        #
        # Max_Current = Current_LSB * 32767
        # Max_Current = 3.2767A before overflow
        #
        # If Max_Current > Max_Possible_I then
        #    Max_Current_Before_Overflow = MaxPossible_I
        # Else
        #    Max_Current_Before_Overflow = Max_Current
        # End If
        #
        # Max_ShuntVoltage = Max_Current_Before_Overflow * RSHUNT
        # Max_ShuntVoltage = 0.32V
        #
        # If Max_ShuntVoltage >= VSHUNT_MAX
        #    Max_ShuntVoltage_Before_Overflow = VSHUNT_MAX
        # Else
        #    Max_ShuntVoltage_Before_Overflow = Max_ShuntVoltage
        # End If

        # 8. Compute the Maximum Power
        # MaximumPower = Max_Current_Before_Overflow * VBUS_MAX
        # MaximumPower = 3.2 * 32V
        # MaximumPower = 102.4W

        # Set Calibration register to 'Cal' calculated above
        self._write_register(_REG_CALIBRATION, self._cal_value)

        # Set Config register to take into account the settings above
        config = (_CONFIG_BVOLTAGERANGE_32V |
                  _CONFIG_GAIN_8_320MV |
                  _CONFIG_BADCRES_12BIT |
                  _CONFIG_SADCRES_12BIT_1S_532US |
                  _CONFIG_MODE_SANDBVOLT_CONTINUOUS)
        self._write_register(_REG_CONFIG, config)

    def set_calibration_32V_1A(self):  # pylint: disable=invalid-name
        """Configures to INA219 to be able to measure up to 32V and 1A of
           current. Counter overflow occurs at 1.3A.

           .. note:: These calculations assume a 0.1 ohm shunt resistor."""
        # By default we use a pretty huge range for the input voltage,
        # which probably isn't the most appropriate choice for system
        # that don't use a lot of power.  But all of the calculations
        # are shown below if you want to change the settings.  You will
        # also need to change any relevant register settings, such as
        # setting the VBUS_MAX to 16V instead of 32V, etc.

        # VBUS_MAX = 32V    (Assumes 32V, can also be set to 16V)
        # VSHUNT_MAX = 0.32 (Assumes Gain 8, 320mV, can also be
        #                    0.16, 0.08, 0.04)
        # RSHUNT = 0.1      (Resistor value in ohms)

        # 1. Determine max possible current
        # MaxPossible_I = VSHUNT_MAX / RSHUNT
        # MaxPossible_I = 3.2A

        # 2. Determine max expected current
        # MaxExpected_I = 1.0A

        # 3. Calculate possible range of LSBs (Min = 15-bit, Max = 12-bit)
        # MinimumLSB = MaxExpected_I/32767
        # MinimumLSB = 0.0000305             (30.5uA per bit)
        # MaximumLSB = MaxExpected_I/4096
        # MaximumLSB = 0.000244              (244uA per bit)

        # 4. Choose an LSB between the min and max values
        #    (Preferrably a roundish number close to MinLSB)
        # CurrentLSB = 0.0000400 (40uA per bit)
        self._current_lsb = 0.04  # In milliamps

        # 5. Compute the calibration register
        # Cal = trunc (0.04096 / (Current_LSB * RSHUNT))
        # Cal = 10240 (0x2800)

        self._cal_value = 10240

        # 6. Calculate the power LSB
        # PowerLSB = 20 * CurrentLSB
        # PowerLSB = 0.0008 (800uW per bit)
        self._power_lsb = 0.0008

        # 7. Compute the maximum current and shunt voltage values before
        #    overflow
        #
        # Max_Current = Current_LSB * 32767
        # Max_Current = 1.31068A before overflow
        #
        # If Max_Current > Max_Possible_I then
        #    Max_Current_Before_Overflow = MaxPossible_I
        # Else
        #    Max_Current_Before_Overflow = Max_Current
        # End If
        #
        # ... In this case, we're good though since Max_Current is less than
        #     MaxPossible_I
        #
        # Max_ShuntVoltage = Max_Current_Before_Overflow * RSHUNT
        # Max_ShuntVoltage = 0.131068V
        #
        # If Max_ShuntVoltage >= VSHUNT_MAX
        #    Max_ShuntVoltage_Before_Overflow = VSHUNT_MAX
        # Else
        #    Max_ShuntVoltage_Before_Overflow = Max_ShuntVoltage
        # End If

        # 8. Compute the Maximum Power
        # MaximumPower = Max_Current_Before_Overflow * VBUS_MAX
        # MaximumPower = 1.31068 * 32V
        # MaximumPower = 41.94176W

        # Set Calibration register to 'Cal' calculated above
        self._write_register(_REG_CALIBRATION, self._cal_value)

        # Set Config register to take into account the settings above
        config = (_CONFIG_BVOLTAGERANGE_32V |
                  _CONFIG_GAIN_8_320MV |
                  _CONFIG_BADCRES_12BIT |
                  _CONFIG_SADCRES_12BIT_1S_532US |
                  _CONFIG_MODE_SANDBVOLT_CONTINUOUS)
        self._write_register(_REG_CONFIG, config)

    def set_calibration_16V_400mA(self):  # pylint: disable=invalid-name
        """Configures to INA219 to be able to measure up to 16V and 400mA of
           current. Counter overflow occurs at 1.6A.

           .. note:: These calculations assume a 0.1 ohm shunt resistor."""
        # Calibration which uses the highest precision for
        # current measurement (0.1mA), at the expense of
        # only supporting 16V at 400mA max.

        # VBUS_MAX = 16V
        # VSHUNT_MAX = 0.04          (Assumes Gain 1, 40mV)
        # RSHUNT = 0.1               (Resistor value in ohms)

        # 1. Determine max possible current
        # MaxPossible_I = VSHUNT_MAX / RSHUNT
        # MaxPossible_I = 0.4A

        # 2. Determine max expected current
        # MaxExpected_I = 0.4A

        # 3. Calculate possible range of LSBs (Min = 15-bit, Max = 12-bit)
        # MinimumLSB = MaxExpected_I/32767
        # MinimumLSB = 0.0000122              (12uA per bit)
        # MaximumLSB = MaxExpected_I/4096
        # MaximumLSB = 0.0000977              (98uA per bit)

        # 4. Choose an LSB between the min and max values
        #    (Preferrably a roundish number close to MinLSB)
        # CurrentLSB = 0.00005 (50uA per bit)
        self._current_lsb = 0.05  # in milliamps

        # 5. Compute the calibration register
        # Cal = trunc (0.04096 / (Current_LSB * RSHUNT))
        # Cal = 8192 (0x2000)

        self._cal_value = 8192

        # 6. Calculate the power LSB
        # PowerLSB = 20 * CurrentLSB
        # PowerLSB = 0.001 (1mW per bit)
        self._power_lsb = 0.001

        # 7. Compute the maximum current and shunt voltage values before
        #    overflow
        #
        # Max_Current = Current_LSB * 32767
        # Max_Current = 1.63835A before overflow
        #
        # If Max_Current > Max_Possible_I then
        #    Max_Current_Before_Overflow = MaxPossible_I
        # Else
        #    Max_Current_Before_Overflow = Max_Current
        # End If
        #
        # Max_Current_Before_Overflow = MaxPossible_I
        # Max_Current_Before_Overflow = 0.4
        #
        # Max_ShuntVoltage = Max_Current_Before_Overflow * RSHUNT
        # Max_ShuntVoltage = 0.04V
        #
        # If Max_ShuntVoltage >= VSHUNT_MAX
        #    Max_ShuntVoltage_Before_Overflow = VSHUNT_MAX
        # Else
        #    Max_ShuntVoltage_Before_Overflow = Max_ShuntVoltage
        # End If
        #
        # Max_ShuntVoltage_Before_Overflow = VSHUNT_MAX
        # Max_ShuntVoltage_Before_Overflow = 0.04V

        # 8. Compute the Maximum Power
        # MaximumPower = Max_Current_Before_Overflow * VBUS_MAX
        # MaximumPower = 0.4 * 16V
        # MaximumPower = 6.4W

        # Set Calibration register to 'Cal' calculated above
        self._write_register(_REG_CALIBRATION, self._cal_value)

        # Set Config register to take into account the settings above
        config = (_CONFIG_BVOLTAGERANGE_16V |
                  _CONFIG_GAIN_1_40MV |
                  _CONFIG_BADCRES_12BIT |
                  _CONFIG_SADCRES_12BIT_1S_532US |
                  _CONFIG_MODE_SANDBVOLT_CONTINUOUS)
        self._write_register(_REG_CONFIG, config)
```

---

接下来就是主程序：

```
# 从machine模块导入Pin和I2C类
from machine import Pin, I2C
import time
import ina219

# 初始化I2C总线，使用引脚5作为SCL（时钟线），引脚4作为SDA（数据线）
i = I2C(0, scl=Pin(5), sda=Pin(4))
print("I2C Bus Scan: ", i.scan(), "\n")

# 创建INA219传感器对象，连接到I2C总线
sensor = ina219.INA219(i)
# 设置校准参数，适用于16V和400mA的测量范围
sensor.set_calibration_16V_400mA()

while True:
    print("\n") 
    # 返回的电流单位为毫安
    print("Current       / mA: %8.3f" % (sensor.current))
    # 返回的分流电压单位为伏特
    print("Shunt voltage / mV: %8.3f" % (sensor.shunt_voltage * 1000))
    time.sleep(1)
```

在运行之前，你首先要搭建好测试电路。测试电路的搭建思路非常简单，你只需要将ina219的两个输入（测试）端口与待测负载并联，负载的电源既可以接入ESP32也可以接入一个其它电源（视情况而定）。按照如图的方式进行搭建，搭建完毕后就可以运行ESP32的代码了，如果能正常输出电压电流的值就说明没问题。

![](/images/posts/esp32-notes/ina219-1.png)
![](/images/posts/esp32-notes/ina2191.png)

在此需要补充说明一点，当你运行程序后，所获取的电压和电流值实际上是针对INA219上的一个大号R100贴片电阻（其阻值为0.1欧姆）进行测量的结果。为便于理解，我们可以将整个电路简化为左图所示，其中将ESP32部分移除，将INA219视为电阻R2，而负载则视为R1。这样，通过程序测量得到的数据，就相当于使用万用表直接在R2（即INA219内部的分流电阻）上进行测量所得到的结果。

然后你可以利用欧姆定律和测量值计算出R1（不过会有误差，误差来着电路与电源以及其它你猜不到的地方），或者利用公式计算出功率。

##### **摇杆传感器**

![](/images/posts/esp32-notes/ps2.png)

摇杆一般在航模、电玩、遥控车、云台等设备上应用广泛，为操作者提供了直观且灵活的控制方式。很多带有屏幕的设备，如游戏机、便携式控制台等，也经常使用摇杆作为菜单选择的输入控制，使用户能够方便快捷地浏览和选择选项。

双轴按键摇杆是其中一种常见类型，主要由两个电位器和一个按键开关精巧组合而成。这两个电位器随着摇杆在X轴和Y轴上的扭转角度，分别输出对应的电压值，从而实现对这两个方向上的精确控制。而在Z轴方向上，当用户按下摇杆时，则会触发一个轻触按键，通常用于确认选择或执行特定功能。  
简单来说，摇杆其实就是一组特殊的电位器与按键开关的集成体，通过结合特定的机械机构，形成了一种能够同时检测二维位移和按键触发的新型传感器。我们可以利用ADC接口读取X、Y轴电位器的模拟信号，并通过数字输入引脚监测按键状态，从而实现了对设备操作的精准控制。下面是一个简单的示例代码：

```python
import time
from machine import Pin, ADC

# 定义摇杆的引脚
ps2_x = ADC(Pin(15), atten=ADC.ATTN_11DB)
ps2_y = ADC(Pin(2), atten=ADC.ATTN_11DB)
ps2_button = Pin(4, Pin.IN, Pin.PULL_UP)

while True:
    print(f'x:{ps2_x.read()} y:{ps2_y.read()} z:{ps2_button.value()}')
    time.sleep(0.1)
```

你在具体实验的时候会发现，x、y的值即使你不动摇杆，它也会进行一定幅度的变化，这个问题我们在后面会提及。

##### 传感器总结篇

在传感器系列的章节中，我们充分利用了多种能够测量生活中常见物理量的传感器来进行实验。那么，你是否曾想过亲手制作一个传感器，并为它编写相应的代码呢？

要想自制传感器，第一步我们需要深入了解模数转换（Analog-to-Digital Conversion, ADC）的概念。但首先我们需要介绍两个名词：模拟信号和数字信号。

模拟信号就像是自然界中的声音、光线、温度等连续变化的量。想象一下你听音乐时，音乐的声音是连续不断变化的，有高有低，有强有弱，这种连续变化的信号就是模拟信号。模拟信号可以取任意值，它的变化是平滑的，没有固定的台阶或级别。在电子设备中，模拟信号也很常见，比如麦克风捕捉到的声音信号、摄像头捕捉到的图像信号等，这些都是模拟信号。模拟信号的优点是能够非常精细地描述现实世界的变化，但缺点是容易受到干扰，且在传输和处理过程中可能会失真。

数字信号则与模拟信号截然不同，它是离散的，只有有限个可能的取值。你可以把数字信号想象成一系列的开关，每个开关只有“开”和“关”两种状态，对应着数字信号中的“1”和“0”。在计算机和电子设备中，数字信号非常普遍，因为计算机只能理解和处理离散的数字信息。数字信号的优点是抗干扰能力强，传输和处理过程中不容易失真，而且便于存储和加密。但缺点是，由于数字信号是离散的，所以在描述连续变化的量时，可能会有一定的精度损失。不过，通过提高采样率和量化位数，数字信号也能够非常接近地模拟出连续变化的效果。

回顾之前的章节，你会发现那些传感器大多依赖于模数转换技术，将模拟信号转换为数字信号，从而使得ESP32能够轻松处理和分析这些数据。模数转换作为传感器与数字系统之间的关键纽带，确保了微控制器能够准确读取并响应来自传感器的信息。

幸运的是，ESP32内置了ADC引脚，这极大地简化了传感器与微控制器的连接过程。接下来，我们将通过一个简单的电位器实验来亲身体验模数转换的魅力。首先，你需要准备一个电位器，电位器一般有3个引脚（两个固定端和一个滑动端），利用面包板和杜邦线将电位器的两个固定端与ESP32的3.3v与GND连接，滑动端与D34连接，这样我们就搭建好了一个最简单的测试电路。

接下来是写代码：

```python
from machine import Pin, ADC, UART
import utime

# 初始化模拟输入
adc_pin = Pin(34, Pin.IN)  # GPIO34（ADC）
adc = ADC(adc_pin)
adc.atten(ADC.ATTN_11DB)  # 设置 ADC 衰减为 11dB，适用于 0-3.3V 输入范围
adc.width(ADC.WIDTH_12BIT)  # 设置 ADC 分辨率为 12 位

# 初始化串口（可选，用于调试。注意：如果使用 ESP32 的默认 UART（UART0），则可能需要通过其他方式查看输出）
uart = UART(2, baudrate=115200, tx=17, rx=16) 

def read_potentiometer():
    """读取电位器的 ADC 值"""
    return adc.read_u16()  # 读取 ADC 值，返回整数

def main():
    """主函数，用于持续读取并发送电位器的 ADC 值"""
    while True:
        adc_value = read_potentiometer()
        # 使用 UART 发送数据
        uart.write(f"ADC Value: {adc_value}\n".encode('utf-8'))
        # 使用print函数打印数据到串口
        print("ADC Value:", adc_value)
        utime.sleep(0.1)  # 延迟以避免输出过快

if __name__ == "__main__":
    main()
```

在代码运行的同时旋转电位器，你会发现控制台输出ADC数值的变化，这就是最简单的用硬件来控制软件参数的例子。但是，你可能会观察到，ADC数值的变化并不像我们想象的那样平滑。有时，即使你不旋转电位器，数值也会有一定的波动。这种现象主要是由于电子噪声、电源波动以及ADC转换过程中的量化误差等因素导致的。所以我们需要为其添加滤波，这个滤波可以是从硬件层面的（如为传感器电路加入合适的滤波电路），也可以是软件层面的（如使用滤波算法）。

#### 音频放大器（MAX98357A）

![](/images/posts/esp32-notes/max98357a.png)

MAX98357A 是一款由 Maxim Integrated（美信集成产品公司）生产的立体声D类音频功率放大器 IC。这款放大器专为便携式音频设备设计，如智能手机、平板电脑和笔记本电脑等，能够提供高效、高质量的音频放大功能。

音频放大器在音频系统中至关重要，它负责将微弱的音频信号放大到足以驱动扬声器或耳机的水平。这种放大不仅确保了声音的清晰度和响亮度，还满足了扬声器对功率的需求。 高质量的音频放大器能提升音质，减少失真和噪声，同时提供多种功能如音量控制、音调调节等，以满足不同环境和需求。在音频系统设计中，音频放大器是确保系统稳定性和性能的关键组件，它使得音频输出能够适应各种应用场景。

而关于音频就不得不介绍一下I2S了，I2S（Inter-IC Sound）是一种串行音频总线接口标准，用于连接数字音频设备，如音频编解码器、数字音频处理器（DSP）等。它主要用于传输未压缩的数字音频数据，如PCM（脉冲编码调制）数据。I2S接口由飞利浦半导体（现为恩智浦半导体）在1980年代开发，并逐渐成为数字音频领域的标准接口之一。  
接下来，我们通过代码来播放一首曲子。

```python
from machine import I2S  
from machine import Pin
 
 
"""
GPIO13 -- DIN
GPIO12 --- BCLK
GPIO14 -- LRC
GND -- GND
5V或3.3V -- VCC
"""
 
# 初始化引脚定义
sck_pin = Pin(12) # 串行时钟输出
ws_pin = Pin(14)  # 字时钟
sd_pin = Pin(13)  # 串行数据输出
 
 
"""
sck 是串行时钟线的引脚对象
ws 是单词选择行的引脚对象
sd 是串行数据线的引脚对象
mode 指定接收或发送
bits 指定样本大小（位），16 或 32
format 指定通道格式，STEREO（左右声道） 或 MONO(单声道)
rate 指定音频采样率（样本/秒）
ibuf 指定内部缓冲区长度（字节）
"""
 
# 初始化i2s
audio_out = I2S(1, sck=sck_pin, ws=ws_pin, sd=sd_pin, mode=I2S.TX, bits=16, format=I2S.MONO, rate=16000, ibuf=20000)
 
 
wavtempfile = "test.wav"
with open(wavtempfile,'rb') as f:
 
    # 跳过文件的开头的44个字节，直到数据段的第1个字节
    pos = f.seek(44) 
 
    # 用于减少while循环中堆分配的内存视图
    wav_samples = bytearray(1024)
    wav_samples_mv = memoryview(wav_samples)
     
    print("开始播放音频...")
    
    #并将其写入I2S DAC
    while True:
        try:
            num_read = f.readinto(wav_samples_mv)
            
            # WAV文件结束
            if num_read == 0: 
                break
 
            # 直到所有样本都写入I2S外围设备
            num_written = 0
            while num_written < num_read:
                num_written += audio_out.write(wav_samples_mv[num_written:num_read])
                
        except Exception as ret:
            print("产生异常...", ret)
            break
```

需要注意的是，WAV音频文件通常体积较大，尤其是较长的音频文件。ESP32的存储空间有限，可能无法容纳完整的音频文件，除非考虑使用SD卡进行扩展存储。不过，还有一种方法是通过访问音频文件的URL来获取音频数据，从而避免直接存储大文件的问题。

```python
from machine import I2S
from machine import Pin
import urequests
import network
import time
 
 
"""
GPIO12 --- BCLK
GPIO14 --- LRC
GPIO13 --- DIN
GND    --- GND
5V     --- VCC
"""
 
# 初始化引脚定义
sck_pin = Pin(12) # 串行时钟输出
ws_pin  = Pin(14)  # 字时钟
sd_pin  = Pin(13)  # 串行数据输出
 
 
"""
sck 是串行时钟线的引脚对象
ws  是单词选择行的引脚对象
sd  是串行数据线的引脚对象
mode 指定接收或发送
bits 指定样本大小（位），16 或 32
format 指定通道格式，STEREO（左右声道） 或 MONO(单声道)
rate 指定音频采样率（样本/秒），数值越大播放速度越快
ibuf 指定内部缓冲区长度（字节）
"""
 
# 初始化i2s
audio_out = I2S(1, sck=sck_pin, ws=ws_pin, sd=sd_pin, mode=I2S.TX, bits=16, format=I2S.MONO, rate=44100, ibuf=20000)
 
# 连接网络函数
def do_connect():
    """链接WIFI网络"""
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    if not wlan.isconnected():
        print('connecting to network...')
        wlan.connect('GAP', 'nahidaaa')  # WIFI名字密码
        i = 1
        while not wlan.isconnected():
            print("正在链接中...{}".format(i))
            i += 1
            time.sleep(1)
    print('network config:', wlan.ifconfig())
 
 
# 连接网络
do_connect()
 
# 注意不要用https,要用http
response = urequests.get("http://............../xxxx.wav", stream=True)
response.raw.read(44)  # 跳过开头的44字节音频文件头信息
 
print("开始播放音频...")
 
#并将其写入I2S DAC
while True:
    try:
        content_byte = response.raw.read(1024)  # 每次读取1024个字节
        
        # 判断WAV文件是否结束
        if len(content_byte) == 0: 
            break
        # 调用I2S对象播放音频
        audio_out.write(content_byte) 
            
    except Exception as ret:
        print("程序产生异常...", ret)
        audio_out.deinit()
        break
 
audio_out.deinit()  # 音乐播放完毕后，退出
```

*注：通过上述代码播放出的音乐效果并不是很理想*

***未完待续......***

#### 步进电机

步进电机，又称脉冲电机，基于电磁铁原理，是一种可自由回转且通过气隙磁导变化产生电磁转矩的装置。它能够将电脉冲信号转化为角位移或线位移，但不能直接连接到直流或交流电源上，需要专用的驱动电路。**简单来说，步进电机能旋转特定的角度。**

步进电机的原理大概就是通过脉冲信号控制电机内线圈的磁性，由于其特殊的结构，可以驱动转子旋转一定角度。具体原理可以去搜索相关科普视频。

![](/images/posts/esp32-notes/bjdj.png)

在本节示例中，我选用型号为28BYJ-48的步进电机与相关驱动电路（ULN2003芯片）进行试验。我们可以通过电机的型号获取到以下参数：该步进电机的直径为28mm，B代表步进电机，Y代表永磁，J代表带减速箱，48表示可以以四拍和八拍运行。同时，这款步进电机内部的齿轮比为1:64，在全步进模式下，转一圈需要64步，即每步转动5.625°；在半步进模式下，转一圈需要128步，即每步转动2.8125°。因为这个是带减速齿轮的，所以最后在输出轴上的步进角是5.625/64=0.08789度（因为减速比是1/64）。

相数，指的是产生对N,S极磁场的激励线圈对数；拍数，指的是完成一个磁场周期变化所需的脉冲数或导电状态，或者指步进电机转过一个齿距角所需脉冲数。  
步进电机有一个技术参数：空载启动频率，即步进电机在空载情况下能够正常启动的脉冲频率，如果脉冲频率高于该值，电机不能正常启动，可能发生丢步或堵转。在有负载的情况下，启动频率应更低。如果要使电机达到高速转动，脉冲频率应该有加速过程，即启动频率较低，然后按一定加速度升到所希望的高频（电机转速从低速升到高速）。

![](/images/posts/esp32-notes/bjdj2.png)

简单解释一下步进电机的原理：如图所示，ABCD为定子，上面绕有线圈，为四相，与之相对应的对面四个定子上面也有线圈，相对应的两个定子之间线圈是相互连接形成一个绕组。

单四拍模式：当B相导通，对0的吸引力最大。接下来B断开，C导通，1和C相之间夹角最小被吸引过去，被吸引过去之前2和D相之间夹角为1和C相之间夹角的2倍，1被吸引到C以后，2和D之间最近，此时0和A之间的夹角为2和D之间的2倍，接下来C断开，D导通，2被吸引到D，此时0距离A最近D断开A导通，0被吸引到A相，至此一个周期完成。

双拍工作模式：每次给两个线圈通电，通过改变通电的线圈从而使步进电机转动 五线四相步进电机：在双拍工作方式下，线圈的通电方式依次是：AB、BC、CD、DA 即单拍工作方式下，线圈的通电方式依次是：A、B、C、D

单双拍（八拍工作方式）：单双拍工作方式就是单拍工作方式和双拍工作方式交替进行。 五线四相步进电机：A、AB、B、BC、C、CD、D、DA。

![](/images/posts/esp32-notes/uln2003x.png)

驱动电路：ULN2003X芯片是一种高耐压、大电流驱动阵列，由7个NPN达林顿管组成。每个达林顿管都能承受高达500mA的电流，并具有内置基极电阻，适合与TTL和CMOS电路接口。当输入为高电平时，输出为低电平，反之则输出高电平，因此它可用于反向驱动继电器等负载。此外，ULN2003X芯片还具有内部抑制二极管，可以提供反向保护，使系统更加稳定可靠。**该芯片被广泛应用于各种需要高电压和大电流输出的场合，如步进电机驱动、继电器驱动、LED显示驱动等。**特别是在步进电机驱动中，ULN2003X芯片能够依次对步进电机的各个相位施加电流，从而实现对步进电机的精确控制。

准备好上面的东西后，我们就可以开始写代码了。将ESP32与驱动电路连接（15-IN1,2-IN2,4-IN3,16-IN4,VIN-5v正极,GND-5v负极），再将28BYJ-48步进电机与驱动电路连接，然后将下面的代码上传至ESP32运行：

```python
from machine import Pin
import time

# 电机驱动引脚
a = Pin(15, Pin.OUT)
b = Pin(2, Pin.OUT)
c = Pin(4, Pin.OUT)
d = Pin(16, Pin.OUT)

# 初始化引脚状态
a.value(0)
b.value(0)
c.value(0)
d.value(0)

# 延时时间（毫秒）
delay_time_ms = 2

# 定义电机步序
steps = [
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1]
]

# 电机一圈的步数
full_steps = 512

# 计算角度对应的步数
angle = 30 
steps_for_angle = int((angle / 360) * full_steps)

# 旋转电机特定角度
for _ in range(steps_for_angle):
    for step in steps:
        a.value(step[0])
        b.value(step[1])
        c.value(step[2])
        d.value(step[3])
        time.sleep_ms(delay_time_ms)

# 停止电机，将所有引脚设置为低电平
a.value(0)
b.value(0)
c.value(0)
d.value(0)
```

通过上述代码，你可以获取这些重要的参数：delay\_time\_ms 代表延迟时间，指的是步进电机“走了一步”后“走下一步”的时间间隔。这个参数经过我的测试，设置在2~6ms较佳，超过这个范围，电机可能会出现大幅度振动，或者不动。同时这个延迟时间也决定了电机的转速，间隔越长，转的越慢。full\_steps 代表电机转动一圈的步数，这边设置为512最佳，设置为其它的可能会出现多转或少转的情况（针对这个示例）。angle 代表需要旋转的角度，你可以自定义它的参数。

需要注意的是，因为full\_step设置为了512，代表电机一圈被细分为512个基本步数(这个参数因电机类型、驱动电路、算法而异)，因此它的精度会很高，但是，它的转矩就会变小，不适合承受大质量的负载。

#### **矩阵键盘**

众所周知，我们可以通过按键开关等电子元件来作为单片机的输入设备，但如果一个按键占用单片机的一个引脚的话，对于需要大量按键的应用场景，单片机的引脚资源将很快耗尽。为了解决这一问题，矩阵键盘应运而生。下面是4x4矩阵键盘的原理图：

![](/images/posts/esp32-notes/keyboard.png)

矩阵键盘通过行列扫描的方式，极大地减少了所需引脚的数量。以4x4矩阵键盘为例，仅需8个引脚（4行4列）即可实现16个按键的输入。我们可以利用微控制器的GPIO引脚，通过行输出高电平、列检测高电平的方式，来判断哪个按键被按下。代码如下：

```python
from machine import Pin
import time

# 创建行的对象
row1 = Pin(7, Pin.OUT)
row2 = Pin(6, Pin.OUT)
row3 = Pin(5, Pin.OUT)
row4 = Pin(4, Pin.OUT)
row_list = [row1, row2, row3, row4]  # 将创建的行对象放到list里面

# 创建列的对象
col1 = Pin(15, Pin.IN, Pin.PULL_DOWN)
col2 = Pin(16, Pin.IN, Pin.PULL_DOWN)
col3 = Pin(17, Pin.IN, Pin.PULL_DOWN)
col4 = Pin(18, Pin.IN, Pin.PULL_DOWN)
col_list = [col1, col2, col3, col4]  # 将创建的列对象放到list里面

# 键盘矩阵表，后面用来判断按下的是哪个按钮
names = [
    ["1", "2", "3", "A"],
    ["4", "5", "6", "B"],
    ["7", "8", "9", "C"],
    ["*", "0", "#", "D"]
]

while True:
    for i, row in enumerate(row_list):  # 遍历序号和对应的值 # 目的：只让某一行通电，其他的行都是0
        for temp in row_list:  # 遍历行对象
            temp.value(0)  # 给每一个行对象赋值
        row.value(1)
        time.sleep_ms(10)  # 键盘通电后，延迟一小会
        for j, col in enumerate(col_list):  # 遍历序号和对应的值
            if col.value() == 1:   # 给每一个列对象赋值
                print("按键: {} 被按下".format(names[i][j]))
        # print(row1.value(), row2.value(), row3.value(), row4.value())  # 打印出每行的值
        # print(col1.value(), col2.value(), col3.value(), col4.value())  # 打印出每列的值
        # print("-" * 30)
                
    time.sleep(0.1)
```

具体原理如下：  
首先通过创建四个行引脚和四个列引脚，行引脚配置为输出模式，用于发送电信号；列引脚配置为输入模式，并启用下拉电阻，确保在没有按键按下时，列引脚保持低电平状态。同时，定义了一个二维列表names，用于存储键盘矩阵中每个按键对应的字符。  
接下来我们只需要逐行扫描键盘矩阵。对于每一行，它首先将所有行引脚设置为低电平，确保只有当前行发送高电平信号。然后，将当前行引脚设置为高电平，并稍作延迟，以稳定信号。接着，代码遍历所有列引脚，检查是否有列引脚接收到了高电平信号。如果检测到某列引脚为高电平，说明该列对应的按键被按下，此时根据当前行和列的索引，在names列表中查找并打印出对应的按键字符。

完成一轮行扫描后，代码会稍作延迟，然后开始下一轮扫描。这样，通过不断循环扫描键盘矩阵，程序能够实时检测并响应按键操作。

#### **扩充IO**

![](/images/posts/esp32-notes/5733d66703f66251d34c1921fe5a881b_720-526x1024.jpg)

ESP32的引脚资源颇为有限，在实际应用中，时常会面临需要占用大量引脚来连接某一特定模块的困境。不过值得庆幸的是，我们可借助另一类模块来实现引脚扩充，它便是PCF8574。

PCF8574一种常见的I/O扩展芯片，用于将微控制器的少量GPIO引脚扩展为更多的GPIO接口。它采用I2C总线（串行通信协议）进行与微处理器的通信。PCF8574芯片具有8个并行输入/输出引脚（即I/O口），可以根据需要配置为输入或输出模式。每个I/O口可以提供高电平或低电平的逻辑状态，用于控制外部设备或接口。

PCF8574 借助 I²C 总线协议，靠 SDA 和 SCL 这两根线与微控制器“交流”。它内部有 8 个能双向工作的 I/O 寄存器，用来存储数据并实现控制。硬件方面，它设置了三个地址引脚，能让多个设备一起使用。当它作为输出端时，寄存器的状态会直接决定引脚的电平高低；作为输入端时，会把引脚的电平情况读取并存到寄存器里，方便微控制器读取。另外，它采用开漏输出结构，当外接上拉电阻才能输出高电平，最终实现为微控制器扩展 I/O 资源的目的。

![](/images/posts/esp32-notes/image-5.png)

接下来，我们来尝试使用这个模块来扩充ESP32的引脚。首先你需要载入一个[PCF8574的驱动库](https://github.com/mcauser/micropython-pcf8574/)：

pcf8574.py

```
# SPDX-FileCopyrightText: 2019 Mike Causer <https://github.com/mcauser>
# SPDX-License-Identifier: MIT

"""
MicroPython PCF8574 8-Bit I2C I/O Expander with Interrupt
https://github.com/mcauser/micropython-pcf8574
"""

__version__ = "1.1.0"

class PCF8574:
    def __init__(self, i2c, address=0x20):
        self._i2c = i2c
        self._address = address
        self._port = bytearray(1)

    def check(self):
        if self._i2c.scan().count(self._address) == 0:
            raise OSError(f"PCF8574 not found at I2C address {self._address:#x}")
        return True

    @property
    def port(self):
        self._read()
        return self._port[0]

    @port.setter
    def port(self, value):
        self._port[0] = value & 0xFF
        self._write()

    def pin(self, pin, value=None):
        pin = self._validate_pin(pin)
        if value is None:
            self._read()
            return (self._port[0] >> pin) & 1
        if value:
            self._port[0] |= 1 << (pin)
        else:
            self._port[0] &= ~(1 << (pin))
        self._write()

    def toggle(self, pin):
        pin = self._validate_pin(pin)
        self._port[0] ^= 1 << (pin)
        self._write()

    def _validate_pin(self, pin):
        # pin valid range 0..7
        if not 0 <= pin <= 7:
            raise ValueError(f"Invalid pin {pin}. Use 0-7.")
        return pin

    def _read(self):
        self._i2c.readfrom_into(self._address, self._port)

    def _write(self):
        self._i2c.writeto(self._address, self._port)
```

接着，我们根据这个驱动库的使用方法写一个主程序用于验证模块的功能。

***未完待续……***

#### 扩充内存

![](/images/posts/esp32-notes/sd.png)

如果要在ESP32上运行一个小网站的话，其内置内存可能不足以支撑需求。不过，ESP32具备良好的扩展能力，允许我们通过外接SD卡或TF卡来扩充其存储空间，从而满足网站运行的需求。

SD卡（Secure Digital Memory Card）和TF卡（又称为microSD卡）都是广泛使用的便携式存储介质，它们主要用于扩展电子设备（如智能手机、平板电脑、数码相机、音乐播放器以及某些嵌入式设备等）的存储容量。

对于ESP32来说，要为其扩容，就得增加一个Micro SD读取模块，如左图所示，这是市面上常用的读卡模块。这个模块有GND、VCC、MISO、MOSI、SCK、CS六个引脚，通过这些引脚，我们可以将SD卡与ESP32进行通信。

第一步，先在ESP32上下载好驱动库（sdcard.py）:

```
"""
MicroPython driver for SD cards using SPI bus.

Requires an SPI bus and a CS pin.  Provides readblocks and writeblocks
methods so the device can be mounted as a filesystem.

Example usage on pyboard:

    import pyb, sdcard, os
    sd = sdcard.SDCard(pyb.SPI(1), pyb.Pin.board.X5)
    pyb.mount(sd, '/sd2')
    os.listdir('/')

Example usage on ESP8266:

    import machine, sdcard, os
    sd = sdcard.SDCard(machine.SPI(1), machine.Pin(15))
    os.mount(sd, '/sd')
    os.listdir('/')

"""

from micropython import const
import time

_CMD_TIMEOUT = const(100)

_R1_IDLE_STATE = const(1 << 0)
R1_ERASE_RESET = const(1 << 1)
_R1_ILLEGAL_COMMAND = const(1 << 2)
R1_COM_CRC_ERROR = const(1 << 3)
R1_ERASE_SEQUENCE_ERROR = const(1 << 4)
R1_ADDRESS_ERROR = const(1 << 5)
R1_PARAMETER_ERROR = const(1 << 6)
_TOKEN_CMD25 = const(0xFC)
_TOKEN_STOP_TRAN = const(0xFD)
_TOKEN_DATA = const(0xFE)

class SDCard:
    def __init__(self, spi, cs, baudrate=1320000):
        self.spi = spi
        self.cs = cs

        self.cmdbuf = bytearray(6)
        self.dummybuf = bytearray(512)
        self.tokenbuf = bytearray(1)
        for i in range(512):
            self.dummybuf[i] = 0xFF
        self.dummybuf_memoryview = memoryview(self.dummybuf)

        # initialise the card
        self.init_card(baudrate)

    def init_spi(self, baudrate):
        try:
            master = self.spi.MASTER
        except AttributeError:
            # on ESP8266
            self.spi.init(baudrate=baudrate, phase=0, polarity=0)
        else:
            # on pyboard
            self.spi.init(master, baudrate=baudrate, phase=0, polarity=0)

    def init_card(self, baudrate):

        # init CS pin
        self.cs.init(self.cs.OUT, value=1)

        # init SPI bus; use low data rate for initialisation
        self.init_spi(100000)

        # clock card at least 100 cycles with cs high
        for i in range(16):
            self.spi.write(b"\xff")

        # CMD0: init card; should return _R1_IDLE_STATE (allow 5 attempts)
        for _ in range(5):
            if self.cmd(0, 0, 0x95) == _R1_IDLE_STATE:
                break
        else:
            raise OSError("no SD card")

        # CMD8: determine card version
        r = self.cmd(8, 0x01AA, 0x87, 4)
        if r == _R1_IDLE_STATE:
            self.init_card_v2()
        elif r == (_R1_IDLE_STATE | _R1_ILLEGAL_COMMAND):
            self.init_card_v1()
        else:
            raise OSError("couldn't determine SD card version")

        # get the number of sectors
        # CMD9: response R2 (R1 byte + 16-byte block read)
        if self.cmd(9, 0, 0, 0, False) != 0:
            raise OSError("no response from SD card")
        csd = bytearray(16)
        self.readinto(csd)
        if csd[0] & 0xC0 == 0x40:  # CSD version 2.0
            self.sectors = ((csd[8] << 8 | csd[9]) + 1) * 1024
        elif csd[0] & 0xC0 == 0x00:  # CSD version 1.0 (old, <=2GB)
            c_size = (csd[6] & 0b11) << 10 | csd[7] << 2 | csd[8] >> 6
            c_size_mult = (csd[9] & 0b11) << 1 | csd[10] >> 7
            read_bl_len = csd[5] & 0b1111
            capacity = (c_size + 1) * (2 ** (c_size_mult + 2)) * (2**read_bl_len)
            self.sectors = capacity // 512
        else:
            raise OSError("SD card CSD format not supported")
        # print('sectors', self.sectors)

        # CMD16: set block length to 512 bytes
        if self.cmd(16, 512, 0) != 0:
            raise OSError("can't set 512 block size")

        # set to high data rate now that it's initialised
        self.init_spi(baudrate)

    def init_card_v1(self):
        for i in range(_CMD_TIMEOUT):
            self.cmd(55, 0, 0)
            if self.cmd(41, 0, 0) == 0:
                # SDSC card, uses byte addressing in read/write/erase commands
                self.cdv = 512
                # print("[SDCard] v1 card")
                return
        raise OSError("timeout waiting for v1 card")

    def init_card_v2(self):
        for i in range(_CMD_TIMEOUT):
            time.sleep_ms(50)
            self.cmd(58, 0, 0, 4)
            self.cmd(55, 0, 0)
            if self.cmd(41, 0x40000000, 0) == 0:
                self.cmd(58, 0, 0, -4)  # 4-byte response, negative means keep the first byte
                ocr = self.tokenbuf[0]  # get first byte of response, which is OCR
                if not ocr & 0x40:
                    # SDSC card, uses byte addressing in read/write/erase commands
                    self.cdv = 512
                else:
                    # SDHC/SDXC card, uses block addressing in read/write/erase commands
                    self.cdv = 1
                # print("[SDCard] v2 card")
                return
        raise OSError("timeout waiting for v2 card")

    def cmd(self, cmd, arg, crc, final=0, release=True, skip1=False):
        self.cs(0)

        # create and send the command
        buf = self.cmdbuf
        buf[0] = 0x40 | cmd
        buf[1] = arg >> 24
        buf[2] = arg >> 16
        buf[3] = arg >> 8
        buf[4] = arg
        buf[5] = crc
        self.spi.write(buf)

        if skip1:
            self.spi.readinto(self.tokenbuf, 0xFF)

        # wait for the response (response[7] == 0)
        for i in range(_CMD_TIMEOUT):
            self.spi.readinto(self.tokenbuf, 0xFF)
            response = self.tokenbuf[0]
            if not (response & 0x80):
                # this could be a big-endian integer that we are getting here
                # if final<0 then store the first byte to tokenbuf and discard the rest
                if final < 0:
                    self.spi.readinto(self.tokenbuf, 0xFF)
                    final = -1 - final
                for j in range(final):
                    self.spi.write(b"\xff")
                if release:
                    self.cs(1)
                    self.spi.write(b"\xff")
                return response

        # timeout
        self.cs(1)
        self.spi.write(b"\xff")
        return -1

    def readinto(self, buf):
        self.cs(0)

        # read until start byte (0xff)
        for i in range(_CMD_TIMEOUT):
            self.spi.readinto(self.tokenbuf, 0xFF)
            if self.tokenbuf[0] == _TOKEN_DATA:
                break
            time.sleep_ms(1)
        else:
            self.cs(1)
            raise OSError("timeout waiting for response")

        # read data
        mv = self.dummybuf_memoryview
        if len(buf) != len(mv):
            mv = mv[: len(buf)]
        self.spi.write_readinto(mv, buf)

        # read checksum
        self.spi.write(b"\xff")
        self.spi.write(b"\xff")

        self.cs(1)
        self.spi.write(b"\xff")

    def write(self, token, buf):
        self.cs(0)

        # send: start of block, data, checksum
        self.spi.read(1, token)
        self.spi.write(buf)
        self.spi.write(b"\xff")
        self.spi.write(b"\xff")

        # check the response
        if (self.spi.read(1, 0xFF)[0] & 0x1F) != 0x05:
            self.cs(1)
            self.spi.write(b"\xff")
            return

        # wait for write to finish
        while self.spi.read(1, 0xFF)[0] == 0:
            pass

        self.cs(1)
        self.spi.write(b"\xff")

    def write_token(self, token):
        self.cs(0)
        self.spi.read(1, token)
        self.spi.write(b"\xff")
        # wait for write to finish
        while self.spi.read(1, 0xFF)[0] == 0x00:
            pass

        self.cs(1)
        self.spi.write(b"\xff")

    def readblocks(self, block_num, buf):
        nblocks = len(buf) // 512
        assert nblocks and not len(buf) % 512, "Buffer length is invalid"
        if nblocks == 1:
            # CMD17: set read address for single block
            if self.cmd(17, block_num * self.cdv, 0, release=False) != 0:
                # release the card
                self.cs(1)
                raise OSError(5)  # EIO
            # receive the data and release card
            self.readinto(buf)
        else:
            # CMD18: set read address for multiple blocks
            if self.cmd(18, block_num * self.cdv, 0, release=False) != 0:
                # release the card
                self.cs(1)
                raise OSError(5)  # EIO
            offset = 0
            mv = memoryview(buf)
            while nblocks:
                # receive the data and release card
                self.readinto(mv[offset : offset + 512])
                offset += 512
                nblocks -= 1
            if self.cmd(12, 0, 0xFF, skip1=True):
                raise OSError(5)  # EIO

    def writeblocks(self, block_num, buf):
        nblocks, err = divmod(len(buf), 512)
        assert nblocks and not err, "Buffer length is invalid"
        if nblocks == 1:
            # CMD24: set write address for single block
            if self.cmd(24, block_num * self.cdv, 0) != 0:
                raise OSError(5)  # EIO

            # send the data
            self.write(_TOKEN_DATA, buf)
        else:
            # CMD25: set write address for first block
            if self.cmd(25, block_num * self.cdv, 0) != 0:
                raise OSError(5)  # EIO
            # send the data
            offset = 0
            mv = memoryview(buf)
            while nblocks:
                self.write(_TOKEN_CMD25, mv[offset : offset + 512])
                offset += 512
                nblocks -= 1
            self.write_token(_TOKEN_STOP_TRAN)

    def ioctl(self, op, arg):
        if op == 4:  # get number of blocks
            return self.sectors
        if op == 5:  # get block size in bytes
            return 512
```

---

然后再创建一个新的文件，在这个文件里我们尝试用代码来读写 microSD卡：

```python
import os  # 用于文件系统操作，如挂载、卸载、列出目录内容等
from machine import Pin, SoftSPI
from sdcard import SDCard

# 接线说明:
# MISO -> GPIO 19
# MOSI -> GPIO 23
# CLK -> GPIO 18
# CS -> GPIO 5

spisd = SoftSPI(-1, miso=Pin(19), mosi=Pin(23), sck=Pin(18))
sd = SDCard(spisd, Pin(5))

# os.listdir() --> 返回当前目录下的所有文件和目录的列表
print('未挂载SD之前:', os.listdir())  
print("-------------------------------")
# 创建一个虚拟文件系统，用于挂载SD卡
vfs = os.VfsFat(sd)    
# 挂载SD卡到虚拟文件系统:将虚拟文件系统挂载到/sd目录。之后，对/sd目录的访问将实际访问SD卡。
os.mount(vfs, '/sd')   

print('挂载SD之后:', os.listdir())

# 对SD卡进行操作
try:
    # 切换到SD卡目录
    os.chdir('/sd')
    print('SD卡中的文件:', os.listdir())

    # 写入文件到SD卡
    with open("/sd/test.txt", "w") as f:
        for i in range(1, 101):
            f.write(str(i) + "\n")
    print("-------------------------------")
    print("已经将1~100写入到SD卡中的test.txt文件")
    print("-------------------------------")

    # 从SD卡读取文件并显示内容
    with open("/sd/led.py", "r") as f:
        content = f.readlines()
        print("SD卡中led.py文件的内容:")
        print("-------------------------------")
        for line in content:
            print(line.strip())
        print("-------------------------------")

except Exception as e:
    print("\n发生错误!", e)

finally:
    os.umount('/sd')
    print("SD卡已卸载")
```

在将microSD卡装载前，我其实早已在卡内下载了一个名为led.py的文件（这个文件其实就是程序示例中点灯程序的代码文件），这里作为了读取文件的示例。

***未完待续......***

## 项目开发——Arduino篇

接下来，我们将正式开启 Arduino 开发的相关内容讲解。在打开 Arduino IDE 后，你会看到两个关键函数，即 setup() 和 loop()。这两个函数的功能与 MicroPython 中的 boot.py 与 main.py 类似。其中，setup() 函数通常用于设备的初始化操作，例如配置引脚模式、初始化串口通信等；而 loop() 函数则用于实现设备的循环程序功能，程序会在此函数中不断重复执行特定任务。

### **点灯**

在IDE里复制以下代码，并编译上传。如果你能看见板子上LED闪烁，则说明运行成功。

```
void setup() {
  // 初始化串口通信，用于打印调试信息
  Serial.begin(115200);
  
  // 设置引脚 2 为输出模式
  pinMode(2, OUTPUT);
}

void loop() {
  // 关闭 LED（假设低电平点亮 LED）
  digitalWrite(2, LOW);
  Serial.println("灭");
  delay(1000); // 延时 1 秒

  // 打开 LED（假设高电平关闭 LED）
  digitalWrite(2, HIGH);
  Serial.println("亮");
  delay(1000); // 延时 1 秒
}
```

### **呼吸灯**

```
// 宏定义 GPIO 输出引脚
#define LED_PIN 2

void setup() {
  // 配置 GPIO 输出引脚
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  // 实现渐亮效果
  for (int i = 0; i < 256; i++) {
    // 设置亮度模拟值
    analogWrite(LED_PIN, i);
    // 延时 10ms
    delay(10);
  }
  // 实现渐灭效果
  for (int i = 255; i >= 0; i--) {
    // 设置亮度模拟值
    analogWrite(LED_PIN, i);
    // 延时 10ms
    delay(10);
  }
}
```

### **WIFI**

```
#include <WiFi.h>

// 定义SSID与密码
const char * ssid = "xxxxx";   
const char * password = "xxxxxx"; 

void setup() {
  Serial.begin(9600);

  // 断开之前的连接
  WiFi.disconnect(true);
  // 连接 Wi-Fi
  WiFi.begin(ssid, password);

  Serial.print("正在连接 Wi-Fi");

  // 检测是否链接成功
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    }
  Serial.println("连接成功");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());

}

void loop() {
}
```

*未完待续……*

## **参考资料**

1. [ESP-WROOM-32开发板笔记-CSDN博客](https://blog.csdn.net/weixin_51358957/article/details/137425865)
2. [乐鑫科技](https://www.espressif.com.cn/zh-hans/home)
3. [it项目网-ESP32篇](https://www.itprojects.cn/)
4. [MicroPython官方文档](http://docs.micropython.org/en/latest/index.html)
5. [Random Nerd Tutorials](https://randomnerdtutorials.com/)
6. [ESP-WROOM-32 技术规格书](/images/posts/esp32-notes/esp_wroom_32_datasheet_cn.pdf)
7. [MicroPython+ESP32实现蓝牙通信-CSDN博客](https://blog.csdn.net/weixin_42255154/article/details/132773178)
8. [esp32蓝牙开发教程 esp32蓝牙使用\_laojean的技术博客\_51CTO博客](https://blog.51cto.com/u_14256/10164744)
9. [使用 ESP32 + MicroPython 连接 | EMQX Platform 文档](https://docs.emqx.com/zh/cloud/latest/connect_to_deployments/esp32_with_micropython.html)
10. [DS18B20温度传感器原理详解及例程代码-CSDN博客](https://blog.csdn.net/as480133937/article/details/112604303)
11. [DHT11详细介绍（内含51和STM32代码）-CSDN博客](https://blog.csdn.net/m0_55849362/article/details/126426768)
12. [HC-SR04超级简单教程(快速入门)-CSDN博客](https://blog.csdn.net/class_nuli/article/details/130067225)
13. [MPU6050 6轴姿态传感器的分析与使用（一）-CSDN博客](https://blog.csdn.net/qq_44852376/article/details/130470815)
14. [esp32家族 esp32产品\_killads的技术博客\_51CTO博客](https://blog.51cto.com/u_14731/10917585)
15. [ESP32的芯片有几种\_esp32各个型号区别-CSDN博客](https://blog.csdn.net/USALCD/article/details/140354775)
16. [下班后实验室的个人空间-下班后实验室个人主页-哔哩哔哩视频 (bilibili.com)](https://space.bilibili.com/1349435951?spm_id_from=333.999.0.0)
17. [步进电机28BYJ-48的驱动（arduino，STM32平台），最全的驱动详细原理，驱动电路分析，驱动代码解释\_步进电机28by代码-CSDN博客](https://blog.csdn.net/anchoretor/article/details/113780470)
18. [芯片简介之PCF8574-CSDN博客](https://blog.csdn.net/qq_17525633/article/details/117556152)
19. [详解PCF8574 I/O扩展芯片I2C驱动原理与实现-开发者社区-阿里云](https://developer.aliyun.com/article/1399510)

[附件：金苹果派の开发板研究](https://pan.baidu.com/s/1IBsQxdB3QTP6LV-2eXA7gw?pwd=8osw#list/path=%2F)
