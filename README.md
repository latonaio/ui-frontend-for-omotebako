# ui-frontend-for-omotebako  
ui-frontend-for-omotebako は、Latonaが提供するエッジアプリケーション「OMOTE-Bako」のフロントエンドリソースです。  
ui-frontend-for-omotebako のアーキテクチャやソースコードを参照することで、次のことの参考になります。  

・ 主にエッジコンピューティング環境において、どのようにして、効率よくUIフロントエンドリソースを稼働させるか  
・ 主にエッジコンピューティング環境において、どのようにして、効率よくUIフロントエンドリソースを開発するか  
・ 主にエッジコンピューティング環境において、洗練されたマイクロサービスアーキテクチャにUIフロントエンドのリソースがどのように組み込まれているか  
・ 主にエッジコンピューティング環境において、どのようにして、リッチなアプリケーションUIフロントエンド体験を提供するか  
・ 主にエッジコンピューティング環境において、どのようにして、先進的なソフトウェアアーキテクチャを実装するか  

## OMOTE-Bako のエッジコンピューティングアーキテクチャ  
ui-frontend-for-omotebakoは、下記の黄色い枠の部分のリソースです。  

![OMOTE-Bakoアーキテクチャ](Documents/omotebako_architecture_20211104_uifrontend.png)

## UIの一例   
下記の画像は、ui-frontend-for-omotebakoによる実際のUIの一例です。   

![宿泊情報](Documents/stay_info.png)
![客室情報](Documents/room_info.png)


## 動作環境

ui-frontend-for-omotebako は、AION のプラットフォーム上での動作を前提としています。
使用する際は、事前に下記の通りAIONの動作環境を用意してください。

* OS: Linux OS  

* CPU: ARM/AMD/Intel  

* Kubernetes  

* AION のリソース

* Reactフレームワーク、Next.js  
 

## Getting Started　　
1.下記コマンドでDockerイメージを作成します。  　　
```
make docker-build
```
2.aion-service-definitions/services.yml に設定を記載し、AionCore経由でKubernetesコンテナを起動します。    
services.ymlへの記載例：     
```
  ui-frontend-for-omotebako:
    scale: 1
    startup: yes
    always: yes
    network: NodePort
    ports:
      - name: ui-frontend
        protocol: TCP
        port: 3000
        nodePort: 30040
    env:
      REACT_APP_PUBLIC_URL: 'http://localhost:3000/'
      REACT_APP_APIURL: 'http://localhost:30080/api/'
      REACT_APP_WEB_SOCKET_URL: 'ws://localhost:30099/'
      PORT: '3000'
      REACT_APP_IMAGE_PATH: 'http://localhost:30080/'
      REACT_APP_GRPCURL: 'http://localhost:30050'
```