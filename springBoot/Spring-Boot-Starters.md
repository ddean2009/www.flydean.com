Spring Boot Starters介绍

对于任何一个复杂项目来说，依赖关系都是一个非常需要注意和消息的方面，虽然重要，但是我们也不需要花太多的时间在上面，因为依赖毕竟只是框架，我们重点需要关注的还是程序业务本身。

这就是为什么会有Spring Boot starters的原因。Starter POMs 是一系列可以被引用的依赖集合，只需要引用一次就可以获得所有需要使用到的依赖。

Spring Boot有超过30个starts, 本文将介绍比较常用到的几个。

# Web Start

如果我们需要开发MVC程序或者REST服务，那么我们需要使用到Spring MVC，Tomcat,JSON等一系列的依赖。但是使用Spring Boot Start,一个依赖就够了：

~~~xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
~~~

现在我们就可以创建REST Controller了：

~~~java
@RestController
public class GenericEntityController {
    private List<GenericEntity> entityList = new ArrayList<>();

    @RequestMapping("/entity/all")
    public List<GenericEntity> findAll() {
        return entityList;
    }

    @RequestMapping(value = "/entity", method = RequestMethod.POST)
    public GenericEntity addEntity(GenericEntity entity) {
        entityList.add(entity);
        return entity;
    }

    @RequestMapping("/entity/findby/{id}")
    public GenericEntity findById(@PathVariable Long id) {
        return entityList.stream().
                filter(entity -> entity.getId().equals(id)).
                findFirst().get();
    }
}

~~~

这样我们就完成了一个非常简单的Spring Web程序。

# Test Starter

在测试中，我们通常会用到Spring Test, JUnit, Hamcrest, 和 Mockito这些依赖，Spring也有一个starter集合：

~~~xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>
~~~

> 注意，你并不需要指定artifact的版本号，因为这一切都是从spring-boot-starter-parent 的版本号继承过来的。后面升级的话，只需要升级parent的版本即可。具体的应用可以看下本文的例子。

接下来让我们测试一下刚刚创建的controller：

这里我们使用mock。

~~~java
@RunWith(SpringJUnit4ClassRunner.class)
@SpringBootTest(classes = Application.class)
@WebAppConfiguration
public class SpringBootApplicationIntegrationTest {
    @Autowired
    private WebApplicationContext webApplicationContext;
    private MockMvc mockMvc;

    @Before
    public void setupMockMvc() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
    }

    @Test
    public void givenRequestHasBeenMade_whenMeetsAllOfGivenConditions_thenCorrect()
            throws Exception {
        MediaType contentType = new MediaType(MediaType.APPLICATION_JSON.getType(),
                MediaType.APPLICATION_JSON.getSubtype(), Charset.forName("utf8"));
        mockMvc.perform(MockMvcRequestBuilders.get("/entity/all")).
                andExpect(MockMvcResultMatchers.status().isOk()).
                andExpect(MockMvcResultMatchers.content().contentType(contentType)).
                andExpect(jsonPath("$", hasSize(4)));
    }
}
~~~

上面的例子，我们测试了/entity/all接口，并且验证了返回的JSON。

这里@WebAppConfiguration 和 MockMVC 是属于 spring-test 模块, hasSize 是一个Hamcrest 的匹配器,  @Before 是一个 JUnit 注解.所有的一切，都包含在一个starter中。

# Data JPA Starter

如果想使用JPA，我们可以这样：

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

我们接下来创建一个repository：

~~~java
public interface GenericEntityRepository extends JpaRepository<GenericEntity, Long> {}
~~~

然后是JUnit测试：

~~~java
@RunWith(SpringJUnit4ClassRunner.class)
@SpringBootTest(classes = Application.class)
public class SpringBootJPATest {

    @Autowired
    private GenericEntityRepository genericEntityRepository;

    @Test
    public void givenGenericEntityRepository_whenSaveAndRetreiveEntity_thenOK() {
        GenericEntity genericEntity =
                genericEntityRepository.save(new GenericEntity("test"));
        GenericEntity foundedEntity =
                genericEntityRepository.findById(genericEntity.getId()).orElse(null);

        assertNotNull(foundedEntity);
        assertEquals(genericEntity.getValue(), foundedEntity.getValue());
    }
}
~~~

这里我们测试了JPA自带的save, findById方法。 可以看到我们没有做任何的配置，Spring boot自动帮我们完成了所有操作。

# Mail Starter

在企业开发中，发送邮件是一件非常常见的事情，如果直接使用 Java Mail API会比较复杂。如果使用Spring boot:

~~~xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>
~~~

这样我们就可以直接使用JavaMailSender，前提是需要配置mail的连接属性如下：

~~~
spring.mail.host=localhost
spring.mail.port=25
spring.mail.default-encoding=UTF-8
~~~


接下来我们来写一些测试案例。

为了发送邮件，我们需要一个简单的SMTP服务器。在本例中，我们使用Wiser。

~~~xml
<dependency>
    <groupId>org.subethamail</groupId>
    <artifactId>subethasmtp</artifactId>
    <version>3.1.7</version>
    <scope>test</scope>
</dependency>
~~~

下面是如何发送的代码：

~~~java
@RunWith(SpringRunner.class)
@SpringBootTest(classes = Application.class)
public class SpringBootMailTest {
    @Autowired
    private JavaMailSender javaMailSender;

    private Wiser wiser;

    private String userTo = "user2@localhost";
    private String userFrom = "user1@localhost";
    private String subject = "Test subject";
    private String textMail = "Text subject mail";

    @Before
    public void setUp() throws Exception {
        final int TEST_PORT = 25;
        wiser = new Wiser(TEST_PORT);
        wiser.start();
    }

    @After
    public void tearDown() throws Exception {
        wiser.stop();
    }

    @Test
    public void givenMail_whenSendAndReceived_thenCorrect() throws Exception {
        SimpleMailMessage message = composeEmailMessage();
        javaMailSender.send(message);
        List<WiserMessage> messages = wiser.getMessages();

        assertThat(messages, hasSize(1));
        WiserMessage wiserMessage = messages.get(0);
        assertEquals(userFrom, wiserMessage.getEnvelopeSender());
        assertEquals(userTo, wiserMessage.getEnvelopeReceiver());
        assertEquals(subject, getSubject(wiserMessage));
        assertEquals(textMail, getMessage(wiserMessage));
    }

    private String getMessage(WiserMessage wiserMessage)
            throws MessagingException, IOException {
        return wiserMessage.getMimeMessage().getContent().toString().trim();
    }

    private String getSubject(WiserMessage wiserMessage) throws MessagingException {
        return wiserMessage.getMimeMessage().getSubject();
    }

    private SimpleMailMessage composeEmailMessage() {
        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setTo(userTo);
        mailMessage.setReplyTo(userFrom);
        mailMessage.setFrom(userFrom);
        mailMessage.setSubject(subject);
        mailMessage.setText(textMail);
        return mailMessage;
    }
}
~~~

在上面的例子中，@Before 和 @After 分别用来启动和关闭邮件服务器。

# 结论

本文介绍了一些常用的starts，具体例子可以参考 [spring-boot-starts](https://github.com/ddean2009/learn-springboot2/tree/master/spring-boot-starts)

更多教程请参考 [flydean的博客](www.flydean.com)





