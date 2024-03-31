---
slug: /test-in-springboot
---

# 1. Spring Boot中的测试

## 简介

本篇文章我们将会探讨一下怎么在SpringBoot使用测试，Spring Boot有专门的spring-boot-starter-test，通过使用它可以很方便的在Spring Boot进行测试。 

本文将从repository，service, controller,app四个层级来详细描述测试案例。

## 添加maven依赖

~~~xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>test</scope>
</dependency>
~~~

我们添加spring-boot-starter-test和com.h2database总共两个依赖。H2数据库主要是为了测试方便。

## Repository测试

本例中，我们使用JPA，首先创建Entity和Repository：

~~~java
@Entity
@Table(name = "person")
public class Employee {
 
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
 
    @Size(min = 3, max = 20)
    private String name;
 
    // standard getters and setters, constructors
}
~~~

~~~java
@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
 
    public Employee findByName(String name);
 
}
~~~

测试JPA，我们需要使用@DataJpaTest：

~~~java
@RunWith(SpringRunner.class)
@DataJpaTest
public class EmployeeRepositoryIntegrationTest {
 
    @Autowired
    private TestEntityManager entityManager;
 
    @Autowired
    private EmployeeRepository employeeRepository;
 
    // write test cases here
 
}
~~~

@RunWith(SpringRunner.class) 是Junit和Spring Boot test联系的桥梁。 

@DataJpaTest为persistence layer的测试提供了如下标准配置：

* 配置H2作为内存数据库
* 配置Hibernate, Spring Data, 和 DataSource
* 实现@EntityScan
* 开启SQL logging

下面是我们的测试代码：

~~~java
@Test
public void whenFindByName_thenReturnEmployee() {
    // given
    Employee alex = new Employee("alex");
    entityManager.persist(alex);
    entityManager.flush();
 
    // when
    Employee found = employeeRepository.findByName(alex.getName());
 
    // then
    assertThat(found.getName())
      .isEqualTo(alex.getName());
}
~~~

在测试中，我们使用了TestEntityManager。 TestEntityManager提供了一些通用的对Entity操作的方法。上面的例子中我们使用TestEntityManager向Employee插入了一条数据。

## Service测试

在实际的应用程序中，Service通常要使用到Repository。但是在测试中我们可以Mock一个Repository，而不用使用真实的Repository。 

先看一下Service：

~~~java
@Service
public class EmployeeServiceImpl implements EmployeeService {
 
    @Autowired
    private EmployeeRepository employeeRepository;
 
    @Override
    public Employee getEmployeeByName(String name) {
        return employeeRepository.findByName(name);
    }
}
~~~

我们再看一下怎么Mock Repository。 

~~~java
@RunWith(SpringRunner.class)
public class EmployeeServiceImplIntegrationTest {
 
    @TestConfiguration
    static class EmployeeServiceImplTestContextConfiguration {
  
        @Bean
        public EmployeeService employeeService() {
            return new EmployeeServiceImpl();
        }
    }
 
    @Autowired
    private EmployeeService employeeService;
 
    @MockBean
    private EmployeeRepository employeeRepository;
 
    // write test cases here
}
~~~

看下上面的例子，我们首先使用了@TestConfiguration专门用在测试中的配置信息，在@TestConfiguration中，我们实例化了一个EmployeeService Bean，然后在EmployeeServiceImplIntegrationTest自动注入。

我们还是用了@MockBean，用来Mock一个EmployeeRepository。

我们看下Mock的实现：

~~~java
    @Before
    public void setUp() {
        Employee alex = new Employee("alex");

        Mockito.when(employeeRepository.findByName(alex.getName()))
                .thenReturn(alex);
    }

    @Test
    public void whenValidName_thenEmployeeShouldBeFound() {
        String name = "alex";
        Employee found = employeeService.getEmployeeByName(name);

        assertThat(found.getName())
                .isEqualTo(name);
    }
~~~

上面的代码中，我们使用Mockito来Mock要返回的数据，然后在接下来的测试中使用。

## 测试Controller

和测试Service一样，Controller使用到了Service：

~~~java
@RestController
@RequestMapping("/api")
public class EmployeeRestController {
 
    @Autowired
    private EmployeeService employeeService;
 
    @GetMapping("/employees")
    public List<Employee> getAllEmployees() {
        return employeeService.getAllEmployees();
    }
}
~~~

但是在测试的时候，我们并不需要使用真实的Service，我们需要Mock它 。

~~~java
@RunWith(SpringRunner.class)
@WebMvcTest(EmployeeRestController.class)
public class EmployeeControllerIntegrationTest {

    @Autowired
    private MockMvc mvc;

    @MockBean
    private EmployeeService service;

    // write test cases here
~~~

为了测试Controller，我们需要使用到@WebMvcTest，他会为Spring MVC 自动配置所需的组件。

通常情况下@WebMvcTest 会和@MockBean一起使用来提供Mock的具体实现。

@WebMvcTest也提供了自动配置的MockMvc，它为测试MVC Controller提供了更加简单的方式，而不需要启动完整的HTTP server。

~~~java
@Test
public void givenEmployees_whenGetEmployees_thenReturnJsonArray()
  throws Exception {
     
    Employee alex = new Employee("alex");
 
    List<Employee> allEmployees = Arrays.asList(alex);
 
    given(service.getAllEmployees()).willReturn(allEmployees);
 
    mvc.perform(get("/api/employees")
      .contentType(MediaType.APPLICATION_JSON))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$", hasSize(1)))
      .andExpect(jsonPath("$[0].name", is(alex.getName())));
}
~~~

 given(service.getAllEmployees()).willReturn(allEmployees); 这一行代码提供了mock的输出。方面后面的测试使用。

## @SpringBootTest的集成测试

上面我们讲的都是单元测试，这一节我们讲一下集成测试。

~~~java
@RunWith(SpringRunner.class)
@SpringBootTest(
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        classes = TestApplication.class)
@AutoConfigureMockMvc
@TestPropertySource(
        locations = "classpath:application-integrationtest.properties")
public class EmployeeAppIntegrationTest {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private EmployeeRepository repository;
}
~~~

集成测试需要使用@SpringBootTest，在@SpringBootTest中可以配置webEnvironment，同时如果我们需要自定义测试属性文件可以使用@TestPropertySource。 

下面是具体的测试代码：

~~~java
   @After
    public void resetDb() {
        repository.deleteAll();
    }

    @Test
    public void givenEmployees_whenGetEmployees_thenStatus200() throws Exception {
        createTestEmployee("bob");
        createTestEmployee("alex");

        // @formatter:off
        mvc.perform(get("/api/employees").contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(2))))
                .andExpect(jsonPath("$[0].name", is("bob")))
                .andExpect(jsonPath("$[1].name", is("alex")));
        // @formatter:on
    }

    //

    private void createTestEmployee(String name) {
        Employee emp = new Employee(name);
        repository.saveAndFlush(emp);
    }
~~~

本文的例子可以参考[https://github.com/ddean2009/learn-springboot2/tree/master/springboot-test](https://github.com/ddean2009/learn-springboot2/tree/master/springboot-test)



