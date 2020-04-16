# 在Spring Boot中使用内存数据库

所谓内存数据库就是可以在内存中运行的数据库，不需要将数据存储在文件系统中，但是相对于普通的数据库而言，内存数据库因为数据都在内存中，所以内存的数据库的存取速度会更快。

本文我们将会讨论如何在Spring Boot中使用内存数据库。

## H2数据库

H2是一个由java实现的开源内存数据库，它可以支持内存模式和独立模式。 如果要使用H2数据库，需要添加如下依赖：

~~~xml
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <version>1.4.194</version>
</dependency>
~~~

我们可以在配置文件中设置更多的H2数据库的连接信息：

~~~txt
driverClassName=org.h2.Driver
url=jdbc:h2:mem:myDb;DB_CLOSE_DELAY=-1
username=sa
password=sa
~~~

默认情况下H2数据库当没有连接的时候会自动关闭，我们可以通过添加DB_CLOSE_DELAY=-1来禁止掉这个功能。

如果我们需要使用Hibernate， 我们需要设置如下内容:

~~~txt
hibernate.dialect=org.hibernate.dialect.H2Dialect
~~~

## HSQLDB

HSQLDB是一个开源项目，java写的关系型数据库。它可以支持基本的SQL操作，存储过程和触发器。同样嵌入式或者单独使用。

我们看下怎么添加依赖：

~~~xml
<dependency>
    <groupId>org.hsqldb</groupId>
    <artifactId>hsqldb</artifactId>
    <version>2.3.4</version>
</dependency>
~~~

下面是HSQLDB的配置文件：

~~~txt
driverClassName=org.hsqldb.jdbc.JDBCDriver
url=jdbc:hsqldb:mem:myDb
username=sa
password=sa
~~~

同样的如果使用hibernate需要配置如下属性：

~~~txt
hibernate.dialect=org.hibernate.dialect.HSQLDialect
~~~

## Apache Derby

Apache Derby 是由Apache基金会维护的开源项目。

添加依赖：

~~~xml
<dependency>
    <groupId>org.apache.derby</groupId>
    <artifactId>derby</artifactId>
    <version>10.13.1.1</version>
</dependency>
~~~

配置文件：

~~~txt
driverClassName=org.apache.derby.jdbc.EmbeddedDriver
url=jdbc:derby:memory:myDb;create=true
username=sa
password=sa
~~~

对应的hibernate配置：

~~~txt
hibernate.dialect=org.hibernate.dialect.DerbyDialect
~~~

## SQLite

SQLite也是一种内存数据库，我们这样添加依赖：

~~~xml
<dependency>
    <groupId>org.xerial</groupId>
    <artifactId>sqlite-jdbc</artifactId>
    <version>3.16.1</version>
</dependency>
~~~

配置文件如下：

~~~txt
driverClassName=org.sqlite.JDBC
url=jdbc:sqlite:memory:myDb
username=sa
password=sa
~~~

使用Spring Boot可以很方便的使用上面提到的内存数据库。

更多教程请参考 [flydean的博客](www.flydean.com)