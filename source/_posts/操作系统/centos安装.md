---
title: CentOS安装
date: 2022-05-12 16:29:03
categories:
  - 操作系统
  - centos
tags: linux
---

文章来源：https://juejin.cn/post/6844903870053761037#heading-20

<!-- more -->

## 引言

最近某云搞活动，买了个服务器作为平时学习和测试用，新机器啥也没有，一些常用软件的安装是免不了的，于是乎想着把安装过程都详细记录下来，一是做个备忘，二是给有需要的同学作个参考。

Linux 上安装软件常见的几种方式：

- 源码编译
- 压缩包解压（一般为 tar.gz）
- 编译好的安装包（RPM、DPKG 等）
- 在线安装（YUM、APT 等）

以上几种方式便捷性依次增加，但通用性依次下降，比如直接下载压缩包进行解压，这种方式一般需要自己做一些额外的配置工作，但只要掌握了方法，各个平台基本都适用，YUM 虽然简单，但是平台受限，网络受限，必要的时候还需要增加一些特定 YUM 源。

几种安装方式最好都能掌握，原则上能用简单的就用简单的：YUM>RPM>tar.gz>源码

本文是介绍 MySQL 在 CentOS 上的安装，主要步骤都是参考了 MySQL 官方文档：[dev.mysql.com/doc/refman/…](https://link.juejin.cn?target=https%3A%2F%2Fdev.mysql.com%2Fdoc%2Frefman%2F5.7%2Fen%2Finstalling.html "https://dev.mysql.com/doc/refman/5.7/en/installing.html")

为了测试不同安装方式，反复折腾了好几次，装了删，删了装，每个步骤都是亲测成功的，每条命令都是亲自执行过的，可以放心使用

咱们闲话少说，书归正传（这闲话就不少了...）

## 一、YUM

#### 0、删除已安装的 MySQL

##### 检查 MariaDB

    shell> rpm -qa|grep mariadb
    mariadb-server-5.5.60-1.el7_5.x86_64
    mariadb-5.5.60-1.el7_5.x86_64
    mariadb-libs-5.5.60-1.el7_5.x86_64
    复制代码

##### 删除 mariadb

如果不存在（上面检查结果返回空）则跳过步骤

    shell> rpm -e --nodeps mariadb-server
    shell> rpm -e --nodeps mariadb
    shell> rpm -e --nodeps mariadb-libs
    复制代码

_其实 yum 方式安装是可以不用删除 mariadb 的，安装 MySQL 会覆盖掉之前已存在的 mariadb_

##### 检查 MySQL

    shell> rpm -qa|grep mysql
    复制代码

##### 删除 MySQL

如果不存在（上面检查结果返回空）则跳过步骤

    shell> rpm -e --nodeps xxx
    复制代码

### 1、添加 MySQL Yum Repository

> 从 CentOS 7 开始，MariaDB 成为 Yum 源中默认的数据库安装包。也就是说在 CentOS 7 及以上的系统中使用 yum 安装 MySQL 默认安装的会是 MariaDB（MySQL 的一个分支）。如果想安装官方 MySQL 版本，需要使用 MySQL 提供的 Yum 源。

##### 下载 MySQL 源

官网地址：[dev.mysql.com/downloads/r…](https://link.juejin.cn?target=https%3A%2F%2Fdev.mysql.com%2Fdownloads%2Frepo%2Fyum%2F "https://dev.mysql.com/downloads/repo/yum/")

查看系统版本：

    shell> cat /etc/redhat-release
    CentOS Linux release 7.6.1810 (Core)
    复制代码

选择对应的版本进行下载，例如 CentOS 7 当前在官网查看最新 Yum 源的下载地址为： [dev.mysql.com/get/mysql80…](https://link.juejin.cn?target=https%3A%2F%2Fdev.mysql.com%2Fget%2Fmysql80-community-release-el7-3.noarch.rpm "https://dev.mysql.com/get/mysql80-community-release-el7-3.noarch.rpm")

    shell> wget https://dev.mysql.com/get/mysql80-community-release-el7-3.noarch.rpm
    复制代码

##### 安装 MySQL 源

    shell> sudo rpm -Uvh platform-and-version-specific-package-name.rpm
    复制代码

例如 CentOS7 当前最新 MySQL 源安装：

    shell> sudo rpm -Uvh mysql80-community-release-el7-3.noarch.rpm
    复制代码

##### 检查是否安装成功

执行成功后会在`/etc/yum.repos.d/`目录下生成两个 repo 文件`mysql-community.repo`及 `mysql-community-source.repo`

并且通过`yum repolist`可以看到 mysql 相关资源

    shell> yum repolist enabled | grep "mysql.*-community.*"
    !mysql-connectors-community/x86_64 MySQL Connectors Community                108
    !mysql-tools-community/x86_64      MySQL Tools Community                      90
    !mysql80-community/x86_64          MySQL 8.0 Community Server                113
    复制代码

### 2、选择 MySQL 版本

使用 MySQL Yum Repository 安装 MySQL，默认会选择当前最新的稳定版本，例如通过上面的 MySQL 源进行安装的话，默安装会选择 MySQL 8.0 版本，如果就是想要安装该版本，可以直接跳过此步骤，如果不是，比如我这里希望安装 MySQL5.7 版本，就需要“切换一下版本”：

##### 查看当前 MySQL Yum Repository 中所有 MySQL 版本（每个版本在不同的子仓库中）

    shell> yum repolist all | grep mysql
    复制代码

##### 切换版本

    shell> sudo yum-config-manager --disable mysql80-community
    shell> sudo yum-config-manager --enable mysql57-community
    复制代码

除了使用 yum-config-manager 之外，还可以直接编辑`/etc/yum.repos.d/mysql-community.repo`文件

enabled=0 禁用

    [mysql80-community]
    name=MySQL 8.0 Community Server
    baseurl=http://repo.mysql.com/yum/mysql-8.0-community/el/7/$basearch/
    enabled=0
    gpgcheck=1
    gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-mysql
    复制代码

enabled=1 启用

    # Enable to use MySQL 5.7
    [mysql57-community]
    name=MySQL 5.7 Community Server
    baseurl=http://repo.mysql.com/yum/mysql-5.7-community/el/7/$basearch/
    enabled=1
    gpgcheck=1
    gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-mysql
    复制代码

##### 检查当前启用的 MySQL 仓库

    shell> yum repolist enabled | grep mysql
    复制代码

_如果同时启用了多个仓库，安装时会选择最新版本_

### 3、安装 MySQL

    shell> sudo yum install mysql-community-server
    复制代码

该命令会安装 MySQL 服务器 (mysql-community-server) 及其所需的依赖、相关组件，包括 mysql-community-client、mysql-community-common、mysql-community-libs 等

如果带宽不够，这个步骤时间会比较长，请耐心等待~

### 4、启动 MySQL

##### 启动

    shell> sudo systemctl start mysqld.service
    复制代码

CentOS 6：

    shell> sudo service mysqld start
    复制代码

##### 查看状态

    shell> sudo systemctl status mysqld.service
    复制代码

CentOS 6：

    shell> sudo service mysqld status
    复制代码

##### 停止

    shell> sudo systemctl stop mysqld.service
    复制代码

CentOS 6：

    shell> sudo service mysqld stop
    复制代码

##### 重启

    shell> sudo systemctl restart mysqld.service
    复制代码

CentOS 6：

    shell> sudo service mysqld restart
    复制代码

### 5、修改密码

##### 初始密码

MySQL 第一次启动后会创建超级管理员账号`root@localhost`，初始密码存储在日志文件中：

    shell> sudo grep 'temporary password' /var/log/mysqld.log
    复制代码

##### 修改默认密码

    shell> mysql -uroot -p
    复制代码

    mysql> ALTER USER 'root'@'localhost' IDENTIFIED BY '123456';
    ERROR 1819 (HY000): Your password does not satisfy the current policy requirements
    复制代码

出现上面的提示是因为密码太简单了，解决方法如下：

1.  使用复杂密码，MySQL 默认的密码策略是要包含数字、字母及特殊字符；
2.  如果只是测试用，不想用那么复杂的密码，可以修改默认策略，即`validate_password_policy`（以及`validate_password_length`等相关参数），使其支持简单密码的设定，具体方法可以自行百度；
3.  修改配置文件`/etc/my.cnf`，添加`validate_password=OFF`，保存并重启 MySQL

    mysql> ALTER USER 'root'@'localhost' IDENTIFIED BY '123456';
    Query OK, 0 rows affected (0.00 sec)
    复制代码

### 6、允许 root 远程访问

    mysql> GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' IDENTIFIED BY '123456' WITH GRANT OPTION;
    mysql> FLUSH PRIVILEGES;
    复制代码

### 7、设置编码为 utf8

##### 查看编码

    mysql> SHOW VARIABLES LIKE 'character%';
    复制代码

##### 设置编码

编辑/etc/my.cnf，\[mysqld\]节点增加以下代码：

    [mysqld]
    character_set_server=utf8
    init-connect='SET NAMES utf8'
    复制代码

### 8、设置开机启动

    shell> systemctl enable mysqld
    shell> systemctl daemon-reload
    复制代码

## 二、RPM

> 除安装过程外，其他步骤和 yum 方式安装相同，不再赘述

### 0、删除已旧版本

略

### 1、下载 MySQL 安装包

下载地址：[dev.mysql.com/downloads/m…](https://link.juejin.cn?target=https%3A%2F%2Fdev.mysql.com%2Fdownloads%2Fmysql%2F "https://dev.mysql.com/downloads/mysql/")

选择对应的版本：

![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/6/18/16b66894c80e9b32~tplv-t2oaga2asx-zoom-in-crop-mark:1304:0:0:0.awebp)

    shell> wget https://dev.mysql.com/get/Downloads/MySQL-5.7/mysql-5.7.26-1.el7.x86_64.rpm-bundle.tar
    复制代码

### 2、安装 MySQL

##### 解压（解打包）

    shell> tar -xvf mysql-5.7.26-1.el7.x86_64.rpm-bundle.tar
    tar -xvf mysql-5.7.26-1.el7.x86_64.rpm-bundle.tar
    mysql-community-embedded-devel-5.7.26-1.el7.x86_64.rpm
    mysql-community-libs-5.7.26-1.el7.x86_64.rpm
    mysql-community-embedded-5.7.26-1.el7.x86_64.rpm
    mysql-community-test-5.7.26-1.el7.x86_64.rpm
    mysql-community-embedded-compat-5.7.26-1.el7.x86_64.rpm
    mysql-community-common-5.7.26-1.el7.x86_64.rpm
    mysql-community-devel-5.7.26-1.el7.x86_64.rpm
    mysql-community-client-5.7.26-1.el7.x86_64.rpm
    mysql-community-server-5.7.26-1.el7.x86_64.rpm
    复制代码

我们主要安装的是这四个（如果有需要也可以一并安装其它的）：

    mysql-community-libs-5.7.26-1.el7.x86_64.rpm
    mysql-community-common-5.7.26-1.el7.x86_64.rpm
    mysql-community-client-5.7.26-1.el7.x86_64.rpm
    mysql-community-server-5.7.26-1.el7.x86_64.rpm
    复制代码

如果不想下载 rpm-bundle，官网也提供单独的 rpm 下载链接

##### 安装

各 rpm 包是有依赖关系的，所以需要按照一定顺序进行安装，安装期间如果提示缺少哪些依赖也要先安装相应的包：

    shell> rpm -ivh mysql-community-common-5.7.26-1.el7.x86_64.rpm
    shell> rpm -ivh mysql-community-libs-5.7.26-1.el7.x86_64.rpm
    shell> rpm -ivh mysql-community-client-5.7.26-1.el7.x86_64.rpm
    shell> rpm -ivh mysql-community-server-5.7.26-1.el7.x86_64.rpm
    复制代码

还有一种简单的方式，可以自动处理各个包之间的依赖关系并自动下载缺少的依赖：

    shell> yum install mysql-community-{server,client,common,libs}-*
    复制代码

_注意：上面的`yum install`命令需要在 tar 解压之后的各个 rpm 包所在目录内执行，否则就变成 yum 方式安装了，需要配置 MySQL 的 yum 源并且速度很慢，还要当前机器支持外网访问_

### 3、设置

略

## 三、tar.gz

### 0、删除旧版本

略

### 1、下载

下载地址：[dev.mysql.com/downloads/m…](https://link.juejin.cn?target=https%3A%2F%2Fdev.mysql.com%2Fdownloads%2Fmysql%2F "https://dev.mysql.com/downloads/mysql/")

选择对应的版本：

![](https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/2019/6/18/16b668a1b3c258aa~tplv-t2oaga2asx-zoom-in-crop-mark:1304:0:0:0.awebp)

    shell> wget https://dev.mysql.com/get/Downloads/MySQL-5.7/mysql-5.7.26-linux-glibc2.12-x86_64.tar.gz
    复制代码

### 2、安装&配置：

##### 依赖

MySQL 依赖 libaio 库，如果没有先安装一下：

    shell> yum install libaio
    复制代码

##### 创建 mysql 用户

不需要登录的一个系统账号，启动 MySQL 服务时会使用该账号

    shell> groupadd mysql
    shell> useradd -r -g mysql -s /bin/false mysql
    复制代码

##### 解压并创建链接

    shell> cd /usr/local
    shell> tar zxvf /path/to/mysql-5.7.26-linux-glibc2.12-x86_64.tar.gz
    shell> ln -s mysql-5.7.26-linux-glibc2.12-x86_64/ mysql
    复制代码

##### 创建 mysql-files 目录

这一步并不是必须的，可以设置 secure_file_priv 的值指向该目录（用于限制数据导入导出操作的目录）

    shell> cd mysql
    shell> mkdir mysql-files
    shell> chown mysql:mysql mysql-files
    shell> chmod 750 mysql-files
    复制代码

##### 初始化

    shell> bin/mysqld --initialize --user=mysql
    复制代码

如果初始化时报错如下：

    error while loading shared libraries: libnuma.so.1: cannot open shared object file: No such file or directory
    复制代码

是因为 libnuma 没有安装（或者默认安装的是 32 位），我们这里需要 64 位的：

    shell> yum install numactl.x86_64
    复制代码

执行完后重新初始化即可 初始化成功后返回结果中有一行包含初始密码，第一次登录时要用到它：

    A temporary password is generated for root@localhost: 8M0ary878s*U
    复制代码

##### 启用 SSL（非必须）

    shell> bin/mysql_ssl_rsa_setup
    复制代码

##### 启动

    shell> bin/mysqld_safe --user=mysql &
    复制代码

查看进程可以看到一些默认参数，可以在配置文件中修改这些参数

    shell> ps -ef | grep mysql
    root     14604 12719  0 00:03 pts/0    00:00:00 /bin/sh bin/mysqld_safe --user=mysql
    mysql    14674 14604  0 00:03 pts/0    00:00:00 /usr/local/mysql/bin/mysqld --basedir=/usr/local/mysql --datadir=/usr/local/mysql/data --plugin-dir=/usr/local/mysql/lib/plugin --user=mysql --log-error=VM_2_24_centos.err --pid-file=VM_2_24_centos.pid
    复制代码

##### 设置环境变量

避免每次执行 mysql 命令都要加上路径，在`/etc/profile`中添加：

    export PATH=$PATH:/usr/local/mysql/bin
    复制代码

##### 设置为服务

    shell> cp support-files/mysql.server /etc/init.d/mysqld
    shell> service mysqld start|stop|restart|status
    复制代码

##### 开机启动

    shell> chkconfig --add mysqld
    shell> chkconfig --list mysqld
    mysqld         	0:关	1:关	2:开	3:开	4:开	5:开	6:关
    复制代码

_其他配置与 yum、rpm 相同，不再赘述_

## 四、源码安装

就别费这个劲了吧...

## 结束语

我们不是 Linux 运维专家，也不是 MySQL 专家，生在这个年代也不知算是幸福还是不幸，线上的环境已经越来越少有人（主要指平时写代码的人）手动去搞这些数据库、中间件的安装配置了，为什么呢？因为各种云产品实在是太方便了呀，一般的公司也不会差这几个钱，既方便又稳定，何乐而不为呢~但是我们自己搞一搞用于自己测试还是必要的，而且还有不少公司的开发环境、测试环境偶尔还是需要手动搞一下的，当然，还有那些个自己搞机房的巨头们。

那我们既然不是专家，上面所写的内容如果有纰漏也是在所难免的，如果被看到了还希望能够及时批评指正~
