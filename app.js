const express = require("express");
const fs = require("mz/fs");
const bodyParser = require("body-parser");
const decompress = require("decompress");
const path = require("path");
const xml2js = require("xml2js");
const parser = new xml2js.Parser();

const app = express();

// register view engine
app.set("view engine", "ejs");

// middleware & static files
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/search-by-attribute", (req, res) => {
  res.render("searchByAttribute");
});

app.post("/search", async (req, res) => {
  let serviceTags = req.body.serviceTags.replace(/\s/g, "").split(",");
   //get checked fields and convert to array
   let reqBody = req.body;
  let results = {};
  for await (let key of serviceTags) {
    try {
      let files = await decompress(key + ".zip", "dist");
      let dat = {};
      for await (let file of files) {
        if (
          file.type == "file" &&
          file.path.substr(file.path.length - 3) === "xml"
        ) {
          await fs.readFile("dist/" + file.path).then((data) => {
            parser.parseString(data, (error, result) => {
              if (error)
                console.log(error);
              else
                dat = Object.assign(result.root, dat);
            });
          });
        }
      }
      dat["service tag"] = key;
      results[key] = dat;
    } catch (error) {
      results[key] = 'not found';
    }
  }

  fs.rmdir("dist", { recursive: true }, (err) => {
    if (err) {
      throw err;
    }
    console.log("dist deleted!");
  });
  console.log('Results:');
  console.log(results);
  res.render("results", { results, reqBody });
});

app.post("/search/field", async (req, res) => {
  let dir  = fs.readdirSync("./").filter(file => {
    return file.substr(file.length-4) === ".zip";
  });
  const field = req.body.field;
  const val = req.body.val;
  let reqBody = req.body;
  let results = {};
  for await (let key of dir) {
    try {
      let files = await decompress(key, "dist");
      let dat = {};
      for await (let file of files) {
        if (
          file.type == "file" &&
          file.path.substr(file.path.length - 3) === "xml"
        ) {
          await fs.readFile("dist/" + file.path).then((data) => {
            parser.parseString(data, (error, result) => {
              if (error) console.log(error);
              else {
                dat = Object.assign(result.root, dat);
              }
            });
          });
        }
      }
      dat["tag"] = key;
      results[key] = dat;
    } catch (error) {
      results[key] = "not found";
    }
  }


  fs.rmdir("dist", { recursive: true }, (err) => {
    if (err) {
      throw err;
    }
    console.log("dist deleted!");
  });

  let results2 = {};
  for (let key in results){
    let obj = results[key];
    if(obj[field] == val){
      results2[key] = obj;
    }
  }

  res.render("results-alt", {results2, val, field, reqBody});
});

// 404 page
app.use((req, res) => {
  res.status(404).render("404");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Dell H2H\nPORT 3000");
});
