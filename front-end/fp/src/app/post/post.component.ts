import { Component, OnInit,ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { UserService } from '../user/user.service';
import { PostService } from '../post/post.service';
import { CommentService } from '../comment/comment.service';

// import { NguiMapModule} from '@ngui/map';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})

export class PostComponent implements OnInit {
  private loggedInUser;
  posts = [];
  private post;
  private title = "";
  private tempTitle = "";
  private tempDescription = "";
  private tempComment = "";
  private tempSubComment = "";
  private description ="";
  private image_url;
  private mapInstance;
  private tempLat = 37.76;
  private tempLng = -122.418;
  private lastInfoWindow;
  private helperInfoWindow;
  private inputPlace;
  private lastMarker;
  private editable;
  private editing = false;
  private displayComments;
  private displaySubComment;

  private currPostLength;

  clearTempStates(){
    this.tempTitle = "";
    this.tempDescription = "";
    this.tempComment = "";
    this.tempSubComment = "";
    this.displayComments = "";
    this.displaySubComment = "";
    this.editable = "";
    this.editing = false;
    this.displayComments="";
    this.displaySubComment="";
  }

  constructor(
    private userService: UserService,
    private postService: PostService,
    private commentService: CommentService,
  ) { }

  ngOnChanges(){
    console.log('testing');
  }

  ngAfterContentInit(){
    console.log('after content init');
    let elements = document.getElementsByClassName('markerInfoWindow');
    console.log('after init elements are ,',elements);
  }

  ngAfterContentChecked(){
    // console.log('after content checked');
    if(this.mapInstance && this.mapInstance.markers){
      if(this.currPostLength < this.mapInstance.markers.length){
        let elements = document.getElementsByClassName('markerInfoWindow');
        console.log('divs are,',elements);
        this.currPostLength =  this.mapInstance.markers.length
        console.log('markers are', this.mapInstance.markers);
        console.log('divs')


        /* BEFORE all of this, i need to write generate a hidden profile template
        that has div for img src, angular on click on img src,
        */
        // after new divs and markers have added to the DOM
        // for each posts check if that new markers's lat lng is in one of the posts' lat lng
        // if so, we know that marker is on map and need to hide and render a new marker

        let posts = this.posts;
        let hasOverlay = false;

        var groupInfoWindowContent:any = document.getElementById('groupInfoWindowContent');
        for(var i = 0; i < posts.length-1; i++){
          if(posts[i].place.geometry.location.lat == posts[posts.length-1].place.geometry.location.lat &&
            posts[i].place.geometry.location.lng == posts[posts.length-1].place.geometry.location.lng){
              // match, hide all the overlay markers, push their info window divs to one, so they will display
              // as one
              // this.mapInstance.markers[i].setVisible(false);
              let infowindow = document.getElementById(posts[i]._id);
              groupInfoWindowContent.append(infowindow);

              hasOverlay = true;


            }

          }

          if(hasOverlay){
            var newlyAddedMarker = this.mapInstance.markers[this.mapInstance.markers.length-1];
            google.maps.event.clearListeners(newlyAddedMarker,'click');
            // newlyAddedMarker.addListener()
            var newlyAddedInfoContent = document.getElementById(posts[posts.length-1]._id)
            groupInfoWindowContent.append(newlyAddedInfoContent);
            // this.mapInstance.markers[posts.length-1].setMap(null);
            // prob dont need new marker, just take the existing last newMarker
            var groupInfoWindow = new google.maps.InfoWindow();
            groupInfoWindow.setContent(groupInfoWindowContent);
            // groupInfoWindow.open(this.mapInstance,groupInfoWindow);
            newlyAddedMarker.addListener('click',()=>{
              groupInfoWindow.open(this.mapInstance, newlyAddedMarker);
            })
            
          }

          // if match
          // find that marker, set it non visible
          // create a dynamic marker with the latlng from one of them
          // create a sub array that contains all of the overlay markers
          /* make new infowindow-content by combining
          the first element's markerInfoWindow AND
          the custom div that list all of the user profile image(for now username)
          just like one of my drawing.
          // 1) first let template = document.getElementsByClassName('profileTemplate')[0]
          // 2) change the template's div id to be the
          ===== OR =====
          just make a new div and concanate all their infowindow Divs to one
          for(var i = 0; i < subarray.length;i++){
          // or select array's infow window by their post id.
          windows = subarry[i].infowindow + windows
        }

        `<div>
        ${windows}
        </div>`
        =========
        */
        // Then set the new infowndow with the combined divs


      }
    }

  }

  ngAfterViewInit(){
    console.log('after view init');
  }
  // ngAfterViewChecked(){
  //   console.log('after viewchecked?');
  // }

  ngOnInit() {
    this.postService.getAllPosts()
    .subscribe(res=>{
      this.posts = res.json();
      console.log(this.posts);
      this.currPostLength = this.posts.length;
    })

    let e = document.getElementById('59f8eef0723a2208a13ae440');
    console.log('e is ', e);

    this.userService.getSessionUser()
    .subscribe(data=>{
      console.log('logged in is ', data.json().username);
      this.loggedInUser = data.json();
    },err=>{
      this.loggedInUser = {
        _id: "59f55ea0fdd13e0a6cf66077",
        username: "asd",
        password: "123",
      }
    })
  }

  onMapReady(map) {
    console.log('posts', map.posts);  // to get all posts as an array
    this.mapInstance = map;
    this.addCloseInfoWindowOnMapClickEvent();
    var input = <HTMLInputElement>(document.getElementById('geoSearch'));
    var autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', map);

    var infowindow = new google.maps.InfoWindow();
    this.helperInfoWindow = infowindow;
    var infowindowContent = document.getElementById('infowindow-content');
    infowindow.setContent(infowindowContent);

    // For directing location after inputted a location.
    let helperMarker = this.createNewMarker(null);

    autocomplete.addListener('place_changed', ()=> {
      infowindow.close();
      helperMarker.setVisible(false);
      var place = autocomplete.getPlace();
      var infowindowContent = document.getElementById('infowindow-content');
      this.inputPlace = place;
      if (!place.geometry) {
        window.alert("No details available for input: '" + place.name + "'"); return;
      }
      // If the place has a geometry, then present it on a map.
      if (place.geometry.viewport) {
        map.fitBounds(place.geometry.viewport);
      } else {
        map.setCenter(place.geometry.location);
        map.setZoom(20);  // Why 17? Because it looks good.
      }
      helperMarker.setPosition(place.geometry.location);

      var address = '';
      if (place.address_components) {
        address = this.formatAddress(place.address_components);
      }
      // if(infowindowContent.children){
      //   infowindowContent.children['place-icon'].src = place.icon;
      //   infowindowContent.children['place-name'].textContent = place.name;
      //   infowindowContent.children['place-address'].textContent = address;
      //   infowindow.open(map, helperMarker);
      // }
    });
  }

  onMarkerInit(marker,post) {
    var markerInfoWinElement: any = document.getElementById(`${post._id}`);
    if(post.image_url){
      marker.setIcon({
        url: post.image_url,
        scaledSize: new google.maps.Size(40, 40),
      });
    }
    if(markerInfoWinElement){
      var markerInfoWindow = new google.maps.InfoWindow();
      markerInfoWindow.setContent(markerInfoWinElement);
    }else{
      let infoWindowDivs = document.getElementsByClassName(`markerInfoWindow`);
      markerInfoWinElement = infoWindowDivs[infoWindowDivs.length-1];
      markerInfoWinElement.id= post._id;
      var markerInfoWindow = new google.maps.InfoWindow();
      markerInfoWindow.setContent(markerInfoWinElement);
    }
    marker.addListener('click', ()=> {
      this.clearTempStates();
      if(this.lastMarker === undefined || this.lastMarker === marker){
        marker.setAnimation(google.maps.Animation.BOUNCE);
        this.lastMarker = marker;
      }else if(this.lastMarker !== marker){
        this.lastMarker.setAnimation(null);
        marker.setAnimation(google.maps.Animation.BOUNCE);
        this.lastMarker = marker;
      }

      if(this.lastInfoWindow === undefined){
        this.lastInfoWindow = markerInfoWindow;
        if(markerInfoWinElement){
          markerInfoWinElement.style.display ="block";
        }
        markerInfoWindow.open(this.mapInstance, marker);
      }else if(this.lastInfoWindow !== markerInfoWindow){
        this.lastInfoWindow.close();
        this.lastInfoWindow = markerInfoWindow;
        if(markerInfoWinElement){
          markerInfoWinElement.style.display ="block";
        }
        markerInfoWindow.open(this.mapInstance, marker);
      }else {
        this.lastInfoWindow = markerInfoWindow;
        if(markerInfoWinElement){
          markerInfoWinElement.style.display ="block";
        }
        markerInfoWindow.open(this.mapInstance, marker);
      }
    });
  }

  createPost(){
    let place = this.inputPlace;
    if(!place){
      window.alert('Its an unrecognized place, please choose from autocomplete');
      return; }
      if(!place.geometry.viewport){
        window.alert('This place is not located on the map');
        return; }
        if(!this.title){
          window.alert('Please enter a title');
          return; }
          let post = {
            place: place,
            title: this.title,
            description: this.description,
            image_url: this.image_url,
            author: this.loggedInUser.username,
            // user_id suppose to be filled in from backend
            // using unique author name or from token/session
            user_id: this.loggedInUser._id,
          }
          console.log('post lat is', place.geometry.location.lat());
          console.log('post lng is', place.geometry.location.lng());
          // console.log(this.mapInstance.markers);


          this.postService.createPost(post)
          .subscribe((post)=>{
            let newPost = post.json()
            console.log('post came back is',newPost);
            // this.editable = newPost._id;
            this.posts.push(newPost);
            // console.log('new posts are', this.posts);
            // this.editable = "";
          });
          if(this.helperInfoWindow) this.helperInfoWindow.close();
          if(this.lastMarker) this.lastMarker.setAnimation(null);
          this.clearInputFields();
          console.log('added marker', this.posts);
        }

        updatePost(post,title,description){
          var inputPost: any = {
            title: title,
            description: description,
          }
          this.postService.updatePost(post._id,inputPost)
          .subscribe((oldPost)=>{
            let index = this.posts.findIndex(function(p){
              return p._id ==post._id;
            });
            this.posts[index].title = inputPost.title;
            this.posts[index].description = inputPost.description;
            this.toggleEditable(this.posts[index])
          });
        }

        deletePost(post_id){
          this.postService.deletePost(post_id)
          .subscribe((post)=>{
            let index = this.posts.findIndex(function(p){
              return p._id == post.json()._id;
            });
            this.posts.splice(index,1);
            this.lastMarker.setVisible(false);
            this.lastInfoWindow.close();
          });
        }

        //////////////////////////////////////
        ///////// POST HELPER STUFF //////////
        //////////////////////////////////////

        clearInputFields(){
          var input = <HTMLInputElement>(document.getElementById('geoSearch'));
          input.value = "";
          this.title = "";
          this.description = "";
          this.image_url = "";
          var infowindowContent = document.getElementById('infowindow-content');
          infowindowContent.children['place-icon'].src = "";
          infowindowContent.children['place-name'].textContent = "";
          infowindowContent.children['place-address'].textContent = "";
        }

        addCloseInfoWindowOnMapClickEvent(){
          this.mapInstance.addListener('click',()=>{
            if(this.lastInfoWindow){
              this.lastInfoWindow.close();
            }
            if(this.helperInfoWindow) this.helperInfoWindow.close();
            if(this.lastMarker) this.lastMarker.setAnimation(null);
          })
          this.clearTempStates();
        }

        createNewMarker(position){
          let marker = new google.maps.Marker({
            map: this.mapInstance,
            anchorPoint: new google.maps.Point(0, -29),
            draggable: false,
            animation: google.maps.Animation.DROP,
            position: position,
            icon: "../../assets/group.png",
          });
          return marker
        }

        formatAddress(address_components){
          return [
            (address_components[0] && address_components[0].short_name || ''),
            (address_components[1] && address_components[1].short_name || ''),
            (address_components[2] && address_components[2].short_name || '')
          ].join(' ');
        }

        toggleEditable(post){
          if(this.editable){
            this.editable = "";
            this.tempTitle = "";
            this.tempDescription = "";
          }
          else {
            this.editable = post._id;
            this.tempTitle = post.title;
            this.tempDescription = post.description;
          }
        }

        ///////////////////////////////////
        ///////// COMMENTS STUFF //////////
        ///////////////////////////////////

        toggleComments(post){
          if(this.displayComments){
            this.displayComments = "";
            this.displaySubComment = "";
            this.tempComment = "";
            this.editing = false;
          }
          else {
            this.displayComments = post._id;
          }
        }

        toggleSubComment(comment){
          if(this.displaySubComment){
            this.displaySubComment = "";
            this.tempSubComment = "";
            this.editing = false;
          }
          else {
            this.displaySubComment = comment._id;
            this.tempSubComment = comment.content;
            this.editing = true;
          }
        }

        addComment(post,comment){
          console.log(comment);
          let com = {
            user_id : this.loggedInUser._id,
            content : comment,
          }
          this.commentService.addComment(post._id,com)
          .subscribe(newComment=>{
            console.log('new comment came back is', newComment.json());
            let toBeUpdatePost = this.posts.find(p=>{
              return p._id === post._id
            });
            console.log('toBeUpdatePost', toBeUpdatePost);
            toBeUpdatePost.comments.push(newComment.json());
            console.log('new post is', toBeUpdatePost);
            console.log('all posts are', this.posts);
          })
          this.tempComment = "";
        }

        deleteSubComment(post,comment){
          console.log('post is', post);
          console.log('comment is ',comment);
          console.log('posts are before request', this.posts);
          this.commentService.deleteSubComment(post._id,comment._id)
          .subscribe(updatedComments=>{
            console.log('posts are', this.posts);
            let postIndex = this.posts.findIndex(p=>{
              return p._id == post._id
            });
            console.log('index is',postIndex);

            // let commentIndex =this.posts[postIndex].findIndex(c=>{
            //   return c._id = comment._id;
            // });

            this.posts[postIndex].comments = updatedComments.json();
            console.log(this.posts);
          });

        }

        updateSubComment(post,comment){

        }



      }
