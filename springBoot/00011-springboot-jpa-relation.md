# Spring Boot JPA中关联表的使用

本文中，我们会将会通过一个Book和Category的关联关系，来讲解如何在JPA中使用。

## 添加依赖

我们还是使用H2内存数据库来做测试：

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

## 构建Entity

下面我们构建两个Entity：

~~~java
@Data
@Entity
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;

    @ManyToOne
    private Category category;
}
~~~

~~~java
@Data
@Entity
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL)
    private List<Book> books;
}
~~~

上面我们定义了两个Entity，Category和Book是一对多的关系。我们通过@ManyToOne和@OneToMany来定义相应的关系。 

## 构建Repository

我们接下来构建相应的Repository：

~~~java
public interface BookRepository extends CrudRepository<Book, Long> {
    long deleteByTitle(String title);

    @Modifying
    @Query("delete from Book b where b.title=:title")
    void deleteBooks(@Param("title") String title);
}
~~~

~~~java
public interface CategoryRepository extends CrudRepository<Category, Long> {}
~~~

## 构建初始数据

为了方便测试，我们先构建需要的数据schema.sql和data.sql:

~~~sql
CREATE TABLE book (
    id   BIGINT      NOT NULL AUTO_INCREMENT,
    title VARCHAR(128) NOT NULL,
    category_id BIGINT,
    PRIMARY KEY (id)
);

CREATE TABLE category (
    id   BIGINT      NOT NULL AUTO_INCREMENT,
    name VARCHAR(128) NOT NULL,
    PRIMARY KEY (id)
);
~~~

~~~sql
insert into book(id,title,category_id)
values(1,'The Hobbit',1);
insert into book(id,title,category_id)
values(2,'The Rabbit',1);

insert into category(id,name)
values(1,'category');
~~~

## 测试

我们看一下怎么从Book中删除一条数据：

~~~java
    @Test
    public void whenDeleteByIdFromRepository_thenDeletingShouldBeSuccessful() {
        assertThat(bookRepository.count()).isEqualTo(2);
        bookRepository.deleteById(1L);
        assertThat(bookRepository.count()).isEqualTo(1);
    }
~~~

再看一下category的删除：

~~~java
    @Test
    public void whenDeletingCategories_thenBooksShouldAlsoBeDeleted() {
        categoryRepository.deleteAll();
        assertThat(bookRepository.count()).isEqualTo(0);
        assertThat(categoryRepository.count()).isEqualTo(0);
    }
~~~

再看一下book的删除：

~~~java
    @Test
    public void whenDeletingBooks_thenCategoriesShouldAlsoBeDeleted() {
        bookRepository.deleteAll();
        assertThat(bookRepository.count()).isEqualTo(0);
        assertThat(categoryRepository.count()).isEqualTo(1);
    }
~~~

因为我们只在Category中指定了cascade = CascadeType.ALL， 所以删除category的时候可以删除相关联的Book，但是删除Book的时候不会删除相关联的category。

本文的例子可以参考[https://github.com/ddean2009/learn-springboot2/tree/master/springboot-jpa-relation](https://github.com/ddean2009/learn-springboot2/tree/master/springboot-jpa-relation)


