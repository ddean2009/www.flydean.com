---
slug: /springboot-jpa-query
---

# 12. Spring Boot JPA的查询语句

之前的文章中，我们讲解了如何使用Spring Boot JPA， 在Spring Boot JPA中我们可通过构建查询方法或者通过@Query注解来构建查询语句，本文我们将会更详细的讨论查询语句的构建。

## 准备工作

首先我们需要添加依赖，这里我们还是使用H2内存数据库：

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

我们创建一个Entity：

~~~java
@Data
@Entity
public class Movie {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;
    private String title;
    private String director;
    private String rating;
    private int duration;
}
~~~

构建初始化data.sql:

~~~sql
INSERT INTO movie(id, title, director, rating, duration) 
    VALUES(1, 'Godzilla: King of the Monsters', ' Michael Dougherty', 'PG-13', 132);
INSERT INTO movie(id, title, director, rating, duration) 
    VALUES(2, 'Avengers: Endgame', 'Anthony Russo', 'PG-13', 181);
INSERT INTO movie(id, title, director, rating, duration) 
    VALUES(3, 'Captain Marvel', 'Anna Boden', 'PG-13', 123);
INSERT INTO movie(id, title, director, rating, duration) 
    VALUES(4, 'Dumbo', 'Tim Burton', 'PG', 112);
INSERT INTO movie(id, title, director, rating, duration) 
    VALUES(5, 'Booksmart', 'Olivia Wilde', 'R', 102);
INSERT INTO movie(id, title, director, rating, duration) 
    VALUES(6, 'Aladdin', 'Guy Ritchie', 'PG', 128);
INSERT INTO movie(id, title, director, rating, duration) 
    VALUES(7, 'The Sun Is Also a Star', 'Ry Russo-Young', 'PG-13', 100);
~~~

构建Repository：

~~~java
public interface MovieRepository extends JpaRepository<Movie, Long> {
}
~~~

## Containing, Contains, IsContaining 和 Like

如果我们想要构建模下面的模糊查询语句：

~~~sql
SELECT * FROM movie WHERE title LIKE '%in%';
~~~

我们可以这样写：

~~~java
List<Movie> findByTitleContaining(String title);
List<Movie> findByTitleContains(String title);
List<Movie> findByTitleIsContaining(String title);
~~~

将上面的语句添加到Repository中就够了。

我们看下怎么测试：

~~~java
@Slf4j
@RunWith(SpringRunner.class)
@SpringBootTest(classes = {QueryApp.class})
public class MovieRepositoryTest {

    @Autowired
    private MovieRepository movieRepository;

    @Test
    public void TestMovieQuery(){
        List<Movie> results = movieRepository.findByTitleContaining("in");
        assertEquals(3, results.size());

        results = movieRepository.findByTitleIsContaining("in");
        assertEquals(3, results.size());

        results = movieRepository.findByTitleContains("in");
        assertEquals(3, results.size());
    }
}
~~~

Spring 还提供了Like 关键词，我们可以这样用：

~~~java
List<Movie> findByTitleLike(String title);
~~~

测试代码：

~~~Java
results = movieRepository.findByTitleLike("%in%");
assertEquals(3, results.size());
~~~

## StartsWith

如果我们需要实现下面这条SQL：

~~~sql
SELECT * FROM Movie WHERE Rating LIKE 'PG%';
~~~

我们可以这样使用：
~~~java
List<Movie> findByRatingStartsWith(String rating);
~~~

测试代码如下：

~~~java
List<Movie> results = movieRepository.findByRatingStartsWith("PG");
assertEquals(6, results.size());
~~~

## EndsWith

如果我们要实现下面的SQL：

~~~sql
SELECT * FROM Movie WHERE director LIKE '%Burton';
~~~

可以这样构建：

~~~java
List<Movie> findByDirectorEndsWith(String director);
~~~

测试代码如下：

~~~java
List<Movie> results = movieRepository.findByDirectorEndsWith("Burton");
assertEquals(1, results.size());
~~~

## 大小写不敏感

要是想实现大小不敏感的功能我们可以这样：

~~~java
List<Movie> findByTitleContainingIgnoreCase(String title);
~~~

测试代码如下：

~~~java
List<Movie> results = movieRepository.findByTitleContainingIgnoreCase("the");
assertEquals(2, results.size());
~~~

## Not

要想实现Not的功能，我们可以使用NotContains, NotContaining, 和 NotLike关键词：

~~~java
List<Movie> findByRatingNotContaining(String rating);
~~~

测试代码如下：

~~~java
List<Movie> results = movieRepository.findByRatingNotContaining("PG");
assertEquals(1, results.size());
~~~

NotLike：

~~~java
List<Movie> findByDirectorNotLike(String director);
~~~

测试代码如下：

~~~java
List<Movie> results = movieRepository.findByDirectorNotLike("An%");
assertEquals(5, results.size());
~~~

## @Query

如果我们要实现比较复杂的查询功能，我们可以使用@Query，下面是一个命名参数的使用：

~~~java
@Query("SELECT m FROM Movie m WHERE m.title LIKE %:title%")
List<Movie> searchByTitleLike(@Param("title") String title);
~~~

如果有多个参数，我们可以这样指定参数的顺序：

~~~java
@Query("SELECT m FROM Movie m WHERE m.rating LIKE ?1%")
List<Movie> searchByRatingStartsWith(String rating);
~~~

下面是测试代码：

~~~java
List<Movie> results = movieRepository.searchByRatingStartsWith("PG");
assertEquals(6, results.size());
~~~

在Spring Boot2.4之后，我们可以使用SpEL表达式：

~~~java
@Query("SELECT m FROM Movie m WHERE m.director LIKE %?#{escape([0])} escape ?#{escapeCharacter()}")
List<Movie> searchByDirectorEndsWith(String director);
~~~

看下怎么使用：

~~~java
List<Movie> results = movieRepository.searchByDirectorEndsWith("Burton");
assertEquals(1, results.size());
~~~

本文的例子可以参考[](https://github.com/ddean2009/learn-springboot2/tree/master/springboot-query)

更多教程请参考 [flydean的博客](www.flydean.com)



