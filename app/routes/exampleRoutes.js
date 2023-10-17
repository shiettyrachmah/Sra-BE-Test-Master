const exampleMiddleware = require("../middleware/exampleMiddleware");
const exampleController = require("../controllers/exampleController");

module.exports = (app) => {
  app.use((req, res, next) => {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  const router = require("express").Router();

  //set role user
  const verifyUser = (req, res, next) => {
    req.user = { role: 'user' }; 
    next();
  };
  
  //endpoint : http://localhost:5000/api/data/refactorMe1
  app.get('/refactorMe1', 
    verifyUser, 
    exampleMiddleware.exampleMiddlewareFunction(['admin', 'user']), 
    exampleController.refactoreMe1
  );

  describe('Unit Test for /refactorMe1 Endpoint', () => {
    it('should return a 200 status code when user has valid role', async () => {
      const response = await request(app).get('/refactorMe1');
      expect(response.status).toBe(200);
    });

    it('should return a 403 status code when user has invalid role', async () => {
      const response = await request(app).get('/refactorMe1');
      expect(response.status).toBe(403);
    });
  });

  //endpoint : http://localhost:5000/api/data/websocket/
  //endpoint websocket running in port 3000: http://localhost:3000
  router.get(
    "/websocket/",    
    verifyUser, 
    exampleMiddleware.exampleMiddlewareFunction(['admin', 'user']),
    exampleController.callmeWebSocket
  );
  
  //endpoint : http://localhost:5000/api/data/storeDataWithoutRedis
  router.get(
    "/storeDataWithoutRedis", 
    verifyUser, 
    exampleMiddleware.exampleMiddlewareFunction(['admin', 'user']),
    exampleController.storeDataWithoutRedis
  );

  //endpoint : http://localhost:5000/api/data/storeData
  router.get(
    "/storeData", 
    verifyUser, 
    exampleMiddleware.exampleMiddlewareFunction(['admin', 'user']),
    exampleController.storeData
   );

  //endpoint : http://localhost:5000/api/data/getData
  router.get(
    "/getData",
    verifyUser, 
    exampleMiddleware.exampleMiddlewareFunction(['admin', 'user']),
    exampleController.getData
  );


  app.use("/api/data", router);
};
