export const httpResponse = {
  OK: new Response("OK", { status: 200 }),
  BadRequest: new Response("Bad Request", { status: 400 }),
  Forbidden: new Response("Forbidden", { status: 403 }),
  NotFound: new Response("Not Found", { status: 404 }),
};
