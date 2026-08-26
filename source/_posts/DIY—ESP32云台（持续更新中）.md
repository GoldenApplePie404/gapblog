---
title: "DIY—ESP32云台（持续更新中）"
img_dir: esp32-gimbal
cover: /images/posts/esp32-gimbal/fm.jpg
date: 2025-11-16 23:16:00
categories: ["开发板"]
---
为满足业余射电天文观测需求，我用 ESP32 与 ULN2003 驱动电路 DIY 了一台低成本云台，充当天线"赤道仪"。本文记录从步进电机驱动原理研究到云台成品的完整过程，持续更新中。

<!-- more -->


在之前撰写的一篇ESP32开发板研究日记里，我曾展示过如何借助ESP32与驱动电路实现对步进电机的控制。不过，当时实例中所展示的驱动电路仅能控制一个步进电机，但对于研究日记所承载的内容需求而言，这已然足够。

后来，我萌生出一个想法——打造一个基于ESP32改造的云台设备。我设想利用这个云台充当射电天文观测中天线的“赤道仪”。起初，我考虑直接使用市面上现成的赤道仪进行控制，然而在调研过程中发现，市面上的赤道仪价格普遍偏高。而且，考虑到咱们业余射电观测对精度的要求并非十分严苛，我便决定自己动手DIY一个。

于是，我投入到步进电机驱动电路原理的研究中。经过一番探索，我发现驱动电路的核心组件是ULN2003这个集成电路。ULN2003属于高耐压、大电流复合晶体管阵列，它由七个硅NPN复合晶体管巧妙组合而成。

![](/images/posts/esp32-gimbal/yuntai_diy-1024x466.jpg)

*深夜研究*

从功能层面来讲，ULN2003本质上就是一个电流放大器，其主要作用是增强电路的驱动能力。以常见的单片机为例，其输出引脚输出的电流通常只有几毫安（mA），这样的电流强度远远不足以驱动电机、继电器或者电磁阀等设备。就拿直流电机来说，要使其正常运转，往往需要至少500mA的电流。而ULN2003的出现很好地解决了这个问题，它能够对单片机输出引脚的微弱信号进行放大处理。经过ULN2003放大之后，我们就可以通过单片机的输出引脚直接控制这些原本难以驱动的设备，极大地简化了电路设计和控制流程。

![](/images/posts/esp32-gimbal/image.png)

如图，1~7引脚用于信号输入，8引脚为接地，9为二极管负极公共端，10~16为大电流输出。一个28BYJ48型号的步进电机有5个端口，其中4个为信号接收端（准确来说是用于步进电机线圈的驱动端口）。步进电机的工作原理是通过依次给不同的线圈通电，从而产生旋转磁场，驱动电机转子转动。这4个信号接收端就像是电机的“控制开关”，通过接收来自ULN2003芯片输出的电流信号，精确地控制各个线圈的通断和通电顺序，进而实现对步进电机转动方向、速度和角度的精准控制。而剩下的1个端口通常是公共端，它与电机内部的线圈公共连接点相连，为整个线圈电路提供一个共同的电位参考。

但我们的云台至少需要2个步进电机，每个步进电机又有4个控制引脚（还有一个正极，不过可以共用一端，共五个引脚），ULN2003芯片的输出不能满足两个步进电机的驱动。不过，在我查找了多次资料后，我发现了一个很适合用于驱动两个步进电机的芯片：ULN2803

其实ULN2803与ULN2003原理一样，只不过多了几个阵列罢了。于是参考原先的驱动电路，我绘制了一个新的电路图

![](/images/posts/esp32-gimbal/image-1.png)

你或许已经留意到，我在设计中特意增设了LED指示灯（电源引脚与输出引脚均配备），以实现直观的状态显示。不过，为了进一步确保电路的可靠性与安全性，我还特别预留了R10位置的测试断点，以便在电源指示电路突发异常时，能够迅速进行故障排查与修复。接下来把PCB绘制完成即可。

![](/images/posts/esp32-gimbal/yuntaipcb-958x1024.png)

到货后进行焊接、测试。

![](/images/posts/esp32-gimbal/yuntai_pcb3-1024x466.jpg)

*左：1.0 | 右：2.0*

![](/images/posts/esp32-gimbal/yuntai_test-1024x466.jpg)

焊接测试后发现，电源指示灯即便打开开关也不亮，可能由电压异常或焊接失误导致（尚未排查）。不过奇妙的是，这一状况并未影响电路板整体功能的正常运行。

MicroPython代码

```
#ULN2803APG
from machine import Pin
import time

# 定义两个电机的引脚
MOTOR1_PINS = [15, 2, 4, 16]
MOTOR2_PINS = [27, 26, 25, 33]  

def setup_motor_pins(pins):
    """设置电机引脚的模式和初始状态"""
    motor_pins = [Pin(pin, Pin.OUT) for pin in pins]
    for pin in motor_pins:
        pin.value(0)
    return motor_pins

def rotate_motor(motor_pins, angle, reverse=False):
    # 延时时间（毫秒）
    delay_time_ms = 2
    
    # 定义电机步序
    steps = [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
    ]
    
    # 如果需要反转，则反转步序
    if reverse:
        steps = steps[::-1]
    
    # 电机一圈的步数（这里假设两个电机的步数相同）
    full_steps = 512
    
    # 计算角度对应的步数
    steps_for_angle = int((angle / 360) * full_steps)
    
    # 旋转电机特定角度
    for _ in range(steps_for_angle):
        for step in steps:
            motor_pins[0].value(step[0])
            motor_pins[1].value(step[1])
            motor_pins[2].value(step[2])
            motor_pins[3].value(step[3])
            time.sleep_ms(delay_time_ms)
    
    # 停止电机
    for pin in motor_pins:
        pin.value(0)

# 设置电机引脚
motor1_pins = setup_motor_pins(MOTOR1_PINS)
motor2_pins = setup_motor_pins(MOTOR2_PINS)

# 示例调用
rotate_motor(motor1_pins, 30)           # 控制第一个电机正转30度
rotate_motor(motor2_pins, 30, reverse=True) # 控制第二个电机反转30度
```

然而，正如你所见，此驱动板会占用10个ESP32的引脚，引脚资源消耗较大。因此，后续我为其添加了PCF8574模块。该模块能够借助ESP32的四个引脚（严格来讲需5个，因为PCF8574要占用一个3.3V端口，步进电机驱动电路还需占用一个5V端口，而且我默认将GND统一）实现多引脚输出功能。

Micropython代码

```
#ULN2803APG+PCF8574
import pcf8574
from machine import I2C, Pin
import time

# PCF8574配置
PCF8574_ADDR = 0x20  

# 定义两个电机在PCF8574上的引脚映射
# 电机1使用P00-P03，电机2使用P04-P07
MOTOR1_PINS = [0, 1, 2, 3]
MOTOR2_PINS = [4, 5, 6, 7]

# 初始化I2C总线 
i2c = I2C(0, scl=Pin(2), sda=Pin(15))

# 初始化PCF8574
pcf = pcf8574.PCF8574(i2c, PCF8574_ADDR)

def setup_motors():
    """初始化电机控制，设置所有引脚为低电平"""
    pcf.port = 0x00  # 所有引脚输出低电平

def rotate_motor(motor_pins, angle, reverse=False):
    """
    通过PCF8574控制步进电机旋转指定角度
    
    参数:
        motor_pins: 电机引脚在PCF8574上的编号列表
        angle: 旋转角度（0-360）
        reverse: 是否反转
    """
    # 延时时间（毫秒）
    delay_time_ms = 3
    
    # 定义单四拍步进序列
    steps = [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
    ]
    
    # 如果需要反转，则反转步序
    if reverse:
        steps = steps[::-1]
    
    # 电机一圈的步数（根据你的步进电机型号调整）
    full_steps = 512
    
    # 计算角度对应的步数
    steps_for_angle = int((angle / 360) * full_steps)
    
    # 获取当前端口状态
    current_port = pcf.port
    
    # 旋转电机特定角度
    for _ in range(steps_for_angle):
        for step in steps:
            # 构建新的端口状态
            new_port = current_port
            
            # 设置当前步的引脚状态
            for i, pin in enumerate(motor_pins):
                if step[i]:
                    new_port |= (1 << pin)  # 引脚置高
                else:
                    new_port &= ~(1 << pin)  # 引脚置低
            
            # 更新PCF8574端口
            pcf.port = new_port
            current_port = new_port
            
            # 延时
            time.sleep_ms(delay_time_ms)

# 初始化电机
setup_motors()

# 示例调用
print("电机1正转90度...")
rotate_motor(MOTOR1_PINS, 90)
time.sleep(1)

print("电机2反转130度...")
rotate_motor(MOTOR2_PINS, 130, reverse=True)
time.sleep(1)

print("电机1和电机2同时正转270度...")
# 同时控制两个电机
for _ in range(int((270/360)*512)):
    # 电机1第一步
    pcf.port = 0b00000001  # P00高电平
    time.sleep_ms(2)
    # 电机2第一步
    pcf.port = 0b00010000  # P04高电平
    time.sleep_ms(2)
    # 电机1第二步
    pcf.port = 0b00000010  # P01高电平
    time.sleep_ms(2)
    # 电机2第二步
    pcf.port = 0b00100000  # P05高电平
    time.sleep_ms(2)
    # 电机1第三步
    pcf.port = 0b00000100  # P02高电平
    time.sleep_ms(2)
    # 电机2第三步
    pcf.port = 0b01000000  # P06高电平
    time.sleep_ms(2)
    # 电机1第四步
    pcf.port = 0b00001000  # P03高电平
    time.sleep_ms(2)
    # 电机2第四步
    pcf.port = 0b10000000  # P07高电平
    time.sleep_ms(2)
    
# 停止所有电机
pcf.port = 0x00
print("操作完成")
```

***未完待续……***

Todo List：

- 研究ULN2803 √；
- 初步编写MicroPython驱动代码 √；
- 进一步迭代电路板，修复硬件bug；
- 完善代码，并封装成单独的库；
- 设计并组装机械结构；
- 开发控制程序（远程），包括移动端（主）和电脑端
