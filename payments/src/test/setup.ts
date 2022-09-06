import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import { app } from "../app";
import jwt from "jsonwebtoken";
/*
declare global {
  namespace NodeJS {
    export interface Global {
      signin(): Promise<string[]>;
    }
  }
}
*/
declare global {
  var signin: () => string[];
}

jest.mock("../natsWrapper");

let mongo: any;
beforeAll(async () => {
  process.env.JWT_KEY = "dfsdohfjsdofh";
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  if (mongo) {
    await mongo.stop();
  }
  await mongoose.connection.close();
});

global.signin = () => {
  // build a JWT payload: {id, email}
  const payload = {
    id: new mongoose.Types.ObjectId().toHexString(),
    email: "test@test.com",
  };
  // create the JWT
  const token = jwt.sign(payload, process.env.JWT_KEY!);
  // build the session object: {jwt: MY_JWT}
  const session = { jwt: token };
  // turn that session into JSON
  const sessionJSON = JSON.stringify(session);
  // take JSON and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString("base64");
  // return a string thats the cookie with encoded data
  return [`session=${base64}`];
};
