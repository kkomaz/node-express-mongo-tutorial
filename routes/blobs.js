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