---
slug: /14-python-pandas-options
---

# 14. Pandas高级教程之:自定义选项



# 简介

pandas有一个option系统可以控制pandas的展示情况，一般来说我们不需要进行修改，但是不排除特殊情况下的修改需求。本文将会详细讲解pandas中的option设置。

# 常用选项

 pd.options.display 可以控制展示选项，比如设置最大展示行数：

```
In [1]: import pandas as pd

In [2]: pd.options.display.max_rows
Out[2]: 15

In [3]: pd.options.display.max_rows = 999

In [4]: pd.options.display.max_rows
Out[4]: 999
```

除此之外，pd还有4个相关的方法来对option进行修改：

- get_option() / set_option() - get/set 单个option的值
- reset_option() - 重设某个option的值到默认值
- describe_option() - 打印某个option的值
- option_context() - 在代码片段中执行某些option的更改

如下所示：

```
In [5]: pd.get_option("display.max_rows")
Out[5]: 999

In [6]: pd.set_option("display.max_rows", 101)

In [7]: pd.get_option("display.max_rows")
Out[7]: 101

In [8]: pd.set_option("max_r", 102)

In [9]: pd.get_option("display.max_rows")
Out[9]: 102
```

# get/set 选项

 pd.get_option 和 pd.set_option 可以用来获取和修改特定的option：

```
In [11]: pd.get_option("mode.sim_interactive")
Out[11]: False

In [12]: pd.set_option("mode.sim_interactive", True)

In [13]: pd.get_option("mode.sim_interactive")
Out[13]: True
```

使用  `reset_option`  来重置：

```
In [14]: pd.get_option("display.max_rows")
Out[14]: 60

In [15]: pd.set_option("display.max_rows", 999)

In [16]: pd.get_option("display.max_rows")
Out[16]: 999

In [17]: pd.reset_option("display.max_rows")

In [18]: pd.get_option("display.max_rows")
Out[18]: 60
```

使用正则表达式可以重置多条option：

```
In [19]: pd.reset_option("^display")
```

`option_context` 在代码环境中修改option，代码结束之后,option会被还原：

```
In [20]: with pd.option_context("display.max_rows", 10, "display.max_columns", 5):
   ....:     print(pd.get_option("display.max_rows"))
   ....:     print(pd.get_option("display.max_columns"))
   ....: 
10
5

In [21]: print(pd.get_option("display.max_rows"))
60

In [22]: print(pd.get_option("display.max_columns"))
0
```

# 经常使用的选项

下面我们看一些经常使用选项的例子：

## 最大展示行数

 display.max_rows 和 display.max_columns 可以设置最大展示行数和列数：

```
In [23]: df = pd.DataFrame(np.random.randn(7, 2))

In [24]: pd.set_option("max_rows", 7)

In [25]: df
Out[25]: 
          0         1
0  0.469112 -0.282863
1 -1.509059 -1.135632
2  1.212112 -0.173215
3  0.119209 -1.044236
4 -0.861849 -2.104569
5 -0.494929  1.071804
6  0.721555 -0.706771

In [26]: pd.set_option("max_rows", 5)

In [27]: df
Out[27]: 
           0         1
0   0.469112 -0.282863
1  -1.509059 -1.135632
..       ...       ...
5  -0.494929  1.071804
6   0.721555 -0.706771

[7 rows x 2 columns]
```

## 超出数据展示

 display.large_repr 可以选择对于超出的行或者列的展示行为，可以是truncated frame：

```
In [43]: df = pd.DataFrame(np.random.randn(10, 10))

In [44]: pd.set_option("max_rows", 5)

In [45]: pd.set_option("large_repr", "truncate")

In [46]: df
Out[46]: 
           0         1         2         3         4         5         6         7         8         9
0  -0.954208  1.462696 -1.743161 -0.826591 -0.345352  1.314232  0.690579  0.995761  2.396780  0.014871
1   3.357427 -0.317441 -1.236269  0.896171 -0.487602 -0.082240 -2.182937  0.380396  0.084844  0.432390
..       ...       ...       ...       ...       ...       ...       ...       ...       ...       ...
8  -0.303421 -0.858447  0.306996 -0.028665  0.384316  1.574159  1.588931  0.476720  0.473424 -0.242861
9  -0.014805 -0.284319  0.650776 -1.461665 -1.137707 -0.891060 -0.693921  1.613616  0.464000  0.227371

[10 rows x 10 columns]
```

也可以是统计信息：

```
In [47]: pd.set_option("large_repr", "info")

In [48]: df
Out[48]: 
<class 'pandas.core.frame.DataFrame'>
RangeIndex: 10 entries, 0 to 9
Data columns (total 10 columns):
 #   Column  Non-Null Count  Dtype  
---  ------  --------------  -----  
 0   0       10 non-null     float64
 1   1       10 non-null     float64
 2   2       10 non-null     float64
 3   3       10 non-null     float64
 4   4       10 non-null     float64
 5   5       10 non-null     float64
 6   6       10 non-null     float64
 7   7       10 non-null     float64
 8   8       10 non-null     float64
 9   9       10 non-null     float64
dtypes: float64(10)
memory usage: 928.0 bytes
```

## 最大列的宽度

 display.max_colwidth 用来设置最大列的宽度。

```
In [51]: df = pd.DataFrame(
   ....:     np.array(
   ....:         [
   ....:             ["foo", "bar", "bim", "uncomfortably long string"],
   ....:             ["horse", "cow", "banana", "apple"],
   ....:         ]
   ....:     )
   ....: )
   ....: 

In [52]: pd.set_option("max_colwidth", 40)

In [53]: df
Out[53]: 
       0    1       2                          3
0    foo  bar     bim  uncomfortably long string
1  horse  cow  banana                      apple

In [54]: pd.set_option("max_colwidth", 6)

In [55]: df
Out[55]: 
       0    1      2      3
0    foo  bar    bim  un...
1  horse  cow  ba...  apple
```

## 显示精度

 `display.precision` 可以设置显示的精度：

```
In [70]: df = pd.DataFrame(np.random.randn(5, 5))

In [71]: pd.set_option("precision", 7)

In [72]: df
Out[72]: 
           0          1          2          3          4
0 -1.1506406 -0.7983341 -0.5576966  0.3813531  1.3371217
1 -1.5310949  1.3314582 -0.5713290 -0.0266708 -1.0856630
2 -1.1147378 -0.0582158 -0.4867681  1.6851483  0.1125723
3 -1.4953086  0.8984347 -0.1482168 -1.5960698  0.1596530
4  0.2621358  0.0362196  0.1847350 -0.2550694 -0.2710197
```

## 零转换的门槛

 display.chop_threshold  可以设置将Series或者DF中数据展示为0的门槛：

```
In [75]: df = pd.DataFrame(np.random.randn(6, 6))

In [76]: pd.set_option("chop_threshold", 0)

In [77]: df
Out[77]: 
        0       1       2       3       4       5
0  1.2884  0.2946 -1.1658  0.8470 -0.6856  0.6091
1 -0.3040  0.6256 -0.0593  0.2497  1.1039 -1.0875
2  1.9980 -0.2445  0.1362  0.8863 -1.3507 -0.8863
3 -1.0133  1.9209 -0.3882 -2.3144  0.6655  0.4026
4  0.3996 -1.7660  0.8504  0.3881  0.9923  0.7441
5 -0.7398 -1.0549 -0.1796  0.6396  1.5850  1.9067

In [78]: pd.set_option("chop_threshold", 0.5)

In [79]: df
Out[79]: 
        0       1       2       3       4       5
0  1.2884  0.0000 -1.1658  0.8470 -0.6856  0.6091
1  0.0000  0.6256  0.0000  0.0000  1.1039 -1.0875
2  1.9980  0.0000  0.0000  0.8863 -1.3507 -0.8863
3 -1.0133  1.9209  0.0000 -2.3144  0.6655  0.0000
4  0.0000 -1.7660  0.8504  0.0000  0.9923  0.7441
5 -0.7398 -1.0549  0.0000  0.6396  1.5850  1.9067
```

上例中，绝对值< 0.5 的都会被展示为0 。

## 列头的对齐方向

 display.colheader_justify 可以修改列头部文字的对齐方向：

```
In [81]: df = pd.DataFrame(
   ....:     np.array([np.random.randn(6), np.random.randint(1, 9, 6) * 0.1, np.zeros(6)]).T,
   ....:     columns=["A", "B", "C"],
   ....:     dtype="float",
   ....: )
   ....: 

In [82]: pd.set_option("colheader_justify", "right")

In [83]: df
Out[83]: 
        A    B    C
0  0.1040  0.1  0.0
1  0.1741  0.5  0.0
2 -0.4395  0.4  0.0
3 -0.7413  0.8  0.0
4 -0.0797  0.4  0.0
5 -0.9229  0.3  0.0

In [84]: pd.set_option("colheader_justify", "left")

In [85]: df
Out[85]: 
   A       B    C  
0  0.1040  0.1  0.0
1  0.1741  0.5  0.0
2 -0.4395  0.4  0.0
3 -0.7413  0.8  0.0
4 -0.0797  0.4  0.0
5 -0.9229  0.3  0.0
```

常见的选项表格：

| 选项                                    | 默认值     | 描述                                                         |
| :-------------------------------------- | :--------- | :----------------------------------------------------------- |
| display.chop_threshold                  | None       | If set to a float value, all float values smaller then the given threshold will be displayed as exactly 0 by repr and friends. |
| display.colheader_justify               | right      | Controls the justification of column headers. used by DataFrameFormatter. |
| display.column_space                    | 12         | No description available.                                    |
| display.date_dayfirst                   | False      | When True, prints and parses dates with the day first, eg 20/01/2005 |
| display.date_yearfirst                  | False      | When True, prints and parses dates with the year first, eg 2005/01/20 |
| display.encoding                        | UTF-8      | Defaults to the detected encoding of the console. Specifies the encoding to be used for strings returned by to_string, these are generally strings meant to be displayed on the console. |
| display.expand_frame_repr               | True       | Whether to print out the full DataFrame repr for wide DataFrames across multiple lines, `max_columns` is still respected, but the output will wrap-around across multiple “pages” if its width exceeds `display.width`. |
| display.float_format                    | None       | The callable should accept a floating point number and return a string with the desired format of the number. This is used in some places like SeriesFormatter. See core.format.EngFormatter for an example. |
| display.large_repr                      | truncate   | For DataFrames exceeding max_rows/max_cols, the repr (and HTML repr) can show a truncated table (the default), or switch to the view from df.info() (the behaviour in earlier versions of pandas). allowable settings, [‘truncate’, ‘info’] |
| display.latex.repr                      | False      | Whether to produce a latex DataFrame representation for Jupyter frontends that support it. |
| display.latex.escape                    | True       | Escapes special characters in DataFrames, when using the to_latex method. |
| display.latex.longtable                 | False      | Specifies if the to_latex method of a DataFrame uses the longtable format. |
| display.latex.multicolumn               | True       | Combines columns when using a MultiIndex                     |
| display.latex.multicolumn_format        | ‘l’        | Alignment of multicolumn labels                              |
| display.latex.multirow                  | False      | Combines rows when using a MultiIndex. Centered instead of top-aligned, separated by clines. |
| display.max_columns                     | 0 or 20    | max_rows and max_columns are used in __repr__() methods to decide if to_string() or info() is used to render an object to a string. In case Python/IPython is running in a terminal this is set to 0 by default and pandas will correctly auto-detect the width of the terminal and switch to a smaller format in case all columns would not fit vertically. The IPython notebook, IPython qtconsole, or IDLE do not run in a terminal and hence it is not possible to do correct auto-detection, in which case the default is set to 20. ‘None’ value means unlimited. |
| display.max_colwidth                    | 50         | The maximum width in characters of a column in the repr of a pandas data structure. When the column overflows, a “…” placeholder is embedded in the output. ‘None’ value means unlimited. |
| display.max_info_columns                | 100        | max_info_columns is used in DataFrame.info method to decide if per column information will be printed. |
| display.max_info_rows                   | 1690785    | df.info() will usually show null-counts for each column. For large frames this can be quite slow. max_info_rows and max_info_cols limit this null check only to frames with smaller dimensions then specified. |
| display.max_rows                        | 60         | This sets the maximum number of rows pandas should output when printing out various output. For example, this value determines whether the repr() for a dataframe prints out fully or just a truncated or summary repr. ‘None’ value means unlimited. |
| display.min_rows                        | 10         | The numbers of rows to show in a truncated repr (when `max_rows` is exceeded). Ignored when `max_rows` is set to None or 0. When set to None, follows the value of `max_rows`. |
| display.max_seq_items                   | 100        | when pretty-printing a long sequence, no more then `max_seq_items` will be printed. If items are omitted, they will be denoted by the addition of “…” to the resulting string. If set to None, the number of items to be printed is unlimited. |
| display.memory_usage                    | True       | This specifies if the memory usage of a DataFrame should be displayed when the df.info() method is invoked. |
| display.multi_sparse                    | True       | “Sparsify” MultiIndex display (don’t display repeated elements in outer levels within groups) |
| display.notebook_repr_html              | True       | When True, IPython notebook will use html representation for pandas objects (if it is available). |
| display.pprint_nest_depth               | 3          | Controls the number of nested levels to process when pretty-printing |
| display.precision                       | 6          | Floating point output precision in terms of number of places after the decimal, for regular formatting as well as scientific notation. Similar to numpy’s `precision` print option |
| display.show_dimensions                 | truncate   | Whether to print out dimensions at the end of DataFrame repr. If ‘truncate’ is specified, only print out the dimensions if the frame is truncated (e.g. not display all rows and/or columns) |
| display.width                           | 80         | Width of the display in characters. In case Python/IPython is running in a terminal this can be set to None and pandas will correctly auto-detect the width. Note that the IPython notebook, IPython qtconsole, or IDLE do not run in a terminal and hence it is not possible to correctly detect the width. |
| display.html.table_schema               | False      | Whether to publish a Table Schema representation for frontends that support it. |
| display.html.border                     | 1          | A `border=value` attribute is inserted in the `<table>` tag for the DataFrame HTML repr. |
| display.html.use_mathjax                | True       | When True, Jupyter notebook will process table contents using MathJax, rendering mathematical expressions enclosed by the dollar symbol. |
| io.excel.xls.writer                     | xlwt       | The default Excel writer engine for ‘xls’ files.Deprecated since version 1.2.0: As xlwt package is no longer maintained, the xlwt engine will be removed in a future version of pandas. Since this is the only engine in pandas that supports writing to .xls files, this option will also be removed. |
| io.excel.xlsm.writer                    | openpyxl   | The default Excel writer engine for ‘xlsm’ files. Available options: ‘openpyxl’ (the default). |
| io.excel.xlsx.writer                    | openpyxl   | The default Excel writer engine for ‘xlsx’ files.            |
| io.hdf.default_format                   | None       | default format writing format, if None, then put will default to ‘fixed’ and append will default to ‘table’ |
| io.hdf.dropna_table                     | True       | drop ALL nan rows when appending to a table                  |
| io.parquet.engine                       | None       | The engine to use as a default for parquet reading and writing. If None then try ‘pyarrow’ and ‘fastparquet’ |
| mode.chained_assignment                 | warn       | Controls SettingWithCopyWarning: ‘raise’, ‘warn’, or None. Raise an exception, warn, or no action if trying to use chained assignment. |
| mode.sim_interactive                    | False      | Whether to simulate interactive mode for purposes of testing. |
| mode.use_inf_as_na                      | False      | True means treat None, NaN, -INF, INF as NA (old way), False means None and NaN are null, but INF, -INF are not NA (new way). |
| compute.use_bottleneck                  | True       | Use the bottleneck library to accelerate computation if it is installed. |
| compute.use_numexpr                     | True       | Use the numexpr library to accelerate computation if it is installed. |
| plotting.backend                        | matplotlib | Change the plotting backend to a different backend than the current matplotlib one. Backends can be implemented as third-party libraries implementing the pandas plotting API. They can use other plotting libraries like Bokeh, Altair, etc. |
| plotting.matplotlib.register_converters | True       | Register custom converters with matplotlib. Set to False to de-register. |

