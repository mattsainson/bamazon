# Bamazon

A CLI app simulating an Amazon-like store with two modes: buyer and store manager.

Developer: @mattsainson
Date: Fri, Mar 22, 2019

Buyer

The buyer is presented with the list of available products in inventory including the price.
The buyer can buy a product or exit the system.
If the buyer selects Buy, the system asks for the ID and the quantity of the product to buy.
The system checks if there is sufficient inventory and if so, makes the sale. A reciept is generated for the sale indicating the date, time, name of product, quantity bought, and total charged.
If there isn't sufficient inventory, the system informs the buyer.

Store Manager

The store manager can perform several system functions:

    * View Products for Sale
        The system displays the list of products for sale.
    * View Low Inventory
        The system prompts for a low inventory level, and then shows products that are below that level.
    * Add to Inventory
        The system prompts for a product ID and quantity, and adds that inventory to current inventory.
    * Add New Product
        The system gets the unique list of departments, and prompts the manager to select the department to add the new product, or cancel the action.
        The system then asks for the product name, initial inventory, and price.
        The system adds the product to the items for sale.
        Note: There should be a function to add a new department. That would work for a data model where there was a departments table.
    * Exit
        Logs the manager off the system.

The system continues to return to the main menu unless the manager exits the system.

Assumption: You have node installed.

To run the app:

1. Clone the repo locally.
2. Set your Terminal's current path to the path of the app directory.
3. Terminal: npm install -y
4. Terminal: npm install mysql
5. Terminal: npm install inquirer
6. Terminal: npm install moment
7. Run products.sql in your SQL client. Then run products-rows.sql to create some data.
8. Edit the following two files by adding the root password to the database you created:
    bamazonCustomer.js
    bamazonManager.js
9. To start the buyer's experience:
    9.1 Set your Terminal's current path to the path of the app directory.
    9.2 Terminal: node bamazonCustomer.js
10. To start the manager's experience:
    10.1 Set your Terminal's current path to the path of the app directory.
    10.2 Terminal: node bamazonManager.js

Images:

![customer welcome](https://github.com/mattsainson/bamazon/blob/master/images/customer1-welcome.png)
![customer buy](https://github.com/mattsainson/bamazon/blob/master/images/customer2-buy.png)


