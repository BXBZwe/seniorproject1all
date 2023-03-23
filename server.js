const http = require('http');
const fs = require('fs');
const url = require('url');
const mysql = require('mysql');

const port = 3000;
const db = mysql.createConnection({
  host: 'localhost',
  user: 'BXBZwe',
  password: 'BXBZwe136928',
  database: 'seniorproject1'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to database: ' + err.stack);
    return;
  }
  console.log('Connected to database with id ' + db.threadId);
});

const loggedinuser = {};
const server = http.createServer((req, res) => {
  const {pathname} = url.parse(req.url, true);

  if (pathname === '/') {
    //check if user is logged in
    if (loggedinuser[req.headers.cookie]){
      // Redirect to the home page
      res.writeHead(302, { 'Location': '/home' });
      res.end();
      return;
    }
    fs.readFile('./beforehome.html', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.write('Error loading home page');
        res.end();
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(data);
        res.end();
      }
    });
  } else if (pathname === '/signup') {
    if (req.method === 'POST') {
      let body = '';

      req.on('data', (chunk) => {
        body += chunk;
      });

      req.on('end', () => {
        const formData = require('querystring').parse(body);
        console.log(formData);
        //const testid = nextid++;
        // insert user data into database
         const sql = `INSERT INTO test ( firstname, lastname, email, testpassword, phonenumber) 
                 VALUES ('${formData.firstname}', '${formData.lastname}', '${formData.email}', '${formData.testpassword}', '${formData.phonenumber}')`;

        db.query(sql, function(err, result)  {
          if (err) {
            console.error('Error signing up: ' + err.stack);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.write('Error signing up');
            res.end();
          } else {
            console.log('User is added');
            res.writeHead(302, { 'Location': '/' });
            res.end();
          }
        });
      });
    } else {
      fs.readFile('./signup.html', (err, data) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.write('Error loading signup page');
          res.end();
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.write(data);
          res.end();
        }
      });
    }
  } else if (pathname === '/login') {
    if (req.method === 'POST') {
      let body = '';

      req.on('data', (chunk) => {
        body += chunk;
      });

      req.on('end', () => {
        const user = require('querystring').parse(body);
        const email = user.email;
        const testpassword = user.testpassword;
        db.query(  "SELECT * FROM test WHERE email = ? AND testpassword = ? " ,
        [email, testpassword] , function(err, result)  {
          
          if (err) {
            console.error('Error logging in: ' + err.stack);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.write('Error logging in');
            res.end();
          }else {
            console.log(result);
            if (result.length === 0) {
              res.writeHead(401, { 'Content-Type': 'text/plain' });
              res.write('Invalid email or password');
              res.end();
          } else {
              console.log('log in sucess');
              const testid = result[0].testid;
              res.writeHead(302, { 'Location': `/home?id=${testid}` });
              res.end();
          } }
        });
      });
    } else {
      fs.readFile('./login.html', (err, data) => {
        if (err) {
          console.error(err);
          res.writeHead(500, {'Content-Type': 'text/html'});
          res.end('<h1>Server Error</h1>');
        } else {
          res.writeHead(200, {'Content-Type': 'text/html'});
          res.write(data);
          res.end();
        }
      });
    }
  } else if (pathname === '/home'){
    const params = new URLSearchParams(req.url.split('?')[1]);
    const userid = params.get('id');
    console.log('Userid',userid);
    db.query("SELECT * FROM test WHERE testid = ? " ,
    [userid] , (err, result) => {
      if (err) {
        throw err;
      }
      fs.readFile('home.html', (err, data) => {
        if (err) throw err;
        //const html = data.toString().replace('{username}', userData.username).replace('{userId}', userId);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
    });
    })
  }else if (pathname === '/profile') {
    const params = new URLSearchParams(req.url.split('?')[1]);
    const userid = params.get('id');
    console.log('Userid',userid);
   // const sql = `SELECT * FROM test WHERE testid = ${userid}`;
    db.query("SELECT * FROM test WHERE testid = ? " , [userid], (err, result) => {
      if (err) {
        throw err;
      }
      if (result.length === 0) {
        res.writeHead(404);
        res.write('User not found');
        res.end();
      } else {
        fs.readFile('profile.html', (err, data) => {
          if (err) {
            res.writeHead(404);
            res.write('File not found');
          } else {
            res.writeHead(200, {'Content-Type': 'text/html'});
            data = data.toString().replace(/{{fname}}/g, result[0].firstname);
            data = data.toString().replace(/{{lname}}/g, result[0].lastname);
            data = data.toString().replace(/{{email}}/g, result[0].email);
            res.write(data);
            return res.end();
          }
        });
      }
    });
    // Retrieve product data from database
    db.query(`SELECT * FROM testproduct WHERE Userid=${userid}`, (err, result) => {
      if (err) {
        console.error('Error fetching product data:', err);
        res.writeHead(500);
        res.end('Internal server error');
      } else{
        db.query(`SELECT * FROM testproduct WHERE Userid=${userid}`, (err,productresult) => {
          if (err) {
            console.error('Error fetching product data:', err);
            res.writeHead(500);
            res.end('Internal server error');
          } else {
            const data = {
              user: result[0],
              products: productresult
            };
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data));
          }
        });
      }
    });
  } else if (pathname === '/homeproduct'){
    fs.readFile('./homeproduct.html', (err, data) => {
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
  } else if (pathname === '/postproduct') {
    // Retrieve user ID from query parameter
    const params = new URLSearchParams(req.url.split('?')[1]);
    const userId = params.get('id');  
    // Retrieve product details from POST request
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      console.log('Received product data:', body);
      try{
        const productData = JSON.parse(body);
        // Insert product data into database
        db.query(`INSERT INTO testproduct (Itemname, Itemstatus, Itemavailability, Itemcategory, Itemcondition, Userid, Postdate) VALUES ('${productData.Itemname}', '${productData.Itemstatus}', '${productData.Itemavailability}', '${productData.Itemcategory}', '${productData.Itemcondition}', ${userId}, '${productData.Postdate}')`, (err, result) => {
          if (err) throw err;
          console.log('Inserted product into database:', result);
          db.query(`SELECT * FROM testproduct WHERE Itemid=${result.insertId}`, (err, rows) => {
            if (err) throw err;
            const product = rows[0];
            // Send the product data as a response
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(product));
          })
        });
      }catch(error){
        console.error('Error parsing product data:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Invalid product data' }));
      }
    });
  }else if (pathname === '/getproduct') {
    if (req.method === 'GET'){
      const params = new URLSearchParams(req.url.split('?')[1]);
      const userId = params.get('id');
      // Retrieve product data from database
      db.query(`SELECT * FROM testproduct WHERE Userid=${userId}`, (err, result) => {
        if (err) {
          console.error('Error fetching product data:', err);
          res.writeHead(500);
          res.end('Internal server error');
        } else {
          const productData = JSON.stringify(result);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(productData);
        }
      });
    }
  }else if (pathname === '/getallproducts'){
    if (req.method === 'GET'){
      db.query(`SELECT * FROM testproduct`, (err, result) => {
        if (err){
          console.error('Error fetching product data:', err);
          res.writeHead(500);
          res.end('Internal server error');
        }else{
          const productData = JSON.stringify(result);
          res.writeHead(200, {'Content-Type': 'application/json'});
          res.end(productData)
        }
      });
    }else {
      fs.readFile('./homeproduct.html', (err, data) => {
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
    }
  } else if (pathname === "/productdetail"){
    const params = new URLSearchParams(req.url.split('?')[1]);
    const itemid = params.get('id');
    console.log('itemid :',itemid);
   // const sql = `SELECT * FROM test WHERE testid = ${userid}`;
    db.query("SELECT * FROM testproduct WHERE Itemid = ? " , [itemid], (err, result) => {
      if (err) {
        console.log(result)
        throw err;
      }
      console.log('this is :',result); 
      if (result.length === 0) {
        res.writeHead(404);
        res.write('Item not found');
        res.end();
      } else {
        fs.readFile('productdetail.html', (err, data) => {
          if (err) {
            res.writeHead(404);
            res.write('File not found');
          } else {
            res.writeHead(200, {'Content-Type': 'text/html'});
            data = data.toString().replace(/{{Itemname}}/g, result[0].Itemname);
            data = data.toString().replace(/{{Itemstatus}}/g, result[0].Itemstatus);
            data = data.toString().replace(/{{Itemcondition}}/g, result[0].Itemcondition);
            data = data.toString().replace(/{{Itemcategory}}/g, result[0].Itemcategory);
            data = data.toString().replace(/{{Itemavailability}}/g, result[0].Itemavailability);

            res.write(data);
            return res.end();
          }
        });
      }
    });
  } else if(pathname === '/appointment'){
    if (req.method === 'POST'){
      let body = '';
       // Read the data from the request body
       req.on('data', (chunk) => {
        body += chunk.toString();
      });

      req.on('end', () => {
        const appointmentData = JSON.parse(body);
        db.query(`INSERT INTO testappointment (Exchangeddate, Exchangedtime, Location, productid) VALUES ('${appointmentData.date}', '${appointmentData.time}', '${appointmentData.location}', '${appointmentData.product_id}')`, (error,results) => {
          if (error) {
            console.error('Error storing appointment:', error);
            res.writeHead(500, {'Content-Type': 'text/plain'});
            res.end('Error storing appointment');
          } else {
            console.log('Appointment stored:', results);
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end('Appointment stored successfully');
          }
        });
      });
    }
  }
  else {
    res.writeHead(404);
    res.write('Page not found');
    res.end();
  }
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
