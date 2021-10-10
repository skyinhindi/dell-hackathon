const express = require('express');

const app = express();

// register view engine
app.set('view engine', 'ejs');

// middleware & static files
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/search', (req, res) => {
  let serviceTags = req.body.serviceTags.split(',');
  let results = {};
  console.log(serviceTags);
  //requires fetching data from file system and passing to the next page
  res.render('results', {results, serviceTags});
});

// 404 page
app.use((req, res) => {
    res.status(404).render('404');
  });


app.listen(process.env.PORT || 3000);