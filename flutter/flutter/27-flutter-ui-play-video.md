flutter系列之:在flutter中使用媒体播放器

[toc]

# 简介

现在的app功能越来越强大，除了基本的图文之外，还需要各种各样的其他的功能,比如视频，和直播。

直播可能会比较复杂，因为涉及到了拉流和推流，需要服务器端的支持，但是视频播放就比较简单了，那么如何在flutter中使用媒体播放器呢？

一起来看看吧。

# 使用前的准备工作

flutter本身是不支持媒体播放功能的，为了实现这个功能，我们需要使用额外的第三方插件叫做video_player。

首先我们需要向flutter应用中添加video_player。添加起来也非常简单，只需要执行下面的命令即可：

```
flutter pub add video_player 
```

该命令会向pubspec.xml中添加如下的内容：

```
dependencies:
  flutter:
    sdk: flutter

  video_player: ^2.4.7
```

添加好依赖包之后，我们还需要为应用添加相应的权限，你确保能够使用影音播放的权限。

如果是在android中，需要向AndroidManifest.xml文件中添加类似下面的内容：

```
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <application ...>

    </application>

    <uses-permission android:name="android.permission.INTERNET"/>
</manifest>

```

在IOS中则需要在Info.plist中添加下面的内容：

```
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSAllowsArbitraryLoads</key>
  <true/>
</dict>

```

# 在flutter中使用video_player

video_player中和video播放相关的类叫做VideoPlayerController，在IOS中底层使用的是AVPlayer，在Android中底层使用的是ExoPlayer。

VideoPlayerController有好几种构造方法，我们一起来看看。

```
  VideoPlayerController.asset
```

asset方法表示video是从应用程序的asset中获取的。

```
 VideoPlayerController.network
```

network方法表示video是从网络中获取的。

```
  VideoPlayerController.file
```

file方法表示video是通过'file://${file.path}' 这样的格式来获取的。

还有一个只用在andorid中的方法,表示从contentUri中加载video:

```
  VideoPlayerController.contentUri
```

为了简单起见，这里我们选择网易上面的一个科教视频，作为要播放的video。

那么我们可以通过 VideoPlayerController.network方法来构建这个controller:

```
    videoPlayerController = VideoPlayerController.network(
      'https://flv.bn.netease.com/1c04bfd72901f0661b486465e09cfdc01754c20db0686786f4e20a5f7d271ba0de6c1177a0da1c4c2d7c367e20ee16d4a90ac7ff4ea664820ba1b401f3e53f135f72cdff855e78ca5fb7849fb6ff7ccb9de1613ad3bfc59db83493b5f18a0a27f15048df6585361cd67c3b37551e10981c40dcdfdb77b7e6.mp4',
    );
```

在使用video之前，还需要进行初始操作，初始化是调用它的initialize方法，这个方法的作用是打开给定的数据源，并加载它的元数据。

因为initialize方法是一个耗时的操作，所以这个方法返回类型是Future:

```
  Future<void> initialize() async {
```

我们可以这样使用：

```
late Future<void> playerFuture;
playerFuture = videoPlayerController.initialize();
```

有了播放器的Future，我们可以配合flutter中的FutureBuilder一起使用：

```
body: FutureBuilder(
        future: playerFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.done) {
            return AspectRatio(
              aspectRatio: videoPlayerController.value.aspectRatio,
              child: VideoPlayer(videoPlayerController),
            );
          } else {
            return const Center(
              child: CircularProgressIndicator(),
            );
          }
        },
      ),
```

在FutureBuilder中，我们通过判断connectionState来判断视频是否加载完毕，如果没有加载完毕，则使用CircularProgressIndicator表示正在加载中。

如果加载完毕之后，就直接展示VideoPlayer组件即可。

因为不同的video有不同的纵横比，为了在flutter界面上完美的展示加载的video，我们将VideoPlayer封装在一个AspectRatio组件中。

最后我们还要添加一个控制装置，用来控制video的暂停和播放：

```
floatingActionButton: FloatingActionButton(
        onPressed: () {
          setState(() {
            if (videoPlayerController.value.isPlaying) {
              videoPlayerController.pause();
            } else {
              videoPlayerController.play();
            }
          });
        },
        child: Icon(
          videoPlayerController.value.isPlaying ? Icons.pause : Icons.play_arrow,
        ),
      )
```

这里通过videoPlayerController.value.isPlaying来判断视频是否在播放状态，同时在onPressed方法中调用了setState来调用videoPlayerController.pause或者videoPlayerController.play方法。

# 总结

这样一个可以播放外部视频的app就做好了，运行之后它的界面是这样的：

![](https://img-blog.csdnimg.cn/6acbe06a79374b5db8e1611a3d53141e.png)

大家可以在这个播放器的基础上进行扩张，一个属于你自己的视频APP就完成了。

本文的例子：[https://github.com/ddean2009/learn-flutter.git](https://github.com/ddean2009/learn-flutter.git)








