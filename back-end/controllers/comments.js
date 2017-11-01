var db = require('../models');
var Post = db.Post;
var User = db.User;
var Comment = db.Comment;


function index(req, res) {
  Comment.find({},function(err, comments) {
    if (err) {
      console.log('inside error');
      res.send(err);
    }
    else {
      console.log('all comments ', comments);
      // let ps = posts.map(p=>{
      //   return formatPost(p)
      // })
      res.json(comments);
    }
  });
}

function show(req, res) {
  Post.findById(req.params.post_id, function(err, post){
    if (err) res.send(err);
    else res.json(post.comments);
  });
}

// REQUIRE AUTH //
function create(req, res) {
  // find the post from the post id
  // add the comment to that post
  Post.findById(req.params.post_id,function(err,post){
    if(err)res.send(err)
    let comment = new db.Comment(req.body)
    post.comments.push(comment);
    post.save(function(err,savedPost){
      if(err){
        console.log('create comment error: ', err);
        res.send(err);
      }
      res.json(comment);
    });
  });
};

// REQUIRE AUTH //
function update(req, res) {
  Post.findById(req.params.post_id, function(err, post){
    if (err) res.send(err);
    else {
      let index = post.comments.findIndex(c=>{
        return c._id = req.params.comment_id
      })
      console.log('post is', post);
      console.log('index is', index);
      let newComment = new db.Comment(req.body)
      post.comments[index] = newComment;

      post.save(function(err,newPost){
        if (err) res.send(err);
      });
      console.log('new post is', post);
      let comment = {
        index: index,
        content: newComment.content,
      }
      res.json(comment);
    }
  });
}

// REQUIRE AUTH //
function destroy(req, res) {
  console.log('inside comment controller');
  Post.findById(req.params.post_id, function(err, post){
    if (err) res.send(err);
    else {
      let index = post.comments.findIndex(c=>{
        return c._id == req.params.comment_id
      });
      console.log(index);

      // post.comments.findByIdAndRemove(req.params.comment_id, function(err, newPost){
      //   if (err) res.send(err);
      //   else{
      //     console.log(post.comments);
      //     res.json(post);
      //   }
      // })

      post.comments.splice(index,1);
      post.save();
      console.log(post.comments);
      res.json(post.comments);
    }
  });

}

function allowedUser(post_author){
  User.find({username: post_author},function(err,user){
    if (err) res.send(err);
    else {
      // check if user is same as the post they want modify.
      if(user._id !== req.session.passport.user){
        return false;
      }else
      return true;
    }
  });
};

function formatPost(post){
  return  {
    title: post.title,
    description: post.description,
    image_url: post.image_url,
    place: post.place,
    tags: post.tags,
    created_date: post.created_date,
    updated_date: post.updated_date,
    author: post.author,
    comments: post.comments,
  }
}

module.exports.index = index;
module.exports.show = show;
module.exports.create = create;
module.exports.update = update;
module.exports.destroy = destroy;
