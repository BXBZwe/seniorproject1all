const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('id');
document.getElementById("user-id").value = userId;
const userid = document.getElementById('user-id').value;
function openForm() {
  document.getElementById("product-form").style.display = "block";
}
function closeForm() {
  document,getElementById("overallform").style.display = "none";
}
const postProductForm = document.getElementById('product-form');
// Function to display the products on the profile page
const displayProducts = (products) => {
  const productContainer = document.getElementById('post-list');
  // Clear previous products
  productContainer.innerHTML = '';
  // Iterate over the products and add them to the HTML
  products.forEach(product => {
    const productHTML = `<div class="product">
                        <h3>Item name: ${product.Itemname}</h3>
                        <p>Item Status: ${product.Itemstatus}</p>
                        <p>Availability: ${product.Itemavailability}</p>
                        <p>Bought Date: ${product.Postdate}</p>
                        </div>`;
    productContainer.insertAdjacentHTML('beforeend', productHTML);
  });
}
// Fetch the products from the server
const fetchProducts = async () => {
  try {
    const response = await fetch(`/getproduct?id=${userid}`);
    if (response.ok) {
      const data = await response.json();
      displayProducts(data);  
    } else {
      throw new Error('Failed to get products');
    }
  } catch (error) {
    console.error(error);
    alert('Failed to get products');
  }
};
// Call the fetchProducts function when the page loads
fetchProducts();

postProductForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(postProductForm);
  const productData = Object.fromEntries(formData.entries());
  try {
    const response = await fetch(`/postproduct?id=${userid}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productData)
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Product posted successfully:', data);
      // Display newly added product on the profile page
      // by adding it to the HTML
      const productContainer = document.getElementById('post-list');
      const productHTML = ` <div class="product">
                            <h3>Item name: ${data.Itemname}</h3>
                            <p>Item Status: ${data.Itemstatus}</p>
                            <p>Availability: ${data.Itemavailability}</p>
                            <p>Bought Date: ${data.Postdate}</p>
                            </div>`;
      productContainer.insertAdjacentHTML('beforeend', productHTML);
      alert('Product posted successfully');
      postProductForm.reset();
    } else {
      throw new Error('Product posting failed');
    }
  } catch (error) {
    console.error(error);
    alert('Product failed');
  }
});
