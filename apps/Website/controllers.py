"""
This file defines actions, i.e. functions the URLs are mapped into
The @action(path) decorator exposed the function at URL:

    http://127.0.0.1:8000/{app_name}/{path}

If app_name == '_default' then simply

    http://127.0.0.1:8000/{path}

If path == 'index' it can be omitted:

    http://127.0.0.1:8000/

The path follows the bottlepy syntax.

@action.uses('generic.html')  indicates that the action uses the generic.html template
@action.uses(session)         indicates that the action uses the session
@action.uses(db)              indicates that the action uses the db
@action.uses(T)               indicates that the action uses the i18n & pluralization
@action.uses(auth.user)       indicates that the action requires a logged in user
@action.uses(auth)            indicates that the action requires the auth object

session, db, T, auth, and tempates are examples of Fixtures.
Warning: Fixtures MUST be declared with @action.uses({fixtures}) else your app will result in undefined behavior
"""

import uuid
import datetime

from py4web import action, request, abort, redirect, URL, Field
from py4web.utils.form import Form, FormStyleBulma
from py4web.utils.url_signer import URLSigner

from yatl.helpers import A
from . common import db, session, T, cache, auth, signed_url


url_signer = URLSigner(session)

# The auth.user below forces login.
@action('index')
@action.uses('index.html', url_signer, auth.user)
def index():
    return dict(
        # This is an example of a signed URL for the callback.
        # See the index.html template for how this is passed to the javascript.
        posts_url = URL('posts', signer=url_signer),
        delete_url = URL('delete_post', signer=url_signer),
        user_email = auth.current_user.get('email'),
    )

@action('posts', method="GET")
@action.uses(db, auth.user, session, url_signer.verify())
def get_posts():
    # You can use this shortcut for testing at the very beginning.
    # TODO: complete.
   # posts = db(db.post.is_reply == None).select(orderby=~db.post.post_date).as_list()
    
    posts = db(db.post.email == auth.current_user.get('email')).select(orderby=~db.post.star | ~db.post.post_date).as_list()
    print(posts)
    titles = db(db.post.title).select().as_list()
    star = db(db.post.star).select().as_list()
    return dict(posts=posts, titles=titles, star=star)
    
    
@action('posts',  method="POST")
@action.uses(db, auth.user)  # etc.  Put here what you need.
def save_post():
    id = request.json.get('id') # Note: id can be none.
    content = request.json.get('content')
    title = request.json.get('title')
    color = request.json.get('color')
    star = request.json.get('star')

    # If id is None, this means that this is a new post that needs to be
    # inserted.  If id is not None, then this is an update.
    if id is None:
        id = db.post.insert(
            content=content,
            title=title,
            color=color,
            star=star,
        )
    if id is not None:
        check = db(db.post.email == auth.current_user.get('email')).select()
        for c in check:
            #print(c)
            if c.id == id:
                c.post_date = datetime.datetime.utcnow()
                c.content = content
                c.title = title
                c.color = color
                c.star = star
                c.update_record()
    return dict(content=content, id=id, title=title, star=star)

@action('delete_post',  method="POST")
@action.uses(db, auth.user, session, url_signer.verify())
def delete_post():
    db((db.post.email == auth.current_user.get("email")) &
       (db.post.id == request.json.get('id'))).delete()
    return "ok"

"""
@action('delete_all_posts')
@action.uses(db)
def delete_all_posts():
    db(db.post).delete()
    return "ok"
"""
