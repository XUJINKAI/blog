---
permalink: /posts/csharp-use-process-run-command
title: C# ProcessStartInfo参数及常见启动程序方式
tags: C#
emotag:
date: 2018-06-30 02:45:23 +08:00
last_modified_at: 2024-10-27
---

**2024-10-27 更新说明：**

此文章写于2018年，当时还是dotnet framework 4.7。如今已经是dotnet 8了，我也根据最新版本进行了增补，请放心参考。

另外，给我自己开发的软件 [OneQuick](https://onequick.org/) 打个小广告，可以根据热键执行各种命令，欢迎试用。

## ProcessStartInfo 类参数解析

### UseShellExecute

指执行方式是系统执行(true)还是程序创建进程(false)。

为true时相当于用户双击文件，此时`FileName`不限于可执行文件(.exe)，例如网址，bat文件均可；  
为false时程序使用`CreateProcess`来创建进程，对进程的控制更多，但`FileName`必须是可执行文件(.exe)。

默认值：dotnet core 开始为false，dotnet framework 为true。

#### 取舍：

需要以管理员身份执行命令，或执行的命令不是可执行文件时，此值必须为true。

需要重定向输入输出时（RedirectStandard* = true），此值必须为false。

### WindowStyle

用于设置GUI程序的窗口。（对GUI程序有效）

另外，GUI程序可以主动忽略这个参数。

注：在dotnet core中，此值**好像**对控制台程序也有效。如果要隐藏窗口最好连同此值一起设置。

### CreateNoWindow

是否创建窗口。（对控制台程序，并且 UseShellExecute = false 时有效）

在MacOS/Linux上时，也将忽略此值。

注：此值生效时(true)，控制台窗口不会显示。这种方式下无法通过窗口关闭程序，所以运行的程序最好是可以自己运行完关闭的，不然需要到任务管理器中关闭。

### Verb

文件的右键菜单里，除了“打开”，根据文件的不同还会出现“打印”，“编辑”，“以管理员身份运行”等选项，Verb控制的就是这个选项。

你可以通过`new ProcessStartInfo(FileName).Verbs`查看特定文件支持的Verb。

## 常见启动方式

### Admin身份运行

```csharp
ProcessStartInfo.Verb = "RunAs";
```

### 在Admin进程中，以普通权限运行

```csharp
ProcessStartInfo.FileName = "RunAs";
ProcessStartInfo.Arguments = $"/trustlevel:0x20000 {YOUR_COMMAND}";
```

`YOUR_COMMAND`为你要运行的命令，包含空格时要用引号括住，而命令若包含引号，需要以`\"`代替。

注：此方法运行的权限准确的说是`受限制的管理员`，不是普通的用户权限。

以及由于系统BUG，在win11中这个方法无法使用: [参考链接](https://superuser.com/questions/1749696/parameter-is-incorrect-when-using-runas-with-trustlevel-after-windows-11-22h2)

### 在CMD中运行命令

```csharp
ProcessStartInfo.FileName = "cmd";
ProcessStartInfo.Arguments = $"/c {YOUR_COMMAND}";
```

`YOUR_COMMAND`与上文类似，但命令中的引号要用两个引号代替，`"` --> `""`。

### Explorer 定位到文件

PATH为文件时：

```csharp
ProcessStartInfo.FileName = "explorer";
ProcessStartInfo.Arguments = $"/select, {PATH}";
```

PATH为目录时 `ProcessStartInfo.Arguments = PATH;`即可。


## 示例代码

<del>我写了个类库 : ) [XJKdotNetLibrary](https://github.com/XUJINKAI/XJKdotNetLibrary/blob/master/dotNetFramework/SysX/Cmd.cs)</del>

此库已经不再维护，何况当年写的也挺蛋疼。以下是更简单的一些示例：

```csharp
/// <summary>
/// 执行一个进程。
/// </summary>
internal static Process? StartProcess(string path, string? args = null, string? dir = null
    , bool? runAsAdmin = null, bool? hiddenWindow = null)
{
    // 这里不提供在管理员权限下执行非管理员权限的方法，有需要可自行编写测试
    // 在我自己的程序OneQuick中，因为RunAs的BUG，我使用了计划任务来实现这个功能

    // 经测试：args和dir可以为null
    var psi = new ProcessStartInfo(path, args!)
    {
        UseShellExecute = true, // 为true时CreateNoWindow无效
        CreateNoWindow = false,
        WorkingDirectory = dir!,
    };
    if (hiddenWindow == true)
    {
        psi.WindowStyle = ProcessWindowStyle.Hidden;
    }

    if (runAsAdmin == true)
    {
        psi.Verb = "runas";
    }

    Log.Verbose($"StartProcess: {path}, {args}, {dir}; {runAsAdmin}, {hiddenWindow}");
    var p = Process.Start(psi);
    return p;
}

/// <summary>
/// 使用文件管理器打开指定路径
/// </summary>
internal static void Explorer(string path)
{
    if (File.Exists(path))
    {
        StartProcess("explorer", "/select, " + path);
    }
    else if (Directory.Exists(path))
    {
        StartProcess("explorer", path);
    }
    else
    {
        StartProcess("explorer");
    }
}
```

最后再给我的 [OneQuick](https://onequick.org/) 打个广告，根据热键可以执行各种命令 :)
