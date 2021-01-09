const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const multer = require("multer");
const path = require("path");
const ejs = require("ejs");
const fs = require("fs");
// const fileUpload = require("express-fileupload");
const _ = require("lodash");
var cors = require("cors");

const app = express();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  //reject a file
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});

app.use(cors()); // Use this after the variable declaration

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(
  "mongodb+srv://admin-blake:Test123@restfulwiki.7qkww.mongodb.net/wikiDB",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

// app.use(express.static("public"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// app.use(express.static(path.join(__dirname, "build")));

// app.get("/*", (req, res) => {
//   res.sendFile(path.join(__dirname, "build", "index.html"));
// });

const articleSchema = mongoose.Schema({
  title: String,
  content: String,
  image: { type: String, required: true },
});

const Article = mongoose.model("Article", articleSchema);

/*********************************Targeting ALL Articles***************************************/

/*FETCH ALL THE ARTICLES */
app
  .route("/articles")
  .get((req, res, next) => {
    Article.find({}, (err, foundArticles) => {
      if (!err) {
        res.send(foundArticles);
      } else {
        res.send(err);
      }
    });
  })
  /*FETCH ALL THE ARTICLES */

  ///////////////////////////////-->

  /*CREATE ONE NEW ARTICLE */
  .post(upload.single("image"), (req, res, next) => {
    console.log(req.file);
    // const { name, data } = req.files.images;
    const newArticle = new Article({
      title: req.body.title,
      content: req.body.content,
      image: req.file.path,
    });
    newArticle.save((err) => {
      if (err) {
        res.send(err);
      } else {
        res.send("Successfully added a new article.");
      }
    });
    console.log(newArticle);
  })
  /*CREATE ONE NEW ARTICLE */

  ///////////////////////////////-->

  /*DELETE ALL NEW ARTICLES */
  .delete((req, res, next) => {
    Article.deleteMany({}, (err) => {
      if (!err) {
        res.send("Successfully deleted all articles.");
      } else {
        res.send(err);
      }
    });
  });
/*DELETE ALL NEW ARTICLES */

/*********************************Targeting A SPECIFIED Article***************************************/

/*FETCH ONE SPECIFIC ARTICLE */
app
  .route("/articles/:articleTitle")
  .get((req, res, next) => {
    const articleTitle = req.params.articleTitle;
    Article.findOne({ title: articleTitle }, (err, foundArticle) => {
      if (!err) {
        if (foundArticle) {
          res.send(foundArticle);
        } else {
          res.send("No articles matching that title were found. =/");
        }
      }
    });
  })
  /*FETCH ONE SPECIFIC ARTICLE */

  ///////////////////////////////-->

  /*UPDATE (PUT REQUEST) ONE SPECIFIC ARTICLE */
  .put((req, res, next) => {
    Article.updateOne(
      { title: req.params.articleTitle },
      { $set: { title: req.body.title, content: req.body.content } },
      { overwrite: true },
      (err) => {
        if (!err) {
          res.send("Successfully updated article. PUT");
        }
      }
    );
  })
  /*UPDATE (PUT REQUEST) ONE SPECIFIC ARTICLE */

  ///////////////////////////////-->

  /*UPDATE (PATCH REQUEST) ONE SPECIFIC ARTICLE */

  .patch((req, res, next) => {
    Article.updateOne(
      { title: req.params.articleTitle },
      { $set: req.body },
      (err) => {
        if (!err) {
          res.send("Successfully updated article. PATCH");
        } else {
          res.send(err);
        }
      }
    );
  })

  /*UPDATE (PATCH REQUEST) ONE SPECIFIC ARTICLE */

  ///////////////////////////////-->

  /*DELETE ONE SPECIFIC ARTICLE */
  .delete((req, res, next) => {
    Article.deleteOne({ title: req.body }, (err) => {
      if (!err) {
        res.send("Successfully deleted article.");
      } else {
        res.send(err);
      }
    });
  });

/*DELETE ONE SPECIFIC ARTICLE */
let port = process.env.PORT;
if (port == null || port == "") {
  port = 5000;
}

app.listen(port, () => {
  console.log("Server is Up on Port 5000!");
});
