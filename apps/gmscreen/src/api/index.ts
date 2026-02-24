import { Hono } from "hono";

const API = new Hono<{}>();

API.get("/hello", async (ctx) => {
    return ctx.json({
        message: "Hello, world!",
        method: "GET",
    });
});

API.put("/hello", async (ctx) => {
    return ctx.json({
        message: "Hello, world!",
        method: "PUT",
    });
});

API.get("/hello/:name", async (ctx) => {
    return ctx.json({
        message: "Hello, " + ctx.req.param("name")  + "!",
        method: "GET",
    });
})

export default API;
