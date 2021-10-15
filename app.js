const express = require('express');
const fs = require("fs");
const bodyParser = require("body-parser");
const decompress = require("decompress");
const path = require("path");
const xml2js = require("xml2js");
const parser = new xml2js.Parser()

const app = express();

// register view engine
app.set('view engine', 'ejs');

// middleware & static files
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({extended: true,}));


app.get('/', (req, res) => {
    res.render('index');
});

app.post('/search', async (req, res) => {
  let serviceTags = req.body.serviceTags.split(',');
  let fields = req.body.fields.split(',');
  let results = {};
  console.log(serviceTags);
  for await (let key of serviceTags) {
    try {
      let files = await decompress(key + ".zip", "dist");
      let dat = {};
      for await (let file of files) {
        if (file.type == "file" && file.path.substr(file.path.length-3) === "xml") {
          let data = await fs.readFileSync("dist/" + file.path);
          data = await parser.parseString(data, (error, result) => {
            if (error) console.log(error);
            else {
              console.log(result.root);
              dat = Object.assign(result.root, dat);
            }
          });
        }
      }
      dat['tag'] = key;
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

  console.log(results);
  res.render('results', {results, serviceTags, fields});
});

// 404 page
app.use((req, res) => {
    res.status(404).render('404');
});


app.listen(process.env.PORT || 3000);