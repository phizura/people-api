import express from "express";
import {
  getContact,
  listConnectionNames,
  createConnection,
  updateConnection,
  deleteContact,
} from "../functions.js";

const router = express.Router();

router.get("/contacts", (req, res) => {
  listConnectionNames().then((contacts) => {
    res.send({
      status: true,
      message: "success",
      connection: contacts,
    });
  });
});

router.get("/contact/:id", (req, res) => {
  getContact({ id: req.params.id }).then((contact) => {
    res.send({
      status: true,
      message: "success",
      connection: contact,
    });
  });
});

router.post("/add-contact", (req, res) => {
  console.log("Menambah Data");
  console.log(req.body);
  createConnection(req.body).then((message) => {
    res.send({ message });
  });
});

router.post("/update-contact", (req, res) => {
  updateConnection(req.body).then((message) => {
    res.send({ message });
  });
});

router.post("/delete-contact", (req, res) => {
  deleteContact(req.body).then((message) => {
    res.send({ message });
  });
})



export default router;