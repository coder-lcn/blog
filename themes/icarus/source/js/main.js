window.cwd = "/Users/lichangnan/blog";
moment.updateLocale = () => {};

const DEV = location.origin === "http://localhost:4000";

(function ($) {
  $('.article img:not(".not-gallery-item")').each(function () {
    // wrap images with link and add caption if possible
    if ($(this).parent("a").length === 0) {
      $(this).wrap(
        '<a class="gallery-item" href="' + $(this).attr("src") + '"></a>'
      );
      if (this.alt) {
        $(this).after(
          '<div class="has-text-centered is-size-6 has-text-grey caption">' +
            this.alt +
            "</div>"
        );
      }
    }
  });

  if (typeof moment === "function") {
    $(".article-meta time").each(function () {
      $(this).text(moment($(this).attr("datetime")).fromNow());
    });
  }

  function adjustNavbar() {
    // thank
    // const navbarWidth = $('.navbar-main .navbar-start').outerWidth() + $('.navbar-main .navbar-end').outerWidth();
    var navbarWidth =
      $(".navbar-main .navbar-start").outerWidth() +
      $(".navbar-main .navbar-end").outerWidth();
    if ($(document).outerWidth() < navbarWidth) {
      $(".navbar-main .navbar-menu").addClass("is-flex-stzart");
    } else {
      $(".navbar-main .navbar-menu").removeClass("is-flex-start");
    }
  }
  adjustNavbar();
  $(window).resize(adjustNavbar);

  var $toc = $("#toc");
  if ($toc.length > 0) {
    var $mask = $("<div>");
    $mask.attr("id", "toc-mask");

    $("body").append($mask);

    function toggleToc() {
      $toc.toggleClass("is-active");
      $mask.toggleClass("is-active");
    }

    $toc.on("click", toggleToc);
    $mask.on("click", toggleToc);
    $(".navbar-main .catalogue").on("click", toggleToc);
  }

  // 赞助二维码的显示隐藏-------------
  $(".donate-container .card-content").on("click", function () {
    const donate = this.querySelector(".buttons.is-centered");
    donate.style.overflow = "hidden";
    const height = donate.clientHeight;
    donate.style.height = height ? "0px" : "38.5px";
    donate.ontransitionend = () =>
      (donate.style.overflow = height ? "hidden" : "initial");
  });

  $(".donate-container .card-content a").on("click", (e) => {
    e.stopPropagation();
  });
  // --------------------

  // 全局搜索快捷键---------------
  window.onkeydown = (e) => {
    const action = () => {
      const searchElement = document.querySelector("a.navbar-item.search");
      searchElement && searchElement.click();
    };

    // command + k
    if (e.metaKey && e.key === "k") {
      e.preventDefault();
      action();
    }

    if (e.ctrlKey && e.key === "k") {
      e.preventDefault();
      action();
    }
  };
  // --------------

  // 在 Github 上编辑此页---------------
  $(".edit-article").on("click", () => {
    const [_, __, ___, ____, ...rest] = location.pathname.split("/");
    const fileName = rest.filter(Boolean).join("/");
    const editUrl = `https://github.com/coder-lcn/blog/edit/main/source/_posts/${fileName}.md`;
    window.open(editUrl, "_blank");
  });
  // ---------------

  // 在移动端，当搜索框出现时，阻止页面滚动
  const target = document.getElementById("toc-mask");
  const isMobile = /(iPhone|iPad|iPod|iOS|Android)/i.test(navigator.userAgent);
  if (target && isMobile === true) {
    const observer = new MutationObserver(() => {
      const isShow = target.classList.contains("is-active");
      document.documentElement.style.overflowY = isShow ? "hidden" : "scroll";
    });
    observer.observe(target, { attributes: true });
  }
  // ----------------

  // 首页卡片单击，进入文章详情--------------------------
  const showDetail = function () {
    location.href = this.dataset.url;
  };

  $(".card.index").on("click", showDetail);
  // --------------------------

  // 在 vscode 中打开文件
  if (DEV) {
    const githubEditButton = document.querySelector(".edit-article");
    if (Boolean(githubEditButton) === false) return;

    const [, , , , path1, path2, _] = location.pathname.split("/");

    const openFileFromVscode = document.createElement("a");
    openFileFromVscode.classList.add("vscode");
    openFileFromVscode.href = `vscode://file${window.cwd}/source/_posts/${path1}/${path2}.md`;
    openFileFromVscode.innerText = "在 vscode 中打开";

    githubEditButton.after(openFileFromVscode);
  }
  // --------------------------

  // 动态背景图 --------------------------
  (async () => {
    if (window.innerWidth <= 768) return;

    const source = [
      "https://unsplash.it/1920/1080/?random",
      "https://source.unsplash.com/user/erondu/1920x1080",
      "https://picsum.photos/1920/1080",
    ];

    class Main {
      setCache(src) {
        return localStorage.setItem("background", src);
      }
      getCache() {
        return localStorage.getItem("background");
      }
      loadImage(src) {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = src;

          img.onload = () => {
            resolve(src);
          };

          img.onerror = () => {
            reject();
          };
        });
      }
      cacheImg = "";
      container = null;
      constructor() {
        this.start();
        this.container = document.querySelector("section.section");
      }
      async setNewImg() {
        let imgSrc = "";

        for await (const src of source) {
          try {
            const result = await fetch(src);
            const blob = await result.blob();
            imgSrc = URL.createObjectURL(blob);
          } catch (error) {
            console.log(src);
            console.error(`加载${src}资源失败：` + error);
          }

          if (imgSrc) break;
        }

        this.setCache(imgSrc);

        const src = await this.loadImage(imgSrc);
        this.setCache(src);

        return imgSrc;
      }
      setBackground(src) {
        this.container.style.backgroundImage = `url(${src})`;
      }
      start() {
        this.cacheImg = this.getCache();

        if (this.cacheImg) {
          this.loadImage(this.cacheImg)
            .then((res) => {
              this.setBackground(res);
              this.setNewImg();
            })
            .catch(async () => {
              const src = await this.setNewImg();
              this.setBackground(src);
            });
        } else {
          this.setNewImg();
        }
      }
    }

    new Main();
  })();

  // -----------------------------------
})(jQuery);
