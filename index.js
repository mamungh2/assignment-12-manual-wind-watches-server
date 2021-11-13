const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();

const app = express();
// middleware
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 5000

// connection string
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.r7g7r.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("manualWindWatches");
        const productsCollection = database.collection("products");
        const ordersCollection = database.collection("orders");
        const usersCollection = database.collection('users');
        const reviewsCollection = database.collection('reviews');

        // get method to get all products
        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            res.json(products);
        })

        // get method to get a product with dynamic id
        app.get('/products/:productId', async (req, res) => {
            const id = req.params.productId;
            const query = { _id: ObjectId(id) };
            const product = await productsCollection.findOne(query);
            res.json(product);
        })

        // get method to get all orders
        app.get('/orders', async (req, res) => {
            const cursor = ordersCollection.find({});
            const orders = await cursor.toArray();
            res.json(orders);
        })

        // get method to get a order with dynamic id
        app.get('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const order = await ordersCollection.findOne(query);
            res.json(order);
        })

        // get method to get a user with dynamic email 
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

        // put method to update a order status
        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const updatedOrder = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    status: updatedOrder.status
                },
            };
            const result = await ordersCollection.updateOne(filter, updatedDoc, options);
            res.json(result);
        })

        // put method to make user admin if exist
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        })


        // post method to insert a product
        app.post('/products', async (req, res) => {
            const newProduct = req.body;
            const result = await productsCollection.insertOne(newProduct);
            res.json(result);
        })

        // post method to insert a order
        app.post('/orders', async (req, res) => {
            const newOrder = req.body;
            const result = await ordersCollection.insertOne(newOrder);
            res.json(result);
        })

        // post method to get array of orders by logged in user name
        app.post('/orders/byName', async (req, res) => {
            const loggedInUser = req.body;
            const query = { customerName: { $in: loggedInUser } };
            const orders = await ordersCollection.find(query).toArray();
            res.json(orders);
        })

        // post method to insert a user
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        })

        // post method to insert a review
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            res.json(result);
        })


        // delete a product by id
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productsCollection.deleteOne(query);
            res.json(result);
        })

        // delete a order by id
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            res.json(result);
        })

    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World! from my server')
})

app.listen(port, () => {
    console.log(`Listening at port:${port}`)
})