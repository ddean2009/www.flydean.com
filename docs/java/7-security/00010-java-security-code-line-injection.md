---
slug: /java-security-code-line-injection
---

# 10. java安全编码指南之:输入注入injection

# 简介

注入问题是安全中一个非常常见的问题，今天我们来探讨一下java中的SQL注入和XML注入的防范。

# SQL注入

什么是SQL注入呢？

SQL注入的意思是，用户输入了某些参数，最终导致SQL的执行偏离了程序设计者的本意，从而导致越权或者其他类型的错误。

也就是说因为用户输入的原因，导致SQL的涵义发送了变化。

拿我们最常用的登录的SQL语句来说，我们可能会写下面的SQL语句：

~~~sql
select * from user where username='<username>' and password='<password>'
~~~

我们需要用户传入username和password。

怎么对这个SQL语句进行注入呢？

很简单，当用户的username输入是下面的情况时：

~~~sql
somebody' or '1'='1
~~~

那么整个SQL语句将会变成：

~~~sql
select * from user where username='somebody' or '1'='1' and password='<password>'
~~~

如果somebody是一个有效的用户，那么or后面的语言完全不会执行，最终导致不校验密码就返回了用户的信息。

同样的，恶意攻击者可以给password输入下面的内容可以得到同样的结果：

~~~sql
' or '1'='1
~~~

整个SQL解析为：

~~~sql
select * from user where username='somebody' and password='' or '1'='1'
~~~

这条语句将会返回所有的用户信息，这样即使不知道确定存在的用户名也可以通过SQL语句的判断。

这就是SQL注入。

# java中的SQL注入

java中最常用的就是通过JDBC来操作数据库，我们使用JDBC创建好连接之后，就可以执行SQL语句了。

下面我们看一个java中使用JDBC SQL注入的例子。

先创建一个通用的JDBC连接：

~~~java
    public Connection getConnection() throws ClassNotFoundException, SQLException {
        Connection con = null;
            Class.forName("com.mysql.jdbc.Driver");
            System.out.println("数据库驱动加载成功");
            con = DriverManager.getConnection("jdbc:mysql://127.0.0.1:3306/mysql?characterEncoding=UTF-8", "root", "");
            System.out.println("数据库连接成功");
          return con;
    }
~~~

然后再自己拼装SQL语句然后调用：

~~~java
public void jdbcWithInjection(String username,char[] password) throws SQLException, ClassNotFoundException {
        Connection connection = getConnection();
        if (connection == null) {
            // Handle error
        }
        try {
            String pwd = encodePassword(password);

            String sqlString = "SELECT * FROM user WHERE username = '"
                    + username +
                    "' AND password = '" + pwd + "'";
            Statement stmt = connection.createStatement();
            ResultSet rs = stmt.executeQuery(sqlString);

            if (!rs.next()) {
                throw new SecurityException(
                        "User name or password incorrect"
                );
            }
        } finally {
            try {
                connection.close();
            } catch (SQLException x) {
            }
        }
    }
~~~

上面的例子中，只有username会发生注入，password不会，因为我们使用了encodePassword方法对password进行了转换：

~~~java
public String encodePassword(char[] password){
        return Base64.getEncoder().encodeToString(new String(password).getBytes());
    }
~~~

# 使用PreparedStatement

为了防止SQL注入，我们一般推荐的是使用PreparedStatement，java.sql.PreparedStatement可对输入参数进行转义，从而防止SQL注入。

> 注意，一定要正确的使用PreparedStatement，如果是不正确的使用，同样会造成SQL注入的结果。

下面看一个不正确使用的例子：

~~~java
String sqlString = "SELECT * FROM user WHERE username = '"
                    + username +
                    "' AND password = '" + pwd + "'";
            PreparedStatement stmt = connection.prepareStatement(sqlString);
            ResultSet rs = stmt.executeQuery();
~~~

上面的代码中，我们还是自己进行了SQL的拼装，虽然最后我们使用了preparedStatement，但是没有达到效果。

正确使用的例子如下：

~~~java
String sqlString =
                    "select * from user where username=? and password=?";
            PreparedStatement stmt = connection.prepareStatement(sqlString);
            stmt.setString(1, username);
            stmt.setString(2, pwd);
            ResultSet rs = stmt.executeQuery();
~~~

我们需要将用户输入作为参数set到PreparedStatement中去，这样才会进行转义。

# XML中的SQL注入

可扩展标记语言（XML）旨在帮助存储，结构化和传输数据。 由于其平台独立性，灵活性和相对简单性，XML已在许多应用程序中得到使用。 但是，由于XML的多功能性，它容易受到包括XML注入在内的各种攻击的攻击。

那么什么是XML注入呢？我们举个例子：

~~~xml
<item>
  <name>Iphone20</name>
  <price>5000.0</price>
  <quantity>1</quantity>
</item>
~~~

上面的例子中，我们使用了XML定义了一个iphone20的价格和数量。一个iphone20 5000块。

上面的XML中，如果quantity是用户输入的数据的话，那么用户可以这样输入：

~~~xml
1</quantity><price>20.0</price><quantity>1
~~~

最后得出的XML文件如下：

~~~xml
<item>
  <name>Iphone20</name>
  <price>5000.0</price>
  <quantity>1</quantity>
  <price>20.0</price><quantity>1</quantity>
</item>
~~~

一般来说，我们在解析XML的过程中，如果发现有重复的tag，那么后面的tag会覆盖前面的tag。

结果就是1个iphone20现在的价格是20块，非常划算。

# XML注入的java代码

我们看下XML的注入在java代码中是怎么实现的：

~~~java
    public String createXMLInjection(String quantity){
        String xmlString = "<item>\n<name>Iphone20</name>\n"
                + "<price>5000.0</price>\n" + "<quantity>" + quantity
                + "</quantity></item>";
        return xmlString;
    }
~~~

可以看到我们直接使用用户输入的quantity作为XML的拼接，这样做很明显是有问题的。

怎么解决呢？有两种方法。

* 第一种方法

第一种方法就是对用户输入的quantity进行校验：

~~~java
    public String createXML(String quantity){
        int count = Integer.parseUnsignedInt(quantity);
        String xmlString = "<item>\n<name>Iphone20</name>\n"
                + "<price>5000.0</price>\n" + "<quantity>" + count
                + "</quantity></item>";
        return xmlString;
    }
~~~

上面代码中，我们对quantity进行了Integer的转换，从而避免了用户的非法输入。

* 第二种方法

第二种方法是使用XML Schema，来对生成的XML进行格式校验。

先看一下我们改怎么定义这个XML Schema：

~~~xml

<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
<xs:element name="item">
  <xs:complexType>
    <xs:sequence>
      <xs:element name="name" type="xs:string"/>
      <xs:element name="price" type="xs:decimal"/>
      <xs:element name="quantity" type="xs:nonNegativeInteger"/>
    </xs:sequence>
  </xs:complexType>
</xs:element>
</xs:schema>
~~~

上面我们定义了一个XML element的序列sequence。如果用户输入了非定义格式的其他XML，就会报错。

我们看下相对应的java代码该怎么写：

~~~java
StreamSource ss = new StreamSource(new File("schema.xsd"));
            Schema schema = sf.newSchema(ss);
            SAXParserFactory spf = SAXParserFactory.newInstance();
            spf.setSchema(schema);
            SAXParser saxParser = spf.newSAXParser();
            XMLReader reader = saxParser.getXMLReader();
            reader.setContentHandler(defHandler);
            reader.parse(xmlStream);
~~~

上面我们列出了XML验证的代码，完整的代码可以参考文末的代码链接，这里就不一一贴出来了。

本文的代码：

[learn-java-base-9-to-20/tree/master/security](https://github.com/ddean2009/learn-java-base-9-to-20/tree/master/security)

> 本文已收录于 [www.flydean.com](www.flydean.com)
>
> 最通俗的解读，最深刻的干货，最简洁的教程，众多你不知道的小技巧等你来发现！
> 
> 欢迎关注我的公众号:「程序那些事」,懂技术，更懂你！
