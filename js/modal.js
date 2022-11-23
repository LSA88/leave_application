"use strict";

var searchModal = {
  open: function () {
    $("#modal-wrapper-search").show();
  },
  close: function () {
    $("#modal-wrapper-search").hide();
  },
};

var approvalModal = {
  open: function () {
    $("#modal-wrapper-approval").show();
  },
  close: function () {
    $("#modal-wrapper-approval").hide();
  },
};

$(document)
  .on("click", "#modal-overlay-search", function () {
    window.history.back();
  })
  .on("click", ".search__btn", function () {
    window.history.pushState({}, "searchModal", "/searchModal");
    searchModal.open();
  })
  .on("click", ".address__btn", function () {
    window.history.pushState({}, "searchModal", "/searchModal");
    searchModal.open();
  })
  .on("click", "#modal-overlay-approval", function () {
    window.history.back();
  })
  .on("click", ".approval__line__method", function () {
    window.history.pushState({}, "approvalModal", "/approvalModal");
    approvalModal.open();
  });

window.onpopstate = history.onpushstate = function (e) {
  if (window.location.href.split("/").pop().indexOf("modal") === -1) {
    // 마지막 segment가 cards라면 모달이 아닌 리스트인 상태이어야한다.
    searchModal.close();
    approvalModal.close();
  }
};
