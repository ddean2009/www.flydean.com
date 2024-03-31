---
slug: /springboot-jpa-java8
---

# 14. Spring Boot JPA中java 8 的应用

上篇文章中我们讲到了如何在Spring Boot中使用JPA。 本文我们将会讲解如何在Spring Boot JPA中使用java 8 中的新特习惯如：Optional, Stream API 和 CompletableFuture的使用。

## Optional

我们从数据库中获取的数据有可能是空的，对于这样的情况Java 8 提供了Optional类，用来防止出现空值的情况。我们看下怎么在Repository 中定义一个Optional的方法：

~~~java
public interface BookRepository extends JpaRepository<Book, Long> {

    Optional<Book> findOneByTitle(String title);
}

~~~

我们看下测试方法怎么实现：

~~~java
    @Test
    public void testFindOneByTitle(){

        Book book = new Book();
        book.setTitle("title");
        book.setAuthor(randomAlphabetic(15));

        bookRepository.save(book);
        log.info(bookRepository.findOneByTitle("title").orElse(new Book()).toString());
    }
~~~

## Stream API

为什么会有Stream API呢？ 我们举个例子，如果我们想要获取数据库中所有的Book， 我们可以定义如下的方法：

~~~java
public interface BookRepository extends JpaRepository<Book, Long> {

    List<Book> findAll();

    Stream<Book> findAllByTitle(String title);

}
~~~

上面的findAll方法会获取所有的Book，但是当数据库里面的数据太多的话，就会消耗过多的系统内存，甚至有可能导致程序崩溃。

为了解决这个问题，我们可以定义如下的方法：

~~~java
Stream<Book> findAllByTitle(String title);
~~~

当你使用Stream的时候，记得需要close它。 我们可以使用java 8 中的try语句来自动关闭：

~~~java
   @Test
    @Transactional
    public void testFindAll(){

        Book book = new Book();
        book.setTitle("titleAll");
        book.setAuthor(randomAlphabetic(15));
        bookRepository.save(book);

        try (Stream<Book> foundBookStream
                     = bookRepository.findAllByTitle("titleAll")) {
            assertThat(foundBookStream.count(), equalTo(1l));
        }
    }
~~~

这里要注意， 使用Stream必须要在Transaction中使用。否则会报如下错误：

~~~txt
org.springframework.dao.InvalidDataAccessApiUsageException: You're trying to execute a streaming query method without a surrounding transaction that keeps the connection open so that the Stream can actually be consumed. Make sure the code consuming the stream uses @Transactional or any other way of declaring a (read-only) transaction.
~~~

所以这里我们加上了@Transactional 注解。

## CompletableFuture

使用java 8 的CompletableFuture， 我们还可以异步执行查询语句：

~~~java
    @Async
    CompletableFuture<Book> findOneByAuthor(String author);
~~~

我们这样使用这个方法：

~~~java
    @Test
    public void testByAuthor() throws ExecutionException, InterruptedException {
        Book book = new Book();
        book.setTitle("titleA");
        book.setAuthor("author");
        bookRepository.save(book);

        log.info(bookRepository.findOneByAuthor("author").get().toString());
    }
~~~

本文的例子可以参考[https://github.com/ddean2009/learn-springboot2/tree/master/springboot-jpa](https://github.com/ddean2009/learn-springboot2/tree/master/springboot-jpa)

