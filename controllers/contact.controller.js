import { google } from "googleapis";
import { authorize } from "../controllers/auth.controller.js";
import { phoneNumberFormater } from "../utils/formatedNumber.js";

async function searchContact({ name, phoneNumber }) {
  try {
    const auth = await authorize();
    const service = google.people({ version: "v1", auth });

    const res = await service.people.searchContacts({
      query: phoneNumber,
      readMask: "phoneNumbers",
    });

    if (!res) {

      const results = await service.people.searchContacts({
        query: name,
        readMask: "names,phoneNumbers",
      });
      console.log("Name" + results);
      return results.data.results
    }
    console.log("phoneNumbers" + res);
    return res.data.results;
  } catch (err) {
    throw new Error(err.message || "Internal Server Error");
  }
}

// read all
export const listConnectionNames = async (req, res) => {
  try {
    const { auth } = req;
    if (!auth) {
      return res.status(401).json("Authorization Required");
    }

    const service = google.people({ version: "v1" });
    const results = await service.people.connections.list({
      resourceName: "people/me",
      personFields: "names,phoneNumbers,emailAddresses,clientData,imClients",
      requestSyncToken: true,
      auth,
    });
    const connections = results.data.connections;

    res.status(200).json(connections);
  } catch (error) {
    if (error.code == 401) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// read only one contact
export const getContact = async (req, res) => {
  try {
    const { id } = req.body;
    const { auth } = req;
    if (!auth) {
      return res.status(401).json("Authorization Required");
    }
    const service = google.people({ version: "v1", auth });
    const results = await service.people.get({
      resourceName: `people/${id}`,
      personFields: "names,emailAddresses,phoneNumbers",
    });

    const person = results.data;
    res.status(200).json(person);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const createContact = async (req, res) => {
  try {
    var { auth } = req;

    if (!auth) {
      return res.status(401).json("Authorization Required");
    }

    const { branch, name, email = "", phoneNumber, streetAddress, birthdays } = req.body;
    const formattedPhoneNumber = phoneNumberFormater(phoneNumber);

    const service = google.people({ version: "v1", auth });
    const contact = await searchContact({
      auth: auth,
      name: name,
      phoneNumber: phoneNumber
    });

    if (Array.isArray(contact)) {
      const numbers =[];

      const promises = contact.map(async (data) => {
        const results = await service.people.get({
          resourceName: data.person.resourceName,
          personFields: "names,emailAddresses,phoneNumbers",
        });
        numbers.push(results.data.phoneNumbers?.[0].value); // extract the phone number value
        return results;
      });
  
      const resultsArray = await Promise.all(promises);
  
      const found = numbers.find((element) => element === formattedPhoneNumber);
      console.log("found: " + found); //
      if (found) {
        return res.status(409).json("Numbers is exists!");
      }
      return;
    }
    
    try {

      const group = 
      {
        contactGroupId: 'myContacts',
        contactGroupResourceName: 'contactGroups/myContacts'
      }

      if ( branch == 1) {
  
        await service.people.createContact({
          requestBody: {
            phoneNumbers: [{ value: formattedPhoneNumber, type: 'work' }],
            names: [{ givenName: name }],
            emailAddresses: [{ value: email }],
            addresses : [{ streetAddress: streetAddress }],
            birthdays : [{ date: birthdays }],
            memberships : [{ contactGroupMembership: group }]
          }
        });
      } else if ( branch == 2 ) {
  
        const label = 
        {
          contactGroupId: '3838b2498bf088c3',
          contactGroupResourceName: 'contactGroups/3838b2498bf088c3',
        }
  
        await service.people.createContact({
          requestBody: {
            phoneNumbers: [{ value: formattedPhoneNumber, type: 'work' }],
            names: [{ givenName: name }],
            emailAddresses: [{ value: email }],
            addresses : [{ streetAddress: streetAddress }],
            birthdays : [{ date: birthdays }],
            memberships : [{ contactGroupMembership: group, contactGroupMembership: label }]
          }
        });
      }

      res.status(200).json("Contact created successfully");
    } catch (err) {
      console.log(err.message);
      res.status(500).json({ err: "Internal Server Error" });
    }
    
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateContact = async (req, res) => {
  const auth = await authorize();
  const { name, oldNumber, newNumber } = req.body;
  const newNumberFormatted = phoneNumberFormater(newNumber);
  const oldNumberFormatted = phoneNumberFormater(oldNumber);

  const service = google.people({ version: "v1", auth });
  const contact = await searchContact({
    name,
    phoneNumber: oldNumberFormatted,
  });

  if (Array.isArray(contact)) {
    const numbers = [];

    const promises = contact.map(async (data) => {
      const results = await service.people.get({
        resourceName: data.person.resourceName,
        personFields: "names,emailAddresses,phoneNumbers",
      });
      numbers.push(results.data.phoneNumbers?.[0].value); // extract the phone number value
      return results;
    });

    const resultsArray = await Promise.all(promises);

    var found = numbers.find((element) => element === oldNumberFormatted);
  }

  if (!found) {
    return res.status(409).json({ error: "Number does not exist!" });
  }

  try {
    const id = contact[0].person.resourceName;
    let etag = contact[0].person.etag;

    const updateFields = {
      resourceName: id,
      personFields: "phoneNumbers",
      updatePersonFields: "phoneNumbers",
      resource: {
        etag,
        phoneNumbers: [{ value: newNumberFormatted }],
      },
    };

    await service.people.updateContact(updateFields);

    res.status(200).json("Contact updated successfully");

  } catch (error) {
    console.error(`Error updating contact: ${error.message}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteContact = async (req, res) => {
  try {
    const { auth } = req;
    if (!auth) {
      return res.status(401).json("Authorization Required");
    }
    const service = google.people({ version: "v1", auth });
    const contacts = await listConnectionNames();

    const contact = contacts.find((contact) => {
      return contact.resourceName === `people/${id}`;
    });

    if (!contact) throw new Error("Contact not found");

    await service.people.deleteContact({
      resourceName: `people/${id}`,
    });
    res.status(200).json("Contact deleted successfully");
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
