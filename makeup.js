else if (pathname === '/home'){
  fs.readFile('./home.html', (err, data) => {
    if (err) {
      console.error(err);
      res.writeHead(500, {'Content-Type': 'text/html'});
      res.end('Error home page loading');
    } else {
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write(data);
      res.end();
    }
  });
 
}else if (pathname === '/profile') {
  const params = new URLSearchParams(req.url.split('?')[1]);
  const testid = params.get('id');
  //const sql = `SELECT * FROM test WHERE testid = ${testid}`;
  db.query("SELECT * FROM test WHERE testid = ? " , [testid] , function(err, result) {
    if (err) {
      console.error('Error retrieving user data: ' + err.stack);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.write('Error retrieving user data');
      res.end();
    } else {
      if (result.length === 0) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.write('User not found');
        res.end();
      } else {
        const user = result[0];
        fs.readFile('./profile.html', (err, data) => {
          if (err) {
            console.error('Error loading profile page: ' + err.stack);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.write('Error loading profile page');
            res.end();
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            data = data.toString().replace('{{fname}}', user.firstname);
            data = data.toString().replace('{{lname}}', user.lastname);
            data = data.toString().replace('{{email}}', user.email);
            res.write(data);
            res.end();
          }
        });
      }
    }
  });
}

res.writeHead(302, { 'Location': `/profile?id=${userId}` });
res.end(JSON.stringify({ message: 'Product created successfully' }));