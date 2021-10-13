小知识系列:数据库的主键和外键

[toc]

# 简介

数据库是我们所有应用程序的基础，没有数据库的程序不是一个好程序，一般情况下我们都是通过可视化工具来创建数据库和数据库表格，今天给大家介绍一点不一样的，使用命令行工具来创建数据库的主键和外键。

这里选择3个常用的数据库，mysql、oracle和sqlserver分别介绍。

# 创建主键

所谓主键就是数据库中用来做主要索引的字段，应该怎么创建呢？

假设我们的数据表格名字叫做Customer，它有三个字段，分别是SID，Last_Name和First_Name。我们看下在这三个数据库中创建字段有什么区别：

## MySQL

创建数据库表格：

```
CREATE TABLE Customer 
(SID integer, 
name varchar(30), 
phone varchar(30), 
PRIMARY KEY (SID)); 
```

创建主键：

```
ALTER TABLE Customer ADD PRIMARY KEY (SID); 
```

## Oracle

创建数据库表格：

```
CREATE TABLE Customer 
(SID integer PRIMARY KEY, 
name varchar(30), 
phone varchar(30));
```

创建主键：

```
ALTER TABLE Customer ADD PRIMARY KEY (SID); 
```

## SQL Server

创建数据库表格：

```
CREATE TABLE Customer 
(SID integer PRIMARY KEY, 
name varchar(30), 
phone varchar(30)); 
```

创建主键：

```
ALTER TABLE Customer ADD PRIMARY KEY (SID); 
```

# 创建外键

外键表示的是数据库的关联关系，上面我们创建了Customer这张表，里面有个SID字段。现在我们再创建一个ORDERS表格，然后需要引用Customer表格的SID字段作为外键。看下怎么处理。

## mysql

首先创建表格：

```
CREATE TABLE ORDERS 
(ID integer, 
Create_date date, 
Customer_SID integer, 
Amount double, 
Primary Key (ID), 
Foreign Key (Customer_SID) references CUSTOMER(SID)); 
```

创建外键：

```
ALTER TABLE ORDERS 
ADD FOREIGN KEY (customer_sid) REFERENCES CUSTOMER(sid); 
```

## Oracle

首先创建表格：

```
CREATE TABLE ORDERS 
(ID integer primary key, 
Create_date date, 
Customer_SID integer references CUSTOMER(SID), 
Amount double); 
```

创建外键：

```
ALTER TABLE ORDERS 
ADD (CONSTRAINT fk_orders) FOREIGN KEY (customer_sid) REFERENCES CUSTOMER(sid); 
```

## SQL Server

首先创建表格：

```
CREATE TABLE ORDERS 
(ID integer primary key, 
Create_date datetime, 
Customer_SID integer references CUSTOMER(SID), 
Amount double); 
```

创建外键：

```
ALTER TABLE ORDERS 
ADD FOREIGN KEY (customer_sid) REFERENCES CUSTOMER(sid); 
```

# 总结

以上就是三个数据库中创建主键和外键的基本操作，你学会了吗？
