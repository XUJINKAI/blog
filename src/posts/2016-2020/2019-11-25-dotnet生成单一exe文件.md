---
permalink: /posts/dotnet-publish-single-file
title: dotnet生成单一exe文件
tags: C#
date: 2019-11-25T01:50:43.191Z
---

以下以dotnet core 3.0为准。

- 需要安装dotnet运行时，但编译结果很小

`dotnet publish -c Release -r win-x64 -o publish /p:PublishSingleFile=true --no-self-contained`

- 无需运行时，编译结果会变大

`dotnet publish -c Release -r win-x64 -o publish /p:PublishSingleFile=true /p:PublishTrimmed=true /p:PublishReadyToRun=true`

说明：PublishTrimmed会对用不到的库作精简，PublishReadyToRun会增加native code以加速启动。

由于每个项目的特点不同，这些命令可能会造成运行错误，需要自行测试。

常见的[runtime选项](https://docs.microsoft.com/zh-cn/dotnet/core/rid-catalog#using-rids)：`win-x64`, `win-x86`, `win-arm`, `linux-x64`, `linux-arm`
