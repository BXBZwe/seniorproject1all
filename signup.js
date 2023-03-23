const form = document.getElementById('signup-form');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  
  const fname = document.getElementById('fname').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const lname = document.getElementById('lname').value.trim();
  const phone = document.getElementById('phonenumber').value.trim();

  
  if (!fname || !lname  || !password || !email || !phone) {
    alert('Please fill out all fields.');
    return;
  }
  
  const xhr = new XMLHttpRequest();
  xhr.open('POST', '/signup');
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onload = function() {
    if (xhr.status === 200) {
      alert(xhr.responseText);
    } else {
      alert('Error: ' + xhr.statusText);
    }
  };
  xhr.send(JSON.stringify({ fname, lname, password, email, phone}));
});
