---
slug: /02-db-ResultSetMetaData
---

# 3. 小知识系列:查询数据库数据的元信息



# 简介

java中数据库的操作相信大家都不陌生，JDK提供了java.sql包来规范对数据库的各种操作。我们最常用的操作就是从数据库的ResultSet中获取数据，其实这个包中还有一个非常有用的类叫做ResultSetMetaData，可以通过这个类来获取查询数据的元信息，一起来看看吧。

# 使用ResultSet

java.sql.ResultSet是一个通用的规范，用来表示从数据库获取到的数据。

通常来说，我们通过connection来创建Statement，然后通过执行查询语句来得到：

```
Statement stmt = con.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE,
                                        ResultSet.CONCUR_UPDATABLE);
         ResultSet rs = stmt.executeQuery("SELECT a, b FROM TABLE2");
```

resultSet提供了各种getter方法，来获取结果集中的各种数据。可以通过index，也可以通过column名称来获取。

当然，使用index它的效率会更高，index是从1开始的。如果是通过列名来获取数据，传入的列名是大小写不敏感的，如果结果数据中有多个匹配的类，则会返回最先匹配的那一列。

在get的过程中，JDBC driver会尝试将结果数据的数据库类型转换成为对应的java类型。

JDBC 2.0 API，ResultSet也可以进行更新和插入操作，可能我们很少这样做，一般都是先构造好数据后直接插入。

先看下更新操作：

```
         rs.absolute(5); // 将游标移动到第5行
         rs.updateString("SITE", "www.flydean.com"); // 将SITE更新为www.flydean.com
         rs.updateRow(); // 更新到数据库中
```

再看下插入操作：

```
  
         rs.moveToInsertRow(); // 将游标移动到插入行
         rs.updateString(1, "www.flydean.com"); // 将插入行的第一列更新为www.flydean.com
         rs.updateInt(2,35); // 更新第二列为35
         rs.updateBoolean(3, true); // 更新第三列为true
         rs.insertRow();
         rs.moveToCurrentRow();
```

# 使用ResultSetMetaData

有了ResultSet,我们可以通过它的getMetaData方法，来获取结果集的元数据。

什么是元数据呢？元数据又叫做Metadata，是用来描述数据属性的数据。

```
   ResultSetMetaData getMetaData() throws SQLException;
```

举个具体的例子：

```
       ResultSet rs = stmt.executeQuery("SELECT a, b, c FROM TABLE2");
       ResultSetMetaData rsmd = rs.getMetaData();
       int numberOfColumns = rsmd.getColumnCount();
       boolean b = rsmd.isSearchable(1);
```

ResultSetMetaData提供了很多非常有用的元数据检测方法：

![](https://img-blog.csdnimg.cn/3cf6b459256e40e29d9a9f30b24d925b.png)

我们可以拿到列的名称、类型、字段长度、是否为空等很多有意义的数据。

这个元数据有什么用呢？

通过元数据，我们可以拿到数据库的描述文件，从而可以自动创建对应的数据库表格的映射关系，从而减少手动代码的输入，非常的方便。

用过MybatisPlus的朋友可能知道，它提供了一个AutoGenerator，可以自动生成mapper对象和对应的xml文件，非常好用，大家可以试一试。

# 总结

以上就是ResultSet和ResultSetMetaData的介绍，大家学会了吗？
