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

var printAllDepartments = function () {
    connection.query("SELECT * FROM departments", function (err, res) {
        console.log("\n-----------------------------------------------------------------------------");
        for (var i = 0; i < res.length; i++) {

            let totalProfit = res[i].total_sales - res[i].over_head_costs;
            console.log("Department ID: " + res[i].department_id +
                " | Department Name: " + res[i].department_name +
                " | Overhead Costs: $" + res[i].over_head_costs +
                " | Total Sales: $" + res[i].total_sales +
                " | Total Profit: $" + totalProfit);
        }
        console.log("----------------------------------------------------------------------------- \n \n \n");
    })
}

var supervisorBamazon = function () {

    inquirer.prompt([
        {
            type: "list",
            name: "menuChoice",
            message: "List of menu options: ",
            choices: ["View Product Sales by Department", "Create New Department", "Exit Program"]
        },
    ]).then(function (answer) {

        if (answer.menuChoice == "View Product Sales by Department") { // Prints department results from db and restart function

            printAllDepartments();
            supervisorBamazon();

        } else if (answer.menuChoice == "Create New Department") { // Prints products with < 5 quantity and restarts function

            inquirer.prompt([
                {
                    type: "input",
                    name: "newDeptName",
                    message: "Enter the NAME of the department you would like to add: "
                },
                {
                    type: "input",
                    name: "newOverheadCosts",
                    message: "Enter the OVERHEAD COSTS of the department you like to add: "
                },
                {
                    type: "input",
                    name: "newTotalSales",
                    message: "Enter the TOTAL SALES of the department you like to add: "
                }
            ]).then(function (answers) {

                // Add new product to database
                connection.query("INSERT INTO departments SET ?", {
                    department_name: answers.newDeptName,
                    over_head_costs: answers.newOverheadCosts,
                    total_sales: answers.newTotalSales
                }, function (err, res) {
                    if (err) throw err;
                    console.log("You have sucessfully added a new department.");
                    supervisorBamazon();
                });
            })

        } else { // Closes connection and ends program
            console.log("Thank you! Have a great day!");
            connection.end();
        }
    }) // closes then function from initial inquiry
} // closes supervisorBamazon function

supervisorBamazon();