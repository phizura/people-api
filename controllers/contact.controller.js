import { google } from "googleapis";
import { authorize } from "./auth.controller.js";
import { phoneNumberFormater } from "../utils/formatedNumber.js";

async function searchContact({ phoneNumber }) {
    try {
      const auth = await authorize();
      const service = google.people({ version: "v1", auth });
      const res = await service.people.searchContacts({
        query: phoneNumber,
        readMask: "phoneNumbers",
      });

      return res.data.results;
    } catch (err) {
      throw new Error(err.message || "Internal Server Error");
    }
  }

// read all
export const listConnectionNames = async (req, res) => {
    try {
        const auth = await authorize();
        const service = google.people({ version: "v1", auth });
        const results = await service.people.connections.list({
            resourceName: "people/me",
            personFields: "names,phoneNumbers,emailAddresses",
        });
        const connections = results.data.connections;

        res.status(200).json(connections);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: "Internal Server Error"})
    }
};

// read only one contact
export const getContact = async (req, res) => {
    try {
        const { id } = req.body;
        const auth = await authorize();
        const service = google.people({ version: "v1", auth });
        const results = await service.people.get({
            resourceName: `people/${id}`,
            personFields: "names,emailAddresses,phoneNumbers",
        });

        const person = results.data;
        res.status(200).json(person);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: "Internal Server Error"})
    }
};

export const createContact = async (req, res) => {
    try {
        const { name, email = "", phoneNumber } = req.body;
        const formattedPhoneNumber = phoneNumberFormater(phoneNumber);
        const auth = await authorize();
        const service = google.people({ version: "v1", auth });
        const contact = await searchContact({ phoneNumber: formattedPhoneNumber });

        if (contact) {
            return res.status(409).json({ error: 'Number already exists!' });
        }

        const result = await service.people.createContact({
            requestBody: {
                phoneNumbers: [{ value: formattedPhoneNumber }],
                names: [{ givenName: name }],
                emailAddresses: [{ value: email }],
            },
        });

        res.status(200).json('Contact created successfully');
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: "Internal Server Error"})
    }
};

export const updateContact = async (req, res) => {
    const { oldNumber, newNumber } = req.body;
    const newNumberFormatted = phoneNumberFormater(newNumber);
    const oldNumberFormatted = phoneNumberFormater(oldNumber);
    try {
        const auth = await authorize();
        const service = google.people({ version: "v1", auth });
        const contact = await searchContact({
            phoneNumber: oldNumberFormatted,
        });

        if (!contact) {
            return res.status(404).json({ error: 'Number do not exists!' });
        }

        const id = contact[0].person.resourceName;
        const etag = contact[0].person.etag;

        await service.people.updateContact({
            resourceName: id,
            personFields: "phoneNumbers",
            updatePersonFields: "phoneNumbers",
            resource: {
                etag: etag,
                phoneNumbers: [{ value: newNumberFormatted }],
            },
        });
        res.status(200).json('Contact updated successfully');
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: "Internal Server Error"})
    }
};

export const deleteContact = async (req, res) => {
    try {
        const auth = await authorize();
        const service = google.people({ version: "v1", auth });
        const contacts = await listConnectionNames();

        const contact = contacts.find((contact) => {
            return contact.resourceName === `people/${id}`;
        });
        
        if (!contact) throw new Error("Contact not found");

        await service.people.deleteContact({
            resourceName: `people/${id}`,
        });
        res.status(200).json('Contact deleted successfully');
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: "Internal Server Error"})
    }
};