# 混合盘规则编写模板

## 前置要求

- Node.js 环境 (建议使用 v18 或更高版本)

## 快速开始

1. 克隆本仓库到本地：

```bash
git clone https://github.com/hunhepan/hunhepan-rule-template.git
cd hunhepan-rule-template
```

2. 安装依赖：

```bash
npm install
```

## 编写自己的规则

1. 首先建议清空 `src` 目录下的示例规则文件：

```bash
rm src/*.js
```

2. 参考示例创建新的规则文件：

- 在 `src` 目录下创建 `.js` 文件
- 每个规则文件需要包含以下基本结构：

事件最少需要：
- onInfo
- onList 或 onSearch 一个或两个

```javascript
hun.events.onSearch = async (ctx) => {};
hun.events.onInfo = async (ctx) => {};
hun.events.onTab = async (ctx) => {};
hun.events.onList = async (ctx) => {};
```

## 规则文件说明

规则文件需要实现以下事件处理器：

- `onSearch`: 搜索事件处理器，用于处理搜索请求

  - 参数 `ctx.query`: 搜索关键词
  - 参数 `ctx.page`: 页码
  - 返回 `ctx.res`: ItemData[] 类型的搜索结果

- `onList`: 列表事件处理器，用于获取资源列表

  - 返回 `ctx.res`: ItemData[] 类型的列表数据

- `onInfo`: 信息事件处理器，用于获取规则信息

  - 返回 `ctx.res`: RuleInfo 类型的规则信息

- `onTab`: 标签事件处理器，用于获取分类标签
  - 返回 `ctx.res`: TabData[] 类型的标签数据

## 示例

以下是一个简单的规则文件示例：

```javascript
// 搜索处理
hun.events.onSearch = async (ctx) => {
  ctx.res = [
    {
      title: '测试文件1',
      url: 'https://example.com/file1',
      info: '文件描述信息',
      image: 'https://example.com/thumb1.jpg',
      tags: ['标签1', '标签2'],
      payloads: {
        xx: 'yy', // 注意，这里的payloads将会注入到onInfo事件的ctx.payloads中，你可以在onInfo事件中使用
      },
    },
  ];
};

// 列表处理
hun.events.onList = async (ctx) => {
  ctx.res = [
    {
      //参考上面的`hun.events.onSearch`事件处理器
    },
  ];
};

// 规则信息：获取资源的详细信息
hun.events.onInfo = async (ctx) => {
  ctx.res = [
    // 返回数组
    {
      title: '',
      url: '',
    },
  ];
};

// 分类标签：onList下面的分类标签，可选
hun.events.onTab = async (ctx) => {
  ctx.res = [
    {
      label: '分类1',
      value: 'category1',
      payloads: {
        xx: 'yy', // 注意，这里的payloads将会注入到onList事件的ctx.payloads中，你可以在onList事件中使用
      },
    },
  ];
};
```

---

每个规则还需要配套的 mainifest.json 文件（和.js 文件名同名）

```json
{
  "name": "规则名称",
  "url": "网站地址",
  "version": "v0.0.1",
  "weight": 1,
  "search_filters": [
    {
      "field": "type",
      "default": "all",
      "label": "分类",
      "type": "select",
      "options": [
        {
          "value": "all",
          "label": "全部"
        },
        {
          "value": "video",
          "label": "视频"
        }
      ]
    }
  ],
  "list_filters": [],
  "settings": [
    {
      "field": "base_url",
      "default": "https://example.com",
      "label": "网站地址",
      "type": "text"
    }
  ],
  "group": "分组名称"
}
```

manifest.json 配置说明：

- `name`: 规则名称
- `url`: 网站基础地址
- `version`: 版本号
- `weight`: 权重(排序用)
- `search_filters`: 搜索过滤器配置
  - `field`: 过滤字段名
  - `default`: 默认值
  - `helper_text`: 帮助文本，展示在过滤器下方，可使用[url=链接]链接[/url]格式添加链接
  - `label`: 显示标签
  - `type`: 控件类型(select/text/textarea)
  - `options`: select 类型的选项列表
- `list_filters`: 列表过滤器配置(格式同 search_filters)
- `settings`: 设置项配置(格式同 filters)
- `group`: 规则分组

这些配置可以在事件处理器中通过 `ctx.settings` 和 `ctx.filters` 获取。

## 模板使用

0. 克隆本仓库到本地，然后安装依赖，参考上面的步骤
1. 在 src 目录下创建.js 文件
2. 创建 js 文件后，运行命令 `npm run build` 生成同名的 manifest.json 文件
3. 编写测试过程中，可以使用`npm run build -w`命令，实时编译，然后在混合盘软件里面导入dist/目录下的.js可以实时进行测试。

## 注意事项

- 所有事件处理器都必须是异步函数（async）
- 确保返回的数据结构符合类型定义
- 图片链接(image)必须是有效的 URL
- 建议在开发时先用小数据测试
- 注意处理异常情况和错误
- **规则编写完毕后，若要上传到 github，先运行打包命令(npm run build)，然后务必要上传 dist 目录，这样用户可以通过 git 方式下载你编写的规则**

## 贡献

欢迎提交 Pull Request 来完善此模板。

## 许可证

MIT
