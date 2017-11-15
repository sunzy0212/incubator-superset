## 汉化说明

汉化包括py文件，html文件，js/jsx文件汉化。他们都是通过修改po字典文件来修改英文到中文的映射。

#### py文件，html文件汉化

py文件，html文件汉化通过把po文件转换成mo文件
其中py文件，html文件使用 ```_```,```__```来表示，如：

```_("sample")```

结果：

```样例```

#### js/jsx文件汉化

js/jsx文件汉化是通过把po文件转换成json文件。使用```t```来表示, 如：

```t("sample")```

结果：

```样例```


#### 字典转换

1. po到mo

安装gettext：

$ brew install gettext
$ brew link gettext --force

命令：

```msgfmt messages.po messages.mo```

2. po到json

安装po2json:

$ npm install po2json

命令：

```po2json -p -f jed1.x messages.po messages.json```


注：为了方便，我们提供了个脚本convert.sh，每次修改字典文件（*.po）后执行```bash convert.sh```
