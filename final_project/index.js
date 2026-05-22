const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))
app.use("/customer/auth/*", function auth(req, res, next) {
    // Check if the user has an authorization object saved in their session
    if (req.session.authorization) {
        let token = req.session.authorization['accessToken']; // Access the JWT token string
        
        // Verify the signature of the web token using our secret key string
        jwt.verify(token, "access", (err, user) => {
            if (!err) {
                req.user = user; // Attach the decoded payload data to the request object
                next(); // Token is valid, clear the guard and move to the next route handler
            } else {
                return res.status(0, "User not authenticated").json({ message: "User not authenticated" });
            }
        });
    } else {
        return res.status(403).json({ message: "User not logged in" });
    }
});

//Write the authenication mechanism here
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
