---
slug: /28-flutter-ui-use-camera
---

# 31. 在flutter中使用相机拍摄照片



# 简介

在app中使用相机肯定是再平常不过的一项事情了，相机肯定涉及到了底层原生代码的调用，那么在flutter中如何快速简单的使用上相机的功能呢？

一起来看看吧。

# 使用相机前的准备工作

flutter中为使用camera提供了一个叫做camera的插件，我们首先需要安装这个插件。

安装插件的步骤很简单,如下所示：

```
flutter pub add camera  
```

该命令会在pubspec.xml中添加下面的内容：

```
dependencies:
  flutter:
    sdk: flutter

  camera: ^0.10.0+1
```

除了camera之外，我们还需要对照相机拍摄的照片进行保存，这样我们还需要用到path_provider和path这两个plugin。

我们使用同样的方式对这两个插件进行安装。

安装好之后，我们就可以在flutter中的代码中愉快的使用camera了。

在使用camera之前，我们还需要获取相应的权限信息，比如在IOS中，我们需要在 ios/Runner/Info.plist中添加下面的权限信息：

```
<key>NSCameraUsageDescription</key>
<string>flutter需要用到你的照相机</string>
```

在andorid中需要配合minSdkVersion>=21来使用。

# 在flutter中使用camera

camera插件为我们提供了一系列的功能来方便camera的使用。

camera的使用需要遵循下面的步骤，因为现在的手机可能会有多个摄像头，所以我们需要通过api获取到可以使用的摄像头列表。

接下来我们使用选中的摄像头，进行一些控制操作，然后需要使用相应的camera视图来展示相应的照相机图像.

最后调用摄像头相关的拍摄功能进行拍摄。

听起来好像挺复杂的，事实上只要遵照上面的顺序，一切都是非常简单的。

首先我们需要获取可用的摄像头列表，这个步骤是通过调用camera包中的availableCameras方法来实现的：

```
Future<List<CameraDescription>> availableCameras() async {
  return CameraPlatform.instance.availableCameras();
}

```

availableCameras是一个异步方法，返回的是一个Future对象，其中的值是CameraDescription列表。

CameraDescription是对camera的描述文件:

```
  const CameraDescription({
    required this.name,
    required this.lensDirection,
    required this.sensorOrientation,
  });
```

name是摄像头的名称，lensDirection是摄像头面对的方向，sensorOrientation是传感器的方向，也就说你的手机是正常放置，还是选择90度放置。

因为availableCameras是一个异步方法，所以我们需要把它包裹在一个异步方法中进行调用：

```
Future<void> main() async {
  // 保证所有的插件都加载完毕
  WidgetsFlutterBinding.ensureInitialized();

  //获取摄像头列表
  final cameras = await availableCameras();

  //拿到第一个摄像头
  final firstCamera = cameras.first;
  ....
```

这里我们拿到了第一个摄像头，注意，这里的firstCamera是一个CameraDescription对象。

因为模拟器上没有摄像头，如果你是在模拟器上运行上面的程序的话，将会抛出下面的异常：

```
[VERBOSE-2:dart_vm_initializer.cc(41)] Unhandled Exception: Bad state: No element
#0      List.first (dart:core-patch/growable_array.dart:343:5)
```

为了对这个camra进行控制， 我们需要创建一个CameraController对象：

```
class CameraAppState extends State<CameraApp> {
  late CameraController _controller;
  late Future<void> _initializeControllerFuture;

  @override
  void initState() {
    super.initState();
    _controller = CameraController(
      widget.camera,
      ResolutionPreset.medium,
    );
    _initializeControllerFuture = _controller.initialize();
  }

```

CameraController的构造函数需要一个CameraDescription对象和分辨率等信息，并且还需要进行初始化，这里我们调用了它的initialize方法。

这里的initialize方法也是一个异步方法。

为了在CameraController初始化之后再对Camera进行使用，我们需要在返回的widget中使用FutureBuilder来构建：

```
body: FutureBuilder<void>(
        future: _initializeControllerFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.done) {
            return CameraPreview(_controller);
          } else {
            return const Center(child: CircularProgressIndicator());
          }
        },
      )
```

具体要展示什么内容呢？这里使用的是camera包中自带的CameraPreview组件。

CameraPreview需要传入一个CameraController对象，也就是之前我们创建的对象。

最后就是调用CameraController的方法进行拍照了。我们把拍照的逻辑放在floatingActionButton中，如下所示：

```
floatingActionButton: FloatingActionButton(
        onPressed: () async {
          try {
            await _initializeControllerFuture;
            final image = await _controller.takePicture();

            if (!mounted) return;

            await Navigator.of(context).push(
              MaterialPageRoute(
                builder: (context) => DisplayPictureScreen(
                  imagePath: image.path,
                ),
              ),
            );
          } catch (e) {
            print(e);
          }
        },
        child: const Icon(Icons.camera_alt),
      )
```

具体的逻辑就是调用controller.takePicture方法进行拍照。将拍好照的image放在一个新的widget中展示。

# 总结

摄像头是app中常用的功能，flutter中的camera插件为我们提供了摄像头的控制功能，非常简单。

本文的例子：[https://github.com/ddean2009/learn-flutter.git](https://github.com/ddean2009/learn-flutter.git)









