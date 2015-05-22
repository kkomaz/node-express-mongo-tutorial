var express = require('express');
    router = express.Router();
    mongoose = require('mongoose');
    bodyParser = require('body-parser'); //parses information from POST
    methodOverride = require('method-override'); //used to manipulate POST

router.use(bodyParser.urlencoded({ extended: true })); //the object value can be of any type

router.use(methodOverride(function(req,rest){
  if (req.body && typeof req.body === 'object' && '_method' in req.body){
    var method = req.body._method;
    delete req.body._method;
    return method;
  }
}));

router.route('/')    
  .get(function(req,res,next){
    mongoose.model('Blob').find({}, function(err, blobs){
      if (err){
        return console.error(err);
      } else {
        res.format({
          html: function(){
            res.render('blobs/index', {
              title: 'All my Blobs',
              "blobs": blobs
            });
          },
          json: function(){
            res.json(infophotos);
          }
        });
      }
    });
  })

  //POST a new blob

  .post(function(req, res){
    var name = req.body.name;
    var badge = req.body.badge;
    var dob = req.body.dob;
    var company = req.body.company;
    var isloved = req.body.isloved;
    //call the create function for our database

    mongoose.model('Blob').create({
      name: name,
      badge: badge,
      dob: dob,
      isloved: isloved
    }, function(err,blob){
      if (err){
        res.send("There was a problem adding the information to the database");
      } else{
        //Blob has been created
        console.log('POST creating a new blob: ' + blob);
        res.format({
          //HTML response will set the location and redirect back to the home page.
          html: function(){
            res.location("blobs");
            res.redirect("/blobs");
          },
          json: function(){
            res.json(blob);
          }
        });
      }
    });
  });

  router.get('/new', function(req, res){
    res.render('blobs/new', {
      title: 'Add New Blob'
    });
  });

  router.param('id', function(req, res, next, id){
    //find the ID in the Database
    mongoose.model('Blob').findById(id, function(err,blob){
      if (err) {
        console.log(id + ' was not found');
        res.status = 404;
        err = new Error('Not Found');
        err.status = 404;
        res.format({
          html: function(){
            next(err);
          },
          json: function(){
            res.json({message : err.status + ' ' + err});
          }
        });
      } else {
        req.id = id;
        next();
      }
    });
  });

  router.route('/:id')
    .get(function(req,res,next){
      mongoose.model('Blob').findById(req.id, function(err,blob){
        if (err){
          console.log("GET Error: There was a problem retrieving: " + err);
        } else {
          console.log("GET Retrieving ID: " + blob._id);
          var blobdob = blob.dob.toISOString();
          blobdob = blobdob.substring(0, blobdob.indexOf('T')); //filtering
          res.format({
            html: function(){
              res.render('blobs/show', {
                "blobdob": blobdob,
                "blob": blob
              });
            },
            json: function(){
              res.json(blob);
            }
          });
        }
      });
    });
  
  router.route('/:id/edit')
  //GET the individual blob by Mongo ID
  .get(function(req,res){
    mongoose.model('Blob').findById(req.id, function(err,blob){
      if (err) {
        console.log("GET Error: There was a problem retrieving " + err);
      } else {
        console.log("GET Retrieving ID: " + blob._id); //object id
        var blobdob = blob.dob.toISOString();
        blobdob = blobdob.substring(0, blobdob.indexOf('T'));
        res.format({
          html: function(){
            res.render('blobs/edit', {
              title:  'Blob' + blob._id,
              "blobdob": blobdob,
              "blob": blob
            });
          },
          json: function(){
            res.json(blob);
          }
        });
      }
    });
  })

  .put(function(req,res){
    var name = req.body.name;
    var badge = req.body.badge;
    var dob = req.body.dob;
    var company = req.body.company;
    var isloved = req.body.isloved;

    //find document by ID
    mongoose.model('Blob').findById(req.id, function(err,blob){
      blob.update({
        name: name,
        badge: badge,
        dob: dob,
        isloved: isloved
      }, function(err, blobID){
        if (err){
          res.send("There was a problem updating the information to the database: " + err);
        } else {
          res.format({
            html: function(){
              res.redirect("/blobs/" + blob._id);
            },
            json: function(){
              res.json(blob);
            }
          });
        }
      });
    });
  })

  .delete(function(req,res){
    //find blob by Id
    mongoose.model('Blob').findById(req.id, function(err,blob){
      if (err){
        return console.error(err);
      } else {
        //remove from MongoDB
        blob.remove(function(err,blob){
          if (err){
            return console.error(err);
          } else {
            console.log('DELETE removing ID: ' + blob._id);
            res.format({
              html: function(){
                res.redirect("/blobs");
              },
              json: function(){
                res.json({
                  message: 'deleted',
                  item: blob
                });
              }
            });
          }
        });
      }
    });
  });

  module.exports = router;




















