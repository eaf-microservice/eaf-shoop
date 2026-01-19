# EAF Shop

EAF Shop is a client-side e-commerce platform designed to showcase and sell high-quality electronic products. The project is built using standard web technologies: HTML, CSS, and JavaScript, providing a rich user experience for browsing products, searching, and managing a shopping cart.

## Features

*   **Product Display:** Browse through new products, a comprehensive list of all available products, and special promotions.
*   **Search Functionality:** Easily find desired products using the integrated search bar.
*   **Shopping Cart:** Add products to a cart for a seamless shopping experience (functionality implied by `cart.js`).
*   **Responsive Design:** (Assumed based on modern web practices, can be confirmed with further investigation)
*   **Error Handling:** Dedicated 404 error page for unhandled routes.

## Project Structure

The project is organized into a clear and maintainable structure:

```
.
├── index.html                  # Main entry point of the application
├── pages/
│   ├── error404.html           # Custom 404 error page
│   └── search.html             # Page to display search results
└── static/
    ├── css/                    # Contains all stylesheets
    │   ├── all-products.css
    │   ├── base.css
    │   ├── card.css
    │   ├── error404.css
    │   ├── new-products.css
    │   ├── promotions.css
    │   ├── search.css
    │   └── style.css           # Main styling file
    ├── images/                 # Stores all project images
    │   ├── 404.jpg
    │   ├── header.avif
    │   ├── logo_light.png
    │   ├── logo.svg
    │   ├── panier.png
    │   └── products/           # Product specific images
    │       ├── product1.avif
    │       ├── product2.avif
    │       └── product3.avif
    └── js/                     # Contains all JavaScript files
        ├── all_products.js     # Manages the display of all products
        ├── cart.js             # Handles shopping cart functionality
        ├── main.js             # Core application logic and event handling
        ├── new_products.js     # Manages the display of new products
        ├── promotions.js       # Handles promotions display
        └── search.js           # Manages search functionality
```

## Technologies Used

*   **HTML5:** For structuring the web content.
*   **CSS3:** For styling and visual presentation.
*   **JavaScript (ES6+):** For interactive functionalities and dynamic content.

## Setup and Usage

To run this project locally:

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    ```
2.  **Navigate to the project directory:**
    ```bash
    cd e-shop
    ```
3.  **Open `index.html`:** Simply open the `index.html` file in your web browser. Since this is a client-side application, no server setup is required.

## Contact

For any inquiries, please contact:
*   **Telephone:** +212 645 994 904
*   **Email:** EAF.microservice@gmail.com
*   **Address:** Agdal Rabat
*   **Designed by:** EAF microservice - [eaf-microservice.netlify.app](https://eaf-microservice.netlify.app/)
