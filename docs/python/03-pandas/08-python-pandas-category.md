---
slug: /08-python-pandas-category
---

# 8. Pandas高级教程之:category数据类型



# 简介

Pandas中有一种特殊的数据类型叫做category。它表示的是一个类别，一般用在统计分类中，比如性别，血型，分类，级别等等。有点像java中的enum。

今天给大家详细讲解一下category的用法。

# 创建category

## 使用Series创建

在创建Series的同时添加dtype="category"就可以创建好category了。category分为两部分，一部分是order，一部分是字面量：

```
In [1]: s = pd.Series(["a", "b", "c", "a"], dtype="category")

In [2]: s
Out[2]: 
0    a
1    b
2    c
3    a
dtype: category
Categories (3, object): ['a', 'b', 'c']
```

可以将DF中的Series转换为category：

```
In [3]: df = pd.DataFrame({"A": ["a", "b", "c", "a"]})

In [4]: df["B"] = df["A"].astype("category")

In [5]: df["B"]
Out[32]: 
0    a
1    b
2    c
3    a
Name: B, dtype: category
Categories (3, object): [a, b, c]
```

可以创建好一个[`pandas.Categorical`](https://pandas.pydata.org/docs/reference/api/pandas.Categorical.html#pandas.Categorical) ，将其作为参数传递给Series：

```
In [10]: raw_cat = pd.Categorical(
   ....:     ["a", "b", "c", "a"], categories=["b", "c", "d"], ordered=False
   ....: )
   ....: 

In [11]: s = pd.Series(raw_cat)

In [12]: s
Out[12]: 
0    NaN
1      b
2      c
3    NaN
dtype: category
Categories (3, object): ['b', 'c', 'd']
```

## 使用DF创建

创建DataFrame的时候，也可以传入 dtype="category"：

```
In [17]: df = pd.DataFrame({"A": list("abca"), "B": list("bccd")}, dtype="category")

In [18]: df.dtypes
Out[18]: 
A    category
B    category
dtype: object
```

DF中的A和B都是一个category:

```
In [19]: df["A"]
Out[19]: 
0    a
1    b
2    c
3    a
Name: A, dtype: category
Categories (3, object): ['a', 'b', 'c']

In [20]: df["B"]
Out[20]: 
0    b
1    c
2    c
3    d
Name: B, dtype: category
Categories (3, object): ['b', 'c', 'd']
```

或者使用df.astype("category")将DF中所有的Series转换为category:

```
In [21]: df = pd.DataFrame({"A": list("abca"), "B": list("bccd")})

In [22]: df_cat = df.astype("category")

In [23]: df_cat.dtypes
Out[23]: 
A    category
B    category
dtype: object
```

## 创建控制

默认情况下传入dtype='category' 创建出来的category使用的是默认值：

1. Categories是从数据中推断出来的。
2. Categories是没有大小顺序的。

可以显示创建CategoricalDtype来修改上面的两个默认值：

```
In [26]: from pandas.api.types import CategoricalDtype

In [27]: s = pd.Series(["a", "b", "c", "a"])

In [28]: cat_type = CategoricalDtype(categories=["b", "c", "d"], ordered=True)

In [29]: s_cat = s.astype(cat_type)

In [30]: s_cat
Out[30]: 
0    NaN
1      b
2      c
3    NaN
dtype: category
Categories (3, object): ['b' < 'c' < 'd']
```

同样的CategoricalDtype还可以用在DF中：

```
In [31]: from pandas.api.types import CategoricalDtype

In [32]: df = pd.DataFrame({"A": list("abca"), "B": list("bccd")})

In [33]: cat_type = CategoricalDtype(categories=list("abcd"), ordered=True)

In [34]: df_cat = df.astype(cat_type)

In [35]: df_cat["A"]
Out[35]: 
0    a
1    b
2    c
3    a
Name: A, dtype: category
Categories (4, object): ['a' < 'b' < 'c' < 'd']

In [36]: df_cat["B"]
Out[36]: 
0    b
1    c
2    c
3    d
Name: B, dtype: category
Categories (4, object): ['a' < 'b' < 'c' < 'd']
```

## 转换为原始类型

使用`Series.astype(original_dtype)` 或者 `np.asarray(categorical)`可以将Category转换为原始类型：

```
In [39]: s = pd.Series(["a", "b", "c", "a"])

In [40]: s
Out[40]: 
0    a
1    b
2    c
3    a
dtype: object

In [41]: s2 = s.astype("category")

In [42]: s2
Out[42]: 
0    a
1    b
2    c
3    a
dtype: category
Categories (3, object): ['a', 'b', 'c']

In [43]: s2.astype(str)
Out[43]: 
0    a
1    b
2    c
3    a
dtype: object

In [44]: np.asarray(s2)
Out[44]: array(['a', 'b', 'c', 'a'], dtype=object)
```

# categories的操作

## 获取category的属性

Categorical数据有 `categories` 和 `ordered` 两个属性。可以通过`s.cat.categories` 和 `s.cat.ordered`来获取：

```
In [57]: s = pd.Series(["a", "b", "c", "a"], dtype="category")

In [58]: s.cat.categories
Out[58]: Index(['a', 'b', 'c'], dtype='object')

In [59]: s.cat.ordered
Out[59]: False
```

重排category的顺序：

```
In [60]: s = pd.Series(pd.Categorical(["a", "b", "c", "a"], categories=["c", "b", "a"]))

In [61]: s.cat.categories
Out[61]: Index(['c', 'b', 'a'], dtype='object')

In [62]: s.cat.ordered
Out[62]: False
```

## 重命名categories

通过给s.cat.categories赋值可以重命名categories:

```
In [67]: s = pd.Series(["a", "b", "c", "a"], dtype="category")

In [68]: s
Out[68]: 
0    a
1    b
2    c
3    a
dtype: category
Categories (3, object): ['a', 'b', 'c']

In [69]: s.cat.categories = ["Group %s" % g for g in s.cat.categories]

In [70]: s
Out[70]: 
0    Group a
1    Group b
2    Group c
3    Group a
dtype: category
Categories (3, object): ['Group a', 'Group b', 'Group c']
```

使用rename_categories可以达到同样的效果：

```
In [71]: s = s.cat.rename_categories([1, 2, 3])

In [72]: s
Out[72]: 
0    1
1    2
2    3
3    1
dtype: category
Categories (3, int64): [1, 2, 3]
```

或者使用字典对象：

```
# You can also pass a dict-like object to map the renaming
In [73]: s = s.cat.rename_categories({1: "x", 2: "y", 3: "z"})

In [74]: s
Out[74]: 
0    x
1    y
2    z
3    x
dtype: category
Categories (3, object): ['x', 'y', 'z']
```

## 使用**add_categories**添加category

可以使用add_categories来添加category:

```
In [77]: s = s.cat.add_categories([4])

In [78]: s.cat.categories
Out[78]: Index(['x', 'y', 'z', 4], dtype='object')

In [79]: s
Out[79]: 
0    x
1    y
2    z
3    x
dtype: category
Categories (4, object): ['x', 'y', 'z', 4]
```

## 使用remove_categories删除category

```
In [80]: s = s.cat.remove_categories([4])

In [81]: s
Out[81]: 
0    x
1    y
2    z
3    x
dtype: category
Categories (3, object): ['x', 'y', 'z']
```

## 删除未使用的cagtegory

```
In [82]: s = pd.Series(pd.Categorical(["a", "b", "a"], categories=["a", "b", "c", "d"]))

In [83]: s
Out[83]: 
0    a
1    b
2    a
dtype: category
Categories (4, object): ['a', 'b', 'c', 'd']

In [84]: s.cat.remove_unused_categories()
Out[84]: 
0    a
1    b
2    a
dtype: category
Categories (2, object): ['a', 'b']
```

## 重置cagtegory

使用`set_categories()`可以同时进行添加和删除category操作：

```
In [85]: s = pd.Series(["one", "two", "four", "-"], dtype="category")

In [86]: s
Out[86]: 
0     one
1     two
2    four
3       -
dtype: category
Categories (4, object): ['-', 'four', 'one', 'two']

In [87]: s = s.cat.set_categories(["one", "two", "three", "four"])

In [88]: s
Out[88]: 
0     one
1     two
2    four
3     NaN
dtype: category
Categories (4, object): ['one', 'two', 'three', 'four']
```

# category排序

如果category创建的时候带有 ordered=True ， 那么可以对其进行排序操作：

```
In [91]: s = pd.Series(["a", "b", "c", "a"]).astype(CategoricalDtype(ordered=True))

In [92]: s.sort_values(inplace=True)

In [93]: s
Out[93]: 
0    a
3    a
1    b
2    c
dtype: category
Categories (3, object): ['a' < 'b' < 'c']

In [94]: s.min(), s.max()
Out[94]: ('a', 'c')
```

可以使用 as_ordered() 或者 as_unordered() 来强制排序或者不排序：

```
In [95]: s.cat.as_ordered()
Out[95]: 
0    a
3    a
1    b
2    c
dtype: category
Categories (3, object): ['a' < 'b' < 'c']

In [96]: s.cat.as_unordered()
Out[96]: 
0    a
3    a
1    b
2    c
dtype: category
Categories (3, object): ['a', 'b', 'c']
```

## 重排序 

使用**Categorical.reorder_categories()** 可以对现有的category进行重排序：

```
In [103]: s = pd.Series([1, 2, 3, 1], dtype="category")

In [104]: s = s.cat.reorder_categories([2, 3, 1], ordered=True)

In [105]: s
Out[105]: 
0    1
1    2
2    3
3    1
dtype: category
Categories (3, int64): [2 < 3 < 1]
```

## 多列排序

 sort_values 支持多列进行排序：

```
In [109]: dfs = pd.DataFrame(
   .....:     {
   .....:         "A": pd.Categorical(
   .....:             list("bbeebbaa"),
   .....:             categories=["e", "a", "b"],
   .....:             ordered=True,
   .....:         ),
   .....:         "B": [1, 2, 1, 2, 2, 1, 2, 1],
   .....:     }
   .....: )
   .....: 

In [110]: dfs.sort_values(by=["A", "B"])
Out[110]: 
   A  B
2  e  1
3  e  2
7  a  1
6  a  2
0  b  1
5  b  1
1  b  2
4  b  2
```

# 比较操作

如果创建的时候设置了ordered==True ，那么category之间就可以进行比较操作。支持` ==`, `!=`, `>`, `>=`, `<`, 和 `<=`这些操作符。

```
In [113]: cat = pd.Series([1, 2, 3]).astype(CategoricalDtype([3, 2, 1], ordered=True))

In [114]: cat_base = pd.Series([2, 2, 2]).astype(CategoricalDtype([3, 2, 1], ordered=True))

In [115]: cat_base2 = pd.Series([2, 2, 2]).astype(CategoricalDtype(ordered=True))
```

```
In [119]: cat > cat_base
Out[119]: 
0     True
1    False
2    False
dtype: bool

In [120]: cat > 2
Out[120]: 
0     True
1    False
2    False
dtype: bool
```

# 其他操作

Cagetory本质上来说还是一个Series，所以Series的操作category基本上都可以使用，比如： Series.min(), Series.max() 和 Series.mode()。

value_counts：

```
In [131]: s = pd.Series(pd.Categorical(["a", "b", "c", "c"], categories=["c", "a", "b", "d"]))

In [132]: s.value_counts()
Out[132]: 
c    2
a    1
b    1
d    0
dtype: int64
```

DataFrame.sum()：

```
In [133]: columns = pd.Categorical(
   .....:     ["One", "One", "Two"], categories=["One", "Two", "Three"], ordered=True
   .....: )
   .....: 

In [134]: df = pd.DataFrame(
   .....:     data=[[1, 2, 3], [4, 5, 6]],
   .....:     columns=pd.MultiIndex.from_arrays([["A", "B", "B"], columns]),
   .....: )
   .....: 

In [135]: df.sum(axis=1, level=1)
Out[135]: 
   One  Two  Three
0    3    3      0
1    9    6      0
```

Groupby：

```
In [136]: cats = pd.Categorical(
   .....:     ["a", "b", "b", "b", "c", "c", "c"], categories=["a", "b", "c", "d"]
   .....: )
   .....: 

In [137]: df = pd.DataFrame({"cats": cats, "values": [1, 2, 2, 2, 3, 4, 5]})

In [138]: df.groupby("cats").mean()
Out[138]: 
      values
cats        
a        1.0
b        2.0
c        4.0
d        NaN

In [139]: cats2 = pd.Categorical(["a", "a", "b", "b"], categories=["a", "b", "c"])

In [140]: df2 = pd.DataFrame(
   .....:     {
   .....:         "cats": cats2,
   .....:         "B": ["c", "d", "c", "d"],
   .....:         "values": [1, 2, 3, 4],
   .....:     }
   .....: )
   .....: 

In [141]: df2.groupby(["cats", "B"]).mean()
Out[141]: 
        values
cats B        
a    c     1.0
     d     2.0
b    c     3.0
     d     4.0
c    c     NaN
     d     NaN
```

Pivot tables：

```
In [142]: raw_cat = pd.Categorical(["a", "a", "b", "b"], categories=["a", "b", "c"])

In [143]: df = pd.DataFrame({"A": raw_cat, "B": ["c", "d", "c", "d"], "values": [1, 2, 3, 4]})

In [144]: pd.pivot_table(df, values="values", index=["A", "B"])
Out[144]: 
     values
A B        
a c       1
  d       2
b c       3
  d       4
```

> 本文已收录于 [www.flydean.com](www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！
