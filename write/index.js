#!/usr/bin/env node

const fs = require("fs");
const { readdir, writeFile } = fs.promises;
const path = require('path');
const readline = require('readline');
var inquirer = require('inquirer');
const { exec } = require('child_process');
const opn = require('opn');




(async () => {

  const resolve = (...filePath) => path.resolve(__dirname, ...filePath)

  // 文章所在目录
  const articleDir = resolve('../source/_posts')

  const dir = await readdir(articleDir)

  let count = 0;
  let arr = new Array();
  // 收集分类和标签
  dir.forEach(item => {
    const file = resolve(articleDir, item)

    let fRead = fs.createReadStream(file);
    let objReadline = readline.createInterface({
      input: fRead
    });

    objReadline.on('line', function (line) {
      if (line.includes('categories') || line.includes('tags')) {
        arr.push(line);
      }
    });

    objReadline.on('close', function () {
      count++

      if (count === dir.length) {
        let result = arr.reduce((pre, next) => {
          let [kind, name] = next.split(':');

          kind = kind.trim()
          name = name.trim()

          if (pre[kind]) {
            pre[kind][name] = 1
          } else {
            pre[kind] = {}
            pre[kind][name] = 1
          }

          return pre
        }, {})
        const categories = Object.keys(result.categories)
        const tags = Object.keys(result.tags)

        if (categories.length) {
          result.categories = categories
        }

        if (tags.length) {
          result.tags = tags
        }

        start(result)
      }
    })
  })

  return articleDir;
})()

async function start(result) {

  const [categories, tags] = getData();

  let finaTitle = '';
  let finaCategories = '';
  let finaTags = '';

  const a1 = await inquirer.prompt([{
    name: 'title',
    message: '请输入文章标题',
    type: 'value'
  }, {
    name: 'addCategories',
    message: '是否新增文章类型',
    type: 'confirm',
    default: false
  }])

  const { title, addCategories } = a1

  finaTitle = title

  if (addCategories) {
    const a2 = await inquirer.prompt({
      name: 'newCategories',
      message: '请输入新添加的文章类型',
      type: 'input',
      default: ''
    })

    const { newCategories } = a2

    finaCategories = newCategories
  } else {
    const a2 = await inquirer.prompt({
      name: 'addCategories',
      message: '请选择文章类型',
      type: 'list',
      default: 0,
      choices: categories
    })

    const { addCategories } = a2

    finaCategories = addCategories
  }

  const a3 = await inquirer.prompt([{
    name: 'addTags',
    message: '是否新增标签',
    type: 'confirm',
    default: false
  }])

  const { addTags } = a3


  if (addTags) {
    const a5 = await inquirer.prompt({
      name: 'newTags',
      message: '请输入新添加的标签',
      type: 'input',
      default: ''
    })

    const { newTags } = a5

    finaTags = newTags

  } else {

    const a4 = await inquirer.prompt({
      name: 'addTags',
      message: '请选择标签',
      type: 'list',
      default: 0,
      choices: tags
    })

    const { addTags } = a4

    finaTags = addTags
  }



  const md = `---
title: ${finaTitle}
toc: true
date: ${(new Date).toLocaleString()}
categories: ${finaCategories}
tags: ${finaTags}
---
  
  
  
  
  <!-- more -->
  
  
  `
  const file = path.resolve(__dirname, `../source/_posts/${title}.md`)
  writeFile(file, md).then(() => {
    opn(file, { app: 'Typora' });

    exec('pm2 kill && cd //Users/lichangnan/gitee/blog && pm2 start npm -- run start', (err, stdout, stderr) => {
      console.log(stdout)
    })
  })



  function getData() {
    const { categories, tags } = result

    const c = []
    const t = []

    categories.forEach(function (item) {
      c.push({
        name: item,
        value: item
      })
    });


    tags.forEach(function (item) {
      t.push({
        name: item,
        value: item
      })
    });

    return [c, t];
  }

}

