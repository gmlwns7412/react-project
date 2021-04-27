const mysql = require('mysql');

const client = mysql.createConnection({
    host : 'arena.cafe24app.com',
    user : 'zack4525',
    password : 'q1w2e3r41!',
    database : 'zack4525',
  });

client.connect(err =>{
  if(err) throw err;
  console.log('MySQL 연결 성공')
})

module.exports = client;  