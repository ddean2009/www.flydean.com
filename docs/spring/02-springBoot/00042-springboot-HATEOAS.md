---
slug: /springboot-HATEOAS
---

# 42. SpringBoot之:SpringBoot中使用HATEOAS



# 简介

HATEOAS是实现REST规范的一种原则，通过遵循HATEOAS规范，可以解决我们实际代码实现的各种个问题。作为java最流行的框架Spring
当然也会不缺席HATEOAS的集成。

本文将会通过一个具体的例子来讲解如何在SpringBoot中使用HATEOAS。

# 我们的目标

HATEOAS规则中，返回的数据会带有链接。我们以熟悉的Book为例，来展示这次的HATEOAS，首先创建一个Book entity：

```
@Data
@Entity
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
}
```

我们希望能够通过下面的链接来获取到Book的详细数据：

```
GET /book/1
```

返回的数据如下：
```

{
    "content": {
        "id": 1,
        "title": "The Hobbit"
    },
    "_links": {
        "self": {
            "href": "http://localhost:8080/book/1"
        }
    }
}

```

可以看到在返回的数据中除了content包含了book的信息之外，还有一个_links属性，表示和该Book相关的资源链接。

# 构建Entity和Repository

在做任何数据之前，我们都需要构建相应的数据，也就是entity和对应的数据操作，为了简便起见，我们使用H2的内存数据库。

我们需要在application.properties中配置如下：

```
spring.jpa.hibernate.ddl-auto=validate

spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=password
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
```

然后配置对应的repository :

```
public interface BookRepository extends CrudRepository<Book, Long> {
    long deleteByTitle(String title);

    @Modifying
    @Query("delete from Book b where b.title=:title")
    void deleteBooks(@Param("title") String title);
}
```

同时，需要在resources中放置创建table的schema.sql和插入数据的data.sql。这样在程序启动的时候就可以自动创建相应的数据。

# 构建HATEOAS相关的RepresentationModel

如果要让自己来实现，也可以实现添加链接的操作，但是这样就太复杂了，还好我们有Spring。要在Spring中使用HATEOAS，需要进行如下配置：

```
<dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-hateoas</artifactId>
        </dependency>
```

如果我们想要对Book进行HATEOAS的构建，那么可以构建一个类，继承RepresentationModel即可：

```
public class BookModel extends RepresentationModel<BookModel> {

    private final Book content;

    @JsonCreator
    public BookModel(@JsonProperty("content") Book content) {
        this.content = content;
    }

    public Book getContent() {
        return content;
    }
}
```

上面的例子中，我们用RepresentationModel封装了一个Book对象，并将其设置为json的content属性。

# 构建Controller

有了RepresentationModel，我们就可以使用它来构建HATEOAS的响应了。

我们看下面的例子：

```
	@RequestMapping("/book/{id}")
	public HttpEntity<Book> getBook(@PathVariable("id") Long id) {
		Book book= bookRepository.findById(id).get();
		BookModel bookModel = new BookModel(book);
		bookModel.add(linkTo(methodOn(BookController.class).getBook(id)).withSelfRel());
		return new ResponseEntity(bookModel, HttpStatus.OK);
	}
```

上面的例子中，我们使用@RequestMapping来构建了一个HTTP请求，通过传入book的id来从数据库中查找相应的Book数据。

然后将其传入BookModel中，构建好RepresentationModel。这时候可以直接返回这个对象。但是我们还需要向其添加一些links。

我们使用bookModel.add来添加相应的link。并且使用linkTo方法来生成相应的link。

最后将RepresentationModel返回。

当我们请求/book/1的时候，就会得到最前面我们想要得到的json值。使用HATEOAS是不是很简单？

# HATEOAS的意义

HATEOAS带有相应的资源链接，通过一个资源就可以得到从这个资源可以访问的其他的资源，就像是一个访问到一个页面，可以再通过这个页面去访问其他的页面一样。

所以HATEOAS的意义就在于我们只需要访问一个资源就可以遍历所有的资源。

我们通过测试来体验一下资源的访问。

首先，我们直接访问/book/1这个资源，来确认下得到的结果：

```
    @Test
    void envEndpointNotHidden() throws Exception {
        mockMvc.perform(get("/book/1"))
                .andExpect(jsonPath("$.content.title").value("The Hobbit"));
    }
```

然后再通过Spring HATEOAS提供的Traverson类来进行链接的遍历：

```
	@Test
	void envEndpointNotHidden() throws Exception {
		Traverson traverson = new Traverson(new URI("http://localhost:" + this.port + "/book/1"), MediaTypes.HAL_JSON);
		String bookTitle = traverson.follow("self").toObject("$.content.title");
		assertThat(bookTitle).isEqualTo("The Hobbit");
	}
```

# 总结

很好，我们已经可以使用基本的HATEOAS了，本文例子可以参考：

![learn-springboot2](https://github.com/ddean2009/learn-springboot2)

