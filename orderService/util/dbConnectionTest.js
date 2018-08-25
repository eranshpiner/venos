const mysql = require('mysql');

var connection = mysql.createConnection({
    host     : 'localhost',
    database : 'venos',
    user     : 'xxxx',
    password : 'xxxx',
    port : 3308
  });
   
  connection.connect(function(err) {
    if (err) {
      console.error('error connecting: ' + err.stack);
      return;
    }
   
    console.log('connected as id ' + connection.threadId);
    console.log('run some query...');


    connection.query('SELECT * FROM POS', function (error, results, fields) {
        if (error) throw error;
        console.log('The result is: ', results);

        connection.end
        process.exit()
      });      
  });

  
