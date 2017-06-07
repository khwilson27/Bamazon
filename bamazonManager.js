var mysql = require("mysql");
var inquirer = require('inquirer');

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "root",
    database: "bamazon"
});


// Connects with DB
connection.connect(function (err) {
    if (err) throw err;
    // console.log("connected as id " + connection.threadId);
});

var printAllProducts = function () {
    connection.query("SELECT * FROM products", function (err, res) {
        console.log("\n-----------------------------------------------------------------------------");
        for (var i = 0; i < res.length; i++) {
            console.log("ID: " + res[i].item_id +
                " | Name: " + res[i].product_name +
                " | Department: " + res[i].department_name +
                " | Price: $" + res[i].price +
                " | Quantity: " + res[i].stock_quantity);
        }
        console.log("----------------------------------------------------------------------------- \n \n \n \n \n");
    })
}

var managerBamazon = function () {
    inquirer.prompt([
        {
            type: "list",
            name: "menuChoice",
            message: "List of menu options: ",
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Exit Program"]
        },
    ]).then(function (answer) {

        if (answer.menuChoice == "View Products for Sale") { // Prints product results from db and restart function

            printAllProducts();
            managerBamazon();

        } else if (answer.menuChoice == "View Low Inventory") { // Prints products with < 5 quantity and restarts function

            connection.query("SELECT * FROM products WHERE stock_quantity <= 5", function (err, res) {
                console.log("\n-----------------------------------------------------------------------------");
                for (var i = 0; i < res.length; i++) {
                    console.log("ID: " + res[i].item_id +
                        " | Name: " + res[i].product_name +
                        " | Department: " + res[i].department_name +
                        " | Price: $" + res[i].price +
                        " | Quantity: " + res[i].stock_quantity);
                }
                console.log("----------------------------------------------------------------------------- \n \n \n \n \n");
            })
            managerBamazon();

        } else if (answer.menuChoice == "Add to Inventory") { // Allows manager to add inventory to db

            // Display current product and product info list
            connection.query("SELECT * FROM products", function (err, res) {
                console.log("\n-----------------------------------------------------------------------------");
                for (var i = 0; i < res.length; i++) {
                    console.log("ID: " + res[i].item_id +
                        " | Name: " + res[i].product_name +
                        " | Department: " + res[i].department_name +
                        " | Price: $" + res[i].price +
                        " | Quantity: " + res[i].stock_quantity);
                }
                console.log("----------------------------------------------------------------------------- \n \n \n \n \n");

                // Ask user for input for restockItemID and restockQuantity
                inquirer.prompt([
                    {
                        type: "input",
                        name: "restockItemId",
                        message: "Enter the ID of the item you would like to restock: "
                    },
                    {
                        type: "input",
                        name: "restockQuantity",
                        message: "Enter the QUANTITY of the item you like to restock: "
                    }
                ]).then(function (answers) {

                    // Search for correct index of Res of product of interest
                    let restockIndex;
                    for (var i = 0; i < res.length; i++) {
                        if (res[i].item_id == answers.restockItemId) {
                            restockIndex = i;
                        }
                    }

                    // Update db with new quantity and restart function
                    connection.query("UPDATE products SET ? WHERE ?", [{
                        stock_quantity: res[restockIndex].stock_quantity + parseInt(answers.restockQuantity)
                    }, {
                        item_id: parseInt(answers.restockItemId)
                    }], function (err, res) {
                        if (err) throw err;
                        managerBamazon();
                    });
                })
            })

        } else if (answer.menuChoice == "Add New Product") { // Allow manager to add a new product

            // Prompt user to input all necessary information for new product
            inquirer.prompt([
                {
                    type: "input",
                    name: "newItemName",
                    message: "Enter the NAME of the item you would like to add: "
                },
                {
                    type: "input",
                    name: "newItemDepartment",
                    message: "Enter the DEPARTMENT of the item you like to add: "
                },
                {
                    type: "input",
                    name: "newItemPrice",
                    message: "Enter the PRICE of the item you like to add: "
                },
                {
                    type: "input",
                    name: "newItemQuantity",
                    message: "Enter the QUANTITY of the item you like to add: "
                }
            ]).then(function (answers) {

                // Add new product to database
                connection.query("INSERT INTO products SET ?", {
                    product_name: answers.newItemName,
                    department_name: answers.newItemDepartment,
                    price: answers.newItemPrice,
                    stock_quantity: answers.newItemQuantity 
                }, function (err, res) { 
                    if (err) throw err;
                    console.log("You have sucessfully added a new product.");
                    managerBamazon(); 
                });
            })

        } else { // Closes connection and ends program
            console.log("Thank you! Have a great day!");
            connection.end();
        }


    }) // closes then function from initial inquiry
} // closes managerBamazon function

managerBamazon();