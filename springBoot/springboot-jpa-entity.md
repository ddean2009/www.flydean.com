Spring Boot JPA中使用@Entity和@Table

本文中我们会讲解如何在Spring Boot JPA中实现class和数据表格的映射。

## 默认实现

Spring Boot JPA底层是用Hibernate实现的，默认情况下，数据库表格的名字是相应的class名字的首字母大写。命名的定义是通过接口ImplicitNamingStrategy来定义的：

~~~java
	/**
	 * Determine the implicit name of an entity's primary table.
	 *
	 * @param source The source information
	 *
	 * @return The implicit table name.
	 */
	public Identifier determinePrimaryTableName(ImplicitEntityNameSource source);
~~~

我们看下它的实现ImplicitNamingStrategyJpaCompliantImpl：

~~~java
	@Override
	public Identifier determinePrimaryTableName(ImplicitEntityNameSource source) {
		if ( source == null ) {
			// should never happen, but to be defensive...
			throw new HibernateException( "Entity naming information was not provided." );
		}

		String tableName = transformEntityName( source.getEntityNaming() );

		if ( tableName == null ) {
			// todo : add info to error message - but how to know what to write since we failed to interpret the naming source
			throw new HibernateException( "Could not determine primary table name for entity" );
		}

		return toIdentifier( tableName, source.getBuildingContext() );
	}
~~~

如果我们需要修改系统的默认实现，则可以实现接口PhysicalNamingStrategy：

~~~java
public interface PhysicalNamingStrategy {
	public Identifier toPhysicalCatalogName(Identifier name, JdbcEnvironment jdbcEnvironment);

	public Identifier toPhysicalSchemaName(Identifier name, JdbcEnvironment jdbcEnvironment);

	public Identifier toPhysicalTableName(Identifier name, JdbcEnvironment jdbcEnvironment);

	public Identifier toPhysicalSequenceName(Identifier name, JdbcEnvironment jdbcEnvironment);

	public Identifier toPhysicalColumnName(Identifier name, JdbcEnvironment jdbcEnvironment);
}
~~~

## 使用@Table自定义表格名字

我们可以在@Entity中使用@Table来自定义映射的表格名字：

~~~java
@Entity
@Table(name = "ARTICLES")
public class Article {
    // ...
}
~~~

当然，我们可以将整个名字写在静态变量中：

~~~java
@Entity
@Table(name = Article.TABLE_NAME)
public class Article {
    public static final String TABLE_NAME= "ARTICLES";
    // ...
}
~~~

## 在JPQL Queries中重写表格名字

通常我们在@Query中使用JPQL时可以这样用：

~~~java
@Query(“select * from Article”)
~~~

其中Article默认是Entity类的Class名称，我们也可以这样来修改它：

~~~java
@Entity(name = "MyArticle")
~~~

这时候我们可以这样定义JPQL：

~~~java
@Query(“select * from MyArticle”)
~~~

更多教程请参考 [flydean的博客](www.flydean.com)

