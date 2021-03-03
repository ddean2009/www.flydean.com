# Spring Boot 之Spring data JPA简介

JPA的全称是Java Persistence API (JPA)，他是一个存储API的标准，而Spring data JPA就是对JPA的一种实现，可以让我们方便的对数据进行存取。按照约定好的方法命名规则写dao层接口，从而在不实现接口的情况下，实现对数据库的访问和操作。同时提供了很多除了CRUD之外的功能，如分页、排序、复杂查询等等。

Spring data JPA可以看做是对Hibernate的二次封装。本文将会以一个具体的例子来讲解，怎么在Spring Boot中使用Spring data JPA。 

## 添加依赖

我们要添加如下的Spring data JPA依赖，为了方便测试，我们添加一个h2的内存数据库：

~~~xml
<dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>

        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>runtime</scope>
        </dependency>
~~~

## 添加entity bean

我们来创建一个entity bean：

~~~java
@Entity
@Data
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long id;

    @Column(nullable = false, unique = true)
    private String title;

    @Column(nullable = false)
    private String author;
}
~~~

## 创建 Dao

~~~java
public interface BookRepository extends JpaRepository<Book, Long> {
    List<Book> findByTitle(String title);

    @Query("SELECT b FROM Book b WHERE LOWER(b.title) = LOWER(:title)")
    Book retrieveByTitle(@Param("title") String title);
}
~~~

所有的Dao都需要继承Repository接口，Repository是一个空的接口：

~~~java
@Indexed
public interface Repository<T, ID> {

}
~~~

如果要使用默认的通用的一些实现，则可以继承CrudRepository， PagingAndSortingRepository和JpaRepository。 

上面的例子中我们继承了JpaRepository。 

上面的例子中我们创建了一个按Title查找的方法：

~~~java
List<Book> findByTitle(String title);
~~~

这个方法我们是不需要自己去实现的，Spring Data JPA会帮我们去实现。我们可以使用find…By, read…By, query…By, count…By,和 get…By的格式定义查询语句，By后面接的就是Entity的属性。除了And，我们还可以使用Or来拼接方法，下面我们再举个例子：

~~~java
interface PersonRepository extends Repository<Person, Long> {

  List<Person> findByEmailAddressAndLastname(EmailAddress emailAddress, String lastname);

  // Enables the distinct flag for the query
  List<Person> findDistinctPeopleByLastnameOrFirstname(String lastname, String firstname);
  List<Person> findPeopleDistinctByLastnameOrFirstname(String lastname, String firstname);

  // Enabling ignoring case for an individual property
  List<Person> findByLastnameIgnoreCase(String lastname);
  // Enabling ignoring case for all suitable properties
  List<Person> findByLastnameAndFirstnameAllIgnoreCase(String lastname, String firstname);

  // Enabling static ORDER BY for a query
  List<Person> findByLastnameOrderByFirstnameAsc(String lastname);
  List<Person> findByLastnameOrderByFirstnameDesc(String lastname);
}
~~~

当然，处理方法拼接外，我们还可以自定义sql查询语句：

~~~java
    @Query("SELECT b FROM Book b WHERE LOWER(b.title) = LOWER(:title)")
    Book retrieveByTitle(@Param("title") String title);
~~~

自定义查询语句给Spring data JPA提供了更大的想象空间。

## Spring Data Configuration

要使用Spring Data JPA, 我们还需要在配置文件中指定要扫描的目录，使用@EnableJpaRepositories注解来实现：

~~~java
@Configuration
@EnableJpaRepositories(basePackages = "com.flydean.repository")
public class PersistenceConfig {
}
~~~

我们还需要在配置文件中指定数据源的属性：

~~~txt
spring.datasource.url=jdbc:h2:mem:db;DB_CLOSE_DELAY=-1
spring.datasource.username=sa
spring.datasource.password=sa
~~~

## 测试

有了上面的一切，我们就可以测试我们的数据源了：

~~~java
@Slf4j
@RunWith(SpringRunner.class)
@SpringBootTest(classes = {JpaApp.class})
public class BookRepositoryTest {

    @Autowired
    private BookRepository bookRepository;

    @Test
    @Transactional(readOnly=false)
    public void testBookRepository(){
        Book book = new Book();
        book.setTitle(randomAlphabetic(10));
        book.setAuthor(randomAlphabetic(15));

        bookRepository.save(book);

       bookRepository.findByTitle(book.getTitle()).forEach(e -> log.info(e.toString()));
       log.info(bookRepository.retrieveByTitle(book.getTitle()).toString());
    }
}
~~~

本文的例子可以参考:[https://github.com/ddean2009/learn-springboot2/tree/master/springboot-jpa](https://github.com/ddean2009/learn-springboot2/tree/master/springboot-jpa)





