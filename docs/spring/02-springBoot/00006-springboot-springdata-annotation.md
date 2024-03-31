---
slug: /springboot-springdata-annotation
---

# 6. Spring Boot中Spring data注解的使用

Sring data JPA为我们提供了很多有用的注解，方便我们来实现各种复杂的功能。本文我们将会从Spring Data Annotations和Spring Data JPA Annotations两部分来讲解。 

## Spring Data Annotations

Spring Data Annotations是指这些注解来自于spring-data-commons包里面的。Spring Data不仅可以用于JPA， 它还有很多其他的数据提供方，JPA只是其中的一个具体实现。

### @Transactional

使用@Transactional可以很简单的将方法配置成为Transactional：

~~~java
@Transactional
void pay() {}
~~~

@Transactional可以放在方法上，也可以放在class上面，如果放在class上面则说明该class中的所有方法都适用于Transactional。

### @NoRepositoryBean

有时候我们在创建父Repository的时候，我们不需要为该父Repository创建一个具体的实现， 我们只是想为子Repository提供一个公共的方法而已，这时候，我们就可以在父类上面加入@NoRepositoryBean注解：

~~~java
@NoRepositoryBean
public interface ParentRepository<T, ID extends Serializable> extends CrudRepository<T, ID> {

    Optional<T> findById(ID id);
}
~~~

子类如下：

~~~java
@Repository
public interface ChildRepository extends ParentRepository<Person, Long> {
}
~~~

### @Param

我们可以通过使用@Param从而在Query语句中传递参数：

~~~java
@Query("FROM Person p WHERE p.name = :name")
Person findByName(@Param("name") String name);
~~~

### @Id

@Id表示Entity的primary key：

~~~java
class Person {
 
    @Id
    Long id;
 
    // ...
     
}
~~~

### @Transient

通过使用@Transient， 表明Entity的某个字段是不需要被存储的。 

~~~java
class Person {
 
    // ...
 
    @Transient
    int age;
 
    // ...
 
}
~~~

### @CreatedBy, @LastModifiedBy, @CreatedDate, @LastModifiedDate

通过这些注解，我们可以从principals中获得相应的数据：

~~~java
public class Person {
 
    // ...
 
    @CreatedBy
    User creator;
     
    @LastModifiedBy
    User modifier;
     
    @CreatedDate
    Date createdAt;
     
    @LastModifiedDate
    Date modifiedAt;
 
    // ...
 
}
~~~

因为需要使用到principals，所有这些注解是和Spring Security配合使用的。

## Spring Data JPA Annotations

Spring Data JPA Annotations是来自于spring-data-jpa包的。

### @Query

通过使用@Query， 我们可以自定义SQL语句：

~~~java
@Query("SELECT COUNT(*) FROM Person p")
long getPersonCount();
~~~

我们也可以传递参数：

~~~java
@Query("FROM Person p WHERE p.name = :name")
Person findByName(@Param("name") String name);
~~~

我们还可以使用native SQL查询：

~~~java
@Query(value = "SELECT AVG(p.age) FROM person p", nativeQuery = true)
int getAverageAge();
~~~

### @Procedure

通过@Procedure， 我们可以调用数据库中的存储过程：

~~~java
@NamedStoredProcedureQueries({ 
    @NamedStoredProcedureQuery(
        name = "count_by_name", 
        procedureName = "person.count_by_name", 
        parameters = { 
            @StoredProcedureParameter(
                mode = ParameterMode.IN, 
                name = "name", 
                type = String.class),
            @StoredProcedureParameter(
                mode = ParameterMode.OUT, 
                name = "count", 
                type = Long.class) 
            }
    ) 
})
 
class Person {}
~~~

我们可以在Entity上面添加该注解。然后看下怎么调用：

~~~java
@Procedure(name = "count_by_name")
long getCountByName(@Param("name") String name);
~~~

### @Lock

通过使用@Lock，我们可以选择数据库的隔离方式：

~~~java
@Lock(LockModeType.NONE)
@Query("SELECT COUNT(*) FROM Person p")
long getPersonCount();
~~~

Lock的值可以有如下几种：

* READ
* WRITE
* OPTIMISTIC
* OPTIMISTIC_FORCE_INCREMENT
* PESSIMISTIC_READ
* PESSIMISTIC_WRITE
* PESSIMISTIC_FORCE_INCREMENT
* NONE

### @Modifying

@Modifying表示我们有修改数据库的操作：

~~~java
@Modifying
@Query("UPDATE Person p SET p.name = :name WHERE p.id = :id")
void changeName(@Param("id") long id, @Param("name") String name);
~~~

### @EnableJpaRepositories

通过使用@EnableJpaRepositories，我们来配置Japa Repository的相关信息：

~~~java
@Configuration
@EnableJpaRepositories(basePackages = "com.flydean.repository")
public class PersistenceConfig {
}
~~~

默认情况下，我们会在@Configuration类的子类中查找repositories，通过使用basePackages， 我们可以指定其他的目录。

本文的例子可以参考:[https://github.com/ddean2009/learn-springboot2/tree/master/springboot-jpa](https://github.com/ddean2009/learn-springboot2/tree/master/springboot-jpa)





