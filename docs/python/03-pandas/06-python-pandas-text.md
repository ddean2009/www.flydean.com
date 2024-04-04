---
slug: /06-python-pandas-text
---

# 6. Pandas高级教程之:处理text数据



# 简介

在1.0之前，只有一种形式来存储text数据，那就是object。在1.0之后，添加了一个新的数据类型叫做StringDtype 。今天将会给大家讲解Pandas中text中的那些事。

# 创建text的DF

先看下常见的使用text来构建DF的例子：

```
In [1]: pd.Series(['a', 'b', 'c'])
Out[1]: 
0    a
1    b
2    c
dtype: object
```

如果要使用新的StringDtype，可以这样：

```
In [2]: pd.Series(['a', 'b', 'c'], dtype="string")
Out[2]: 
0    a
1    b
2    c
dtype: string

In [3]: pd.Series(['a', 'b', 'c'], dtype=pd.StringDtype())
Out[3]: 
0    a
1    b
2    c
dtype: string
```

或者使用astype进行转换：

```
In [4]: s = pd.Series(['a', 'b', 'c'])

In [5]: s
Out[5]: 
0    a
1    b
2    c
dtype: object

In [6]: s.astype("string")
Out[6]: 
0    a
1    b
2    c
dtype: string
```

# String 的方法

String可以转换成大写，小写和统计它的长度：

```
In [24]: s = pd.Series(['A', 'B', 'C', 'Aaba', 'Baca', np.nan, 'CABA', 'dog', 'cat'],
   ....:               dtype="string")
   ....: 

In [25]: s.str.lower()
Out[25]: 
0       a
1       b
2       c
3    aaba
4    baca
5    <NA>
6    caba
7     dog
8     cat
dtype: string

In [26]: s.str.upper()
Out[26]: 
0       A
1       B
2       C
3    AABA
4    BACA
5    <NA>
6    CABA
7     DOG
8     CAT
dtype: string

In [27]: s.str.len()
Out[27]: 
0       1
1       1
2       1
3       4
4       4
5    <NA>
6       4
7       3
8       3
dtype: Int64
```

还可以进行trip操作：

```
In [28]: idx = pd.Index([' jack', 'jill ', ' jesse ', 'frank'])

In [29]: idx.str.strip()
Out[29]: Index(['jack', 'jill', 'jesse', 'frank'], dtype='object')

In [30]: idx.str.lstrip()
Out[30]: Index(['jack', 'jill ', 'jesse ', 'frank'], dtype='object')

In [31]: idx.str.rstrip()
Out[31]: Index([' jack', 'jill', ' jesse', 'frank'], dtype='object')
```

# columns的String操作

因为columns是String表示的，所以可以按照普通的String方式来操作columns：

```
In [34]: df.columns.str.strip()
Out[34]: Index(['Column A', 'Column B'], dtype='object')

In [35]: df.columns.str.lower()
Out[35]: Index([' column a ', ' column b '], dtype='object')
```

```
In [32]: df = pd.DataFrame(np.random.randn(3, 2),
   ....:                   columns=[' Column A ', ' Column B '], index=range(3))
   ....: 

In [33]: df
Out[33]: 
    Column A    Column B 
0    0.469112   -0.282863
1   -1.509059   -1.135632
2    1.212112   -0.173215
```

# 分割和替换String

Split可以将一个String切分成一个数组。

```
In [38]: s2 = pd.Series(['a_b_c', 'c_d_e', np.nan, 'f_g_h'], dtype="string")

In [39]: s2.str.split('_')
Out[39]: 
0    [a, b, c]
1    [c, d, e]
2         <NA>
3    [f, g, h]
dtype: object
```

要想访问split之后数组中的字符，可以这样：

```
In [40]: s2.str.split('_').str.get(1)
Out[40]: 
0       b
1       d
2    <NA>
3       g
dtype: object

In [41]: s2.str.split('_').str[1]
Out[41]: 
0       b
1       d
2    <NA>
3       g
dtype: object
```

使用 expand=True  可以 将split过后的数组 扩展成为多列：

```
In [42]: s2.str.split('_', expand=True)
Out[42]: 
      0     1     2
0     a     b     c
1     c     d     e
2  <NA>  <NA>  <NA>
3     f     g     h
```

可以指定分割列的个数：

```
In [43]: s2.str.split('_', expand=True, n=1)
Out[43]: 
      0     1
0     a   b_c
1     c   d_e
2  <NA>  <NA>
3     f   g_h
```

replace用来进行字符的替换，在替换过程中还可以使用正则表达式：

```
s3.str.replace('^.a|dog', 'XX-XX ', case=False)
```

# String的连接

使用cat 可以连接 String：

```
In [64]: s = pd.Series(['a', 'b', 'c', 'd'], dtype="string")

In [65]: s.str.cat(sep=',')
Out[65]: 'a,b,c,d'
```

# 使用 .str来index

 pd.Series会返回一个Series，如果Series中是字符串的话，可通过index来访问列的字符，举个例子：

```
In [99]: s = pd.Series(['A', 'B', 'C', 'Aaba', 'Baca', np.nan,
   ....:                'CABA', 'dog', 'cat'],
   ....:               dtype="string")
   ....: 

In [100]: s.str[0]
Out[100]: 
0       A
1       B
2       C
3       A
4       B
5    <NA>
6       C
7       d
8       c
dtype: string

In [101]: s.str[1]
Out[101]: 
0    <NA>
1    <NA>
2    <NA>
3       a
4       a
5    <NA>
6       A
7       o
8       a
dtype: string
```

# extract

 Extract用来从String中解压数据，它接收一个 expand参数，在0.23版本之前， 这个参数默认是False。如果是false，extract会返回Series，index或者DF 。如果expand=true，那么会返回DF。0.23版本之后，默认是true。

extract通常是和正则表达式一起使用的。

```
In [102]: pd.Series(['a1', 'b2', 'c3'],
   .....:           dtype="string").str.extract(r'([ab])(\d)', expand=False)
   .....: 
Out[102]: 
      0     1
0     a     1
1     b     2
2  <NA>  <NA>
```

上面的例子将Series中的每一字符串都按照正则表达式来进行分解。前面一部分是字符，后面一部分是数字。

> 注意，只有正则表达式中group的数据才会被extract .

下面的就只会extract数字：

```
In [106]: pd.Series(['a1', 'b2', 'c3'],
   .....:           dtype="string").str.extract(r'[ab](\d)', expand=False)
   .....: 
Out[106]: 
0       1
1       2
2    <NA>
dtype: string
```

还可以指定列的名字如下：

```
In [103]: pd.Series(['a1', 'b2', 'c3'],
   .....:           dtype="string").str.extract(r'(?P<letter>[ab])(?P<digit>\d)',
   .....:                                       expand=False)
   .....: 
Out[103]: 
  letter digit
0      a     1
1      b     2
2   <NA>  <NA>
```

# extractall

和extract相似的还有extractall，不同的是extract只会匹配第一次，而extractall会做所有的匹配，举个例子：

```
In [112]: s = pd.Series(["a1a2", "b1", "c1"], index=["A", "B", "C"],
   .....:               dtype="string")
   .....: 

In [113]: s
Out[113]: 
A    a1a2
B      b1
C      c1
dtype: string

In [114]: two_groups = '(?P<letter>[a-z])(?P<digit>[0-9])'

In [115]: s.str.extract(two_groups, expand=True)
Out[115]: 
  letter digit
A      a     1
B      b     1
C      c     1
```

extract匹配到a1之后就不会继续了。

```
In [116]: s.str.extractall(two_groups)
Out[116]: 
        letter digit
  match             
A 0          a     1
  1          a     2
B 0          b     1
C 0          c     1
```

extractall匹配了a1之后还会匹配a2。

# contains 和 match

contains 和 match用来测试DF中是否含有特定的数据：

```
In [127]: pd.Series(['1', '2', '3a', '3b', '03c', '4dx'],
   .....:           dtype="string").str.contains(pattern)
   .....: 
Out[127]: 
0    False
1    False
2     True
3     True
4     True
5     True
dtype: boolean
```

```
In [128]: pd.Series(['1', '2', '3a', '3b', '03c', '4dx'],
   .....:           dtype="string").str.match(pattern)
   .....: 
Out[128]: 
0    False
1    False
2     True
3     True
4    False
5     True
dtype: boolean
```

```
In [129]: pd.Series(['1', '2', '3a', '3b', '03c', '4dx'],
   .....:           dtype="string").str.fullmatch(pattern)
   .....: 
Out[129]: 
0    False
1    False
2     True
3     True
4    False
5    False
dtype: boolean
```

# String方法总结

最后总结一下String的方法：

| Method          | Description                                                  |
| :-------------- | :----------------------------------------------------------- |
| cat()           | Concatenate strings                                          |
| split()         | Split strings on delimiter                                   |
| rsplit()        | Split strings on delimiter working from the end of the string |
| get()           | Index into each element (retrieve i-th element)              |
| join()          | Join strings in each element of the Series with passed separator |
| get_dummies()   | Split strings on the delimiter returning DataFrame of dummy variables |
| contains()      | Return boolean array if each string contains pattern/regex   |
| replace()       | Replace occurrences of pattern/regex/string with some other string or the return value of a callable given the occurrence |
| repeat()        | Duplicate values (s.str.repeat(3) equivalent to x * 3)       |
| pad()           | Add whitespace to left, right, or both sides of strings      |
| center()        | Equivalent to str.center                                     |
| ljust()         | Equivalent to str.ljust                                      |
| rjust()         | Equivalent to str.rjust                                      |
| zfill()         | Equivalent to str.zfill                                      |
| wrap()          | Split long strings into lines with length less than a given width |
| slice()         | Slice each string in the Series                              |
| slice_replace() | Replace slice in each string with passed value               |
| count()         | Count occurrences of pattern                                 |
| startswith()    | Equivalent to str.startswith(pat) for each element           |
| endswith()      | Equivalent to str.endswith(pat) for each element             |
| findall()       | Compute list of all occurrences of pattern/regex for each string |
| match()         | Call re.match on each element, returning matched groups as list |
| extract()       | Call re.search on each element, returning DataFrame with one row for each element and one column for each regex capture group |
| extractall()    | Call re.findall on each element, returning DataFrame with one row for each match and one column for each regex capture group |
| len()           | Compute string lengths                                       |
| strip()         | Equivalent to str.strip                                      |
| rstrip()        | Equivalent to str.rstrip                                     |
| lstrip()        | Equivalent to str.lstrip                                     |
| partition()     | Equivalent to str.partition                                  |
| rpartition()    | Equivalent to str.rpartition                                 |
| lower()         | Equivalent to str.lower                                      |
| casefold()      | Equivalent to str.casefold                                   |
| upper()         | Equivalent to str.upper                                      |
| find()          | Equivalent to str.find                                       |
| rfind()         | Equivalent to str.rfind                                      |
| index()         | Equivalent to str.index                                      |
| rindex()        | Equivalent to str.rindex                                     |
| capitalize()    | Equivalent to str.capitalize                                 |
| swapcase()      | Equivalent to str.swapcase                                   |
| normalize()     | Return Unicode normal form. Equivalent to unicodedata.normalize |
| translate()     | Equivalent to str.translate                                  |
| isalnum()       | Equivalent to str.isalnum                                    |
| isalpha()       | Equivalent to str.isalpha                                    |
| isdigit()       | Equivalent to str.isdigit                                    |
| isspace()       | Equivalent to str.isspace                                    |
| islower()       | Equivalent to str.islower                                    |
| isupper()       | Equivalent to str.isupper                                    |
| istitle()       | Equivalent to str.istitle                                    |
| isnumeric()     | Equivalent to str.isnumeric                                  |
| isdecimal()     | Equivalent to str.isdecimal                                  |



> 本文已收录于 [www.flydean.com](http://www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！
