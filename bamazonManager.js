//app bamazonManager
//CLI app simulating Amazon-like store manager functions

var mysql = require('mysql');
var inquirer = require('inquirer');

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "", //add root password
    database: "bamazon",
    multipleStatements: true
});

var bamMan = {
    manOpts: ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product', 'Exit'],
    start: function () {
        console.log('You are logged into Bamazon Manager');
        bamMan.mainMenu();
    },
    mainMenu: function () {
        inquirer
            .prompt([
                {
                    type: 'list',
                    message: '** Main Menu **',
                    name: 'options',
                    choices: bamMan.manOpts
                }
            ])
            .then(function (inq) {
                var option = inq.options;
                console.log(option);
                switch (bamMan.manOpts.indexOf(option)) {
                    case 0:
                        bamMan.viewProducts();
                        break;
                    case 1:
                        bamMan.viewLowInv();
                        break;
                    case 2:
                        bamMan.addInv();
                        break;
                    case 3:
                        bamMan.addProduct();
                        break;
                    case 4:
                        bamMan.exit();
                        break;
                    default:
                        console.log('Something went wrong.');
                        break;
                }
            });
    },
    exit: function () {
        connection.end();
        console.log('You are now logged off.');
    },
    viewProducts: function () {
        // * If a manager selects `View Products for Sale`, the app should list every available item: the item IDs, names, prices, and quantities.
        connection.query('select * from products',
            function (err, resp) {
                if (err) throw err;
                if (resp) {
                    console.table(resp);
                    bamMan.mainMenu();
                }
            });
    },
    viewLowInv: function () {
        // * If a manager selects `View Low Inventory`, then it should list all items with an inventory count lower than five.
        inquirer
            .prompt([
                {
                    type: 'input',
                    message: 'Please enter the reorder level',
                    name: 'reorderLevel'
                }
            ])
            .then(function (inq) {
                var reorderLevel = Number(inq.reorderLevel);
                connection.query('select * from products where stockQty < ' + reorderLevel.toString(),
                    function (err, resp) {
                        if (err) throw err;
                        if (resp) {
                            if (resp.length > 0) {
                                console.table(resp);
                            } else {
                                console.log('All items have a stock quantity of at least '+reorderLevel.toString()+' units.');
                            }
                        }
                        bamMan.viewLowInv();
                    });
            });
    },
    addInv: function () {
        // * If a manager selects `Add to Inventory`, your app should display a prompt that will let the manager "add more" of any item currently in the store.
        inquirer
            .prompt([
                {
                    type: 'input',
                    message: 'Please enter the product ID to add inventory.',
                    name: 'productID'
                },
                {
                    type: 'input',
                    message: 'Please enter the quantity of inventory you wish to add.',
                    name: 'addInvQty'
                }
            ])
            .then(function (inq) {
                var productID = Number(inq.productID);
                var addInvQty = Number(inq.addInvQty);
                if (addInvQty >= 0 && addInvQty <= 1000) {
                    connection.query('select Count(products.id) as CNT from products where ?',
                        { id: productID },
                        function (err, resp) {
                            if (err) throw err;
                            if (resp) {
                                // console.log(resp);
                                if (resp[0].CNT === 1) {
                                    connection.query('update products set products.stockQty = products.stockQty + ' + addInvQty.toString() + ' where ?',
                                        { id: productID },
                                        function (err, resp) {
                                            if (err) throw err;
                                            if (resp) {
                                                console.log('The inventory was successfully added.');
                                                bamMan.showProduct(productID, bamMan.mainMenu);
                                            }
                                        });
                                } else {
                                    console.log('The product was not found, ID = ' + productID + '.');
                                    bamMan.addInv();
                                }
                            }
                        });
                } else {
                    console.log('The inventory quantity must be 1-1000.');
                    bamMan.addInv();
                }
            });
    },
    showProduct: function (id, func) {
        connection.query('select * from products where ?',
            { id: id },
            function (err, resp) {
                if (err) throw err;
                if (resp) {
                    console.table(resp);
                    func();
                }
            });
    },
    addProduct: function () {
        // * If a manager selects `Add New Product`, it should allow the manager to add a completely new product to the store.
        connection.query('select distinct products.deptName from products',
            function (err, resp) {
                if (err) throw err;
                if (resp) {
                    // console.log(resp);
                    //get distinct deptName from products as an array
                    var deptNames = [];
                    for (var i = 0; i < resp.length; i++) {
                        deptNames.push(resp[i].deptName);
                    }
                    deptNames.sort();
                    deptNames.push('Cancel'); //in case they want to cancel here
                    inquirer
                        .prompt([
                            {
                                type: 'list',
                                message: 'Please select a department to add the product.',
                                name: 'deptNames',
                                choices: deptNames
                            }
                        ])
                        .then(function (inq) {
                            var deptName = inq.deptNames; //we know this is valid; we could put an exit here and check
                            if (deptName === 'Cancel') {
                                bamMan.mainMenu();
                            } else {
                                inquirer
                                    .prompt([
                                        {
                                            type: 'input',
                                            message: 'Please enter the name of the product.',
                                            name: 'productName'
                                        },
                                        {
                                            type: 'input',
                                            message: 'Please enter the initial inventory quantity.',
                                            name: 'stockQty'
                                        },
                                        {
                                            type: 'input',
                                            message: 'Please enter the product price.',
                                            name: 'price'
                                        }
                                    ])
                                    .then(function (inq) {
                                        var productName = inq.productName; //this might be a duplicate name; the db could be made unique
                                        var stockQty = Number(inq.stockQty); //this must be 1-1000
                                        var price = Number(inq.price); //this should be > 0 but maybe not if free stuff for some reason
                                        //we could add a confirmation once all info is entered so process can be terminated
                                        //this could be made into a validation function with passed qty
                                        if (stockQty >= 0 && stockQty <= 1000) {
                                            connection.query('insert into products (productName,deptName,price,stockQty) values ?',
                                                [[[productName, deptName, price, stockQty]]],
                                                function (err, resp) {
                                                    if (err) throw err;
                                                    if (resp) {
                                                        // console.log(resp);
                                                        console.log('The inventory was successfully added.');
                                                        bamMan.showProduct(resp.insertId, bamMan.addProduct);
                                                    }
                                                });
                                        } else {
                                            console.log('The inventory quantity must be 1-1000.');
                                            bamMan.addProduct();
                                        }
                                    });
                            }
                        });
                }
            });
    },
};

bamMan.start();
