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

app.post('/search', (req, res) => {
  let serviceTags = req.body.serviceTags.split(',');
  let results = {};
  console.log(serviceTags);
  serviceTags.forEach(tag => {
    decompress(tag + '.zip', 'dist').then(files => {
      //console.log(files);
      files.forEach(file => {
        fs.readFile("dist/" + file.path, (err, data) => {
          console.log('reading file:' + file.path);
          if(err) 
            console.log(err);
          else{
            console.log('parsing file data...');
            parser.parseString(data, (err, result) => {
              if(err) 
                console.log(err)
              else{
                //dat = Object.assign(result.root, dat);
                console.log(result);
                fs.rmdir("dist", {recursive: true,}, (err) => {
                  if(err){
                    console.log(err);
                  }
                  else{
                    console.log("Dist Deleted!");
                  }
                });
              }
            });
          }
        });
      });
    });
  });
  res.render('results', {results, serviceTags});
});

// 404 page
app.use((req, res) => {
    res.status(404).render('404');
});


app.listen(process.env.PORT || 3000);