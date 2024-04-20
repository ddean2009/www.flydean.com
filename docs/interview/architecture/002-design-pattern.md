# 设计模式

## **软件设计原则有哪些？**

常⽤的⾯向对象设计原则包括 7个，这些原则并不是孤⽴存在的，它们相互 依赖，相互补充。

- 开闭原则（ Open Closed Principle， OCP）
- 单⼀职责原则（ Single Responsibility Principle, SRP）
- ⾥⽒替换原则（ Liskov Substitution Principle， LSP）
- 依赖倒置原则（ Dependency Inversion Principle， DIP）
- 接⼝隔离原则（ Interface Segregation Principle， ISP）
- 合成 /聚合复⽤原则（ Composite/Aggregate Reuse Principle， C/ARP）
- 最少知识原则（ Least Knowledge Principle， LKP）或者迪⽶特法则 （Law of Demeter， LOD）



| 设计原则名称      | 简单定义                                         |
| ----------------- | ------------------------------------------------ |
| 开闭原则          | 对扩展开放，对修改关闭                           |
| 单一职责原则      | 一个类只负责一个功能领域中的相应职责             |
| 里氏替换原则      | 所有引用基类的地方必须能透明地使用其子类的对象   |
| 依赖倒置原则      | 依赖于抽象，不能依赖于具体实现                   |
| 接口隔离原则      | 类之间的依赖关系应该建立在最小的接口上           |
| 合成/聚合复用原则 | 尽量使用合成/聚合，而不是通过继承达到复用的目的  |
| 迪米特法则        | 一个软件实体应当尽可能少的与其他实体发生相互作用 |

## **什么是设计模式？**

设计模式（ Design pattern）代表了最佳的实践，通常被有经验的⾯向对象 的软件开发⼈员所采⽤。设计模式是软件开发⼈员在软件开发过程中⾯临 的⼀般问题的解决⽅案。这些解决⽅案是众多软件开发⼈员经过相当⻓的 ⼀段时间的试验和错误总结出来的。

设计模式是⼀套被反复使⽤的、多数⼈知晓的、经过分类编⽬的、代码设 计经验的总结。使⽤设计模式是为了重⽤代码、让代码更容易被他⼈理 解、保证代码可靠性。 毫⽆疑问，设计模式于⼰于他⼈于系统都是多赢 的，设计模式使代码编制真正⼯程化，设计模式是软件⼯程的基⽯，如同 ⼤厦的⼀块块砖⽯⼀样。项⽬中合理地运⽤设计模式可以完美地解决很多 问题，每种模式在现实中都有相应的原理来与之对应，每种模式都描述了

⼀个在我们周围不断重复发⽣的问题，以及该问题的核⼼解决⽅案，这也 是设计模式能被⼴泛应⽤的原因。

## **设计模式的分类了解吗 ?**

- **创建型：** 在创建对象的同时隐藏创建逻辑，不使⽤ new 直接实例化对 象，程序在判断需要创建哪些对象时更灵活。包括⼯⼚ /抽象⼯⼚ /单例 / 建造者 /原型模式。
- **结构型：** 通过类和接⼝间的继承和引⽤实现创建复杂结构的对象。包 括适配器 /桥接模式 /过滤器 /组合 /装饰器 /外观 /享元 /代理模式。
- **⾏为型：** 通过类之间不同通信⽅式实现不同⾏为。包括责任链 /命名 /解 释器 /迭代器 /中介者 /备忘录 /观察者 /状态 /策略 /模板 /访问者模式。

## **你知道哪些设计模式？**

![image-20240420101207088](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202404201012308.png)



## **⼯⼚模式**

### **说⼀说简单⼯⼚模式**

简单⼯⼚模式指由⼀个⼯⼚对象来创建实例，客户端不需要关注创建逻 辑，只需提供传⼊⼯⼚的参数。

UML 类图如下：

![](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202404201012654.png)



适⽤于⼯⼚类负责创建对象较少的情况，缺点是如果要增加新产品，就需 要修改⼯⼚类的判断逻辑，违背开闭原则，且产品多的话会使⼯⼚类⽐较复杂。

Calendar 抽象类的 getInstance ⽅法，调⽤ createCalendar ⽅法根据不同 的地区参数创建不同的⽇历对象。

Spring 中的 BeanFactory 使⽤简单⼯⼚模式，根据传⼊⼀个唯⼀的标识来 获得 Bean 对象。



### **⼯⼚⽅法模式了解吗？**

和简单⼯⼚模式中⼯⼚负责⽣产所有产品相⽐，⼯⼚⽅法模式将⽣成具体 产品的任务分发给具体的产品⼯⼚。

UML 类图如下：

![image-20240420101441757](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202404201014242.png)



也就是定义⼀个抽象⼯⼚，其定义了产品的⽣产接⼝，但不负责具体的产 品，将⽣产任务交给不同的派⽣类⼯⼚。这样不⽤通过指定类型来创建对 象了。

### **抽象⼯⼚模式了解吗？**

简单⼯⼚模式和⼯⼚⽅法模式不管⼯⼚怎么拆分抽象，都只是针对⼀类产 品，如果要⽣成另⼀种产品，就⽐较难办了！

抽象⼯⼚模式通过在 AbstarctFactory 中增加创建产品的接⼝，并在具体⼦ ⼯⼚中实现新加产品的创建，当然前提是⼦⼯⼚⽀持⽣产该产品。否则继 承的这个接⼝可以什么也不⼲。

UML 类图如下：

![image-20240420101502257](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202404201015792.png)

从上⾯类图结构中可以清楚的看到如何在⼯⼚⽅法模式中通过增加新产品 接⼝来实现产品的增加的。

## **单例模式**

### **什么是单例模式？单例模式的特点是什么？**

单例模式属于创建型模式，⼀个单例类在任何情况下都只存在⼀个实例， 构造⽅法必须是私有的、由⾃⼰创建⼀个静态变量存储实例，对外提供⼀ 个静态公有⽅法获取实例。 优点是内存中只有⼀个实例，减少了开销，尤其是频繁创建和销毁实例的 情况下并且可以避免对资源的多重占⽤。缺点是没有抽象层，难以扩展， 与单⼀职责原则冲突。

### **单例模式的常⻅写法有哪些？**

##### **饿汉式，线程安全**

饿汉式单例模式，顾名思义，类⼀加载就创建对象，这种⽅式⽐较常⽤， 但容易产⽣垃圾对象，浪费内存空间。

优点：线程安全，没有加锁，执⾏效率较⾼ 缺点：不是懒加载，类加载时就初始化，浪费内存空间

> 懒加载 （ lazy loading）：使⽤的时候再创建对象

饿汉式单例是如何保证线程安全的呢？它是基于类加载机制避免了多线程 的同步问题，但是如果类被不同的类加载器加载就会创建不同的实例。

**代码实现，以及使⽤反射破坏单例：**



```java
public class Singleton {
// 1、私有化构造方法
private Singleton(){}
// 2、定义一个静态变量指向自己类型
private final static Singleton instance = new
Singleton();
// 3、对外提供一个公共的方法获取实例
public static Singleton getInstance() {
        return instance;
    }
}
```

使⽤反射破坏单例，代码如下：

```java
public class Test {
    public static void main(String[] args) throws
Exception{
// 使用反射破坏单例
// 获取空参构造方法
Constructor<Singleton> declaredConstructor =
Singleton.class.getDeclaredConstructor(null); // 设置强制访问
declaredConstructor.setAccessible(true); // 创建实例
Singleton singleton =
declaredConstructor.newInstance();
System.out.println("反射创建的实例" + singleton);
System.out.println("正常创建的实例" + Singleton.getInstance());
System.out.println("正常创建的实例" + Singleton.getInstance());
} }
```

输出结果如下：

```java
反射创建的实例
com.example.spring.demo.single.Singleton@224gbeef 
正常创建的实例 com.example.spring.demo.single.Singleton@1124444 
正常创建的实例 com.example.spring.demo.single.Singleton@1124444
```

##### **懒汉式，线程不安全**

这种⽅式在单线程下使⽤没有问题，对于多线程是⽆法保证单例的，这⾥ 列出来是为了和后⾯使⽤锁保证线程安全的单例做对⽐。

优点：懒加载 缺点：线程不安全 代码实现如下：

```java
public class Singleton {
// 1、私有化构造方法
private Singleton(){ }
// 2、定义一个静态变量指向自己类型
private static Singleton instance;
// 3、对外提供一个公共的方法获取实例
public static Singleton getInstance() {
// 判断为 null 的时候再创建对象 if (instance == null) {
            instance = new Singleton();
        }
        return instance;
    }
}
```

使⽤多线程破坏单例，测试代码如下：

```java
public class Test {
    public static void main(String[] args) {
        for (int i = 0; i < 3; i++) {
new Thread(() -> { System.out.println("多线程创建的单例:" +
Singleton.getInstance());
            }).start();
} }
}
```

输出结果如下：

```java
多线程创建的单例:
com.example.spring.demo.single.Singleton@1234445 
多线程创建的单例: com.example.spring.demo.single.Singleton@1244555
多线程创建的单例: com.example.spring.demo.single.Singleton@23444555
```

##### **懒汉式，线程安全**

懒汉式单例如何保证线程安全呢？通过 synchronized 关键字加锁保证线程 安全，synchronized 可以添加在⽅法上⾯，也可以添加在代码块上⾯，这 ⾥演示添加在⽅法上⾯，存在的问题是每⼀次调⽤ getInstance 获取实例时 都需要加锁和释放锁，这样是⾮常影响性能的。

优点：懒加载，线程安全 缺点：效率较低 代码实现如下：

```java
public class Singleton {
// 1、私有化构造方法
private Singleton(){ }
// 2、定义一个静态变量指向自己类型
private static Singleton instance;
// 3、对外提供一个公共的方法获取实例
public synchronized static Singleton getInstance() {
        if (instance == null) {
            instance = new Singleton();
        }
        return instance;
        } }
```

##### **双重检查锁（ DCL， 即 double-checked locking）**

实现代码如下：

```java
public class Singleton { // 1、私有化构造方法 private Singleton() { }
// 2、定义一个静态变量指向自己类型
private volatile static Singleton instance;
// 3、对外提供一个公共的方法获取实例
public static Singleton getInstance() {
// 第一重检查是否为 null if (instance == null) {
// 使用 synchronized 加锁 synchronized (Singleton.class) {
// 第二重检查是否为 null
if (instance == null) {
// new 关键字创建对象不是原子操作 instance = new Singleton();
} }
}
        return instance;
    }
}
```

优点：懒加载，线程安全，效率较⾼ 缺点：实现较复杂

这⾥的双重检查是指两次⾮空判断，锁指的是 synchronized 加锁，为什么 要进⾏双重判断，其实很简单，第⼀重判断，如果实例已经存在，那么就 不再需要进⾏同步操作，⽽是直接返回这个实例，如果没有创建，才会进 ⼊同步块，同步块的⽬的与之前相同，⽬的是为了防⽌有多个线程同时调 ⽤时，导致⽣成多个实例，有了同步块，每次只能有⼀个线程调⽤访问同 步块内容，当第⼀个抢到锁的调⽤获取了实例之后，这个实例就会被创 建，之后的所有调⽤都不会进⼊同步块，直接在第⼀重判断就返回了单

例。

关于内部的第⼆重空判断的作⽤，当多个线程⼀起到达锁位置时，进⾏锁 竞争，其中⼀个线程获取锁，如果是第⼀次进⼊则为 null，会进⾏单例对 象的创建，完成后释放锁，其他线程获取锁后就会被空判断拦截，直接返 回已创建的单例对象。

其中最关键的⼀个点就是 volatile 关键字的使⽤，关于 volatile 的详细介 绍可以直接搜索 volatile 关键字即可，有很多写的⾮常好的⽂章，这⾥不做 详细介绍，简单说明⼀下，双重检查锁中使⽤ volatile 的两个重要特性：**可⻅性、禁⽌指令重排序**

这⾥为什么要使⽤ volatile ？

这是因为  new 关键字创建对象不是原⼦操作，创建⼀个对象会经历下⾯ 的步骤：

1. 在堆内存开辟内存空间
2. 调⽤构造⽅法，初始化对象
3. 引⽤变量指向堆内存空间

对应字节码指令如下：

![image-20240420102530631](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202404201025263.png)



为了提⾼性能，编译器和处理器常常会对既定的代码执⾏顺序进⾏指令重 排序，从源码到最终执⾏指令会经历如下流程：

源码编译器优化重排序指令级并⾏重排序内存系统重排序最终执⾏指令序

列

所以经过指令重排序之后，创建对象的执⾏顺序可能为 1 2 3 或者  1 3 2 ，因此当某个线程在乱序运⾏ 1 3 2 指令的时候，引⽤变量指向堆内存 空间，这个对象不为null，但是没有初始化，其他线程有可能这个时候进

⼊了  getInstance 的第⼀个  if(instance == null) 判断不为 nulll ，导致错误使 ⽤了没有初始化的⾮ null 实例，这样的话就会出现异常，这个就是著名的

DCL 失效问题。

当我们在引⽤变量上⾯添加 volatile 关键字以后，会通过在创建对象指令 的前后添加内存屏障来禁⽌指令重排序，就可以避免这个问题，⽽且对

volatile 修饰的变量的修改对其他任何线程都是可⻅的。

##### **静态内部类**

代码实现如下：

```java
public class Singleton {

// 1、私有化构造⽅法

private Singleton() {     }

// 2、对外提供获取实例的公共⽅法

public static Singleton getInstance() {

return InnerClass.INSTANCE;

}

// 定义静态内部类

private static class InnerClass{

private final static Singleton INSTANCE = new Singleton();

}

}
```

优点：懒加载，线程安全，效率较⾼，实现简单

静态内部类单例是如何实现懒加载的呢？⾸先，我们先了解下类的加载时机。

虚拟机规范要求有且只有 5 种情况必须⽴即对类进⾏初始化（加载、验证、准备需要在此之前开始）：

1. 遇到  new 、 getstatic 、 putstatic 、 invokestatic 这 4 条字节码指令 时。⽣成这 4 条指令最常⻅的 Java 代码场景是：使⽤ new 关键字实 例化对象的时候、读取或设置⼀个类的静态字段（final 修饰除外，被 final 修饰的静态字段是常量，已在编译期把结果放⼊常量池)的时 候，以及调⽤⼀个类的静态⽅法的时候。
1. 使⽤  java.lang.reflect 包⽅法对类进⾏反射调⽤的时候。
1. 当初始化⼀个类的时候，如果发现其⽗类还没有进⾏过初始化，则需要先触发其⽗类的初始化。
1. 当虚拟机启动时，⽤户需要指定⼀个要执⾏的主类（包含 main()的那 个类），虚拟机会先初始化这个主类。
1. 当使⽤ JDK 1.7 的动态语⾔⽀持时，如果⼀个java.lang.invoke.MethodHandle 实例最后的解析结果是

REF\_getStatic 、 REF\_putStatic 、 REF\_invokeStatic 的⽅法句柄，则需 要先触发这个⽅法句柄所对应的类的初始化。

这 5 种情况被称为是类的主动引⽤，注意，这⾥《虚拟机规范》中使⽤的 限定词是 "**有且仅有** "，那么，除此之外的所有引⽤类都不会对类进⾏初始 化，称为被动引⽤。静态内部类就属于被动引⽤的情况。

当 getInstance()⽅法被调⽤时， InnerClass 才在 Singleton 的运⾏时常量 池⾥，把符号引⽤替换为直接引⽤，这时静态对象 INSTANCE 也真正被创 建，然后再被 getInstance()⽅法返回出去，这点同饿汉模式。

那么  INSTANCE 在创建过程中⼜是如何保证线程安全的呢？在《深⼊理解JAVA 虚拟机》中，有这么⼀句话 :

虚拟机会保证⼀个类的 <clinit>() ⽅法在多线程环境中被正确地加锁、同 步，如果多个线程同时去初始化⼀个类，那么只会有⼀个线程去执⾏这个

类的  <clinit>() ⽅法，其他线程都需要阻塞等待，直到活动线程执⾏

<clinit>() ⽅法完毕。如果在⼀个类的 <clinit>() ⽅法中有耗时很⻓的操 作，就可能造成多个进程阻塞(需要注意的是，其他线程虽然会被阻塞，但

**如果执⾏ <clinit>() ⽅法后，其他线程唤醒之后不会再次进⼊ <clinit>() ⽅ 法。同⼀个加载器下，⼀个类型只会初始化⼀次。** )，在实际应⽤中，这种 阻塞往往是很隐蔽的。

从上⾯的分析可以看出 INSTANCE 在创建过程中是线程安全的，所以说静 态内部类形式的单例可保证线程安全，也能保证单例的唯⼀性，同时也延 迟了单例的实例化。

##### **枚举单例**

代码实现如下：

```java
public enum Singleton {

INSTANCE;

public void doSomething(String str) {

System.out.println(str);

}

}
```

优点：简单，⾼效，线程安全，可以避免通过反射破坏枚举单例

枚举在 java 中与普通类⼀样，都能拥有字段与⽅法，⽽且枚举实例创建是 线程安全的，在任何情况下，它都是⼀个单例，可以直接通过如下⽅式调 ⽤获取实例：

Singleton singleton = Singleton.INSTANCE;

使⽤下⾯的命令反编译枚举类

javap Singleton.class

得到如下内容

```java
Compiled from "Singleton.java"

public final class com.spring.demo.singleton.Singleton extends java.lang.Enum<com.spring.demo.singleton.Singleton> {   public static final

com.spring.demo.singleton.Singleton INSTANCE;

public static com.spring.demo.singleton.Singleton[] values();

public static com.spring.demo.singleton.Singleton valueOf(java.lang.String);

public void doSomething(java.lang.String);

static {};

}
```

从枚举的反编译结果可以看到， INSTANCE 被  static final 修饰，所以可以 通过类名直接调⽤， **并且创建对象的实例是在静态代码块中创建的** ，因为 static 类型的属性会在类被加载之后被初始化，当⼀个 Java 类第⼀次被真 正使⽤到的时候静态资源被初始化、 Java 类的加载和初始化过程都是线程 安全的，所以创建⼀个 enum 类型是线程安全的。

通过反射破坏枚举，实现代码如下：



```java
public class Test {

public static void main(String[] args) throws Exception {

Singleton singleton = Singleton.INSTANCE; singleton.doSomething("hello enum");

// 尝试使⽤反射破坏单例

// 枚举类没有空参构造⽅法，反编译后可以看到枚举有⼀个两个

参数的构造⽅法

Constructor<Singleton> declaredConstructor = Singleton.class.getDeclaredConstructor(String.class, int.class);

// 设置强制访问 declaredConstructor.setAccessible(true);

// 创建实例，这⾥会报错，因为⽆法通过反射创建枚举的实例

Singleton enumSingleton = declaredConstructor.newInstance();

System.out.println(enumSingleton);

}

}
```

运⾏结果报如下错误：

```java
Exception in thread "main" java.lang.IllegalArgumentException: Cannot reflectively create enum objects

at java.base/java.lang.reflect.Constructor.newInstanceWithC aller(Constructor.java:492)

at java.base/java.lang.reflect.Constructor.newInstance(Cons tructor.java:480)

at com.spring.demo.singleton.Test.main(Test.java:24)
```

查看反射创建实例的 newInstance() ⽅法，有如下判断：

![image-20240420103049610](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202404201030907.png)



所以⽆法通过反射创建枚举的实例。



## **适配器模式**

### **适配器模式了解吗？**

在我们的应⽤程序中我们可能需要将两个不同接⼝的类来进⾏通信，在不 修改这两个的前提下我们可能会需要某个中间件来完成这个衔接的过程。 这个中间件就是适配器。所谓适配器模式就是将⼀个类的接⼝，转换成客 户期望的另⼀个接⼝。它可以让原本两个不兼容的接⼝能够⽆缝完成对接。

作为中间件的适配器将⽬标类和适配者解耦，增加了类的透明性和可复⽤性。

### **类适配器**

**原理：** 通过类继承实现适配，继承 Target 的接⼝，继承 Adaptee 的实现

![image-20240420103126991](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202404201031452.png)

### **对象适配器**

**原理：** 通过类对象组合实现适配

![image-20240420103133368](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202404201031704.png)

 **Target:** 定义 Client 真正需要使⽤的接⼝。


 **Adaptee:** 其中定义了⼀个已经存在的接⼝，也是我们需要进⾏适配的

接⼝。

 **Adapter:** 对 Adaptee 和 Target 的接⼝进⾏适配，保证对 target 中接⼝ 的调⽤可以间接转换为对 Adaptee 中接⼝进⾏调⽤。

### **适配器模式的优缺点**

**优点：**

1. 提⾼了类的复⽤；
1. 组合若⼲关联对象形成对外提供统⼀服务的接⼝；
1. 扩展性、灵活性好。

**缺点：**

1. 过多使⽤适配模式容易造成代码功能和逻辑意义的混淆。
1. 部分语⾔对继承的限制，可能⾄多只能适配⼀个适配者类，⽽且⽬标类 必须是抽象类。

## **代理模式（ proxy pattern）**

### **什么是代理模式？**

代理模式的本质是⼀个中间件，主要⽬的是解耦合服务提供者和使⽤者。 使⽤者通过代理间接的访问服务提供者，便于后者的封装和控制。是⼀种 结构性模式。

下⾯是 GoF 介绍典型的代理模式 UML 类图

![image-20240420103143988](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202404201031347.png)

**Subject:** 定义 RealSubject 对外的接⼝，且这些接⼝必须被 Proxy 实现， 这样外部调⽤ proxy 的接⼝最终都被转化为对 realsubject 的调⽤。

**RealSubject:** 真正的⽬标对象。

**Proxy:** ⽬标对象的代理，负责控制和管理⽬标对象，并间接地传递外部对 ⽬标对象的访问。

- Remote Proxy: 对本地的请求以及参数进⾏序列化，向远程对象发送请 求，并对响应结果进⾏反序列化，将最终结果反馈给调⽤者；
    - Virtual Proxy: 当⽬标对象的创建开销⽐较⼤的时候，可以使⽤延迟或者 异步的⽅式创建⽬标对象；
        - Protection Proxy: 细化对⽬标对象访问权限的控制；

### **静态代理和动态代理的区别**

1. **灵活性** ：动态代理更加灵活，不需要必须实现接⼝，可以直接代理实 现类，并且可以不需要针对每个⽬标类都创建⼀个代理类。另外，静态 代理中，接⼝⼀旦新增加⽅法，⽬标对象和代理对象都要进⾏修改，这 是⾮常麻烦的！
2. **JVM 层⾯** ：静态代理在编译时就将接⼝、实现类、代理类这些都变成 了⼀个个实际的 class ⽂件。⽽动态代理是在运⾏时动态⽣成类字节 码，并加载到 JVM 中的。

## **观察者模式**

### **说⼀说观察者模式**

观察者模式主要⽤于处理对象间的⼀对多的关系，是⼀种对象⾏为模式。 该模式的实际应⽤场景⽐较容易确认，当⼀个对象状态发⽣变化时，所有 该对象的关注者均能收到状态变化通知，以进⾏相应的处理。

下⾯是 GoF 介绍的典型的类观察者模式的 UML 类图：

![image-20240420103204638](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202404201032989.png)

**Subject:** 抽象被观察者，仅提供注册和删除观察者对象的接⼝声明。

**ConcreteSubject:** 具体被观察者对象，该对象中收集了所有需要被通知的 观察者，并可以动态的增删集合中的观察者。当其状态发⽣变化时会通知 所有观察者对象。

**Observer:** 抽象观察者，为所有观察者定义获得通知的统⼀接⼝；

**ConcreteObserver:** 观察者对象，其关注对象为 Subject，能接受 Subject 变化时发出的通知并更新⾃身状态。

### **观察者模式的优缺点**

**优点：**

1. 被观察者和观察者之间是抽象耦合的；
2. 耦合度较低，两者之间的关联仅仅在于消息的通知；
3. 被观察者⽆需关⼼他的观察者；
4. ⽀持⼴播通信；

**缺点：**

1. 观察者只知道被观察对象发⽣了变化，但不知变化的过程和缘由；
1. 观察者同时也可能是被观察者，消息传递的链路可能会过⻓，完成所有 通知花费时间较多；
1. 如果观察者和被观察者之间产⽣循环依赖，或者消息传递链路形成闭 环，会导致⽆限循环；

### **你的项⽬是怎么⽤的观察者模式？**

在⽀付场景下，⽤户购买⼀件商品，当⽀付成功之后三⽅会回调⾃身，在 这个时候系统可能会有很多需要执⾏的逻辑（如：更新订单状态，发送邮 件通知，赠送礼品 …），这些逻辑之间并没有强耦合，因此天然适合使⽤ 观察者模式去实现这些功能，当有更多的操作时，只需要添加新的观察者 就能实现，完美实现了对修改关闭，对扩展开放的开闭原则。



## **装饰器模式**

### **什么是装饰器模式？**

装饰器模式主要对现有的类对象进⾏包裹和封装，以期望在不改变类对象 及其类定义的情况下，为对象添加额外功能。是⼀种对象结构型模式。需 要注意的是，该过程是通过调⽤被包裹之后的对象完成功能添加的，⽽不 是直接修改现有对象的⾏为，相当于增加了中间层。

下⾯是 GoF 介绍的典型的装饰器模式的 UML 类图：

![image-20240420103222550](https://flydean-1301049335.cos.ap-guangzhou.myqcloud.com/img/202404201032966.png)

**Component:** 对象的接⼝类，定义装饰对象和被装饰对象的共同接⼝； **ConcreteComponent:** 被装饰对象的类定义；

**Decorator:** 装饰对象的抽象类，持有⼀个具体的被修饰对象，并实现接⼝ 类继承的公共接⼝；


**ConcreteDecorator:**　具体的装饰器，负责往被装饰对象添加额外的功 能；

### **讲讲装饰器模式的应⽤场景**

如果你希望在⽆需修改代码的情况下即可使⽤对象， 且希望在运⾏时为对 象新增额外的⾏为， 可以使⽤装饰模式。

装饰能将业务逻辑组织为层次结构， 你可为各层创建⼀个装饰， 在运⾏时 将各种不同逻辑组合成对象。 由于这些对象都遵循通⽤接⼝， 客户端代码 能以相同的⽅式使⽤这些对象。

如果⽤继承来扩展对象⾏为的⽅案难以实现或者根本不可⾏， 你可以使⽤ 该模式。

许多编程语⾔使⽤ final 最终关键字来限制对某个类的进⼀步扩展。 复⽤ 最终类已有⾏为的唯⼀⽅法是使⽤装饰模式：⽤封装器对其进⾏封装。

## **责任链模式**

### **什么是责任链模式？**

⼀个请求沿着⼀条 “链 ”传递，直到该 “链 ”上的某个处理者处理它为⽌。

⼀个请求可以被多个处理者处理或处理者未明确指定时。 责任链模式⾮常简单异常好理解，相信我它⽐单例模式还简单易懂，其应 ⽤也⼏乎⽆所不在，甚⾄可以这么说 ,从你敲代码的第⼀天起你就不知不觉 ⽤过了它最原始的裸体结构： switch-case 语句。

### **讲讲责任链模式的应⽤场景**

 当程序需要使⽤不同⽅式处理不同种类请求， ⽽且请求类型和顺序预 先未知时， 可以使⽤责任链模式。该模式能将多个处理者连接成⼀条 链。 接收到请求后， 它会 “询问 ” 每个处理者是否能够对其进⾏处理。 这样所有处理者都有机会来处理请求。

 当必须按顺序执⾏多个处理者时， 可以使⽤该模式。 ⽆论你以何种顺 序将处理者连接成⼀条链， 所有请求都会严格按照顺序通过链上的处 理者。

## **策略模式**

### **什么是策略模式？**

策略模式（ Strategy Pattern）属于对象的⾏为模式。其⽤意是针对⼀组算 法，将每⼀个算法封装到具有共同接⼝的独⽴的类中，从⽽使得它们可以 相互替换。策略模式使得算法可以在不影响到客户端的情况下发⽣变化。 其主要⽬的是通过定义相似的算法，替换 if else 语句写法，并且可以随时 相互替换。

### **策略模式有什么好处？**

定义了⼀系列封装了算法、⾏为的对象，他们可以相互替换。

举例： Java.util.List 就是定义了⼀个增（ add ）、删（ remove ）、改 (set ）、查（ indexOf ）策略，⾄于实现这个策略的 ArrayList 、 LinkedList 等类，只是在具体实现时采⽤了不同的算法。但因 为它们策略⼀样，不考虑速度的情况下，使⽤时完全可以互相替换使⽤。

## **Spring 使⽤了哪些设计模式？**

Spring 框架中⽤到了哪些设计模式？

 **⼯⼚设计模式** : Spring 使⽤⼯⼚模式通过

BeanFactory 、 ApplicationContext 创建 bean 对象。

 **代理设计模式** : Spring AOP 功能的实现。

 **单例设计模式** : Spring 中的 Bean 默认都是单例的。

 **模板⽅法模式** : Spring 中  jdbcTemplate 、 hibernateTemplate 等以Template 结尾的对数据库操作的类，它们就使⽤到了模板模式。

 **包装器设计模式** : 我们的项⽬需要连接多个数据库，⽽且不同的客户在 每次访问中根据需要会去访问不同的数据库。这种模式让我们可以根据 客户的需求能够动态切换不同的数据源。

 **观察者模式 :** Spring 事件驱动模型就是观察者模式很经典的⼀个应⽤。

使⽤到了适配器模式、 spring MVC 中也是⽤到了适配器模式适配 Controller



## **JDK 使⽤了哪些设计模式？**

在软件⼯程中，设计模式（ design pattern）是对软件设计中普遍存在（反 复出现）的各种问题，所提出的解决⽅案。以下是整理的⼏个在 JDK 库中 常⽤的⼏个设计模式。

### **桥接模式**

这个模式将抽象和抽象操作的实现进⾏了解耦，这样使得抽象和实现可以 独⽴地变化。

GOF 在提出桥梁模式的时候指出，桥梁模式的⽤意是 ”将抽象化 (Abstraction)与实现化 (Implementation)脱耦，使得⼆者可以独⽴地变化 ”。 这句话有三个关键词，也就是抽象化、实现化和脱耦。

在 Java 应⽤中，对于桥接模式有⼀个⾮常典型的例⼦，就是应⽤程序使⽤ JDBC 驱动程序进⾏开发的⽅式。所谓驱动程序，指的是按照预先约定好 的接⼝来操作计算机系统或者是外围设备的程序。

### **适配器模式**

⽤来把⼀个接⼝转化成另⼀个接⼝。使得原本由于接⼝不兼容⽽不能⼀起 ⼯作的那些类可以在⼀起⼯作。

```java
java.util.Arrays#asList() 
java.io.InputStreamReader(InputStream)
java.io.OutputStreamWriter(OutputStream)
```

### **组合模式**

⼜叫做部分 -整体模式，使得客户端看来单个对象和对象的组合是同等的。 换句话说，某个类型的⽅法同时也接受⾃身类型作为参数。

```java
java.util.Map#putAll(Map) 
java.util.List#addAll(Collection) 
java.util.Set#addAll(Collection)
```

### **装饰者模式**

动态的给⼀个对象附加额外的功能，这也是⼦类的⼀种替代⽅式。可以看 到，在创建⼀个类型的时候，同时也传⼊同⼀类型的对象。这在 JDK ⾥随 处可⻅，你会发现它⽆处不在，所以下⾯这个列表只是⼀⼩部分。

```java
java.io.BufferedInputStream(InputStream) 
java.io.DataInputStream(InputStream) 
java.io.BufferedOutputStream(OutputStream) 
java.util.zip.ZipOutputStream(OutputStream) 
java.util.Collections#checkedList|Map|Set|SortedSet|Sort edMap
```

### **享元模式**

使⽤缓存来加速⼤量⼩对象的访问时间。

```java
java.lang.Integer#valueOf(int) 

java.lang.Boolean#valueOf(boolean) 

java.lang.Byte#valueOf(byte) 

java.lang.Character#valueOf(char)
```

### **代理模式**

代理模式是⽤⼀个简单的对象来代替⼀个复杂的或者创建耗时的对象。

```java
java.lang.reflect.Proxy
RMI
```

### **抽象⼯⼚模式**

抽象⼯⼚模式提供了⼀个协议来⽣成⼀系列的相关或者独⽴的对象，⽽不 ⽤指定具体对象的类型。它使得应⽤程序能够和使⽤的框架的具体实现进 ⾏解耦。这在 JDK 或者许多框架⽐如 Spring 中都随处可⻅。它们也很容 易识别，⼀个创建新对象的⽅法，返回的却是接⼝或者抽象类的，就是抽 象⼯⼚模式了。

```java
java.util.Calendar#getInstance() 
java.util.Arrays#asList() 
java.util.ResourceBundle#getBundle() 
java.sql.DriverManager#getConnection() 
java.sql.Connection#createStatement() 
java.sql.Statement#executeQuery() 
java.text.NumberFormat#getInstance() 
javax.xml.transform.TransformerFactory#newInstance()
```

### **建造者模式**

定义了⼀个新的类来构建另⼀个类的实例，以简化复杂对象的创建。建造 模式通常也使⽤⽅法链接来实现。

```java
java.lang.StringBuilder#append() 
java.lang.StringBuffer#append() 
java.sql.PreparedStatement 
javax.swing.GroupLayout.Group#addComponent()
```

**⼯⼚⽅法** 就是⼀个返回具体对象的⽅法。

```java
java.lang.Proxy#newProxyInstance() 
java.lang.Object#toString() 
java.lang.Class#newInstance() 
java.lang.reflect.Array#newInstance() 
java.lang.reflect.Constructor#newInstance() 
java.lang.Boolean#valueOf(String) 
java.lang.Class#forName()
```

### **原型模式**

使得类的实例能够⽣成⾃身的拷⻉。如果创建⼀个对象的实例⾮常复杂且 耗时时，就可以使⽤这种模式，⽽不重新创建⼀个新的实例，你可以拷⻉ ⼀个对象并直接修改它。

```java
java.lang.Object#clone() 
java.lang.Cloneable
```

### **单例模式**

⽤来确保类只有⼀个实例。 Joshua Bloch 在 Effetive Java 中建议到，还有 ⼀种⽅法就是使⽤枚举。

```java
java.lang.Runtime#getRuntime() 
java.awt.Toolkit#getDefaultToolkit() 
java.awt.GraphicsEnvironment#getLocalGraphicsEnvironment ()
java.awt.Desktop#getDesktop()
```

### **责任链模式**

通过把请求从⼀个对象传递到链条中下⼀个对象的⽅式，直到请求被处理 完毕，以实现对象间的解耦。

```java
java.util.logging.Logger#log() 
javax.servlet.Filter#doFilter()
```

### **命令模式**

将操作封装到对象内，以便存储，传递和返回。

```java
java.lang.Runnable 
javax.swing.Action
```

### **解释器模式**

这个模式通常定义了⼀个语⾔的语法，然后解析相应语法的语句。

```java
java.util.Pattern 
java.text.Normalizer 
java.text.Format
```



### **迭代器模式**

提供⼀个⼀致的⽅法来顺序访问集合中的对象，这个⽅法与底层的集合的 具体实现⽆关。

```java
java.util.Iterator 

java.util.Enumeration
```

### **中介者模式**

通过使⽤⼀个中间对象来进⾏消息分发以及减少类之间的直接依赖。

```java
java.util.Timer 

java.util.concurrent.Executor#execute() 

java.util.concurrent.ExecutorService#submit() 

java.lang.reflect.Method#invoke()
```

### **备忘录模式**

⽣成对象状态的⼀个快照，以便对象可以恢复原始状态⽽不⽤暴露⾃身的 内容。  Date 对象通过⾃身内部的⼀个 long 值来实现备忘录模式。

```java
java.util.Date 

java.io.Serializable
```

### **空对象模式**

这个模式通过⼀个⽆意义的对象来代替没有对象这个状态。它使得你不⽤ 额外对空对象进⾏处理。

```java
java.util.Collections#emptyList() 

java.util.Collections#emptyMap() 

java.util.Collections#emptySet()
```

### **观察者模式**

它使得⼀个对象可以灵活的将消息发送给感兴趣的对象。

```java
java.util.EventListener 
javax.servlet.http.HttpSessionBindingListener 
javax.servlet.http.HttpSessionAttributeListener 
javax.faces.event.PhaseListener
```

### **状态模式**

通过改变对象内部的状态，使得你可以在运⾏时动态改变⼀个对象的⾏ 为。

```java
java.util.Iterator 

javax.faces.lifecycle.LifeCycle#execute()
```

### **策略模式**

使⽤这个模式来将⼀组算法封装成⼀系列对象。通过传递这些对象可以灵 活的改变程序的功能。

```java
java.util.Comparator#compare() 
javax.servlet.http.HttpServlet 
javax.servlet.Filter#doFilter()
```

### **模板⽅法模式**

让⼦类可以重写⽅法的⼀部分，⽽不是整个重写，你可以控制⼦类需要重 写那些操作。

```java
java.util.Collections#sort() 
java.io.InputStream#skip() 
java.io.InputStream#read() 
java.util.AbstractList#indexOf()
```

### **访问者模式**

提供⼀个⽅便的可维护的⽅式来操作⼀组对象。它使得你在不改变操作的 对象前提下，可以修改或者扩展对象的⾏为。

```java
javax.lang.model.element.Element
javax.lang.model.element.ElementVisitor 
javax.lang.model.type.TypeMirror
javax.lang.model.type.TypeVisitor
```

