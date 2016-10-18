# Dashboard Front

```
├── README.md
├── package.json
├── src
│   ├── components
│   │   ├── Base
│   │   │   ├── Aside.js
│   │   │   ├── Footer.js
│   │   │   ├── Header.js
│   │   │   └── Silder.js
│   │   └── Editor
│   │       ├── Chart.js
│   │       ├── Editor.js
│   │       ├── EditorBase.js
│   │       ├── Favorite.js
│   │       ├── History.js
│   │       ├── Select.js
│   │       └── Table.js
│   ├── containers
│   │   ├── Base.js
│   │   ├── Editor.js
│   │   ├── Search.js           # logservice 数据展示 (正在开发中)
│   │   └── UserLogin.js        # 在存在后端的情况时, 用户登陆界面
│   ├── index.js				# 前端入口
│   ├── stores
│   │   └── base-store.js		# mobx 双向绑定
│   └── utils
│       ├── DecodeData.js		# 即将弃用
│       ├── Provider.js
│       └── Select.js
├── static
│   ├── assets   			# 字体 图片等内容
│   ├── build				# src 编译后的结果
│   ├── codemirror			
│   ├── css					# 一些自定义的 css
│   └── index.html
└── webpack					
    ├── webpack.config.js
    └── webpack.release.config.js
```



