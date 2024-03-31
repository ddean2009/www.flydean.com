---
slug: /spring5-spel
---

# 18. SpEL

SpEL的全称叫做Spring Expression Language。通常是为了在XML或者注解里面方便求值用的，通过编写#{ <expression string> }这样的格式，即可使用。

## Bean定义中的使用

**XML配置**

可以用SpEL设置属性或构造函数参数值，如下示例所示：

~~~xml
    <bean id="numberGuess" class="com.flydean.beans.NumberGuess">
        <property name="randomNumber" value="#{ T(java.lang.Math).random() * 100.0 }"/>

        <!-- other properties -->
    </bean>
~~~

Spring内置了很多预定义变量，如SystemProperties， 你可以像下面这样直接引用它：

~~~xml
    <bean id="taxCalculator" class="com.flydean.beans.TaxCalculator">
        <property name="defaultLocale" value="#{ systemProperties['user.region'] }"/>

        <!-- other properties -->
    </bean>
~~~

同样的，你还可以按名称引用其他bean属性，如下示例所示：

~~~xml
    <bean id="shapeGuess" class="com.flydean.beans.NumberGuess">
        <property name="randomNumber" value="#{ numberGuess.randomNumber }"/>

        <!-- other properties -->
    </bean>
~~~

**注解配置**

要指定默认值，可以将@value注解放在字段、方法、方法或构造函数参数上。

以下示例设置字段变量的默认值：

~~~java
public static class FieldValueTestBean

    @Value("#{ systemProperties['user.region'] }")
    private String defaultLocale;

    public void setDefaultLocale(String defaultLocale) {
        this.defaultLocale = defaultLocale;
    }

    public String getDefaultLocale() {
        return this.defaultLocale;
    }

}
~~~


下面的示例显示了在属性设置器方法上的示例：

~~~java
public static class PropertyValueTestBean

    private String defaultLocale;

    @Value("#{ systemProperties['user.region'] }")
    public void setDefaultLocale(String defaultLocale) {
        this.defaultLocale = defaultLocale;
    }

    public String getDefaultLocale() {
        return this.defaultLocale;
    }

}
~~~

autowired方法和构造函数也可以使用@value注解，如下示例所示：

~~~java
public class SimpleMovieLister {

    private MovieFinder movieFinder;
    private String defaultLocale;

    @Autowired
    public void configure(MovieFinder movieFinder,
            @Value("#{ systemProperties['user.region'] }") String defaultLocale) {
        this.movieFinder = movieFinder;
        this.defaultLocale = defaultLocale;
    }

    // ...
}
~~~

~~~java
public class MovieRecommender {

    private String defaultLocale;

    private CustomerPreferenceDao customerPreferenceDao;

    @Autowired
    public MovieRecommender(CustomerPreferenceDao customerPreferenceDao,
            @Value("#{systemProperties['user.country']}") String defaultLocale) {
        this.customerPreferenceDao = customerPreferenceDao;
        this.defaultLocale = defaultLocale;
    }

    // ...
}
~~~

## 求值

虽然SpEL通常用在Spring的XML和注解中，但是它可以脱离Spring独立使用的，这时候需要自己去创建一些引导基础结构类，如解析器。 大多数Spring用户不需要处理这个基础结构，只需要编写表达式字符串进行求值。


## 支持的功能

SpELl支持很多种功能，包括：

* 文字表达式
* 属性、数组、列表、映射和索引器
* 内联 List
* 内联 Map
* Array
* 方法
* Operators
* 类型
* Constructors
* 变量
* 功能
* bean引用
* 三元运算符（if-then-else）
* elvis
* Safe Navigation Operator

下面分别举例子：

**文字表达式**

支持的文本表达式类型包括字符串、数值（int、real、hex）、布尔值和null。字符串由单引号分隔。要将单引号本身放入字符串中，请使用两个单引号字符。

~~~java
public class LiteralApp {
    public static void main(String[] args) {
        ExpressionParser parser = new SpelExpressionParser();

// evals to "Hello World"
        String helloWorld = (String) parser.parseExpression("'Hello World'").getValue();

        double avogadrosNumber = (Double) parser.parseExpression("6.0221415E+23").getValue();

// evals to 2147483647
        int maxValue = (Integer) parser.parseExpression("0x7FFFFFFF").getValue();

        boolean trueValue = (Boolean) parser.parseExpression("true").getValue();

        Object nullValue = parser.parseExpression("null").getValue();
    }
}
~~~

**Properties, Arrays, Lists, Maps, and Indexers**

Properties 通过 “.” 来访问嵌套的属性值。如下：

~~~java
// evals to 1856
int year = (Integer) parser.parseExpression("Birthdate.Year + 1900").getValue(context);

String city = (String) parser.parseExpression("placeOfBirth.City").getValue(context);
~~~

属性名称的第一个字母允许不区分大小写。数组和列表的内容是使用方括号表示法获得的，如下例所示

~~~java
ExpressionParser parser = new SpelExpressionParser();
EvaluationContext context = SimpleEvaluationContext.forReadOnlyDataBinding().build();

// Inventions Array

// evaluates to "Induction motor"
String invention = parser.parseExpression("inventions[3]").getValue(
        context, tesla, String.class);

// Members List

// evaluates to "Nikola Tesla"
String name = parser.parseExpression("Members[0].Name").getValue(
        context, ieee, String.class);

// List and Array navigation
// evaluates to "Wireless communication"
String invention = parser.parseExpression("Members[0].Inventions[6]").getValue(
        context, ieee, String.class);
~~~

映射的内容是通过在括号内指定文本键值获得的：

~~~java
// Officer's Dictionary

Inventor pupin = parser.parseExpression("Officers['president']").getValue(
        societyContext, Inventor.class);

// evaluates to "Idvor"
String city = parser.parseExpression("Officers['president'].PlaceOfBirth.City").getValue(
        societyContext, String.class);

// setting values
parser.parseExpression("Officers['advisors'][0].PlaceOfBirth.Country").setValue(
        societyContext, "Croatia");
~~~

**Inline List**

你可以直接在表达式中表示列表：
~~~java
// evaluates to a Java list containing the four numbers
List numbers = (List) parser.parseExpression("{1,2,3,4}").getValue(context);

List listOfLists = (List) parser.parseExpression("{{'a','b'},{'x','y'}}").getValue(context);
~~~

**Inline Map**

你还可以使用key:value表示法在表达式中直接表示映射。以下示例显示了如何执行此操作：

~~~java
// evaluates to a Java map containing the two entries
Map inventorInfo = (Map) parser.parseExpression("{name:'Nikola',dob:'10-July-1856'}").getValue(context);

Map mapOfMaps = (Map) parser.parseExpression("{name:{first:'Nikola',last:'Tesla'},dob:{day:10,month:'July',year:1856}}").getValue(context);

~~~

**构造数组**

可以使用熟悉的Java语法构建数组，可以选择的提供初始化器，以便在构建时填充数组。以下示例显示了如何执行此操作：

~~~java
int[] numbers1 = (int[]) parser.parseExpression("new int[4]").getValue(context);

// Array with initializer
int[] numbers2 = (int[]) parser.parseExpression("new int[]{1,2,3}").getValue(context);

// Multi dimensional array
int[][] numbers3 = (int[][]) parser.parseExpression("new int[4][5]").getValue(context);
~~~

**方法**

可以通过使用典型的Java编程语法来调用方法。还可以对文本调用方法。还支持变量参数。以下示例演示如何调用方法：

~~~java
// string literal, evaluates to "bc"
String bc = parser.parseExpression("'abc'.substring(1, 3)").getValue(String.class);

// evaluates to true
boolean isMember = parser.parseExpression("isMember('Mihajlo Pupin')").getValue(
        societyContext, Boolean.class);
~~~

**类型**

您可以使用特殊的T运算符来指定java.lang.class（类型）的实例。静态方法也可以使用此运算符调用。StandardEvaluationContext使用TypeLocator来查找类型，StandardTypeLocator（可以替换）是在理解java.lang包的基础上构建的。这意味着T（）对java.lang中类型的引用不需要完全限定，但所有其他类型引用都必须是限定的。下面的示例演示如何使用T运算符：

~~~java
Class dateClass = parser.parseExpression("T(java.util.Date)").getValue(Class.class);

Class stringClass = parser.parseExpression("T(String)").getValue(Class.class);

boolean trueValue = parser.parseExpression(
        "T(java.math.RoundingMode).CEILING < T(java.math.RoundingMode).FLOOR")
        .getValue(Boolean.class);
~~~

**构造器**

可以使用new运算符调用构造函数。除了基元类型（int、float等）和字符串之外，其他类型都应该使用完全限定的类名。下面的示例演示如何使用新的运算符来调用构造函数：

~~~java
Inventor einstein = p.parseExpression(
        "new org.spring.samples.spel.inventor.Inventor('Albert Einstein', 'German')")
        .getValue(Inventor.class);

//create new inventor instance within add method of List
p.parseExpression(
        "Members.add(new org.spring.samples.spel.inventor.Inventor(
            'Albert Einstein', 'German'))").getValue(societyContext);
~~~

**变量**

可以使用#variableName语法引用表达式中的变量。变量是通过在EvaluationContext实现上使用setVariable方法设置的。以下示例显示如何使用变量：

~~~java
Inventor tesla = new Inventor("Nikola Tesla", "Serbian");

EvaluationContext context = SimpleEvaluationContext.forReadWriteDataBinding().build();
context.setVariable("newName", "Mike Tesla");

parser.parseExpression("Name = #newName").getValue(context, tesla);
System.out.println(tesla.getName())  // "Mike Tesla"
~~~

**#this和#root**

\#this始终是定义的，并引用当前的评估对象。#root变量总是被定义并引用根上下文对象。尽管#this可能会随着表达式的组件的计算而变化，但是#root始终引用根。以下示例说明如何使用#this和#root变量：

~~~java
// create an array of integers
List<Integer> primes = new ArrayList<Integer>();
primes.addAll(Arrays.asList(2,3,5,7,11,13,17));

// create parser and set variable 'primes' as the array of integers
ExpressionParser parser = new SpelExpressionParser();
EvaluationContext context = SimpleEvaluationContext.forReadOnlyDataAccess();
context.setVariable("primes", primes);

// all prime numbers > 10 from the list (using selection ?{...})
// evaluates to [11, 13, 17]
List<Integer> primesGreaterThanTen = (List<Integer>) parser.parseExpression(
        "#primes.?[#this>10]").getValue(context);
~~~

## 函数

您可以通过注册可以在表达式字符串中调用的用户定义函数来扩展spel。该函数通过EvaluationContext注册。以下示例显示如何注册用户定义函数：

~~~java
public abstract class StringUtils {

    public static String reverseString(String input) {
        StringBuilder backwards = new StringBuilder(input.length());
        for (int i = 0; i < input.length(); i++)
            backwards.append(input.charAt(input.length() - 1 - i));
        }
        return backwards.toString();
    }
}
~~~

~~~java
ExpressionParser parser = new SpelExpressionParser();

EvaluationContext context = SimpleEvaluationContext.forReadOnlyDataBinding().build();
context.setVariable("reverseString",
        StringUtils.class.getDeclaredMethod("reverseString", String.class));

String helloWorldReversed = parser.parseExpression(
        "#reverseString('hello')").getValue(context, String.class);
~~~

## Bean引用

如果已使用bean resolver配置了评估上下文，则可以使用@符号从表达式中查找bean。以下示例显示了如何执行此操作：

~~~java
ExpressionParser parser = new SpelExpressionParser();
StandardEvaluationContext context = new StandardEvaluationContext();
context.setBeanResolver(new MyBeanResolver());

// This will end up calling resolve(context,"something") on MyBeanResolver during evaluation
Object bean = parser.parseExpression("@something").getValue(context);
~~~

要访问工厂bean本身，您应该在bean名称前面加上&符号。以下示例显示了如何执行此操作：
~~~java
ExpressionParser parser = new SpelExpressionParser();
StandardEvaluationContext context = new StandardEvaluationContext();
context.setBeanResolver(new MyBeanResolver());

// This will end up calling resolve(context,"&foo") on MyBeanResolver during evaluation
Object bean = parser.parseExpression("&foo").getValue(context);
~~~

## If-Then-Else

可以使用三元运算符在表达式中执行if-then-else条件逻辑。下面的列表显示了一个最小的示例：

~~~java
String falseString = parser.parseExpression(
        "false ? 'trueExp' : 'falseExp'").getValue(String.class);
~~~

## Elvis

ELVIS运算符是三元运算符语法的缩写，在groovy语言中使用。对于三元运算符语法，通常必须重复变量两次，如下示例所示：

~~~java
String name = "Elvis Presley";
String displayName = (name != null ? name : "Unknown");
~~~

相反，您可以使用Elvis操作符（以Elvis的发型命名）。下面的示例演示如何使用Elvis运算符：

~~~java
ExpressionParser parser = new SpelExpressionParser();

String name = parser.parseExpression("name?:'Unknown'").getValue(String.class);
System.out.println(name);  // 'Unknown'
~~~

## Safe Navigation 运算符

Safe Navigation操作符用于避免nullpointerException，它来自groovy语言。通常，当您引用一个对象时，您可能需要在访问该对象的方法或属性之前验证它不是空的。为了避免这种情况，Safe Navigation操作符返回空值而不是抛出异常。以下示例说明如何使用Safe Navigation：

~~~java
ExpressionParser parser = new SpelExpressionParser();
EvaluationContext context = SimpleEvaluationContext.forReadOnlyDataBinding().build();

Inventor tesla = new Inventor("Nikola Tesla", "Serbian");
tesla.setPlaceOfBirth(new PlaceOfBirth("Smiljan"));

String city = parser.parseExpression("PlaceOfBirth?.City").getValue(context, tesla, String.class);
System.out.println(city);  // Smiljan

tesla.setPlaceOfBirth(null);
city = parser.parseExpression("PlaceOfBirth?.City").getValue(context, tesla, String.class);
System.out.println(city);  // null - does not throw NullPointerException!!!
~~~

## 集合选择

Selection是一种功能强大的表达式语言功能，通过从源集合的条目中进行选择，可以将源集合转换为另一个集合。
Selection使用的语法为.？[selectionExpression]。它过滤集合并返回包含原始元素子集的新集合。例如，selection可以让我们很容易地获得塞尔维亚发明家的列表，如下示例所示：

~~~java
List<Inventor> list = (List<Inventor>) parser.parseExpression(
        "Members.?[Nationality == 'Serbian']").getValue(societyContext);
~~~

在list和map上都可以Selection。对于list，将根据每个单独的列表元素评估选择条件。针对map，选择标准针对每个映射条目（Java类型Map.Entry）进行评估。每个map项都有其键和值，可以作为属性访问，以便在选择中使用。
以下表达式返回一个新map，该映射由原始map的那些元素组成，其中输入值小于27：

~~~java
Map newMap = parser.parseExpression("map.?[value<27]").getValue();
~~~

除了返回所有选定的元素之外，您还能检索第一个或最后一个值。要获取与所选内容匹配的第一个条目，语法为。.^[selectionExpression]。要获取最后一个匹配的选择，语法为.$[SelectionExpression]。

## 集合投影

Projection允许集合驱动子表达式的计算，结果是一个新集合。投影的语法是.![projectionExpression]。例如，假设我们有一个发明家列表，但是想要他们出生的城市列表。实际上，我们想为发明家列表中的每个条目评估“placeofbirth.city”。下面的示例使用投影进行此操作：

~~~java
// returns ['Smiljan', 'Idvor' ]
List placesOfBirth = (List)parser.parseExpression("Members.![placeOfBirth.city]");
~~~

您还可以使用map来驱动投影，在这种情况下，投影表达式针对map中的每个条目（表示为Java Map.Entry）进行评估。跨map投影的结果是一个列表，其中包含对每个map条目的投影表达式的计算。

## 表达式模板化

表达式模板允许将文本与一个或多个计算块混合。每个评估块都由您可以定义的前缀和后缀字符分隔。常见的选择是使用#{ }作为分隔符，如下示例所示：

~~~java
String randomPhrase = parser.parseExpression(
        "random number is #{T(java.lang.Math).random()}",
        new TemplateParserContext()).getValue(String.class);

// evaluates to "random number is 0.7038186818312008"
~~~

字符串的计算方法是将文本“random number is”与计算#{ }分隔符内表达式的结果（在本例中，是调用该random（）方法的结果）连接起来。parseExpression（）方法的第二个参数的类型为parserContext。ParserContext接口用于影响表达式的解析方式，以支持表达式模板化功能。TemplateParserContext的定义如下：

~~~java
public class TemplateParserContext implements ParserContext {

    public String getExpressionPrefix() {
        return "#{";
    }

    public String getExpressionSuffix() {
        return "}";
    }

    public boolean isTemplate() {
        return true;
    }
}
~~~

本节的例子可以参考[spel](https://github.com/ddean2009/spring5-core-workshop)


更多教程请参考 [flydean的博客](http://www.flydean.com/spring5-spel/)
