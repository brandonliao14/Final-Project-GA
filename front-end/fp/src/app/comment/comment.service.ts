import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions  } from '@angular/http';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';


@Injectable()
export class CommentService {
  private baseUrl = "http://localhost:3000";
  private allPosts = "";

  constructor(
    private http: Http
  ) { }

  addComment(post_id,comment){
    return this.http.post(`${this.baseUrl}/api/posts/${post_id}/comment`,comment);
  }

  deleteSubComment(post_id,comment_id){
    return this.http.delete(`${this.baseUrl}/api/posts/${post_id}/comment/${comment_id}`,);
  }


}