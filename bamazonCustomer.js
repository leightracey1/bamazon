var mysql = require("mysql");
var inquirer = require("inquirer")

var connection = mysql.createConnection({
    host: "localhost",
  
    // Your port; if not 3306
    port: 3306,
  
    // Your username
    user: "root",
  
    // Your password
    password: "",
    database: "bamazon"
  });

  connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    
  });

function startBamazon() {
  inquirer
  .prompt({
    name: "firstquestion",
    type: "rawlist",
    message: "Are you a manager or a customer?",
    choices: ["Manager", "Customer"]
  }).then(function(answer) {

    switch (answer.firstquestion) {
      case "Manager":
        managerStart()
        break;
        case "Customer":
        customerStart()
        break;
    }

  }); 
}

function customerStart() {

  // let query = "SELECT item_id, product_name, price FROM products"
  
  let query = "SELECT * FROM products"

    connection.query(query, function(err, response) {
  
      if(err) throw err;
  
      console.log(response)
      
      // for (var i = 0; i <response.length; i++) {
      // console.log(response[i].item_id)
      // }

  inquirer
  .prompt([
    {
       name: "item",
        type: "input",
        message: "what is the ID of them item you would like to buy?"
      },
      {
        name: "howmany",
         type: "input",
         message: "How many would you like to buy?"
       }
]).then(function(answer) { 
    var chosenItem;
    console.log(answer.item)
  for (var i = 0; i <response.length; i++) {
    if (response[i].item_id == answer.item) {
      chosenItem = response[i];
      console.log(chosenItem)
      // console.log(answer.howmany)
     if(chosenItem.stock_quantity >= answer.howmany) {
     let moneySpent = answer.howmany * chosenItem.price;

     console.log("Your item is being shipped. You spent $" +moneySpent)

      let inventoryLeft = parseInt(chosenItem.stock_quantity - answer.howmany)

      console.log(inventoryLeft)
    
     connection.query(
        "UPDATE products SET ? WHERE ? ",
        [
          {
          stock_quantity: inventoryLeft
          },
          {
          item_id: chosenItem.item_id
          }
        ],
        function(error) {
          if (error) throw err;
          console.log("Order placed successfully!");
          connection.end();
        }
      );
     } else {

      console.log("we don't have enough of that item")

     }
    }
  }
})
}); 
}


function managerStart() {
  inquirer
  .prompt({
    name: "todo",
    type: "rawlist",
    message: "Would you like to do?",
    choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"]
  })
  .then(function(answer) {

    switch (answer.todo) {
      case "View Products for Sale":
        console.log("View Products for Sale");
        viewProducts()
        break;
      case "View Low Inventory":
      console.log("View Low Inventory");
      viewLowInventory()
      break;
      case "Add to Inventory":
      console.log("Add to Inventory");
      addToInventory()
      break;
      case "Add New Product":
      console.log("Add New Product");
      addNewProduct()
      break;
    }


    }); 



  }


function viewProducts() {

  let query = "SELECT * FROM products"

    connection.query(query, function(err, response) {
  
      if(err) throw err;
  
      console.log(response)
      connection.end();
    });

}

function viewLowInventory() {

  let query = "SELECT item_id, product_name, stock_quantity FROM products WHERE stock_quantity < 16"
  connection.query(query, function(err, response) {
  
    if(err) throw err;

    console.log(response)
    connection.end();
  });
}


function addToInventory() {
  
  inquirer
  .prompt([ 
    {
   name: "addmore",
   type: "input",
   message: "what is the ID of the item you would like to order more of??",
    },
    {
            name: "howmany",
             type: "input",
             message: "How many would you like to add to inventory "
           }      
          ])
  .then(function(answer) {
    console.log(answer.addmore)

    let query = "SELECT * FROM products"

    connection.query(query, function(err, response) {
  
      if(err) throw err;
  
      var chosenItem;
        
        for (var i = 0; i <response.length; i++) {
          if (response[i].item_id == answer.addmore) {
            chosenItem = response[i];
            console.log(chosenItem)


            let newInventory = chosenItem.stock_quantity + parseInt(answer.howmany) 

      
            connection.query(
              "UPDATE products SET ? WHERE ? ",
              [
                {
                stock_quantity: newInventory
                },
                {
                item_id: chosenItem.item_id
                }
              ],
              function(error) {
                if (error) throw err;
                console.log("Inventory updated successfully!");
              
              }
            );
          }}

      connection.end();
    });

}); 

}


function addNewProduct () {
  inquirer
  .prompt([ 
    {
   name: "newproduct",
   type: "input",
   message: "what is the name of the new product?",
    },
    {
            name: "department",
             type: "input",
             message: "Which department would you like to add the new product to?"
           }, 
           
           {
            name: "price",
            type: "input",
            message: "What is the price of the new product?",
             },

             {
              name: "stock",
              type: "input",
              message: "How many do you currently have in stock?",
               }
          ]).then(function(answer) {

            let thePrice = parseInt(answer.price)
            let theStock = parseInt(answer.stock)

            connection.query(
              "INSERT INTO products SET ?",
              {
                product_name: answer.newproduct,
                department_name: answer.department,
                price: thePrice,
                stock_quantity: theStock
              },
              function(err) {
                if (err) throw err;
                console.log("The product has been added!");
                // re-prompt the user for if they want to bid or post
                connection.end();
              }
            );

          }); 

}


startBamazon()

