---
permalink: /posts/openvpn-and-http-proxy-solution
title: 利用OpenVPN + HTTP代理访问公司内网
tags: 方案教程
emotag: 
date: 2020-02-24T15:23:57.806Z
last_modified_at: 2020-03-01
---
> 领导发话，公司内部资料不能出外网，端口映射都不行，OpenVPN+代理可以接受，于是我就开始折腾了

服务器：CentOS 8 不带桌面

网上教程多如牛毛，以下简单记录下思路和常用到的命令。

## 安装

整体思路是连进OpenVPN的网段，再用squid弄一个http代理跳到其他服务器。  
需要注意的是firewalld防火墙和squid的代理规则。

- 把内网vpn服务器的一个端口映射到外网

- 安装OpenVPN和squid

```bash
sudo yum update -y
sudo yum install epel-release -y
sudo yum update -y
sudo yum install -y openvpn wget
sudo yum -y install squid
```

- 安装easyrsa

这里我用的这个 <https://github.com/OpenVPN/easy-rsa>，有的教程是老版本的

怎么安装easyrsa就没有命令了，我直接sftp拷进去了...

总之，连带着openvpn的文件夹，最后的目录结构是这样的：

```txt
 - etc
    - openvpn
        - client
        - server
        - easyrsa
```

- 客户端

Windows的客户端推荐社区版，简单易用 <https://openvpn.net/community-downloads/>

## 配置

- 生成证书和其他文件

参考easyrsa的[教程](https://github.com/OpenVPN/easy-rsa/blob/master/README.quickstart.md)，先生成ca，再签一个server证书和一个client证书。

```bash
./easyrsa init-pki
./easyrsa build-ca                              # 得到ca.crt和ca.key

SERVER=server
echo | ./easyrsa gen-req $SERVER nopass
echo yes | ./easyrsa sign-req server $SERVER    # 得到server.crt和server.key

CLIENT=client
echo | ./easyrsa gen-req $CLIENT nopass
echo yes | ./easyrsa sign-req client $CLIENT    # 得到client.crt和client.key
```

另外，你还得生成dh文件和ta.key文件。

```bash
./easyrsa gen-dh                    # 得到dh.pem
openvpn --genkey --secret ta.key    # 得到ta.key
```

ca.key是要保管好的，这个丢了整个vpn就毫无安全可言了。

服务端和客户端都要有的文件：ca.crt, ta.key  
服务端还需要的：server.crt, server.key, dh.pem, server.conf  
客户端还需要的：client.crt, client.key, client.ovpn  

把服务端需要的文件拷到/etc/openvpn/server文件夹中即可。

- 编辑配置文件

配置文件的样板可以从`/usr/share/doc/packages/openvpn`里拷，具体的配置就不说了，没几行也挺简单。

## 启动OpenVPN

```bash
systemctl enable openvpn-server@server.service
systemctl start openvpn-server@server.service
systemctl status openvpn-server@server.service
```

最后一行命令来查看openvpn服务是否启动成功

遗憾的是，启动以后九成还是连不上，你得继续往后看。

## 防火墙

保存以下这个脚本，比如名字是 firewalledit.sh

假设你openvpn用的端口是9527，协议是udp，那么执行

```bash
./firewalledit.sh add 9527/udp
```

将对应端口放行。

```bash
#!/bin/bash

if [ $1 = "add" ]; then
    firewall-cmd --add-port=$2
fi

if [ $1 = "rm" ]; then
    firewall-cmd --remove-port=$2
fi

echo Restarting...

firewall-cmd --runtime-to-permanent
firewall-cmd --reload

systemctl restart firewalld
systemctl status firewalld

firewall-cmd --list-all
```

如果你网关的端口映射和防火墙也都配置正确，那么客户端应该就能连上服务器了。

不过这个时候你没法访问内网的其他服务器，因为vpn给你分配的网段和内网网段不同，而且也是为了安全起见，这时候还需要http代理。

## Http代理

编辑squid配置`vi /etc/squid/squid.conf`

squid配置文件就不说了，把你需要的规则添加进去就行。

然后启动squid代理程序。

```bash
systemctl enable squid
systemctl start squid
systemctl status squid
```

还要记得设置防火墙把squid的监听端口放行（假设监听12345端口）

```bash
./firewalledit.sh add 12345/tcp
```

然后，在你的电脑上设置http代理，地址是vpn的内网地址，默认为10.8.0.1，端口是squid的端口（12345）。

利用这个http代理，就可以访问内网其他机器的服务了。

## Socks5代理

http代理能力还是弱了些，于是我又弄了个ssserver，本地起一个ss（主要是为了他的socks5代理），然后又用proxifier实现了全局无缝切换。

这里就不多说了，为了这一点体验的提升请自行折腾。

## 吊销证书

吊销证书需要生成一个crl.pem吊销列表，然后配置openvpn客户端读取这个文件。

```bash
#!/bin/bash

if [ -z "$1" ]
then
    echo "ERROR: input revoke NAME."
    exit 1
fi

cd /etc/openvpn/easyrsa

echo yes | ./easyrsa revoke $1
./easyrsa gen-crl

cp ./pki/crl.pem ../server/crl.pem

systemctl restart openvpn-server@server.service
```

将这个脚本保存为revoke.sh，假设你要吊销xujinkai的证书，那么执行以下命令：

```bash
./revoke.sh xujinkai
```

crl.pem会拷入/etc/openvpn/server文件夹，记得编辑server.conf添加一行`crl-verify crl.pem`，最后重启openvpn即可。
