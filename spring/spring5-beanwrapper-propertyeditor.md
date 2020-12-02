[toc]


## BeanWrapper

通常来说一个Bean包含一个默认的无参构造函数，和属性的get，set方法。

org.springframework.beans 包里面有个很重要的类叫做BeanWrapper接口和他的实现BeanWrapperImpl，BeanWrapper提供了设置和获取属性值（单个或批量）、获取属性描述符和查询属性的功能，以确定它们是可读的还是可写的。

此外，BeanWrapper还支持嵌套属性，允许将子属性的属性设置为无限深度。BeanWrapper还支持添加标准JavaBeans属性PropertyChangeListeners和VetoableChangeListeners，而不需要在目标类中支持代码。最后，BeanWrapper提供了对设置索引属性的支持。BeanWrapper通常不直接由应用程序代码使用，而是由DataBinder和BeanFactory使用。

BeanWrapper提供了setPropertyValue，setPropertyValues，getPropertyValue和getPropertyValues方法，和一系列的可覆盖的方法来实现对Bean的操作。

下面是使用BeanWrapper的例子，我们先定义两个bean：
~~~java
@Data
public class Company {

    private String name;
    private Employee managingDirector;
}
~~~

~~~java
@Data
public class Employee {

    private String name;

    private float salary;

}
~~~

下面是使用的例子：
~~~java
public class BeanWrapperUsage {

    public static void main(String[] args) {
        BeanWrapper company = new BeanWrapperImpl(new Company());
        // setting the company name..
        company.setPropertyValue("name", "Some Company Inc.");
        // ... can also be done like this:
        PropertyValue value = new PropertyValue("name", "Some Company Inc.");
        company.setPropertyValue(value);

        // ok, let's create the director and tie it to the company:
        BeanWrapper jim = new BeanWrapperImpl(new Employee());
        jim.setPropertyValue("name", "Jim Stravinsky");
        company.setPropertyValue("managingDirector", jim.getWrappedInstance());

        // retrieving the salary of the managingDirector through the company
        Float salary = (Float) company.getPropertyValue("managingDirector.salary");
    }
}
~~~

注意setPropertyValue和getPropertyValue的使用。

其中propertyName属性可以有如下几种形式：

Expression|Explanation
-|-
name|指示属性name相对于的getName() ， isName() 和 setName(..)方法
account.name|指示account内部的name属性，对应getAccount().setName() 和getAccount().getName()方法。
account[2]|指示account的第三个元素，索引属性可以是array, list或者其他的自然排序的集合。
account[COMPANYNAME]|一个map，key是COMPANYNAMEs


## PropertyEditor

Spring使用PropertyEditor的概念来实现Object和String之间的转换。

比如你配置了一个时间对象，但是在配置上，你可能需要传入一个String，然后可以通过PropertyEditor来将其自动转换为时间类型。

在Spring中使用PropertyEditor的情况有如下几种：

* 通过使用PropertyEditor实现来设置bean的属性。当使用String作为在XML文件中声明的某个bean的属性值时，Spring（如果相应属性的setter有类参数）则使用ClassEditor尝试将参数解析为Class对象。

* 在Spring的MVC框架中解析HTTP请求参数是通过使用各种属性编辑器实现来完成的，这些实现可以手动绑定到CommandController的所有子类中。

Spring有内置的方便使用的PropertyEditor实现，他们都在org.springframework.beans.propertyeditors包里面，大多数都是通过BeanWrapperImpl来注册的。下表列出了Spring提供的多种PropertyEditor：

Class|Explanation
-|-
ByteArrayPropertyEditor|字节数组编辑器。将字符串转换为相应的字节表示形式。默认情况下由BeanWrapperImpl注册。
ClassEditor|将表示类的字符串解析为实际类，反之亦然。当找不到类时，将引发IllegalArgumentException。默认情况下，由BeanWrapperImpl注册。
CustomBooleanEditor|布尔属性的可自定义属性编辑器。默认情况下，由BeanWrapperImpl注册，但可以通过将其自定义实例注册为自定义编辑器来重写。
CustomCollectionEditor|集合的属性编辑器，将任何源集合转换为给定的目标集合类型。
CustomDateEditor|java.util.date的可自定义属性编辑器，支持自定义日期格式。默认情况下未注册。必须根据需要使用适当的格式进行用户注册。
CustomNumberEditor|任何数字子类（如integer、long、float或double）的可自定义属性编辑器。默认情况下，由BeanWrapperImpl注册，但可以通过将其自定义实例注册为自定义编辑器来重写。
FileEditor|将String解析成为java.io.File对象。默认由BeanWrapperImpl来注册。
InputStreamEditor|单向属性编辑器，它可以获取一个字符串并（通过中间的ResourceEditor和Resource）生成一个InputStream，以便InputStream属性可以直接设置为字符串。请注意，默认用法不会为您关闭inputstream。默认情况下，由BeanWrapperImpl注册。
LocaleEditor|可以将字符串解析为区域设置对象，反之亦然（字符串格式为[country][variant]，与区域设置的toString（）方法相同）。默认情况下，由BeanWrapperImpl注册。
PatternEditor|可以将字符串解析为java.util.regex.Pattern对象，反之亦然。
PropertiesEditor|可以将字符串（使用java.util.Properties类的javadoc中定义的格式格式化）转换为属性对象。默认情况下，由BeanWrapperImpl注册。
StringTrimmerEditor|修剪字符串的属性编辑器。（可选）允许将空字符串转换为空值。默认情况下未注册-必须是用户注册的。
URLEditor|可以将URL的字符串表示形式解析为实际的URL对象。默认情况下，由BeanWrapperImpl注册。

Spring使用java.beans.PropertyEditorManager为可能需要的属性编辑器设置搜索路径，如果标准JavaBeans基础结构与它们处理的类位于同一个包中，并且与该类具有相同的名称，并且附加了Editor，那么标准JavaBeans基础结构会自动发现PropertyEditor类（无需显式注册）。例如，可以具有以下类和包结构，这足以使SomethingEditor类被识别并用作某个类型化属性的属性编辑器。

如下面的目录结构：
~~~java
com
  flydean
     beans
        ExoticType
        ExoticTypeEditor
~~~

下面是ExoticType和ExoticTypeEditor的定义：
~~~java
@Data
public class ExoticType {

    private String name;

    public ExoticType(String name) {
        this.name = name;
    }
}
~~~

~~~java
public class ExoticTypeEditor extends PropertyEditorSupport {

    public void setAsText(String text) {
        setValue(new ExoticType(text.toUpperCase()));
    }
}
~~~

除了自动注册之外，也可以使用CustomEditorConfigurer将新创建的PropertyEditor注册到ApplicationContext：

~~~xml
    <bean class="org.springframework.beans.factory.config.CustomEditorConfigurer">
        <property name="customEditors">
            <map>
                <entry key="com.flydean.beans.ExoticType" value="com.flydean.beans.ExoticTypeEditor"/>
            </map>
        </property>
    </bean>
~~~

你也可以使用标准的BeanInfo JavaBeans机制。下面的示例使用BeanInfo机制显式地用关联类的属性注册一个或多个PropertyEditor实例：

~~~java
com
  flydean
     beans
        ExoticType
        ExoticTypeBeanInfo
~~~

以下引用的ExoticTypeBeanInfo类的Java源代码将CustomNumberEditor与ExoticType类的age属性关联起来：

~~~java
public class ExoticTypeBeanInfo extends SimpleBeanInfo {

    public PropertyDescriptor[] getPropertyDescriptors() {
        try {
            final PropertyEditor numberPE = new CustomNumberEditor(Integer.class, true);
            PropertyDescriptor ageDescriptor = new PropertyDescriptor("age", ExoticType.class) {
                public PropertyEditor createPropertyEditor(Object bean) {
                    return numberPE;
                };
            };
            return new PropertyDescriptor[] { ageDescriptor };
        }
        catch (IntrospectionException ex) {
            throw new Error(ex.toString());
        }
    }
}
~~~

**PropertyEditorRegistrar**

另一种机制来注册属性编辑器到Spring容器的方法就是使用PropertyEditorRegistrar。

下面是使用的例子：
~~~java
public final class CustomPropertyEditorRegistrar implements PropertyEditorRegistrar {

    public void registerCustomEditors(PropertyEditorRegistry registry) {

        // it is expected that new PropertyEditor instances are created
        registry.registerCustomEditor(ExoticType.class, new ExoticTypeEditor());

        // you could register as many custom property editors as are required here...
    }
}
~~~

下面是使用CustomEditorConfigurer的配置例子：
~~~xml
    <bean class="org.springframework.beans.factory.config.CustomEditorConfigurer">
        <property name="propertyEditorRegistrars">
            <list>
                <ref bean="customPropertyEditorRegistrar"/>
            </list>
        </property>
    </bean>

    <bean id="customPropertyEditorRegistrar"
          class="com.flydean.beans.CustomPropertyEditorRegistrar"/>
~~~

本节的例子可参考[beanWrapper-propertyEditor](https://github.com/ddean2009/spring5-core-workshop)

更多教程请参考 [flydean的博客](http://www.flydean.com/spring5-beanwrapper-propertyeditor/)