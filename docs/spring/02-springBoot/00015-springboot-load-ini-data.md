---
slug: /springboot-load-ini-data
---

# 15. 在Spring Boot中加载初始化数据

在Spring Boot中，Spring Boot会自动搜索映射的Entity，并且创建相应的table，但是有时候我们希望自定义某些内容，这时候我们就需要使用到data.sql和schema.sql。 

## 依赖条件

Spring Boot的依赖我们就不将了，因为本例将会有数据库的操作，我们这里使用H2内存数据库方便测试：

~~~xml
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>runtime</scope>
        </dependency>
~~~

我们需要使用JPA来创建Entity：

~~~java
@Entity
public class Country {
 
    @Id
    @GeneratedValue(strategy = IDENTITY)
    private Integer id;
     
    @Column(nullable = false)
    private String name;
 
    //...
}
~~~

我们这样定义repository：

~~~java
public interface CountryRepository extends CrudRepository<Country, Integer> {
    List<Country> findByName(String name);
}
~~~

如果这时候我们启动Spring Boot程序，将会自动创建Country表。

## data.sql文件

上面我们创建好了数据表格，我们可以使用data.sql来加载文件：

~~~sql
INSERT INTO country (name) VALUES ('India');
INSERT INTO country (name) VALUES ('Brazil');
INSERT INTO country (name) VALUES ('USA');
INSERT INTO country (name) VALUES ('Italy');
~~~

在data.sql文件中我们插入了4条数据，可以写个测试例子测试一下：

~~~java
@RunWith(SpringRunner.class)
@SpringBootTest(classes = LoadIniDataApp.class)
public class SpringBootInitialLoadIntegrationTest {

    @Autowired
    private CountryRepository countryRepository;

    @Test
    public void testInitDataForTestClass() {
        assertEquals(4, countryRepository.count());
    }
}
~~~

## schema.sql 文件

有时候我们需要自定义数据库的schema，这时候我们可以使用到schema.sql文件。

先看一个schema.sql的例子：

~~~sql
CREATE TABLE country (
    id   INTEGER      NOT NULL AUTO_INCREMENT,
    name VARCHAR(128) NOT NULL,
    PRIMARY KEY (id)
);
~~~

Spring Boot会自动加载这个schema文件。

我们需要关闭spring boot的schema自动创建功能以防冲突：

~~~shell
spring.jpa.hibernate.ddl-auto=none
~~~

spring.jpa.hibernate.ddl-auto 有如下几个选项：

* create : 首先drop现有的tables，然后创建新的tables
* update : 这个模式不会删除现有的tables，它会比较现有的tables和新的注解或者xml配置是否一致，然后更新。
* create-drop : 和create很类似，不同的是会在程序运行完毕后自动drop掉tables。通常用在单元测试中。
* validate : 只会做table是否存在的验证，不存在则会报错。
* none : 关闭ddl自动生成功能。

如果Spring Boot没有检测到自定义的schema manager的话，则会自动使用create-drop模式。否则使用none模式。

## @sql注解

 @Sql 是测试包中的一个注解，可以显示的导入要执行的sql文件，它可以用在class上或者方法之上，如下所示：

 ~~~java
     @Test
    @Sql({"classpath:new_country.sql"})
    public void testLoadDataForTestCase() {
        assertEquals(6, countryRepository.count());
    }
 ~~~

上面的例子将会显示的导入classpath中的new_country.sql文件。

@Sql有如下几个属性：

* config : 用来配置SQL脚本，我们在下面的@SqlConfig详细讲解。
* executionPhase : 可以选择脚本是在BEFORE_TEST_METHOD 或者 AFTER_TEST_METHOD来执行。
* statements: 可以接受内联的sql语句
* scripts: 可以指明要执行脚本的路径

## @SqlConfig 注解

@SqlConfig主要用在class级别或者用在@Sql注解的config属性中：

~~~java
    @Sql(scripts = {"classpath:new_country2.sql"},
            config = @SqlConfig(encoding = "utf-8", transactionMode = SqlConfig.TransactionMode.ISOLATED))
~~~

@SqlConfig有如下几个属性：

* blockCommentStartDelimiter: 指明了SQL脚本的开始标记。
* blockCommentEndDelimiter: SQL脚本的结束标记。
* commentPrefix: SQL 脚本的注释标记
* dataSource : javax.sql.DataSource的名字，指定该脚本将会在什么datasource下执行
* encoding:  SQL 文件的编码
* errorMode: 脚本遇到错误的处理模式
* separator: 分隔符
* transactionManager: 指定的PlatformTransactionManager
* transactionMode: 事务模式

@Sql是可以多个同时使用的，如下所示：

~~~java
    @Test
    @Sql({"classpath:new_country.sql"})
    @Sql(scripts = {"classpath:new_country2.sql"},
            config = @SqlConfig(encoding = "utf-8", transactionMode = SqlConfig.TransactionMode.ISOLATED))
    public void testLoadDataForTestCase() {
        assertEquals(6, countryRepository.count());
    }
~~~

本文的例子可以参考 : [https://github.com/ddean2009/learn-springboot2/tree/master/springboot-load-ini-data](https://github.com/ddean2009/learn-springboot2/tree/master/springboot-load-ini-data)

更多教程请参考 [flydean的博客](http://www.flydean.com)


