import { Hono } from "hono";
import { cors } from "hono/cors";

const API = new Hono<{}>();
API.use('/*', cors({
    origin: (process.env.NODE_ENV !== "production") ? "*" : "*3mworkshop.org"
}));

export default API;
