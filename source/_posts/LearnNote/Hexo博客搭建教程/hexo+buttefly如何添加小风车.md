---
title: hexo+buttefly如何添加小风车
date: 2025-07-07 19:25:18
author: 长白崎
categories:
  - "Hexo"
tags:
  - "Hexo"
---

# hexo+buttefly如何添加小风车

---

## 1 效果展示

![image-20250707192406050](./hexo+buttefly如何添加小风车/images/image-20250707192406050.png)



## 2 如何添加

### 2.1 新建CSS

在对应主题下的`/source/css`下创建对应CSS主题文件，这里我因为用的是buttefly主题，所以路径是`themes/butterfly/source/css`

新建CSS文件之后再在文件里面添加对应代码,这里我创建的文件名称是`pinwheel.css`:

```css
/* 文章页H1-H6图标样式效果 */
h1::before, h2::before, h3::before, h4::before, h5::before, h6::before {
    -webkit-animation: ccc 1.6s linear infinite ;
    animation: ccc 1.6s linear infinite ;
}
@-webkit-keyframes ccc {
    0% {
        -webkit-transform: rotate(0deg);
        transform: rotate(0deg)
    }
    to {
        -webkit-transform: rotate(-1turn);
        transform: rotate(-1turn)
    }
}
@keyframes ccc {
    0% {
        -webkit-transform: rotate(0deg);
        transform: rotate(0deg)
    }
    to {
        -webkit-transform: rotate(-1turn);
        transform: rotate(-1turn)
    }
}
```

### 2.2 引入自定义css

在对应主题_config.yml文件进行配置，这里我用的butterfly主题，所以是`themes/butterfly/_config.yml`

```yaml
inject:
  head:
    - <link rel="stylesheet" href="/css/pinwheel.css"> 
```



然后继续`themes/butterfly/_config.yml`修改以下配置文件：

```yaml
beautify:
  enable: true
  # Specify the field to beautify (site or post)
  field: post
  # Specify the icon to be used as a prefix for the title, such as '\f0c1'
  title_prefix_icon: '\f863'
  # Specify the color of the title prefix icon, such as '#F47466'
  title_prefix_icon_color: "#F47466"
```

图标使用的[Find Icons with the Perfect Look & Feel | Font Awesome](https://fontawesome.com/icons)上的图标，引用的是 Unicode 形式。可自行查找合适的。



### 2.3 如何控制转动速度

如果想调整转动的速度，可以修改css样式，其中数字（1.6s）数字越小转动越快：

```css
h1::before, h2::before, h3::before, h4::before, h5::before, h6::before {
    -webkit-animation: ccc 1.6s linear infinite ;
    animation: ccc 1.6s linear infinite ;
}
```



### 2.4 如何控制转动方向

只需要修改CSS代码即可`-1turn`为逆时针转动，`1turn`为顺时针转动，记得相同数字部分全改完：

```css
@-webkit-keyframes ccc {
    0% {
        -webkit-transform: rotate(0deg);
        transform: rotate(0deg)
    }
    to {
        -webkit-transform: rotate(-1turn);
        transform: rotate(-1turn)
    }
}
@keyframes ccc {
    0% {
        -webkit-transform: rotate(0deg);
        transform: rotate(0deg)
    }
    to {
        -webkit-transform: rotate(-1turn);
        transform: rotate(-1turn)
    }
}
```



### 2.5 如何修改小风车颜色、大小

```css
#content-inner.layout h1::before {
    color: #ef50a8 ;
    margin-left: -1.55rem;
    font-size: 1.3rem;
    margin-top: -0.23rem;
}
#content-inner.layout h2::before {
    color: #fb7061 ;
    margin-left: -1.35rem;
    font-size: 1.1rem;
    margin-top: -0.12rem;
}
#content-inner.layout h3::before {
    color: #ffbf00 ;
    margin-left: -1.22rem;
    font-size: 0.95rem;
    margin-top: -0.09rem;
}
#content-inner.layout h4::before {
    color: #a9e000 ;
    margin-left: -1.05rem;
    font-size: 0.8rem;
    margin-top: -0.09rem;
}
#content-inner.layout h5::before {
    color: #57c850 ;
    margin-left: -0.9rem;
    font-size: 0.7rem;
    margin-top: 0.0rem;
}
#content-inner.layout h6::before {
    color: #5ec1e0 ;
    margin-left: -0.9rem;
    font-size: 0.66rem;
    margin-top: 0.0rem;
}
```



### 2.6 修改鼠标移入小风车转动变慢及变色

只需要CSS设置鼠标碰到标题时，小风车跟随标题变色，且像是被光标阻碍了，转速变慢。鼠标离开恢复转速。也可以设置为 none 鼠标碰到停止转动。

```css
#content-inner.layout h1:hover, #content-inner.layout h2:hover, #content-inner.layout h3:hover, #content-inner.layout h4:hover, #content-inner.layout h5:hover, #content-inner.layout h6:hover {
    color: #49b1f5 ;
}
#content-inner.layout h1:hover::before, #content-inner.layout h2:hover::before, #content-inner.layout h3:hover::before, #content-inner.layout h4:hover::before, #content-inner.layout h5:hover::before, #content-inner.layout h6:hover::before {
    color: #49b1f5 ;
    -webkit-animation: ccc 3.2s linear infinite ;
    animation: ccc 3.2s linear infinite ;
}
```



### 2.7 设置页面图标转速

这个就是修改博客右下角那个齿轮icon的转速（

```css
/* 页面设置icon转动速度调整 */
#rightside_config i.fas.fa-cog.fa-spin {
    animation: fa-spin 5s linear infinite ;
}
```

