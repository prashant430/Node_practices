const file = require('fs');

file.writeFileSync('./url.txt','Hello world new file generate');
file.appendFile('./test.txt', 'Hello content appended', function (err) {
    if (err) throw err;
    console.log('Saved!');
  });

//   file.unlink('./test.txt', function (err) {
//     if (err) throw err;
//     console.log('File deleted!');
//   });