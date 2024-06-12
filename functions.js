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

  try {
    const auth = await authorize();
    const service = google.people({ version: "v1", auth });
    const contact = await searchContact({ phoneNumber: formattedPhoneNumber });

    console.log(contact);

    if (contact) throw new Error("Number already exists");

    await service.people.createContact({
      requestBody: {
        phoneNumbers: [{ value: formattedPhoneNumber }],
        names: [{ givenName: name }],
        emailAddresses: [{ value: email }],
      },
    });

    return "Success add contact";
  } catch (err) {
    throw new Error(err.message || "Internal Server Error");
  }
}

// update
export async function updateConnection(data) {
  const { oldNumber, newNumber } = data;
  const newNumberFormatted = phoneNumberFormater(newNumber);
  const oldNumberFormatted = phoneNumberFormater(oldNumber);

  try {
    const auth = await authorize();
    const service = google.people({ version: "v1", auth });
    const contact = await searchContact({
      phoneNumber: oldNumberFormatted,
    });

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

async function searchContact({ phoneNumber }) {
  try {
    const auth = await authorize();
    const service = google.people({ version: "v1", auth });
    const res = await service.people.searchContacts({
      query: phoneNumber,
      readMask: "phoneNumbers",
    });

    if(!res.data.results) throw new Error("Contact not found");

    return res.data.results;
  } catch (err) {
    throw new Error(err.message || "Internal Server Error");
  }
}
