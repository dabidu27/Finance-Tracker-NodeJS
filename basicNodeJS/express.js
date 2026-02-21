//instead of using the raw way for endpoints, we can use Express
//Express is a framework for building APIs, like FastAPI is for Python
import 'dotenv/config';
// const express = require('express'); //require is a module loader (like import and export), we use it here to load express
// const tasks = require('./tasks.js'); //in the other file we used import {tasks} from './tasks.js', and we can also use require
import express from 'express';
import { tasks } from './tasks.js';
import Joi from 'joi';
const app = express(); //we instantiate express
app.use(express.json()); //middleware to parse json (converts from json to a js object)
const PORT = process.env.PORT;
//get endpoint
app.get('/getTasks', (req, res) => {

    //now we just use res.json(tasks)
    //express automatically sets status code 200, sets headers, and jsonifies the response
    res.json(tasks);
});

//post endpoint

//we use the joi package to define a certain format for the request body
//in this case, the body has to contain the task title, and the completed field is set to be false by default
const taskSchema = Joi.object({
    task: Joi.string().required(),
    completed: Joi.boolean().default(false)
});

app.post('/addTask', (req, res) => {

    const { error, value: newTask } = taskSchema.validate(req.body); //we use the schema to validate the request body
    //the content of the body goes into the newTask variable, and an error code into the code variable
    if (!error) { //if the body was valid
        newTask.id = tasks.length + 1; //we generate a new id
        tasks.push(newTask); //we add the new task to the tasks array
        res.status(201).json({ 'message': 'Task added successfully' }); //we return a success message and set the status to 201 = created
    } else { //if not

        res.status(400).json({ 'message': error.details[0].message });
        //res.status(400).json({ 'message': 'Wrong body format' }); //we return a fail message
    }

});

//put endpoint - for updating
app.put('/getTasks/:id', (req, res) => { //'/getTasks/:id is a dynamic route; the id of the task we want to change is specified as a parameter
    const id = Number(req.params.id); //we take the parameter and we cast to number, because URL parameters are always string
    const task = tasks.find((task) => task.id === id); //we use mapping to find the task with the wanted it
    if (!task) { //if no task is found
        res.status(404).json({ 'message': 'Task not found' });
    } else {//if task is found
        Object.assign(task, req.body); //tasks.find returns a reference to the original object in the array, not a copy of it,
        //so the modification is done directly to the object in the array
        res.status(200).json({ 'message': 'Task successfully updated' });
    }
});

//delete endpoint
app.delete('/getTasks/:id', (req, res) => {

    const id = Number(req.params.id);
    const index = tasks.findIndex((task) => task.id === id); //find the index of the task with id equal to the desired it
    if (index === -1) {//if index is not found
        res.status(404).json({ 'message': 'Task not found' });
    } else {
        tasks.splice(index, 1); //remove 1 element at the desired location
        res.status(200).json({ 'message': 'Task successfully deleted' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is alive on port ${PORT}`);
});