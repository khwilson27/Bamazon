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


var purchaseBamazon = function() {

    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;

        // Prints customer results from db
        for (var i = 0; i < res.length; i++) {
            console.log("ID: " + res[i].item_id +
                " | Name: " + res[i].product_name +
                " | Department: " + res[i].department_name +
                " | Price: $" + res[i].price +
                " | Quantity: " + res[i].stock_quantity);
        }
        console.log("-----------------------------------------------------------------------------");

        // Prompts user to input the item Id and quantity for purchase
        inquirer.prompt([
            {
                type: "input",
                name: "purchaseItemId",
                message: "Enter the ID of the item you would like to purchase: "
            },
            {
                type: "input",
                name: "purchaseQuantity",
                message: "Enter the quantity of the item you like to purchase: "
            }
        ]).then(function (answers) {

            // Verify sufficient volume for customer to purchase and update SQL db if enough
            connection.query("SELECT * FROM products WHERE item_id=?", [answers.purchaseItemId], function (err, res) {
                if (err) throw err;

                if (answers.purchaseQuantity <= res[0].stock_quantity) {
                    console.log("You have purchased quantity " + answers.purchaseQuantity + " of item " + res[0].product_name + ".");
                    console.log("The total price is: $" + res[0].price * answers.purchaseQuantity);

                    // Update db with new quantity
                    connection.query("UPDATE products SET ? WHERE ?", [{
                        stock_quantity: res[0].stock_quantity - answers.purchaseQuantity
                    }, {
                        item_id: answers.purchaseItemId
                    }], function (err, res) { if (err) throw err; });

                    // Update db with new product_sales
                    connection.query("UPDATE products SET ? WHERE ?", [{
                        product_sales: res[0].product_sales + (res[0].price * answers.purchaseQuantity)
                    }, {
                        item_id: answers.purchaseItemId
                    }], function (err, res) { if (err) throw err; });

                    // Update db with total_sales for department
                    connection.query("UPDATE departments SET ? WHERE ?", [{
                        product_sales: 
                    }, {
                        item_id:
                    }], function (err, res) { if (err) throw err; });

                } else {
                    console.log("Invalid! Insufficient stock!");
                }

                inquirer.prompt([
                    {
                        type: "list",
                        name: "repeat",
                        message: "Would you like to make another purchase?",
                        choices: ["Yes", "No"]
                    },
                ]).then(function (repeatAnswer) {
                    if (repeatAnswer.repeat == "Yes") {
                        purchaseBamazon();
                    } else {
                        console.log("Thank you for shopping with Bamazon! Have a great day!");
                        connection.end();
                    }
                })
            });
        });
    });
}

purchaseBamazon();



