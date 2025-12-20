'use strict';
const comments = `
//test    

<a></b>


//test

var a = b;

/*test  
*  
ddd

*/

cc
http://sss的这种不会误判吗
//test
`;

function replace() {
  console.log(arguments);
}


comments.replace(/(\/\*[\w\'\s\r\n\*]*\*\/)|([^:]\/\/[\w ]*)|(\<![\-\-\s\w\>\/]*\>)/g, replace);
