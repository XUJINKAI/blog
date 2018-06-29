---
permalink: /posts/csharp-use-process-run-command
title: 'C# ProcessStartInfo参数及常见启动程序方式'
tags: 'C#'
date: '2018-06-30 02:45:23 +08:00'
comment: true
layout: post
---
# ProcessStartInfo 类参数解析

## WindowStyle

用于设置GUI程序的窗口。对控制台程序无效。

另外，GUI程序可以主动忽略这个参数。

## UseShellExecute

指执行方式是系统执行(true)还是程序创建进程(false)。

为true时相当于用户双击文件，此时`FileName`不限于可执行文件(.exe)，例如网址，bat文件均可；  
为false时程序使用`CreateProcess`来创建进程，对进程的控制更多，但`FileName`必须是可执行文件(.exe)。

#### 取舍：

需要以管理员身份执行命令，或执行的命令不是可执行文件时，此值必须为true。

需要重定向输入输出时（RedirectStandard* = true），此值必须为false。

## CreateNoWindow

对控制台窗口有效，与UseShellExecute结合使用。

UseShellExecute = true 时此值无效，为正常方式启动。

UseShellExecute = false；CreateNoWindow = true 时，控制台窗口不会显示。这种方式下无法通过窗口关闭程序，所以运行的程序最好是可以自己运行完关闭的，不然需要到任务管理器中关闭。

## Verb

文件的右键菜单里，除了“打开”，根据文件的不同还会出现“打印”，“编辑”，“以管理员身份运行”等选项，Verb控制的就是这个选项。

你可以通过`new ProcessStartInfo(FileName).Verbs`查看特定文件支持的Verb。

# 常见启动方式

## Admin身份运行

```C#
ProcessStartInfo.Verb = "RunAs";
```

## 在Admin进程中，以普通权限运行

```C#
ProcessStartInfo.FileName = "RunAs";
ProcessStartInfo.Arguments = $"/trustlevel:0x20000 {YOUR_COMMAND}";
```

`YOUR_COMMAND`为你要运行的命令，包含空格时要用引号括住，而命令若包含引号，需要以`\"`代替。

## 在CMD中运行命令

```C#
ProcessStartInfo.FileName = "cmd";
ProcessStartInfo.Arguments = $"/c {YOUR_COMMAND}";
```

`YOUR_COMMAND`与上文类似，但命令中的引号要用两个引号代替，`"` --> `""`。

## Explorer 定位到文件

PATH为文件时：

```C#
ProcessStartInfo.FileName = "explorer";
ProcessStartInfo.Arguments = $"/select, {PATH}";
```

PATH为目录时 `ProcessStartInfo.Arguments = PATH;`即可。

# 支持链式调用的库

我写了个类库 : ) [XJKdotNetLibrary](https://github.com/XUJINKAI/XJKdotNetLibrary/blob/master/dotNetFramework/SysX/Cmd.cs)

对常见的调用方式做了包装，Demo如下：

```C#
ProcessInfoChain.New(Command, Args)
                .SetWindow(WindowType.Maximized)
                .LaunchBy(LaunchType.CmdStart)
                .RunAs(Privilege.Admin)
                .Excute()
                .Catch(ex=>{throw ex;})
                .Finally(result=>{ // });
```

此外还有一个更简单的包装：

```C#
Cmd.Explorer("C:\\");
Cmd.RunSmart("http://xujinkai.net");
Cmd.RunAsAdmin("cmd", "");
//...
```

欢迎参考~
