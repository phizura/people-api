import express from "express";
import {
  getContact,
  listConnectionNames,
  createConnection,
  updateConnection,
  deleteContact,
} from "./functions.js";

const router = express.Router();

router.get("/contacts", async (req, res) => {
  try {
    const contact = await listConnectionNames();
    res
      .status(200)
      .json({ message: "success Getting Contact", connection: contact });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.get("/contact/:id", async (req, res) => {
  try {
    const contact = await getContact({ id: req.params.id });
    res.status(200).json({
      message: "success Getting Specific Contact",
      connection: contact,
    });
  } catch (err) {
    res.status(500).send({ message: error.message });
  }
});

router.post("/add-contact", async (req, res) => {
  try {
    await createConnection(req.body);
    res.status(201).send({ message: "Success Add Contact" });
  } catch (error) {
    if (error.message === "Number already exists") {
      res.status(409).send({ message: error.message });
    } else {
      res.status(500).send({ message: error.message });
    }
  }
});
//   try {
//     const result = await createConnection(req.body);
//     console.log(result);
//     if(result.message === 409){
//       res.status(409).send({ message: "Number already exists" });
//     }
//     res.status(201).send({ message: "Success Add Contact" });
//   } catch (error) {
//     console.log(error);
//     if (error.message === "Number already exists") {
//       res.status(409).send({
//         message: error.message,
//         code: "CONTACT_ALREADY_EXISTS",
//         description: "The phone number is already associated with an existing contact."
//       });
//     } else {
//       res.status(500).send({
//         message: error.message,
//         code: "INTERNAL_SERVER_ERROR",
//         description: "An unexpected error occurred. Please try again later."
//       });
//     }
//   }
// });

// router.post("/add-contact", create);

router.post("/update-contact", async (req, res) => {
  try {
    await updateConnection(req.body);
    res.status(201).send({ message: "Success Update Contact" });
  } catch (error) {
    // console.log(error);
    if (error.message === "Contact not found") {
      res.status(404).send({ message: error.message });
    } else {
      res.status(500).send({ message: error.message });
    }
  }
});

router.post("/delete-contact", async (req, res) => {
  try {
    await deleteContact(req.body);
    res.status(201).json({ message: "Contact Deleted" });
  } catch (error) {
    if (error.message === "Contact not found") {
      res.status(400).send({ message: error.message });
    } else {
      res.status(500).send({ message: error.message });
    }
  }
});

export default router;
