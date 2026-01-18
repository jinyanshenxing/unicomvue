# 余量面板

支持查询联通卡速率和QCI

以及支持查询隐藏包。

如果你不了解如何打包vite项目，请[点此下载]( )解压文件部署到服务器根目录即可

或者使用`Docker`部署

```bash
docker run -d --rm -p 8080:80 netart/network-panel:latest
```

或者使用腾讯云提供的一键部署

[![Use EdgeOne Pages to deploy](https://cdnstatic.tencentcs.com/edgeone/pages/deploy.svg)](https://edgeone.ai/pages/new?repository-url=)

[Demo](https://network.nbcnm.cn/)

特性：

1.支持ecs_token登陆

2.更友好的界面

3.支持夜间模式主题切换

# 使用到的接口

```
登录 
https://m.client.10010.com/mobileService/radomLogin.htm

已订业务
https://m.client.10010.com/servicebusiness/newOrdered/queryOrderRelationship

5G 信息（余量/用量）https://m.client.10010.com/servicequerybusiness/operationservice/queryOcsPackageFlowLeftContentRevisedInJune"

速率查询
https://m.client.10010.com/servicebusiness/query/fiveg/getbasicdata"
