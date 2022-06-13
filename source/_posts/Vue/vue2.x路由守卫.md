---
title: vue2.x动态注入路由
date: 2022-06-13 18:12:47
categories:
  - Vue
  - 路由
tags: 实践
---

在处理 RBAC 权限模型时，动态的根据用户信息，控制要展示的路由菜单的功能，显得非常重要和方便，以 vue 2.x 为例实现路由守卫的方案如下

<!-- more -->

## 案例

假设某个用户信息的菜单权限如下：

```json
{
  "data": {
    "username": "admin",
    "router": [
      {
        "name": "系统管理",
        "path": "/systemManage",
        "redirect": "/systemManage/user"
        "children": [
          {
            "name": "用户管理",
            "path": "/systemManage/user"
          }
        ]
      }
    ]
  },
  "code": 200,
  "msg": "success"
}
```

## 可行性分析

因为是 2.x 的版本，将会使用 `addRoutes` 方法来实现。

在实现之前要弄清楚，路由既然是根据接口数据动态渲染的。那么有个事情就必须明白，这个数据必须递归重构一下，把 `vue-router` 的 `component` 字段加上去。为此可以实现一个生成路由参数的方法：

```javascript
import Layout from "@/layout";

const components = {
  "/sysManager": () => import("@/views/components/Layout"),
  "/sysManager/user": () => import("@/views/systemManage/user"),
};

export const generateRoutes = (router) => {
  return router.map((route) => {
    const component = components[route.path];

    if (component) {
      route.component = component;
    } else {
      console.warn(`${route.name}[${route.path}] 缺少对应的组件`);
    }

    route.children && generateRoutes(route.children);

    return route;
  });
};
```

这样通过 `generateRoutes` 方法包装过的接口数据，就可以 `addRoutes` 到实际的路由上了

## 场景分析

### 第一次登录

通过上述方法，在获取登录信息之后，通过 `addRoutes` 注入路由就好。注入之后，就可以跳转到想去的路由页面了。

### 刷新页面

到这一步会有一个明显的问题，页面刷新了怎么办？登录时有一个 `login` -> `getLoginInfo` 的过程。当页面刷新的时候，只需要从 `getLoginInfo` 里获取用户信息就好了。可是注入的逻辑在登录页面里。这时就可以用到 `vue-router` 的路由守卫了，就是 `beforeEach` 钩子方法。

```javascript
router.beforeEach((to, from, next) => {
  // from 从哪个路由页面过来的
  // to 要前往哪个路由页面
  // next 只有执行了这个方法，才可以前往 to
});
```

完整的逻辑如下：

```javascript
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 页面跳转时顶部的进度条
NProgress.configure({ showSpinner: false })

router.beforeEach(async (to, from, next) => {
  NProgress.start()

  if (to.path === '/login') {
    if (from.path === '/login') {
      NProgress.done()
    } else {
      next()
    }
  } else {
    if (from.path === '/login') {
      next()
    } else {
      try {
        const res = await fetch('/getLoginInfo')
        const generated = generateRoutes(res.router)
        router.addRoutes(generated)

        next({ ...to, replace: true })
      } catch (error) {
        next(`/login?redirect=${to.path}`)
      }
    }
  } else {
    next()
  }
})

router.afterEach(NProgress.done)
```

> 注意：至此完整的动态逻辑已经完成了。但是控制台会有一个 `warnings` ，说是重复注入了路由。原因是 `router` 的 `matcher` 有缓存，我们更新一下即可，方法如下：

```javascript
router.options.routes = generateRoutes(res.router);
router.matcher = new Router().matcher;
router.addRoutes(router.options.routes);
```
