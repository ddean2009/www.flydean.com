---
slug: /04-python-condition-control
---

# 4. Python基础之:Python中的流程控制



# 简介

流程控制无非就是if else之类的控制语句，今天我们来看一下Python中的流程控制会有什么不太一样的地方。

# while语句

python中的while语句和其他语言没有什么不一样，我使用while语句来编写一个斐波拉赫数列：

~~~shell
In [56]: while x < 10 :
    ...:     print(x)
    ...:     x, y = y, x+y
    ...:
0
1
1
2
3
5
8
~~~

# if 语句

python中的 if 可以和 elif 或者 else 配合使用：

~~~shell
>>> x = int(input("Please enter an integer: "))
Please enter an integer: 42
>>> if x < 0:
...     x = 0
...     print('Negative changed to zero')
... elif x == 0:
...     print('Zero')
... elif x == 1:
...     print('Single')
... else:
...     print('More')
...
More
~~~

if语句很简单，这里就不做过多的介绍。

# for语句

Python中的for语句主要用来对序列进行迭代，比如列表或者字符串：

~~~shell
In [57]:  ages = [ 10, 14, 18, 20 ,25]

In [58]: for age in ages:
    ...:     print(age)
    ...:
10
14
18
20
25
~~~

遍历过程中，为了防止在遍历的时候原序列被修改，我们可以遍历序列的拷贝：

~~~shell
In [59]: for age in ages.copy():
    ...:     print(age)
    ...:
10
14
18
20
25
~~~

for语句和range()函数的结合，可以得到不一样的效果。

range()用来生成给定范围内的集合：

~~~shell
In [61]: for age in range(5):
    ...:     print(age)
    ...:
0
1
2
3
4
~~~

range()函数还可以带步长作为第三个参数：

~~~shell
In [62]: for age in range(5, 10 , 2):
    ...:     print(age)
    ...:
5
7
9
~~~

Range()和len()组合，可以方便的变量列表：

~~~shell
>>> a = ['Mary', 'had', 'a', 'little', 'lamb']
>>> for i in range(len(a)):
...     print(i, a[i])
...
0 Mary
1 had
2 a
3 little
4 lamb
~~~

# Break

break用来跳出最近的for或者while循环。

要注意的是，for循环可以和else一起使用：

~~~shell
In [64]: for n in range(2, 10):
    ...:     for x in range(2, n):
    ...:         if n % x == 0:
    ...:             print(n, 'equals', x, '*', n//x)
    ...:             break
    ...:     else:
    ...:         print(n, 'is a prime number')
    ...:
2 is a prime number
3 is a prime number
4 equals 2 * 2
5 is a prime number
6 equals 2 * 3
7 is a prime number
8 equals 2 * 4
9 equals 3 * 3
~~~

循环中的else语句，会在for循环执行完毕，之后执行。如果我们使用break对for循环进行了中断，那么else语句将不会被执行。

# Continue

continue用来跳过此次循环中的后面部分，继续执行下一次循环。

还是刚才的例子，我们使用continue进行改装：

~~~shell
In [68]: for n in range(2, 10):
    ...:     for x in range(2, n):
    ...:         if n % x == 0:
    ...:               print(n, 'equals', x, '*', n//x)
    ...:               continue
    ...:     else:
    ...:         print(n, 'is a prime number')
    ...:
2 is a prime number
3 is a prime number
4 equals 2 * 2
4 is a prime number
5 is a prime number
6 equals 2 * 3
6 equals 3 * 2
6 is a prime number
7 is a prime number
8 equals 2 * 4
8 equals 4 * 2
8 is a prime number
9 equals 3 * 3
9 is a prime number
~~~

可以看到，在continue中，else语句会一直执行。

# pass

pass表示的是什么都不做。是一个空的执行。

通常我们使用pass作为函数或条件子语句的占位符，表示具体的内容可以在未来进行填充。

可以在while中使用pass：

~~~shell
>>> while True:
...     pass  # Busy-wait for keyboard interrupt (Ctrl+C)
...
~~~

可以在类中使用pass：

~~~shell
>>> class MyEmptyClass:
...     pass
...
~~~

可以在函数中使用pass：

~~~shell
>>> def initlog(*args):
...     pass   # Remember to implement this!
...
~~~



