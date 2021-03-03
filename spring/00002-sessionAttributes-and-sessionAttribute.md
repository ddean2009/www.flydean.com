@SessionAttributes 和 @SessionAttribute的区别

Spring MVC中有两个长得非常像的注解：@SessionAttributes 和 @SessionAttribute。

我们先看下@SessionAttributes的定义：

@SessionAttributes用于在请求之间的HTTP Servlet会话中存储model属性。 它是类型级别的注解，用于声明特定控制器使用的会话属性。 这通常列出应透明地存储在会话中以供后续访问请求的模型属性的名称或模型属性的类型。

举个例子：

~~~java
@SessionAttributes("user")
public class LoginController {

	@ModelAttribute("user")
	public User setUpUserForm() {
		return new User();
	}
}
~~~

我们可以看到@SessionAttributes是类注解，他用来在session中存储model。 如上面的例子，我们定义了一个名为“User”的model并把它存储在Session中。


我们再看一下@SessionAttribute的定义：

如果你需要访问全局存在（例如，在控制器外部（例如，通过过滤器）管理）并且可能存在或可能不存在的预先存在的会话属性，则可以在方法参数上使用@SessionAttribute注释，例如 以下示例显示：

~~~java
@Controller
@RequestMapping("/user")
public class UserController {

   /*
    * Get user from session attribute
    */
   @GetMapping("/info")
   public String userInfo(@SessionAttribute("user") User user) {

      System.out.println("Email: " + user.getEmail());
      System.out.println("First Name: " + user.getFname());

      return "user";
   }
}
~~~

@SessionAttribute只是获取存储在session中的属性。如果要设置（添加删除）session的属性，则要考虑将org.springframework.web.context.request.WebRequest或javax.servlet.http.HttpSession注入到控制器方法中。

@SessionAttributes中绑定的model可以通过如下几个途径获取：

* 在视图中通过request.getAttribute或session.getAttribute获取

* 在后面请求返回的视图中通过session.getAttribute或者从model中获取

* 自动将参数设置到后面请求所对应处理器的Model类型参数或者有@ModelAttribute注释的参数里面。

@SessionAttributes用户后可以调用SessionStatus.setComplete来清除，这个方法只是清除SessionAttribute里的参数，而不会应用Session中的参数。

~~~java
@Controller
@SessionAttributes("pet") 
public class EditPetForm {

    // ...

    @PostMapping("/pets/{id}")
    public String handle(Pet pet, BindingResult errors, SessionStatus status) {
        if (errors.hasErrors) {
            // ...
        }
            status.setComplete(); 
            // ...
        }
    }
}
~~~

总结一下： 

@SessionAttributes 是将model设置到session中去。

@SessionAttribute 是从session获取之前设置到session中的数据。







