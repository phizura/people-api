import { google } from "googleapis";
import authorize from "./services.js";

// read all
export async function listConnectionNames() {
  const auth = await authorize();
  const service = google.people({ version: "v1", auth });
  const res = await service.people.connections.list({
    resourceName: "people/me",
    personFields: "names,phoneNumbers,emailAddresses",
  });
  const connections = res.data.connections;

  if (!connections || connections.length === 0) {
    console.log("No connections found.");
    return;
  }

  console.log(connections);
  return connections;
}

// read one
export async function getContact({ id }) {
  const auth = await authorize();
  const service = google.people({ version: "v1", auth });
  const res = await service.people.get({
    resourceName: `people/${id}`,
    personFields: "names,emailAddresses,phoneNumbers",
  });

  const person = res.data;
  return person;
}

// create
export async function createConnection(data) {
  const { name, email = "", phoneNumber } = data;
  const auth = await authorize();
  const service = google.people({ version: "v1", auth });
  service.people.createContact(
    {
      requestBody: {
        phoneNumbers: [{ value: phoneNumber }],
        names: [{ givenName: name }],
        emailAddresses: [{ value: email }],
      },
    },
    (err, res) => {
      if (err) {
        throw err;
      } else {
        return "Success add contact";
      }
    }
  );
  return "Success add contact";
}

// update
export async function updateConnection(data) {
  const { id, etag, phoneNumber } = data;
  console.log(data);
  const auth = await authorize();
  const service = google.people({ version: "v1", auth });
  const res =  await service.people.updateContact({
    resourceName: `people/${id}`,
    personFields: "phoneNumbers",
    updatePersonFields: "phoneNumbers",
    resource: {
      etag: etag,
      phoneNumbers: [{ value: phoneNumber }],
    },
  });
  return "Success update contact";
}

export async function deleteContact ({id}) {
  const auth = await authorize();
  const service = google.people({ version: "v1", auth });
  const res = await service.people.deleteContact({
    resourceName: `people/${id}`,
  });
  return "Success delete contact";
};