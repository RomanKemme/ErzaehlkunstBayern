/* Impressum / Datenschutz: Text aus „Verein & Rechtliches“ im CMS, sonst Vorlage */
(function (EKB, document) {
  'use strict';
  var box = document.getElementById('rechtInhalt');
  var feld = box.getAttribute('data-feld');
  EKB.query('*[_id=="verein"][0]{impressum, datenschutz}')
    .then(function (v) {
      var html = v && EKB.portableText(v[feld]);
      if (html) box.innerHTML = html;
    })
    .catch(function () { /* Vorlage bleibt sichtbar */ });
})(window.EKB, document);
