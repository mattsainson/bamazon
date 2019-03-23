//bamazonCustomer
//simulates an Amazon-like experience for a buyer

var mysql = require('mysql');
var inquirer = require('inquirer');
var moment = require('moment');

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "", //add root password
    database: "bamazon"
});

var bamazon = {
    start: function () {
        this.doConnect();
    },
    doConnect: function () {
        connection.connect(function (err) {
            if (err) throw err;
            console.log('Welcome to Bamazon! Here are our products.');
            bamazon.showProducts();
        });
    },
    exit: function () {
        console.log('Thank you for shopping with Bamazon! You are not logged off.');
        connection.end();
    },
    showProducts: function () {
        connection.query('select * from products',
            function (err, resp) {
                if (err) throw err;
                if (resp) {
                    console.table(resp);
                    bamazon.sellProduct();
                }
            });
    },
    sellProduct: function () {
        inquirer
            .prompt([
                {
                    type: 'list',
                    message: 'What would you like to do?',
                    name: 'mainMenu',
                    choices: ['Buy', 'Exit']
                }
            ])
            .then(function (inq) {
                switch (inq.mainMenu) {
                    case 'Buy':
                        inquirer
                            .prompt([
                                {
                                    type: 'input',
                                    message: 'Please enter the ID of the product you wish to buy.',
                                    name: 'productID'
                                },
                                {
                                    type: 'input',
                                    message: 'Please enter the quantity of the product you wish to buy.',
                                    name: 'orderQty'
                                }
                            ])
                            .then(function (inq) {
                                bamazon.getInv(inq.productID, inq.orderQty);
                            });
                        break;
                    case 'Exit':
                        bamazon.exit();
                }
            });
    },
    getInv: function (productID, orderQty) {
        connection.query('select products.stockQty, products.price from products where ?',
            { id: productID },
            function (err, resp) {
                if (err) throw err;
                if (resp) {
                    // console.log('stockQty',resp[0].stockQty);
                    var productInv = resp[0].stockQty;
                    var price = resp[0].price;
                    // console.log('bamazon.productInv',productInv);
                    // console.log('bamazon.orderQty',orderQty);
                    if (productInv >= orderQty) {
                        bamazon.doSale(productID, orderQty, price);
                    } else {
                        console.log("We're sorry. We ony have " + productInv + " units in inventory.");
                        bamazon.showProducts();
                    }
                }
            });
    },
    doSale: function (id, orderQty, price) {
        connection.query('update products set products.stockQty = products.stockQty - ' + orderQty.toString() + ' where ?',
            { id: id },
            function (err, resp) {
                if (err) throw err;
                if (resp) {
                    bamazon.printReceipt(id, orderQty, price);
                }
            });
    },
    printReceipt: function (id, price, orderQty) {
        connection.query('select products.productName from products where ?',
            [{ id: id }],
            function (err, resp) {
                if (err) throw err;
                if (resp) {
                    var productName = resp[0].productName;
                    console.log('Thank you for shopping Bamazon!');
                    console.log(moment().format('MMMM Do YYYY, h:mm a'));
                    console.log('Item: ' + productName);
                    console.log('Qty: ' + orderQty, 'Price: ' + price, 'Total: ' + price * orderQty);
                    bamazon.showProducts();
                }
            });
    }
};

bamazon.start();
