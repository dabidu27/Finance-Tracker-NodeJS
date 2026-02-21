// console.log('Hello World')

import 'dotenv/config'
import http from 'http';
import { tasks } from './tasks.js'; //we use {} around tasks to import a named export
const PORT = process.env.PORT || 5000; //process.env.PORT takes the PORT variable from .env
//we also use || to specify a fallback port (PORT takes the variable from .env or a fallback port)

//the 'raw' way of creating an api endpoint is with http.createServer
//createServer takes as argument a callback function
//a callback function is a lambda function (unnamed) that runs only when a certain event takes place
//we call createServer, then node registers the call back function
//the function only runs when an actual request comes in
//until a request comes in, node can take care of other tasks
//node is asynchronous, event-driven and non blocking
const server = http.createServer((req, res) => {
    if (req.url === '/tasks' && req.method === 'GET') { //we check if the request is a GET
        //req.url === 'tasks' basically creates the /tasks endpoint
        //in js, === is strong equality, meaning it checks value and datatype
        // == is loose equality => it only checks value
        // 5 == "5" => TRUE (both values are 5)
        //5 === "5" => FALSE (both values are 5, but data types are int and string) 
        res.writeHead(200, { "Content-Type": "application/json" }); //for the response, we give the status code and Content-Type header with .writeHead
        res.end(JSON.stringify(tasks)); //and the actual JSON response with .end
    } else { //if the request is not good we return 404 and a fail message
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ 'message': 'Fail' }));
    }
});

//server.listen takes the port for the server, and we also use a callback function
//when the server is actually active, we write a message in the console
server.listen(PORT, () => {
    console.log(`Server is alive on port ${PORT}`); //for a f-string (f"..." in python) we use `...` instead of '...'
});


