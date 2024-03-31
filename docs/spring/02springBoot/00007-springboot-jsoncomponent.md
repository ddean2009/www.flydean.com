---
slug: /springboot-jsoncomponent
---

# 7. Spring Boot中使用@JsonComponent 

@JsonComponent 是Spring boot的核心注解，使用@JsonComponent 之后就不需要手动将Jackson的序列化和反序列化手动加入ObjectMapper了。使用这个注解就够了。

## 序列化

假如我们有个User类，它里面有一个Color属性：

~~~java
@Data
@AllArgsConstructor
public class User {
    private Color favoriteColor;
}
~~~

接下来我们来创建针对User的序列化组件，我们需要实现JsonSerializer接口：

~~~java
@JsonComponent
public class UserJsonSerializer extends JsonSerializer<User> {

    @Override
    public void serialize(User user, JsonGenerator jsonGenerator,
                          SerializerProvider serializerProvider) throws IOException,
            JsonProcessingException {

        jsonGenerator.writeStartObject();
        jsonGenerator.writeStringField(
                "favoriteColor",
                getColorAsWebColor(user.getFavoriteColor()));
        jsonGenerator.writeEndObject();
    }

    private static String getColorAsWebColor(Color color) {
        int r = (int) Math.round(color.getRed() * 255.0);
        int g = (int) Math.round(color.getGreen() * 255.0);
        int b = (int) Math.round(color.getBlue() * 255.0);
        return String.format("#%02x%02x%02x", r, g, b);
    }
}
~~~

在上面的类中，我们自定义了序列化的方法。接下来我们测试一下：

~~~java
@JsonTest
@RunWith(SpringRunner.class)
public class UserJsonSerializerTest {
 
    @Autowired
    private ObjectMapper objectMapper;
 
    @Test
    public void testSerialization() throws JsonProcessingException {
        User user = new User(Color.ALICEBLUE);
        String json = objectMapper.writeValueAsString(user);
  
        assertEquals("{\"favoriteColor\":\"#f0f8ff\"}", json);
    }
}
~~~

## 反序列化

同样的，我们实现JsonDeserializer接口：

~~~java
@JsonComponent
public class UserJsonDeserializer extends JsonDeserializer<User> {

    @Override
    public User deserialize(JsonParser jsonParser,
                            DeserializationContext deserializationContext) throws IOException,
            JsonProcessingException {

        TreeNode treeNode = jsonParser.getCodec().readTree(jsonParser);
        TextNode favoriteColor
                = (TextNode) treeNode.get("favoriteColor");
        return new User(Color.web(favoriteColor.asText()));
    }
}
~~~

我们看下怎么调用：

~~~java
@JsonTest
@RunWith(SpringRunner.class)
public class UserJsonDeserializerTest {
 
    @Autowired
    private ObjectMapper objectMapper;
 
    @Test
    public void testDeserialize() throws IOException {
        String json = "{\"favoriteColor\":\"#f0f8ff\"}"
        User user = objectMapper.readValue(json, User.class);
  
        assertEquals(Color.ALICEBLUE, user.getFavoriteColor());
    }
}
~~~

## 在同一个class中序列化和反序列化

~~~java
@JsonComponent
public class UserCombinedSerializer {
  
    public static class UserJsonSerializer 
      extends JsonSerializer<User> {
 
        @Override
        public void serialize(User user, JsonGenerator jsonGenerator, 
          SerializerProvider serializerProvider) throws IOException, 
          JsonProcessingException {
  
            jsonGenerator.writeStartObject();
            jsonGenerator.writeStringField(
              "favoriteColor", getColorAsWebColor(user.getFavoriteColor()));
            jsonGenerator.writeEndObject();
        }
 
        private static String getColorAsWebColor(Color color) {
            int r = (int) Math.round(color.getRed() * 255.0);
            int g = (int) Math.round(color.getGreen() * 255.0);
            int b = (int) Math.round(color.getBlue() * 255.0);
            return String.format("#%02x%02x%02x", r, g, b);
        }
    }
 
    public static class UserJsonDeserializer 
      extends JsonDeserializer<User> {
  
        @Override
        public User deserialize(JsonParser jsonParser, 
          DeserializationContext deserializationContext)
          throws IOException, JsonProcessingException {
  
            TreeNode treeNode = jsonParser.getCodec().readTree(jsonParser);
            TextNode favoriteColor = (TextNode) treeNode.get(
              "favoriteColor");
            return new User(Color.web(favoriteColor.asText()));
        }
    }
}
~~~

为了方便，我们还可以在同一个类中定义两个内部类来实现序列化和反序列化。如上所示。

本文的例子可以参考[https://github.com/ddean2009/learn-springboot2/tree/master/springboot-jsoncomponent](https://github.com/ddean2009/learn-springboot2/tree/master/springboot-jsoncomponent)

更多教程请参考 [flydean的博客](www.flydean.com)



