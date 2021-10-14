
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const fs = require("fs");
const decompress = require("decompress");
const path = require("path");
const xml2js = require("xml2js");
const parser = new xml2js.Parser()

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

let resKeys = [];


app.route("/")
.get((req, res) => {
    res.render("home");
})
.post((req, res) => {
    let keys = req.body.searchList.split(",");
    console.log(keys);
    resKeys = [...keys];
    res.redirect("/results");
});

app.route("/results")
.get(async (req, res) => {
    await resKeys.forEach(async (key) => {
      try {
        let files = await decompress(key+".zip", "dist");
        console.log(key+".zip");
          // console.log(files);
          let dat = {};
          for await (let file of files){
            
          };
          console.log("dat: ",dat);
          // console.log("f: ",files);
        } catch (error) {
          console.log(key + ".zip not found\n" + error);
        }
    });
    

  fs.rmdir("dist", { recursive: true }, (err) => {
    if (err) {
        throw err;
    }
    console.log("deleted!");
  });

  res.send("done");
});


//<---------------------------------------------------------------------------------------------------->

//Start Server
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log("Dell\nPORT:", port);
});
