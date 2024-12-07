"use strict";
(function () {
  let searchFiles;
  let mySearchIndex;
  let sc_rp = false
  function toggleSearch() {
    const searchWrapperEl = document.getElementById("linkita-search-wrapper");
    const searchResultsEl = document.getElementById("linkita-search-results");
    if (null == searchWrapperEl || null == searchResultsEl) {
      console.error("searchWrapper is null");
      return;
    } else {
      searchWrapperEl.classList.remove("yzz-hide");
    }
    doSearchAction()
    if (sc_rp) {
      return
    }
    sc_rp = true
    report_info(401, "search_btn", {
      "type": "search_btn",
      "page": decodeURI(window.location)
    })
  }

  function doSearchAction() {
    const searchWrapperEl = document.getElementById("linkita-search-wrapper");
    const searchResultsEl = document.getElementById("linkita-search-results");
    const searchResultsFrameEl = document.getElementById("linkita-search-results-frame");
    if (null == searchWrapperEl || null == searchResultsEl) {
      console.error("searchWrapper is null");
      return;
    } else {
      searchWrapperEl.classList.remove("yzz-hide");
    }

    // const q = prompt("Enter your search term");
    // if (null == q) {
    //   searchWrapperEl.classList.add("yzz-hide");
    //   return;
    // }

    const q = document.getElementById("search-bar-input").value
    if (null == q || "" == q) {
      searchResultsEl.innerHTML = ""
      searchResultsFrameEl.classList.add("yzz-hide")
      return;
    }
    searchResultsFrameEl.classList.remove("yzz-hide")
    if ("undefined" === typeof (searchIndex) && "undefined" === typeof (Fuse)) {
      searchResultsEl.innerHTML = "<li>Search: Please wait...</li>";
      Promise.all(searchFiles.map(loadScript))
        .catch(error => {
          showError(searchResultsEl, "<li>Search file not found: <code>" + error + "</code></li>");
        })
        .then((t) => {
          mySearchIndex = new Fuse(window.searchIndex, {
            keys: ['title', 'body']
          })
          doSearch(q, searchResultsEl);
        });
    } else {
      doSearch(q, searchResultsEl);
    }
  }

  function doSearch(q, searchResultsEl) {
    let searchResults = mySearchIndex.search(q);
    const uniqueResults = [];

    searchResults.forEach(result => {
      if (!uniqueResults.some(r => r.item.url === result.item.url)) {
        uniqueResults.push(result);
      }
    });
    searchResults = uniqueResults
    const searchResultsCount = searchResults.length;
    if (searchResultsCount > 0) {
      const searchResultsRows = ["<li><strong>" + searchResultsCount + "</strong> search " +
        (searchResultsCount === 1 ? "result" : "results") + " for <code>" + mySafe(q) + "</code>:</li>"];
      for (let i = 0; i < searchResultsCount; i++) {
        const searchResult = searchResults[i];
        searchResultsRows.push("<li><a href=\"" + mySafe(searchResult.item.url) + "\">" +
          mySafe(searchResult.item.title) + "</a></li>");
      }
      searchResultsEl.innerHTML = searchResultsRows.join("");
      searchResultsEl.scrollIntoViewIfNeeded();
    } else {
      showError(searchResultsEl, "<li>No search results for <code>" + mySafe(q) + "</code>.</li>");
    }
  }

  function showError(searchResultsEl, err) {
    searchResultsEl.innerHTML = err;
    searchResultsEl.scrollIntoViewIfNeeded();
  }

  function mySafe(code) {
    return code.replace(/&/g, "&amp;").replace(/</g, "&lt;").
      replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  function loadScript(fileName) {
    return new Promise((resolve, reject) => {
      const scriptEl = document.createElement("script");
      scriptEl.onload = () => resolve(fileName);
      scriptEl.onerror = () => reject(fileName);
      scriptEl.async = true;
      scriptEl.src = fileName;
      document.head.appendChild(scriptEl);
    });
  }

  function initSearchButton(filenames) {
    searchFiles = filenames;
  }

  if (null == window.linkita) window.linkita = {};
  window.linkita.toggleSearch = toggleSearch;
  window.linkita.initSearchButton = initSearchButton;
  window.linkita.doSearchAction = doSearchAction;
})();
