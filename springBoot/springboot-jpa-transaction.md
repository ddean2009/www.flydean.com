Spring Boot JPA 中transaction的使用

transaction是我们在做数据库操作的时候不能回避的一个话题，通过transaction，我们可以保证数据库操作的原子性，一致性，隔离性和持久性。

本文我们将会深入的探讨Spring Boot JPA中@Transactional注解的使用。

通过@Transactional注解，我们可以设置事物的传播级别和隔离级别，同时可以设置timeout, read-only, 和 rollback等特性。

## @Transactional的实现

Spring通过创建代理或者操纵字节码来实现事物的创建，提交和回滚操作。如果是代理模式的话，Spring会忽略掉@Transactional的内部方法调用。

如果我们有个方法callMethod，并标记它为@Transactional,那么Spring Boot的实现可能是如下方式：

~~~java
createTransactionIfNecessary();
try {
    callMethod();
    commitTransactionAfterReturning();
} catch (exception) {
    completeTransactionAfterThrowing();
    throw exception;
}
~~~

## @Transactional的使用

@Transactional使用起来很简单，可以放在class上，可以放在interface上，也可以放在方法上面。

如果放在方法上面，那么该方法中的所有public方法都会应用该Transaction。

如果@Transactional放在private方法上面，则Spring Boot将会忽略它。

## Transaction的传播级别

传播级别Propagation定义了Transaction的边界，我们可以很方便的在@Transactional注解中定义不同的传播级别。

下面我们来分别看一下Transaction的传播级别。

### REQUIRED

REQUIRED是默认的传播级别，下面的两种写法是等价的：

~~~java
    @Transactional
    public void deleteBookWithDefaultTransaction(Long id) {
        bookRepository.deleteBookById(id);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public void deleteBookWithRequired(Long id) {
    }
~~~

Spring会检测现在是否有一个有效的transaction。如果没有则创建，如果有transaction，则Spring将会把该放方法的业务逻辑附加到已有的transaction中。

我们再看下REQUIRED的伪代码：

~~~java
if (isExistingTransaction()) {
    if (isValidateExistingTransaction()) {
        validateExisitingAndThrowExceptionIfNotValid();
    }
    return existing;
}
return createNewTransaction();
~~~

### SUPPORTS

在SUPPORTS的情况下，Spring首先会去检测是否有存在Transaction，如果存在则使用，否则不会使用transaction。

我们看下代码怎么使用：

~~~java
    @Transactional(propagation = Propagation.SUPPORTS)
    public void deleteBookWithSupports(Long id) {
    }
~~~

SUPPORTS的实现伪代码如下：

~~~java
if (isExistingTransaction()) {
    if (isValidateExistingTransaction()) {
        validateExisitingAndThrowExceptionIfNotValid();
    }
    return existing;
}
return emptyTransaction;
~~~

### MANDATORY

在MANDATORY情况下，Spring先会去检测是否有一个Transaction存在，如果存在则使用，否则抛出异常。

我们看下代码怎么使用：

~~~java
    @Transactional(propagation = Propagation.MANDATORY)
    public void deleteBookWithMandatory(Long id) {
    }
~~~

MANDATORY的实现逻辑如下：

~~~java
if (isExistingTransaction()) {
    if (isValidateExistingTransaction()) {
        validateExisitingAndThrowExceptionIfNotValid();
    }
    return existing;
}
throw IllegalTransactionStateException;
~~~

### NEVER

如果是NEVER的情况下，如果现在有一个Transaction存在，则Spring会抛出异常。

使用的代码如下：

~~~java
    @Transactional(propagation = Propagation.NEVER)
    public void deleteBookWithNever(Long id) {
    }
~~~

实现逻辑代码如下：

~~~java
if (isExistingTransaction()) {
    throw IllegalTransactionStateException;
}
return emptyTransaction;
~~~

### NOT_SUPPORTED

如果使用的是NOT_SUPPORTED，那么Spring将会首先暂停现有的transaction，然后在非transaction情况下执行业务逻辑。

我们这样使用：

~~~java
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public void deleteBookWithNotSupported(Long id) {
    }
~~~

### REQUIRES_NEW

当REQUIRES_NEW使用时，Spring暂停当前的Transaction，并创建一个新的。

我们看下代码怎么使用：

~~~java
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void deleteBookWithRequiresNew(Long id){
    }
~~~

相应的实现代码如下：

~~~java
if (isExistingTransaction()) {
    suspend(existing);
    try {
        return createNewTransaction();
    } catch (exception) {
        resumeAfterBeginException();
        throw exception;
    }
}
return createNewTransaction();
~~~

### NESTED

NESTED顾名思义，是嵌套的Transaction，Spring首先检查transaction是否存在，如果存在则创建一个savepoint，如果我们的程序抛出异常的时候，transaction将会回滚到该savepoint。如果没有transaction，NESTED的表现和REQUIRED一样。

我们看下怎么使用：

~~~java
    @Transactional(propagation = Propagation.NESTED)
    public void deleteBookWithNested(Long id){
    }
~~~

## Transaction的隔离级别

隔离级别就是我们之前提到的原子性，一致性，隔离性和持久性。隔离级别描述了改动对其他并发者的可见程度。

隔离级别主要是为了防止下面3个并发过程中可能出现的问题：

1. 脏读： 读取一个transaction还没有提交的change
2. 不可重复读：在一个transaction修改数据库中的某行数据时，另外一个transaction多次读取同一行数据，获取到的不同的值。
3. 幻读： 在一个transaction添加或者删除数据库的数据时，另外一个transaction做范围查询，获得了不同的数据行数。

### READ_UNCOMMITTED

READ_UNCOMMITTED是隔离级别中最低的级别。这个级别下，并发的3个问题都可能出现。

我们这样使用：

~~~java
    @Transactional(isolation = Isolation.READ_UNCOMMITTED)
    public void deleteBookWithReadUncommitted(Long id){
    }
~~~

### READ_COMMITTED

READ_COMMITTED可以防止脏读。

我们看下代码：

~~~java
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void deleteBookWithReadCommitted(Long id){
    }
~~~

### REPEATABLE_READ

REPEATABLE_READ可以防止脏读和不可重复读。

使用的代码如下：

~~~java
    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public void deleteBookWithRepeatableRead(Long id){
    }
~~~

### SERIALIZABLE

SERIALIZABLE是最严格的基本，可以防止脏读，不可重复读和幻读。

我们看下怎么使用：

~~~java
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public void deleteBookWithSerializable(Long id){
    }
~~~

