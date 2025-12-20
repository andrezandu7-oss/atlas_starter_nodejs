'use strict';

const COMMENTS = /([^:]\/\/.+?[\r\t\n])|(\/\*[\s\S]+?\*\/)|(<!--.*-->)/g;
const CHINESE = /[\u4E00-\u9FA5\uF900-\uFA2D\uFF00-\uFFEF][\u4E00-\u9FA5\uF900-\uFA2D\uFF00-\uFFEF\ ]+/g;

exports.removeComments = content => {
  return content.replace(COMMENTS, '');
};

exports.parseChinese = content => {
  return content.match(CHINESE) || [];
};

exports.replaceChinese = (content, replace) => {
  return content.replace(CHINESE, replace);
};
