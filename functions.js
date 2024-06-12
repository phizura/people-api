import { google } from "googleapis";
import authorize from "./services.js";

const phoneNumberFormater = (number) => {
  let formatted = number.replace(/\D/g, "");

  if (formatted.startsWith("0")) formatted = "62" + formatted.substr(1);

  return formatted;
};

// read all
export async function listConnectionNames() {
  try {
    const auth = await authorize();
    const service = google.people({ version: "v1", auth });
    const res = await service.people.connections.list({
      resourceName: "people/me",
      personFields: "names,phoneNumbers,emailAddresses",
    });
    const connections = res.data.connections;

    return connections;
  } catch (err) {
    throw new Error(err.message || "Internal Server Error");
  }
}

// read one
export async function getContact({ id }) {
  try {
    const auth = await authorize();
    const service = google.people({ version: "v1", auth });
    const res = await service.people.get({
      resourceName: `people/${id}`,
      personFields: "names,emailAddresses,phoneNumbers",
    });

    const person = res.data;
    return person;
  } catch (err) {
    throw new Error(err.message || "Internal Server Error");
  }
}

// create
export async function createConnection(data) {
  const { name, email = "", phoneNumber } = data;
  const formattedPhoneNumber = phoneNumberFormater(phoneNumber);

  // try {
  //   const auth = await authorize();
  //   const service = google.people({ version: "v1", auth });
  //   const contacts = await listConnectionNames();

  //   // const contact = contacts.find((contact) => {
  //   //   return contact.phoneNumbers[0].value === formattedPhoneNumber;
  //   // });

  //   const contact = contacts
  //   .filter(contact => contact.phoneNumbers)
  //   .flatMap(contact => contact.phoneNumbers)
  //   .find(phoneNumber => phoneNumberFormater(phoneNumber.value) == formattedPhoneNumber);

  //   if (contact) throw new Error("Number already exists");

  //   await service.people.createContact({
  //     requestBody: {
  //       phoneNumbers: [{ value: formattedPhoneNumber }],
  //       names: [{ givenName: name }],
  //       emailAddresses: [{ value: email }],
  //     },
  //   });

  //   return "Success add contact";
  // } catch (err) {
  //   throw new Error(err.message || "Internal Server Error");
  // }

  // try {
  //   const auth = await authorize();
  //   const service = google.people({ version: "v1", auth });
  //   const contacts = await listConnectionNames();

  //   const contact = contacts
  //  .filter(contact => contact.phoneNumbers)
  //  .flatMap(contact => contact.phoneNumbers)
  //  .find(phoneNumber => phoneNumberFormater(phoneNumber.value) == formattedPhoneNumber);

  //   if (contact) throw new Error(409);

  //   await service.people.createContact({
  //     requestBody: {
  //       phoneNumbers: [{ value: formattedPhoneNumber }],
  //       names: [{ givenName: name }],
  //       emailAddresses: [{ value: email }],
  //     },
  //   });

  //   return "Success add contact";
  // }catch (err) {
  //   // console.error(err.message);
  //   return { error: "Failed to create contact", message: err.message };
  // }
}

export const create = async(req, res) => {
  try {
    const { name, email = "", phoneNumber } = req.body;
    const formattedPhoneNumber = phoneNumberFormater(phoneNumber);

    const auth = await authorize();
    const service = google.people({ version: "v1", auth });
    const contacts = await listConnectionNames();

    const contact = contacts
    .filter(contact => contact.phoneNumbers)
    .flatMap(contact => contact.phoneNumbers)
    .find(phoneNumber => phoneNumberFormater(phoneNumber.value) == formattedPhoneNumber);

    if (contact) {
      return res.status(409).json({ error: 'Number already exists' });
    }

    await service.people.createContact({
      requestBody: {
        phoneNumbers: [{ value: formattedPhoneNumber }],
        names: [{ givenName: name }],
        emailAddresses: [{ value: email }],
      },
    });

    res.status(200).json({
      'message': 'Success add contact'
    });

  } catch (error) {
    console.Error(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// update
export async function updateConnection(data) {
  const { id, etag, phoneNumber } = data;
  const formattedNumber = phoneNumberFormater(phoneNumber);

  try {
    const auth = await authorize();
    const service = google.people({ version: "v1", auth });
    const contacts = await listConnectionNames();

    const contact = contacts.find((contact) => {
      return contact.phoneNumbers[0].value === formattedNumber;
    });

    if (contact) throw new Error("Number already exists");

    await service.people.updateContact({
      resourceName: `people/${id}`,
      personFields: "phoneNumbers",
      updatePersonFields: "phoneNumbers",
      resource: {
        etag: etag,
        phoneNumbers: [{ value: formattedNumber }],
      },
    });

    return "Success update contact";
  } catch (err) {
    throw new Error(err.message || "Internal Server Error");
  }
}

export async function deleteContact({ id }) {
  try {
    const auth = await authorize();
    const service = google.people({ version: "v1", auth });
    const contacts = await listConnectionNames();

    const contact = contacts.find((contact) => {
      return contact.resourceName === `people/${id}`;
    });
    console.log(contact);
    if (!contact) throw new Error("Contact not found");

    await service.people.deleteContact({
      resourceName: `people/${id}`,
    });
    return "Success delete contact";
  } catch (err) {
    throw new Error(err.message || "Internal Server Error");
  }
}
