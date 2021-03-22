const express = require("express");
const fileGenSvc = require("./filegen");
const cors = require('cors');
const app = express();
const port = 3200;
global.__basedir = __dirname;

////
////Enabling CORS for front end to have access
////
app.use(cors());

////
//// Declaring the APIs
////

///this API is to generate the file with 2MB size which contain of 4 different random objects that separated with ","
///http://localhost:3200/generate-report
app.get("/generate-report", async (req, res) => {
  const rs = await fileGenSvc.generate();

  ///normalize the response
  res.send({ fileAddress: rs.fileAddress });
});

///this API is to get the full report of the execution
///http://localhost:3200/get-report
app.get("/get-report", async (req, res) => {
  res.send(await fileGenSvc.getReport());
});

///this API is to download the file
///http://localhost:3200/download-report/:filename
app.get("/download-report/:name", async (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir + "/uploads/";

  console.log(fileName);

  res.download(directoryPath + fileName, fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    }
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
