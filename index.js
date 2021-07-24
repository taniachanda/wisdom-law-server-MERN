const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const MongoClient = require("mongodb").MongoClient;

const port = process.env.PORT || 7777;

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.r1fla.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.connect((err) => {
  console.log("connection err", err);
  const serviceCollection = client.db("lawWisdom").collection("services");
  const reviewsCollection = client.db("lawWisdom").collection("reviews");
  const appointmentsCollection = client
    .db("lawWisdom")
    .collection("appointments");
  const adminCollection = client.db("lawWisdom").collection("admins");

  console.log("database connected successfully");

  //api to add new admin
  app.post("/addAdmin", (req, res) => {
    const email = req.body;
    adminCollection.insertOne(email).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  //api to check if logged user is an admin
  app.post("/isAdmin", (req, res) => {
    const email = req.body.email;
    adminCollection.find({ email: email }).toArray((err, admin) => {
      res.send(admin.length > 0);
    });
  });

  app.post("/addAppointment", (req, res) => {
    const appointment = req.body;
    console.log("adding new book:", appointment);
    appointmentsCollection.insertOne(appointment).then((result) => {
      // console.log("inserted count", result.insertedCount);
      res.send(result.insertedCount > 0);
    });
  });
  app.get("/appointment/:id", (req, res) => {
    appointmentsCollection.find({}).toArray((err, items) => {
      console.log(err, items);
      res.send(items);
    });
  });

  app.post("/addReview", (req, res) => {
    const review = req.body;
    console.log("adding new review:", review);
    reviewsCollection.insertOne(review).then((result) => {
      console.log("inserted count", result.insertedCount);
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/reviews", (req, res) => {
    reviewsCollection.find({}).toArray((err, items) => {
      // console.log(err, items);
      res.send(items);
    });
  });

  app.post("/addService", (req, res) => {
    const newService = req.body;
    // console.log('adding new service:', newService)
    serviceCollection.insertOne(newService).then((result) => {
      console.log("inserted count", result.insertedCount);
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/services", (req, res) => {
    serviceCollection.find({}).toArray((err, items) => {
      // console.log(err, items);
      res.send(items);
    });
  });

  app.get("/service/:id", (req, res) => {
    serviceCollection
      .find({ _id: ObjectId(req.params.id) })
      .toArray((err, items) => {
        console.log(err, items);
        res.send(items[0]);
      });
  });
  //  delete a service
  app.delete("/deleteService/:id", (req, res) => {
    const id = req.params.id;
    console.log(id);
    try {
      serviceCollection
        .findOneAndDelete({ _id: ObjectId(id) })
        .then((result) => {
          if (result) {
            res.json({
              success: true,
              message: "Successfully Deleted",
            });
          }
        });
    } catch (e) {
      res.json({
        success: false,
        message: e,
      });
    }
  });

  // all booking orders
  app.get("/appointments", (req, res) => {
    appointmentsCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  // user booking orders
  app.get("/appointment", (req, res) => {
    const email = req.query.email;
    appointmentsCollection.find({ email: email }).toArray((err, documents) => {
      console.log(err, documents, email);
      res.send(documents);
    });
  });

  app.get("/secureOrder/:id", (req, res) => {
    appointmentsCollection
      .find({ _id: ObjectId(req.params.id) })
      .toArray((err, order) => {
        res.send(order);
      });
  });

  app.patch("/updateStatus", (req, res) => {
    const { id, status } = req.body;
    appointmentsCollection
      .updateOne(
        { _id: ObjectId(id) },
        {
          $set: { status: status },
        }
      )
      .then((result) => res.send(result.modifiedCount > 0));
  });

  // https://aqueous-wave-83012.herokuapp.com/

  // client.close();
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
