var express = require('express');
var path = require('path');

var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();

var mongo = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/mydatabase';

var cookieParser = require('cookie-parser');
var session = require('express-session');
var morgan = require('morgan');

var app = express();

// app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(morgan('dev'));
app.use(cookieParser());

app.use(bodyParser.json());
// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true })); 
//form-urlencoded
// for parsing multipart/form-data
app.use(upload.array());

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(session({
    key: 'user_sid',
    secret: 'somerandonstuffs',
    resave: false,
    saveUninitialized: false,
    cookie: 
    {
        expires: 600000
    }
}));

app.use((req, res, next) => {
    if (req.cookies.user_sid && !req.session.user) {
        res.clearCookie('user_sid');
    }
    next();
});

app.locals.personal_submit = false;
app.locals.experience_submit = false;
app.locals.education_submit = false;
app.locals.skills_submit = false;
app.locals.summary_submit = false;
app.locals.experience_count = 0;
app.locals.education_count = 0;

var sessionChecker = (req, res, next) => {
    if (req.session.user && req.cookies.user_sid)
    {
        res.redirect('index');
    } 
    else 
    {
        next();
    }    
};

//POST REQUESTS
app.post('/signup', function(req, res, next) 
{
    var user = 
    {
      fname : req.body.fname,
      lname : req.body.lname,
      userid : req.body.userid,
      password : req.body.password
    };  
    var flag=0;
    mongo.connect(url, {useNewUrlParser:true}, function(err, db) 
    {
      if (err) throw err;
      var dbo = db.db("user-data");
      var query = { userid: user.userid };
      dbo.collection("users").find(query).toArray(function(err, result) 
      {
        if (err) throw err;
        if(result.length>0)
        {
            res.render('signup',{message:"user already exists"});
        }
        else
        {
            dbo.collection("users").insertOne(user,{useNewUrlParser:true},function(err, res) 
            {
                if (err) throw err;
                console.log("Registered");
                db.close();
            });
            req.session.user = user;
            res.redirect('index');
        }    
        db.close();
      });
    });
});

app.post('/login', function(req, res, next) 
{
    var user = 
    {
      userid : req.body.userid,
      password : req.body.password
    };

    mongo.connect(url,{useNewUrlParser:true}, function(err, db)
    {
        if (err) throw err;
        var dbo = db.db("user-data");
        var query = { userid: user.userid };
        dbo.collection("users").find(query).toArray(function(err, result) 
        {
          if (err) throw err;
          if(result.length==0)
          {
              res.render('login',{message:"No such user"});
          }
          else
          {
              if(result[0].password == user.password)
              {
                req.session.user = result[0];
                res.redirect('index');
              }
              else
              {
                res.render('login',{message:"wrong password"});
              }
          }
          db.close();
        });
    });
});

app.post('/insert-personal-info', function(req, res, next) 
{
    var item = 
    {
      userid : req.body.userid,
      fname: req.body.fname,
      lname:req.body.lname,
      address:req.body.address,
      dob:req.body.dob,
      number : req.body.number,
      email: req.body.email
    };  

    mongo.connect(url, function(err, db) 
    {
      if (err) throw err;
      var dbo = db.db("user-data");
      dbo.collection("personal_info").insertOne(item,{useNewUrlParser:true},function(err, res) 
      {
          if (err) throw err;
          console.log("1 document inserted");
          db.close();
      });
    });
    app.locals.personal_submit = true;
    res.redirect('/experience');
});

app.post('/insert-experience', function(req, res, next) 
{
    app.locals.experience_count++;
    var item = 
    {
      userid : req.body.userid,
      employer : req.body.employer,
      job_title :req.body.job_title,
      city : req.body.city,
      state : req.body.state,
      start_date : req.body.start_date,
      end_date : req.body.end_date
    };  

    mongo.connect(url, function(err, db) 
    {
      if (err) throw err;
      var dbo = db.db("user-data");
      dbo.collection("experience").insertOne(item,{useNewUrlParser:true},function(err, res) 
      {
          if (err) throw err;
          console.log("1 document inserted");
          db.close();
      });
      var query = { userid: req.session.user.userid };
      dbo.collection("experience").find(query).toArray(function(err, result) 
      {
          if (err) throw err;
          var len = result.length;
          var arr = [];
          for(let i=1;i<=app.locals.experience_count;i++)
          {
              arr.push(result[len-i]);
          }
          console.log({experience:arr});
          res.render('experience', {user:req.session.user, experience : arr});
      });
    });
    app.locals.experience_submit = true;
});

app.post('/insert-education', function(req, res, next) 
{
    app.locals.education_count++;
    var item = 
    {
      userid : req.body.userid,
      college: req.body.college,
      city : req.body.city,
      state : req.body.state,
      degree : req.body.degree,
      grad_date : req.body.grad_date,
    };  

    mongo.connect(url, function(err, db) 
    {
      if (err) throw err;
      var dbo = db.db("user-data");
      dbo.collection("education").insertOne(item,{useNewUrlParser:true},function(err, res) 
      {
          if (err) throw err;
          console.log("1 document inserted");
          db.close();
      });
      var query = { userid: req.session.user.userid };
      dbo.collection("education").find(query).toArray(function(err, result) 
      {
          if (err) throw err;
          var len = result.length;
          var arr = [];
          for(let i=1;i<=app.locals.education_count;i++)
          {
              arr.push(result[len-i]);
          }
        //   console.log({experience:arr});
          res.render('education', {user:req.session.user, education : arr});
      });
    });
    app.locals.education_submit = true;
});

app.post('/insert-skills', function(req, res, next) 
{
    var item = 
    {
      userid : req.body.userid,
      skills : req.body.skills
    };  

    mongo.connect(url, function(err, db) 
    {
      if (err) throw err;
      var dbo = db.db("user-data");
      dbo.collection("skills").insertOne(item,{useNewUrlParser:true},function(err, res) 
      {
          if (err) throw err;
          console.log("1 document inserted");
          db.close();
      });
    });
    app.locals.skills_submit = true;
    res.redirect('/summary');
});

app.post('/insert-summary', function(req, res, next) 
{
    var item = 
    {
      userid : req.body.userid,
      summary : req.body.summary
    };  

    mongo.connect(url, function(err, db) 
    {
      if (err) throw err;
      var dbo = db.db("user-data");
      dbo.collection("summary").insertOne(item,{useNewUrlParser:true},function(err, res) 
      {
          if (err) throw err;
          console.log("1 document inserted");
          db.close();
      });
    });
    app.locals.summary_submit = true;
    res.redirect('/get-data');
});



//GET REQUESTS
app.get('/', sessionChecker, (req, res) => {
    res.render('login');
});

app.get('/logout', (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        res.clearCookie('user_sid');
        res.redirect('/');
    } 
    else 
    {
        res.redirect('login');
    }
});

app.get('/signup', (req, res) =>
{
    res.render('signup');
});

app.get('/login', (req, res) =>
{
    res.render('login');
});

app.get('/index', (req, res) =>
{    
    if (req.session.user && req.cookies.user_sid)
    {
        res.render('index',{user:req.session.user});
    } 
    else
        res.redirect('/');
});

app.get('/experience', (req, res) =>
{    
    if (req.session.user && req.cookies.user_sid)
    {
        mongo.connect(url, function(err, db) 
        {
            if (err) throw err;
            var dbo = db.db("user-data");
            var query = { userid: req.session.user.userid };
            dbo.collection("experience").find(query).toArray(function(err, result) 
            {
                if (err) throw err;
                var len = result.length;
                var arr = [];
                for(let i=1;i<=app.locals.experience_count;i++)
                {
                    arr.push(result[len-i]);
                }
                res.render('experience', {user:req.session.user, experience : arr});
            });
        });
    } 
    else
    {
        res.redirect('/');
    }    
});

app.get('/education', (req, res) =>
{    
    if (req.session.user && req.cookies.user_sid)
    {
        mongo.connect(url, function(err, db) 
        {
            if (err) throw err;
            var dbo = db.db("user-data");
            var query = { userid: req.session.user.userid };
            dbo.collection("education").find(query).toArray(function(err, result) 
            {
                if (err) throw err;
                var len = result.length;
                var arr = [];
                for(let i=1;i<=app.locals.education_count;i++)
                {
                    arr.push(result[len-i]);
                }
                // console.log({experience:arr});
                res.render('education', {user:req.session.user, education : arr});
            });
        });
    } 
    else
    {
        res.redirect('/');
    }    
});

app.get('/skills', (req, res) =>
{    
    if (req.session.user && req.cookies.user_sid)
    {
        res.render('skills',{user:req.session.user});
    } 
    else
        res.redirect('/');
});

app.get('/summary', (req, res) =>
{    
    if (req.session.user && req.cookies.user_sid)
    {
        res.render('summary',{user:req.session.user});
    } 
    else
        res.redirect('/');
});


//To display the contents in the resume
app.get('/get-data', function(req, res, next) 
{
    if (req.session.user && req.cookies.user_sid)
    {
        var personal = {};
        var experience = {};
        var education = {};
        var skills = {};
        var summary = {};
        mongo.connect(url, {useNewUrlParser:true}, function(err, db) 
        {
            if (err) throw err;
            var dbo = db.db("user-data");
            var query = { userid: req.session.user.userid };
            dbo.collection("personal_info").find(query).toArray(function(err, result) 
            {
                if (err) throw err;
                var len = result.length-1;
                personal = result[len];
            });
            dbo.collection("skills").find(query).toArray(function(err, result) 
            {
                if (err) throw err;
                var len = result.length-1;
                skills = result[len];
            });
            dbo.collection("summary").find(query).toArray(function(err, result) 
            {
                if (err) throw err;
                var len = result.length-1;
                summary = result[len];
            });
            dbo.collection("education").find(query).toArray(function(err, result) 
            {
                if (err) throw err;
                var len = result.length;
                var arr = [];
                for(let i=1;i<=app.locals.education_count;i++)
                {
                    arr.push(result[len-i]);
                }
                education = arr;
            });
            dbo.collection("experience").find(query).toArray(function(err, result) 
            {
                if (err) throw err;
                var len = result.length;
                var arr = [];
                for(let i=1;i<=app.locals.experience_count;i++)
                {
                    arr.push(result[len-i]);
                }
                experience = arr;
                //console.log({personal : personal, experience : experience, skills : skills, summary : summary});
                res.render('resume', {user : req.session.user, personal : personal, experience : experience, education : education, skills : skills, summary : summary});
            });
        });
    }
    else
    {
        res.redirect('login');
    }
});

app.listen(8080);
