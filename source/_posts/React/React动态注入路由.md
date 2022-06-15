---
title: React动态注入路由
date: 2022-06-14 10:12:47
categories:
  - React
  - 路由
tags: 实践
---

在处理 RBAC 权限模型时，动态的根据用户信息，控制要展示的路由菜单的功能，显得非常重要和方便。以下基于 `react-router-dom@6.3.0` 介绍在 `react` 中如何注入路由

<!-- more -->

## 前沿

### 注入方法

可以使用 `react-router-dom` 的 `useRoutes` 钩子来处理这种需求。并且这个钩子是可以支持像这样的路由结构的：

```json
[
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "/courses",
        element: <Courses />,
        children: [
          {
            path: "/courses/:id",
            element: <Course />,
          },
          {
            index: true,
            element: <CoursesIndex />,
          },
        ],
      },
      {
        path: "*",
        element: <NoMatch />,
      },
    ],
  },
];

```

> 这个结构特殊，特别是对 `index` 的处理，比如 `"path": "/"` 那一级的 `children` 里第一个成员的 `index: true`，它的作用是告诉 '/' 路由，访问 `<Layout>` 组件时，还同时会访问 `<Home />` 组件。

把这个结构传给 `useRoutes` ，再把这个 `hook` 的结果放到 `render` 中去即可注册路由

```javascript
import * as React from "react";
import type { RouteObject } from "react-router-dom";
import { useRoutes } from "react-router-dom";

export default function App() {
  let routes: RouteObject[] = [];
  let element = useRoutes(routes);

  return <div>{element}</div>;
}
```

### 子路由的渲染

参考 https://reactrouter.com/docs/en/v6/components/outlet 即可知道，在 `react-router-dom` 里，有像 `vue` 里的 `router-view` 那样便捷的组件，就是 `<Outlet />`

## 实践

### 封装 `useRoutes` 需要的数据结构

把上例数据中的组件先剥离出来，真实的后端数据可以定义成这样：

```json
[
  {
    "path": "/",
    "children": [
      {
        "index": true
      },
      {
        "path": "/courses",
        "children": [
          {
            "index": true
          },
          {
            "path": "/courses/:id"
          }
        ]
      },
      {
        "path": "*"
      }
    ]
  }
]
```

那么可以预设这样的一组组件结构来处理

```javascript
export const components = {
  "/": {
    component: <Layout />,
    index: <Home />,
  },
  "/courses": {
    component: <Courses />,
    index: <CoursesIndex />,
  },
  "/courses/:id": {
    component: <Course />,
  },
  "*": {
    component: <NoMatch />,
  },
};
```

通过递归，可以得到 `useRoutes` 需要的结构：

```javascript
export const generateRoutes = (router) => {
  return router.map((route) => {
    const component = components[route.path];

    if (route.path) {
      if (component) {
        route.element = component.component;

        if (component.index) {
          if (route.children) {
            route.children.push({ index: true, element: component.index });
          } else {
            route.children = [{ index: true, element: component.index }];
          }
        }
      } else {
        console.warn(`[${route.path}] 缺少对应的组件`);
      }
    }

    if (route.children && route.children.length) {
      generateRoutes(route.children);
    }

    return route;
  });
};
```

这样即可动态注入成功，但是有一个问题，就是在 `route.path` 为 `false` ，还是会返回 `route`，会导致存在 `index: true` 的路由配置里，找不到 `element` 组件配置。完整的封装如下：

```javascript
export const generateRoutes = (router) => {
  const result = router.map((route) => {
    const component = components[route.path];

    if (route.path) {
      if (component) {
        route.element = component.component;

        if (component.index) {
          if (route.children) {
            route.children.push({ index: true, element: component.index });
          } else {
            route.children = [{ index: true, element: component.index }];
          }
        }
      } else {
        console.warn(`[${route.path}] 缺少对应的组件`);
      }
    }

    if (route.children && route.children.length) {
      generateRoutes(route.children);
    }

    return route;
  });

  // 过滤没有 `element` 配置的路由
  const filterInvalidRouter = (router) => {
    return router.filter((item) => {
      if (item.children) item.children = filterInvalidRouter(item.children);

      if (item.element) {
        return true;
      } else {
        return false;
      }
    });
  };

  return filterInvalidRouter(result);
};
```

### 落地

有了以上的理论基础方案，配合 `react` 的代码分割，在路由的入口处把这种逻辑处理好。同时这个方案在处理页面刷新的问题时，也是比较好处理的。
登录 -> 获取用户信息等逻辑，统一在根组件处理即可。

文章参考仓库：https://github.com/coder-lcn/react-dynamic-router
