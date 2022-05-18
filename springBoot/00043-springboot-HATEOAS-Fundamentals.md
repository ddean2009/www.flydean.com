SpringBoot之:SpringBoot的HATEOAS基础

[toc]

# 简介

SpringBoot提供了HATEOAS的便捷使用方式，前面一篇文章我们也讲了如何在SpringBoot中使用HATEOAS。本文将会对这些内容进行扩展深入，详细讲解SpringBoot提供的这些基本方法。

# 链接Links

HATEOAS的一个非常重要的特征就是在resources资源中包含超媒体，而超媒体最简单的表示就是链接。

Spring HATEOAS为我们简化了封装Links的功能。

我们看一个HTML中的link标签的例子：

```
<head>
<link rel="stylesheet" type="text/css" href="theme.css" />
</head>
```

可以看到一个link有两个比较重要的属性，一个是href代表link的链接，还有一个属性是rel表示的当前文档与被链接文档之间的关系。

我们看下Link中的关键方法：

```
	public static Link of(String href) {
		return new Link(href);
	}

	public static Link of(String href, String relation) {
		return new Link(href, relation);
	}

	public static Link of(String href, LinkRelation relation) {
		return new Link(href, relation);
	}
```

可以传入href和relation来构建一个Link对象。

看下面的例子：

```
Link link = Link.of("/something");

link = Link.of("/something", "my-rel");

```

其中LinkRelation是关联关系的一个封装接口，注意，它是一个接口，我们可以使用IanaLinkRelations中的具体实现来对其赋值，如下所示：

```
LinkRelation REL_SELF = IanaLinkRelations.SELF;
LinkRelation REL_FIRST = IanaLinkRelations.FIRST;
LinkRelation REL_PREVIOUS = IanaLinkRelations.PREV;
LinkRelation REL_NEXT = IanaLinkRelations.NEXT;
LinkRelation REL_LAST = IanaLinkRelations.LAST;
```

# URI templates

上面的例子中link是指定好的，是静态的。有时候我们希望link可以根据参数进行变换，那么这样的link就是动态的link，我们可以通过定义URI模板来实现。

所以Link还可以通过UriTemplate来构建：

```
	public static Link of(UriTemplate template, String relation) {
		return new Link(template, relation);
	}

    public static Link of(UriTemplate template, LinkRelation relation) {
		return new Link(template, relation);
	}
```

UriTemplate是对URI模板的封装，我们看一个使用的例子：

```
Link link = Link.of("/{segment}/something{?parameter}");

Map<String, Object> values = new HashMap<>();
values.put("segment", "path");
values.put("parameter", 42);

assertThat(link.expand(values).getHref()) 
    .isEqualTo("/path/something?parameter=42");
```

上面的例子中，通过string来构建一个link，然后调用expand传入参数对应的map，来构建真实的href值。

除了直接使用string之外，还可以传入UriTemplate：

```
UriTemplate template = UriTemplate.of("/{segment}/something")
  .with(new TemplateVariable("parameter", VariableType.REQUEST_PARAM);

assertThat(template.toString()).isEqualTo("/{segment}/something{?parameter}");
```

# Link relations

Link relations指的是link中的ref属性。代表的是当前文档与被链接文档之间的关系。Spring HATEOAS中有一个LinkRelation类来表示。

IANA（Internet Assigned Numbers Authority）预定义了一些relations，可以通过IanaLinkRelations这个类来获取，如下所示：

```
Link link = Link.of("/some-resource"), IanaLinkRelations.NEXT);

assertThat(link.getRel()).isEqualTo(LinkRelation.of("next"));
assertThat(IanaLinkRelation.isIanaRel(link.getRel())).isTrue();

```

# Representation models

我们需要访问的是一个个的资源，然后需要在一个个的资源中加入link，Spring HATEOAS为我们提供了一个简单的类叫做RepresentationModel。它包含了Links和一些很方便的方法来帮助我们创建带链接的资源。

最简单的使用方法就是创建一个RepresentationModel的子类：

```
public class BookModel extends RepresentationModel<BookModel> {

    private final Book content;

}
```

我们通过add方法来对其添加link：

```
bookModel.add(linkTo(methodOn(BookController.class).getBook(id)).withSelfRel());
```		

> 注意，在这种情况下，我们的Accept类型应该是application/hal+json。

对于简单类型，我们可以直接使用EntityModel对其进行封装：

```
Person person = new Person("Dave", "Matthews");
EntityModel<Person> model = EntityModel.of(person);

```

对于集合，可以使用CollectionModel：

```
Collection<Person> people = Collections.singleton(new Person("Dave", "Matthews"));
CollectionModel<Person> model = CollectionModel.of(people);
```

# 总结

上讲解的Link，URI templates，Link relations和RepresentationModel就是Spring HATEOAS的基础，掌握了他们基本上就掌握了Spring HATEOAS。

