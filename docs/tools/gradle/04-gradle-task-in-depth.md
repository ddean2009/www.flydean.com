---
slug: /gradle-task-in-depth
---

# 4. 深入理解gradle中的task

# 简介

在之前的文章中，我们讲到了如何使用gradle创建一个简单的task，以及task之间怎么依赖，甚至使用了程序来创建task。在本文中，我们会更加深入的去了解一下gradle中的task。

# 定义task

定义一个task可以有很多种方式，比如下面的使用string作为task的名字：

~~~java
task('hello') {
    doLast {
        println "hello"
    }
}

task('copy', type: Copy) {
    from(file('srcDir'))
    into(buildDir)
}
~~~

还可以使用tasks容器来创建：

~~~java
tasks.create('hello') {
    doLast {
        println "hello"
    }
}

tasks.create('copy', Copy) {
    from(file('srcDir'))
    into(buildDir)
}
~~~

上面的例子中，我们使用tasks.create方法，将新创建的task加到tasks集合中。

我们还可以使用groovy特有的语法来定义一个task：

~~~java
task(hello) {
    doLast {
        println "hello"
    }
}

task(copy, type: Copy) {
    from(file('srcDir'))
    into(buildDir)
}
~~~

# tasks 集合类

上面我们在创建task的时候，使用了tasks集合类来创建task。

实际上，tasks集合类是一个非常有用的工具类，我们可以使用它来做很多事情。

直接在build文件中使用tasks，实际上是引用了TaskContainer的一个实例对象。我们还可以使用 `Project.getTasks()` 来获取这个实例对象。

我们看下TaskContainer的定义：

~~~java
public interface TaskContainer extends TaskCollection<Task>, PolymorphicDomainObjectContainer<Task> 
~~~

从定义上，我们可以看出TaskContainer是一个task的集合和域对象的集合。

taskContainer中有四类非常重要的方法：

第一类是定位task的方法，有个分别是findByPath和getByPath。两个方法的区别就是findByPath如果没找到会返回null，而getByPath没找到的话会抛出UnknownTaskException。

看下怎么使用：

~~~java
task hello

println tasks.getByPath('hello').path
println tasks.getByPath(':hello').path
~~~

输出：

~~~java
:hello
:hello
~~~

第二类是创建task的方法create，create方法有多种实现，你可以直接通过名字来创建一个task：

~~~java
task('hello') {
    doLast {
        println "hello"
    }
}
~~~

也可以创建特定类型的task：

~~~java
task('copy', type: Copy) {
    from(file('srcDir'))
    into(buildDir)
}
~~~

还可以创建带参数的构造函数的task：

~~~java
class CustomTask extends DefaultTask {
    final String message
    final int number

    @Inject
    CustomTask(String message, int number) {
        this.message = message
        this.number = number
    }
}
~~~

上面我们为CustomTask创建了一个带参数的构造函数，注意，这里需要带上@javax.inject.Inject注解，表示我们后面可以传递参数给这个构造函数。

我们可以这样使用：

~~~java
tasks.create('myTask', CustomTask, 'hello', 42)
~~~

也可以这样使用：

~~~java
task myTask(type: CustomTask, constructorArgs: ['hello', 42])
~~~

第三类是register，register也是用来创建新的task的，不过register执行的是延迟创建。也就是说只有当task被需要使用的时候才会被创建。

我们先看一个register方法的定义：

~~~java
TaskProvider<Task> register​(String name,
                            Action<? super Task> configurationAction)
                     throws InvalidUserDataException 
~~~

可以看到register返回了一个TaskProvider，有点像java多线程中的callable,当我们调用Provider.get()获取task值的时候，才会去创建这个task。

或者我们调用TaskCollection.getByName(java.lang.String)的时候也会创建对应的task。

最后一类是replace方法：

~~~java
Task replace​(String name)
<T extends Task> T replace​(String name,
                           Class<T> type)
~~~

replace的作用就是创建一个新的task，并且替换掉同样名字的老的task。

# Task 之间的依赖

task之间的依赖关系是通过task name来决定的。我们可以在同一个项目中做task之间的依赖：

~~~java
task hello {
    doLast {
        println 'Hello www.flydean.com!'
    }
}
task intro {
    dependsOn hello
    doLast {
        println "I'm flydean"
    }
}
~~~

也可以跨项目进行task的依赖，如果是跨项目的task依赖的话，需要制定task的路径：

~~~java
project('project-a') {
    task taskX {
        dependsOn ':project-b:taskY'
        doLast {
            println 'taskX'
        }
    }
}

project('project-b') {
    task taskY {
        doLast {
            println 'taskY'
        }
    }
}
~~~

或者我们可以在定义好task之后，再处理task之间的依赖关系：

~~~java
task taskX {
    doLast {
        println 'taskX'
    }
}

task taskY {
    doLast {
        println 'taskY'
    }
}
~~~

还可以动态添加依赖关系：

~~~java
task taskX {
    doLast {
        println 'taskX'
    }
}

// Using a Groovy Closure
taskX.dependsOn {
    tasks.findAll { task -> task.name.startsWith('lib') }
}

task lib1 {
    doLast {
        println 'lib1'
    }
}

task lib2 {
    doLast {
        println 'lib2'
    }
}

task notALib {
    doLast {
        println 'notALib'
    }
}
~~~

# 定义task之间的顺序

有时候我们的task之间是有执行顺序的，我们称之为对task的排序ordering。

先看一下ordering和dependency有什么区别。dependency表示的是一种强依赖关系，如果taskA依赖于taskB，那么执行taskA的时候一定要先执行taskB。

而ordering则是一种并不太强列的顺序关系。表示taskA需要在taskB之后执行，但是taskB不执行也可以。

在gradle中有两种order：分别是must run after和should run after。

taskA.mustRunAfter(taskB)表示必须遵守的顺序关系，而taskA.shouldRunAfter(taskB)则不是必须的，在下面两种情况下可以忽略这样的顺序关系：
第一种情况是如果shouldRunAfter引入了order循环的时候。

第二种情况是如果在并行执行的情况下，task所有的依赖关系都已经满足了，那么也会忽略这个顺序。

我们看下怎么使用：

~~~java
task taskX {
    doLast {
        println 'flydean.com'
    }
}
task taskY {
    doLast {
        println 'hello'
    }
}
taskY.mustRunAfter taskX
//taskY.shouldRunAfter taskX
~~~

# 给task一些描述

我们可以给task一些描述信息，这样我们在执行gradle tasks的时候，就可以查看到：

~~~java
task copy(type: Copy) {
   description 'Copies the resource directory to the target directory.'
   from 'resources'
   into 'target'
   include('**/*.txt', '**/*.xml', '**/*.properties')
}
~~~

# task的条件执行

有时候我们需要根据build文件中的某些属性来判断是否执行特定的task，我们可以使用onlyIf ：

~~~java
task hello {
    doLast {
        println 'www.flydean.com'
    }
}

hello.onlyIf { !project.hasProperty('skipHello') }
~~~

或者我们可以抛出StopExecutionException异常，如果遇到这个异常，那么task后面的任务将不会被执行：

~~~java
task compile {
    doLast {
        println 'We are doing the compile.'
    }
}

compile.doFirst {
    if (true) { throw new StopExecutionException() }
}
task myTask {
    dependsOn('compile')
    doLast {
        println 'I am not affected'
    }
}
~~~

我们还可以启动和禁用task：

~~~java
myTask.enabled = false
~~~

最后我们还可以让task超时，当超时的时候，执行task的线程将会被中断，并且task将会被标记为failed。

如果我们想继续执行，那么可以使用 --continue。 

> 注意， 只有能够响应中断的task，timeout才有用。

~~~java
task hangingTask() {
    doLast {
        Thread.sleep(100000)
    }
    timeout = Duration.ofMillis(500)
}
~~~

# task rule

如果我们想要给某些task定义一些规则，那么可以使用tasks.addRule：

~~~java
tasks.addRule("Pattern: ping<ID>") { String taskName ->
    if (taskName.startsWith("ping")) {
        task(taskName) {
            doLast {
                println "Pinging: " + (taskName - 'ping')
            }
        }
    }
}
~~~

上我们定义了一个rule，如果taskName是以ping开头的话，那么将会输出对应的内容。

看下运行结果：

~~~java
> gradle -q pingServer1
Pinging: Server1
~~~

我还可以将这些rules作为依赖项引入：

~~~java
task groupPing {
    dependsOn pingServer1, pingServer2
}
~~~

# Finalizer tasks

和java中的finally一样，task也可以指定对应的finalize task：

~~~java
task taskX {
    doLast {
        println 'taskX'
    }
}
task taskY {
    doLast {
        println 'taskY'
    }
}

taskX.finalizedBy taskY

> gradle -q taskX
taskX
taskY
~~~

finalize task是一定会被执行的，即使上面的taskX中抛出了异常。

# 总结

以上就是gradle中task的详解，希望大家能够喜欢。

> 本文已收录于 [www.flydean.com](www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！







